"use client";

import { useEffect, useMemo, useState } from "react";

type MobiusPulseItem = {
  id: string;
  cycle: string;
  branch: string;
  giScore: number;
  miiScore: number;
  hash: string;
  stats: {
    totalFiles?: number;
    totalLines?: number;
    appsCount?: number;
    packagesCount?: number;
    workflowsCount?: number;
    [key: string]: any;
  };
  generatedAt: string;
};

type HistoryResponse = {
  count: number;
  items: MobiusPulseItem[];
};

const API_BASE =
  process.env.NEXT_PUBLIC_MOBIUS_INDEXER_BASE_URL ?? "";

export function MobiusPulseTimeline() {
  const [data, setData] = useState<MobiusPulseItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!API_BASE) {
      setError("Indexer base URL not configured");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function fetchHistory() {
      try {
        const res = await fetch(
          `${API_BASE}/api/v1/pulse/history?limit=90`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        );
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const json: HistoryResponse = await res.json();
        // Reverse so oldest to newest for chart
        setData([...json.items].reverse());
      } catch (err: any) {
        console.error("Failed to fetch pulse history:", err);
        setError(err.message ?? "Failed to fetch history");
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
    return () => controller.abort();
  }, []);

  const chartPoints = useMemo(() => {
    if (!data.length) return { gi: "", mii: "" };

    const n = data.length;
    const width = 100;
    const height = 40;

    const giPts: string[] = [];
    const miiPts: string[] = [];

    data.forEach((p, i) => {
      const x =
        n === 1 ? width / 2 : (i / (n - 1)) * width;

      const yGi = height - (p.giScore * height);
      const yMii = height - (p.miiScore * height);

      giPts.push(`${x.toFixed(1)},${yGi.toFixed(1)}`);
      miiPts.push(`${x.toFixed(1)},${yMii.toFixed(1)}`);
    });

    return {
      gi: giPts.join(" "),
      mii: miiPts.join(" "),
    };
  }, [data]);

  if (loading) {
    return (
      <div className="rounded-xl border border-neutral-800 bg-black/40 p-4 text-sm text-neutral-300">
        Loading pulse history…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-700/70 bg-red-950/40 p-4 text-sm text-red-100">
        Failed to load pulse history: {error}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="rounded-xl border border-neutral-800 bg-black/40 p-4 text-sm text-neutral-300">
        No pulse history yet. Once the nightly workflow runs,
        you'll see the timeline here.
      </div>
    );
  }

  const latest = data[data.length - 1];
  const earliest = data[0];

  return (
    <div className="space-y-4">
      {/* Chart Card */}
      <div className="rounded-xl border border-neutral-800 bg-black/50 p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-sm font-semibold">
              GI & MII over time
            </div>
            <div className="text-xs text-neutral-500">
              {new Date(earliest.generatedAt).toLocaleDateString()}{" "}
              →{" "}
              {new Date(latest.generatedAt).toLocaleDateString()}
            </div>
          </div>
          <div className="flex items-center gap-3 text-[0.7rem] text-neutral-400">
            <div className="flex items-center gap-1">
              <span className="inline-block w-3 h-[2px] bg-emerald-400" />
              <span>GI</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block w-3 h-[2px] bg-sky-400" />
              <span>MII</span>
            </div>
          </div>
        </div>

        <svg
          viewBox="0 0 100 40"
          className="w-full h-24 overflow-visible"
        >
          <rect
            x="0"
            y="0"
            width="100"
            height="40"
            fill="none"
            stroke="#262626"
            strokeWidth="0.5"
          />
          {/* baseline at 0.95 */}
          <line
            x1="0"
            y1={40 - 0.95 * 40}
            x2="100"
            y2={40 - 0.95 * 40}
            stroke="#404040"
            strokeWidth="0.4"
            strokeDasharray="2 2"
          />
          <polyline
            points={chartPoints.gi}
            fill="none"
            stroke="#22c55e"
            strokeWidth="0.8"
          />
          <polyline
            points={chartPoints.mii}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="0.8"
          />
        </svg>
      </div>

      {/* Table Card */}
      <div className="rounded-xl border border-neutral-800 bg-black/50 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-semibold">
            Recent pulses
          </div>
          <div className="text-[0.7rem] text-neutral-500">
            {data.length} snapshots
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-xs border-collapse">
            <thead>
              <tr className="text-neutral-500 border-b border-neutral-900">
                <th className="text-left py-1 pr-4 font-normal">
                  Date
                </th>
                <th className="text-left py-1 pr-4 font-normal">
                  Cycle
                </th>
                <th className="text-left py-1 pr-4 font-normal">
                  GI
                </th>
                <th className="text-left py-1 pr-4 font-normal">
                  MII
                </th>
                <th className="text-left py-1 pr-4 font-normal">
                  Scope
                </th>
                <th className="text-left py-1 font-normal">
                  Hash
                </th>
              </tr>
            </thead>
            <tbody>
              {[...data].reverse().map((p) => {
                const giPct = (p.giScore * 100).toFixed(1);
                const miiPct = (p.miiScore * 100).toFixed(1);
                const d = new Date(p.generatedAt);
                const scope = [
                  p.stats.appsCount
                    ? `${p.stats.appsCount} apps`
                    : null,
                  p.stats.packagesCount
                    ? `${p.stats.packagesCount} pkgs`
                    : null,
                  p.stats.workflowsCount
                    ? `${p.stats.workflowsCount} wf`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ");

                return (
                  <tr
                    key={p.id}
                    className="border-b border-neutral-900/60"
                  >
                    <td className="py-1 pr-4 whitespace-nowrap text-neutral-300">
                      {d.toLocaleDateString()}{" "}
                      {d.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-1 pr-4 text-neutral-300">
                      {p.cycle}
                    </td>
                    <td className="py-1 pr-4">
                      {giPct}
                      <span className="text-neutral-500">%</span>
                    </td>
                    <td className="py-1 pr-4">
                      {miiPct}
                      <span className="text-neutral-500">%</span>
                    </td>
                    <td className="py-1 pr-4 text-neutral-400">
                      {scope || "—"}
                    </td>
                    <td className="py-1 text-neutral-500">
                      <code className="text-[0.65rem]">
                        {p.hash.slice(0, 10)}…
                      </code>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
