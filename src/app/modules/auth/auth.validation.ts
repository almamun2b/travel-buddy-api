import { z } from "zod";

const registerUser = z.object({
  body: z.object({
    email: z.string().email("Please provide a valid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password must not exceed 100 characters"),
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name must not exceed 100 characters"),
    contactNumber: z.string().optional(),
    bio: z.string().max(500, "Bio must not exceed 500 characters").optional(),
    currentLocation: z.string().optional(),
    travelInterests: z.array(z.string()).optional(),
    visitedCountries: z.array(z.string()).optional(),
  }),
});

const loginUser = z.object({
  body: z.object({
    email: z.string().email("Please provide a valid email address"),
    password: z.string({ error: "Password is required" }),
  }),
});

const changePassword = z.object({
  body: z.object({
    oldPassword: z.string({ error: "Old password is required" }),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters")
      .max(100, "New password must not exceed 100 characters"),
  }),
});

const forgotPassword = z.object({
  body: z.object({
    email: z.string().email("Please provide a valid email address"),
  }),
});

const resetPassword = z.object({
  body: z.object({
    id: z.string({ error: "User ID is required" }),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password must not exceed 100 characters"),
  }),
});

export const AuthValidation = {
  registerUser,
  loginUser,
  changePassword,
  forgotPassword,
  resetPassword,
};
