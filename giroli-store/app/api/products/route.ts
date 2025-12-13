import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { r2Client, R2_BUCKET } from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import { Category } from "@prisma/client";

// Public GET endpoint for storefront
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "15");
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { images: true },
    }),
    prisma.product.count(),
  ]);

  return NextResponse.json({
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

// Admin POST endpoint for creating products
export async function POST(req: Request) {
  const form = await req.formData();

  const title = form.get("title") as string;
  const price = Number(form.get("price"));
  const description = form.get("description") as string;
  const category = form.get("category") as Category;

  // Read ALL images (max 6)
  const files = form.getAll("images") as File[];

  if (files.length > 6) {
    return NextResponse.json(
      { error: "Max 6 images allowed" },
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
        ContentType: file.type
      })
    );

    // Final public URL (no double slash)
    const url = `${baseUrl}/${fileName}`;

    uploadedImages.push({ url });
  }

  // Create product + all images records
  const product = await prisma.product.create({
    data: {
      title,
      price,
      description,
      category,
      images: {
        create: uploadedImages
      }
    },
    include: { images: true }
  });

  return NextResponse.json(product);
}





