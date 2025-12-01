// Ledger View Component
// Cycle: C-151

import { motion } from 'framer-motion';

interface LedgerEntry {
  id: string;
  timestamp: string;
  action: string;
  mic: number;
  ks: number;
  mii?: number;
  synced: boolean;
}

// Mock data - in production, fetch from LocalLedger
const mockEntries: LedgerEntry[] = [
  {
    id: 'entry_001',
    timestamp: new Date().toISOString(),
    action: 'reflection',
    mic: 0.024,
    ks: 24000,
    mii: 0.97,
    synced: true
  },
  {
    id: 'entry_002',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    action: 'shield_check',
    mic: 0.015,
    ks: 15000,
    mii: 0.96,
    synced: true
  },
  {
    id: 'entry_003',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    action: 'reflection',
    mic: 0.032,
    ks: 32000,
    mii: 0.98,
    synced: false
  }
];

const actionLabels: Record<string, { label: string; icon: string; color: string }> = {
  reflection: { label: 'Reflection', icon: '📝', color: 'text-violet-400' },
  shield_check: { label: 'Shield Check', icon: '🛡️', color: 'text-emerald-400' },
  civic_action: { label: 'Civic Action', icon: '🏛️', color: 'text-blue-400' },
  guardian_action: { label: 'Guardian', icon: '⚔️', color: 'text-amber-400' },
  mint: { label: 'Mint', icon: '✨', color: 'text-green-400' },
  burn: { label: 'Burn', icon: '🔥', color: 'text-red-400' }
};

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function LedgerView() {
  const entries = mockEntries;

  return (
    <div className="rounded-2xl bg-slate-900/50 border border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Local Ledger</h2>
        <span className="text-xs text-slate-500">{entries.length} entries</span>
      </div>

      <div className="space-y-3">
        {entries.map((entry, index) => {
          const actionMeta = actionLabels[entry.action] || { 
            label: entry.action, 
            icon: '📋', 
            color: 'text-slate-400' 
          };

          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{actionMeta.icon}</span>
                <div>
                  <div className={`font-medium ${actionMeta.color}`}>
                    {actionMeta.label}
                  </div>
                  <div className="text-xs text-slate-500">
                    {formatDate(entry.timestamp)}
                    {entry.mii && ` • MII: ${entry.mii.toFixed(2)}`}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-green-400">
                  +{entry.mic.toFixed(6)} MIC
                </div>
                <div className="text-xs text-slate-500">
                  {entry.ks.toLocaleString()} KS
                  {!entry.synced && (
                    <span className="ml-2 text-amber-400">• pending</span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* View all button */}
      <button className="w-full mt-4 py-2 text-sm text-slate-400 hover:text-slate-300 transition-colors">
        View all entries →
      </button>
    </div>
  );
}
