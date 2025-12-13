import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { r2Client, R2_BUCKET } from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import { Category } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";

// GET all project showcases (public)
export async function GET() {
  const showcases = await prisma.projectShowcase.findMany({
    orderBy: { createdAt: "desc" },
    include: { images: true },
  });

  return NextResponse.json(showcases);
}

// POST create project showcase (admin only)
export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();

  const title = form.get("title") as string;
  const description = form.get("description") as string;
  const category = form.get("category") as Category;

  // Read ALL images (max 6)
  const files = form.getAll("images") as File[];

  if (files.length === 0) {
    return NextResponse.json({ error: "At least one image required" }, { status: 400 });
  }

  if (files.length > 6) {
    return NextResponse.json(
      { error: "Max 6 images allowed" },
      { status: 400 }
    );
  }

  // Upload all images to R2
  const imageUrls: string[] = [];

  for (const file of files) {
    if (file.size === 0) continue;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileName = `${crypto.randomUUID()}-${file.name}`;
    const baseUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "") || "";
    const publicUrl = `${baseUrl}/${fileName}`;

    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
      })
    );

    imageUrls.push(publicUrl);
  }

  // Create project showcase with images
  const showcase = await prisma.projectShowcase.create({
    data: {
      title,
      description,
      category,
      images: {
        create: imageUrls.map((url) => ({ url })),
      },
    },
    include: { images: true },
  });

  return NextResponse.json(showcase);
}

