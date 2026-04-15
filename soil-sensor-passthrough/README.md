# Soil Sensor HTTP Relay

Standalone service for old sensor modules that can only call plain HTTP.

## What It Does

- Accepts HTTP GET requests from sensor firmware.
- In `proxy` mode (default), forwards request to upstream (e.g. `https://soilproject-fddd0.web.app`) with same path and query.
- In `firebase` mode, writes values directly to Firebase.

## Supported Incoming URLs

- `/health`
- `/{deviceId}?temp=10.4&ph=7&moisture=73`
- `/{deviceId}/temp=10.4;ph=7;moisture=73`
- `/ingest/{deviceId}?temp=10.4&ph=7&moisture=73`
- `/ingest?device={deviceId}&temp=10.4&ph=7&moisture=73`

## Quick Start

1. `npm install`
2. Copy `env.example` to `.env` and edit values.
3. Start with `npm start`

## Firmware URL Examples

Assume relay host is `12.34.56.78` on port `8787`:

- `http://12.34.56.78:8787/123456?temp=10.4&ph=7&moisture=73`
- `http://12.34.56.78:8787/123456/temp=10.4;ph=7;moisture=73`
- `http://12.34.56.78:8787/ingest?device=123456&temp=10.4&ph=7&moisture=73`

If `INGEST_SECRET` is set:

- `http://12.34.56.78:8787/123456?temp=10.4&ph=7&moisture=73&secret=YOUR_SECRET`

