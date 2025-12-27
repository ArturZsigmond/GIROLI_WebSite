import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Get reviews for a product
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const reviews = await prisma.review.findMany({
      where: {
        productId: id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate average rating
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;

    // Cache reviews for 30 seconds (they don't change often)
    return NextResponse.json({
      reviews,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalReviews: reviews.length,
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// Submit a review
export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await context.params;
    const { orderNumber, rating, comment } = await req.json();

    // Validate input
    if (!orderNumber || !rating || !comment) {
      return NextResponse.json(
        { error: "Toate câmpurile sunt obligatorii" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating-ul trebuie să fie între 1 și 5" },
        { status: 400 }
      );
    }

    // Normalize order number (remove #, uppercase)
    const normalizedOrderNumber = orderNumber.replace(/#/g, "").toUpperCase();
    
    // Find order by ID prefix
    const orders = await prisma.$queryRaw<Array<{
      id: string;
      status: string;
    }>>`
      SELECT id, status::text as status FROM "Order"
      WHERE LOWER(id::text) LIKE ${normalizedOrderNumber.toLowerCase() + '%'}
      LIMIT 1
    `;

    if (orders.length === 0) {
      return NextResponse.json(
        { error: "Comanda nu a fost găsită" },
        { status: 404 }
      );
    }

    const order = orders[0];

    // Check if order is COMPLETED
    if (order.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Puteți lăsa o recenzie doar pentru comenzi finalizate" },
        { status: 400 }
      );
    }

    // Verify that the order contains this product
    const orderItem = await prisma.orderItem.findFirst({
      where: {
        orderId: order.id,
        productId: productId,
      },
    });

    if (!orderItem) {
      return NextResponse.json(
        { error: "Această comandă nu conține acest produs" },
        { status: 400 }
      );
    }

    // Check if review already exists for this product and order
    const existingReview = await prisma.review.findUnique({
      where: {
        productId_orderId: {
          productId,
          orderId: order.id,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "Ați lăsat deja o recenzie pentru acest produs din această comandă" },
        { status: 400 }
      );
    }

    // Get customer name from order
    const orderData = await prisma.order.findUnique({
      where: { id: order.id },
      select: { customerName: true },
    });

    // Create review
    const review = await prisma.review.create({
      data: {
        productId,
        orderId: order.id,
        rating,
        comment: comment.trim(),
        customerName: orderData?.customerName || "Client",
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("Error creating review:", error);
    
    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Ați lăsat deja o recenzie pentru acest produs din această comandă" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}

