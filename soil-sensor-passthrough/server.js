/**
 * Standalone HTTP ingest for sensor modules.
 * Mode `proxy` (default): forwards requests to upstream SoilProject URL.
 * Mode `firebase`: stores readings directly in Firebase.
 */
import express from "express";
import { initializeApp, getApps, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getDatabase } from "firebase-admin/database";

const PORT = Number(process.env.PORT) || 8787;
const INGEST_SECRET = process.env.INGEST_SECRET || "";
const MODE = (process.env.SOIL_MODE || "proxy").toLowerCase(); // proxy | firebase
const UPSTREAM_BASE = (process.env.SOIL_UPSTREAM_BASE || "https://soilproject-fddd0.web.app").replace(/\/$/, "");
const TARGET = (process.env.SOIL_FIREBASE_TARGET || "firestore").toLowerCase(); // used in firebase mode only

function initFirebase() {
  if (getApps().length) return;
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const databaseURL = TARGET === "rtdb" ? process.env.FIREBASE_DATABASE_URL : undefined;
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
  return {
    deviceId,
    temp,
    ph,
    moisture,
    receivedAt: Date.now(),
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

function buildTarget(req) {
  const full = new URL(req.originalUrl, `http://${req.headers.host}`);
  return `${UPSTREAM_BASE}${full.pathname}${full.search}`;
}

const app = express();

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "soil-sensor-passthrough", mode: MODE, upstream: UPSTREAM_BASE });
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

  if (MODE === "proxy") {
    const target = buildTarget(req);
    try {
      const upstreamRes = await fetch(target, {
        method: req.method,
        headers: { Accept: req.headers.accept || "*/*" },
        redirect: "manual",
      });
      const contentType = upstreamRes.headers.get("content-type") || "application/octet-stream";
      res.status(upstreamRes.status);
      res.setHeader("content-type", contentType);
      res.setHeader("x-soil-proxy-upstream", UPSTREAM_BASE);
      const body = Buffer.from(await upstreamRes.arrayBuffer());
      return res.send(body);
    } catch (e) {
      return res.status(502).json({
        error: "Proxy failed",
        target,
        message: e instanceof Error ? e.message : String(e),
      });
    }
  }

  try {
    initFirebase();
  } catch (e) {
    return res.status(500).json({
      error: "Firebase not configured",
      hint: "Set FIREBASE_SERVICE_ACCOUNT_JSON or switch SOIL_MODE=proxy",
      message: e instanceof Error ? e.message : String(e),
    });
  }
  const payload = buildPayload(deviceId, req.query);
  try {
    const meta = await writeFirebase(deviceId, payload);
    return res.json({ ok: true, mode: "firebase", ...meta, deviceId });
  } catch (e) {
    return res.status(502).json({
      error: "Firebase write failed",
      message: e instanceof Error ? e.message : String(e),
    });
  }
}

// Matches: /123456?temp=10.4&ph=7&moisture=73
app.get("/:deviceId", (req, res) => {
  if (req.params.deviceId === "health") return res.redirect("/health");
  return handleIngest(req, res, req.params.deviceId);
});

// Matches: /123456/temp=10.4;ph=7;moisture=65
app.get("/:deviceId/:sensorPath", (req, res) => {
  return handleIngest(req, res, req.params.deviceId);
});

// Explicit path variants
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
  console.log(`mode=${MODE} upstream=${UPSTREAM_BASE}`);
});
