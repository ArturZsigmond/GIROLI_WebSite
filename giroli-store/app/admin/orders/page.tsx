"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  priceAtPurchase: number;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

interface Product {
  id: string;
  title: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetch("/api/orders");
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            router.push("/admin-login");
            return;
          }
          throw new Error("Failed to load orders");
        }
        const data = await res.json();
        setOrders(data.orders || []);
        // Convert productMap object to Map
        const productMapObj = data.productMap || {};
        const productMap = new Map(Object.entries(productMapObj));
        setProducts(productMap);
      } catch (error) {
        console.error("Error loading orders:", error);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [router]);

  const handleStatusUpdate = async (orderId: string, status: string) => {
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        throw new Error("Failed to update order");
      }

      // Refresh orders
      const ordersRes = await fetch("/api/orders");
      const data = await ordersRes.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Eroare la actualizarea comenzii");
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm("Ești sigur că vrei să ștergi această comandă?")) {
      return;
    }

    setUpdating(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete order");
      }

      // Remove from local state
      setOrders(orders.filter((o) => o.id !== orderId));
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("Eroare la ștergerea comenzii");
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "IN_PRODUCTION":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "IN_TRANSIT":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return "În așteptare";
      case "IN_PRODUCTION":
        return "În producție";
      case "IN_TRANSIT":
        return "În tranzit";
      case "COMPLETED":
        return "Finalizată";
      case "CANCELLED":
        return "Anulată";
      default:
        return status;
    }
  };

  const getNextStatuses = (currentStatus: string): string[] => {
    switch (currentStatus) {
      case "PENDING":
        return ["IN_PRODUCTION", "CANCELLED"];
      case "IN_PRODUCTION":
        return ["IN_TRANSIT", "CANCELLED"];
      case "IN_TRANSIT":
        return ["COMPLETED", "CANCELLED"];
      case "COMPLETED":
        return []; // No next statuses
      case "CANCELLED":
        return []; // No next statuses
      default:
        return ["IN_PRODUCTION"];
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-500">Se încarcă...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Comenzi</h1>

      {orders.length === 0 && (
        <p className="text-gray-500">Nu există comenzi încă.</p>
      )}

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="border rounded-lg p-4 sm:p-6 bg-white shadow-md"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4">
              <div className="flex-1">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Număr comandă</p>
                    <p className="font-mono text-sm text-gray-600">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                  <div className="ml-0 sm:ml-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                </div>
                <p className="text-lg font-semibold text-gray-800 mb-2">
                  {order.customerName}
                </p>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    {order.customerEmail}
                  </p>
                  <p>
                    <span className="font-medium">Telefon:</span>{" "}
                    {order.customerPhone}
                  </p>
                  <p>
                    <span className="font-medium">Adresă livrare:</span>{" "}
                    {order.customerAddress}
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right w-full sm:w-auto">
                <p className="text-xs text-gray-500 mb-1">Total comandă</p>
                <p className="text-2xl font-bold text-blue-700">
                  {order.totalPrice} RON
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mt-4">
              <h3 className="font-semibold text-gray-800 mb-3">
                Produse comandate
              </h3>
              <div className="space-y-2">
                {order.items.map((item) => {
                  const productName =
                    products.get(item.productId) || "Produs șters";
                  const itemTotal = item.priceAtPurchase * item.quantity;
                  return (
                    <div
                      key={item.id}
                      className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">
                          {productName}
                        </p>
                        <p className="text-sm text-gray-500">
                          Cantitate: {item.quantity} × {item.priceAtPurchase}{" "}
                          RON
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
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <p className="text-xs text-gray-400">
                  Data comenzii:{" "}
                  {new Date(order.createdAt).toLocaleString("ro-RO", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <div className="flex flex-wrap gap-2">
                  {getNextStatuses(order.status).map((nextStatus) => {
                    const statusColors: Record<string, string> = {
                      IN_PRODUCTION: "bg-blue-600 hover:bg-blue-700",
                      IN_TRANSIT: "bg-purple-600 hover:bg-purple-700",
                      COMPLETED: "bg-green-600 hover:bg-green-700",
                      CANCELLED: "bg-red-600 hover:bg-red-700",
                    };
                    return (
                      <button
                        key={nextStatus}
                        onClick={() => handleStatusUpdate(order.id, nextStatus)}
                        disabled={updating === order.id}
                        className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors ${
                          statusColors[nextStatus] || "bg-gray-600 hover:bg-gray-700"
                        }`}
                      >
                        {updating === order.id
                          ? "Se procesează..."
                          : `→ ${getStatusLabel(nextStatus)}`}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handleDelete(order.id)}
                    disabled={updating === order.id}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    {updating === order.id ? "Se procesează..." : "Șterge"}
                  </button>
                </div>
              </div>
              
              {/* Status Progress Bar */}
              {order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <span>Progres:</span>
                    <span className="font-medium">{getStatusLabel(order.status)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        order.status === "PENDING"
                          ? "bg-yellow-500 w-1/4"
                          : order.status === "IN_PRODUCTION"
                          ? "bg-blue-500 w-2/4"
                          : order.status === "IN_TRANSIT"
                          ? "bg-purple-500 w-3/4"
                          : "bg-gray-500 w-0"
                      }`}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
