"use client";

import { useState, useEffect, useCallback } from "react";
import { ProductCard } from "./ProductCard";
import { ProductFilters } from "./ProductFilters";

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
  createdAt: Date | string;
  images: ProductImage[];
}

interface ProductGridProps {
  initialProducts: Product[];
}

export function ProductGrid({ initialProducts }: ProductGridProps) {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>(initialProducts);

  // Calculate max price from all products
  const maxPrice = Math.max(
    ...initialProducts.map((p) => p.price),
    1000 // fallback
  );

  const handleFilterChange = useCallback((products: Product[]) => {
    setFilteredProducts(products);
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  // Pagination
  const ITEMS_PER_PAGE = 15;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  useEffect(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    setDisplayedProducts(filteredProducts.slice(start, end));
  }, [currentPage, filteredProducts]);

  return (
    <>
      <ProductFilters
        products={initialProducts}
        onFilterChange={handleFilterChange}
        maxPrice={maxPrice}
      />

      {/* Results count */}
      <div className="mb-4 text-gray-600">
        {filteredProducts.length === initialProducts.length ? (
          <p>{filteredProducts.length} produse disponibile</p>
        ) : (
          <p>
            {filteredProducts.length} din {initialProducts.length} produse
          </p>
        )}
      </div>

      {/* Products Grid */}
      {displayedProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            Nu s-au găsit produse care să corespundă filtrelor.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 mb-8">
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 transform active:scale-95 shadow-md hover:shadow-lg ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-50"
                    : "bg-blue-700 text-white hover:bg-blue-800 active:bg-blue-900"
                }`}
              >
                Anterior
              </button>

              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNum) => {
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 transform active:scale-95 shadow-md hover:shadow-lg ${
                            pageNum === currentPage
                              ? "bg-blue-700 text-white hover:bg-blue-800 active:bg-blue-900"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300 active:bg-gray-400"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      pageNum === currentPage - 2 ||
                      pageNum === currentPage + 2
                    ) {
                      return (
                        <span key={pageNum} className="px-2 text-gray-500">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }
                )}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 transform active:scale-95 shadow-md hover:shadow-lg ${
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-50"
                    : "bg-blue-700 text-white hover:bg-blue-800 active:bg-blue-900"
                }`}
              >
                Următorul
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}

