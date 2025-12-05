'use client';

import { useState } from 'react';
import { Nav } from '@/components/Nav';

// Type definitions
type CityId = 'A' | 'B' | 'C';

type CityState = {
  integrity: number;
  trust: number;
  inequality: number;
  unemployment: number;
  life_expectancy: number;
  corruption: number;
  climate_risk: number;
};

type StepEntry = {
  t: number;
  states: Record<CityId, CityState>;
  actions: Record<CityId, string>;
  mii: Record<CityId, number>;
  rewards: Record<CityId, number>;
};

type SimPayload = {
  sim_id: string;
  version: string;
  steps: number;
  policy_mode: string;
  trajectory: StepEntry[];
  initial_states: Record<CityId, CityState>;
  final_states: Record<CityId, CityState>;
  initial_mii: Record<CityId, number>;
  final_mii: Record<CityId, number>;
  mii_series: Record<CityId, number[]>;
  gi_series: number[];
  gi_final: number;
};

// API base - configurable via env
const API_BASE = process.env.NEXT_PUBLIC_LAB4_API ?? 'http://localhost:8000';
const LEDGER_API_BASE = process.env.NEXT_PUBLIC_LEDGER_API ?? 'http://localhost:9000';

export default function AlphaCivilizationPage() {
  const [steps, setSteps] = useState<number>(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sim, setSim] = useState<SimPayload | null>(null);
  
  // Sentinel mode toggle
  const [sentinelMode, setSentinelMode] = useState<boolean>(false);
  
  // Ledger save state
  const [ledgerSaving, setLedgerSaving] = useState(false);
  const [ledgerStatus, setLedgerStatus] = useState<string | null>(null);
  const [ledgerError, setLedgerError] = useState<string | null>(null);

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    setSim(null);
    setLedgerStatus(null);
    setLedgerError(null);

    try {
      const res = await fetch(`${API_BASE}/sim/alpha_v0/step-run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          steps,
          policy_mode: sentinelMode ? 'sentinel' : 'random',
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API error (${res.status}): ${text || res.statusText}`);
      }

      const data = await res.json();
      if (!data.payload) {
        throw new Error('Missing payload in response');
      }

      setSim(data.payload as SimPayload);
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Failed to run simulation.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToLedger = async () => {
    if (!sim) return;
    setLedgerSaving(true);
    setLedgerStatus(null);
    setLedgerError(null);

    try {
      const ledgerEvent = {
        type: 'alpha_civilization_run',
        sim_id: sim.sim_id,
        steps: sim.steps,
        cities: Object.entries(sim.final_states).map(([cid, state]) => ({
          city_id: cid,
          final_state: state,
          final_mii: sim.final_mii?.[cid as CityId] ?? null,
        })),
        meta: {
          policy_mode: sentinelMode ? 'sentinel' : 'random',
          source: 'Mobius-Portal-AlphaCivilizationConsole',
          trinity_seal: 'JADE-AUREA-ATLAS-ECHO',
          cycle: 'C-154',
          chamber: 'Lab4',
        },
      };

      const res = await fetch(`${LEDGER_API_BASE}/ledger/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ledgerEvent),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Ledger error (${res.status}): ${text || res.statusText}`);
      }

      setLedgerStatus('Run recorded in Civic Ledger.');
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Failed to save to Civic Ledger.';
      setLedgerError(message);
    } finally {
      setLedgerSaving(false);
    }
  };

  // Build MII history for chart
  const miiHistory: Record<CityId, { t: number; mii: number }[]> = {
    A: [],
    B: [],
    C: [],
  };

  if (sim?.mii_series) {
    (['A', 'B', 'C'] as CityId[]).forEach((cid) => {
      const series = sim.mii_series[cid] || [];
      series.forEach((mii, idx) => {
        miiHistory[cid].push({ t: idx, mii });
      });
    });
  }

  return (
    <main className="min-h-screen bg-slate-900 text-gray-100">
      <Nav />
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <header className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
            <h1 className="text-3xl font-bold tracking-tight">
              AlphaCivilization <span className="text-cyan-400">v0.1</span>
            </h1>
          </div>
          <p className="text-sm text-gray-400">
            3-city civic self-play • MII-based integrity rewards • Mobius Systems Lab4
          </p>
          <p className="text-xs text-gray-500 italic">
            &quot;DeepMind built machine intelligence for games. Mobius is building machine intelligence for civilizations.&quot;
          </p>
        </header>

        {/* Controls */}
        <section className="border border-slate-700 rounded-xl p-5 bg-slate-800/50 backdrop-blur">
          <h2 className="text-lg font-semibold mb-4 text-gray-200">Simulation Controls</h2>
          <div className="flex flex-wrap items-end gap-6">
            {/* Steps input */}
            <div>
              <label className="block text-xs uppercase tracking-wide text-gray-400 mb-1.5">
                Steps
              </label>
              <input
                type="number"
                min={1}
                max={200}
                value={steps}
                onChange={(e) => setSteps(Number(e.target.value) || 1)}
                className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Civic turns (1–200)
              </p>
            </div>

            {/* Sentinel toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSentinelMode((v) => !v)}
                className={`relative inline-flex h-7 w-14 items-center rounded-full border px-1 transition-all duration-200 ${
                  sentinelMode
                    ? 'bg-cyan-500 border-cyan-400'
                    : 'bg-slate-700 border-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 ${
                    sentinelMode ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  Policy:{' '}
                  <span className={sentinelMode ? 'text-cyan-400' : 'text-gray-400'}>
                    {sentinelMode ? 'Sentinel' : 'Random'}
                  </span>
                </span>
                <span className="text-[11px] text-gray-500">
                  {sentinelMode
                    ? 'Sentinel quorum (AUREA / ATLAS / EVE / JADE / HERMES)'
                    : 'Random baseline policy'}
                </span>
              </div>
            </div>

            {/* Run button */}
            <button
              onClick={handleRun}
              disabled={loading || steps <= 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold transition-colors"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-transparent border-t-white animate-spin" />
                  Running…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Run Simulation
                </>
              )}
            </button>

            {error && (
              <p className="text-xs text-red-400 max-w-xs bg-red-900/30 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}
          </div>
        </section>

        {/* Results */}
        {sim && (
          <>
            {/* Summary Section */}
            <section className="border border-slate-700 rounded-xl p-5 bg-slate-800/50 backdrop-blur space-y-5">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-200 mb-1">
                    Simulation Result
                  </h2>
                  <p className="text-xs text-gray-400">
                    <span className="font-mono text-gray-500">{sim.sim_id}</span>
                    {' • '}
                    {sim.steps} steps
                    {' • '}
                    <span className={sentinelMode ? 'text-cyan-400' : 'text-gray-400'}>
                      {sentinelMode ? 'Sentinel' : 'Random'} policy
                    </span>
                  </p>
                </div>

                {/* Save to Ledger button */}
                <div className="flex flex-col items-end gap-1">
                  <button
                    type="button"
                    disabled={!sim || ledgerSaving}
                    onClick={handleSaveToLedger}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold transition-colors"
                  >
                    {ledgerSaving ? (
                      <>
                        <span className="h-3 w-3 rounded-full border-2 border-transparent border-t-white animate-spin" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        Save to Civic Ledger
                      </>
                    )}
                  </button>
                  {ledgerStatus && (
                    <span className="text-[11px] text-emerald-400">{ledgerStatus}</span>
                  )}
                  {ledgerError && (
                    <span className="text-[11px] text-red-400 max-w-[200px] text-right">
                      {ledgerError}
                    </span>
                  )}
                </div>
              </div>

              {/* Global Integrity */}
              <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400">
                    {(sim.gi_final * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">
                    Global Integrity
                  </div>
                </div>
                <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      sim.gi_final >= 0.95
                        ? 'bg-emerald-500'
                        : sim.gi_final >= 0.9
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${sim.gi_final * 100}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500">
                  {sim.gi_final >= 0.95 ? (
                    <span className="text-emerald-400">✓ Target Met</span>
                  ) : (
                    <span className="text-amber-400">Below 95%</span>
                  )}
                </div>
              </div>

              {/* City Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['A', 'B', 'C'] as CityId[]).map((cid) => {
                  const initial = sim.initial_mii?.[cid] ?? 0;
                  const final = sim.final_mii?.[cid] ?? 0;
                  const delta = final - initial;
                  const state = sim.final_states?.[cid];

                  return (
                    <div
                      key={cid}
                      className="rounded-xl border border-slate-700 bg-slate-900/50 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold text-gray-200">
                          City {cid}
                        </h3>
                        <span
                          className={`text-sm font-bold ${
                            final >= 0.95
                              ? 'text-emerald-400'
                              : final >= 0.9
                              ? 'text-amber-400'
                              : 'text-red-400'
                          }`}
                        >
                          MII: {(final * 100).toFixed(1)}%
                        </span>
                      </div>

                      {/* MII Change */}
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">{(initial * 100).toFixed(1)}%</span>
                        <span className="text-gray-600">→</span>
                        <span
                          className={
                            delta > 0
                              ? 'text-emerald-400'
                              : delta < 0
                              ? 'text-red-400'
                              : 'text-gray-400'
                          }
                        >
                          {delta > 0 ? '↑' : delta < 0 ? '↓' : '→'}
                          {Math.abs(delta * 100).toFixed(1)}%
                        </span>
                      </div>

                      {/* State metrics */}
                      {state && (
                        <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
                          <div>
                            <dt className="text-gray-500">Integrity</dt>
                            <dd className="text-gray-300">{state.integrity.toFixed(1)}</dd>
                          </div>
                          <div>
                            <dt className="text-gray-500">Trust</dt>
                            <dd className="text-gray-300">{state.trust.toFixed(1)}</dd>
                          </div>
                          <div>
                            <dt className="text-gray-500">Inequality</dt>
                            <dd className="text-gray-300">{state.inequality.toFixed(1)}</dd>
                          </div>
                          <div>
                            <dt className="text-gray-500">Unemployment</dt>
                            <dd className="text-gray-300">{state.unemployment.toFixed(1)}</dd>
                          </div>
                          <div>
                            <dt className="text-gray-500">Life Exp.</dt>
                            <dd className="text-gray-300">{state.life_expectancy.toFixed(1)}</dd>
                          </div>
                          <div>
                            <dt className="text-gray-500">Corruption</dt>
                            <dd className="text-gray-300">{state.corruption.toFixed(1)}</dd>
                          </div>
                        </dl>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* MII Trajectory Chart */}
            <section className="border border-slate-700 rounded-xl p-5 bg-slate-800/50 backdrop-blur space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-200">
                  MII Trajectory
                </h2>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-1 rounded bg-cyan-400" />
                    <span className="text-gray-400">City A</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-1 rounded bg-purple-400" />
                    <span className="text-gray-400">City B</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-1 rounded bg-orange-400" />
                    <span className="text-gray-400">City C</span>
                  </div>
                </div>
              </div>
              <MiiHistoryChart data={miiHistory} />
            </section>

            {/* Last Step Actions */}
            {sim.trajectory && sim.trajectory.length > 0 && (
              <section className="border border-slate-700 rounded-xl p-5 bg-slate-800/50 backdrop-blur space-y-4">
                <h2 className="text-lg font-semibold text-gray-200">
                  Trajectory Summary (Last 5 Steps)
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-gray-400 text-left border-b border-slate-700">
                        <th className="pb-2 pr-4 font-medium">Step</th>
                        <th className="pb-2 pr-4 font-medium">City A</th>
                        <th className="pb-2 pr-4 font-medium">City B</th>
                        <th className="pb-2 pr-4 font-medium">City C</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sim.trajectory.slice(-5).map((step) => (
                        <tr key={step.t} className="border-b border-slate-800">
                          <td className="py-2 pr-4 text-gray-500">t={step.t}</td>
                          {(['A', 'B', 'C'] as CityId[]).map((cid) => (
                            <td key={cid} className="py-2 pr-4">
                              <div className="text-gray-300">{step.actions[cid]}</div>
                              <div
                                className={`text-[10px] ${
                                  step.rewards[cid] >= 0 ? 'text-emerald-400' : 'text-red-400'
                                }`}
                              >
                                Δ{step.rewards[cid]?.toFixed(4)}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        )}

        {/* Footer */}
        <footer className="text-center text-xs text-gray-500 pt-8 border-t border-slate-800">
          <p className="mb-2">
            <span className="text-purple-400">JADE 🟣</span>
            {' • '}
            <span className="text-blue-400">AUREA 🔵</span>
            {' • '}
            <span className="text-gray-300">ATLAS ⚪</span>
            {' • '}
            <span className="text-yellow-400">ECHO 🟡</span>
          </p>
          <p className="italic">&quot;Integrity above acceleration.&quot;</p>
          <p className="mt-1">Mobius Systems — C-154</p>
        </footer>
      </div>
    </main>
  );
}

// MII History Chart Component
type MiiHistory = Record<CityId, { t: number; mii: number }[]>;

function MiiHistoryChart({ data }: { data: MiiHistory }) {
  const width = 700;
  const height = 220;
  const padding = 40;

  const allPoints = [...data.A, ...data.B, ...data.C];
  if (allPoints.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-slate-900/50 rounded-lg border border-slate-700">
        <p className="text-sm text-gray-500">Run a simulation to view MII trajectories.</p>
      </div>
    );
  }

  const maxT = Math.max(...allPoints.map((p) => p.t), 1);
  const minT = Math.min(...allPoints.map((p) => p.t));

  const xScale = (t: number) => {
    if (maxT === minT) return padding;
    return padding + ((t - minT) / (maxT - minT)) * (width - 2 * padding);
  };

  const yScale = (mii: number) => {
    // MII in [0.7, 1.0] range typically
    const yMin = 0.7;
    const yMax = 1.0;
    const yRange = height - 2 * padding;
    const normalized = Math.max(0, Math.min(1, (mii - yMin) / (yMax - yMin)));
    return padding + (1 - normalized) * yRange;
  };

  const colors: Record<CityId, string> = {
    A: '#22d3ee', // cyan
    B: '#a855f7', // purple
    C: '#f97316', // orange
  };

  const linePath = (cid: CityId) => {
    const pts = data[cid];
    if (pts.length === 0) return '';
    return pts
      .map((p, idx) => {
        const x = xScale(p.t);
        const y = yScale(p.mii);
        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-full bg-slate-900/50 rounded-lg border border-slate-700"
        style={{ minHeight: '200px' }}
      >
        {/* Grid lines */}
        {[0.75, 0.85, 0.95].map((mii) => (
          <line
            key={mii}
            x1={padding}
            y1={yScale(mii)}
            x2={width - padding}
            y2={yScale(mii)}
            stroke="#374151"
            strokeWidth={0.5}
          />
        ))}

        {/* Axes */}
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="#4b5563"
          strokeWidth={1}
        />
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#4b5563"
          strokeWidth={1}
        />

        {/* Target line (95%) */}
        <line
          x1={padding}
          y1={yScale(0.95)}
          x2={width - padding}
          y2={yScale(0.95)}
          stroke="#22c55e"
          strokeDasharray="6 4"
          strokeWidth={1}
        />
        <text x={padding + 6} y={yScale(0.95) - 6} fontSize={10} fill="#22c55e">
          95% Target
        </text>

        {/* Warning line (90%) */}
        <line
          x1={padding}
          y1={yScale(0.90)}
          x2={width - padding}
          y2={yScale(0.90)}
          stroke="#eab308"
          strokeDasharray="4 4"
          strokeWidth={0.75}
        />
        <text x={padding + 6} y={yScale(0.90) - 6} fontSize={10} fill="#eab308">
          90%
        </text>

        {/* City lines */}
        {(['A', 'B', 'C'] as CityId[]).map((cid) => (
          <path
            key={cid}
            d={linePath(cid)}
            fill="none"
            stroke={colors[cid]}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {/* Y-axis labels */}
        {[0.75, 0.85, 0.95].map((mii) => (
          <text
            key={mii}
            x={padding - 8}
            y={yScale(mii) + 4}
            fontSize={9}
            fill="#6b7280"
            textAnchor="end"
          >
            {(mii * 100).toFixed(0)}%
          </text>
        ))}

        {/* X-axis label */}
        <text
          x={width / 2}
          y={height - 10}
          fontSize={10}
          fill="#6b7280"
          textAnchor="middle"
        >
          Timestep
        </text>
      </svg>
    </div>
  );
}
