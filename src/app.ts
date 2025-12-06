import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import { PaymentController } from "./app/modules/payment/payment.controller";
import router from "./app/routes";
import { env } from "./config/env";

const app: Application = express();
app.use(cookieParser());

// Stripe webhook
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  PaymentController.handleStripeWebhookEvent
);

// CORS Configuration
app.use(
  cors({
    origin: env.clientUrl || "http://localhost:3000",
    credentials: true,
  })
);

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/", (req: Request, res: Response) => {
  res.send({
    success: true,
    message: "Travel Buddy & Meetup API is running!",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/v1", router);

// Global Error Handler
app.use(globalErrorHandler);

// 404 Handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API NOT FOUND!",
    error: {
      path: req.originalUrl,
      message: "Your requested path is not found!",
    },
  });
});

export default app;
