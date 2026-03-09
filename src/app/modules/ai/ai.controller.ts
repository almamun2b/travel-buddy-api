import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { IAuthUser } from "../../interfaces/common";
import { AIService } from "./ai.service";

const chat = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const { message, conversationHistory } = req.body;

    const reply = await AIService.chat(message, conversationHistory);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "AI response generated successfully!",
      data: { reply },
    });
  }
);

export const AIController = { chat };
