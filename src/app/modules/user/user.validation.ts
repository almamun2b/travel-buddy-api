import { Gender, UserStatus } from "@prisma/client";
import { z } from "zod";

const createAdmin = z.object({
  password: z
    .string({ error: "Password is required" })
    .min(6, "Password must be at least 6 characters"),
  fullName: z.string({ error: "Full name is required!" }),
  email: z
    .string({ error: "Email is required!" })
    .email("Invalid email format"),
  contactNumber: z.string().optional(),
});

const updateStatus = z.object({
  status: z.enum([UserStatus.ACTIVE, UserStatus.BLOCKED, UserStatus.DELETED]),
  isVerified: z.boolean().optional(),
  hasVerifiedBadge: z.boolean().optional(),
});

const updateProfile = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").optional(),
  contactNumber: z.string().optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum([Gender.MALE, Gender.FEMALE, Gender.OTHER]).optional(),
  currentLocation: z.string().optional(),
  travelInterests: z.array(z.string()).optional(),
  visitedCountries: z.array(z.string()).optional(),
});

export const userValidation = {
  createAdmin,
  updateStatus,
  updateProfile,
};
