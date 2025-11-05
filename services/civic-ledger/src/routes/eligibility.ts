import type { Request, Response } from 'express';
import { checkUBIEligibility } from '../services/eligibility/index.js';

export async function ubiEligibilityRoute(req: Request, res: Response) {
  const q = req.method === 'POST' ? req.body : req.query;
  const wallet = String(q.wallet ?? q.address ?? '').trim();

  if (!wallet) {
    return res.status(400).json({ error: "Missing 'wallet' query/body parameter" });
  }

  const result = await checkUBIEligibility({ walletAddress: wallet });

  return res.json(result);
}

