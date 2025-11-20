import { cookies } from "next/headers";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// ------------------------------
// SESSION HELPERS
// ------------------------------

export async function getAdminIdFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get("admin");
  if (!adminCookie) return null;
  return adminCookie.value;
}

export async function requireAdmin() {
  const adminId = await getAdminIdFromCookie();
  if (!adminId) return null; // redirect is now done in layout/pages
  return adminId;
}

export async function setAdminSession(adminId: string) {
  const cookieStore = await cookies();

  cookieStore.set({
    name: "admin",
    value: adminId,
    httpOnly: true,
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function deleteAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete("admin");
}

// ------------------------------
// PASSWORD HELPERS
// ------------------------------

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

// ------------------------------
// JWT (OPTIONAL FOR FUTURE)
// ------------------------------

export function createAdminJWT(adminId: string) {
  return jwt.sign({ adminId }, process.env.JWT_SECRET!, { expiresIn: "7d" });
}

// If login route expects this:
export async function setAdminCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set({
    name: "admin",
    value: token,
    httpOnly: true,
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}
