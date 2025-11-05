import { pool } from '../../db/pool.js';

export async function insertGISample(gi: number, source = 'unknown'): Promise<void> {
  await pool.query('INSERT INTO gi_samples (gi, source) VALUES ($1, $2)', [gi, source]);
}

/**
 * Compute a simple time-weighted average GI over lookbackDays.
 * Weighting: linear recency weight (newer samples weigh more).
 */
export async function getGI_TWA_DB(lookbackDays: number): Promise<number> {
  const res = await pool.query(
    `SELECT EXTRACT(EPOCH FROM (NOW() - ts)) AS age_s, gi
       FROM gi_samples
      WHERE ts >= NOW() - ($1::text || ' days')::interval
      ORDER BY ts DESC`,
    [String(lookbackDays)]
  );
  if (!res.rows.length) throw new Error('no_gi_samples_in_window');

  // Linear weights: w = 1 - (age / window)
  const windowS = lookbackDays * 86400;
  let wsum = 0;
  let gw = 0;
  for (const row of res.rows) {
    const age = Number(row.age_s);
    const gi = Number(row.gi);
    const w = Math.max(0, 1 - age / windowS);
    wsum += w;
    gw += gi * w;
  }
  return wsum > 0 ? Number((gw / wsum).toFixed(3)) : Number(res.rows[0].gi);
}

