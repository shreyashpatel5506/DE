import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/server/db";
import Otp from "@/lib/server/models/otp.model";
import {
  deleteOtp as deleteLocalOtp,
  findOtp as findLocalOtp,
} from "@/lib/server/storage/localStore";

export async function POST(req) {
  try {
    const dbReady = await connectMongo();
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: "Email and OTP required" },
        { status: 400 },
      );
    }

    const record = dbReady
      ? await Otp.findOne({ email, otp })
      : await findLocalOtp(email, otp);
    if (!record) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired OTP" },
        { status: 400 },
      );
    }

    if (dbReady) {
      await Otp.deleteOne({ _id: record._id });
    } else {
      await deleteLocalOtp(email, otp);
    }

    return NextResponse.json(
      { success: true, message: "Email verified successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "OTP verification failed" },
      { status: 500 },
    );
  }
}
