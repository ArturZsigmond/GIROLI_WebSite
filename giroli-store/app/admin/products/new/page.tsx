"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("KITCHEN");

  // MULTIPLE IMAGES
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files).slice(0, 6); // limit to 6 images

    setImageFiles(fileArray);
    setPreviews(fileArray.map((f) => URL.createObjectURL(f)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("price", price);
    formData.append("description", description);
    formData.append("category", category);

    // Append ALL selected images
    imageFiles.forEach((file) => formData.append("images", file));

    const res = await fetch("/api/products", {
      method: "POST",
      body: formData,
    });

    if (res.ok) router.push("/admin/products");
    else alert("Eroare la salvarea produsului");
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Adaugă Produs</h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">

        <input
          type="text"
          placeholder="Titlu"
          className="border p-2 w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Preț (RON)"
          className="border p-2 w-full"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />

        <textarea
          placeholder="Descriere"
          className="border p-2 w-full"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        {/* CATEGORY DROPDOWN */}
        <select
          name="category"
          required
          className="border p-2 w-full"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="KITCHEN">Bucătărie</option>
          <option value="BATHROOM">Baie</option>
          <option value="BEDROOM">Dormitor</option>
          <option value="LIVING">Living</option>
          <option value="GENERAL">General</option>
        </select>

        {/* IMAGE INPUT */}
        <div>
          <label className="block mb-1 font-semibold">Imagini Produs (max 6)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            className="border p-2 w-full"
          />

          {/* Previews */}
          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-3">
              {previews.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded"
                />
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 active:bg-blue-900 transition-all duration-200 transform active:scale-95 shadow-md hover:shadow-lg"
        >
          Salvează Produsul
        </button>
      </form>
    </div>
  );
}
