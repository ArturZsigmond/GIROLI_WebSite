"use client";

export default function AdminSidebar() {
  return (
    <aside className="w-64 bg-white shadow-xl p-6 flex flex-col gap-6">
      <h2 className="text-xl font-bold text-blue-700">Giroli Admin</h2>

      <nav className="flex flex-col gap-4">
        <a href="/admin/products" className="hover:text-blue-700">Produse</a>
        <a href="/admin/products/new" className="hover:text-blue-700">Adaugă produs</a>
        <a href="/admin/orders" className="hover:text-blue-700">Comenzi</a>
      </nav>

      <form action="/api/auth/logout" method="POST">
        <button className="mt-auto bg-red-500 text-white rounded py-2 w-full hover:bg-red-600">
          Logout
        </button>
      </form>
    </aside>
  );
}
