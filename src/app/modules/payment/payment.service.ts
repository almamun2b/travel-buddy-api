import { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";
import httpStatus from "http-status";
import Stripe from "stripe";
import { env } from "../../../config/env";
import { stripe } from "../../../helpers/stripe";
import prisma from "../../../shared/prisma";
import ApiError from "../../errors/ApiError";
import { IAuthUser } from "../../interfaces/common";

// Free plan limits
const FREE_PLAN_LIMITS = {
  maxTravelPlans: 3,
};

// Subscription plan prices (in cents)
const PLAN_PRICES: Record<SubscriptionPlan, number> = {
  FREE: 0, // Free
  MONTHLY: 999, // $9.99/month
  YEARLY: 7999, // $79.99/year (save ~33%)
};

const PLAN_FEATURES: Record<SubscriptionPlan, string[]> = {
  FREE: [
    "Create up to 3 travel plans",
    "Join unlimited travel plans",
    "Basic matching",
    "Community access",
  ],
  MONTHLY: [
    "Unlimited travel plans",
    "Priority matching",
    "Verified badge",
    "Advanced filters",
    "Cancel anytime",
  ],
  YEARLY: [
    "All Monthly features",
    "Save 33% compared to monthly",
    "Featured listings",
    "Priority support",
    "Analytics dashboard",
  ],
};

const createCheckoutSession = async (
  user: IAuthUser,
  plan: SubscriptionPlan
) => {
  const userData = await prisma.user.findUnique({
    where: { id: user?.id },
    include: { subscription: true },
  });

  if (!userData) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }

  // Check if user already has an active PAID subscription
  if (
    userData.subscription?.status === SubscriptionStatus.ACTIVE &&
    (userData.subscription.plan === SubscriptionPlan.MONTHLY ||
      userData.subscription.plan === SubscriptionPlan.YEARLY)
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You already have an active paid subscription!"
    );
  }

  // Create or get Stripe customer (from existing subscription or user metadata)
  let customerId = userData.subscription?.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: userData.email,
      name: userData.fullName,
      metadata: { userId: userData.id },
    });
    customerId = customer.id;
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Travel Buddy ${plan} Plan`,
            description: PLAN_FEATURES[plan].join(", "),
          },
          unit_amount: PLAN_PRICES[plan],
          recurring: { interval: "month" },
        },
        quantity: 1,
      },
    ],
    mode: "subscription",
    // Append session_id to success URL - Stripe replaces {CHECKOUT_SESSION_ID} with actual ID
    success_url: `${env.stripe.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: env.stripe.cancelUrl,
    metadata: {
      userId: userData.id,
      plan,
    },
  });

  return { url: session.url, sessionId: session.id };
};

const getSubscriptionStatus = async (user: IAuthUser) => {
  const subscription = await prisma.subscription.findUnique({
    where: { userId: user?.id },
  });

  // If no subscription or not active, treat as FREE plan (implicit)
  if (!subscription || subscription.status !== SubscriptionStatus.ACTIVE) {
    return {
      hasSubscription: false,
      plan: SubscriptionPlan.FREE,
      status: null,
      features: PLAN_FEATURES.FREE,
      limits: FREE_PLAN_LIMITS,
    };
  }

  // Premium plan (MONTHLY/YEARLY) - active subscription exists
  return {
    hasSubscription: true,
    plan: subscription.plan,
    status: subscription.status,
    startDate: subscription.startDate,
    endDate: subscription.endDate,
    features: PLAN_FEATURES[subscription.plan],
  };
};

const cancelSubscription = async (user: IAuthUser) => {
  const subscription = await prisma.subscription.findUnique({
    where: { userId: user?.id },
  });

  if (!subscription || !subscription.stripeSubId) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "No active paid subscription found!"
    );
  }

  // Cancel on Stripe
  await stripe.subscriptions.cancel(subscription.stripeSubId);

  // Delete subscription record (user goes back to implicit FREE)
  await prisma.subscription.delete({
    where: { id: subscription.id },
  });

  // Remove verified badge
  await prisma.user.update({
    where: { id: user?.id },
    data: { hasVerifiedBadge: false },
  });

  return { message: "Subscription cancelled. You are now on the FREE plan." };
};

