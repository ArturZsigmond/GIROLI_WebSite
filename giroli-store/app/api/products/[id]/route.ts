import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { NextResponse } from "next/server";
import { r2Client, R2_BUCKET } from "@/lib/r2";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const data = await req.json();

  // Get existing product with images to track what needs to be deleted from R2
  const existingProduct = await prisma.product.findUnique({
    where: { id },
    include: { images: true },
  });

  if (!existingProduct) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Extract image URLs that will be kept
  const keptImageUrls = Array.isArray(data.images) ? data.images : [];
  const imagesToDelete = existingProduct.images.filter(
    (img) => !keptImageUrls.includes(img.url)
  );

  // Delete images from R2
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

  // Update product
  const updated = await prisma.product.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      price: data.price,
      category: data.category,
      height: data.height,
      width: data.width,
      depth: data.depth,
      weight: data.weight,
      material: data.material,
      images: {
        deleteMany: {
          id: {
            notIn: existingProduct.images
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

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;

  try {
    // Get product with images to delete from R2
    const product = await prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });

    if (product) {
      // Delete all images from R2
      for (const img of product.images) {
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
    }

    // Delete product (cascades to images)
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE product error:", err);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}


