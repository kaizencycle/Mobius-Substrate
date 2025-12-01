// Sync Status Component
// Cycle: C-151

interface SyncStatusProps {
  isConnected: boolean;
}

export function SyncStatus({ isConnected }: SyncStatusProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-full">
      <div className={`w-2 h-2 rounded-full ${
        isConnected ? 'bg-green-500' : 'bg-red-500'
      } animate-pulse`} />
      <span className="text-xs text-slate-400">
        {isConnected ? 'Synced' : 'Offline'}
      </span>
    </div>
  );
}
