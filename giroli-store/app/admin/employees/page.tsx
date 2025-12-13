import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function EmployeesPage() {
  const employees = await prisma.employee.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Angajați</h1>
        <Link
          href="/admin/employees/new"
          className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 active:bg-gray-900 transition-all duration-200 transform active:scale-95 shadow-md hover:shadow-lg"
        >
          + Adaugă Angajat
        </Link>
      </div>

      {employees.length === 0 ? (
        <p className="text-gray-600">Nu există angajați încă.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {employees.map((employee) => (
            <div
              key={employee.id}
              className="border rounded-lg shadow-sm p-4 bg-white"
            >
              <div className="w-full aspect-square bg-gray-100 rounded-t overflow-hidden mb-4">
                <img
                  src={employee.imageUrl}
                  alt={employee.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <h2 className="text-lg font-semibold">{employee.name}</h2>
              <p className="text-gray-600 text-sm mt-1">{employee.role}</p>
              <p className="text-gray-700 text-sm mt-2 line-clamp-3">
                {employee.description}
              </p>

              <div className="mt-4">
                <Link
                  href={`/admin/employees/${employee.id}`}
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

