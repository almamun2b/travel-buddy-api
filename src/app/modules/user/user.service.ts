import { Prisma, User, UserRole, UserStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { Request } from "express";
import httpStatus from "http-status";
import { env } from "../../../config/env";
import { fileUploader } from "../../../helpers/fileUploader";
import { paginationHelper } from "../../../helpers/paginationHelper";
import prisma from "../../../shared/prisma";
import ApiError from "../../errors/ApiError";
import { IAuthUser } from "../../interfaces/common";
import { IPaginationOptions } from "../../interfaces/pagination";
import { userSearchAbleFields } from "./user.constant";

const userSelectFields = {
  id: true,
  email: true,
  role: true,
  fullName: true,
  avatar: true,
  contactNumber: true,
  bio: true,
  dateOfBirth: true,
  gender: true,
  currentLocation: true,
  travelInterests: true,
  visitedCountries: true,
  isVerified: true,
  hasVerifiedBadge: true,
  status: true,
  isDeleted: true,
  createdAt: true,
  updatedAt: true,
};

const publicProfileFields = {
  id: true,
  fullName: true,
  avatar: true,
  bio: true,
  currentLocation: true,
  travelInterests: true,
  visitedCountries: true,
  isVerified: true,
  hasVerifiedBadge: true,
  createdAt: true,
};

const createAdmin = async (req: Request): Promise<Partial<User>> => {
  const file = req.file;

  const existingUser = await prisma.user.findUnique({
    where: { email: req.body.email },
  });

  if (existingUser) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "User already exists with this email!"
    );
  }

  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.avatar = uploadToCloudinary?.secure_url;
  }

  const hashedPassword: string = await bcrypt.hash(
    req.body.password,
    parseInt(env.bcryptSaltRound)
  );

  const result = await prisma.user.create({
    data: {
      email: req.body.email,
      password: hashedPassword,
      role: UserRole.ADMIN,
      fullName: req.body.fullName,
      avatar: req.body.avatar,
      contactNumber: req.body.contactNumber,
    },
    select: userSelectFields,
  });

  return result;
};

const getAllUsers = async (params: any, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.UserWhereInput[] = [];

  andConditions.push({ isDeleted: false });

  if (searchTerm) {
    andConditions.push({
      OR: userSearchAbleFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.UserWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.user.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
    select: userSelectFields,
  });

  const total = await prisma.user.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getUserById = async (id: string) => {
  const user = await prisma.user.findFirst({
    where: {
      id,
      isDeleted: false,
    },
    select: {
      ...userSelectFields,
      subscription: {
        select: {
          id: true,
          plan: true,
          status: true,
          startDate: true,
          endDate: true,
        },
      },
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }

  return user;
};

const changeUserStatus = async (
  id: string,
  payload: {
    status?: UserStatus;
    isVerified?: boolean;
    hasVerifiedBadge?: boolean;
  }
) => {
  const user = await prisma.user.findFirst({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }

  const result = await prisma.user.update({
    where: { id },
    data: { ...payload },
    select: userSelectFields,
  });

  return result;
};

const softDeleteUser = async (id: string) => {
  const user = await prisma.user.findFirst({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }

  const result = await prisma.user.update({
    where: { id },
    data: {
      isDeleted: true,
      status: UserStatus.DELETED,
    },
    select: userSelectFields,
  });

  return result;
};

const getMyProfile = async (user: IAuthUser) => {
  const userData = await prisma.user.findFirst({
    where: {
      email: user?.email,
      status: UserStatus.ACTIVE,
      isDeleted: false,
    },
    select: {
      ...userSelectFields,
      needPasswordChange: true,
      subscription: {
        select: {
          id: true,
          plan: true,
          status: true,
          startDate: true,
          endDate: true,
        },
      },
    },
  });

  if (!userData) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }

  return userData;
};

const updateMyProfile = async (user: IAuthUser, req: Request) => {
  const userData = await prisma.user.findFirst({
    where: {
      email: user?.email,
      status: UserStatus.ACTIVE,
      isDeleted: false,
    },
  });

  if (!userData) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }

  const file = req.file;
  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.avatar = uploadToCloudinary?.secure_url;
  }

  const allowedFields = [
    "fullName",
    "avatar",
    "contactNumber",
    "bio",
    "dateOfBirth",
    "gender",
    "currentLocation",
    "travelInterests",
    "visitedCountries",
  ];

  const updateData: Record<string, any> = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  }

  const result = await prisma.user.update({
    where: { id: userData.id },
    data: updateData,
    select: userSelectFields,
  });

  return result;
};

const getPublicProfile = async (id: string) => {
  const user = await prisma.user.findFirst({
    where: {
      id,
      status: UserStatus.ACTIVE,
      isDeleted: false,
    },
    select: publicProfileFields,
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }

  return user;
};

const exploreTravelers = async (
  params: {
    searchTerm?: string;
    travelInterest?: string;
    currentLocation?: string;
    hasVerifiedBadge?: string;
  },
  options: IPaginationOptions
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const andConditions: Prisma.UserWhereInput[] = [
    { role: UserRole.USER },
    { status: UserStatus.ACTIVE },
    { isDeleted: false },
  ];

  if (params.searchTerm) {
    andConditions.push({
      OR: [
        { fullName: { contains: params.searchTerm, mode: "insensitive" } },
        { bio: { contains: params.searchTerm, mode: "insensitive" } },
        {
          currentLocation: { contains: params.searchTerm, mode: "insensitive" },
        },
      ],
    });
  }

  if (params.travelInterest) {
    andConditions.push({
      travelInterests: { has: params.travelInterest },
    });
  }

  if (params.currentLocation) {
    andConditions.push({
      currentLocation: {
        contains: params.currentLocation,
        mode: "insensitive",
      },
    });
  }

  if (params.hasVerifiedBadge === "true") {
    andConditions.push({ hasVerifiedBadge: true });
  }

  const whereConditions: Prisma.UserWhereInput = { AND: andConditions };

  const result = await prisma.user.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder },
    select: {
      ...publicProfileFields,
      _count: {
        select: { reviewsReceived: true, travelPlans: true },
      },
    },
  });

  const total = await prisma.user.count({ where: whereConditions });

  return {
    meta: { page, limit, total },
    data: result,
  };
};

