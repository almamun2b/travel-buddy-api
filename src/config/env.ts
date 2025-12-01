import dotenv from "dotenv";
import httpStatus from "http-status";
import ApiError from "../app/errors/ApiError";

interface Env {
  nodeEnv: "development" | "production";
  port: string;
  databaseUrl: string;
  clientUrl: string;
  bcryptSaltRound: string;
  superAdmin: {
    email: string;
    password: string;
    contactNumber: string;
    fullName: string;
  };
  cloudinary: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  };
  jwt: {
    accessTokenSecret: string;
    accessTokenExpiresIn: string;
    refreshTokenSecret: string;
    refreshTokenExpiresIn: string;
    resetPassSecret: string;
    resetPassTokenExpiresIn: string;
  };
  stripe: {
    secretKey: string;
    webhookSecret: string;
  };
  openRouterApiKey: string;
  resetPasswordUrl: string;
  emailSender: {
    email: string;
    appPass: string;
  };
}

dotenv.config();

const getEnvVar = (name: string) => {
  const value = process.env[name];
  if (!value) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Environment variable ${name} is required but was not provided`
    );
  }
  return value;
};

const env: Env = {
  nodeEnv: getEnvVar("NODE_ENV") as "development" | "production",
  port: getEnvVar("PORT"),
  databaseUrl: getEnvVar("DATABASE_URL"),
  clientUrl: getEnvVar("CLIENT_URL"),
  bcryptSaltRound: getEnvVar("BCRYPT_SALT_ROUND"),
  openRouterApiKey: getEnvVar("OPEN_ROUTER_API_KEY"),
  resetPasswordUrl: getEnvVar("RESET_PASSWORD_URL"),
  superAdmin: {
    email: getEnvVar("SUPER_ADMIN_EMAIL"),
    password: getEnvVar("SUPER_ADMIN_PASSWORD"),
    contactNumber: getEnvVar("SUPER_ADMIN_CONTACT_NUMBER"),
    fullName: getEnvVar("SUPER_ADMIN_FULL_NAME"),
  },
  cloudinary: {
    cloudName: getEnvVar("CLOUDINARY_CLOUD_NAME"),
    apiKey: getEnvVar("CLOUDINARY_API_KEY"),
    apiSecret: getEnvVar("CLOUDINARY_API_SECRET"),
  },
  jwt: {
    accessTokenSecret: getEnvVar("JWT_ACCESS_TOKEN_SECRET"),
    accessTokenExpiresIn: getEnvVar("JWT_ACCESS_TOKEN_EXPIRES_IN"),
    refreshTokenSecret: getEnvVar("JWT_REFRESH_TOKEN_SECRET"),
    refreshTokenExpiresIn: getEnvVar("JWT_REFRESH_TOKEN_EXPIRES_IN"),
    resetPassSecret: getEnvVar("JWT_RESET_PASS_TOKEN_SECRET"),
    resetPassTokenExpiresIn: getEnvVar("JWT_RESET_PASS_TOKEN_EXPIRES_IN"),
  },
  stripe: {
    secretKey: getEnvVar("STRIPE_SECRET_KEY"),
    webhookSecret: getEnvVar("STRIPE_WEBHOOK_SECRET"),
  },
  emailSender: {
    email: getEnvVar("EMAIL_SENDER_EMAIL"),
    appPass: getEnvVar("EMAIL_SENDER_APP_PASS"),
  },
};

export { env };
