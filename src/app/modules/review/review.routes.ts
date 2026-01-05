import { UserRole } from "@prisma/client";
import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { ReviewController } from "./review.controller";
import { ReviewValidation } from "./review.validation";

const router = express.Router();

// Authenticated Routes
router.post(
  "/",
  auth(UserRole.USER, UserRole.ADMIN),
  validateRequest(ReviewValidation.createReview),
  ReviewController.createReview
);

// done
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
router.get(
  "/to-review-plans",
  auth(UserRole.USER, UserRole.ADMIN),
  ReviewController.getToReviewPlans
);

// Public Routes //done
router.get("/user/:userId", ReviewController.getReviewsForUser);

router.patch(
  "/:id",
  auth(UserRole.USER, UserRole.ADMIN),
  validateRequest(ReviewValidation.updateReview),
  ReviewController.updateReview
);

router.delete(
  "/:id",
  auth(UserRole.USER, UserRole.ADMIN),
  ReviewController.deleteReview
);

export const reviewRoutes = router;
