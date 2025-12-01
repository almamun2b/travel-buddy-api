import { UserRole } from "@prisma/client";
import express, { NextFunction, Request, Response } from "express";
import { fileUploader } from "../../../helpers/fileUploader";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { userController } from "./user.controller";
import { userValidation } from "./user.validation";

const router = express.Router();

// ==================== Admin Routes ====================

// Get all users (Admin only)
router.get("/", auth(UserRole.ADMIN), userController.getAllUsers);

// Get single user by ID (Admin only)
router.get("/:id", auth(UserRole.ADMIN), userController.getUserById);

// Create admin user (Admin only)
router.post(
  "/create-admin",
  auth(UserRole.ADMIN),
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = userValidation.createAdmin.parse(JSON.parse(req.body.data));
    return userController.createAdmin(req, res, next);
  }
);

// Update user status (Admin only) - block, activate, delete users
router.patch(
  "/:id/status",
  auth(UserRole.ADMIN),
  validateRequest(userValidation.updateStatus),
  userController.changeUserStatus
);

// Soft delete user (Admin only)
router.delete("/:id", auth(UserRole.ADMIN), userController.softDeleteUser);

// ==================== User Profile Routes ====================

// Get my profile
router.get(
  "/profile/me",
  auth(UserRole.ADMIN, UserRole.USER),
  userController.getMyProfile
);

// Update my profile
router.patch(
  "/profile/update",
  auth(UserRole.ADMIN, UserRole.USER),
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    return userController.updateMyProfile(req, res, next);
  }
);

// ==================== Public User Routes ====================

// Get user public profile (for viewing other travelers)
router.get("/profile/:id", userController.getPublicProfile);

export const userRoutes = router;
