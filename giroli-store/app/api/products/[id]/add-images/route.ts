import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";
import { r2Client, R2_BUCKET } from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;

  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Check current image count
  if (product.images.length >= 6) {
    return NextResponse.json(
      { error: "Maximum 6 images allowed per product" },
      { status: 400 }
    );
  }

  const form = await req.formData();
  const files = form.getAll("images") as File[];

  if (files.length === 0) {
    return NextResponse.json({ error: "No images provided" }, { status: 400 });
  }

  // Check if adding these images would exceed the limit
  const totalAfterAdd = product.images.length + files.length;
  if (totalAfterAdd > 6) {
    return NextResponse.json(
      { error: `Adding these images would exceed the 6 image limit. Current: ${product.images.length}, trying to add: ${files.length}` },
      { status: 400 }
    );
  }

  // Normalize R2 public base URL (remove trailing slash)
  const baseUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");

  const uploadedImages: { url: string }[] = [];

  for (const file of files) {
    if (!(file instanceof File)) continue;

    // Convert file → buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `product_${crypto.randomUUID()}.${ext}`;

    // Upload to R2
    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
      })
    );

    // Final public URL (no double slash)
    const url = `${baseUrl}/${fileName}`;

    uploadedImages.push({ url });
  }

  // Add images to product
  const updatedProduct = await prisma.product.update({
    where: { id },
    data: {
      images: {
        create: uploadedImages,
      },
    },
    include: { images: true },
  });

  return NextResponse.json(updatedProduct);
}

