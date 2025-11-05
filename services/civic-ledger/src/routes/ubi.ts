import type { Request, Response } from 'express';
import config from '../config.js';
import { SHARDS_PER_CREDIT } from '@civic/integrity-units';
import { calculateUBI } from '../services/ubi/calculator.js';

export async function ubiPreviewRoute(req: Request, res: Response) {
  try {
    const q = req.method === 'POST' ? req.body : req.query;

    const N  = Number(q.N ?? q.n ?? 10000);
    const I  = BigInt(q.I ?? q.i ?? 0);
    const Re = BigInt(q.Re ?? q.re ?? 0);
    const D  = BigInt(q.D ?? q.d ?? 0);
    const GI = Number(q.GI ?? q.gi ?? 0.982);

    // Optional overrides or fallbacks
    const reserves12m = BigInt(q.reservesShards ?? config.treasury?.reserves12m ?? 0);
    const circulating = BigInt(q.circulatingShards ?? config.metrics?.circulatingShards ?? 0);

    if (!Number.isFinite(N) || N <= 0) {
      return res.status(400).json({ error: "Invalid 'N' (eligible population)." });
    }
    if (![I, Re, D].every(v => typeof v === 'bigint')) {
      return res.status(400).json({ error: "I/Re/D must be integer (shards)." });
    }
    if (!Number.isFinite(GI) || GI < 0 || GI > 1) {
      return res.status(400).json({ error: "Invalid 'GI' (0..1)." });
    }

    // TODO: use time-weighted GI instead of spot GI (prevent gaming)
    const r = calculateUBI(
      { N, I, Re, D, GI, reservesShards: reserves12m, circulatingShards: circulating },
      config.ubi as any
    );

    // UX-friendly response
    const shardsStr = r.perCapitaFinal.toString();
    const credits = r.credits;
    const display =
      credits >= 0.1
        ? `${credits.toFixed(3)} credits`
        : `${(credits * 1000).toFixed(2)} milli-credits`;

    // TODO: integrate eligibility (KYC/Sybil resistance) before distribution
    // TODO: atomic epoch transitions in distribution worker

    res.json({
      amount: {
        shards: shardsStr,
        credits,
        display
      },
      context: {
        epoch: 0,                   // TODO: compute from ledger epoch
        gi_at_payout: GI,
        gi_multiplier: r.giMultiplier,
        total_recipients: N,
        your_share_of_pool: `${(1 / N * 100).toFixed(6)}%`
      },
      params: {
        SHARDS_PER_CREDIT: SHARDS_PER_CREDIT.toString(),
        caps: config.ubi.caps,
        cadence: config.ubi.cadence,
        epoch_length_days: config.ubi.epoch_length_days
      },
      explanation: "UBI is computed in shards to eliminate rounding drift. Pool = α·Issuance + β·Decay + Donations, capped by reserves & circulating supply; GI gates apply. Display is shown in credits."
    });
  } catch (e: any) {
    res.status(500).json({ error: 'UBI preview failed', detail: String(e?.message ?? e) });
  }
}

