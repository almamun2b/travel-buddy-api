import axios from "axios";
import { env } from "../../../config/env";

interface IMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

const SYSTEM_PROMPT = `You are TravelBuddy AI, a friendly and knowledgeable travel assistant for the Travel Buddy & Meetup platform. 
You help users with:
- Discovering travel destinations and planning trips
- Finding travel companions and understanding how the travel buddy matching system works
- Getting travel tips, visa info, packing advice, and local culture insights
- Budget planning and estimating travel costs
- Understanding platform features like travel plans, requests, and reviews

Always be helpful, concise, and enthusiastic about travel. If asked about something unrelated to travel or the platform, politely redirect the conversation back to travel topics.`;

const chat = async (
  message: string,
  conversationHistory: IMessage[] = []
): Promise<string> => {
  const messages: IMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...conversationHistory,
    { role: "user", content: message },
  ];

  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "meta-llama/llama-3.1-8b-instruct:free",
      messages,
    },
    {
      headers: {
        Authorization: `Bearer ${env.openRouterApiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": env.clientUrl,
        "X-Title": "Travel Buddy AI Assistant",
      },
    }
  );

  const reply: string = response.data.choices[0].message.content;
  return reply;
};

export const AIService = { chat };
