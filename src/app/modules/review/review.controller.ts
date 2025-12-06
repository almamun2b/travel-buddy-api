import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import pick from "../../../shared/pick";
import sendResponse from "../../../shared/sendResponse";
import { IAuthUser } from "../../interfaces/common";
import { ReviewService } from "./review.service";

const createReview = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const result = await ReviewService.createReview(
      req.user as IAuthUser,
      req.body
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Review created successfully!",
      data: result,
    });
  }
);

const getReviewsForUser = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await ReviewService.getReviewsForUser(userId, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Reviews retrieved successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const getMyReviews = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

    const result = await ReviewService.getMyReviews(
      req.user as IAuthUser,
      options
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "My reviews retrieved successfully!",
      meta: result.meta,
      data: result.data,
    });
  }
);

export const ReviewController = {
  createReview,
  getReviewsForUser,
  getMyReviews,
};

