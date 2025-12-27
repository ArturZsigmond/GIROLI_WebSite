"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { Header } from "@/components/Header";
import { Button } from "@/components/Button";
import { ContactModal } from "@/components/ContactModal";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const totalPrice = useCartStore((state) => state.getTotalPrice());
  const clearCart = useCartStore((state) => state.clearCart);
  const isRedirectingRef = useRef(false);

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    street: "",
    city: "",
    county: "",
    postalCode: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showContactModal, setShowContactModal] = useState(false);

  // Redirect if cart is empty (using useEffect to avoid render-time navigation)
  // But don't redirect if we're in the process of submitting an order or redirecting
  useEffect(() => {
    if (items.length === 0 && !isSubmitting && !isRedirectingRef.current) {
      router.push("/cart");
    }
  }, [items.length, router, isSubmitting]);

  // Don't render if cart is empty
  if (items.length === 0) {
    return null;
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.customerName.trim()) {
      newErrors.customerName = "Numele este obligatoriu";
    } else if (formData.customerName.trim().length < 2) {
      newErrors.customerName = "Numele trebuie să aibă cel puțin 2 caractere";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = "Email-ul este obligatoriu";
    } else if (!emailRegex.test(formData.customerEmail)) {
      newErrors.customerEmail = "Email-ul nu este valid";
    }

    // Phone validation (Romanian phone format)
    const phoneRegex = /^(\+4|0)[0-9]{9}$/;
    const cleanPhone = formData.customerPhone.replace(/\s/g, "");
    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = "Telefonul este obligatoriu";
    } else if (!phoneRegex.test(cleanPhone)) {
      newErrors.customerPhone = "Telefonul trebuie să fie în format românesc (ex: 0712345678)";
    }

    // Address validation
    if (!formData.street.trim()) {
      newErrors.street = "Strada este obligatorie";
    }
    if (!formData.city.trim()) {
      newErrors.city = "Orașul este obligatoriu";
    }
    if (!formData.county.trim()) {
      newErrors.county = "Județul este obligatoriu";
    }
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = "Codul poștal este obligatoriu";
    } else if (!/^\d{6}$/.test(formData.postalCode.replace(/\s/g, ""))) {
      newErrors.postalCode = "Codul poștal trebuie să fie format din 6 cifre";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    // Check if order total exceeds 5000 RON
    if (totalPrice > 5000) {
      setShowContactModal(true);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Construct full address from components
      const customerAddress = `${formData.street}, ${formData.city}, ${formData.county}, ${formData.postalCode}`;

      const orderData = {
        customerName: formData.customerName.trim(),
        customerEmail: formData.customerEmail.trim(),
        customerPhone: formData.customerPhone.replace(/\s/g, ""),
        customerAddress,
        totalPrice,
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          priceAtPurchase: item.price,
        })),
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Eroare la plasarea comenzii");
      }

      const order = await response.json();

      // Mark that we're redirecting to prevent the useEffect from interfering
      isRedirectingRef.current = true;
      
      // Clear cart and redirect to success page
      clearCart();
      router.replace(`/checkout/success?orderId=${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare la plasarea comenzii");
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Finalizare comandă</h1>
          <p className="text-gray-600 mt-2">
            Completează informațiile de mai jos pentru a finaliza comanda
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg shadow-md p-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-2">
                  Nume complet *
                </label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  required
                  value={formData.customerName}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.customerName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Ion Popescu"
                />
                {errors.customerName && (
                  <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>
                )}
              </div>

              <div>
                <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="customerEmail"
                  name="customerEmail"
                  required
                  value={formData.customerEmail}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.customerEmail ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="ion.popescu@example.com"
                />
                {errors.customerEmail && (
                  <p className="text-red-500 text-sm mt-1">{errors.customerEmail}</p>
                )}
              </div>

              <div>
                <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon *
                </label>
                <input
                  type="tel"
                  id="customerPhone"
                  name="customerPhone"
                  required
                  value={formData.customerPhone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setFormData({ ...formData, customerPhone: value });
                  }}
                  className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.customerPhone ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="0712345678"
                />
                {errors.customerPhone && (
                  <p className="text-red-500 text-sm mt-1">{errors.customerPhone}</p>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Adresă de livrare *</h3>
                
                <div>
                  <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-2">
                    Stradă și număr *
                  </label>
                  <input
                    type="text"
                    id="street"
                    name="street"
                    required
                    value={formData.street}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.street ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Strada Exemplu, nr. 10"
                  />
                  {errors.street && (
                    <p className="text-red-500 text-sm mt-1">{errors.street}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                      Oraș *
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.city ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="București"
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="county" className="block text-sm font-medium text-gray-700 mb-2">
                      Județ *
                    </label>
                    <input
                      type="text"
                      id="county"
                      name="county"
                      required
                      value={formData.county}
                      onChange={handleChange}
                      className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.county ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="București"
                    />
                    {errors.county && (
                      <p className="text-red-500 text-sm mt-1">{errors.county}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Cod poștal *
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    required
                    maxLength={6}
                    value={formData.postalCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setFormData({ ...formData, postalCode: value });
                    }}
                    className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.postalCode ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="123456"
                  />
                  {errors.postalCode && (
                    <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Se procesează..." : "Plasează comanda"}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Rezumat comandă</h2>

              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm text-gray-600">
                    <span>
                      {item.title} x{item.quantity}
                    </span>
                    <span className="font-semibold">{item.price * item.quantity} RON</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-300 pt-3 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold">{totalPrice} RON</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-800">
                  <span>Total:</span>
                  <span className="text-blue-700">{totalPrice} RON</span>
                </div>
              </div>

              <Link href="/cart" className="block mt-6">
                <Button variant="outline" size="md" className="w-full">
                  Modifică coșul
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <footer className="bg-gray-100 border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600">
            © {new Date().getFullYear()} Giroli CNC. Toate drepturile rezervate.
          </p>
        </div>
      </footer>
    </div>
  );
}

