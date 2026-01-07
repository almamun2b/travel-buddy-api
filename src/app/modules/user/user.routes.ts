import { UserRole } from "@prisma/client";
import express, { NextFunction, Request, Response } from "express";
import { fileUploader } from "../../../helpers/fileUploader";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { userController } from "./user.controller";
import { userValidation } from "./user.validation";

const router = express.Router();

router.get("/", auth(UserRole.ADMIN), userController.getAllUsers);

router.get(
  "/dashboard-stats",
  auth(UserRole.ADMIN, UserRole.USER),
  userController.getDashboardStats
);

router.get(
  "/profile/me",
  auth(UserRole.ADMIN, UserRole.USER),
  userController.getMyProfile
);

router.get("/explore/travelers", userController.exploreTravelers);

router.get("/top-travelers", userController.getTopTravelers);

router.get("/profile/:id", userController.getPublicProfile);

router.get("/:id", auth(UserRole.ADMIN), userController.getUserById);

router.post(
  "/create-admin",
  auth(UserRole.ADMIN),
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = userValidation.createAdmin.parse(JSON.parse(req.body.data));
    return userController.createAdmin(req, res, next);
  }
);

router.patch(
  "/profile/update",
  auth(UserRole.ADMIN, UserRole.USER),
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = userValidation.updateProfile.parse(JSON.parse(req.body.data));
    }
    return userController.updateMyProfile(req, res, next);
  }
);

router.delete("/soft/:id", auth(UserRole.ADMIN), userController.softDeleteUser);

router.patch(
  "/:id/status",
  auth(UserRole.ADMIN),
  validateRequest(userValidation.updateStatus),
  userController.changeUserStatus
);

router.delete("/:id", auth(UserRole.ADMIN), userController.deleteUser);

export const userRoutes = router;
