import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Public endpoint to get order by ID prefix (first 8 characters)
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const normalizedId = id.toLowerCase();
    
    // Search for orders where the ID starts with the provided prefix
    // Using raw query since Prisma doesn't support startsWith on UUID directly
    const orders = await prisma.$queryRaw<Array<{
      id: string;
      customerName: string;
      customerEmail: string;
      customerPhone: string;
      customerAddress: string;
      totalPrice: number;
      status: string;
      createdAt: Date;
      updatedAt: Date;
    }>>`
      SELECT * FROM "Order"
      WHERE LOWER(id::text) LIKE ${normalizedId + '%'}
      LIMIT 1
    `;

    if (orders.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = orders[0];

    // Fetch order items and product details
    const orderItems = await prisma.orderItem.findMany({
      where: {
        orderId: order.id,
      },
    });

    const productIds = orderItems.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      select: {
        id: true,
        title: true,
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p.title]));

    // Attach product titles to items
    const orderWithProducts = {
      ...order,
      items: orderItems.map((item) => ({
        ...item,
        product: {
          title: productMap.get(item.productId) || "Produs",
        },
      })),
    };

    return NextResponse.json(orderWithProducts);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

