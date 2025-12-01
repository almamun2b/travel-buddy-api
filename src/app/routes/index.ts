import express from "express";
import { apiLimiter } from "../middlewares/rateLimiter";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { PaymentRoutes } from "../modules/payment/payment.routes";
import { userRoutes } from "../modules/user/user.routes";

const router = express.Router();

router.use(apiLimiter); // Apply to all routes

const moduleRoutes = [
  {
    path: "/user",
    route: userRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/payment",
    route: PaymentRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
