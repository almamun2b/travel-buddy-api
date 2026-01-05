import httpStatus from "http-status";
import { paginationHelper } from "../../../helpers/paginationHelper";
import prisma from "../../../shared/prisma";
import ApiError from "../../errors/ApiError";
import { IAuthUser } from "../../interfaces/common";
import { IPaginationOptions } from "../../interfaces/pagination";

interface ICreateReviewPayload {
  travelPlanId: string;
  revieweeId: string;
  rating: number;
  comment: string;
}

const createReview = async (user: IAuthUser, payload: ICreateReviewPayload) => {
  if (!user?.id) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User not authenticated!");
  }

  const travelPlan = await prisma.travelPlan.findFirst({
    where: { id: payload.travelPlanId, isDeleted: false },
  });

  if (!travelPlan) {
    throw new ApiError(httpStatus.NOT_FOUND, "Travel plan not found!");
  }

  if (travelPlan.status !== "COMPLETED") {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You can only review completed travel plans!"
    );
  }

  const wasParticipant =
    travelPlan.creatorId === user.id ||
    (await prisma.travelRequest.findFirst({
      where: {
        travelPlanId: payload.travelPlanId,
        userId: user.id,
        status: "APPROVED",
      },
    }));

  if (!wasParticipant) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You can only review travel plans you participated in!"
    );
  }

  const revieweeWasParticipant =
    travelPlan.creatorId === payload.revieweeId ||
    (await prisma.travelRequest.findFirst({
      where: {
        travelPlanId: payload.travelPlanId,
        userId: payload.revieweeId,
        status: "APPROVED",
      },
    }));

  if (!revieweeWasParticipant) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You can only review participants of the travel plan!"
    );
  }

  if (user.id === payload.revieweeId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "You cannot review yourself!");
  }

  const existingReview = await prisma.review.findUnique({
    where: {
      travelPlanId_reviewerId_revieweeId: {
        travelPlanId: payload.travelPlanId,
        reviewerId: user.id,
        revieweeId: payload.revieweeId,
      },
    },
  });

  if (existingReview) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "You have already reviewed this user for this trip!"
    );
  }

  const result = await prisma.review.create({
    data: {
      travelPlanId: payload.travelPlanId,
      reviewerId: user.id,
      revieweeId: payload.revieweeId,
      rating: payload.rating,
      comment: payload.comment,
    },
    include: {
      travelPlan: { select: { id: true, title: true, destination: true } },
      reviewer: { select: { id: true, fullName: true, avatar: true } },
      reviewee: { select: { id: true, fullName: true, avatar: true } },
    },
  });

  return result;
};

const getReviewsForUser = async (
  userId: string,
  options: IPaginationOptions
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);

  const result = await prisma.review.findMany({
    where: { revieweeId: userId },
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      travelPlan: { select: { id: true, title: true, destination: true } },
      reviewer: { select: { id: true, fullName: true, avatar: true } },
    },
  });

  const total = await prisma.review.count({ where: { revieweeId: userId } });

  const avgRating = await prisma.review.aggregate({
    where: { revieweeId: userId },
    _avg: { rating: true },
  });

  return {
    meta: { page, limit, total, averageRating: avgRating._avg.rating || 0 },
    data: result,
  };
};

const getMyReviews = async (user: IAuthUser, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);

  const result = await prisma.review.findMany({
    where: { revieweeId: user?.id },
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      travelPlan: { select: { id: true, title: true, destination: true } },
      reviewer: { select: { id: true, fullName: true, avatar: true } },
    },
  });

  const total = await prisma.review.count({ where: { revieweeId: user?.id } });

  return { meta: { page, limit, total }, data: result };
};

const getReviewsGivenByMe = async (
  user: IAuthUser,
  options: IPaginationOptions
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);

  const result = await prisma.review.findMany({
    where: { reviewerId: user?.id },
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      travelPlan: { select: { id: true, title: true, destination: true } },
      reviewee: { select: { id: true, fullName: true, avatar: true } },
    },
  });

  const total = await prisma.review.count({ where: { reviewerId: user?.id } });

  return { meta: { page, limit, total }, data: result };
};

const updateReview = async (
  user: IAuthUser,
  reviewId: string,
  payload: { rating?: number; comment?: string }
) => {
  if (!user?.id) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User not authenticated!");
  }

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, "Review not found!");
  }

  if (review.reviewerId !== user.id) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You can only edit your own reviews!"
    );
  }

  const result = await prisma.review.update({
    where: { id: reviewId },
    data: payload,
    include: {
      travelPlan: { select: { id: true, title: true, destination: true } },
      reviewer: { select: { id: true, fullName: true, avatar: true } },
      reviewee: { select: { id: true, fullName: true, avatar: true } },
    },
  });

  return result;
};

const getToReviewPlans = async (user: IAuthUser) => {
  if (!user?.id) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User not authenticated!");
  }

  // Find all completed travel plans where the user participated (but not as creator)
  const participatedPlans = await prisma.travelPlan.findMany({
    where: {
      status: "COMPLETED",
      isDeleted: false,
      creatorId: { not: user.id }, // Exclude user's own plans
      travelRequests: {
        some: {
          userId: user.id,
          status: "APPROVED",
        },
      },
    },
    include: {
      creator: {
        select: { id: true, fullName: true, avatar: true },
      },
      travelRequests: {
        where: { status: "APPROVED" },
        include: {
          user: {
            select: { id: true, fullName: true, avatar: true },
          },
        },
      },
      reviews: {
        where: { reviewerId: user.id },
        select: { revieweeId: true },
      },
    },
  });

  // Filter plans where user can still give reviews
  const plansToReview = participatedPlans
    .map((plan) => {
      // Get all participants (creator + approved requesters)
      const allParticipants = [
        {
          id: plan.creator.id,
          fullName: plan.creator.fullName,
          avatar: plan.creator.avatar,
        },
        ...plan.travelRequests.map((req) => ({
          id: req.user.id,
          fullName: req.user.fullName,
          avatar: req.user.avatar,
        })),
      ];

      // Get users already reviewed by current user
      const reviewedUserIds = plan.reviews.map((review) => review.revieweeId);

      // Find participants that user can still review (not themselves and not already reviewed)
      const availableToReview = allParticipants.filter(
        (participant) =>
          participant.id !== user.id &&
          !reviewedUserIds.includes(participant.id)
      );

      // Only return plan if there are participants to review
      if (availableToReview.length === 0) {
        return null;
      }

      return {
        travelPlanId: plan.id,
        creatorId: plan.creator.id,
        title: plan.title,
        description: plan.description,
        destination: plan.destination,
        startDate: plan.startDate,
        endDate: plan.endDate,
        budget: plan.budget,
        travelType: plan.travelType,
        maxMembers: plan.maxMembers,
        activities: plan.activities,
        images: plan.images,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
      };
    })
    .filter(Boolean); // Remove null entries

  return plansToReview;
};

const deleteReview = async (user: IAuthUser, reviewId: string) => {
  if (!user?.id) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User not authenticated!");
  }

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, "Review not found!");
  }

  // User can delete their own review, Admin can delete any review
  if (review.reviewerId !== user.id && user.role !== "ADMIN") {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You can only delete your own reviews!"
    );
  }

  await prisma.review.delete({
    where: { id: reviewId },
  });

  return { message: "Review deleted successfully!" };
};

export const ReviewService = {
  createReview,
  getReviewsForUser,
  getMyReviews,
  getReviewsGivenByMe,
  updateReview,
  deleteReview,
  getToReviewPlans,
};
