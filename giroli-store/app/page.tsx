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

// Revalidate every 60 seconds
export const revalidate = 60;

export default async function Home() {
  const allProducts = await getProducts();

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      {/* Wood Background - More visible */}
      <div 
        className="fixed inset-0 z-0 w-full h-full"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          backgroundRepeat: 'no-repeat',
        }}
        aria-hidden="true"
      >
        {/* Overlay for better readability - more subtle wood texture */}
        <div className="absolute inset-0 bg-white/70"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen bg-transparent">
        <Header />

        {/* Main Content */}
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2 drop-shadow-sm">
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
        <footer className="bg-white/90 backdrop-blur-sm border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-gray-600">
              © {new Date().getFullYear()} Giroli Mob. Toate drepturile rezervate.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
