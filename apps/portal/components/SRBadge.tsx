'use client';
import { memo, useMemo } from 'react';

const SRBadge = memo(function SRBadge({ verdict }: { verdict?: string }) {
  const color = useMemo(() => {
    const v = (verdict || '').toLowerCase();
    if (v.includes('adopt')) return 'bg-emerald-600';
    if (v.includes('shadow')) return 'bg-amber-600';
    if (v.includes('defer')) return 'bg-rose-600';
    return 'bg-gray-600';
  }, [verdict]);

  return (
    <span className={`inline-block text-xs font-semibold text-white px-2 py-1 rounded ${color}`}>
      {verdict || 'Unknown'}
    </span>
  );
});

export default SRBadge;
