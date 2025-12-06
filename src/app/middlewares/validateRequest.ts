import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";

const validateRequest =
  (schema: ZodType) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate req.body directly with flat schema (no body wrapper)
      req.body = await schema.parseAsync(req.body);
      return next();
    } catch (err) {
      next(err);
    }
  };

export default validateRequest;
