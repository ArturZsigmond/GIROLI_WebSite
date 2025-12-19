import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { path } = await req.json();

    if (!path) {
      return NextResponse.json(
        { error: "Path is required" },
        { status: 400 }
      );
    }

    // Don't track admin pages
    if (path.startsWith("/admin") || path.startsWith("/admin-login")) {
      return NextResponse.json({ success: true, skipped: true });
    }

    // Record the site visit
    await prisma.siteVisit.create({
      data: {
        path: path || "/",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error recording site visit:", error);
    return NextResponse.json(
      { error: "Failed to record visit" },
      { status: 500 }
    );
  }
}

