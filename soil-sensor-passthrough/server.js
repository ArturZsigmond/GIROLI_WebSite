/**
 * Standalone ingest: HTTP (plain) from legacy cellular modules → Firebase.
 * Deploy this service separately from the main website (e.g. Railway, VPS, PM2).
 */
import express from "express";
import { initializeApp, getApps, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getDatabase } from "firebase-admin/database";

const PORT = Number(process.env.PORT) || 8787;
const INGEST_SECRET = process.env.INGEST_SECRET || "";
const TARGET = (process.env.SOIL_FIREBASE_TARGET || "firestore").toLowerCase();

function initFirebase() {
  if (getApps().length) return;
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const databaseURL =
    TARGET === "rtdb" ? process.env.FIREBASE_DATABASE_URL : undefined;
  if (TARGET === "rtdb" && !databaseURL) {
    throw new Error("FIREBASE_DATABASE_URL is required when SOIL_FIREBASE_TARGET=rtdb");
  }
  if (json) {
    const parsed = JSON.parse(json);
    const opts = { credential: cert(parsed) };
    if (databaseURL) opts.databaseURL = databaseURL;
    initializeApp(opts);
    return;
  }
  initializeApp({
    credential: applicationDefault(),
    ...(databaseURL ? { databaseURL } : {}),
  });
}

function parseNumber(v) {
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function buildPayload(deviceId, query) {
  const temp = parseNumber(query.temp ?? query.t);
  const ph = parseNumber(query.ph);
  const moisture = parseNumber(query.moisture ?? query.m);
  const ts = Date.now();
  return {
    deviceId,
    temp,
    ph,
    moisture,
    receivedAt: ts,
  };
}

async function writeFirebase(deviceId, payload) {
  if (TARGET === "rtdb") {
    const db = getDatabase();
    const base = `soilDevices/${deviceId}`;
    await db.ref(`${base}/latest`).set(payload);
    await db.ref(`${base}/readings`).push(payload);
    return { store: "rtdb" };
  }
  const coll = process.env.SOIL_FIRESTORE_COLLECTION || "soilReadings";
  const db = getFirestore();
  await db.collection(coll).add(payload);
  return { store: "firestore", collection: coll };
}

const app = express();

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "soil-sensor-passthrough" });
});

function checkSecret(req) {
  if (!INGEST_SECRET) return true;
  const q = req.query.secret ?? req.query.key;
  const bearer = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  return q === INGEST_SECRET || bearer === INGEST_SECRET;
}

async function handleIngest(req, res, deviceId) {
  if (!deviceId || typeof deviceId !== "string") {
    return res.status(400).json({ error: "Missing device id" });
  }
  if (!checkSecret(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    initFirebase();
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      error: "Firebase not configured",
      hint: "Set FIREBASE_SERVICE_ACCOUNT_JSON or use ADC with GOOGLE_APPLICATION_CREDENTIALS",
    });
  }
  const payload = buildPayload(deviceId, req.query);
  try {
    const meta = await writeFirebase(deviceId, payload);
    return res.json({ ok: true, ...meta, deviceId });
  } catch (e) {
    console.error(e);
    return res.status(502).json({
      error: "Firebase write failed",
      message: e instanceof Error ? e.message : String(e),
    });
  }
}

// Matches: /123456?temp=10.4&ph=7&moisture=73
app.get("/:deviceId", (req, res) => {
  if (req.params.deviceId === "health") {
    return res.redirect("/health");
  }
  return handleIngest(req, res, req.params.deviceId);
});

// Explicit path if the device cannot use a "bare" first segment
app.get("/ingest/:deviceId", (req, res) => {
  return handleIngest(req, res, req.params.deviceId);
});

app.get("/ingest", (req, res) => {
  const deviceId = req.query.device ?? req.query.id;
  return handleIngest(req, res, deviceId);
});

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`soil-sensor-passthrough listening on http://0.0.0.0:${PORT}`);
});
