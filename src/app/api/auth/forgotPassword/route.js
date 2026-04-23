import crypto from "crypto";
import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/server/db";
import User from "@/lib/server/models/user.model";
import { env } from "@/lib/server/env";
import {
  findUserByEmail as findLocalUserByEmail,
  setUserResetToken as setLocalUserResetToken,
} from "@/lib/server/storage/localStore";
import { sendBrevoEmail } from "@/lib/server/brevo";
import { getPasswordResetEmailTemplate } from "@/lib/server/emailTemplates";

function makeResetLink(email, token) {
  const url = new URL(env.APP_BASE_URL);
  url.searchParams.set("view", "citizen");
  url.searchParams.set("authMode", "reset");
  url.searchParams.set("email", email);
  url.searchParams.set("token", token);
  return url.toString();
}

export async function POST(req) {
  try {
    const dbReady = await connectMongo();

    if (!dbReady && env.NODE_ENV === "production") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Database connection failed in production. Please set valid MONGODB_URI in Vercel environment variables.",
        },
        { status: 503 },
      );
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 },
      );
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const user = dbReady
      ? await User.findOne({ email: normalizedEmail })
      : await findLocalUserByEmail(normalizedEmail);

    // Always return success to avoid leaking account existence.
    if (!user) {
      return NextResponse.json(
        {
          success: true,
          message: "If this email is registered, a reset link has been sent.",
        },
        { status: 200 },
      );
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    if (dbReady) {
      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            passwordResetToken: hashedToken,
            passwordResetExpiresAt: expiresAt,
          },
        },
      );
    } else {
      await setLocalUserResetToken(
        normalizedEmail,
        hashedToken,
        expiresAt.toISOString(),
      );
    }

    const resetUrl = makeResetLink(normalizedEmail, rawToken);

    try {
      await sendBrevoEmail({
        to: normalizedEmail,
        subject: "🔐 Reset your CivicReport password",
        htmlContent: getPasswordResetEmailTemplate({
          resetUrl,
          minutes: 30,
        }),
      });
    } catch (emailError) {
      if (dbReady) {
        await User.updateOne(
          { _id: user._id },
          {
            $unset: {
              passwordResetToken: "",
              passwordResetExpiresAt: "",
            },
          },
        );
      } else {
        await setLocalUserResetToken(normalizedEmail, null, null);
      }

      return NextResponse.json(
        {
          success: false,
          message: emailError?.message || "Failed to send reset email",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "If this email is registered, a reset link has been sent.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process forgot password request" },
      { status: 500 },
    );
  }
}
