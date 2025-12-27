import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Get review stats for multiple products
export async function POST(req: Request) {
  try {
    const { productIds } = await req.json();

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ stats: {} });
    }

    // Get review stats for all products
    const reviews = await prisma.review.findMany({
      where: {
        productId: {
          in: productIds,
        },
      },
      select: {
        productId: true,
        rating: true,
      },
    });

    // Calculate stats per product
    const stats: Record<string, { averageRating: number; totalReviews: number }> = {};

    productIds.forEach((productId: string) => {
      const productReviews = reviews.filter((r) => r.productId === productId);
      const totalReviews = productReviews.length;
      const averageRating =
        totalReviews > 0
          ? productReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
          : 0;

      stats[productId] = {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
      };
    });

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Error fetching review stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch review stats" },
      { status: 500 }
    );
  }
}

