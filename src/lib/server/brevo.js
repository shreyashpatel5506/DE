import axios from "axios";
import { env } from "./env";

export async function sendBrevoEmail({ to, subject, htmlContent }) {
  if (!env.BREVO_API_KEY || !env.BREVO_SENDER) return false;

  await axios.post(
    "https://api.brevo.com/v3/smtp/email",
    {
      sender: {
        email: env.BREVO_SENDER,
        name: "Civic Infrastructure Management",
      },
      to: [{ email: to }],
      subject,
      htmlContent,
    },
    {
      headers: {
        "api-key": env.BREVO_API_KEY,
        "Content-Type": "application/json",
      },
    },
  );

  return true;
}
