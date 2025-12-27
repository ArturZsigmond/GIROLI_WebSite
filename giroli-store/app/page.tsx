import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { ProductGrid } from "@/components/ProductGrid";

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

async function getProducts() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { 
      images: true,
      categories: true
    },
  });

  return products as Product[];
}

export default async function Home() {
  const allProducts = await getProducts();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Produsele Noastre
          </h2>
        </div>

        {/* Products Grid with Filters */}
        {allProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Nu există produse disponibile momentan.
            </p>
          </div>
        ) : (
          <ProductGrid initialProducts={allProducts} />
        )}
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
