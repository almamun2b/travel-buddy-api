import { UserRole } from "@prisma/client";
import express, { NextFunction, Request, Response } from "express";
import { fileUploader } from "../../../helpers/fileUploader";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { TravelPlanController } from "./travelPlans.controller";
import { TravelPlanValidation } from "./travelPlans.validation";

const router = express.Router();

//  Public Routes
router.get("/", TravelPlanController.getAllTravelPlans);

router.get("/:id", TravelPlanController.getTravelPlanById);

//  Authenticated User Routes
router.post(
  "/",
  auth(UserRole.USER, UserRole.ADMIN),
  fileUploader.upload.array("images", 5),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body.data) {
        req.body = TravelPlanValidation.createTravelPlan.parse(
          JSON.parse(req.body.data)
        );
      }
      if (req.files && Array.isArray(req.files)) {
        const uploadPromises = (req.files as Express.Multer.File[]).map(
          (file) => fileUploader.uploadToCloudinary(file)
        );
        const uploadResults = await Promise.all(uploadPromises);
        req.body.images = uploadResults.map((result) => result.secure_url);
      }
      return TravelPlanController.createTravelPlan(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/my/plans",
  auth(UserRole.USER, UserRole.ADMIN),
  TravelPlanController.getMyTravelPlans
);

router.get(
  "/match/travelers",
  auth(UserRole.USER, UserRole.ADMIN),
  TravelPlanController.matchTravelPlans
);

router.patch(
  "/:id",
  auth(UserRole.USER, UserRole.ADMIN),
  fileUploader.upload.array("images", 5),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body.data) {
        req.body = TravelPlanValidation.updateTravelPlan.parse(
          JSON.parse(req.body.data)
        );
      }
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        const uploadPromises = (req.files as Express.Multer.File[]).map(
          (file) => fileUploader.uploadToCloudinary(file)
        );
        const uploadResults = await Promise.all(uploadPromises);
        req.body.images = uploadResults.map((result) => result.secure_url);
      }
      return TravelPlanController.updateTravelPlan(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/:id/status",
  auth(UserRole.USER, UserRole.ADMIN),
  validateRequest(TravelPlanValidation.updateTravelPlanStatus),
  TravelPlanController.updateTravelPlanStatus
);

router.delete(
  "/:id",
  auth(UserRole.USER, UserRole.ADMIN),
  TravelPlanController.deleteTravelPlan
);

router.post(
  "/requests/send",
  auth(UserRole.USER, UserRole.ADMIN),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = TravelPlanValidation.sendTravelRequest.parse(req.body);
    return TravelPlanController.sendTravelRequest(req, res, next);
  }
);

router.get(
  "/requests/my",
  auth(UserRole.USER, UserRole.ADMIN),
  TravelPlanController.getMyTravelRequests
);

router.get(
  "/requests/pending",
  auth(UserRole.USER, UserRole.ADMIN),
  TravelPlanController.getPendingRequestsForMyPlans
);

router.patch(
  "/requests/:requestId/respond",
  auth(UserRole.USER, UserRole.ADMIN),
  validateRequest(TravelPlanValidation.respondToTravelRequest),
  TravelPlanController.respondToTravelRequest
);

export const travelPlanRoutes = router;
