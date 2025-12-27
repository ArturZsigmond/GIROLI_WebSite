"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/Button";

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  priceAtPurchase: number;
  product?: {
    title: string;
  };
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  totalPrice: number;
  status: "PENDING" | "IN_PRODUCTION" | "IN_TRANSIT" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

const statusLabels: Record<string, string> = {
  PENDING: "În așteptare",
  IN_PRODUCTION: "În producție",
  IN_TRANSIT: "În tranzit",
  COMPLETED: "Finalizată",
  CANCELLED: "Anulată",
};

const statusOrder = ["PENDING", "IN_PRODUCTION", "IN_TRANSIT", "COMPLETED"];

export default function MyOrdersPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const normalizeOrderNumber = (input: string): string => {
    // Remove all # symbols
    let cleaned = input.replace(/#/g, "");
    // Convert to uppercase
    cleaned = cleaned.toUpperCase();
    // Add # prefix
    return `#${cleaned}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Remove any # symbols the user might add
    value = value.replace(/#/g, "");
    
    // Limit to 8 characters (order ID prefix length)
    if (value.length > 8) {
      value = value.slice(0, 8);
    }
    
    // Convert to uppercase
    value = value.toUpperCase();
    
    setOrderNumber(value);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderNumber.trim()) {
      setError("Introduceți numărul comenzii");
      return;
    }

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      // Normalize the order number
      const normalized = normalizeOrderNumber(orderNumber);
      // Extract the ID part (remove #)
      const orderIdPrefix = normalized.replace("#", "");
      
      // We need to find the full order ID. Since we only have the first 8 chars,
      // we'll need to search. For now, let's try to fetch by the prefix.
      // Actually, we need a better approach - let's create an API that searches by prefix
      
      const response = await fetch(`/api/orders/public/${orderIdPrefix}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError("Comanda nu a fost găsită. Verificați numărul comenzii.");
        } else {
          setError("Eroare la căutarea comenzii. Vă rugăm încercați din nou.");
        }
        return;
      }

      const data = await response.json();
      setOrder(data);
    } catch (err) {
      console.error("Error fetching order:", err);
      setError("Eroare la căutarea comenzii. Vă rugăm încercați din nou.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIndex = (status: string): number => {
    return statusOrder.indexOf(status);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString("ro-RO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Comenzile mele</h1>
          <p className="text-gray-600">
            Introduceți numărul comenzii pentru a verifica statusul
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Număr comandă
                </label>
                <div className="flex items-center">
                  <span className="text-gray-500 font-semibold mr-2">#</span>
                  <input
                    id="orderNumber"
                    type="text"
                    value={orderNumber}
                    onChange={handleInputChange}
                    placeholder="6A20FFA1"
                    maxLength={8}
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
                    style={{ textTransform: "uppercase" }}
                  />
                </div>
                {error && (
                  <p className="text-red-500 text-sm mt-2">{error}</p>
                )}
              </div>
              <div className="flex items-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  {loading ? "Se caută..." : "Caută comandă"}
                </Button>
              </div>
            </div>
          </div>
        </form>

        {order && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Comandă #{order.id.slice(0, 8).toUpperCase()}
              </h2>
              <p className="text-gray-600">
                Plasată pe {formatDate(order.createdAt)}
              </p>
            </div>

            {/* Status Timeline */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Status comandă</h3>
              <div className="relative">
                {statusOrder.map((status, index) => {
                  const currentIndex = getStatusIndex(order.status);
                  const isCompleted = index <= currentIndex;
                  const isCurrent = index === currentIndex;
                  const isCancelled = order.status === "CANCELLED";

                  return (
                    <div key={status} className="flex items-start mb-6 last:mb-0">
                      <div className="flex flex-col items-center mr-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm ${
                            isCancelled && status !== "CANCELLED"
                              ? "bg-gray-200 text-gray-400"
                              : isCompleted
                              ? "bg-green-500 text-white"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {isCompleted ? (
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
                            index + 1
                          )}
                        </div>
                        {index < statusOrder.length - 1 && (
                          <div
                            className={`w-0.5 h-16 mt-2 ${
                              isCancelled && status !== "CANCELLED"
                                ? "bg-gray-200"
                                : index < currentIndex
                                ? "bg-green-500"
                                : "bg-gray-200"
                            }`}
                          />
                        )}
                      </div>
                      <div className="flex-1 pt-1">
                        <h4
                          className={`font-semibold mb-1 ${
                            isCurrent ? "text-blue-700" : isCompleted ? "text-green-600" : "text-gray-500"
                          }`}
                        >
                          {statusLabels[status]}
                        </h4>
                        {isCurrent && (
                          <p className="text-sm text-gray-600">
                            {order.status === "CANCELLED"
                              ? `Anulată pe ${formatDate(order.updatedAt)}`
                              : order.status === "PENDING"
                              ? `Plasată pe ${formatDate(order.createdAt)}`
                              : `Actualizată pe ${formatDate(order.updatedAt)}`}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
                {order.status === "CANCELLED" && (
                  <div className="flex items-start mt-6">
                    <div className="flex flex-col items-center mr-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm bg-red-500 text-white">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 pt-1">
                      <h4 className="font-semibold mb-1 text-red-600">
                        {statusLabels["CANCELLED"]}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Anulată pe {formatDate(order.updatedAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Details */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Detalii comandă</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Nume</p>
                  <p className="font-medium">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="font-medium">{order.customerEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Telefon</p>
                  <p className="font-medium">{order.customerPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Adresă</p>
                  <p className="font-medium">{order.customerAddress}</p>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Produse</h3>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{item.product?.title || "Produs"}</p>
                        <p className="text-sm text-gray-600">
                          Cantitate: {item.quantity} × {item.priceAtPurchase} RON
                        </p>
                      </div>
                      <p className="font-bold text-blue-700">
                        {item.priceAtPurchase * item.quantity} RON
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-800">Total:</span>
                  <span className="text-2xl font-bold text-blue-700">{order.totalPrice} RON</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <footer className="bg-gray-100 border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600">
            © {new Date().getFullYear()} Giroli Mob. Toate drepturile rezervate.
          </p>
        </div>
      </footer>
    </div>
  );
}

