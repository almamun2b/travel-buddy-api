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

const getReviewsGivenByMe = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

    const result = await ReviewService.getReviewsGivenByMe(
      req.user as IAuthUser,
      options
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Reviews given by me retrieved successfully!",
      meta: result.meta,
      data: result.data,
    });
  }
);

const updateReview = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const { id } = req.params;
    const result = await ReviewService.updateReview(
      req.user as IAuthUser,
      id,
      req.body
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Review updated successfully!",
      data: result,
    });
  }
);

const deleteReview = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const { id } = req.params;
    const result = await ReviewService.deleteReview(req.user as IAuthUser, id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: result.message,
      data: null,
    });
  }
);

export const ReviewController = {
  createReview,
  getReviewsForUser,
  getMyReviews,
  getReviewsGivenByMe,
  updateReview,
  deleteReview,
};
