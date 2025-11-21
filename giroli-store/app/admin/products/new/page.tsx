"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("KITCHEN");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("price", price);
    formData.append("description", description);
    formData.append("category", category);

    if (imageFile) formData.append("image", imageFile);

    const res = await fetch("/api/products", {
      method: "POST",
      body: formData,
    });

    if (res.ok) router.push("/admin/products");
    else alert("Error saving product");
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Add Product</h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">

        <input
          type="text"
          placeholder="Title"
          className="border p-2 w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Price"
          className="border p-2 w-full"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />

        <textarea
          placeholder="Description"
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
            >
            <option value="KITCHEN">Kitchen</option>
            <option value="BATHROOM">Bathroom</option>
            <option value="BEDROOM">Bedroom</option>
            <option value="LIVING">Living</option>
            <option value="GENERAL">General</option>
            </select>


        {/* IMAGE INPUT */}
        <div>
          <label className="block mb-1 font-semibold">Product Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="border p-2 w-full"
          />

          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="mt-3 w-48 h-48 object-cover rounded"
            />
          )}
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save Product
        </button>

      </form>
    </div>
  );
}
