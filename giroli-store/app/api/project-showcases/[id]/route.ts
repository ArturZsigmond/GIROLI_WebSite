import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { r2Client, R2_BUCKET } from "@/lib/r2";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import { Category } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";

// GET single project showcase (public)
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const showcase = await prisma.projectShowcase.findUnique({
    where: { id },
    include: { images: true },
  });

  if (!showcase) {
    return NextResponse.json({ error: "Showcase not found" }, { status: 404 });
  }

  return NextResponse.json(showcase);
}

// PATCH update project showcase (admin only)
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const data = await req.json();

  const existingShowcase = await prisma.projectShowcase.findUnique({
    where: { id },
    include: { images: true },
  });

  if (!existingShowcase) {
    return NextResponse.json({ error: "Showcase not found" }, { status: 404 });
  }

  const keptImageUrls = Array.isArray(data.images) ? data.images : [];
  const imagesToDelete = existingShowcase.images.filter(
    (img) => !keptImageUrls.includes(img.url)
  );

  // Delete removed images from R2
  for (const img of imagesToDelete) {
    try {
      const fileName = img.url.split("/").pop();
      if (fileName) {
        await r2Client.send(
          new DeleteObjectCommand({
            Bucket: R2_BUCKET,
            Key: fileName,
          })
        );
      }
    } catch (err) {
      console.error(`Failed to delete R2 file ${img.url}:`, err);
    }
  }

  const updated = await prisma.projectShowcase.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      category: data.category,
      images: {
        deleteMany: {
          id: {
            notIn: existingShowcase.images
              .filter((img) => keptImageUrls.includes(img.url))
              .map((img) => img.id),
          },
        },
        create: data.newImages?.map((url: string) => ({ url })) || [],
      },
    },
    include: { images: true },
  });

  return NextResponse.json(updated);
}

// DELETE project showcase (admin only)
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const showcase = await prisma.projectShowcase.findUnique({
    where: { id },
    include: { images: true },
  });

  if (!showcase) {
    return NextResponse.json({ error: "Showcase not found" }, { status: 404 });
  }

  // Delete all images from R2
  for (const img of showcase.images) {
    try {
      const fileName = img.url.split("/").pop();
      if (fileName) {
        await r2Client.send(
          new DeleteObjectCommand({
            Bucket: R2_BUCKET,
            Key: fileName,
          })
        );
      }
    } catch (err) {
      console.error(`Failed to delete R2 file ${img.url}:`, err);
    }
  }

  await prisma.projectShowcase.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}

