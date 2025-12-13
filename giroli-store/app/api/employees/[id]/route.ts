import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { r2Client, R2_BUCKET } from "@/lib/r2";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import { requireAdmin } from "@/lib/auth";

// GET single employee (public)
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const employee = await prisma.employee.findUnique({
    where: { id },
  });

  if (!employee) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  }

  return NextResponse.json(employee);
}

// PATCH update employee (admin only)
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const form = await req.formData();

  const name = form.get("name") as string;
  const role = form.get("role") as string;
  const description = form.get("description") as string;
  const imageFile = form.get("image") as File | null;

  const existingEmployee = await prisma.employee.findUnique({
    where: { id },
  });

  if (!existingEmployee) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  }

  let imageUrl = existingEmployee.imageUrl;

  // If new image uploaded, replace old one
  if (imageFile && imageFile.size > 0) {
    // Delete old image from R2
    try {
      const oldFileName = existingEmployee.imageUrl.split("/").pop();
      if (oldFileName) {
        await r2Client.send(
          new DeleteObjectCommand({
            Bucket: R2_BUCKET,
            Key: oldFileName,
          })
        );
      }
    } catch (err) {
      console.error(`Failed to delete R2 file ${existingEmployee.imageUrl}:`, err);
    }

    // Upload new image
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileName = `${crypto.randomUUID()}-${imageFile.name}`;
    const baseUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "") || "";
    imageUrl = `${baseUrl}/${fileName}`;

    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: fileName,
        Body: buffer,
        ContentType: imageFile.type,
      })
    );
  }

  const updated = await prisma.employee.update({
    where: { id },
    data: {
      name,
      role,
      description,
      imageUrl,
    },
  });

  return NextResponse.json(updated);
}

// DELETE employee (admin only)
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const employee = await prisma.employee.findUnique({
    where: { id },
  });

  if (!employee) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  }

  // Delete image from R2
  try {
    const fileName = employee.imageUrl.split("/").pop();
    if (fileName) {
      await r2Client.send(
        new DeleteObjectCommand({
          Bucket: R2_BUCKET,
          Key: fileName,
        })
      );
    }
  } catch (err) {
    console.error(`Failed to delete R2 file ${employee.imageUrl}:`, err);
  }

  await prisma.employee.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}

