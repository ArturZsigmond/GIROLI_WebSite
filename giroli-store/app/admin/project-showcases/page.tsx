import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getCategoryLabel } from "@/lib/categories";

export default async function ProjectShowcasesPage() {
  const showcases = await prisma.projectShowcase.findMany({
    orderBy: { createdAt: "desc" },
    include: { images: true },
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Proiecte Complet Furnizate</h1>
        <Link
          href="/admin/project-showcases/new"
          className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 active:bg-gray-900 transition-all duration-200 transform active:scale-95 shadow-md hover:shadow-lg"
        >
          + Adaugă Proiect
        </Link>
      </div>

      {showcases.length === 0 ? (
        <p className="text-gray-600">Nu există proiecte încă.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {showcases.map((showcase) => (
            <div
              key={showcase.id}
              className="border rounded-lg shadow-sm p-4 bg-white"
            >
              {showcase.images?.length > 0 ? (
                <div className="w-full aspect-square bg-gray-100 rounded-t overflow-hidden mb-4">
                  <img
                    src={showcase.images[0].url}
                    alt={showcase.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full aspect-square bg-gray-200 rounded-t mb-4 flex items-center justify-center text-gray-500">
                  Fără imagine
                </div>
              )}

              <h2 className="text-lg font-semibold">{showcase.title}</h2>
              <p className="text-gray-600 text-sm mt-1">
                {getCategoryLabel(showcase.category)}
              </p>
              <p className="text-gray-700 text-sm mt-2 line-clamp-3">
                {showcase.description}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {showcase.images.length} {showcase.images.length === 1 ? "imagine" : "imagini"}
              </p>

              <div className="mt-4">
                <Link
                  href={`/admin/project-showcases/${showcase.id}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Editează
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

