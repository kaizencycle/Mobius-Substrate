import axios from 'axios';
import { config } from '../config';

export interface GiSnapshot {
  mii: number;
  trend: 'up' | 'down' | 'flat';
  window: string;
}

export async function getGiSnapshot(): Promise<GiSnapshot> {
  const res = await axios.get(`${config.ledgerBaseUrl}/ledger/stats/mii`, {
    timeout: Number(process.env.GI_SNAPSHOT_TIMEOUT_MS ?? 10_000),
  });
  return res.data as GiSnapshot;
}
