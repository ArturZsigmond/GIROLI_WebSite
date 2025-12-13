import Link from "next/link";
import { prisma } from "@/lib/prisma";

const ITEMS_PER_PAGE = 15; // 3 items per row × 5 rows

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

async function getProducts(page: number = 1) {
  const skip = (page - 1) * ITEMS_PER_PAGE;
  
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      skip,
      take: ITEMS_PER_PAGE,
      orderBy: { createdAt: "desc" },
      include: { images: true },
    }),
    prisma.product.count(),
  ]);

  return {
    products: products as Product[],
    totalPages: Math.ceil(total / ITEMS_PER_PAGE),
    currentPage: page,
    total,
  };
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const { products, totalPages, currentPage, total } = await getProducts(page);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Giroli CNC</h1>
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
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Produsele Noastre
          </h2>
          <p className="text-gray-600">
            {total} produse disponibile
          </p>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nu există produse disponibile momentan.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200 overflow-hidden group"
                >
                  {/* Product Image */}
                  <div className="relative h-64 bg-gray-100 overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0].url}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
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
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                      {product.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-blue-700">
                        {product.price} RON
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {product.category}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Link
                  href={`/?page=${currentPage - 1}`}
                  className={`px-4 py-2 rounded ${
                    currentPage === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-blue-700 text-white hover:bg-blue-800"
                  }`}
                  aria-disabled={currentPage === 1}
                >
                  Anterior
                </Link>

                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNum) => {
                      // Show first page, last page, current page, and pages around current
                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                      ) {
                        return (
                          <Link
                            key={pageNum}
                            href={`/?page=${pageNum}`}
                            className={`px-4 py-2 rounded ${
                              pageNum === currentPage
                                ? "bg-blue-700 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            {pageNum}
                          </Link>
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

                <Link
                  href={`/?page=${currentPage + 1}`}
                  className={`px-4 py-2 rounded ${
                    currentPage === totalPages
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-blue-700 text-white hover:bg-blue-800"
                  }`}
                  aria-disabled={currentPage === totalPages}
                >
                  Următorul
                </Link>
              </div>
            )}
          </>
        )}
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
