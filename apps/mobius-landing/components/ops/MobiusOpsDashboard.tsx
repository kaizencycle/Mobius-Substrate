'use client';

import { useEffect, useState } from 'react';

type OpsSummary = {
  miiCurrent: number;
  miiThreshold: number;
  safeModeEnabled: boolean;
  last24h: {
    alerts: number;
    avgLatencyMs: Record<string, number>;
    decisions: {
      ok: number;
      needsHumanReview: number;
      reject: number;
    };
  };
};

const FALLBACK_SUMMARY: OpsSummary = {
  miiCurrent: 0,
  miiThreshold: 0.95,
  safeModeEnabled: false,
  last24h: {
    alerts: 0,
    avgLatencyMs: {
      openai: 0,
      claude: 0,
      deepseek: 0,
      gemini: 0,
      'local-sentinel': 0,
      other: 0,
    },
    decisions: {
      ok: 0,
      needsHumanReview: 0,
      reject: 0,
    },
  },
};

const SUMMARY_ENDPOINT = (() => {
  const base = process.env.NEXT_PUBLIC_DVA_LITE_URL;
  if (!base) return '/ops/summary';
  return `${base.replace(/\/$/, '')}/ops/summary`;
})();

export function MobiusOpsDashboard() {
  const [data, setData] = useState<OpsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch(SUMMARY_ENDPOINT, {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const body = (await response.json()) as OpsSummary;
        setData({
          ...FALLBACK_SUMMARY,
          ...body,
          last24h: {
            alerts: body.last24h?.alerts ?? FALLBACK_SUMMARY.last24h.alerts,
            avgLatencyMs: {
              ...FALLBACK_SUMMARY.last24h.avgLatencyMs,
              ...(body.last24h?.avgLatencyMs ?? {}),
            },
            decisions: {
              ...FALLBACK_SUMMARY.last24h.decisions,
              ...(body.last24h?.decisions ?? {}),
            },
          },
        });
        setError(null);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setError((err as Error).message);
      }
    }

    load();
    const interval = setInterval(load, 30_000);
    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, []);

  if (error) {
    return (
      <div style={{ padding: 16, border: '1px solid #7f1d1d', borderRadius: 12, background: '#2f0a0a' }}>
        Ops error: {error}
      </div>
    );
  }

  if (!data) {
    return <div>Loading Mobius telemetry…</div>;
  }

  const giColor =
    data.miiCurrent >= 0.98 ? '#16a34a' :
    data.miiCurrent >= 0.95 ? '#f59e0b' :
    '#dc2626';

  const latencyEntries = Object.entries(data.last24h.avgLatencyMs);

  return (
    <div style={{ padding: 16 }}>
      <div
        style={{
          display: 'flex',
          gap: 24,
          flexWrap: 'wrap',
          marginTop: 8,
        }}
      >
        <div
          style={{
            flex: '0 0 260px',
            padding: 16,
            borderRadius: 12,
            border: '1px solid #1f2933',
            background: '#020617',
          }}
        >
          <h2 style={{ fontSize: 18, marginBottom: 4 }}>Global Integrity</h2>
          <div style={{ fontSize: 40, fontWeight: 700, color: giColor }}>
            {data.miiCurrent.toFixed(3)}
          </div>
          <div style={{ fontSize: 13, opacity: 0.8 }}>
            Threshold: {data.miiThreshold.toFixed(2)}{' '}
            {data.safeModeEnabled && (
              <span style={{ color: '#f97316', marginLeft: 8 }}>
                SAFE MODE
              </span>
            )}
          </div>
        </div>

        <div
          style={{
            flex: '0 0 260px',
            padding: 16,
            borderRadius: 12,
            border: '1px solid #1f2933',
            background: '#020617',
          }}
        >
          <h2 style={{ fontSize: 18, marginBottom: 8 }}>Decisions (24h)</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 14 }}>
            <li>✅ OK: {data.last24h.decisions.ok}</li>
            <li>🟡 Needs human: {data.last24h.decisions.needsHumanReview}</li>
            <li>⛔ Rejected: {data.last24h.decisions.reject}</li>
            <li style={{ marginTop: 8 }}>🚨 Alerts: {data.last24h.alerts}</li>
          </ul>
        </div>

        <div
          style={{
            flex: '1 1 300px',
            padding: 16,
            borderRadius: 12,
            border: '1px solid #1f2933',
            background: '#020617',
          }}
        >
          <h2 style={{ fontSize: 18, marginBottom: 8 }}>Engine Latency (24h avg)</h2>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', paddingBottom: 4 }}>Engine</th>
                <th style={{ textAlign: 'right', paddingBottom: 4 }}>Avg ms</th>
              </tr>
            </thead>
            <tbody>
              {latencyEntries.map(([engine, ms]) => (
                <tr key={engine}>
                  <td style={{ padding: '2px 0' }}>{engine}</td>
                  <td style={{ padding: '2px 0', textAlign: 'right' }}>
                    {Math.round(ms)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
