"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewEmployeePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("role", role);
    formData.append("description", description);
    if (image) {
      formData.append("image", image);
    }

    const res = await fetch("/api/employees", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      router.push("/admin/employees");
    } else {
      alert("Eroare la salvare");
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Adaugă Angajat</h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <input
          type="text"
          placeholder="Nume"
          className="border p-2 w-full rounded-lg"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Rol / Poziție"
          className="border p-2 w-full rounded-lg"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
        />

        <textarea
          placeholder="Descriere"
          className="border p-2 w-full rounded-lg"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imagine
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="border p-2 w-full rounded-lg"
            required
          />
          {preview && (
            <div className="mt-4 w-full aspect-square max-w-xs">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 active:bg-blue-900 transition-all duration-200 transform active:scale-95 shadow-md hover:shadow-lg"
        >
          Salvează
        </button>
      </form>
    </div>
  );
}

