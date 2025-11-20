"use client";

import { useState } from "react";

export default function NewProductPage() {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function uploadImage(file: File) {
    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();

    setImages((prev) => [...prev, data.url]);
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);

    const form = e.target;
    const payload = {
      title: form.title.value,
      description: form.description.value,
      price: Number(form.price.value),
      category: form.category.value,
      height: Number(form.height.value),
      width: Number(form.width.value),
      depth: Number(form.depth.value),
      weight: Number(form.weight.value),
      material: form.material.value,
      images,
    };

    await fetch("/api/products", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    window.location.href = "/admin/products";
  }

  return (
    <div>
      <h1 className="text-3xl mb-6 font-semibold">Adaugă produs</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
        <input name="title" placeholder="Titlu" className="p-2 border rounded" />
        <input name="price" placeholder="Preț (RON)" className="p-2 border rounded" />

        <select name="category" className="p-2 border rounded">
          <option value="KITCHEN">Bucătărie</option>
          <option value="BATHROOM">Baie</option>
          <option value="BEDROOM">Dormitor</option>
          <option value="LIVING">Living</option>
          <option value="GENERAL">Mobilier general</option>
        </select>

        <input name="material" placeholder="Material" className="p-2 border rounded" />

        <input name="height" placeholder="Înălțime (cm)" className="p-2 border rounded" />
        <input name="width" placeholder="Lățime (cm)" className="p-2 border rounded" />
        <input name="depth" placeholder="Adâncime (cm)" className="p-2 border rounded" />
        <input name="weight" placeholder="Greutate (kg)" className="p-2 border rounded" />

        <textarea
          name="description"
          placeholder="Descriere"
          className="border rounded p-2 col-span-2 h-32"
        />

        <div className="col-span-2">
          <label className="block mb-2 font-semibold">Imagini</label>
          <input
            type="file"
            onChange={(e) => uploadImage(e.target.files![0])}
            className="block mb-4"
          />
          <div className="flex gap-4">
            {images.map((url) => (
              <img key={url} src={url} className="h-24 rounded shadow" />
            ))}
          </div>
        </div>

        <button
          disabled={loading}
          className="col-span-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Se salvează..." : "Salvează produsul"}
        </button>
      </form>
    </div>
  );
}
