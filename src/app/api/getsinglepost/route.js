import { NextResponse } from "next/server";
import { connectMongo, isObjectId } from "@/lib/server/db";
import Post from "@/lib/server/models/post.model";
import {
  findPostById as findLocalPostById,
  updatePostById as updateLocalPostById,
} from "@/lib/server/storage/localStore";

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
      ? await Post.findById(id)
      : await findLocalPostById(id);

    if (!post) {
      return NextResponse.json(
        { success: false, message: "Post not found" },
        { status: 404 },
      );
    }

    if (useMongoPost) {
      post.views += 1;
      await post.save();
      return NextResponse.json({ success: true, post }, { status: 200 });
    }

    const updated = await updateLocalPostById(id, (current) => ({
      ...current,
      views: (current.views || 0) + 1,
    }));
    return NextResponse.json({ success: true, post: updated }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Error fetching post" },
      { status: 500 },
    );
  }
}
