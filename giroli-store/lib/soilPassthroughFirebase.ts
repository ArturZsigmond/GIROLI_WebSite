import { initializeApp, getApps, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getDatabase } from "firebase-admin/database";

const INGEST_SECRET = process.env.INGEST_SECRET || "";
const TARGET = (process.env.SOIL_FIREBASE_TARGET || "firestore").toLowerCase();

export function checkSoilIngestAuth(req: Request, url: URL): boolean {
  if (!INGEST_SECRET) return true;
  const q = url.searchParams.get("secret") ?? url.searchParams.get("key");
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  return q === INGEST_SECRET || bearer === INGEST_SECRET;
}

function initFirebase() {
  if (getApps().length) return;
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const databaseURL =
    TARGET === "rtdb" ? process.env.FIREBASE_DATABASE_URL : undefined;
  if (TARGET === "rtdb" && !databaseURL) {
    throw new Error(
      "FIREBASE_DATABASE_URL is required when SOIL_FIREBASE_TARGET=rtdb"
    );
  }
  if (json) {
    const parsed = JSON.parse(json) as Record<string, unknown>;
    const opts: { credential: ReturnType<typeof cert>; databaseURL?: string } = {
      credential: cert(parsed as Parameters<typeof cert>[0]),
    };
    if (databaseURL) opts.databaseURL = databaseURL;
    initializeApp(opts);
    return;
  }
  initializeApp({
    credential: applicationDefault(),
    ...(databaseURL ? { databaseURL } : {}),
  });
}

function parseNumber(v: string | null): number | undefined {
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export function buildSoilPayload(deviceId: string, searchParams: URLSearchParams) {
  const temp = parseNumber(searchParams.get("temp") ?? searchParams.get("t"));
  const ph = parseNumber(searchParams.get("ph"));
  const moisture = parseNumber(
    searchParams.get("moisture") ?? searchParams.get("m")
  );
  return {
    deviceId,
    temp,
    ph,
    moisture,
    receivedAt: Date.now(),
  };
}

export async function writeSoilReading(
  deviceId: string,
  payload: ReturnType<typeof buildSoilPayload>
) {
  initFirebase();
  if (TARGET === "rtdb") {
    const db = getDatabase();
    const base = `soilDevices/${deviceId}`;
    await db.ref(`${base}/latest`).set(payload);
    await db.ref(`${base}/readings`).push(payload);
    return { store: "rtdb" as const };
  }
  const coll = process.env.SOIL_FIRESTORE_COLLECTION || "soilReadings";
  const db = getFirestore();
  await db.collection(coll).add(payload);
  return { store: "firestore" as const, collection: coll };
}
