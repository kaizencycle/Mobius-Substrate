export interface EchoSnapshot {
  entryId: string;
  question: string;
  giScore: number;
  consensusLevel: number;
  correctedDrift?: boolean;
  timestamp: string;
}

const ECHO_BASE_URL = process.env.ECHO_BASE_URL || 'https://echo.mobius';

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`ECHO request failed: ${response.status} ${text}`);
  }
  return (await response.json()) as T;
}

export async function fetchRecentEchoSnapshots(limit = 50): Promise<EchoSnapshot[]> {
  try {
    const url = `${ECHO_BASE_URL}/snapshot?limit=${limit}`;
    const data = await fetchJson<{ entries: EchoSnapshot[] }>(url);
    return data.entries ?? [];
  } catch (error) {
    console.warn('[tokenomics-engine] Failed to load ECHO snapshots:', error);
    return [];
  }
}
