import axios from "axios";
import { env } from "./env";

function clean(value) {
  if (typeof value !== "string") return value;
  return value.trim().replace(/^['\"]|['\"]$/g, "");
}

export async function sendBrevoEmail({ to, subject, htmlContent }) {
  const apiKey = clean(env.BREVO_API_KEY);
  const sender = clean(env.BREVO_SENDER);

  if (!apiKey || !sender) {
    throw new Error(
      "Brevo mail is not configured. Please set BREVO_API_KEY and BREVO_SENDER in .env",
    );
  }

  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          email: sender,
          name: "Civic Infrastructure Management",
        },
        to: [{ email: to }],
        subject,
        htmlContent,
      },
      {
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    const brevoMessage =
      error?.response?.data?.message ||
      error?.response?.data?.code ||
      error?.message ||
      "Unknown Brevo error";
    throw new Error(`Brevo API error: ${brevoMessage}`);
  }

  return true;
}
