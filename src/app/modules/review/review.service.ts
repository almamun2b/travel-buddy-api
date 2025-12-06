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

export const ReviewService = {
  createReview,
  getReviewsForUser,
  getMyReviews,
};
