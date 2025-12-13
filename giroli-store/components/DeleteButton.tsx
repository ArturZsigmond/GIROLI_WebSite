"use client";

export function DeleteButton({ productId }: { productId: string }) {
  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const res = await fetch(`/api/products/${productId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      alert("Product deleted!");
      window.location.reload(); // Refresh page
    } else {
      alert("Failed deleting product.");
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="text-red-600 text-sm ml-3 hover:underline"
    >
      Delete
    </button>
  );
}
