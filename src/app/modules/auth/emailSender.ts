import nodemailer from "nodemailer";
import { env } from "../../../config/env";

const emailSender = async ({
  email,
  html,
  subject,
}: {
  email: string;
  html: string;
  subject: string;
}) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: env.emailSender.email,
      pass: env.emailSender.appPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  await transporter.sendMail({
    from: `"Travel Buddy" <${env.emailSender.email}>`,
    to: email,
    subject: subject,
    html,
  });
};

export default emailSender;