const handleStripeWebhookEvent = async (event: Stripe.Event) => {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan as SubscriptionPlan;

      if (userId && plan) {
        const stripeSubscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        // Calculate end date (1 month from now)
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);

        await prisma.subscription.upsert({
          where: { userId },
          create: {
            userId,
            plan,
            status: SubscriptionStatus.ACTIVE,
            endDate,
            stripeCustomerId: session.customer as string,
            stripeSubId: stripeSubscription.id,
          },
          update: {
            plan,
            status: SubscriptionStatus.ACTIVE,
            endDate,
            stripeSubId: stripeSubscription.id,
          },
        });

        // Grant verified badge for all paid subscribers
        await prisma.user.update({
          where: { id: userId },
          data: { hasVerifiedBadge: true },
        });
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const status =
        subscription.status === "active"
          ? SubscriptionStatus.ACTIVE
          : SubscriptionStatus.EXPIRED;

      await prisma.subscription.updateMany({
        where: { stripeSubId: subscription.id },
        data: { status },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;

      const dbSubscription = await prisma.subscription.findFirst({
        where: { stripeSubId: subscription.id },
      });

      if (dbSubscription) {
        // Delete subscription record (user goes back to implicit FREE)
        await prisma.subscription.delete({
          where: { id: dbSubscription.id },
        });

        // Remove verified badge
        await prisma.user.update({
          where: { id: dbSubscription.userId },
          data: { hasVerifiedBadge: false },
        });
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice & {
        subscription?: string | null;
      };
      const subscriptionId = invoice.subscription;

      if (subscriptionId) {
        await prisma.subscription.updateMany({
          where: { stripeSubId: subscriptionId },
          data: { status: SubscriptionStatus.EXPIRED },
        });
      }
      break;
    }

    default:
      console.log(`ℹ️ Unhandled event type: ${event.type}`);
  }
};

// Helper to check if user has premium (paid) subscription
const hasPremiumSubscription = async (userId: string): Promise<boolean> => {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  return (
    subscription?.status === SubscriptionStatus.ACTIVE &&
    (subscription.plan === SubscriptionPlan.MONTHLY ||
      subscription.plan === SubscriptionPlan.YEARLY)
  );
};

// Confirm subscription after successful checkout (use session_id from Stripe redirect)
const confirmSubscription = async (user: IAuthUser, sessionId: string) => {
  if (!user?.id) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User not authenticated!");
  }

  // Retrieve the checkout session from Stripe
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Payment not completed!");
  }

  // Verify the session belongs to this user
  if (session.metadata?.userId !== user.id) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "This session does not belong to you!"
    );
  }

  const plan = session.metadata?.plan as SubscriptionPlan;

  if (!plan || plan === SubscriptionPlan.FREE) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid subscription plan!");
  }

  // Retrieve the Stripe subscription
  const stripeSubscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  );

  // Calculate end date based on plan
  const endDate = new Date();
  if (plan === SubscriptionPlan.YEARLY) {
    endDate.setFullYear(endDate.getFullYear() + 1);
  } else {
    endDate.setMonth(endDate.getMonth() + 1);
  }

  // Upsert subscription in database
  const subscription = await prisma.subscription.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      plan,
      status: SubscriptionStatus.ACTIVE,
      startDate: new Date(),
      endDate,
      stripeCustomerId: session.customer as string,
      stripeSubId: stripeSubscription.id,
    },
    update: {
      plan,
      status: SubscriptionStatus.ACTIVE,
      startDate: new Date(),
      endDate,
      stripeCustomerId: session.customer as string,
      stripeSubId: stripeSubscription.id,
    },
  });

  // Grant verified badge
  await prisma.user.update({
    where: { id: user.id },
    data: { hasVerifiedBadge: true },
  });

  return {
    message: "Subscription activated successfully!",
    subscription: {
      plan: subscription.plan,
      status: subscription.status,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
    },
  };
};

export const PaymentService = {
  createCheckoutSession,
  getSubscriptionStatus,
  cancelSubscription,
  handleStripeWebhookEvent,
  confirmSubscription,
  hasPremiumSubscription,
  PLAN_PRICES,
  PLAN_FEATURES,
  FREE_PLAN_LIMITS,
};
