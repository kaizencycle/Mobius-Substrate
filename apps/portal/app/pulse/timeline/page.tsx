import { MobiusPulseTimeline } from "../../../components/MobiusPulseTimeline";

export default function PulseTimelinePage() {
  return (
    <main className="min-h-screen bg-black text-neutral-100">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold">
            Mobius Pulse Timeline
          </h1>
          <p className="text-sm text-neutral-400 max-w-2xl">
            Daily integrity snapshots of the Mobius monorepo.
            Each point represents a recorded Global Integrity (GI)
            and Mobius Integrity Index (MII) from the indexer.
          </p>
        </header>

        <MobiusPulseTimeline />
      </div>
    </main>
  );
}
