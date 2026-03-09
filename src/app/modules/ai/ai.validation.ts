import { z } from "zod";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1),
});

const chatSchema = z.object({
  body: z.object({
    message: z.string({ error: "Message is required" }).min(1, "Message cannot be empty").max(2000, "Message is too long"),
    conversationHistory: z.array(messageSchema).optional().default([]),
  }),
});

export const AIValidation = { chatSchema };
