import { UserRole } from "@prisma/client";
import express, { NextFunction, Request, Response } from "express";
import auth from "../../middlewares/auth";
import { ReviewController } from "./review.controller";
import { ReviewValidation } from "./review.validation";

const router = express.Router();

// ==================== Authenticated Routes ====================

// Create a review
router.post(
  "/",
  auth(UserRole.USER, UserRole.ADMIN),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = ReviewValidation.createReview.parse(req.body);
    return ReviewController.createReview(req, res, next);
  }
);

// Get my reviews (reviews I've received)
router.get(
  "/my",
  auth(UserRole.USER, UserRole.ADMIN),
  ReviewController.getMyReviews
);

// ==================== Public Routes ====================

// Get reviews for a specific user
router.get("/:userId", ReviewController.getReviewsForUser);

export const reviewRoutes = router;
