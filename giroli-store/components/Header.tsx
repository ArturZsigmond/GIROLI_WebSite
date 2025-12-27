"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";

export function Header() {
  const [mounted, setMounted] = useState(false);
  const totalItems = useCartStore((state) => state.getTotalItems());

  // Only render cart badge after component mounts to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="bg-blue-700 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 md:py-6">
        <div className="flex justify-between items-center gap-2 sm:gap-4">
          <Link href="/" className="text-xl sm:text-2xl md:text-3xl font-bold hover:text-blue-200 transition-colors whitespace-nowrap">
            Giroli Mob
          </Link>
          <nav className="flex gap-2 sm:gap-4 md:gap-6 items-center">
            <Link
              href="/"
              className="text-sm sm:text-base hover:text-blue-200 transition-colors font-medium whitespace-nowrap"
            >
              Acasă
            </Link>
            <Link
              href="/comenzile-mele"
              className="text-sm sm:text-base hover:text-blue-200 transition-colors font-medium whitespace-nowrap"
            >
              Comenzile mele
            </Link>
            <Link
              href="/despre-noi"
              className="text-sm sm:text-base hover:text-blue-200 transition-colors font-medium whitespace-nowrap"
            >
              Despre Noi
            </Link>
            <Link
              href="/cart"
              className="relative flex items-center gap-1 sm:gap-2 hover:text-blue-200 transition-colors font-medium"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span className="hidden sm:inline text-sm sm:text-base">Coș</span>
              {mounted && totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

