import { UserRole } from "@prisma/client";
import express, { NextFunction, Request, Response } from "express";
import { fileUploader } from "../../../helpers/fileUploader";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { destinationController } from "./destination.controller";
import { destinationValidation } from "./destination.validation";

const router = express.Router();

// Admin routes
router.post(
  "/",
  auth(UserRole.ADMIN),
  fileUploader.upload.array("files", 5), // Allow up to 5 images
  (req: Request, res: Response, next: NextFunction) => {
    req.body = destinationValidation.createDestination.parse(
      JSON.parse(req.body.data)
    );
    return destinationController.createDestination(req, res, next);
  }
);

router.get("/", auth(UserRole.ADMIN), destinationController.getAllDestinations);

// Public routes
router.get("/public", destinationController.getPublicDestinations);

router.get("/popular", destinationController.getPopularDestinations);

router.get("/recommended", destinationController.getRecommendedDestinations);

router.get("/trending", destinationController.getTrendingDestinations);

router.get("/search", destinationController.searchDestinations);

router.get("/public/:id", destinationController.getPublicDestinationById);

// admin routes
router.get(
  "/:id",
  auth(UserRole.ADMIN),
  destinationController.getDestinationById
);

router.put(
  "/:id",
  auth(UserRole.ADMIN),
  fileUploader.upload.array("files", 5), // Allow up to 5 images
  (req: Request, res: Response, next: NextFunction) => {
    req.body = destinationValidation.updateDestination.parse(
      JSON.parse(req.body.data)
    );
    return destinationController.updateDestination(req, res, next);
  }
);

router.patch(
  "/:id",
  auth(UserRole.ADMIN),
  validateRequest(destinationValidation.updateDestinationStatus),
  destinationController.patchDestination
);

router.delete(
  "/:id",
  auth(UserRole.ADMIN),
  destinationController.deleteDestination
);

export const destinationRoutes = router;
