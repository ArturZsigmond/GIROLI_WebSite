import Link from "next/link";
import { Header } from "@/components/Header";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Produsul nu a fost găsit
          </h1>
          <Link
            href="/"
            className="text-blue-700 hover:text-blue-800 underline"
          >
            Înapoi la produse
          </Link>
        </div>
      </div>
    </div>
  );
}

