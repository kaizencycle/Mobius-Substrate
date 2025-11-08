'use client';
import React, { useEffect, useState } from 'react';

export default function MiiTicker({ 
  label = 'Mobius Integrity Index', 
  env = 'prod' 
}: { 
  label?: string;
  env?: string;
}) {
  const [value, setValue] = useState<number | null>(null);
  const [source, setSource] = useState<string>('—');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    
    const fetcher = async () => {
      try {
        const res = await fetch(
          `/api/mii?env=${encodeURIComponent(env)}`, 
          { cache: 'no-store' }
        );
        const data = await res.json();
        if (active) {
          setValue(data?.mii ?? null);
          setSource(data?.source || '—');
          setError(data?.error || null);
        }
      } catch (err: any) {
        if (active) {
          setValue(null);
          setError(err?.message || 'network error');
        }
      }
    };

    fetcher();
    const id = setInterval(fetcher, 15000); // Refresh every 15s
    
    return () => { 
      active = false; 
      clearInterval(id); 
    };
  }, [env]);

  const state = value === null 
    ? 'unknown' 
    : value >= 0.95 
    ? 'good' 
    : value >= 0.90 
    ? 'warn' 
    : 'bad';

  const color =
    state === 'good' ? '#10b981' :
    state === 'warn' ? '#f59e0b' :
    state === 'bad' ? '#ef4444' :
    '#6b7280';

  return (
    <div className="mx-auto my-6 flex max-w-xl flex-col gap-4 rounded-2xl border border-zinc-800 p-6 bg-zinc-900/40">
      <div className="flex items-center justify-between">
        <div className="text-sm opacity-70">{label}</div>
        <div className="text-xs opacity-60">env: {env}</div>
      </div>
      <div className="flex items-baseline gap-4">
        <div className="text-3xl font-semibold tabular-nums" style={{ color }}>
          {value !== null ? value.toFixed(3) : '—'}
        </div>
        <div className="text-sm opacity-70">
          {state === 'good' && 'Stable'}
          {state === 'warn' && 'Recovering'}
          {state === 'bad' && 'Below floor'}
          {state === 'unknown' && (error ? `Error: ${error}` : 'Fetching…')}
        </div>
      </div>
      {source !== '—' && (
        <div className="text-xs opacity-50">source: {source}</div>
      )}
      <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${Math.min(Math.max(((value ?? 0) / 1.0) * 100, 0), 100)}%`,
            backgroundColor: color
          }}
        />
      </div>
    </div>
  );
}
