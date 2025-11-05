// apps/portal/app/api/sr/latest/route.ts
import { NextResponse } from "next/server";

const KV_URL  = process.env.KV_REST_API_URL;
const KV_TOKEN= process.env.KV_REST_API_TOKEN;
const KV_KEY  = process.env.SR_KV_KEY ?? "kaizen:sr:latest";

// module-level cache as a last resort
let LAST_SR: any = null;

async function readKV() {
  if (!KV_URL || !KV_TOKEN) return null;
  try {
    const r = await fetch(`${KV_URL}/get/${encodeURIComponent(KV_KEY)}`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` },
      cache: "no-store"
    });
    if (!r.ok) return null;
    const j = await r.json();          // Upstash returns { result: "<json or string>" }
    const raw = j?.result;
    if (!raw) return null;
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const sr = await readKV();
    if (sr) {
      LAST_SR = sr;
      return NextResponse.json(sr, {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300"
        }
      });
    }
  } catch { /* ignore and fall through */ }

  if (LAST_SR) {
    return NextResponse.json(LAST_SR, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300"
      }
    });
  }

  // Fallback to env defaults if nothing persisted yet
  const fallback = {
    cycle: process.env.NEXT_PUBLIC_KAIZEN_CURRENT_CYCLE ?? "C-121",
    gi: parseFloat(process.env.NEXT_PUBLIC_KAIZEN_GI_BASELINE ?? "0.993"),
    details: {
      verdict: (process.env.NEXT_PUBLIC_SR_VERDICT ?? "UNKNOWN").toUpperCase(),
      updated_at: new Date().toISOString()
    }
  };
  
  return NextResponse.json(fallback, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300"
    }
  });
}
