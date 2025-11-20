import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const data = await req.json();

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
  });

  return Response.json(order);
}
