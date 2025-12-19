"use client";

import Link from "next/link";
import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { Button } from "./Button";
import { getCategoryLabel } from "@/lib/categories";

interface ProductImage {
  id: string;
  url: string;
}

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: ProductImage[];
}

export function ProductCard({ product }: { product: Product }) {
  const [addedToCart, setAddedToCart] = useState(false);
  const addToCart = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      imageUrl: product.images?.[0]?.url || "",
    });
    
    setAddedToCart(true);
    // Reset feedback after a brief moment, but don't disable the button
    setTimeout(() => setAddedToCart(false), 500);
  };

  const handleProductClick = async () => {
    // Don't track clicks from admin pages
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
      return;
    }
    
    // Track product click
    try {
      await fetch("/api/analytics/product-click", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId: product.id }),
      });
    } catch (err) {
      // Silently fail tracking
      console.error("Failed to track product click:", err);
    }
  };

  return (
    <div className="border rounded-lg shadow-sm bg-white hover:shadow-xl transition-shadow duration-200 overflow-hidden group flex flex-col max-w-sm mx-auto w-full">
      <Link 
        href={`/products/${product.id}`} 
        className="flex-1 flex flex-col"
        onClick={handleProductClick}
      >
        {/* Product Image */}
        <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0].url}
              alt={product.title}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              <svg
                className="w-16 h-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
            {product.title}
          </h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-1">
            {product.description}
          </p>
          <div className="flex justify-between items-center mb-3">
            <span className="text-xl font-bold text-blue-700">
              {product.price} RON
            </span>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {getCategoryLabel(product.category)}
            </span>
          </div>
        </div>
      </Link>

      {/* Add to Cart Button */}
      <div className="p-4 pt-0">
        <Button
          onClick={handleAddToCart}
          variant="primary"
          size="md"
          className="w-full"
        >
          {addedToCart ? "✓ Adăugat!" : "Adaugă în coș"}
        </Button>
      </div>
    </div>
  );
}

