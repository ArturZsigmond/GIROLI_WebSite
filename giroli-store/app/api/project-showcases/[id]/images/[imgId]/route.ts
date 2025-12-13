import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { r2Client, R2_BUCKET } from "@/lib/r2";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { requireAdmin } from "@/lib/auth";

// DELETE individual project showcase image
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string; imgId: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { imgId } = await context.params;

  const image = await prisma.projectShowcaseImage.findUnique({
    where: { id: imgId },
  });

  if (!image) {
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
  await prisma.projectShowcaseImage.delete({
    where: { id: imgId },
  });

  return NextResponse.json({ success: true });
}

