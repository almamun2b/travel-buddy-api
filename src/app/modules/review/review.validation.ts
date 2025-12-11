import { z } from "zod";

const createReview = z.object({
  travelPlanId: z.string({ error: "Travel plan ID is required" }),
  revieweeId: z.string({ error: "Reviewee ID is required" }),
  rating: z
    .number({ error: "Rating is required" })
    .int()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must not exceed 5"),
  comment: z
    .string({ error: "Comment is required" })
    .min(10, "Comment must be at least 10 characters")
    .max(1000, "Comment must not exceed 1000 characters"),
});

const updateReview = z.object({
  rating: z
    .number()
    .int()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must not exceed 5")
    .optional(),
  comment: z
    .string()
    .min(10, "Comment must be at least 10 characters")
    .max(1000, "Comment must not exceed 1000 characters")
    .optional(),
});

export const ReviewValidation = {
  createReview,
  updateReview,
};
