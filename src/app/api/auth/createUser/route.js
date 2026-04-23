import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/server/db";
import User from "@/lib/server/models/user.model";
import Otp from "@/lib/server/models/otp.model";
import { env } from "@/lib/server/env";
import {
  createUser as createLocalUser,
  deleteOtp as deleteLocalOtp,
  findOtp as findLocalOtp,
  findUserByEmail as findLocalUserByEmail,
} from "@/lib/server/storage/localStore";

export async function POST(req) {
  try {
    const dbReady = await connectMongo();
    const { email, password, userName, otp } = await req.json();

    if (!email || !password || !userName || !otp) {
      return NextResponse.json(
        {
          success: false,
          message: "Email, name, password and OTP are required",
        },
        { status: 400 },
      );
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const exists = dbReady
      ? await User.findOne({ email: normalizedEmail })
      : await findLocalUserByEmail(normalizedEmail);
    if (exists) {
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 409 },
      );
    }

    const otpRecord = dbReady
      ? await Otp.findOne({ email: normalizedEmail, otp, purpose: "signup" })
      : await findLocalOtp(normalizedEmail, otp, "signup");

    if (!otpRecord || new Date(otpRecord.expiresAt) < new Date()) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired OTP" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = dbReady
      ? await User.create({
          email: normalizedEmail,
          userName,
          password: hashedPassword,
          emailVerified: true,
        })
      : await createLocalUser({
          email: normalizedEmail,
          userName,
          password: hashedPassword,
          emailVerified: true,
        });

    if (dbReady) {
      await Otp.deleteOne({ _id: otpRecord._id });
    } else {
      await deleteLocalOtp(normalizedEmail, otp, "signup");
    }

    const token = jwt.sign({ id: user._id, role: "user" }, env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        user,
        token,
      },
      { status: 201 },
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, message: "User creation failed" },
      { status: 500 },
    );
  }
}
