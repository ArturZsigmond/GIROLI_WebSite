import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { r2Client, R2_BUCKET } from "@/lib/r2";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import { requireAdmin } from "@/lib/auth";

// GET all employees (public)
export async function GET() {
  const employees = await prisma.employee.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(employees);
}

// POST create employee (admin only)
export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();

  const name = form.get("name") as string;
  const role = form.get("role") as string;
  const description = form.get("description") as string;
  const imageFile = form.get("image") as File;

  if (!imageFile) {
    return NextResponse.json({ error: "Image required" }, { status: 400 });
  }

  // Upload image to R2
  const bytes = await imageFile.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const fileName = `${crypto.randomUUID()}-${imageFile.name}`;
  const baseUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "") || "";
  const publicUrl = `${baseUrl}/${fileName}`;

  await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: fileName,
      Body: buffer,
      ContentType: imageFile.type,
    })
  );

  const employee = await prisma.employee.create({
    data: {
      name,
      role,
      description,
      imageUrl: publicUrl,
    },
  });

  return NextResponse.json(employee);
}

