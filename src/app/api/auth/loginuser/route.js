import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/server/db";
import User from "@/lib/server/models/user.model";
import { env } from "@/lib/server/env";
import { findUserByEmail as findLocalUserByEmail } from "@/lib/server/storage/localStore";

export async function POST(req) {
  try {
    const dbReady = await connectMongo();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 },
      );
    }

    const user = dbReady
      ? await User.findOne({ email })
      : await findLocalUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 },
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 },
      );
    }

    const token = jwt.sign({ id: user._id, role: "user" }, env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        token,
        user,
      },
      { status: 200 },
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
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Login failed" },
      { status: 500 },
    );
  }
}
