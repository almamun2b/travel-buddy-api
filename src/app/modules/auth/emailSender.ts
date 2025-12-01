import nodemailer from "nodemailer";
import { env } from "../../../config/env";

const emailSender = async (email: string, html: string) => {
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
    subject: "Reset Password Link",
    html,
  });
};

export default emailSender;
