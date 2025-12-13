"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";

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

const categoryLabels: Record<string, string> = {
  KITCHEN: "Bucătărie",
  BATHROOM: "Baie",
  BEDROOM: "Dormitor",
  LIVING: "Living",
  GENERAL: "General",
};

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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
      } catch (err) {
        console.error("Failed to load product:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);

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
    product.images && product.images.length > 0
      ? product.images[selectedImageIndex]?.url || product.images[0].url
      : null;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-3xl font-bold hover:text-blue-200">
              Giroli CNC
            </Link>
            <nav className="flex gap-4">
              <Link href="/" className="hover:text-blue-200">
                Acasă
              </Link>
              <Link href="/admin-login" className="hover:text-blue-200">
                Admin
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <div className="mb-4 bg-gray-100 rounded-lg overflow-hidden">
              {primaryImage ? (
                <img
                  src={primaryImage}
                  alt={product.title}
                  className="w-full h-96 object-cover"
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
                      className="w-full h-20 object-cover"
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
                {categoryLabels[product.category] || product.category}
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
              <button className="flex-1 bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors">
                Adaugă în coș
              </button>
              <button className="px-6 py-3 border-2 border-blue-700 text-blue-700 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                Contactează-ne
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600">
            © {new Date().getFullYear()} Giroli CNC. Toate drepturile rezervate.
          </p>
        </div>
      </footer>
    </div>
  );
}

