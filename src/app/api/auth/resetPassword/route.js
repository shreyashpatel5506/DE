import bcrypt from "bcryptjs";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/server/db";
import User from "@/lib/server/models/user.model";
import {
  findUserByResetToken as findLocalUserByResetToken,
  resetUserPasswordById as resetLocalUserPasswordById,
} from "@/lib/server/storage/localStore";

export async function POST(req) {
  try {
    const dbReady = await connectMongo();
    const { token, password, email } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Reset token and new password are required",
        },
        { status: 400 },
      );
    }

    if (String(password).length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters" },
        { status: 422 },
      );
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const now = new Date();

    let user = null;

    if (dbReady) {
      const query = {
        passwordResetToken: hashedToken,
        passwordResetExpiresAt: { $gt: now },
      };

      user = email
        ? await User.findOne({
            ...query,
            email: String(email).toLowerCase().trim(),
          })
        : await User.findOne(query);
    } else {
      user = await findLocalUserByResetToken(hashedToken);
      if (user && email && user.email !== String(email).toLowerCase().trim()) {
        user = null;
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired reset link" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (dbReady) {
      await User.updateOne(
        { _id: user._id },
        {
          $set: { password: hashedPassword },
          $unset: {
            passwordResetToken: "",
            passwordResetExpiresAt: "",
          },
        },
      );
    } else {
      await resetLocalUserPasswordById(user._id, hashedPassword);
    }

    return NextResponse.json(
      { success: true, message: "Password reset successful. Please log in." },
      { status: 200 },
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to reset password" },
      { status: 500 },
    );
  }
}
