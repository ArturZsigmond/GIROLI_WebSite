import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { ProductDetailClient } from "./ProductDetailClient";
import { prisma } from "@/lib/prisma";

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
  createdAt: Date;
}

// Revalidate every 60 seconds
export const revalidate = 60;

async function getProductData(id: string) {
  // Fetch product and reviews in parallel for maximum speed
  const [product, reviews] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        categories: true,
      },
    }),
    prisma.review.findMany({
      where: { productId: id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!product) {
    return null;
  }

  // Calculate review stats
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  return {
    product: product as Product,
    reviews: reviews as Review[],
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews: reviews.length,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getProductData(id);

  if (!data) {
    notFound();
  }

  const { product, reviews, averageRating, totalReviews } = data;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <ProductDetailClient
        product={product}
        initialReviews={reviews.map((r) => ({
          ...r,
          createdAt: r.createdAt.toISOString(),
        }))}
        initialAverageRating={averageRating}
        initialTotalReviews={totalReviews}
      />
    </div>
  );
}

