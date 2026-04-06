import mongoose from "mongoose";

const officerSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    userName: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "officer" },
  },
  { timestamps: true },
);

const Officer =
  mongoose.models.Officer || mongoose.model("Officer", officerSchema);

export default Officer;
