"use client";

export default function AdminSidebar() {
  return (
    <aside className="w-64 bg-white shadow-xl p-6 flex flex-col gap-6">
      <a href="/" className="text-xl font-bold text-blue-700 hover:text-blue-800 transition-colors">
        Giroli Admin
      </a>

      <nav className="flex flex-col gap-4">
        <a href="/admin/products" className="hover:text-blue-700">Produse</a>
        <a href="/admin/products/new" className="hover:text-blue-700">Adaugă produs</a>
        <a href="/admin/orders" className="hover:text-blue-700">Comenzi</a>
        <a href="/admin/analytics" className="hover:text-blue-700">Analiză Utilizatori</a>
        <a href="/admin/employees" className="hover:text-blue-700">Angajați</a>
        <a href="/admin/employees/new" className="hover:text-blue-700">Adaugă angajat</a>
        <a href="/admin/project-showcases" className="hover:text-blue-700">Proiecte</a>
        <a href="/admin/project-showcases/new" className="hover:text-blue-700">Adaugă proiect</a>
      </nav>

      <form action="/api/auth/logout" method="POST">
        <button className="mt-auto bg-red-500 text-white rounded-lg py-3 w-full font-semibold hover:bg-red-600 active:bg-red-700 transition-all duration-200 transform active:scale-95 shadow-md hover:shadow-lg">
          Logout
        </button>
      </form>
    </aside>
  );
}