const getDashboardStats = async (user: IAuthUser) => {
  if (!user?.id) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User not authenticated!");
  }

  if (user.role === "ADMIN") {
    // Admin dashboard stats
    const [totalUsers, totalTravelPlans, totalReviews, activeSubscriptions] =
      await Promise.all([
        prisma.user.count({ where: { isDeleted: false, role: UserRole.USER } }),
        prisma.travelPlan.count({ where: { isDeleted: false } }),
        prisma.review.count(),
        prisma.subscription.count({
          where: {
            status: "ACTIVE",
            plan: { in: ["MONTHLY", "YEARLY"] },
          },
        }),
      ]);

    const recentUsers = await prisma.user.findMany({
      where: { isDeleted: false, role: UserRole.USER },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, fullName: true, avatar: true, createdAt: true },
    });

    const recentTravelPlans = await prisma.travelPlan.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        destination: true,
        status: true,
        createdAt: true,
        creator: { select: { fullName: true, avatar: true } },
      },
    });

    return {
      stats: {
        totalUsers,
        totalTravelPlans,
        totalReviews,
        activeSubscriptions,
      },
      recentUsers,
      recentTravelPlans,
    };
  } else {
    // User dashboard stats
    const [
      myTravelPlansCount,
      pendingRequestsCount,
      approvedRequestsCount,
      reviewsReceivedCount,
    ] = await Promise.all([
      prisma.travelPlan.count({
        where: { creatorId: user.id, isDeleted: false },
      }),
      prisma.travelRequest.count({
        where: {
          travelPlan: { creatorId: user.id },
          status: "PENDING",
        },
      }),
      prisma.travelRequest.count({
        where: { userId: user.id, status: "APPROVED" },
      }),
      prisma.review.count({ where: { revieweeId: user.id } }),
    ]);

    // Upcoming travel plans (my own + approved requests)
    const upcomingPlans = await prisma.travelPlan.findMany({
      where: {
        OR: [
          { creatorId: user.id },
          { travelRequests: { some: { userId: user.id, status: "APPROVED" } } },
        ],
        startDate: { gte: new Date() },
        isDeleted: false,
        status: "OPEN",
      },
      orderBy: { startDate: "asc" },
      take: 5,
      select: {
        id: true,
        title: true,
        destination: true,
        startDate: true,
        endDate: true,
        creator: { select: { id: true, fullName: true, avatar: true } },
      },
    });

    // Matched travelers (people going to similar destinations based on interests)
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { travelInterests: true },
    });

    const matchedTravelers = await prisma.user.findMany({
      where: {
        id: { not: user.id },
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        isDeleted: false,
        travelInterests: {
          hasSome: userData?.travelInterests || [],
        },
      },
      take: 5,
      select: {
        id: true,
        fullName: true,
        avatar: true,
        travelInterests: true,
        hasVerifiedBadge: true,
      },
    });

    return {
      stats: {
        myTravelPlans: myTravelPlansCount,
        pendingRequests: pendingRequestsCount,
        approvedTrips: approvedRequestsCount,
        reviewsReceived: reviewsReceivedCount,
      },
      upcomingPlans,
      matchedTravelers,
    };
  }
};

export const userService = {
  createAdmin,
  getAllUsers,
  getUserById,
  changeUserStatus,
  softDeleteUser,
  getMyProfile,
  updateMyProfile,
  getPublicProfile,
  exploreTravelers,
  getDashboardStats,
};
