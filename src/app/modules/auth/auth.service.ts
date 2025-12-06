import { UserRole, UserStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import { env } from "../../../config/env";
import { jwtHelpers } from "../../../helpers/jwtHelpers";
import prisma from "../../../shared/prisma";
import ApiError from "../../errors/ApiError";
import { IAuthUser } from "../../interfaces/common";
import emailSender from "./emailSender";

interface IRegisterPayload {
  email: string;
  password: string;
  fullName: string;
  contactNumber?: string;
  bio?: string;
  currentLocation?: string;
  travelInterests?: string[];
  visitedCountries?: string[];
}

const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const registerUser = async (payload: IRegisterPayload) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "User already exists with this email!"
    );
  }

  const hashedPassword = await bcrypt.hash(
    payload.password,
    parseInt(env.bcryptSaltRound)
  );

  const verificationCode = generateVerificationCode();
  const codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  const newUser = await prisma.user.create({
    data: {
      email: payload.email,
      password: hashedPassword,
      fullName: payload.fullName,
      role: UserRole.USER,
      isVerified: false,
      contactNumber: payload.contactNumber,
      bio: payload.bio,
      currentLocation: payload.currentLocation,
      travelInterests: payload.travelInterests || [],
      visitedCountries: payload.visitedCountries || [],
      verificationCode: {
        create: {
          code: verificationCode,
          expiresAt: codeExpiresAt,
        },
      },
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isVerified: true,
      createdAt: true,
    },
  });

  await emailSender({
    email: payload.email,
    subject: "Verify Your Email Address",
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Verify Your Email Address</h2>
      <p>Dear ${payload.fullName},</p>
      <p>Thank you for registering with Travel Buddy! Please use the verification code below to verify your email address:</p>
      <div style="text-align: center; margin: 30px 0;">
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 10px; display: inline-block;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4CAF50;">
            ${verificationCode}
          </span>
        </div>
      </div>
      <p style="color: #666; font-size: 14px;">
        This code will expire in 10 minutes. If you didn't create an account, please ignore this email.
      </p>
      <p>Best regards,<br>Travel Buddy Team</p>
    </div>
    `,
  });

  return newUser;
};

const verifyEmail = async (payload: { email: string; code: string }) => {
  const userData = await prisma.user.findFirst({
    where: {
      email: payload.email,
      isDeleted: false,
    },
    include: {
      verificationCode: true,
    },
  });

  if (!userData) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }

  if (userData.isVerified) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email is already verified!");
  }

  if (!userData.verificationCode) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Verification code not found. Please request a new code."
    );
  }

  if (new Date() > userData.verificationCode.expiresAt) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Verification code has expired. Please request a new code."
    );
  }

  if (userData.verificationCode.code !== payload.code) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid verification code!");
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userData.id },
      data: { isVerified: true },
    }),
    prisma.verificationCode.delete({
      where: { id: userData.verificationCode.id },
    }),
  ]);

  return { message: "Email verified successfully!" };
};

const resendVerificationCode = async (payload: { email: string }) => {
  const userData = await prisma.user.findFirst({
    where: {
      email: payload.email,
      isDeleted: false,
    },
  });

  if (!userData) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }

  if (userData.isVerified) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email is already verified!");
  }

  const verificationCode = generateVerificationCode();
  const codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.verificationCode.upsert({
    where: { userId: userData.id },
    update: {
      code: verificationCode,
      expiresAt: codeExpiresAt,
    },
    create: {
      userId: userData.id,
      code: verificationCode,
      expiresAt: codeExpiresAt,
    },
  });

  await emailSender({
    email: payload.email,
    subject: "Your New Verification Code",
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Your New Verification Code</h2>
      <p>Dear ${userData.fullName},</p>
      <p>Here is your new verification code:</p>
      <div style="text-align: center; margin: 30px 0;">
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 10px; display: inline-block;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4CAF50;">
            ${verificationCode}
          </span>
        </div>
      </div>
      <p style="color: #666; font-size: 14px;">
        This code will expire in 10 minutes. If you didn't request this, please ignore this email.
      </p>
      <p>Best regards,<br>Travel Buddy Team</p>
    </div>
    `,
  });

  return { message: "Verification code sent successfully!" };
};

const loginUser = async (payload: { email: string; password: string }) => {
  const userData = await prisma.user.findFirst({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
      isDeleted: false,
    },
  });

  if (!userData) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }

  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.password,
    userData.password
  );

  if (!isCorrectPassword) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid credentials!");
  }

  if (userData.role === UserRole.USER && !userData.isVerified) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Please verify your email before logging in."
    );
  }

  const accessToken = jwtHelpers.generateToken(
    {
      id: userData.id,
      email: userData.email,
      role: userData.role,
    },
    env.jwt.accessTokenSecret as Secret,
    env.jwt.accessTokenExpiresIn
  );

  const refreshToken = jwtHelpers.generateToken(
    {
      id: userData.id,
      email: userData.email,
      role: userData.role,
    },
    env.jwt.refreshTokenSecret as Secret,
    env.jwt.refreshTokenExpiresIn
  );

  return {
    accessToken,
    refreshToken,
    needPasswordChange: userData.needPasswordChange,
  };
};

