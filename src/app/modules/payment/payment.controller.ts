import { SubscriptionPlan } from "@prisma/client";
import { Request, Response } from "express";
import httpStatus from "http-status";
import { env } from "../../../config/env";
import { stripe } from "../../../helpers/stripe";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { IAuthUser } from "../../interfaces/common";
import { PaymentService } from "./payment.service";

const createCheckoutSession = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const { plan } = req.body;

    const result = await PaymentService.createCheckoutSession(
      req.user as IAuthUser,
      plan as SubscriptionPlan
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Checkout session created successfully!",
      data: result,
    });
  }
);

const getSubscriptionStatus = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const result = await PaymentService.getSubscriptionStatus(
      req.user as IAuthUser
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Subscription status retrieved successfully!",
      data: result,
    });
  }
);

const cancelSubscription = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const result = await PaymentService.cancelSubscription(
      req.user as IAuthUser
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: result.message,
      data: null,
    });
  }
);

const getSubscriptionPlans = catchAsync(async (req: Request, res: Response) => {
  const plans = Object.entries(PaymentService.PLAN_PRICES).map(
    ([plan, price]) => ({
      plan,
      price: price / 100, // Convert cents to dollars
      features: PaymentService.PLAN_FEATURES[plan as SubscriptionPlan],
    })
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Subscription plans retrieved successfully!",
    data: plans,
  });
});

const handleStripeWebhookEvent = catchAsync(
  async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string;
    const webhookSecret = env.stripe.webhookSecret;

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error("⚠️ Webhook signature verification failed:", err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    await PaymentService.handleStripeWebhookEvent(event);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Webhook processed successfully",
      data: null,
    });
  }
);

// Confirm subscription after successful Stripe checkout
const confirmSubscription = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const { sessionId } = req.body;

    const result = await PaymentService.confirmSubscription(
      req.user as IAuthUser,
      sessionId
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: result.message,
      data: result.subscription,
    });
  }
);

export const PaymentController = {
  createCheckoutSession,
  getSubscriptionStatus,
  cancelSubscription,
  getSubscriptionPlans,
  handleStripeWebhookEvent,
  confirmSubscription,
};
