"use client";

import { useEffect, useMemo, useState } from "react";
import { useEventStream } from "../hooks/useEventStream";
import { emitRelay } from "../state/relayStore";

const palette: Record<string, string> = {
  AUREA: "#FFD166",
  HERMES: "#06D6A0",
  ZEUS:  "#EF476F",
  EVE:   "#118AB2",
  JADE:  "#B86BFF",
  ATLAS: "#73DCFF",
  ECHO:  "#FF9F1C"
};

export default function BridgeSignal() {
  const url = process.env.NEXT_PUBLIC_BRIDGE_SSE;
  const { last, count } = useEventStream(url);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (!last) return;
    emitRelay(last);
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 800);
    return () => clearTimeout(t);
  }, [last]);

  const fromC = useMemo(() => (last ? palette[last.from] ?? "#fff" : "#fff"), [last]);
  const toC   = useMemo(() => (last ? palette[last.to]   ?? "#fff" : "#fff"), [last]);

  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      padding: "6px 10px",
      borderRadius: 10,
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.12)",
      boxShadow: flash ? "0 0 20px rgba(255,255,255,0.35)" : "none",
      transition: "box-shadow .2s ease"
    }}>
      <Dot color={fromC} />
      <Arrow />
      <Dot color={toC} />
      <span style={{ fontFamily: "ui-monospace, SFMono-Regular, monospace", fontSize: 12, opacity: .9 }}>
        {last ? `${last.from} → ${last.to}` : "bridge idle"} • {count}
      </span>
    </div>
  );
}

function Dot({ color }: { color: string }) {
  return <span style={{
    width: 10, height: 10, borderRadius: "50%",
    background: color, display: "inline-block", boxShadow: `0 0 8px ${color}`
  }} />;
}
function Arrow() {
  return <span style={{ opacity: .7 }}>➟</span>;
}
