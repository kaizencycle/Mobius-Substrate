// Wallet Card Component
// Cycle: C-151

import { motion } from 'framer-motion';

interface WalletCardProps {
  mic: number;
  ks: number;
  pending: number;
}

export function WalletCard({ mic, ks, pending }: WalletCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-900/50 to-indigo-900/50 border border-violet-500/20 p-6"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
            MIC Wallet
          </h2>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-slate-500">Local</span>
          </div>
        </div>

        {/* Main Balance */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              {mic.toFixed(6)}
            </span>
            <span className="text-lg text-slate-400">MIC</span>
          </div>
          <div className="mt-1 text-slate-500">
            {ks.toLocaleString()} Kaizen Shards
          </div>
        </div>

        {/* Pending */}
        {pending > 0 && (
          <div className="flex items-center gap-2 text-sm text-amber-400/80">
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="40 20" />
            </svg>
            <span>+{pending.toFixed(6)} MIC pending</span>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button className="flex-1 py-2 px-4 bg-violet-600 hover:bg-violet-500 rounded-lg font-medium transition-colors">
            Send
          </button>
          <button className="flex-1 py-2 px-4 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors">
            Receive
          </button>
        </div>
      </div>
    </motion.div>
  );
}
