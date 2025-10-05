import { ENV } from "@/config/env";

type SMSRecipient = { phone: string; serviceName: string };

export async function sendExpirationSMS({ phone, serviceName }: SMSRecipient): Promise<void> {
  const message = `Your ${serviceName} subscription has expired. Please contact support.\nWhatsApp:  ${ENV.CONTACT_PHONE}\nEmail: ${ENV.CONTACT_EMAIL}`;
  const smsURL = `${ENV.SMS_API_URL}?api_key=${ENV.SMS_API_KEY}&type=text&number=${phone}&senderid=${ENV.SMS_SENDER_ID}&message=${encodeURIComponent(message)}`;
  try {
    const res = await fetch(smsURL, { method: "POST" });
    const data = await res.json();
    console.log("SMS API Response:", data);
  } catch (error) {
    console.error("Error sending SMS:", error);
  }
}
