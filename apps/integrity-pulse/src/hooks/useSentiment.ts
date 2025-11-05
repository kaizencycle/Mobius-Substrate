import { useEffect, useState } from 'react';

export type SentimentSummary = {
  imi: number;
  polarization: number;
  volume: number;
  updated_at: string;
  epoch: number;
  topics?: { topic: string; score: number }[];
};

export function useSentiment(apiBase = '/api') {
  const [data, setData] = useState<SentimentSummary | null>(null);
  useEffect(() => {
    let ok = true;
    const load = async () => {
      try {
        const r = await fetch(`${apiBase}/sentiment/summary`);
        if (!r.ok) return;
        const j = await r.json();
        if (ok) setData(j);
      } catch {
        // Silent fail - API may not be available
      }
    };
    load();
    const id = setInterval(load, 5000);
    return () => {
      ok = false;
      clearInterval(id);
    };
  }, [apiBase]);
  return data;
}
