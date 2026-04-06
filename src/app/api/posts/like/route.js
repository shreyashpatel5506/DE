import { NextResponse } from "next/server";
import { connectMongo, isObjectId } from "@/lib/server/db";
import Post from "@/lib/server/models/post.model";
import {
  findPostById as findLocalPostById,
  updatePostById as updateLocalPostById,
} from "@/lib/server/storage/localStore";

export async function POST(req) {
  try {
    const dbReady = await connectMongo();
    const id = req.nextUrl.searchParams.get("id");
    const { userId } = await req.json();

    if (!id || !userId) {
      return NextResponse.json(
        { success: false, message: "ID or UserID missing" },
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

    const currentLikes = post.likes || [];
    const isLiked = currentLikes.some(
      (uid) => uid.toString() === userId.toString(),
    );

    if (useMongoPost && !isObjectId(userId)) {
      return NextResponse.json(
        { success: false, message: "Invalid userId for this post type" },
        { status: 400 },
      );
    }

    const update = isLiked
      ? { $pull: { likes: userId }, $inc: { likesCount: -1 } }
      : { $addToSet: { likes: userId }, $inc: { likesCount: 1 } };

    const updatedPost = useMongoPost
      ? await Post.findByIdAndUpdate(id, update, { new: true })
      : await updateLocalPostById(id, (current) => {
          const likes = new Set(current.likes || []);
          if (isLiked) likes.delete(String(userId));
          else likes.add(String(userId));

          return {
            ...current,
            likes: Array.from(likes),
            likesCount: likes.size,
          };
        });

    return NextResponse.json(
      {
        success: true,
        message: isLiked ? "Unliked successfully" : "Liked successfully",
        likesCount: updatedPost.likesCount,
        isLiked: !isLiked,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Toggle Like Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
