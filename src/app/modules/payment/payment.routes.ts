import { UserRole } from "@prisma/client";
import express from "express";
import auth from "../../middlewares/auth";
import { PaymentController } from "./payment.controller";

const router = express.Router();

// TODO: Implement subscription payment routes
router.post(
  "/subscribe",
  auth(UserRole.USER),
  PaymentController.initSubscriptionPayment
);

export const PaymentRoutes = router;
