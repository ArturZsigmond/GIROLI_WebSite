import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";
import { r2Client, R2_BUCKET } from "@/lib/r2";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string; imgId: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, imgId } = await context.params;

  try {
    // Get the image to delete
    const image = await prisma.productImage.findUnique({
      where: { id: imgId },
    });

    if (!image || image.productId !== id) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Delete from R2
    try {
      const fileName = image.url.split("/").pop();
      if (fileName) {
        await r2Client.send(
          new DeleteObjectCommand({
            Bucket: R2_BUCKET,
            Key: fileName,
          })
        );
      }
    } catch (err) {
      console.error(`Failed to delete R2 file ${image.url}:`, err);
    }

    // Delete from database
    await prisma.productImage.delete({
      where: { id: imgId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE image error:", err);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}

