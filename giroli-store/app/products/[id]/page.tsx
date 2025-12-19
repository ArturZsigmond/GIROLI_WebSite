"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Button } from "@/components/Button";
import { useCartStore } from "@/store/cartStore";
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
  height?: number | null;
  width?: number | null;
  depth?: number | null;
  weight?: number | null;
  material?: string | null;
  images: ProductImage[];
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  
  // All hooks must be called before any conditional returns
  const addToCart = useCartStore((state) => state.addItem);

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await fetch(`/api/products/public/${id}`);
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const data: Product = await res.json();
        setProduct(data);
        
        // Track product click (only if not from admin)
        if (typeof window !== "undefined" && !window.location.pathname.startsWith("/admin")) {
          try {
            await fetch("/api/analytics/product-click", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ productId: id }),
            });
          } catch (err) {
            // Silently fail tracking
            console.error("Failed to track product click:", err);
          }
        }
      } catch (err) {
        console.error("Failed to load product:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-gray-600">Se încarcă produsul...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Produsul nu a fost găsit
            </h1>
            <Link
              href="/"
              className="text-blue-700 hover:text-blue-800 underline"
            >
              Înapoi la produse
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const primaryImage =
    product && product.images && product.images.length > 0
      ? product.images[selectedImageIndex]?.url || product.images[0].url
      : null;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-700">
              Acasă
            </Link>
            <span>/</span>
            <span className="text-gray-800">{product.title}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div>
            {/* Primary Image */}
            <div className="mb-4 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center min-h-[500px]">
              {primaryImage ? (
                <img
                  src={primaryImage}
                  alt={product.title}
                  className="w-full h-auto max-h-[600px] object-contain"
                  loading="eager"
                />
              ) : (
                <div className="w-full h-96 flex items-center justify-center text-gray-400">
                  <svg
                    className="w-24 h-24"
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

            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img, index) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`border-2 rounded-lg overflow-hidden ${
                      selectedImageIndex === index
                        ? "border-blue-700"
                        : "border-gray-200 hover:border-blue-400"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={`${product.title} - Image ${index + 1}`}
                      className="w-full h-20 object-contain bg-gray-50"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-4">
              <span className="inline-block bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full mb-2">
                {getCategoryLabel(product.category)}
              </span>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                {product.title}
              </h1>
              <div className="text-4xl font-bold text-blue-700 mb-6">
                {product.price} RON
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Descriere
              </h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Specifications */}
            {(product.height ||
              product.width ||
              product.depth ||
              product.weight ||
              product.material) && (
              <div className="mb-6 border-t border-gray-200 pt-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Specificații
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {product.height && (
                    <div>
                      <span className="text-sm text-gray-600">Înălțime:</span>
                      <p className="font-medium text-gray-800">
                        {product.height} cm
                      </p>
                    </div>
                  )}
                  {product.width && (
                    <div>
                      <span className="text-sm text-gray-600">Lățime:</span>
                      <p className="font-medium text-gray-800">
                        {product.width} cm
                      </p>
                    </div>
                  )}
                  {product.depth && (
                    <div>
                      <span className="text-sm text-gray-600">Adâncime:</span>
                      <p className="font-medium text-gray-800">
                        {product.depth} cm
                      </p>
                    </div>
                  )}
                  {product.weight && (
                    <div>
                      <span className="text-sm text-gray-600">Greutate:</span>
                      <p className="font-medium text-gray-800">
                        {product.weight} kg
                      </p>
                    </div>
                  )}
                  {product.material && (
                    <div className="col-span-2">
                      <span className="text-sm text-gray-600">Material:</span>
                      <p className="font-medium text-gray-800">
                        {product.material}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={handleAddToCart}
                variant="primary"
                size="lg"
                className="flex-1"
              >
                {addedToCart ? "✓ Adăugat în coș!" : "Adaugă în coș"}
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
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

