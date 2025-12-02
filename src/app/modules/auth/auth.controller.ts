import { Request, Response } from "express";
import httpStatus from "http-status";
import { env } from "../../../config/env";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { AuthServices } from "./auth.service";

// Helper function to convert token expiry string to milliseconds
const parseExpiryToMs = (expiry: string): number => {
  const unit = expiry.slice(-1);
  const value = parseInt(expiry.slice(0, -1));

  const multipliers: Record<string, number> = {
    y: 365 * 24 * 60 * 60 * 1000,
    M: 30 * 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    h: 60 * 60 * 1000,
    m: 60 * 1000,
    s: 1000,
  };

  return multipliers[unit] ? value * multipliers[unit] : 1000 * 60 * 60; // default 1 hour
};

// Cookie options helper
const getCookieOptions = (maxAge: number) => ({
  secure: env.nodeEnv === "production",
  httpOnly: true,
  sameSite: "none" as const,
  maxAge,
});

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.registerUser(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message:
      "User registered successfully! Please check your email for the verification code.",
    data: {
      id: result.id,
      email: result.email,
      fullName: result.fullName,
      role: result.role,
    },
  });
});

const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.verifyEmail(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Email verified successfully! You can now login.",
    data: result,
  });
});

const resendVerificationCode = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AuthServices.resendVerificationCode(req.body);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Verification code sent successfully! Please check your email.",
      data: result,
    });
  }
);

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const accessTokenMaxAge = parseExpiryToMs(env.jwt.accessTokenExpiresIn);
  const refreshTokenMaxAge = parseExpiryToMs(env.jwt.refreshTokenExpiresIn);

  const result = await AuthServices.loginUser(req.body);
  const { refreshToken, accessToken } = result;

  res.cookie("accessToken", accessToken, getCookieOptions(accessTokenMaxAge));
  res.cookie(
    "refreshToken",
    refreshToken,
    getCookieOptions(refreshTokenMaxAge)
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Logged in successfully!",
    data: {
      needPasswordChange: result.needPasswordChange,
    },
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;

  const accessTokenMaxAge = parseExpiryToMs(env.jwt.accessTokenExpiresIn);
  const refreshTokenMaxAge = parseExpiryToMs(env.jwt.refreshTokenExpiresIn);

  const result = await AuthServices.refreshToken(refreshToken);

  res.cookie(
    "accessToken",
    result.accessToken,
    getCookieOptions(accessTokenMaxAge)
  );
  res.cookie(
    "refreshToken",
    result.refreshToken,
    getCookieOptions(refreshTokenMaxAge)
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Access token generated successfully!",
    data: null,
  });
});

const changePassword = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const user = req.user;
    const result = await AuthServices.changePassword(user, req.body);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Password changed successfully!",
      data: result,
    });
  }
);

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  await AuthServices.forgotPassword(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password reset link sent to your email!",
    data: null,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const token = req.headers.authorization || "";

  await AuthServices.resetPassword(token, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password reset successfully!",
    data: null,
  });
});

const getMe = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const user = req.user;
    const result = await AuthServices.getMe(user);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User profile retrieved successfully!",
      data: result,
    });
  }
);

const logout = catchAsync(async (req: Request, res: Response) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Logged out successfully!",
    data: null,
  });
});

export const AuthController = {
  registerUser,
  verifyEmail,
  resendVerificationCode,
  loginUser,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
  getMe,
  logout,
};
