import { createTransport } from "nodemailer";

import { ENV } from "@/config/env";

const EMAIL_FROM_NAME = "Shuvo Flix";

function transportConfig() {
  const transporter = createTransport({
    host: ENV.SMTP_HOST,
    port: ENV.SMTP_PORT,
    secure: process.env.NODE_ENV !== "development",
    auth: {
      user: ENV.SMTP_USERNAME,
      pass: ENV.SMTP_PASSWORD,
    },
  });

  return transporter;
}

const transport = transportConfig();

export type EmailUser = {
  user: {
    name?: string;
    email: string;
  };
};

export type EmailOptions = {
  subject: string;
  html: string;
  text?: string;
};

export async function sendMail(options: EmailOptions & EmailUser) {
  const from = ENV.SMTP_FROM_EMAIL;
  await transport.sendMail({
    from: from ? `${EMAIL_FROM_NAME} <${from}>` : EMAIL_FROM_NAME,
    to: `${options.user.name} <${options.user.email}>`,
    ...options,
  });
}
