// apps/portal/app/api/repo/badge/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Import and call the digest endpoint directly
    const { GET: getDigest } = await import("../digest/route");
    const response = await getDigest();
    
    if (!response.ok) {
      throw new Error("Digest fetch failed");
    }
    
    const d = await response.json();
    
    // Format badge message (limit length for badge display)
    const message = d.repo && d.head_short 
      ? `${d.repo.split('/')[1]}@${d.head_short} • PRs ${d.open_prs} • Issues ${d.open_issues}`
      : "unavailable";
    
    return NextResponse.json({
      schemaVersion: 1,
      label: "Repo",
      message: message,
      color: "blue"
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600"
      }
    });
  } catch (error) {
    return NextResponse.json({
      schemaVersion: 1,
      label: "Repo",
      message: "unavailable",
      color: "gray"
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600"
      }
    });
  }
}
