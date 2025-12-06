import { UserRole } from "@prisma/client";
import express from "express";
import auth from "../../middlewares/auth";
import { PaymentController } from "./payment.controller";

const router = express.Router();

// Public Routes
router.get("/plans", PaymentController.getSubscriptionPlans);

// Authenticated Routes
router.post(
  "/create-checkout-session",
  auth(UserRole.USER, UserRole.ADMIN),
  PaymentController.createCheckoutSession
);

router.get(
  "/subscription/status",
  auth(UserRole.USER, UserRole.ADMIN),
  PaymentController.getSubscriptionStatus
);

router.post(
  "/subscription/cancel",
  auth(UserRole.USER, UserRole.ADMIN),
  PaymentController.cancelSubscription
);

router.post(
  "/subscription/confirm",
  auth(UserRole.USER, UserRole.ADMIN),
  PaymentController.confirmSubscription
);

export const PaymentRoutes = router;
