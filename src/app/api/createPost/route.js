import { NextResponse } from "next/server";
import { connectMongo, isObjectId } from "@/lib/server/db";
import Post from "@/lib/server/models/post.model";
import User from "@/lib/server/models/user.model";
import { uploadToCloudinary } from "@/lib/server/cloudinary";
import { env } from "@/lib/server/env";
import {
  createPost as createLocalPost,
  findUserById as findLocalUserById,
} from "@/lib/server/storage/localStore";

export async function POST(req) {
  try {
    const dbReady = await connectMongo();
    const formData = await req.formData();

    const title = formData.get("title");
    const description = formData.get("description");
    const department = formData.get("department");
    const category = formData.get("category");
    const location = formData.get("location");
    const userId = formData.get("userId");

    if (!title || !description || !department || !location || !userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Required fields (including userId) missing",
        },
        { status: 400 },
      );
    }

    const useMongoUser = dbReady && isObjectId(userId);
    const userFromDB = useMongoUser
      ? await User.findById(String(userId)).select("userName email")
      : await findLocalUserById(String(userId));

    if (!userFromDB) {
      return NextResponse.json(
        { success: false, message: "Invalid User ID. Post cannot be created." },
        { status: 404 },
      );
    }

    const imageFile = formData.get("image");
    const videoFile = formData.get("video");

    if (!imageFile && !videoFile) {
      return NextResponse.json(
        { success: false, message: "Image or video is required" },
        { status: 400 },
      );
    }

    let imageUrl = "";
    let videoUrl = "";
    const canUseCloudinary = Boolean(
      env.CLOUDINARY_CLOUD_NAME &&
      env.CLOUDINARY_API_KEY &&
      env.CLOUDINARY_API_SECRET,
    );

    if (
      imageFile &&
      typeof imageFile === "object" &&
      "arrayBuffer" in imageFile
    ) {
      if (dbReady && canUseCloudinary) {
        const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
        const imgResult = await uploadToCloudinary(imageBuffer);
        imageUrl = imgResult.url;
      } else {
        imageUrl = imageFile.name || "uploaded-image";
      }
    }

    if (
      videoFile &&
      typeof videoFile === "object" &&
      "arrayBuffer" in videoFile
    ) {
      if (dbReady && canUseCloudinary) {
        const videoBuffer = Buffer.from(await videoFile.arrayBuffer());
        const vidResult = await uploadToCloudinary(videoBuffer);
        videoUrl = vidResult.url;
      } else {
        videoUrl = videoFile.name || "uploaded-video";
      }
    }

    const useMongoPostWrite = dbReady && isObjectId(userFromDB._id);

    const post = useMongoPostWrite
      ? await Post.create({
          title: String(title),
          description: String(description),
          department: String(department),
          category: category ? String(category) : String(department),
          location: String(location),
          imageUrl,
          videoUrl,
          createdUser: {
            _id: userFromDB._id,
            userName: userFromDB.userName,
            email: userFromDB.email,
          },
        })
      : await createLocalPost({
          title: String(title),
          description: String(description),
          department: String(department),
          category: category ? String(category) : String(department),
          location: String(location),
          imageUrl,
          videoUrl,
          createdUser: {
            _id: userFromDB._id,
            userName: userFromDB.userName,
            email: userFromDB.email,
          },
        });

    return NextResponse.json(
      { success: true, message: "Post created successfully", post },
      { status: 201 },
    );
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Error when trying to create a post",
      },
      { status: 500 },
    );
  }
}
