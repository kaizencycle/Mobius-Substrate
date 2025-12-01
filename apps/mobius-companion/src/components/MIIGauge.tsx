// MII Gauge Component
// Cycle: C-151

import { motion } from 'framer-motion';

interface MIIGaugeProps {
  score: number;
  threshold: number;
  aboveThreshold: boolean;
}

export function MIIGauge({ score, threshold, aboveThreshold }: MIIGaugeProps) {
  const percentage = score * 100;
  const thresholdPercentage = threshold * 100;
  
  // Calculate stroke dash for circular progress
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="rounded-2xl bg-slate-900/50 border border-slate-700/50 p-6">
      <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
        Mobius Integrity Index
      </h2>

      <div className="flex flex-col items-center">
        {/* Circular gauge */}
        <div className="relative w-32 h-32">
          {/* Background circle */}
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-slate-800"
            />
            {/* Threshold marker */}
            <circle
              cx="64"
              cy="64"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (thresholdPercentage / 100) * circumference}
              className="text-slate-700"
            />
            {/* Progress */}
            <motion.circle
              cx="64"
              cy="64"
              r="45"
              fill="none"
              stroke="url(#miiGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
            <defs>
              <linearGradient id="miiGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={aboveThreshold ? '#10b981' : '#f59e0b'} />
                <stop offset="100%" stopColor={aboveThreshold ? '#34d399' : '#fbbf24'} />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className={`text-2xl font-bold ${
                aboveThreshold ? 'text-emerald-400' : 'text-amber-400'
              }`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              {score.toFixed(3)}
            </motion.span>
            <span className="text-xs text-slate-500">MII</span>
          </div>
        </div>

        {/* Status */}
        <div className={`mt-4 px-3 py-1 rounded-full text-xs font-medium ${
          aboveThreshold 
            ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/30'
            : 'bg-amber-900/30 text-amber-400 border border-amber-500/30'
        }`}>
          {aboveThreshold ? '✓ Minting Eligible' : '⚠ Below Threshold'}
        </div>

        {/* Threshold indicator */}
        <div className="mt-4 w-full text-center text-xs text-slate-500">
          Threshold: {threshold.toFixed(2)} • 
          {aboveThreshold 
            ? ` +${((score - threshold) * 100).toFixed(1)}% above`
            : ` ${((threshold - score) * 100).toFixed(1)}% below`
          }
        </div>

        {/* Components breakdown */}
        <div className="mt-4 w-full grid grid-cols-2 gap-2 text-xs">
          {[
            { label: 'Memory', value: 0.95 },
            { label: 'Human', value: 0.92 },
            { label: 'Integrity', value: 0.98 },
            { label: 'Ethics', value: 0.96 }
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between text-slate-500">
              <span>{label}</span>
              <span className="text-slate-400">{value.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
