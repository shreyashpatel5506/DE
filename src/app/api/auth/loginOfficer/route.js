import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/server/db";
import Officer from "@/lib/server/models/officer.model";
import { env } from "@/lib/server/env";
import { findOfficerByEmail as findLocalOfficerByEmail } from "@/lib/server/storage/localStore";

const STATIC_ADMIN_EMAIL = "admin@gmail.com";
const STATIC_ADMIN_PASSWORD = "123456789";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 },
      );
    }

    const isStaticAdmin =
      String(email).toLowerCase() === STATIC_ADMIN_EMAIL &&
      String(password) === STATIC_ADMIN_PASSWORD;

    let officer;
    let officerId;

    if (isStaticAdmin) {
      officer = {
        _id: "admin-static",
        email: STATIC_ADMIN_EMAIL,
        userName: "Admin",
        role: "officer",
      };
      officerId = "admin-static";
    } else {
      const dbReady = await connectMongo();
      officer = dbReady
        ? await Officer.findOne({ email })
        : await findLocalOfficerByEmail(email);

      if (!officer) {
        return NextResponse.json(
          { success: false, message: "No officer found with this email" },
          { status: 404 },
        );
      }

      const isValidPassword = await bcrypt.compare(password, officer.password);
      if (!isValidPassword) {
        return NextResponse.json(
          { success: false, message: "Invalid password" },
          { status: 401 },
        );
      }

      officerId = officer._id;
    }

    const token = jwt.sign({ id: officerId, role: "officer" }, env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const response = NextResponse.json(
      {
        success: true,
        message: isStaticAdmin
          ? "Admin login successful"
          : "Officer login successful",
        token,
        officer: {
          id: officerId,
          email: officer.email,
          userName: officer.userName,
          role: officer.role,
        },
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
    console.error("Officer login error:", error);
    return NextResponse.json(
      { success: false, message: "Officer login failed" },
      { status: 500 },
    );
  }
}
