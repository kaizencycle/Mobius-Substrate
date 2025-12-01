"use client";

import { useEffect, useState } from "react";

type MobiusPulseStats = {
  totalFiles: number;
  totalLines: number;
  appsCount: number;
  packagesCount: number;
  workflowsCount: number;
};

type MobiusPulseLatest = {
  status?: string;
  id?: string;
  hash?: string;
  cycle: string;
  branch: string;
  generatedAt: string;
  giScore: number;
  miiScore: number;
  stats: MobiusPulseStats;
};

type Props = {
  title?: string;
};

const API_BASE =
  process.env.NEXT_PUBLIC_MOBIUS_INDEXER_BASE_URL ?? "";

export function MobiusPulseCard({ title = "Mobius Pulse" }: Props) {
  const [data, setData] = useState<MobiusPulseLatest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!API_BASE) {
      setError("Indexer base URL not configured");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function fetchPulse() {
      try {
        const res = await fetch(`${API_BASE}/api/v1/pulse/latest`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const json = await res.json();
        setData(json);
      } catch (err: any) {
        console.error("Failed to fetch Mobius pulse:", err);
        setError(err.message ?? "Failed to fetch pulse");
      } finally {
        setLoading(false);
      }
    }

    fetchPulse();

    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-neutral-800 bg-black/40 p-4 text-sm text-neutral-300">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold">{title}</span>
          <span className="text-xs text-neutral-500">Loading…</span>
        </div>
        <div className="h-6 bg-neutral-900/60 animate-pulse rounded" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-700/70 bg-red-950/40 p-4 text-sm text-red-100">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold">{title}</span>
          <span className="text-xs uppercase tracking-wide">
            Offline
          </span>
        </div>
        <p className="text-xs text-red-200/80">
          Could not load latest pulse: {error ?? "unknown error"}
        </p>
      </div>
    );
  }

  const giPercent = (data.giScore * 100).toFixed(1);
  const miiPercent = (data.miiScore * 100).toFixed(1);
  const generated = new Date(data.generatedAt);

  const statusColor =
    data.giScore >= 0.98 && data.miiScore >= 0.98
      ? "text-emerald-400"
      : data.giScore >= 0.95 && data.miiScore >= 0.95
      ? "text-amber-400"
      : "text-red-400";

  const statusLabel =
    data.giScore >= 0.98 && data.miiScore >= 0.98
      ? "Pristine"
      : data.giScore >= 0.95 && data.miiScore >= 0.95
      ? "Healthy"
      : "Degraded";

  return (
    <div className="rounded-xl border border-neutral-800 bg-black/50 p-4 text-sm text-neutral-100">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">{title}</span>
            <span
              className={`text-[0.65rem] uppercase tracking-wide ${statusColor}`}
            >
              {statusLabel}
            </span>
          </div>
          <div className="text-[0.7rem] text-neutral-500 mt-0.5">
            Cycle {data.cycle} • {data.branch}
          </div>
        </div>
        <div className="text-[0.65rem] text-right text-neutral-500">
          <div>
            {generated.toLocaleDateString()}{" "}
            {generated.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <div className="text-neutral-600">
            hash {data.hash?.slice(0, 8)}…
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-1">
        <div>
          <div className="text-[0.65rem] text-neutral-500 uppercase tracking-wide">
            GI
          </div>
          <div className="text-base font-semibold">
            {giPercent}
            <span className="text-xs text-neutral-500">%</span>
          </div>
        </div>
        <div>
          <div className="text-[0.65rem] text-neutral-500 uppercase tracking-wide">
            MII
          </div>
          <div className="text-base font-semibold">
            {miiPercent}
            <span className="text-xs text-neutral-500">%</span>
          </div>
        </div>
        <div>
          <div className="text-[0.65rem] text-neutral-500 uppercase tracking-wide">
            Scope
          </div>
          <div className="text-xs">
            {data.stats.appsCount} apps ·{" "}
            {data.stats.packagesCount} pkgs
            <br />
            {data.stats.workflowsCount} wf
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-900 mt-3 pt-2 text-[0.65rem] text-neutral-500 flex justify-between">
        <span>
          {data.stats.totalFiles} files ·{" "}
          {data.stats.totalLines.toLocaleString()} LOC
        </span>
        <span>powered by /v1/pulse/latest</span>
      </div>
    </div>
  );
}
