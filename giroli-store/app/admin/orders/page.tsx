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

  // Fetch all product details for all orders
  const allProductIds = orders.flatMap((order) =>
    order.items.map((item) => item.productId)
  );
  const uniqueProductIds = [...new Set(allProductIds)];

  const products = await prisma.product.findMany({
    where: {
      id: {
        in: uniqueProductIds,
      },
    },
    select: {
      id: true,
      title: true,
    },
  });

  // Create a map for quick lookup
  const productMap = new Map(products.map((p) => [p.id, p.title]));

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
            className="border rounded-lg p-6 bg-white shadow-md"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Număr comandă</p>
                  <p className="font-mono text-sm text-gray-600">#{order.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <p className="text-lg font-semibold text-gray-800 mb-2">
                  {order.customerName}
                </p>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Email:</span> {order.customerEmail}
                  </p>
                  <p>
                    <span className="font-medium">Telefon:</span> {order.customerPhone}
                  </p>
                  <p>
                    <span className="font-medium">Adresă livrare:</span> {order.customerAddress}
                  </p>
                </div>
              </div>
              <div className="text-right ml-6">
                <p className="text-xs text-gray-500 mb-1">Total comandă</p>
                <p className="text-2xl font-bold text-blue-700">{order.totalPrice} RON</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mt-4">
              <h3 className="font-semibold text-gray-800 mb-3">Produse comandate</h3>
              <div className="space-y-2">
                {order.items.map((item) => {
                  const productName = productMap.get(item.productId) || "Produs șters";
                  const itemTotal = item.priceAtPurchase * item.quantity;
                  return (
                    <div
                      key={item.id}
                      className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{productName}</p>
                        <p className="text-sm text-gray-500">
                          Cantitate: {item.quantity} × {item.priceAtPurchase} RON
                        </p>
                      </div>
                      <p className="font-semibold text-gray-800 ml-4">
                        {itemTotal} RON
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-400">
                Data comenzii: {order.createdAt.toLocaleString("ro-RO", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
