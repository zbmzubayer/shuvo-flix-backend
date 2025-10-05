import React from "react";
import { renderToString } from "react-dom/server";

import { ENV } from "@/config/env";
import { sendMail, type EmailUser } from "@/email/mail.config";

type ExpirationEmailProps = EmailUser & {
  serviceName: string;
  // expirationDate: string;
};

function ExpirationAlertEmail(props: ExpirationEmailProps): React.JSX.Element {
  return (
    <div>
      <h2>Subscription Expired</h2>
      <div>
        <p>Hi, {props.user.name}</p>
        <p>This is a reminder that your {props.serviceName} subscription has expired.</p>
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

export async function sendExpirationAlertEmail(props: ExpirationEmailProps) {
  try {
    await sendMail({
      subject: `ShuvoFlix - ${props.serviceName} subscription expired`,
      user: props.user,
      html: renderToString(<ExpirationAlertEmail {...props} />),
    });
  } catch (error) {
    console.error(error);
  }
}
