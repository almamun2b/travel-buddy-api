import { Request, Response } from "express";
import httpStatus from "http-status";
import { env } from "../../../config/env";
import { stripe } from "../../../helpers/stripe";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { IAuthUser } from "../../interfaces/common";
import { PaymentService } from "./payment.service";

// TODO: Implement subscription payment endpoints
const initSubscriptionPayment = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const userId = req.user?.id as string;
    const { plan } = req.body;

    const result = await PaymentService.initSubscriptionPayment(userId, plan);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Subscription payment initiated",
      data: result,
    });
  }
);

const handleStripeWebhookEvent = catchAsync(
  async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string;
    const webhookSecret = env.stripeWebhookSecret;

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

export const PaymentController = {
  initSubscriptionPayment,
  handleStripeWebhookEvent,
};
