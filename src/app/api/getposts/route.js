import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/server/db";
import Post from "@/lib/server/models/post.model";
import { listPosts as listLocalPosts } from "@/lib/server/storage/localStore";

export async function GET(req) {
  try {
    const dbReady = await connectMongo();
    const searchParams = req.nextUrl.searchParams;

    const page = Number.parseInt(searchParams.get("page") || "1", 10) || 1;
    const limit = Number.parseInt(searchParams.get("limit") || "10", 10) || 10;
    const skip = (page - 1) * limit;

    const allPosts = dbReady ? null : await listLocalPosts();
    const totalPosts = dbReady ? await Post.countDocuments() : allPosts.length;
    const posts = dbReady
      ? await Post.find().sort({ createdAt: -1 }).skip(skip).limit(limit)
      : allPosts.slice(skip, skip + limit);

    return NextResponse.json(
      {
        success: true,
        totalPosts,
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        count: posts.length,
        posts,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Fetch posts error:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching posts" },
      { status: 500 },
    );
  }
}
