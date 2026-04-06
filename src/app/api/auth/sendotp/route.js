import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/server/db";
import Otp from "@/lib/server/models/otp.model";
import { saveOtp as saveLocalOtp } from "@/lib/server/storage/localStore";
import { sendBrevoEmail } from "@/lib/server/brevo";

export async function POST(req) {
  try {
    const dbReady = await connectMongo();
    const { email } = await req.json();

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

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    if (dbReady) {
      await Otp.deleteMany({ email });
      await Otp.create({
        email,
        otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });
    } else {
      await saveLocalOtp({
        email,
        otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      });
    }

    try {
      await sendBrevoEmail({
        to: email,
        subject: "🔐 Your OTP Code",
        htmlContent: `<h2>Your OTP is ${otp}</h2><p>Valid for 10 minutes</p>`,
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
