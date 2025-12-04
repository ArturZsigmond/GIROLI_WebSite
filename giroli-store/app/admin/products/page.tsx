import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ProductsPage() {
  // Fetch products from DB
const products = await prisma.product.findMany({
  orderBy: { createdAt: "desc" },
  include: { images: true }   // 👈 add this!
});


  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Products</h1>
        <Link
          href="/admin/products/new"
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          + Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-gray-600">No products yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="border rounded-lg shadow-sm p-4 bg-white"
            >
              {p.images && p.images.length > 0 ? (
                <img
                  src={p.images[0].url}
                  alt={p.title}
                  className="w-full h-48 object-cover rounded-t"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 rounded mb-3 flex items-center justify-center text-gray-500">
                  No Image
                </div>
              )}


              <h2 className="text-lg font-semibold">{p.title}</h2>
              <p className="text-gray-700 text-sm mt-1">{p.description}</p>

              <p className="text-black font-medium mt-2">{p.price} RON</p>

              <div className="mt-4 flex justify-end">
                <Link
                  href={`/admin/products/${p.id}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Edit Product
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
