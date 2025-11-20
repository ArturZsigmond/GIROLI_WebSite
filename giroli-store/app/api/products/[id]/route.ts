import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(req: Request, { params }: any) {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const id = params.id;
  const data = await req.json();

  const updated = await prisma.product.update({
    where: { id },
    data: {
      ...data,
      images: {
        deleteMany: {},
        create: data.images.map((url: string) => ({ url })),
      },
    },
  });

  return Response.json(updated);
}

export async function DELETE(_: Request, { params }: any) {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.product.delete({ where: { id: params.id } });

  return Response.json({ success: true });
}
