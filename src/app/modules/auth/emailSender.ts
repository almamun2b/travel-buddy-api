import { Resend } from "resend";
import { env } from "../../../config/env";

type SendEmailParams = {
  email: string; // to
  html: string;
  subject: string;
};

const resend = new Resend(env.emailSender.appPass);

const emailSender = async ({
  email,
  html,
  subject,
}: SendEmailParams) => {

  return resend.emails.send({
    from: `"Travel Buddy" <${env.emailSender.email}>`,
    to: email,
    subject,
    html,
  });

};

export default emailSender;
