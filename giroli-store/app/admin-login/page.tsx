"use client";

import { useState } from "react";

export default function AdminLogin() {
  const [error, setError] = useState("");

  async function handleSubmit(e: any) {
    e.preventDefault();
    setError("");

    const email = e.target.email.value;
    const password = e.target.password.value;

    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!data.success) {
      setError(data.error || "Eroare");
      return;
    }

    window.location.href = "/admin/products";
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow max-w-sm w-full"
      >
        <h1 className="text-2xl font-semibold mb-6 text-center text-blue-700">
          Giroli CNC Admin
        </h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>
        )}

        <input
          name="email"
          className="w-full mb-4 p-2 border rounded"
          placeholder="Email"
          type="email"
        />

        <input
          name="password"
          className="w-full mb-4 p-2 border rounded"
          placeholder="Parola"
          type="password"
        />

        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Autentificare
        </button>
      </form>
    </div>
  );
}
