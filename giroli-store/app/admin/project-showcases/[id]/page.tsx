"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Category } from "@prisma/client";
import { getCategoryLabel } from "@/lib/categories";

interface ProjectShowcaseImage {
  id: string;
  url: string;
}

interface ProjectShowcase {
  id: string;
  title: string;
  description: string;
  category: Category;
  images: ProjectShowcaseImage[];
}

export default function EditProjectShowcasePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: showcaseId } = use(params);

  const [showcase, setShowcase] = useState<ProjectShowcase | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("KITCHEN");
  const [existingImages, setExistingImages] = useState<ProjectShowcaseImage[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    async function loadShowcase() {
      if (!showcaseId) return;

      try {
        const res = await fetch(`/api/project-showcases/${showcaseId}`);
        if (!res.ok) {
          alert("Proiectul nu a fost găsit");
          router.push("/admin/project-showcases");
          return;
        }

        const data: ProjectShowcase = await res.json();
        setShowcase(data);
        setTitle(data.title);
        setDescription(data.description);
        setCategory(data.category);
        setExistingImages(data.images || []);
      } catch (err) {
        console.error("Failed to load showcase:", err);
        alert("Eroare la încărcare");
        router.push("/admin/project-showcases");
      } finally {
        setLoading(false);
      }
    }

    loadShowcase();
  }, [showcaseId, router]);

  function handleNewImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    const currentTotal = existingImages.length + newImageFiles.length;
    const fileArray = Array.from(files).slice(0, 6 - currentTotal);

    setNewImageFiles(fileArray);
    setNewImagePreviews(fileArray.map((f) => URL.createObjectURL(f)));
  }

  async function handleDeleteImage(imgId: string) {
    if (!confirm("Sigur doriți să ștergeți această imagine?")) return;

    try {
      const res = await fetch(`/api/project-showcases/${showcaseId}/images/${imgId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setExistingImages(existingImages.filter((img) => img.id !== imgId));
      } else {
        alert("Eroare la ștergere");
      }
    } catch (err) {
      console.error("Failed to delete image:", err);
      alert("Eroare la ștergere");
    }
  }

  async function handleAddNewImages() {
    if (newImageFiles.length === 0) return;

    const formData = new FormData();
    newImageFiles.forEach((file) => formData.append("images", file));

    try {
      const res = await fetch(`/api/project-showcases/${showcaseId}/add-images`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const updatedShowcase: ProjectShowcase = await res.json();
        setExistingImages(updatedShowcase.images);
        setNewImageFiles([]);
        setNewImagePreviews([]);
        const fileInput = document.getElementById("new-images") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        const error = await res.json();
        alert(error.error || "Eroare la adăugare imagini");
      }
    } catch (err) {
      console.error("Failed to add images:", err);
      alert("Eroare la adăugare imagini");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      let currentImages = [...existingImages];
      
      if (newImageFiles.length > 0) {
        const formData = new FormData();
        newImageFiles.forEach((file) => formData.append("images", file));

        const addRes = await fetch(`/api/project-showcases/${showcaseId}/add-images`, {
          method: "POST",
          body: formData,
        });

        if (addRes.ok) {
          const updatedShowcase: ProjectShowcase = await addRes.json();
          currentImages = updatedShowcase.images;
          setExistingImages(updatedShowcase.images);
          setNewImageFiles([]);
          setNewImagePreviews([]);
        } else {
          const error = await addRes.json();
          alert(error.error || "Eroare la adăugare imagini");
          setSaving(false);
          return;
        }
      }

      const res = await fetch(`/api/project-showcases/${showcaseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          images: currentImages.map((img) => img.url),
          newImages: [],
        }),
      });

      if (res.ok) {
        router.push("/admin/project-showcases");
      } else {
        const error = await res.json();
        alert(error.error || "Eroare la salvare");
      }
    } catch (err) {
      console.error("Failed to update showcase:", err);
      alert("Eroare la salvare");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Sigur doriți să ștergeți acest proiect?")) return;

    try {
      const res = await fetch(`/api/project-showcases/${showcaseId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.push("/admin/project-showcases");
      } else {
        alert("Eroare la ștergere");
      }
    } catch (err) {
      console.error("Failed to delete:", err);
      alert("Eroare la ștergere");
    }
  }

  if (loading) {
    return <div className="p-6">Se încarcă...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Editează Proiect</h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
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
          className="border p-2 w-full rounded-lg"
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

        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div>
            <label className="block mb-2 font-semibold">Imagini existente</label>
            <div className="grid grid-cols-3 gap-4 mb-4">
              {existingImages.map((img) => (
                <div key={img.id} className="relative">
                  <img
                    src={img.url}
                    alt="Existing"
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(img.id)}
                    className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-sm hover:bg-red-700"
                  >
                    Șterge
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add New Images */}
        {existingImages.length < 6 && (
          <div>
            <label className="block mb-2 font-semibold">
              Adaugă imagini noi ({existingImages.length + newImageFiles.length}/6)
            </label>
            <input
              id="new-images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleNewImageSelect}
              className="border p-2 w-full rounded-lg mb-2"
            />
            {newImagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mb-4">
                {newImagePreviews.map((preview, idx) => (
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
            {newImageFiles.length > 0 && (
              <button
                type="button"
                onClick={handleAddNewImages}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 mb-4"
              >
                Adaugă imagini
              </button>
            )}
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 active:bg-blue-900 transition-all duration-200 transform active:scale-95 shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {saving ? "Se salvează..." : "Salvează"}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 active:bg-red-800 transition-all duration-200 transform active:scale-95 shadow-md hover:shadow-lg"
          >
            Șterge
          </button>
        </div>
      </form>
    </div>
  );
}

