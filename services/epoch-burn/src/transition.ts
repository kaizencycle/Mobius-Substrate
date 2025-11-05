import { db } from './db.js';
import { calculateDecay } from './decay.js';
import { computeUBIPool } from './ubi.js';
import { distributeUBI } from './distribute.js';
import { attestEpochTransition } from './attest.js';
import { cfg } from './config.js';

export async function executeEpochTransition() {
  return db.transaction(async (tx) => {
    // 1) Freeze operations
    await tx.setMaintenanceMode(true);

    // 2) Decay
    const decay = await calculateDecay();

    // 3) Compute UBI pool from decay + issuance
    const ubiPool = await computeUBIPool({
      N: 10_000,                        // TODO: query eligible set size
      I: 0n,                            // TODO: pull net issuance (shards)
      Re: decay.reabsorbedShards,       // from decay
      D: 0n,                            // TODO: donations/fees
      GI: 0.982,                        // TODO: GI aggregator (time-weighted)
      reservesShards: 10_000_000_000_000n, // TODO: from treasury
      circulatingShards: 50_000_000_000_000n, // TODO: from metrics
      cfg: cfg.ubi
    });

    // 4) Distribute (monthly within epoch; coordinator can be called monthly)
    const dist = await distributeUBI(ubiPool.perCapitaFinal, ubiPool.recipients);

    // 5) Unfreeze
    await tx.setMaintenanceMode(false);

    // 6) Attest
    await attestEpochTransition(tx.epochNumber, decay, ubiPool);

    return { epoch: tx.epochNumber, decay, ubiPool, dist };
  });
}

