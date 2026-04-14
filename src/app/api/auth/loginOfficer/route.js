import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { env } from "@/lib/server/env";

const ALLOWED_OFFICER_EMAILS = [
  "commissioner@city.gov",
  "admin@city.gov",
  "operations@city.gov",
  "publicworks@city.gov",
];

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 },
      );
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const isAllowedOfficerEmail =
      ALLOWED_OFFICER_EMAILS.includes(normalizedEmail);

    if (!isAllowedOfficerEmail) {
      return NextResponse.json(
        { success: false, message: "Unauthorized officer email" },
        { status: 403 },
      );
    }

    const officer = {
      _id: `officer-${normalizedEmail}`,
      email: normalizedEmail,
      userName: normalizedEmail.split("@")[0],
      role: "officer",
    };
    const officerId = `officer-${normalizedEmail}`;

    const token = jwt.sign({ id: officerId, role: "officer" }, env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "Officer login successful",
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
