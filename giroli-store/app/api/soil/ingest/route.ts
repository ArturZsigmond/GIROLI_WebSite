import { NextResponse } from "next/server";
import {
  buildSoilPayload,
  checkSoilIngestAuth,
  writeSoilReading,
} from "@/lib/soilPassthroughFirebase";

export const runtime = "nodejs";

/** GET /api/soil/ingest?device=123&temp=1&ph=7&moisture=50 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const deviceId = url.searchParams.get("device") ?? url.searchParams.get("id");
  if (!deviceId?.trim()) {
    return NextResponse.json(
      { error: "Missing device id (use ?device= or ?id=)" },
      { status: 400 }
    );
  }

  if (!checkSoilIngestAuth(req, url)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = buildSoilPayload(deviceId, url.searchParams);
    const meta = await writeSoilReading(deviceId, payload);
    return NextResponse.json({ ok: true, ...meta, deviceId });
  } catch (e) {
    console.error("soil ingest:", e);
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("FIREBASE_DATABASE_URL") || msg.includes("JSON")) {
      return NextResponse.json(
        {
          error: "Firebase not configured",
          hint: "Set FIREBASE_SERVICE_ACCOUNT_JSON on Railway",
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Firebase write failed", message: msg },
      { status: 502 }
    );
  }
}
