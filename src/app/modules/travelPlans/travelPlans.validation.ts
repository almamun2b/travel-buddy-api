import { TravelPlanStatus, TravelType } from "@prisma/client";
import { z } from "zod";

const createTravelPlan = z.object({
  title: z
    .string({ error: "Title is required" })
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must not exceed 100 characters"),
  description: z
    .string({ error: "Description is required" })
    .min(20, "Description must be at least 20 characters")
    .max(2000, "Description must not exceed 2000 characters"),
  destination: z
    .string({ error: "Destination is required" })
    .min(2, "Destination must be at least 2 characters"),
  startDate: z.string({ error: "Start date is required" }),
  endDate: z.string({ error: "End date is required" }),
  budget: z.number().positive("Budget must be positive").optional(),
  travelType: z.nativeEnum(TravelType, {
    error: "Travel type is required",
  }),
  maxMembers: z
    .number()
    .int()
    .min(1, "Must allow at least 1 member")
    .max(50, "Cannot exceed 50 members")
    .optional(),
  activities: z.array(z.string()).optional(),
  images: z.array(z.string().url()).optional(),
});

const updateTravelPlan = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must not exceed 100 characters")
    .optional(),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(2000, "Description must not exceed 2000 characters")
    .optional(),
  destination: z
    .string()
    .min(2, "Destination must be at least 2 characters")
    .optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budget: z.number().positive("Budget must be positive").optional(),
  travelType: z.nativeEnum(TravelType).optional(),
  maxMembers: z
    .number()
    .int()
    .min(1, "Must allow at least 1 member")
    .max(50, "Cannot exceed 50 members")
    .optional(),
  activities: z.array(z.string()).optional(),
  images: z.array(z.string().url()).optional(),
});

const updateTravelPlanStatus = z.object({
  status: z.nativeEnum(TravelPlanStatus, {
    error: "Status is required",
  }),
});

const sendTravelRequest = z.object({
  travelPlanId: z.string({ error: "Travel plan ID is required" }),
  message: z
    .string()
    .max(500, "Message must not exceed 500 characters")
    .optional(),
});

const respondToTravelRequest = z.object({
  status: z.enum(["APPROVED", "REJECTED"], {
    error: "Status is required",
  }),
});

export const TravelPlanValidation = {
  createTravelPlan,
  updateTravelPlan,
  updateTravelPlanStatus,
  sendTravelRequest,
  respondToTravelRequest,
};
