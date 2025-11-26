import { createHash } from 'crypto';

type RewardRecord = {
  nodeId: string;
  mic: number;
  breakdown: {
    integrity: number;
    humanIntent: number;
    coordination: number;
    resilience: number;
    multipliers: {
      giMultiplier: number;
      consensusMultiplier: number;
      noveltyMultiplier: number;
      antiDriftMultiplier: number;
    };
  };
  timestamp?: string;
};

type LedgerClient = {
  append: (stream: string, payload: unknown) => Promise<void>;
  sign: (payload: unknown) => string;
};

const DEFAULT_STREAM = 'reward';

export async function writeRewardAttestation(
  ledger: LedgerClient,
  result: RewardRecord,
): Promise<void> {
  const timestamp = result.timestamp ?? new Date().toISOString();

  const attestationPayload = {
    nodeId: result.nodeId,
    mic: result.mic,
    breakdown: result.breakdown,
    timestamp,
    type: 'MIC_REWARD_V2',
    signature: ledger.sign(result),
    hash: createHash('sha256').update(JSON.stringify(result)).digest('hex'),
  };

  await ledger.append(DEFAULT_STREAM, attestationPayload);
}
