"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

interface Employee {
  id: string;
  name: string;
  role: string;
  description: string;
  imageUrl: string;
}

export default function EditEmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: employeeId } = use(params);

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    async function loadEmployee() {
      if (!employeeId) return;

      try {
        const res = await fetch(`/api/employees/${employeeId}`);
        if (!res.ok) {
          alert("Angajatul nu a fost găsit");
          router.push("/admin/employees");
          return;
        }

        const data: Employee = await res.json();
        setEmployee(data);
        setName(data.name);
        setRole(data.role);
        setDescription(data.description);
        setPreview(data.imageUrl);
      } catch (err) {
        console.error("Failed to load employee:", err);
        alert("Eroare la încărcare");
        router.push("/admin/employees");
      } finally {
        setLoading(false);
      }
    }

    loadEmployee();
  }, [employeeId, router]);

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
    setSaving(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("role", role);
    formData.append("description", description);
    if (image) {
      formData.append("image", image);
    }

    try {
      const res = await fetch(`/api/employees/${employeeId}`, {
        method: "PATCH",
        body: formData,
      });

      if (res.ok) {
        router.push("/admin/employees");
      } else {
        alert("Eroare la salvare");
      }
    } catch (err) {
      console.error("Failed to save:", err);
      alert("Eroare la salvare");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Sigur doriți să ștergeți acest angajat?")) return;

    try {
      const res = await fetch(`/api/employees/${employeeId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.push("/admin/employees");
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
      <h1 className="text-2xl font-bold mb-4">Editează Angajat</h1>

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

