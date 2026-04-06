import { NextResponse } from "next/server";
import { connectMongo, isObjectId } from "@/lib/server/db";
import Post from "@/lib/server/models/post.model";
import { updatePostById as updateLocalPostById } from "@/lib/server/storage/localStore";

export async function PATCH(req) {
  try {
    const dbReady = await connectMongo();
    const role = req.headers.get("role");

    if (role !== "officer") {
      return NextResponse.json(
        { success: false, message: "Officers only" },
        { status: 403 },
      );
    }

    const postId = req.nextUrl.searchParams.get("id");
    const { priority } = await req.json();

    if (!postId || !priority) {
      return NextResponse.json(
        { success: false, message: "postId and priority required" },
        { status: 400 },
      );
    }

    const allowedPriority = ["Low", "Medium", "High", "Critical"];
    if (!allowedPriority.includes(priority)) {
      return NextResponse.json(
        { success: false, message: "Invalid priority value" },
        { status: 422 },
      );
    }

    const useMongoPost = dbReady && isObjectId(postId);
    const post = useMongoPost
      ? await Post.findByIdAndUpdate(postId, { priority }, { new: true })
      : await updateLocalPostById(postId, (current) => ({
          ...current,
          priority,
        }));

    if (!post) {
      return NextResponse.json(
        { success: false, message: "Post not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, message: "Priority updated successfully", data: post },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update priority error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
