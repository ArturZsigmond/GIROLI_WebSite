import { prisma } from "@/lib/prisma";
import { verifyPassword, setAdminSession } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const admin = await prisma.admin.findUnique({
    where: { email },
  });

  if (!admin) {
    return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });
  }

  const isValid = await verifyPassword(password, admin.password);

  if (!isValid) {
    return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });
  }

  // Set admin session cookie
  await setAdminSession(admin.id);

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
