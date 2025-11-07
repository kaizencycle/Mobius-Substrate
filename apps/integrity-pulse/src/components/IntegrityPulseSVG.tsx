import React, { useMemo } from 'react';
export type PulseProps = { gi: number; entropy?: number; eventsPerMin?: number };
export default function IntegrityPulseSVG({ gi, entropy = 0.02, eventsPerMin = 1 }: PulseProps) {
  const R = 180;
  const nodes = useMemo(() => {
    const pts: [number, number][] = [[0, 0]];
    const ring = (r: number) => { for (let k = 0; k < 6; k++) { const a = (Math.PI / 3) * k; pts.push([Math.cos(a) * r, Math.sin(a) * r]); } };
    ring(R); ring(R * 2);
    return pts;
  }, []);
  const hue = 160 + Math.round(70 * Math.min(1, Math.max(0, gi)));
  const pulsar = 0.5 + eventsPerMin * 0.2;
  return (
    <svg viewBox="-420 -260 840 520" width="100%" height="100%" role="img" aria-label="Integrity Pulse sacred geometry">
      <defs>
        <radialGradient id="halo" r="65%">
          <stop offset="0%" stopColor={`hsl(${hue},90%,70%)`} />
          <stop offset="70%" stopColor={`hsla(${hue},90%,50%,0.35)`} />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="4" /></filter>
      </defs>
      {[...Array(24)].map((_, i) => (
        <circle key={i} r={R + i * 12} stroke={`hsla(${hue},95%,60%,${0.14 - i * 0.004})`} strokeWidth={1.5} fill="none" style={{ filter: 'url(#glow)' }} />
      ))}
      {nodes.map(([x, y], i) => (
        <g key={i} transform={`translate(${x},${y})`}>
          <circle r={R} fill="url(#halo)" />
          <circle r={R} fill="none" stroke={`hsl(${hue},85%,55%)`} strokeWidth={1.25} />
        </g>
      ))}
      {[...Array(8)].map((_, i) => {
        const a = (Math.PI * 2 / 8) * i; const r = R * 3.2;
        return <circle key={i} cx={Math.cos(a) * r} cy={Math.sin(a) * r} r={8 * pulsar} fill={`hsla(${hue},100%,65%,0.65)`} />;
      })}
    </svg>
  );
}

