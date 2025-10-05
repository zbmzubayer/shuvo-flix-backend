import React from "react";
import { renderToString } from "react-dom/server";

import { ENV } from "@/config/env";
import { sendMail, type EmailUser } from "@/email/mail.config";

type ExpirationEmailProps = EmailUser & {
  serviceName: string;
  expirationDate: string;
};

function ExpirationReminderEmail(props: ExpirationEmailProps): React.JSX.Element {
  return (
    <div>
      <h2>Subscription Expiration Pre-reminder</h2>
      <div>
        <p>Hi, {props.user.name}</p>
        <p>
          This is a reminder that your {props.serviceName} subscription will expire soon (
          {props.expirationDate}).
        </p>
        <p>Please contact support for renewal.</p>
        <br />
        <p>Best regards,</p>
        <p>
          <strong>ShuvoFlix Team</strong>
        </p>
        <strong>Contact Info</strong>
        <p>Whatsapp: {ENV.CONTACT_PHONE}</p>
        <p>Email: {ENV.CONTACT_EMAIL}</p>
      </div>
    </div>
  );
}

export async function sendExpirationReminderEmail(props: ExpirationEmailProps) {
  try {
    await sendMail({
      subject: `ShuvoFlix - ${props.serviceName} subscription expiration reminder`,
      user: props.user,
      html: renderToString(<ExpirationReminderEmail {...props} />),
    });
  } catch (error) {
    console.error(error);
  }
}
