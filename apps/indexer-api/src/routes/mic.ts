// MIC (Mobius Integrity Credits) API Routes
// Cycle: C-151

import { Router, Request, Response } from 'express';

const router = Router();

// Constants
const KS_PER_MIC = 1_000_000;
const MII_THRESHOLD = 0.95;

// In-memory store (replace with database in production)
const balances: Map<string, { mic: number; ks: number }> = new Map();
const transactions: Array<{
  id: string;
  from?: string;
  to: string;
  mic: number;
  ks: number;
  action: string;
  mii?: number;
  timestamp: string;
}> = [];

// Utility functions
function micToKS(mic: number): number {
  return Math.round(mic * KS_PER_MIC);
}

function ksToMIC(ks: number): number {
  return ks / KS_PER_MIC;
}

function getBalance(actorId: string): { mic: number; ks: number } {
  return balances.get(actorId) || { mic: 0, ks: 0 };
}

function updateBalance(actorId: string, deltaMic: number): { mic: number; ks: number } {
  const current = getBalance(actorId);
  const newMic = Math.max(0, current.mic + deltaMic);
  const newKs = micToKS(newMic);
  balances.set(actorId, { mic: newMic, ks: newKs });
  return { mic: newMic, ks: newKs };
}

/**
 * GET /v1/mic/balance/:id
 * Get MIC/KS balance for a citizen or agent
 */
router.get('/v1/mic/balance/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const balance = getBalance(id);
  
  res.json({
    actor_id: id,
    mic: balance.mic,
    ks: balance.ks,
    last_updated: new Date().toISOString()
  });
});

/**
 * POST /v1/mic/mint
 * Mint MIC based on integrity action
 */
