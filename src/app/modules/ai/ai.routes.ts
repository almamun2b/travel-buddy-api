import { UserRole } from "@prisma/client";
import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { AIController } from "./ai.controller";
import { AIValidation } from "./ai.validation";

const router = express.Router();

/**
 * @route   POST /api/v1/ai/chat
 * @desc    AI Travel Assistant Chat
 * @access  Private (USER, ADMIN)
 * @body    { message: string, conversationHistory?: { role: "user"|"assistant", content: string }[] }
 */
router.post(
  "/chat",
  auth(UserRole.USER, UserRole.ADMIN),
  validateRequest(AIValidation.chatSchema),
  AIController.chat
);

export const aiRoutes = router;
