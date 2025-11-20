import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { cookies as nextCookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

// --- COOKIE WRAPPERS TO AVOID TS BUG ---
function getCookieStore() {
  // Force TS to treat cookies() correctly
  return nextCookies() as unknown as {
    get: (name: string) => { value: string } | undefined;
    set: (cookie: {
      name: string;
      value: string;
      httpOnly?: boolean;
      secure?: boolean;
      sameSite?: "strict" | "lax" | "none";
      path?: string;
      maxAge?: number;
    }) => void;
    delete: (name: string) => void;
  };
}

// Password hash
export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

// Password validate
export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

// Create token
export function createAdminJWT(adminId: string) {
  return jwt.sign({ adminId }, JWT_SECRET, { expiresIn: "7d" });
}

// Store cookie
export function setAdminCookie(token: string) {
  const store = getCookieStore();
  store.set({
    name: "giroli_admin",
    value: token,
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

// Delete cookie
export function removeAdminCookie() {
  const store = getCookieStore();
  store.delete("giroli_admin");
}

// Read and verify cookie
export function getAdminIdFromCookie(): string | null {
  try {
    const store = getCookieStore();
    const token = store.get("giroli_admin")?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as { adminId: string };
    return decoded.adminId;
  } catch {
    return null;
  }
}

// Ensure admin session
export async function requireAdmin() {
  const adminId = getAdminIdFromCookie();
  if (!adminId) return null;

  return prisma.admin.findUnique({ where: { id: adminId } });
}
