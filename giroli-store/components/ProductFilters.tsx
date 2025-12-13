"use client";

import { useState, useEffect, useRef } from "react";
import { getCategoryLabel, categoryLabels } from "@/lib/categories";

type SortOption = "newest" | "price-low" | "price-high";
type FilterState = {
  category: string;
  minPrice: number;
  maxPrice: number;
  sortBy: SortOption;
};

interface ProductFiltersProps {
  products: any[];
  onFilterChange: (filteredProducts: any[]) => void;
  maxPrice: number;
}

export function ProductFilters({
  products,
  onFilterChange,
  maxPrice,
}: ProductFiltersProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    category: "all",
    minPrice: 0,
    maxPrice: maxPrice,
    sortBy: "newest",
  });

  const [localMinPrice, setLocalMinPrice] = useState(0);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setLocalMinPrice(0);
    setLocalMaxPrice(maxPrice);
    setFilters((prev) => ({
      ...prev,
      minPrice: 0,
      maxPrice: maxPrice,
    }));
  }, [maxPrice]);

  useEffect(() => {
    let filtered = [...products];

    // Category filter
    if (filters.category !== "all") {
      filtered = filtered.filter((p) => p.category === filters.category);
    }

    // Price range filter
    filtered = filtered.filter(
      (p) => p.price >= filters.minPrice && p.price <= filters.maxPrice
    );

    // Sorting
    switch (filters.sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        filtered.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
    }

    onFilterChange(filtered);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.category, filters.minPrice, filters.maxPrice, filters.sortBy, products]);

  const handleMinPriceChange = (value: number) => {
    const newMin = Math.min(Math.max(0, value), localMaxPrice);
    if (newMin !== localMinPrice) {
      setLocalMinPrice(newMin);
      setFilters((prev) => ({ ...prev, minPrice: newMin }));
    }
  };

  const handleMaxPriceChange = (value: number) => {
    const newMax = Math.max(Math.min(maxPrice, value), localMinPrice);
    if (newMax !== localMaxPrice) {
      setLocalMaxPrice(newMax);
      setFilters((prev) => ({ ...prev, maxPrice: newMax }));
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md mb-8 overflow-hidden">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors duration-200"
      >
        <h3 className="text-lg font-semibold text-gray-800">
          Filtrează și sortează
        </h3>
        <svg
          className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${
            isCollapsed ? "" : "rotate-180"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Collapsible Content */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isCollapsed ? "max-h-0 opacity-0" : "max-h-[1000px] opacity-100"
        } overflow-hidden`}
      >
        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categorie
          </label>
          <select
            value={filters.category}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, category: e.target.value }))
            }
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Toate categoriile</option>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sortează după
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                sortBy: e.target.value as SortOption,
              }))
            }
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="newest">Cele mai noi</option>
            <option value="price-low">Preț: mic → mare</option>
            <option value="price-high">Preț: mare → mic</option>
          </select>
        </div>

        {/* Min Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preț minim: {localMinPrice} RON
          </label>
          <input
            type="number"
            min="0"
            max={maxPrice}
            value={localMinPrice}
            onChange={(e) => handleMinPriceChange(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="range"
            min="0"
            max={maxPrice}
            value={localMinPrice}
            onChange={(e) => handleMinPriceChange(Number(e.target.value))}
            className="w-full mt-2 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
          />
        </div>

        {/* Max Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preț maxim: {localMaxPrice} RON
          </label>
          <input
            type="number"
            min="0"
            max={maxPrice}
            value={localMaxPrice}
            onChange={(e) => handleMaxPriceChange(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="range"
            min="0"
            max={maxPrice}
            value={localMaxPrice}
            onChange={(e) => handleMaxPriceChange(Number(e.target.value))}
            className="w-full mt-2 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
          />
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}