router.post('/v1/mic/mint', (req: Request, res: Response) => {
  const { actor_id, action, mii, shards = [] } = req.body;

  if (!actor_id || !action) {
    return res.status(400).json({ error: 'actor_id and action required' });
  }

  if (typeof mii !== 'number' || mii < MII_THRESHOLD) {
    return res.status(400).json({ 
      error: `MII must be >= ${MII_THRESHOLD}`,
      received_mii: mii,
      threshold: MII_THRESHOLD
    });
  }

  // Calculate shard value
  const shardWeights: Record<string, number> = {
    reflection: 1.0,
    learning: 1.0,
    civic: 1.5,
    stability: 2.0,
    stewardship: 2.0,
    innovation: 2.5,
    guardian: 3.0
  };

  let totalShardValue = 0;
  for (const shard of shards) {
    const weight = shardWeights[shard.type] || 1.0;
    const value = (shard.value || 1.0) * weight;
    totalShardValue += value;
  }

  if (totalShardValue === 0) {
    totalShardValue = 1.0; // Default shard value
  }

  // MIC formula: α × max(0, MII - τ) × ShardValue
  const alpha = 1.0;
  const delta = Math.max(0, mii - MII_THRESHOLD);
  const mintedMic = alpha * delta * totalShardValue;
  const mintedKs = micToKS(mintedMic);

  // Update balance
  const newBalance = updateBalance(actor_id, mintedMic);

  // Record transaction
  const txId = `mint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  transactions.push({
    id: txId,
    to: actor_id,
    mic: mintedMic,
    ks: mintedKs,
    action,
    mii,
    timestamp: new Date().toISOString()
  });

  res.json({
    transaction_id: txId,
    minted_mic: mintedMic,
    minted_ks: mintedKs,
    mii,
    shard_value: totalShardValue,
    new_balance_mic: newBalance.mic,
    new_balance_ks: newBalance.ks,
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /v1/mic/burn
 * Burn MIC due to integrity violation
 */
router.post('/v1/mic/burn', (req: Request, res: Response) => {
  const { actor_id, reason, severity = 1 } = req.body;

  if (!actor_id || !reason) {
    return res.status(400).json({ error: 'actor_id and reason required' });
  }

  // Burn formula: Severity × β × 1,000,000 KS
  const beta = 0.05;
  const burnedMic = severity * beta;
  const burnedKs = micToKS(burnedMic);

  // Update balance (subtract)
  const newBalance = updateBalance(actor_id, -burnedMic);

  // Record transaction
  const txId = `burn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  transactions.push({
    id: txId,
    from: actor_id,
    to: 'BURN_ADDRESS',
    mic: burnedMic,
    ks: burnedKs,
    action: 'burn',
    timestamp: new Date().toISOString()
  });

  res.json({
    transaction_id: txId,
    burned_mic: burnedMic,
    burned_ks: burnedKs,
    reason,
    severity,
    new_balance_mic: newBalance.mic,
    new_balance_ks: newBalance.ks,
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /v1/mic/transfer
 * Transfer KS between actors
 */
router.post('/v1/mic/transfer', (req: Request, res: Response) => {
  const { from, to, ks } = req.body;

  if (!from || !to || typeof ks !== 'number') {
    return res.status(400).json({ error: 'from, to, and ks (integer) required' });
  }

  if (!Number.isInteger(ks) || ks <= 0) {
    return res.status(400).json({ error: 'ks must be a positive integer' });
  }

  const fromBalance = getBalance(from);
  if (fromBalance.ks < ks) {
    return res.status(400).json({ 
      error: 'Insufficient balance',
      available_ks: fromBalance.ks,
      requested_ks: ks
    });
  }

  const mic = ksToMIC(ks);

  // Update balances
  updateBalance(from, -mic);
  const toNewBalance = updateBalance(to, mic);

  // Record transaction
  const txId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  transactions.push({
    id: txId,
    from,
    to,
    mic,
    ks,
    action: 'transfer',
    timestamp: new Date().toISOString()
  });

  res.json({
    transaction_id: txId,
    from,
    to,
    ks_transferred: ks,
    mic_equivalent: mic,
    to_new_balance_mic: toNewBalance.mic,
    to_new_balance_ks: toNewBalance.ks,
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /v1/mic/transactions
 * Get transaction history
 */
router.get('/v1/mic/transactions', (req: Request, res: Response) => {
  const { actor_id, limit = 50 } = req.query;
  
  let filtered = transactions;
  if (actor_id) {
    filtered = transactions.filter(
      tx => tx.from === actor_id || tx.to === actor_id
    );
  }

  const limitNum = Math.min(Number(limit), 100);
  const result = filtered.slice(-limitNum).reverse();

  res.json({
    transactions: result,
    count: result.length,
    total: filtered.length
  });
});

/**
 * GET /v1/mic/metrics
 * Get MIC economy metrics
 */
router.get('/v1/mic/metrics', (req: Request, res: Response) => {
  let totalMic = 0;
  let totalKs = 0;
  let totalAccounts = 0;

  balances.forEach((balance) => {
    totalMic += balance.mic;
    totalKs += balance.ks;
    totalAccounts++;
  });

  const mintTxs = transactions.filter(tx => tx.action !== 'burn' && tx.action !== 'transfer');
  const burnTxs = transactions.filter(tx => tx.action === 'burn');

  res.json({
    total_supply_mic: totalMic,
    total_supply_ks: totalKs,
    total_accounts: totalAccounts,
    total_minted_mic: mintTxs.reduce((sum, tx) => sum + tx.mic, 0),
    total_burned_mic: burnTxs.reduce((sum, tx) => sum + tx.mic, 0),
    total_transactions: transactions.length,
    ks_per_mic: KS_PER_MIC,
    mii_threshold: MII_THRESHOLD,
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /v1/mic/shards
 * Get shard weight configuration
 */
router.get('/v1/mic/shards', (req: Request, res: Response) => {
  res.json({
    ks_per_mic: KS_PER_MIC,
    mii_threshold: MII_THRESHOLD,
    shard_weights: {
      reflection: 1.0,
      learning: 1.0,
      civic: 1.5,
      stability: 2.0,
      stewardship: 2.0,
      innovation: 2.5,
      guardian: 3.0
    },
    caps: {
      per_citizen_per_cycle: 10.0,
      per_action_max: 2.0
    }
  });
});

/**
 * GET /v1/mii/score/:id
 * Get MII score for an actor (placeholder)
 */
router.get('/v1/mii/score/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  
  // Placeholder: In production, calculate from attestations
  const balance = getBalance(id);
  const baseMII = 0.90;
  const balanceBonus = Math.min(0.09, balance.mic * 0.01);
  const mii = Math.min(1.0, baseMII + balanceBonus);

  res.json({
    actor_id: id,
    mii,
    threshold: MII_THRESHOLD,
    above_threshold: mii >= MII_THRESHOLD,
    components: {
      memory: 0.95,
      human: 0.92,
      integrity: 0.98,
      ethics: 0.96
    },
    timestamp: new Date().toISOString()
  });
});

export default router;
