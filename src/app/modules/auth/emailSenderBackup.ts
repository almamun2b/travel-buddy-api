// emailService.js
import axios from "axios";
import { env } from "../../../config/env";

const emailSender = async ({
  email,
  html,
  subject,
}: {
  email: string;
  html: string;
  subject: string;
}): Promise<any> => {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Travel Buddy",
          email: env.bravo.email,
        },
        to: [
          {
            email: email,
          },
        ],
        subject: subject,
        htmlContent: html,
      },
      {
        headers: {
          accept: "application/json",
          "api-key": env.bravo.apiKey,
          "content-type": "application/json",
        },
      }
    );

    return response;
  } catch (error: any) {
    console.error("Error sending email:", error?.response?.data || error.message);
    throw error;
  }
};

export default emailSender;