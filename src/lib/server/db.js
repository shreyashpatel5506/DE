import mongoose from "mongoose";
import { env } from "./env";

let connectionState = "disconnected";

export async function connectMongo() {
  if (!env.MONGODB_URI) return false;
  if (connectionState === "connected") return true;

  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    connectionState = "connected";
    return true;
  } catch (error) {
    connectionState = "failed";
    console.warn(
      "MongoDB unavailable, using local fallback store:",
      error.message,
    );
    return false;
  }
}

export function isObjectId(value) {
  return mongoose.Types.ObjectId.isValid(String(value));
}
