"use client";

import { useEffect, useState } from "react";
import { KNOWN_AGENTS, colorFor } from "../lib/agents";
import { getAgentSeries, eventsPerMin } from "../state/metrics";

export default function RateCounters(){
  const [_tick, setTick] = useState(0);
  useEffect(()=>{
    const id = setInterval(()=> setTick(t=>t+1), 2_000); // soft refresh
    return ()=> clearInterval(id);
  },[]);

  return (
    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
      {KNOWN_AGENTS.map(a=>{
        const s = getAgentSeries(a);
        const rpm = eventsPerMin(s); // events/min
        const color = colorFor(a);
        return (
          <div key={a} style={{
            border:`1px solid ${color}66`, borderRadius:8, padding:"6px 10px",
            background:`${color}1A`, minWidth:120
          }}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <strong style={{color}}>{a}</strong>
              <span style={{fontVariantNumeric:"tabular-nums"}}>{rpm} /min</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