const refreshToken = async (token: string) => {
  let decodedData;
  try {
    decodedData = jwtHelpers.verifyToken(
      token,
      env.jwt.refreshTokenSecret as Secret
    );
  } catch (err) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid or expired token!");
  }

  const userData = await prisma.user.findFirst({
    where: {
      email: decodedData.email,
      status: UserStatus.ACTIVE,
      isDeleted: false,
    },
  });

  if (!userData) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }

  const accessToken = jwtHelpers.generateToken(
    {
      id: userData.id,
      email: userData.email,
      role: userData.role,
    },
    env.jwt.accessTokenSecret as Secret,
    env.jwt.accessTokenExpiresIn
  );

  const newRefreshToken = jwtHelpers.generateToken(
    {
      id: userData.id,
      email: userData.email,
      role: userData.role,
    },
    env.jwt.refreshTokenSecret as Secret,
    env.jwt.refreshTokenExpiresIn
  );

  return {
    accessToken,
    refreshToken: newRefreshToken,
    needPasswordChange: userData.needPasswordChange,
  };
};

const changePassword = async (
  user: IAuthUser,
  payload: { oldPassword: string; newPassword: string }
) => {
  const userData = await prisma.user.findFirst({
    where: {
      email: user?.email,
      status: UserStatus.ACTIVE,
      isDeleted: false,
    },
  });

  if (!userData) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }

  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.oldPassword,
    userData.password
  );

  if (!isCorrectPassword) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Current password is incorrect!"
    );
  }

  const hashedPassword: string = await bcrypt.hash(
    payload.newPassword,
    parseInt(env.bcryptSaltRound)
  );

  await prisma.user.update({
    where: {
      id: userData.id,
    },
    data: {
      password: hashedPassword,
      needPasswordChange: false,
    },
  });

  return {
    message: "Password changed successfully!",
  };
};

const forgotPassword = async (payload: { email: string }) => {
  const userData = await prisma.user.findFirst({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
      isDeleted: false,
    },
  });

  if (!userData) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found with this email!");
  }

  const resetPassToken = jwtHelpers.generateToken(
    { id: userData.id, email: userData.email, role: userData.role },
    env.jwt.resetPassSecret as Secret,
    env.jwt.resetPassTokenExpiresIn
  );

  const resetPassLink =
    env.resetPasswordUrl + `?userId=${userData.id}&token=${resetPassToken}`;

  await emailSender({
    email: userData.email,
    subject: "Password Reset Request",
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>Dear ${userData.fullName},</p>
      <p>You have requested to reset your password. Click the button below to proceed:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetPassLink}"
           style="background-color: #4CAF50; color: white; padding: 14px 28px;
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">
        This link will expire in 1 hour. If you didn't request this, please ignore this email.
      </p>
      <p>Best regards,<br>Travel Buddy Team</p>
    </div>
    `,
  });
};

const resetPassword = async (
  token: string,
  payload: { id: string; password: string }
) => {
  const userData = await prisma.user.findFirst({
    where: {
      id: payload.id,
      status: UserStatus.ACTIVE,
      isDeleted: false,
    },
  });

  if (!userData) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }

  try {
    jwtHelpers.verifyToken(token, env.jwt.resetPassSecret as Secret);
  } catch (error) {
    throw new ApiError(httpStatus.FORBIDDEN, "Invalid or expired reset token!");
  }

  const hashedPassword = await bcrypt.hash(
    payload.password,
    parseInt(env.bcryptSaltRound)
  );

  await prisma.user.update({
    where: {
      id: payload.id,
    },
    data: {
      password: hashedPassword,
      needPasswordChange: false,
    },
  });
};

const getMe = async (user: IAuthUser) => {
  const userData = await prisma.user.findFirst({
    where: {
      email: user?.email,
      status: UserStatus.ACTIVE,
      isDeleted: false,
    },
    select: {
      id: true,
      email: true,
      role: true,
      fullName: true,
      avatar: true,
      contactNumber: true,
      bio: true,
      dateOfBirth: true,
      gender: true,
      currentLocation: true,
      travelInterests: true,
      visitedCountries: true,
      isVerified: true,
      hasVerifiedBadge: true,
      status: true,
      needPasswordChange: true,
      createdAt: true,
      updatedAt: true,
      subscription: {
        select: {
          id: true,
          plan: true,
          status: true,
          startDate: true,
          endDate: true,
        },
      },
    },
  });

  if (!userData) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }

  return userData;
};

export const AuthServices = {
  registerUser,
  verifyEmail,
  resendVerificationCode,
  loginUser,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
  getMe,
};
