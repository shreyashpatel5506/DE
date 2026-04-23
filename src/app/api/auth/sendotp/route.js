import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/server/db";
import Otp from "@/lib/server/models/otp.model";
import User from "@/lib/server/models/user.model";
import {
  findUserByEmail as findLocalUserByEmail,
  saveOtp as saveLocalOtp,
} from "@/lib/server/storage/localStore";
import { sendBrevoEmail } from "@/lib/server/brevo";
import { getOtpEmailTemplate } from "@/lib/server/emailTemplates";

export async function POST(req) {
  try {
    const dbReady = await connectMongo();
    const { email, purpose = "signup" } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 422 },
      );
    }

    if (purpose !== "signup") {
      return NextResponse.json(
        { success: false, message: "Unsupported OTP purpose" },
        { status: 422 },
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = dbReady
      ? await User.findOne({ email: normalizedEmail })
      : await findLocalUserByEmail(normalizedEmail);
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User already exists with this email" },
        { status: 409 },
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    if (dbReady) {
      await Otp.deleteMany({ email: normalizedEmail, purpose });
      await Otp.create({
        email: normalizedEmail,
        otp,
        purpose,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });
    } else {
      await saveLocalOtp({
        email: normalizedEmail,
        otp,
        purpose,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      });
    }

    try {
      await sendBrevoEmail({
        to: normalizedEmail,
        subject: "🔐 Verify your email - OTP for CivicReport",
        htmlContent: getOtpEmailTemplate({ otp, minutes: 10 }),
      });
    } catch (error) {
      console.warn("Brevo send failed:", error.message);
    }

    return NextResponse.json(
      { success: true, message: "OTP sent successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Failed to send OTP" },
      { status: 500 },
    );
  }
}
