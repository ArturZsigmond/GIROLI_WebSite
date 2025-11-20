import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminProducts() {
  const products = await prisma.product.findMany({
    include: { images: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">Produse</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((p) => (
          <div key={p.id} className="bg-white shadow rounded p-4">
            {p.images[0] && (
              <img
                src={p.images[0].url}
                className="h-40 w-full object-cover rounded"
              />
            )}

            <h2 className="font-semibold mt-4">{p.title}</h2>
            <p className="text-gray-600">{p.price} RON</p>

            <Link
              href={`/admin/products/${p.id}`}
              className="block mt-3 bg-blue-600 text-center text-white py-2 rounded hover:bg-blue-700"
            >
              Editează
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
