"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Category } from "@prisma/client";

interface ProductImage {
  id: string;
  url: string;
}

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: Category;
  height?: number | null;
  width?: number | null;
  depth?: number | null;
  weight?: number | null;
  material?: string | null;
  images: ProductImage[];
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: productId } = use(params);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("KITCHEN");
  const [height, setHeight] = useState("");
  const [width, setWidth] = useState("");
  const [depth, setDepth] = useState("");
  const [weight, setWeight] = useState("");
  const [material, setMaterial] = useState("");

  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    async function loadProduct() {
      if (!productId) return;

      try {
        const res = await fetch(`/api/products/${productId}`);
        if (!res.ok) {
          alert("Produsul nu a fost găsit");
          router.push("/admin/products");
          return;
        }

        const data: Product = await res.json();
        setProduct(data);
        setTitle(data.title);
        setPrice(data.price.toString());
        setDescription(data.description);
        setCategory(data.category);
        setHeight(data.height?.toString() || "");
        setWidth(data.width?.toString() || "");
        setDepth(data.depth?.toString() || "");
        setWeight(data.weight?.toString() || "");
        setMaterial(data.material || "");
        setExistingImages(data.images || []);
      } catch (err) {
        console.error("Failed to load product:", err);
        alert("Eroare la încărcarea produsului");
        router.push("/admin/products");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId, router]);

  function handleNewImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    const currentTotal = existingImages.length + newImageFiles.length;
    const fileArray = Array.from(files).slice(0, 6 - currentTotal);

    setNewImageFiles(fileArray);
    setNewImagePreviews(fileArray.map((f) => URL.createObjectURL(f)));
  }

  async function handleDeleteImage(imgId: string) {
    if (!confirm("Ești sigur că vrei să ștergi această imagine?")) return;

    try {
      const res = await fetch(`/api/products/${productId}/images/${imgId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setExistingImages(existingImages.filter((img) => img.id !== imgId));
      } else {
        alert("Eroare la ștergerea imaginii");
      }
    } catch (err) {
      console.error("Failed to delete image:", err);
      alert("Eroare la ștergerea imaginii");
    }
  }

  async function handleAddNewImages() {
    if (newImageFiles.length === 0) return;

    const formData = new FormData();
    newImageFiles.forEach((file) => formData.append("images", file));

    try {
      const res = await fetch(`/api/products/${productId}/add-images`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const updatedProduct: Product = await res.json();
        setExistingImages(updatedProduct.images);
        setNewImageFiles([]);
        setNewImagePreviews([]);
        // Reset file input
        const fileInput = document.getElementById("new-images") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        const error = await res.json();
        alert(error.error || "Eroare la adăugarea imaginilor");
      }
    } catch (err) {
      console.error("Failed to add images:", err);
      alert("Eroare la adăugarea imaginilor");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      let currentImages = [...existingImages];
      
      // First, add any new images if there are any
      if (newImageFiles.length > 0) {
        const formData = new FormData();
        newImageFiles.forEach((file) => formData.append("images", file));

        const addRes = await fetch(`/api/products/${productId}/add-images`, {
          method: "POST",
          body: formData,
        });

        if (addRes.ok) {
          const updatedProduct: Product = await addRes.json();
          currentImages = updatedProduct.images; // Use the updated images list
          setExistingImages(updatedProduct.images);
          setNewImageFiles([]);
          setNewImagePreviews([]);
        } else {
          const error = await addRes.json();
          alert(error.error || "Eroare la adăugarea imaginilor");
          setSaving(false);
          return;
        }
      }

      // Then update the product with current images
      const res = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          price: Number(price),
          description,
          category,
          height: height ? Number(height) : null,
          width: width ? Number(width) : null,
          depth: depth ? Number(depth) : null,
          weight: weight ? Number(weight) : null,
          material: material || null,
          images: currentImages.map((img) => img.url), // Use currentImages which includes newly added ones
          newImages: [],
        }),
      });

      if (res.ok) {
        alert("Produs actualizat cu succes!");
        router.push("/admin/products");
      } else {
        const error = await res.json();
        alert(error.error || "Eroare la actualizarea produsului");
      }
    } catch (err) {
      console.error("Failed to update product:", err);
      alert("Eroare la actualizarea produsului");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <p>Se încarcă produsul...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6">
        <p>Produsul nu a fost găsit</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Editează Produsul</h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div>
          <label className="block mb-1 font-semibold">Titlu</label>
          <input
            type="text"
            className="border p-2 w-full rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Preț (RON)</label>
          <input
            type="number"
            className="border p-2 w-full rounded"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Descriere</label>
          <textarea
            className="border p-2 w-full rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Categorie</label>
          <select
            className="border p-2 w-full rounded"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            required
          >
            <option value="KITCHEN">Bucătărie</option>
            <option value="BATHROOM">Baie</option>
            <option value="BEDROOM">Dormitor</option>
            <option value="LIVING">Living</option>
            <option value="GENERAL">General</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-semibold">Înălțime (cm)</label>
            <input
              type="number"
              step="0.01"
              className="border p-2 w-full rounded"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Lățime (cm)</label>
            <input
              type="number"
              step="0.01"
              className="border p-2 w-full rounded"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Adâncime (cm)</label>
            <input
              type="number"
              step="0.01"
              className="border p-2 w-full rounded"
              value={depth}
              onChange={(e) => setDepth(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Greutate (kg)</label>
            <input
              type="number"
              step="0.01"
              className="border p-2 w-full rounded"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block mb-1 font-semibold">Material</label>
          <input
            type="text"
            className="border p-2 w-full rounded"
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
          />
        </div>

        {/* Existing Images */}
        <div>
          <label className="block mb-1 font-semibold">Imagini Existente</label>
          {existingImages.length === 0 ? (
            <p className="text-gray-500 text-sm">Fără imagini</p>
          ) : (
            <div className="grid grid-cols-3 gap-3 mt-2">
              {existingImages.map((img) => (
                <div key={img.id} className="relative">
                  <img
                    src={img.url}
                    alt="Product"
                    className="w-full h-32 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(img.id)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add New Images */}
        {existingImages.length < 6 && (
          <div>
            <label className="block mb-1 font-semibold">
              Adaugă Imagini Noi (max {6 - existingImages.length} în plus)
            </label>
            <input
              id="new-images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleNewImageSelect}
              className="border p-2 w-full rounded"
            />

            {newImagePreviews.length > 0 && (
              <div className="mt-3">
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {newImagePreviews.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded border"
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleAddNewImages}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 active:bg-green-800 transition-all duration-200 transform active:scale-95 shadow-md hover:shadow-lg"
                >
                  Adaugă Aceste Imagini
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 active:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform active:scale-95 disabled:transform-none shadow-md hover:shadow-lg"
          >
            {saving ? "Se salvează..." : "Salvează Modificările"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-500 active:bg-gray-600 transition-all duration-200 transform active:scale-95 shadow-md hover:shadow-lg"
          >
            Anulează
          </button>
        </div>
      </form>
    </div>
  );
}

