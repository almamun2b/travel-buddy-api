import { UserRole } from "@prisma/client";
import express from "express";
import auth from "../../middlewares/auth";
import { PaymentController } from "./payment.controller";

const router = express.Router();

// ==================== Public Routes ====================

// Get available subscription plans
router.get("/plans", PaymentController.getSubscriptionPlans);

// ==================== Authenticated Routes ====================

// Create checkout session for subscription
router.post(
  "/create-checkout-session",
  auth(UserRole.USER, UserRole.ADMIN),
  PaymentController.createCheckoutSession
);

// Get current subscription status
router.get(
  "/subscription/status",
  auth(UserRole.USER, UserRole.ADMIN),
  PaymentController.getSubscriptionStatus
);

// Cancel subscription
router.post(
  "/subscription/cancel",
  auth(UserRole.USER, UserRole.ADMIN),
  PaymentController.cancelSubscription
);

// Confirm subscription after successful checkout (call this from success page)
router.post(
  "/subscription/confirm",
  auth(UserRole.USER, UserRole.ADMIN),
  PaymentController.confirmSubscription
);

// ==================== Webhook (No Auth) ====================

// Stripe webhook - handled in app.ts with raw body parser

export const PaymentRoutes = router;
