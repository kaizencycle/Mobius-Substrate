'use client';

import { useEffect, useState, useMemo } from 'react';

// Extract inline styles to module level to prevent recreation on every render
const STYLES = {
  errorContainer: {
    padding: 16,
    border: '1px solid #7f1d1d',
    borderRadius: 12,
    background: '#2f0a0a'
  },
  mainContainer: {
    padding: 16
  },
  cardsContainer: {
    display: 'flex',
    gap: 24,
    flexWrap: 'wrap' as const,
    marginTop: 8,
  },
  card: {
    flex: '0 0 260px',
    padding: 16,
    borderRadius: 12,
    border: '1px solid #1f2933',
    background: '#020617',
  },
  cardWide: {
    flex: '1 1 300px',
    padding: 16,
    borderRadius: 12,
    border: '1px solid #1f2933',
    background: '#020617',
  },
  cardTitle: {
    fontSize: 18,
    marginBottom: 4
  },
  cardTitleLarge: {
    fontSize: 18,
    marginBottom: 8
  },
  score: {
    fontSize: 40,
    fontWeight: 700
  },
  subtext: {
    fontSize: 13,
    opacity: 0.8
  },
  warningSpan: {
    color: '#f97316',
    marginLeft: 8
  },
  list: {
    listStyle: 'none' as const,
    padding: 0,
    margin: 0,
    fontSize: 14
  },
  listItem: {
    marginTop: 8
  },
  table: {
    width: '100%',
    fontSize: 13,
    borderCollapse: 'collapse' as const
  },
  th: {
    textAlign: 'left' as const,
    paddingBottom: 4
  },
  thRight: {
    textAlign: 'right' as const,
    paddingBottom: 4
  },
  td: {
    padding: '2px 0'
  },
  tdRight: {
    padding: '2px 0',
    textAlign: 'right' as const
  }
} as const;

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

  // useMemo must be called before any conditional returns (Rules of Hooks)
  const { giColor, latencyEntries } = useMemo(() => ({
    giColor:
      data?.miiCurrent !== undefined && data.miiCurrent >= 0.98 ? '#16a34a' :
      data?.miiCurrent !== undefined && data.miiCurrent >= 0.95 ? '#f59e0b' :
      '#dc2626',
    latencyEntries: data?.last24h?.avgLatencyMs ? Object.entries(data.last24h.avgLatencyMs) : []
  }), [data?.miiCurrent, data?.last24h?.avgLatencyMs]);

  if (error) {
    return (
      <div style={STYLES.errorContainer}>
        Ops error: {error}
      </div>
    );
  }

  if (!data) {
    return <div>Loading Mobius telemetry…</div>;
  }

  return (
    <div style={STYLES.mainContainer}>
      <div style={STYLES.cardsContainer}>
        <div style={STYLES.card}>
          <h2 style={STYLES.cardTitle}>Global Integrity</h2>
          <div style={{ ...STYLES.score, color: giColor }}>
            {data.miiCurrent.toFixed(3)}
          </div>
          <div style={STYLES.subtext}>
            Threshold: {data.miiThreshold.toFixed(2)}{' '}
            {data.safeModeEnabled && (
              <span style={STYLES.warningSpan}>
                SAFE MODE
              </span>
            )}
          </div>
        </div>

        <div style={STYLES.card}>
          <h2 style={STYLES.cardTitleLarge}>Decisions (24h)</h2>
          <ul style={STYLES.list}>
            <li>✅ OK: {data.last24h.decisions.ok}</li>
            <li>🟡 Needs human: {data.last24h.decisions.needsHumanReview}</li>
            <li>⛔ Rejected: {data.last24h.decisions.reject}</li>
            <li style={STYLES.listItem}>🚨 Alerts: {data.last24h.alerts}</li>
          </ul>
        </div>

        <div style={STYLES.cardWide}>
          <h2 style={STYLES.cardTitleLarge}>Engine Latency (24h avg)</h2>
          <table style={STYLES.table}>
            <thead>
              <tr>
                <th style={STYLES.th}>Engine</th>
                <th style={STYLES.thRight}>Avg ms</th>
              </tr>
            </thead>
            <tbody>
              {latencyEntries.map(([engine, ms]) => (
                <tr key={engine}>
                  <td style={STYLES.td}>{engine}</td>
                  <td style={STYLES.tdRight}>
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
