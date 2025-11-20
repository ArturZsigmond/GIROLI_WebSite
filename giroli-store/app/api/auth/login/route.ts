import { prisma } from "@/lib/prisma";
import { verifyPassword, createAdminJWT, setAdminCookie } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    return Response.json({ error: "Email sau parolă greșită." }, { status: 401 });
  }

  const isValid = await verifyPassword(password, admin.password);
  if (!isValid) {
    return Response.json({ error: "Email sau parolă greșită." }, { status: 401 });
  }

  const token = createAdminJWT(admin.id);
  setAdminCookie(token);

  return Response.json({ success: true });
}
