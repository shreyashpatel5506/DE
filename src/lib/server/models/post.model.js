import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    department: { type: String, required: true },
    category: {
      type: String,
      enum: [
        "Roads & Traffic",
        "Water",
        "Electricity",
        "Garbage",
        "Emergency",
        "Other",
        "Water & Sewerage",
        "Street Lighting",
        "Waste Management",
        "Parks & Recreation",
        "Public Transport",
      ],
      default: "Other",
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved", "Verified"],
      default: "Pending",
    },
    location: { type: String, required: true },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Low",
    },
    imageUrl: { type: String, default: "" },
    videoUrl: { type: String, default: "" },
    likesCount: { type: Number, default: 0 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdUser: {
      _id: { type: mongoose.Schema.Types.Mixed, required: true },
      userName: { type: String, required: true },
      email: { type: String, required: true },
    },
    comments: [
      {
        text: { type: String, required: true },
        user: {
          _id: { type: mongoose.Schema.Types.Mixed },
          userName: String,
          email: String,
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    commentsCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
  },
  { timestamps: true },
);

postSchema.pre("validate", async function preValidate() {
  if (!this.imageUrl && !this.videoUrl) {
    throw new Error("Either image or video is required");
  }
});

const Post = mongoose.models.Post || mongoose.model("Post", postSchema);

export default Post;
