import { UserRole } from "@prisma/client";
import express from "express";
import auth from "../../middlewares/auth";
import { authLimiter } from "../../middlewares/rateLimiter";
import validateRequest from "../../middlewares/validateRequest";
import { AuthController } from "./auth.controller";
import { AuthValidation } from "./auth.validation";

const router = express.Router();

// Public routes
router.post(
  "/register",
  authLimiter,
  validateRequest(AuthValidation.registerUser),
  AuthController.registerUser
);

router.post(
  "/login",
  authLimiter,
  validateRequest(AuthValidation.loginUser),
  AuthController.loginUser
);

router.post("/refresh-token", AuthController.refreshToken);

router.post(
  "/forgot-password",
  validateRequest(AuthValidation.forgotPassword),
  AuthController.forgotPassword
);

router.post(
  "/reset-password",
  validateRequest(AuthValidation.resetPassword),
  AuthController.resetPassword
);

// Protected routes
router.post(
  "/change-password",
  auth(UserRole.ADMIN, UserRole.USER),
  validateRequest(AuthValidation.changePassword),
  AuthController.changePassword
);

router.get("/me", auth(UserRole.ADMIN, UserRole.USER), AuthController.getMe);

router.post(
  "/logout",
  auth(UserRole.ADMIN, UserRole.USER),
  AuthController.logout
);

export const AuthRoutes = router;
