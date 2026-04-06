import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/server/db";
import User from "@/lib/server/models/user.model";
import { env } from "@/lib/server/env";
import {
  createUser as createLocalUser,
  findUserByEmail as findLocalUserByEmail,
} from "@/lib/server/storage/localStore";

export async function POST(req) {
  try {
    const dbReady = await connectMongo();
    const { email, password, userName } = await req.json();

    if (!email || !password || !userName) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 },
      );
    }

    const exists = dbReady
      ? await User.findOne({ email })
      : await findLocalUserByEmail(email);
    if (exists) {
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = dbReady
      ? await User.create({
          email,
          userName,
          password: hashedPassword,
          emailVerified: true,
        })
      : await createLocalUser({
          email,
          userName,
          password: hashedPassword,
          emailVerified: true,
        });

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
