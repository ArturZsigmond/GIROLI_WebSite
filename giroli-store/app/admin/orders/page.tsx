import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export default async function OrdersPage() {
  await requireAdmin();

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
    },
  });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Comenzi</h1>

      {orders.length === 0 && (
        <p className="text-gray-500">Nu există comenzi încă.</p>
      )}

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="border rounded-lg p-4 bg-white shadow"
          >
            <div className="flex justify-between mb-2">
              <div>
                <p className="font-semibold">{order.customerName}</p>
                <p className="text-sm text-gray-500">{order.customerEmail}</p>
                <p className="text-sm text-gray-500">{order.customerPhone}</p>
                <p className="text-sm text-gray-500">{order.customerAddress}</p>
              </div>
              <p className="font-bold text-lg">{order.totalPrice} lei</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Produse</h3>
              {order.items.map((item) => (
                <div key={item.id} className="text-sm text-gray-700">
                  • {item.productId} — x{item.quantity} — {item.priceAtPurchase} lei
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-400 mt-3">
              {order.createdAt.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
