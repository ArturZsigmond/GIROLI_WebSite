import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();

  const product = await prisma.product.create({
    data: {
      title: data.title,
      description: data.description,
      price: data.price,
      category: data.category,
      height: data.height,
      width: data.width,
      depth: data.depth,
      weight: data.weight,
      material: data.material,
      images: {
        create: data.images.map((url: string) => ({ url })),
      },
    },
  });

  return Response.json(product);
}

export async function GET() {
  const products = await prisma.product.findMany({
    include: { images: true },
  });

  return Response.json(products);
}
