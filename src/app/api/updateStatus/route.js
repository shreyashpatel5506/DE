import { NextResponse } from "next/server";
import { connectMongo, isObjectId } from "@/lib/server/db";
import Post from "@/lib/server/models/post.model";
import { updatePostById as updateLocalPostById } from "@/lib/server/storage/localStore";
import { sendBrevoEmail } from "@/lib/server/brevo";

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
    const { status } = await req.json();

    if (!postId || !status) {
      return NextResponse.json(
        { success: false, message: "postId and status required" },
        { status: 400 },
      );
    }

    const allowedStatus = ["Pending", "In Progress", "Resolved", "Verified"];
    if (!allowedStatus.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status value" },
        { status: 422 },
      );
    }

    const useMongoPost = dbReady && isObjectId(postId);
    const post = useMongoPost
      ? await Post.findByIdAndUpdate(postId, { status }, { new: true })
      : await updateLocalPostById(postId, (current) => ({
          ...current,
          status,
        }));

    if (!post) {
      return NextResponse.json(
        { success: false, message: "Post not found" },
        { status: 404 },
      );
    }

    const recipientEmail = post.createdUser?.email;
    if (recipientEmail) {
      try {
        await sendBrevoEmail({
          to: recipientEmail,
          subject: `Issue status updated: ${status}`,
          htmlContent: `<p>Your reported issue <strong>${post.title}</strong> is now <strong>${status}</strong>.</p>`,
        });
      } catch (error) {
        console.warn("Status update email failed:", error.message);
      }
    }

    return NextResponse.json(
      { success: true, message: "Status updated successfully", data: post },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update status error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
