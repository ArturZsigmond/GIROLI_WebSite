import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { r2Client, R2_BUCKET } from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import { requireAdmin } from "@/lib/auth";

// POST add images to existing project showcase
export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const form = await req.formData();

  const files = form.getAll("images") as File[];

  if (files.length === 0) {
    return NextResponse.json({ error: "No images provided" }, { status: 400 });
  }

  const existingShowcase = await prisma.projectShowcase.findUnique({
    where: { id },
    include: { images: true },
  });

  if (!existingShowcase) {
    return NextResponse.json({ error: "Showcase not found" }, { status: 404 });
  }

  if (existingShowcase.images.length + files.length > 6) {
    return NextResponse.json(
      { error: "Maximum 6 images allowed per showcase" },
      { status: 400 }
    );
  }

  // Upload new images to R2
  const newImageUrls: string[] = [];

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

    newImageUrls.push(publicUrl);
  }

  // Add images to showcase
  const updated = await prisma.projectShowcase.update({
    where: { id },
    data: {
      images: {
        create: newImageUrls.map((url) => ({ url })),
      },
    },
    include: { images: true },
  });

  return NextResponse.json(updated);
}

