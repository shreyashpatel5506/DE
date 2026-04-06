import { NextResponse } from "next/server";
import { connectMongo, isObjectId } from "@/lib/server/db";
import Post from "@/lib/server/models/post.model";
import { findPostById as findLocalPostById } from "@/lib/server/storage/localStore";

export async function GET(req) {
  try {
    const dbReady = await connectMongo();
    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Post ID is required" },
        { status: 400 },
      );
    }

    const useMongoPost = dbReady && isObjectId(id);
    const post = useMongoPost
      ? await Post.findById(id).select("comments commentsCount")
      : await findLocalPostById(id);

    if (!post) {
      return NextResponse.json(
        { success: false, message: "Post not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        commentsCount: post.commentsCount,
        comments: post.comments,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Error fetching comments" },
      { status: 500 },
    );
  }
}
