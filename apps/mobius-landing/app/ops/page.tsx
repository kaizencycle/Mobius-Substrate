"use client";

import { MobiusOpsDashboard } from "@/components/ops/MobiusOpsDashboard";

export default function OpsPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #020617 0, #000 45%)",
        color: "#e5e7eb",
        padding: "32px 24px",
      }}
    >
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, marginBottom: 4 }}>Mobius Ops Console</h1>
        <p style={{ margin: 0, opacity: 0.75, maxWidth: 640 }}>
          Real-time view of the Mobius Integrity Index, Sentinel decisions, and
          multi-engine health. Powered by DVA.LITE telemetry.
        </p>
      </header>

      <section>
        <MobiusOpsDashboard />
      </section>
    </main>
  );
}
