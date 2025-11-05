"use client";

import { useEffect, useRef, useState } from "react";

export type RelayEvt = {
  id: string; from: string; to: string; projector: string;
  ts: string; size_bytes: number; lambda?: number; gi?: number;
};

export function useEventStream(url: string | undefined) {
  const [last, setLast] = useState<RelayEvt | null>(null);
  const [count, setCount] = useState(0);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!url) return;
    const es = new EventSource(url);
    esRef.current = es;
    es.onmessage = (e) => {
      try {
        const evt: RelayEvt = JSON.parse(e.data);
        setLast(evt);
        setCount((c) => c + 1);
      } catch {}
    };
    es.onerror = () => {
      es.close();
      setTimeout(() => { 
        if (esRef.current) {
          esRef.current.close();
        }
        esRef.current = new EventSource(url); 
      }, 1500);
    };
    return () => {
      es.close();
      if (esRef.current) {
        esRef.current.close();
      }
    };
  }, [url]);

  return { last, count };
}
