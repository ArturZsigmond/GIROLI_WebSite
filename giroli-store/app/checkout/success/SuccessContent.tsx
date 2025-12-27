"use client";
export const dynamic = "force-dynamic";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { Button } from "@/components/Button";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [orderNumber, setOrderNumber] = useState("");

  useEffect(() => {
    if (orderId) {
      setOrderNumber(orderId.slice(0, 8).toUpperCase());
    }
  }, [orderId]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="text-center">
          {/* Success Icon with Animation */}
          <div className="mx-auto w-28 h-28 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
            <svg
              className="w-20 h-20 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-4xl font-bold text-gray-800 mb-8">
            Comanda a fost plasată cu succes!
          </h1>

          <div className="mb-8">
            <Link href="/">
              <Button variant="primary" size="lg">
                Înapoi la magazin
              </Button>
            </Link>
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

