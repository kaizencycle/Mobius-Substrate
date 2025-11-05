// apps/portal/app/api/sr/badge/route.ts
import { NextResponse } from "next/server";

function colorFor(verdict: string) {
  switch (verdict) {
    case "ADOPT": return "green";
    case "SHADOW": return "orange";
    case "DEFER": return "red";
    default: return "gray";
  }
}

export async function GET() {
  try {
    // Import and call the latest SR endpoint directly
    const { GET: getLatestSR } = await import("../latest/route");
    const response = await getLatestSR();
    const data = await response.json();
    
    const verdict = String(data?.details?.verdict ?? "UNKNOWN").toUpperCase();
    const badge = {
      schemaVersion: 1,
      label: "SR Verdict",
      message: verdict,
      color: colorFor(verdict)
    };
    return NextResponse.json(badge, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300"
      }
    });
  } catch (error) {
    // Fallback to default badge
    return NextResponse.json({
      schemaVersion: 1,
      label: "SR Verdict",
      message: "UNKNOWN",
      color: "gray"
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300"
      }
    });
  }
}
