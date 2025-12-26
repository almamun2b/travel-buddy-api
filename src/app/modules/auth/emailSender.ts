import nodemailer from "nodemailer";
import { env } from "../../../config/env";

import axios from "axios";

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
  const now = Date.now();

  if (cachedToken && now < tokenExpiresAt) {
    return cachedToken;
  }

  const res = await axios.post(
    "https://api.sendpulse.com/oauth/access_token",
    {
      grant_type: "client_credentials",
      client_id: env.sendpulse.clientId,
      client_secret: env.sendpulse.clientSecret,
    }
  );

  cachedToken = res.data.access_token;
  tokenExpiresAt = now + res.data.expires_in * 1000;

  return cachedToken;
}

export async function emailSender({
  email,
  subject,
  html,
}: {
  email: string;
  subject: string;
  html: string;
}) {
  const token = await getAccessToken();

  return axios.post(
    "https://api.sendpulse.com/smtp/emails",
    {
      email: {
        html,
        subject,
        from: {
          name: env.sendpulse.fromName,
          email: env.sendpulse.fromEmail,
        },
        to: [{ email: email }],
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

// const emailSender = async ({
//   email,
//   html,
//   subject,
// }: {
//   email: string;
//   html: string;
//   subject: string;
// }) => {
//   const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 587,
//     secure: false,
//     auth: {
//       user: env.emailSender.email,
//       pass: env.emailSender.appPass,
//     },
//     tls: {
//       rejectUnauthorized: false,
//     },
//   });

//   await transporter.sendMail({
//     from: `"Travel Buddy" <${env.emailSender.email}>`,
//     to: email,
//     subject: subject,
//     html,
//   });
// };

export default emailSender;
