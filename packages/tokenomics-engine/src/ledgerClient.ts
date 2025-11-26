import type { NodeActivity, RewardResult } from './schema';

const LEDGER_BASE_URL = process.env.LEDGER_BASE_URL || 'https://ledger.mobius';

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Ledger request failed: ${response.status} ${body}`);
  }
  return (await response.json()) as T;
}

export async function fetchLedgerActivities(): Promise<NodeActivity[]> {
  const url = `${LEDGER_BASE_URL}/mic/activities`;
  try {
    const data = await fetchJson<{ activities: NodeActivity[] }>(url);
    return data.activities ?? [];
  } catch (error) {
    console.warn('[tokenomics-engine] Failed to fetch ledger activities:', error);
    return [];
  }
}

export async function writeRewardAttestation(result: RewardResult): Promise<void> {
  const url = `${LEDGER_BASE_URL}/mic/attestations`;
  const payload = {
    nodeId: result.nodeId,
    mic: result.mic,
    breakdown: result.breakdown,
    timestamp: result.timestamp,
    type: 'MIC_REWARD_V2'
  };

  await fetchJson(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}
