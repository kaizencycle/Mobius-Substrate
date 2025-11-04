import type { Request, Response } from "express";

/**
 * GET /gi
 * Returns current Global Integrity (GI) score
 */
export async function giStatus(_req: Request, res: Response) {
  // TODO: Wire to GI aggregator / attestation indexer
  // For now, return baseline from config
  const gi = 0.999;
  
  res.json({ 
    gi, 
    updated_at: new Date().toISOString(),
    status: gi >= 0.950 ? "healthy" : gi >= 0.900 ? "warning" : "critical"
  });
}
