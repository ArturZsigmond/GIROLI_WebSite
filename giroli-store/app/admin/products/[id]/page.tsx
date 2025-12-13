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
          alert("Product not found");
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
        alert("Failed to load product");
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
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      const res = await fetch(`/api/products/${productId}/images/${imgId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setExistingImages(existingImages.filter((img) => img.id !== imgId));
      } else {
        alert("Failed to delete image");
      }
    } catch (err) {
      console.error("Failed to delete image:", err);
      alert("Failed to delete image");
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
        alert(error.error || "Failed to add images");
      }
    } catch (err) {
      console.error("Failed to add images:", err);
      alert("Failed to add images");
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
          alert(error.error || "Failed to add images");
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
        alert("Product updated successfully!");
        router.push("/admin/products");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to update product");
      }
    } catch (err) {
      console.error("Failed to update product:", err);
      alert("Failed to update product");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6">
        <p>Product not found</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Product</h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div>
          <label className="block mb-1 font-semibold">Title</label>
          <input
            type="text"
            className="border p-2 w-full rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Price (RON)</label>
          <input
            type="number"
            className="border p-2 w-full rounded"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Description</label>
          <textarea
            className="border p-2 w-full rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Category</label>
          <select
            className="border p-2 w-full rounded"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            required
          >
            <option value="KITCHEN">Kitchen</option>
            <option value="BATHROOM">Bathroom</option>
            <option value="BEDROOM">Bedroom</option>
            <option value="LIVING">Living</option>
            <option value="GENERAL">General</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-semibold">Height (cm)</label>
            <input
              type="number"
              step="0.01"
              className="border p-2 w-full rounded"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Width (cm)</label>
            <input
              type="number"
              step="0.01"
              className="border p-2 w-full rounded"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Depth (cm)</label>
            <input
              type="number"
              step="0.01"
              className="border p-2 w-full rounded"
              value={depth}
              onChange={(e) => setDepth(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Weight (kg)</label>
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
          <label className="block mb-1 font-semibold">Existing Images</label>
          {existingImages.length === 0 ? (
            <p className="text-gray-500 text-sm">No images</p>
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
              Add New Images (max {6 - existingImages.length} more)
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
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Add These Images
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

