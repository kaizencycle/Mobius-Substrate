export interface GlobalGiSnapshot {
  gi: number;
  timestamp: string;
}

const GI_BASE_URL = process.env.GI_BASE_URL || process.env.LEDGER_BASE_URL || 'https://ledger.mobius';

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GI request failed: ${response.status} ${text}`);
  }
  return (await response.json()) as T;
}

export async function fetchGlobalGi(): Promise<GlobalGiSnapshot | null> {
  try {
    const url = `${GI_BASE_URL}/gi/snapshot`;
    return await fetchJson<GlobalGiSnapshot>(url);
  } catch (error) {
    console.warn('[tokenomics-engine] Failed to fetch GI snapshot:', error);
    return null;
  }
}
