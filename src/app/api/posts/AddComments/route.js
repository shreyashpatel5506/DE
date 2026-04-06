import { NextResponse } from "next/server";
import { connectMongo, isObjectId } from "@/lib/server/db";
import Post from "@/lib/server/models/post.model";
import User from "@/lib/server/models/user.model";
import {
  findUserById as findLocalUserById,
  updatePostById as updateLocalPostById,
} from "@/lib/server/storage/localStore";

export async function POST(req) {
  try {
    const dbReady = await connectMongo();
    const postId = req.nextUrl.searchParams.get("id");
    const { text, userId } = await req.json();

    if (!postId || !text || !userId) {
      return NextResponse.json(
        { success: false, message: "Post ID, text, and userId are required" },
        { status: 400 },
      );
    }

    const useMongoUser = dbReady && isObjectId(userId);
    const userFromDB = useMongoUser
      ? await User.findById(String(userId)).select("userName email")
      : await findLocalUserById(String(userId));

    if (!userFromDB) {
      return NextResponse.json(
        { success: false, message: "Invalid User ID. User not found." },
        { status: 404 },
      );
    }

    const useMongoPost = dbReady && isObjectId(postId);

    const updatedPost = useMongoPost
      ? await Post.findByIdAndUpdate(
          postId,
          {
            $push: {
              comments: {
                text,
                user: {
                  _id: userFromDB._id,
                  userName: userFromDB.userName,
                  email: userFromDB.email,
                },
              },
            },
            $inc: { commentsCount: 1 },
          },
          { new: true },
        )
      : await updateLocalPostById(postId, (current) => ({
          ...current,
          comments: [
            ...(current.comments || []),
            {
              text,
              user: {
                _id: userFromDB._id,
                userName: userFromDB.userName,
                email: userFromDB.email,
              },
              createdAt: new Date().toISOString(),
            },
          ],
          commentsCount: (current.commentsCount || 0) + 1,
        }));

    return NextResponse.json(
      {
        success: true,
        message: "Comment added successfully",
        post: updatedPost,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Add Comment Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
