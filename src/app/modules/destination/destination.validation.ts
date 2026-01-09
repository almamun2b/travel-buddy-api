import { z } from "zod";

const createDestination = z.object({
  name: z.string().min(1, "Destination name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(1, "Location is required"),
  country: z.string().min(1, "Country is required"),
  coordinates: z.string().optional(),
  images: z.array(z.string()).optional(),
  category: z.enum([
    "ADVENTURE",
    "BEACH",
    "MOUNTAIN",
    "CITY",
    "CULTURAL",
    "NATURE",
    "WILDLIFE",
    "HISTORICAL",
    "ROMANTIC",
    "FAMILY_FRIENDLY",
    "SOLO_TRAVEL",
    "FOOD_WINE",
    "WELLNESS",
    "PHOTOGRAPHY",
    "ROAD_TRIP",
    "CRUISE",
    "PILGRIMAGE",
    "BUSINESS",
    "ECO_TOURISM",
    "EXTREME_SPORTS",
  ]),
  difficultyLevel: z
    .enum(["EASY", "MODERATE", "CHALLENGING", "EXTREME"])
    .default("MODERATE"),
  duration: z.string().optional(),
  bestTimeToVisit: z.string().optional(),
  weather: z.string().optional(),
  language: z.string().optional(),
  currency: z.string().optional(),
  timezone: z.string().optional(),
  activities: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  transportation: z.array(z.string()).optional(),
  accommodation: z.array(z.string()).optional(),
  averageCost: z.number().positive().optional(),
  currencySymbol: z.string().optional(),
  isRecommended: z.boolean().default(false),
  isPopular: z.boolean().default(false),
  isTrending: z.boolean().default(false),
  isHiddenGem: z.boolean().default(false),
  slug: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

const updateDestination = createDestination.partial();

const updateDestinationStatus = z.object({
  status: z.enum(["ACTIVE", "INACTIVE", "MAINTENANCE", "ARCHIVED"]),
  isRecommended: z.boolean().optional(),
  isPopular: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  isHiddenGem: z.boolean().optional(),
});

export const destinationValidation = {
  createDestination,
  updateDestination,
  updateDestinationStatus,
};
