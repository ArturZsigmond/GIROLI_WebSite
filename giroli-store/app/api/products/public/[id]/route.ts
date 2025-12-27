import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Public endpoint for product details (no auth required)
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { 
      images: true,
      categories: true
    },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}

