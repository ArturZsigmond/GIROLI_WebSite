import { removeAdminCookie } from "@/lib/auth";

export async function POST() {
  removeAdminCookie();
  return Response.json({ success: true });
}
