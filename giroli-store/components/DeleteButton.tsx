"use client";

export function DeleteButton({ productId }: { productId: string }) {
  async function handleDelete() {
    if (!confirm("Ești sigur că vrei să ștergi acest produs?")) return;

    const res = await fetch(`/api/products/${productId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      alert("Produs șters!");
      window.location.reload(); // Refresh page
    } else {
      alert("Eroare la ștergerea produsului.");
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="text-red-600 text-sm ml-3 hover:text-red-700 font-semibold px-3 py-1 rounded hover:bg-red-50 transition-all duration-200"
    >
      Șterge
    </button>
  );
}
