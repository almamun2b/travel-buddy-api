import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import { IPaymentData } from "./ssl.interface";

// Note: SSL Commerz is not used in this project - using Stripe instead
// These functions are kept for reference but will throw an error if called

const initPayment = async (_paymentData: IPaymentData) => {
  throw new ApiError(
    httpStatus.NOT_IMPLEMENTED,
    "SSL Commerz payment is not configured. Use Stripe payment instead."
  );
};

const validatePayment = async (_payload: any) => {
  throw new ApiError(
    httpStatus.NOT_IMPLEMENTED,
    "SSL Commerz payment validation is not configured. Use Stripe payment instead."
  );
};

export const SSLService = {
  initPayment,
  validatePayment,
};
