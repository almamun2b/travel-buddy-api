import { Destination, DestinationStatus, Prisma } from "@prisma/client";
import { Request } from "express";
import httpStatus from "http-status";
import { fileUploader } from "../../../helpers/fileUploader";
import { paginationHelper } from "../../../helpers/paginationHelper";
import prisma from "../../../shared/prisma";
import ApiError from "../../errors/ApiError";
import { IPaginationOptions } from "../../interfaces/pagination";
import { destinationSearchAbleFields } from "./destination.constant";

const destinationSelectFields = {
  id: true,
  name: true,
  description: true,
  location: true,
  country: true,
  coordinates: true,
  images: true,
  category: true,
  difficultyLevel: true,
  duration: true,
  bestTimeToVisit: true,
  weather: true,
  language: true,
  currency: true,
  timezone: true,
  activities: true,
  amenities: true,
  transportation: true,
  accommodation: true,
  averageCost: true,
  currencySymbol: true,
  averageRating: true,
  totalReviews: true,
  totalTravellers: true,
  popularityScore: true,
  isRecommended: true,
  isPopular: true,
  isTrending: true,
  isHiddenGem: true,
  status: true,
  slug: true,
  metaTitle: true,
  metaDescription: true,
  tags: true,
  createdAt: true,
  updatedAt: true,
};

const publicDestinationFields = {
  id: true,
  name: true,
  description: true,
  location: true,
  country: true,
  coordinates: true,
  images: true,
  category: true,
  difficultyLevel: true,
  duration: true,
  bestTimeToVisit: true,
  weather: true,
  language: true,
  currency: true,
  timezone: true,
  activities: true,
  amenities: true,
  transportation: true,
  accommodation: true,
  averageCost: true,
  currencySymbol: true,
  averageRating: true,
  totalReviews: true,
  totalTravellers: true,
  popularityScore: true,
  isRecommended: true,
  isPopular: true,
  isTrending: true,
  isHiddenGem: true,
  tags: true,
  createdAt: true,
};

