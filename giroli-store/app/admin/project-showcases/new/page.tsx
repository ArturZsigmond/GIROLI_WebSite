"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Category } from "@prisma/client";

export default function NewProjectShowcasePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("KITCHEN");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files).slice(0, 6);
    setImages(fileArray);
    setPreviews(fileArray.map((f) => URL.createObjectURL(f)));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (images.length === 0) {
      alert("Adăugați cel puțin o imagine");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    images.forEach((img) => {
      formData.append("images", img);
    });

    const res = await fetch("/api/project-showcases", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      router.push("/admin/project-showcases");
    } else {
      const error = await res.json();
      alert(error.error || "Eroare la salvare");
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Adaugă Proiect Complet Furnizat</h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <input
          type="text"
          placeholder="Titlu"
          className="border p-2 w-full rounded-lg"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
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

        <select
          name="category"
          required
          className="border p-2 w-full rounded-lg"
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
        >
          <option value="KITCHEN">Bucătărie</option>
          <option value="BATHROOM">Baie</option>
          <option value="BEDROOM">Dormitor</option>
          <option value="LIVING">Living</option>
          <option value="GENERAL">General</option>
        </select>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imagini (max 6)
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="border p-2 w-full rounded-lg"
            required
          />
          {previews.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              {previews.map((preview, idx) => (
                <div key={idx} className="w-full aspect-square">
                  <img
                    src={preview}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              ))}
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

