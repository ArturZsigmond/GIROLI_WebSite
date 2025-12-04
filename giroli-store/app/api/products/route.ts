import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { r2Client, R2_BUCKET } from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import { Category } from "@prisma/client"; // ✅ IMPORTANT

export async function POST(req: Request) {
  const form = await req.formData();

  const title = form.get("title") as string;
  const price = Number(form.get("price"));
  const description = form.get("description") as string;
  const category = form.get("category") as Category; // ✅ FIX

  const file = form.get("image") as File | null;

  let imageUrl = null;

  if (file) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split(".").pop();
    const fileName = `product_${crypto.randomUUID()}.${ext}`;

    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
      })
    );

    imageUrl = `${process.env.R2_PUBLIC_URL}${fileName}`;
  }

  const product = await prisma.product.create({
    data: {
      title,
      price,
      description,
      imageUrl,
      category, // ✅ REQUIRED BY PRISMA
    },
  });

  return NextResponse.json(product);
}
