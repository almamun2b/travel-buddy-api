import { UserRole } from "@prisma/client";
import express, { NextFunction, Request, Response } from "express";
import auth from "../../middlewares/auth";
import { ReviewController } from "./review.controller";
import { ReviewValidation } from "./review.validation";

const router = express.Router();

// Authenticated Routes
router.post(
  "/",
  auth(UserRole.USER, UserRole.ADMIN),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = ReviewValidation.createReview.parse(req.body);
    return ReviewController.createReview(req, res, next);
  }
);

router.get(
  "/my",
  auth(UserRole.USER, UserRole.ADMIN),
  ReviewController.getMyReviews
);

router.get(
  "/given",
  auth(UserRole.USER, UserRole.ADMIN),
  ReviewController.getReviewsGivenByMe
);

// Public Routes
router.get("/user/:userId", ReviewController.getReviewsForUser);

router.patch(
  "/:id",
  auth(UserRole.USER, UserRole.ADMIN),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = ReviewValidation.updateReview.parse(req.body);
    return ReviewController.updateReview(req, res, next);
  }
);

router.delete(
  "/:id",
  auth(UserRole.USER, UserRole.ADMIN),
  ReviewController.deleteReview
);

export const reviewRoutes = router;
