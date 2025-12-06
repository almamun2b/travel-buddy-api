import { Prisma, TravelPlan, TravelPlanStatus } from "@prisma/client";
import httpStatus from "http-status";
import { paginationHelper } from "../../../helpers/paginationHelper";
import prisma from "../../../shared/prisma";
import ApiError from "../../errors/ApiError";
import { IAuthUser } from "../../interfaces/common";
import { IPaginationOptions } from "../../interfaces/pagination";
import { PaymentService } from "../payment/payment.service";
import { travelPlanSearchableFields } from "./travelPlans.contstant";

const travelPlanSelectFields = {
  id: true,
  title: true,
  description: true,
  destination: true,
  startDate: true,
  endDate: true,
  budget: true,
  travelType: true,
  maxMembers: true,
  activities: true,
  images: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  creator: {
    select: {
      id: true,
      fullName: true,
      avatar: true,
      isVerified: true,
      hasVerifiedBadge: true,
    },
  },
};

interface ICreateTravelPlanPayload {
  title: string;
  description: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  budget?: number;
  travelType: string;
  maxMembers?: number;
  activities?: string[];
  images?: string[];
}

const createTravelPlan = async (
  user: IAuthUser,
  payload: ICreateTravelPlanPayload
): Promise<TravelPlan> => {
  if (!user?.id) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User not authenticated!");
  }

  const isAdmin = user.role === "ADMIN";

  if (!isAdmin) {
    const hasPremium = await PaymentService.hasPremiumSubscription(user.id);

    if (!hasPremium) {
      const existingPlansCount = await prisma.travelPlan.count({
        where: { creatorId: user.id, isDeleted: false },
      });

      if (
        existingPlansCount >= PaymentService.FREE_PLAN_LIMITS.maxTravelPlans
      ) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          `Free plan allows only ${PaymentService.FREE_PLAN_LIMITS.maxTravelPlans} travel plans. Upgrade to premium for unlimited plans!`
        );
      }
    }
  }

  const result = await prisma.travelPlan.create({
    data: {
      ...payload,
      creatorId: user.id,
      startDate: new Date(payload.startDate),
      endDate: new Date(payload.endDate),
    } as Prisma.TravelPlanUncheckedCreateInput,
  });

  return result;
};

const getAllTravelPlans = async (params: any, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const {
    searchTerm,
    destination,
    travelType,
    minBudget,
    maxBudget,
    startDate,
    endDate,
    ...filterData
  } = params;

  const andConditions: Prisma.TravelPlanWhereInput[] = [];

  andConditions.push({ isDeleted: false, status: TravelPlanStatus.OPEN });

  if (searchTerm) {
    andConditions.push({
      OR: travelPlanSearchableFields.map((field) => ({
        [field]: { contains: searchTerm, mode: "insensitive" },
      })),
    });
  }

  if (destination) {
    andConditions.push({
      destination: { contains: destination, mode: "insensitive" },
    });
  }

  if (travelType) {
    andConditions.push({ travelType });
  }

  if (minBudget || maxBudget) {
    andConditions.push({
      budget: {
        ...(minBudget && { gte: parseFloat(minBudget) }),
        ...(maxBudget && { lte: parseFloat(maxBudget) }),
      },
    });
  }

  if (startDate) {
    andConditions.push({ startDate: { gte: new Date(startDate) } });
  }
  if (endDate) {
    andConditions.push({ endDate: { lte: new Date(endDate) } });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: { equals: (filterData as any)[key] },
      })),
    });
  }

  const whereConditions: Prisma.TravelPlanWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.travelPlan.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
    select: travelPlanSelectFields,
  });

  const total = await prisma.travelPlan.count({ where: whereConditions });

  return {
    meta: { page, limit, total },
    data: result,
  };
};

const getTravelPlanById = async (id: string) => {
  const travelPlan = await prisma.travelPlan.findFirst({
    where: { id, isDeleted: false },
    select: {
      ...travelPlanSelectFields,
      travelRequests: {
        where: { status: "APPROVED" },
        select: {
          id: true,
          user: {
            select: {
              id: true,
              fullName: true,
              avatar: true,
              isVerified: true,
            },
          },
        },
      },
      _count: {
        select: { travelRequests: { where: { status: "APPROVED" } } },
      },
    },
  });

  if (!travelPlan) {
    throw new ApiError(httpStatus.NOT_FOUND, "Travel plan not found!");
  }

  return travelPlan;
};

const getMyTravelPlans = async (
  user: IAuthUser,
  options: IPaginationOptions
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);

  const result = await prisma.travelPlan.findMany({
    where: { creatorId: user?.id, isDeleted: false },
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      ...travelPlanSelectFields,
      _count: {
        select: {
          travelRequests: { where: { status: "PENDING" } },
        },
      },
    },
  });

  const total = await prisma.travelPlan.count({
    where: { creatorId: user?.id, isDeleted: false },
  });

  return { meta: { page, limit, total }, data: result };
};

