import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail, sendOrderNotificationEmail } from "@/lib/email";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Create order
    const order = await prisma.order.create({
      data: {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        customerAddress: data.customerAddress,
        totalPrice: data.totalPrice,
        items: {
          create: data.items.map((i: any) => ({
            productId: i.productId,
            quantity: i.quantity,
            priceAtPurchase: i.priceAtPurchase,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Fetch product details for email
    const productIds = order.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      select: {
        id: true,
        title: true,
        price: true,
      },
    });

    // Create product details array matching order items
    const productDetails = order.items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        title: product?.title || "Produs",
        price: item.priceAtPurchase,
      };
    });

    // Send emails (don't fail the order if emails fail)
    console.log("Sending emails for order:", order.id);
    try {
      const emailResults = await Promise.allSettled([
        sendOrderConfirmationEmail(order, productDetails),
        sendOrderNotificationEmail(order, productDetails),
      ]);
      
      emailResults.forEach((result, index) => {
        if (result.status === "fulfilled") {
          console.log(`Email ${index === 0 ? "customer" : "admin"} sent successfully`);
        } else {
          console.error(`Email ${index === 0 ? "customer" : "admin"} failed:`, result.reason);
        }
      });
    } catch (emailError) {
      console.error("Failed to send emails:", emailError);
      // Continue even if emails fail - order is already created
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Eroare la crearea comenzii" },
      { status: 500 }
    );
  }
}
