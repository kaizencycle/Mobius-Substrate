import { getGI_TWA_DB } from './store.js';

export async function getGI_TWA(lookbackDays: number): Promise<number> {
  const days = Number(lookbackDays || process.env.GI_TWA_LOOKBACK_DAYS || 30);
  return getGI_TWA_DB(days);
}

