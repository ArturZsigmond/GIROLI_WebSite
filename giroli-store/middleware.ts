import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Mask for the friend's Firebase-hosted soil app (path + query forwarded as-is). */
const DEFAULT_UPSTREAM = "https://soilproject-fddd0.web.app";

function upstreamBase(): string {
  const raw = process.env.SOIL_PROXY_UPSTREAM ?? DEFAULT_UPSTREAM;
  return raw.replace(/\/$/, "");
}

/**
 * Angular SPA shell uses <base href="/"> so scripts load from the *current* host.
 * When masked under girolimob.com those JS files 404 — blank page. Point base at upstream.
 */
function rewriteAngularBaseHref(html: string, origin: string): string {
  const base = `${origin}/`;
  return html
    .replace(/<base\s+href="\/"\s*\/?>/i, `<base href="${base}">`)
    .replace(/<base\s+href='\/'\s*\/?>/i, `<base href="${base}">`);
}

/** Only URLs that the soil app serves at root: /health or /{digits}/... */
function shouldProxyToSoil(pathname: string): boolean {
  if (pathname === "/health") return true;
  return /^\/\d/.test(pathname);
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (!shouldProxyToSoil(pathname)) {
    return NextResponse.next();
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    return NextResponse.next();
  }

  const target = `${upstreamBase()}${pathname}${search}`;

  try {
    const res = await fetch(target, {
      method: req.method,
      headers: {
        Accept:
          req.headers.get("accept") ??
          "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",
        "User-Agent": req.headers.get("user-agent") ?? "giroli-soil-proxy",
        "X-Forwarded-Host": req.headers.get("host") ?? "",
        "X-Forwarded-Proto": req.nextUrl.protocol.replace(":", ""),
      },
      redirect: "manual",
      cache: "no-store",
    });

    const headers = new Headers();
    const ct = res.headers.get("content-type") ?? "";
    if (ct) headers.set("content-type", ct);
    const cc = res.headers.get("cache-control");
    headers.set("cache-control", cc ?? "no-store");

    if (req.method === "HEAD") {
      return new NextResponse(null, { status: res.status, headers });
    }

    if (ct.includes("text/html")) {
      let html = await res.text();
      html = rewriteAngularBaseHref(html, upstreamBase());
      return new NextResponse(html, { status: res.status, headers });
    }

    const body = await res.arrayBuffer();
    return new NextResponse(body, { status: res.status, headers });
  } catch (e) {
    console.error("[soil-proxy]", target, e);
    return NextResponse.json(
      { error: "Upstream proxy failed", upstream: target },
      { status: 502 }
    );
  }
}

export const config = {
  matcher: [
    "/health",
    /*
     * /123456 or /123456/temp=...;ph=... (same shapes as soil Firebase app)
     */
    "/([0-9]+)(/.*)?",
  ],
};
