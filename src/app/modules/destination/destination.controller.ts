import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import pick from "../../../shared/pick";
import sendResponse from "../../../shared/sendResponse";
import { destinationFilterableFields } from "./destination.constant";
import { destinationService } from "./destination.service";

// Admin Operations
const createDestination = catchAsync(async (req: Request, res: Response) => {
  const result = await destinationService.createDestination(req);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Destination created successfully!",
    data: result,
  });
});

const getAllDestinations = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, destinationFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await destinationService.getAllDestinations(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Destinations retrieved successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const getDestinationById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await destinationService.getDestinationById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Destination retrieved successfully!",
    data: result,
  });
});

const updateDestination = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await destinationService.updateDestination(id, req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Destination updated successfully!",
    data: result,
  });
});

const patchDestination = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await destinationService.patchDestination(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Destination patched successfully!",
    data: result,
  });
});

const deleteDestination = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await destinationService.deleteDestination(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Destination deleted successfully!",
    data: result,
  });
});

// Public Operations
const getPublicDestinations = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, destinationFilterableFields);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

    const result = await destinationService.getPublicDestinations(
      filters,
      options
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Public destinations retrieved successfully!",
      meta: result.meta,
      data: result.data,
    });
  }
);

const getPopularDestinations = catchAsync(
  async (req: Request, res: Response) => {
    const options = pick(req.query, ["limit", "page"]);

    const result = await destinationService.getPopularDestinations(options);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Popular destinations retrieved successfully!",
      meta: result.meta,
      data: result.data,
    });
  }
);

const getRecommendedDestinations = catchAsync(
  async (req: Request, res: Response) => {
    const options = pick(req.query, ["limit", "page"]);

    const result = await destinationService.getRecommendedDestinations(options);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Recommended destinations retrieved successfully!",
      meta: result.meta,
      data: result.data,
    });
  }
);

const getPublicDestinationById = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await destinationService.getPublicDestinationById(id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Public destination retrieved successfully!",
      data: result,
    });
  }
);

const getTrendingDestinations = catchAsync(
  async (req: Request, res: Response) => {
    const options = pick(req.query, ["limit", "page"]);

    const result = await destinationService.getTrendingDestinations(options);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Trending destinations retrieved successfully!",
      meta: result.meta,
      data: result.data,
    });
  }
);

const searchDestinations = catchAsync(async (req: Request, res: Response) => {
  const { query } = req.query;
  const options = pick(req.query, ["limit", "page"]);

  const result = await destinationService.searchDestinations(
    query as string,
    options
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Destinations searched successfully!",
    meta: result.meta,
    data: result.data,
  });
});

export const destinationController = {
  // Admin operations
  createDestination,
  getAllDestinations,
  getDestinationById,
  updateDestination,
  patchDestination,
  deleteDestination,

  // Public operations
  getPublicDestinations,
  getPopularDestinations,
  getRecommendedDestinations,
  getPublicDestinationById,
  getTrendingDestinations,
  searchDestinations,
};
