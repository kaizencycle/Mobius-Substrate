import type { UBIConfig } from '../../civic-ledger/src/services/ubi/types.js';
import { calculateUBI } from '../../civic-ledger/src/services/ubi/calculator.js';

export type UBIPool = {
  poolTotal: bigint;
  perCapitaFinal: bigint;
  recipients: number;
};

export async function computeUBIPool(args: {
  N: number;
  I: bigint;
  Re: bigint;
  D: bigint;
  GI: number;
  reservesShards: bigint;
  circulatingShards: bigint;
  cfg: UBIConfig;
}): Promise<UBIPool> {
  const r = calculateUBI({
    N: args.N,
    I: args.I,
    Re: args.Re,
    D: args.D,
    GI: args.GI,
    reservesShards: args.reservesShards,
    circulatingShards: args.circulatingShards
  }, args.cfg);

  return {
    poolTotal: r.poolTotal,
    perCapitaFinal: r.perCapitaFinal,
    recipients: r.payoutsThisMonth
  };
}

