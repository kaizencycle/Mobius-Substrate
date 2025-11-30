export function SRHeader({
  subject, cycle, mii, timestamp, eventId,
}: { subject?: string; cycle?: string; mii?: number; timestamp?: string; eventId: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-bold">{subject || 'Situational Report'}</h1>
      <div className="text-sm text-zinc-400">
        <span>Cycle: <strong>{cycle || '—'}</strong></span>
        <span className="mx-2">·</span>
        <span>MII: <strong>{mii?.toFixed?.(3) ?? '—'}</strong></span>
        <span className="mx-2">·</span>
        <span>{new Date(timestamp || Date.now()).toLocaleString()}</span>
      </div>
      <div className="text-xs text-zinc-500">Event ID: <code>{eventId}</code></div>
    </div>
  );
}
