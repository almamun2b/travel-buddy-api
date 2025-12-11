import { TravelPlanStatus } from "@prisma/client";
import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import pick from "../../../shared/pick";
import sendResponse from "../../../shared/sendResponse";
import { IAuthUser } from "../../interfaces/common";
import { travelPlanFilterableFields } from "./travelPlans.contstant";
import { TravelPlanService } from "./travelPlans.service";

const createTravelPlan = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const result = await TravelPlanService.createTravelPlan(
      req.user as IAuthUser,
      req.body
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Travel plan created successfully!",
      data: result,
    });
  }
);

const getAllTravelPlans = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, travelPlanFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await TravelPlanService.getAllTravelPlans(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Travel plans retrieved successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const getTravelPlanById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await TravelPlanService.getTravelPlanById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Travel plan retrieved successfully!",
    data: result,
  });
});

const getMyTravelPlans = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const result = await TravelPlanService.getMyTravelPlans(
      req.user as IAuthUser,
      options
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "My travel plans retrieved successfully!",
      meta: result.meta,
      data: result.data,
    });
  }
);

const updateTravelPlan = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const { id } = req.params;
    const result = await TravelPlanService.updateTravelPlan(
      req.user as IAuthUser,
      id,
      req.body
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Travel plan updated successfully!",
      data: result,
    });
  }
);

const deleteTravelPlan = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const { id } = req.params;
    const result = await TravelPlanService.deleteTravelPlan(
      req.user as IAuthUser,
      id
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Travel plan deleted successfully!",
      data: result,
    });
  }
);

const updateTravelPlanStatus = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const { id } = req.params;
    const { status } = req.body as { status: TravelPlanStatus };

    const result = await TravelPlanService.updateTravelPlanStatus(
      req.user as IAuthUser,
      id,
      status
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Travel plan status updated successfully!",
      data: result,
    });
  }
);

const matchTravelPlans = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const result = await TravelPlanService.matchTravelPlans(
      req.user as IAuthUser,
      options
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Matched travel plans retrieved successfully!",
      meta: result.meta,
      data: result.data,
    });
  }
);

const sendTravelRequest = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const { travelPlanId, message } = req.body;

    const result = await TravelPlanService.sendTravelRequest(
      req.user as IAuthUser,
      travelPlanId,
      message
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Travel request sent successfully!",
      data: result,
    });
  }
);

const getMyTravelRequests = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const result = await TravelPlanService.getMyTravelRequests(
      req.user as IAuthUser
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "My travel requests retrieved successfully!",
      data: result,
    });
  }
);

const getPendingRequestsForMyPlans = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const result = await TravelPlanService.getPendingRequestsForMyPlans(
      req.user as IAuthUser
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Pending requests retrieved successfully!",
      data: result,
    });
  }
);

const respondToTravelRequest = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const { requestId } = req.params;
    const { status } = req.body;

    const result = await TravelPlanService.respondToTravelRequest(
      req.user as IAuthUser,
      requestId,
      status
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: `Travel request ${status.toLowerCase()} successfully!`,
      data: result,
    });
  }
);

// Admin: Get all travel plans
const adminGetAllTravelPlans = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, [
      "searchTerm",
      "destination",
      "travelType",
      "status",
      "isDeleted",
    ]);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

    const result = await TravelPlanService.adminGetAllTravelPlans(
      filters,
      options
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Travel plans retrieved successfully!",
      meta: result.meta,
      data: result.data,
    });
  }
);

export const TravelPlanController = {
  createTravelPlan,
  getAllTravelPlans,
  getTravelPlanById,
  getMyTravelPlans,
  updateTravelPlan,
  deleteTravelPlan,
  updateTravelPlanStatus,
  matchTravelPlans,
  sendTravelRequest,
  getMyTravelRequests,
  getPendingRequestsForMyPlans,
  respondToTravelRequest,
  adminGetAllTravelPlans,
};
