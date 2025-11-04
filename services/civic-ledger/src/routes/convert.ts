import type { Request, Response } from "express";
import { shardsToCredits, creditsToShards } from "@civic/integrity-units";

/**
 * POST /convert/shards-to-credits
 * Request: { shards: string }
 * Response: { credits: number }
 */
export function shardsToCreditsRoute(req: Request, res: Response) {
  const { shards } = req.body || {};
  
  if (typeof shards !== "string") {
    return res.status(400).json({ 
      error: "shards must be string (bigint representation)" 
    });
  }
  
  try {
    const shardsBI = BigInt(shards);
    const credits = shardsToCredits(shardsBI);
    return res.json({ credits });
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
}

/**
 * POST /convert/credits-to-shards
 * Request: { credits: number }
 * Response: { shards: string }
 */
export function creditsToShardsRoute(req: Request, res: Response) {
  const { credits } = req.body || {};
  
  if (typeof credits !== "number") {
    return res.status(400).json({ 
      error: "credits must be number" 
    });
  }
  
  try {
    const shards = creditsToShards(credits);
    return res.json({ shards: shards.toString() });
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
}