const updateTravelPlan = async (
  user: IAuthUser,
  id: string,
  payload: Partial<ICreateTravelPlanPayload>
) => {
  const travelPlan = await prisma.travelPlan.findFirst({
    where: { id, creatorId: user?.id, isDeleted: false },
  });

  if (!travelPlan) {
    throw new ApiError(httpStatus.NOT_FOUND, "Travel plan not found!");
  }

  const result = await prisma.travelPlan.update({
    where: { id },
    data: {
      ...payload,
      ...(payload.startDate && { startDate: new Date(payload.startDate) }),
      ...(payload.endDate && { endDate: new Date(payload.endDate) }),
    } as Prisma.TravelPlanUncheckedUpdateInput,
    select: travelPlanSelectFields,
  });

  return result;
};

const deleteTravelPlan = async (user: IAuthUser, id: string) => {
  const travelPlan = await prisma.travelPlan.findFirst({
    where: { id, creatorId: user?.id, isDeleted: false },
  });

  if (!travelPlan) {
    throw new ApiError(httpStatus.NOT_FOUND, "Travel plan not found!");
  }

  await prisma.travelPlan.update({
    where: { id },
    data: { isDeleted: true },
  });

  return { message: "Travel plan deleted successfully!" };
};

const updateTravelPlanStatus = async (
  user: IAuthUser,
  id: string,
  status: TravelPlanStatus
) => {
  const travelPlan = await prisma.travelPlan.findFirst({
    where: { id, creatorId: user?.id, isDeleted: false },
  });

  if (!travelPlan) {
    throw new ApiError(httpStatus.NOT_FOUND, "Travel plan not found!");
  }

  const result = await prisma.travelPlan.update({
    where: { id },
    data: { status },
    select: travelPlanSelectFields,
  });

  return result;
};

const matchTravelPlans = async (
  user: IAuthUser,
  options: IPaginationOptions
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);

  const userData = await prisma.user.findUnique({
    where: { id: user?.id },
    select: { travelInterests: true, currentLocation: true },
  });

  const andConditions: Prisma.TravelPlanWhereInput[] = [
    { isDeleted: false },
    { status: TravelPlanStatus.OPEN },
    { creatorId: { not: user?.id } },
  ];

  if (userData?.travelInterests && userData.travelInterests.length > 0) {
    andConditions.push({
      activities: { hasSome: userData.travelInterests },
    });
  }

  const whereConditions: Prisma.TravelPlanWhereInput = { AND: andConditions };

  const result = await prisma.travelPlan.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    select: travelPlanSelectFields,
  });

  const total = await prisma.travelPlan.count({ where: whereConditions });

  return { meta: { page, limit, total }, data: result };
};

const sendTravelRequest = async (
  user: IAuthUser,
  travelPlanId: string,
  message?: string
) => {
  const travelPlan = await prisma.travelPlan.findFirst({
    where: {
      id: travelPlanId,
      isDeleted: false,
      status: TravelPlanStatus.OPEN,
    },
    include: {
      _count: { select: { travelRequests: { where: { status: "APPROVED" } } } },
    },
  });

  if (!travelPlan) {
    throw new ApiError(httpStatus.NOT_FOUND, "Travel plan not found!");
  }

  if (travelPlan.creatorId === user?.id) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You cannot request your own travel plan!"
    );
  }

  if (travelPlan._count.travelRequests >= travelPlan.maxMembers) {
    throw new ApiError(httpStatus.BAD_REQUEST, "This travel plan is full!");
  }

  const existingRequest = await prisma.travelRequest.findUnique({
    where: {
      travelPlanId_userId: { travelPlanId, userId: user?.id as string },
    },
  });

  if (existingRequest) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "You already sent a request for this plan!"
    );
  }

  const result = await prisma.travelRequest.create({
    data: {
      travelPlanId,
      userId: user?.id as string,
      message,
    },
  });

  return result;
};

const getMyTravelRequests = async (user: IAuthUser) => {
  const result = await prisma.travelRequest.findMany({
    where: { userId: user?.id },
    orderBy: { createdAt: "desc" },
    include: {
      travelPlan: { select: travelPlanSelectFields },
    },
  });

  return result;
};

const getPendingRequestsForMyPlans = async (user: IAuthUser) => {
  const result = await prisma.travelRequest.findMany({
    where: {
      travelPlan: { creatorId: user?.id },
      status: "PENDING",
    },
    orderBy: { createdAt: "desc" },
    include: {
      travelPlan: { select: { id: true, title: true, destination: true } },
      user: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
          bio: true,
          travelInterests: true,
          isVerified: true,
        },
      },
    },
  });

  return result;
};

const respondToTravelRequest = async (
  user: IAuthUser,
  requestId: string,
  status: "APPROVED" | "REJECTED"
) => {
  const request = await prisma.travelRequest.findFirst({
    where: { id: requestId },
    include: { travelPlan: true },
  });

  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, "Request not found!");
  }

  if (request.travelPlan.creatorId !== user?.id) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You can only respond to requests for your own plans!"
    );
  }

  const result = await prisma.travelRequest.update({
    where: { id: requestId },
    data: { status },
  });

  return result;
};

export const TravelPlanService = {
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
};
