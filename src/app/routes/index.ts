import express from "express";
import { apiLimiter } from "../middlewares/rateLimiter";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { PaymentRoutes } from "../modules/payment/payment.routes";
import { reviewRoutes } from "../modules/review/review.routes";
import { travelPlanRoutes } from "../modules/travelPlans/travelPlans.routes";
import { userRoutes } from "../modules/user/user.routes";

const router = express.Router();

router.use(apiLimiter);

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
  {
    path: "/travel-plans",
    route: travelPlanRoutes,
  },
  {
    path: "/reviews",
    route: reviewRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
