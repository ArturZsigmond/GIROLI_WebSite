"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";
import { useCartStore } from "@/store/cartStore";
import { getCategoryLabel } from "@/lib/categories";

interface ProductImage {
  id: string;
  url: string;
}

interface ProductCategory {
  id: string;
  category: string;
}

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  height?: number | null;
  width?: number | null;
  depth?: number | null;
  weight?: number | null;
  material?: string | null;
  images: ProductImage[];
  categories?: ProductCategory[];
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  customerName: string;
  createdAt: string;
}

interface ProductDetailClientProps {
  product: Product;
  initialReviews: Review[];
  initialAverageRating: number;
  initialTotalReviews: number;
}

export function ProductDetailClient({
  product,
  initialReviews,
  initialAverageRating,
  initialTotalReviews,
}: ProductDetailClientProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [averageRating, setAverageRating] = useState(initialAverageRating);
  const [totalReviews, setTotalReviews] = useState(initialTotalReviews);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewOrderNumber, setReviewOrderNumber] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const addToCart = useCartStore((state) => state.addItem);

  // Track product click on client side only
  useEffect(() => {
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/admin")) {
      // Fire and forget - don't block rendering
      fetch("/api/analytics/product-click", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId: product.id }),
      }).catch(() => {
        // Silently fail tracking
      });
    }
  }, [product.id]);

  const handleAddToCart = () => {
    addToCart(
      {
        id: product.id,
        title: product.title,
        price: product.price,
        imageUrl: product.images?.[0]?.url || "",
      },
      quantity
    );
    setAddedToCart(true);
    setQuantity(1);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleReviewInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/#/g, "");
    if (value.length > 8) {
      value = value.slice(0, 8);
    }
    value = value.toUpperCase();
    setReviewOrderNumber(value);
    setReviewError("");
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reviewOrderNumber.trim()) {
      setReviewError("Introduceți numărul comenzii");
      return;
    }

    if (reviewRating === 0) {
      setReviewError("Selectați un rating");
      return;
    }

    if (!reviewComment.trim()) {
      setReviewError("Introduceți un comentariu");
      return;
    }

    setSubmittingReview(true);
    setReviewError("");

    try {
      const response = await fetch(`/api/products/${product.id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderNumber: reviewOrderNumber,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setReviewError(errorData.error || "Eroare la trimiterea recenziei");
        return;
      }

      // Reload reviews
      const reviewsRes = await fetch(`/api/products/${product.id}/reviews`);
      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        setReviews(reviewsData.reviews || []);
        setAverageRating(reviewsData.averageRating || 0);
        setTotalReviews(reviewsData.totalReviews || 0);
      }

      // Reset form
      setReviewOrderNumber("");
      setReviewRating(0);
      setReviewComment("");
      setShowReviewForm(false);
    } catch (err) {
      console.error("Error submitting review:", err);
      setReviewError("Eroare la trimiterea recenziei");
    } finally {
      setSubmittingReview(false);
    }
  };

  const primaryImage =
    product && product.images && product.images.length > 0
      ? product.images[selectedImageIndex]?.url || product.images[0].url
      : null;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-700">
              Acasă
            </Link>
            <span>/</span>
            <span className="text-gray-800">{product.title}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div>
            {/* Primary Image */}
            <div className="mb-4 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center min-h-[500px]">
              {primaryImage ? (
                <img
                  src={primaryImage}
                  alt={product.title}
                  className="w-full h-auto max-h-[600px] object-contain"
                  loading="eager"
                />
              ) : (
                <div className="w-full h-96 flex items-center justify-center text-gray-400">
                  <svg
                    className="w-24 h-24"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img, index) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`border-2 rounded-lg overflow-hidden ${
                      selectedImageIndex === index
                        ? "border-blue-700"
                        : "border-gray-200 hover:border-blue-400"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={`${product.title} - Image ${index + 1}`}
                      className="w-full h-20 object-contain bg-gray-50"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-4">
              <div className="flex flex-wrap gap-2 mb-2">
                {(product.categories && product.categories.length > 0
                  ? product.categories.map((pc) => pc.category)
                  : [product.category]
                ).map((cat) => (
                  <span
                    key={cat}
                    className="inline-block bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full"
                  >
                    {getCategoryLabel(cat)}
                  </span>
                ))}
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                {product.title}
              </h1>
              <div className="text-4xl font-bold text-blue-700 mb-2">
                {product.price} RON
              </div>
              {totalReviews > 0 && (
                <a
                  href="#reviews"
                  className="flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.round(averageRating)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-gray-600">
                    {averageRating.toFixed(1)} ({totalReviews} {totalReviews === 1 ? "recenzie" : "recenzii"})
                  </span>
                </a>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Descriere
              </h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Specifications */}
            {(product.height ||
              product.width ||
              product.depth ||
              product.weight ||
              product.material) && (
              <div className="mb-6 border-t border-gray-200 pt-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Specificații
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {product.height && (
                    <div>
                      <span className="text-sm text-gray-600">Înălțime:</span>
                      <p className="font-medium text-gray-800">
                        {product.height} cm
                      </p>
                    </div>
                  )}
                  {product.width && (
                    <div>
                      <span className="text-sm text-gray-600">Lățime:</span>
                      <p className="font-medium text-gray-800">
                        {product.width} cm
                      </p>
                    </div>
                  )}
                  {product.depth && (
                    <div>
                      <span className="text-sm text-gray-600">Adâncime:</span>
                      <p className="font-medium text-gray-800">
                        {product.depth} cm
                      </p>
                    </div>
                  )}
                  {product.weight && (
                    <div>
                      <span className="text-sm text-gray-600">Greutate:</span>
                      <p className="font-medium text-gray-800">
                        {product.weight} kg
                      </p>
                    </div>
                  )}
                  {product.material && (
                    <div className="col-span-2">
                      <span className="text-sm text-gray-600">Material:</span>
                      <p className="font-medium text-gray-800">
                        {product.material}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-4">
              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <label htmlFor="quantity" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Cantitate:
                </label>
                <div className="flex items-center gap-1 border border-gray-300 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-gray-100 transition-colors font-semibold text-gray-700"
                  >
                    −
                  </button>
                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    max="50"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setQuantity(Math.min(50, Math.max(1, val)));
                    }}
                    className="w-20 text-center border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none py-2 font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(50, quantity + 1))}
                    className="px-4 py-2 hover:bg-gray-100 transition-colors font-semibold text-gray-700"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-gray-500">(max 50)</span>
              </div>
              <Button
                onClick={handleAddToCart}
                variant="primary"
                size="lg"
                className="w-full"
              >
                {addedToCart ? `✓ Adăugat ${quantity} bucăți în coș!` : `Adaugă ${quantity} în coș`}
              </Button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div id="reviews" className="mt-12 border-t border-gray-200 pt-8 scroll-mt-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Recenzii</h2>
              {totalReviews > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.round(averageRating)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-gray-600">
                    {averageRating.toFixed(1)} ({totalReviews} {totalReviews === 1 ? "recenzie" : "recenzii"})
                  </span>
                </div>
              )}
            </div>
            <Button
              onClick={() => setShowReviewForm(!showReviewForm)}
              variant="outline"
              size="md"
            >
              {showReviewForm ? "Anulează" : "Lasă o recenzie"}
            </Button>
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Lasă o recenzie</h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Număr comandă *
                  </label>
                  <div className="flex items-center">
                    <span className="text-gray-500 font-semibold mr-2">#</span>
                    <input
                      type="text"
                      value={reviewOrderNumber}
                      onChange={handleReviewInputChange}
                      placeholder="6A20FFA1"
                      maxLength={8}
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
                      style={{ textTransform: "uppercase" }}
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Doar pentru comenzi finalizate
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating *
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className={`w-10 h-10 rounded-full transition-colors ${
                          star <= reviewRating
                            ? "bg-yellow-400 text-white"
                            : "bg-gray-200 text-gray-400 hover:bg-gray-300"
                        }`}
                      >
                        <svg
                          className="w-6 h-6 mx-auto"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comentariu *
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Spuneți-ne părerea dvs. despre acest produs..."
                    required
                  />
                </div>

                {reviewError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {reviewError}
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={submittingReview}
                >
                  {submittingReview ? "Se trimite..." : "Trimite recenzia"}
                </Button>
              </form>
            </div>
          )}

          {/* Reviews List */}
          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white border border-gray-200 rounded-lg p-6"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-800">{review.customerName}</p>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Achiziție verificată
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString("ro-RO", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-5 h-5 ${
                            star <= review.rating
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Nu există recenzii pentru acest produs.</p>
              <p className="text-sm mt-2">Fii primul care lasă o recenzie!</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600">
            © {new Date().getFullYear()} Giroli Mob. Toate drepturile rezervate.
          </p>
        </div>
      </footer>
    </div>
  );
}

