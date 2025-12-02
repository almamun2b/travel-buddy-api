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

// User select fields to exclude password
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

// Public profile fields (less info than full profile)
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

  // Check if email already exists
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

// ==================== Admin Operations ====================

const getAllUsers = async (params: any, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.UserWhereInput[] = [];

  // Exclude deleted users by default
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
  payload: { status: UserStatus }
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
    data: { status: payload.status },
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

// ==================== User Profile Operations ====================

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

  // Fields that can be updated by user
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

  // Filter only allowed fields
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

// ==================== Public Profile Operations ====================

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

export const userService = {
  createAdmin,
  getAllUsers,
  getUserById,
  changeUserStatus,
  softDeleteUser,
  getMyProfile,
  updateMyProfile,
  getPublicProfile,
};
