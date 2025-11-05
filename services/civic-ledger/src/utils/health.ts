import { SHARDS_PER_CREDIT } from '@civic/integrity-units';
import { pool } from '../db/pool.js';

/**
 * Calculate current epoch from genesis timestamp
 */
function calculateCurrentEpoch(genesisTimestamp: string): number {
  const genesis = new Date(genesisTimestamp).getTime();
  const now = Date.now();
  const epochLengthMs = parseFloat(process.env.EPOCH_LENGTH_DAYS || "90") * 24 * 60 * 60 * 1000;
  return Math.floor((now - genesis) / epochLengthMs) + 1;
}

/**
 * Calculate days until next burn
 */
function calculateDaysUntilBurn(genesisTimestamp: string, lastBurnEpoch?: number): number {
  const genesis = new Date(genesisTimestamp).getTime();
  const now = Date.now();
  const epochLengthMs = parseFloat(process.env.EPOCH_LENGTH_DAYS || "90") * 24 * 60 * 60 * 1000;
  const currentEpoch = calculateCurrentEpoch(genesisTimestamp);
  const nextBurnEpoch = lastBurnEpoch !== undefined ? lastBurnEpoch + 1 : currentEpoch;
  const nextBurnTimestamp = genesis + (nextBurnEpoch - 1) * epochLengthMs;
  const daysUntilBurn = Math.max(0, Math.ceil((nextBurnTimestamp - now) / (24 * 60 * 60 * 1000)));
  return daysUntilBurn;
}

/**
 * Fetch GI from aggregator (with fallback to config)
 */
async function fetchGI(): Promise<number> {
  const aggregatorUrl = process.env.GI_AGGREGATOR_URL;
  
  if (aggregatorUrl) {
    try {
      const response = await fetch(`${aggregatorUrl}/gi`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000), // 5s timeout
      });
      
      if (response.ok) {
        const data = await response.json();
        if (typeof data.gi === 'number' && data.gi >= 0 && data.gi <= 1) {
          return data.gi;
        }
      }
    } catch (error) {
      console.warn(`GI aggregator unavailable: ${error}`);
      // Fall through to config default
    }
  }
  
  // Fallback: use config default
  // In production, this should be replaced with a real calculation
  return parseFloat(process.env.GI_DEFAULT || "0.999");
}

export interface SystemHealth {
  integrity_units: {
    conversion_constant: string;
    precision_bits: number;
  };
  gi_status: {
    current: number;
    threshold_warn: number;
    threshold_halt: number;
    status: "healthy" | "warning" | "critical";
  };
  epoch: {
    current_epoch: number;
    days_until_burn: number;
    burn_enabled: boolean;
  };
  storage: {
    postgres_ok: boolean;
  };
  service: {
    uptime_seconds: number;
    version: string;
  };
}

const SERVICE_START = Date.now();
let lastBurnEpoch: number | undefined;

export async function getSystemHealth(): Promise<SystemHealth> {
  const genesisTimestamp = process.env.LEDGER_GENESIS_TIMESTAMP || "2025-01-01T00:00:00Z";
  const gi = await fetchGI();
  const burnEnabled = process.env.EPOCH_BURN_ENABLED !== "false";
  const currentEpoch = calculateCurrentEpoch(genesisTimestamp);
  const daysUntilBurn = calculateDaysUntilBurn(genesisTimestamp, lastBurnEpoch);
  const thresholdWarn = parseFloat(process.env.GI_FLOOR_WARN || "0.950");
  const thresholdHalt = parseFloat(process.env.GI_FLOOR_HALT || "0.900");
  
  let postgres_ok = false;
  try {
    await pool.query('SELECT 1');
    postgres_ok = true;
  } catch {
    postgres_ok = false;
  }
  
  return {
    integrity_units: {
      conversion_constant: SHARDS_PER_CREDIT.toString(),
      precision_bits: 64,
    },
    gi_status: {
      current: gi,
      threshold_warn: thresholdWarn,
      threshold_halt: thresholdHalt,
      status: gi >= thresholdWarn ? "healthy" : gi >= thresholdHalt ? "warning" : "critical",
    },
    epoch: {
      current_epoch: currentEpoch,
      days_until_burn: daysUntilBurn,
      burn_enabled: burnEnabled,
    },
    storage: {
      postgres_ok,
    },
    service: {
      uptime_seconds: Math.floor((Date.now() - SERVICE_START) / 1000),
      version: "1.0.0",
    },
  };
}

/**
 * Update last burn epoch (called after epoch burn completes)
 */
export function updateLastBurnEpoch(epoch: number): void {
  lastBurnEpoch = epoch;
}
