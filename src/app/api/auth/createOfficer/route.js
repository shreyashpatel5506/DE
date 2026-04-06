import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/server/db";
import Officer from "@/lib/server/models/officer.model";
import { env } from "@/lib/server/env";
import {
  createOfficer as createLocalOfficer,
  findOfficerByEmail as findLocalOfficerByEmail,
} from "@/lib/server/storage/localStore";

export async function POST(req) {
  try {
    const dbReady = await connectMongo();
    const { email, userName, password } = await req.json();

    if (!email || !userName || !password) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 },
      );
    }

    const existingOfficer = dbReady
      ? await Officer.findOne({ email })
      : await findLocalOfficerByEmail(email);
    if (existingOfficer) {
      return NextResponse.json(
        { success: false, message: "Officer already exists with this email" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);

    const newOfficer = dbReady
      ? await Officer.create({ email, userName, password: hashedPassword })
      : await createLocalOfficer({ email, userName, password: hashedPassword });

    const token = jwt.sign(
      { id: newOfficer._id, role: "officer" },
      env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    const response = NextResponse.json(
      {
        success: true,
        message: "Officer created successfully",
        officer: {
          id: newOfficer._id,
          email: newOfficer.email,
          userName: newOfficer.userName,
          role: "officer",
        },
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
    console.error("Officer creation error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create officer" },
      { status: 500 },
    );
  }
}
