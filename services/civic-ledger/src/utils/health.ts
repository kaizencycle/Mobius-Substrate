import { SHARDS_PER_CREDIT } from '@civic/integrity-units';

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
  service: {
    uptime_seconds: number;
    version: string;
  };
}

const SERVICE_START = Date.now();

export async function getSystemHealth(): Promise<SystemHealth> {
  // TODO: Wire to actual GI aggregator and epoch tracker
  const gi = 0.999;
  const burnEnabled = process.env.EPOCH_BURN_ENABLED !== "false";
  
  return {
    integrity_units: {
      conversion_constant: SHARDS_PER_CREDIT.toString(),
      precision_bits: 64,
    },
    gi_status: {
      current: gi,
      threshold_warn: parseFloat(process.env.GI_FLOOR_WARN || "0.950"),
      threshold_halt: parseFloat(process.env.GI_FLOOR_HALT || "0.900"),
      status: gi >= 0.950 ? "healthy" : gi >= 0.900 ? "warning" : "critical",
    },
    epoch: {
      current_epoch: 1, // TODO: calculate from ledger start date
      days_until_burn: 45, // TODO: calculate from last burn
      burn_enabled: burnEnabled,
    },
    service: {
      uptime_seconds: Math.floor((Date.now() - SERVICE_START) / 1000),
      version: "1.0.0",
    },
  };
}
