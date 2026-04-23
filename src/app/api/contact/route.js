import { NextResponse } from "next/server";
import { env } from "@/lib/server/env";
import { sendBrevoEmail } from "@/lib/server/brevo";
import {
  getContactAdminEmailTemplate,
  getContactUserAckEmailTemplate,
} from "@/lib/server/emailTemplates";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req) {
  try {
    const { name, email, phone, inquiryType, subject, message } =
      await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: "Name, email and message are required" },
        { status: 400 },
      );
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 422 },
      );
    }

    const receiverEmail =
      env.CONTACT_RECEIVER_EMAIL || "shreyashpatel5506@gmail.com";

    await sendBrevoEmail({
      to: receiverEmail,
      subject: `📩 Contact Form: ${subject || inquiryType || "New Inquiry"}`,
      htmlContent: getContactAdminEmailTemplate({
        name: String(name).trim(),
        email: normalizedEmail,
        phone: phone ? String(phone).trim() : "",
        inquiryType: inquiryType ? String(inquiryType).trim() : "",
        subject: subject ? String(subject).trim() : "",
        message: String(message).trim(),
      }),
    });

    await sendBrevoEmail({
      to: normalizedEmail,
      subject: "✅ We received your message | CivicReport",
      htmlContent: getContactUserAckEmailTemplate({
        name: String(name).trim(),
      }),
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Your message has been sent. Our team will contact you as soon as possible.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Contact form email error:", error?.message || error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to send contact request",
      },
      { status: 500 },
    );
  }
}
