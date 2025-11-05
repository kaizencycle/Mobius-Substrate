"use client";

import { useEffect, useState } from "react";
import { onRelay } from "../state/relayStore";
import type { RelayEvt } from "../hooks/useEventStream";

export function BridgeToast() {
  const [evt, setEvt] = useState<RelayEvt | null>(null);
  useEffect(() => onRelay((e) => {
    setEvt(e);
    setTimeout(() => setEvt(null), 4000);
  }), []);

  if (!evt) return null;
  return (
    <div style={{
      position: "fixed", right: 16, bottom: 16,
      padding: "10px 14px",
      background: "rgba(0,0,0,0.7)",
      border: "1px solid rgba(255,255,255,0.15)",
      borderRadius: 10, color: "#fff", fontSize: 13,
      maxWidth: 360, backdropFilter: "blur(6px)"
    }}>
      <strong style={{ fontFamily: "ui-monospace" }}>{evt.from} → {evt.to}</strong>
      <div style={{ opacity: .9, marginTop: 4 }}>
        projector <code>{evt.projector}</code> · {pretty(evt.size_bytes)}
        <br/> {new Date(evt.ts).toLocaleTimeString()}
      </div>
    </div>
  );
}
function pretty(n: number) {
  if (n > 1e6) return (n/1e6).toFixed(2) + " MB";
  if (n > 1e3) return (n/1e3).toFixed(1) + " kB";
  return n + " B";
}
