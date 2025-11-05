import type { WalletActivity30d } from '../types.js';

export async function getWalletActivity30d(walletAddress: string): Promise<WalletActivity30d> {
  // TODO: plug into ledger analytics
  return { txCount: 5, totalShardsTransacted: 50_000n }; // mock healthy activity
}