const createDestination = async (req: Request) => {
  const files = req.files as Express.Multer.File[];

  // Handle multiple image uploads
  if (files && files.length > 0) {
    const uploadedImages = await Promise.all(
      files.map(async (file) => {
        const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
        return uploadToCloudinary?.secure_url;
      })
    );
    req.body.images = uploadedImages.filter(Boolean);
  }

  // Generate slug from name if not provided
  if (!req.body.slug && req.body.name) {
    req.body.slug = req.body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  const result = await prisma.destination.create({
    data: {
      ...req.body,
      images: req.body.images || [],
      activities: req.body.activities || [],
      amenities: req.body.amenities || [],
      transportation: req.body.transportation || [],
      accommodation: req.body.accommodation || [],
      tags: req.body.tags || [],
    },
    select: destinationSelectFields,
  });

  return result;
};

const getAllDestinations = async (params: any, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.DestinationWhereInput[] = [];

  andConditions.push({ isDeleted: false });

  if (searchTerm) {
    andConditions.push({
      OR: destinationSearchAbleFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    if (filterData?.isPopular) {
      filterData.isPopular = filterData.isPopular === "true";
    }
    if (filterData?.isRecommended) {
      filterData.isRecommended = filterData.isRecommended === "true";
    }
    if (filterData?.isTrending) {
      filterData.isTrending = filterData.isTrending === "true";
    }
    if (filterData?.isHiddenGem) {
      filterData.isHiddenGem = filterData.isHiddenGem === "true";
    }

    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.DestinationWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.destination.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
    select: destinationSelectFields,
  });

  const total = await prisma.destination.count({
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

const getDestinationById = async (id: string) => {
  const destination = await prisma.destination.findFirst({
    where: {
      id,
      isDeleted: false,
    },
    select: {
      ...destinationSelectFields,
      _count: {
        select: { travelPlans: true },
      },
    },
  });

  if (!destination) {
    throw new ApiError(httpStatus.NOT_FOUND, "Destination not found!");
  }

  return destination;
};

const updateDestination = async (id: string, req: Request) => {
  const destination = await prisma.destination.findFirst({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!destination) {
    throw new ApiError(httpStatus.NOT_FOUND, "Destination not found!");
  }

  const files = req.files as Express.Multer.File[];

  // Handle multiple image uploads
  if (files && files.length > 0) {
    const uploadedImages = await Promise.all(
      files.map(async (file) => {
        const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
        return uploadToCloudinary?.secure_url;
      })
    );
    req.body.images = uploadedImages.filter(Boolean);
  }

  // Update slug if name changed and slug not provided
  if (req.body.name && !req.body.slug) {
    req.body.slug = req.body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  const allowedFields = [
    "name",
    "description",
    "location",
    "country",
    "coordinates",
    "images",
    "category",
    "difficultyLevel",
    "duration",
    "bestTimeToVisit",
    "weather",
    "language",
    "currency",
    "timezone",
    "activities",
    "amenities",
    "transportation",
    "accommodation",
    "averageCost",
    "currencySymbol",
    "isRecommended",
    "isPopular",
    "isTrending",
    "isHiddenGem",
    "slug",
    "metaTitle",
    "metaDescription",
    "tags",
    "status",
  ];

  const updateData: Record<string, any> = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  }

  const result = await prisma.destination.update({
    where: { id },
    data: updateData,
    select: destinationSelectFields,
  });

  return result;
};

const patchDestination = async (id: string, payload: Partial<Destination>) => {
  const destination = await prisma.destination.findFirst({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!destination) {
    throw new ApiError(httpStatus.NOT_FOUND, "Destination not found!");
  }

  const result = await prisma.destination.update({
    where: { id },
    data: payload,
    select: destinationSelectFields,
  });

  return result;
};

const deleteDestination = async (id: string) => {
  const destination = await prisma.destination.findFirst({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!destination) {
    throw new ApiError(httpStatus.NOT_FOUND, "Destination not found!");
  }

  const result = await prisma.destination.update({
    where: { id },
    data: {
      isDeleted: true,
      status: DestinationStatus.ARCHIVED,
    },
    select: destinationSelectFields,
  });

  return result;
};

// Public operations
const getPublicDestinations = async (
  params: any,
  options: IPaginationOptions
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.DestinationWhereInput[] = [
    { status: DestinationStatus.ACTIVE },
    { isDeleted: false },
  ];

  if (searchTerm) {
    andConditions.push({
      OR: destinationSearchAbleFields.map((field) => ({
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

  const whereConditions: Prisma.DestinationWhereInput = { AND: andConditions };

  const result = await prisma.destination.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: { popularityScore: "desc" },
    select: publicDestinationFields,
  });

  const total = await prisma.destination.count({ where: whereConditions });

  return {
    meta: { page, limit, total },
    data: result,
  };
};

const getPopularDestinations = async (options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);

  const result = await prisma.destination.findMany({
    where: {
      status: DestinationStatus.ACTIVE,
      isDeleted: false,
      isPopular: true,
    },
    skip,
    take: limit,
    orderBy: { popularityScore: "desc" },
    select: publicDestinationFields,
  });

  const total = await prisma.destination.count({
    where: {
      status: DestinationStatus.ACTIVE,
      isDeleted: false,
      isPopular: true,
    },
  });

  return {
    meta: { page, limit, total },
    data: result,
  };
};

const getRecommendedDestinations = async (options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);

  const result = await prisma.destination.findMany({
    where: {
      status: DestinationStatus.ACTIVE,
      isDeleted: false,
      isRecommended: true,
    },
    skip,
    take: limit,
    orderBy: { popularityScore: "desc" },
    select: publicDestinationFields,
  });

  const total = await prisma.destination.count({
    where: {
      status: DestinationStatus.ACTIVE,
      isDeleted: false,
      isRecommended: true,
    },
  });

  return {
    meta: { page, limit, total },
    data: result,
  };
};

const getPublicDestinationById = async (id: string) => {
  const destination = await prisma.destination.findFirst({
    where: {
      id,
      status: DestinationStatus.ACTIVE,
      isDeleted: false,
    },
    select: {
      ...publicDestinationFields,
      _count: {
        select: { travelPlans: true },
      },
    },
  });

  if (!destination) {
    throw new ApiError(httpStatus.NOT_FOUND, "Destination not found!");
  }

  // Increment total travellers count
  await prisma.destination.update({
    where: { id },
    data: { totalTravellers: { increment: 1 } },
  });

  return destination;
};

const getTrendingDestinations = async (options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);

  const result = await prisma.destination.findMany({
    where: {
      status: DestinationStatus.ACTIVE,
      isDeleted: false,
      isTrending: true,
    },
    skip,
    take: limit,
    orderBy: { popularityScore: "desc" },
    select: publicDestinationFields,
  });

  const total = await prisma.destination.count({
    where: {
      status: DestinationStatus.ACTIVE,
      isDeleted: false,
      isTrending: true,
    },
  });

  return {
    meta: { page, limit, total },
    data: result,
  };
};

const searchDestinations = async (
  query: string,
  options: IPaginationOptions
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);

  const result = await prisma.destination.findMany({
    where: {
      status: DestinationStatus.ACTIVE,
      isDeleted: false,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { location: { contains: query, mode: "insensitive" } },
        { country: { contains: query, mode: "insensitive" } },
        { tags: { hasSome: [query] } },
      ],
    },
    skip,
    take: limit,
    orderBy: { popularityScore: "desc" },
    select: publicDestinationFields,
  });

  const total = await prisma.destination.count({
    where: {
      status: DestinationStatus.ACTIVE,
      isDeleted: false,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { location: { contains: query, mode: "insensitive" } },
        { country: { contains: query, mode: "insensitive" } },
        { tags: { hasSome: [query] } },
      ],
    },
  });

  return {
    meta: { page, limit, total },
    data: result,
  };
};

export const destinationService = {
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
