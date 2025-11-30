"use client";

import { useEffect, useState } from "react";
import Sparkline from "./Sparkline";
import { colorFor } from "../lib/agents";
import { getPairSeries, topPairs, eventsPerMin } from "../state/metrics";

export default function PairSparklines(){
  const [_tick, setTick] = useState(0);
  const [pairs, setPairs] = useState<string[]>([]);
  useEffect(()=>{
    const id = setInterval(()=>{
      setPairs(topPairs(8)); // refresh top pairs list
      setTick(t=>t+1);
    }, 2_000);
    return ()=> clearInterval(id);
  },[]);

  return (
    <section style={{marginTop:16}}>
      <h3 style={{margin:"8px 0"}}>Agent Links — Activity (last 5 min)</h3>
      <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))", gap:12}}>
        {pairs.length===0 && <div style={{opacity:.7}}>No traffic yet…</div>}
        {pairs.map(p=>{
          const [from,to] = p.split("→");
          const series = getPairSeries(p);
          const rpm = eventsPerMin(series);
          return (
            <div key={p} style={{border:"1px solid rgba(255,255,255,.12)", borderRadius:10, padding:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center", marginBottom:6}}>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  <Badge label={from} color={colorFor(from)} />
                  <span style={{opacity:.6}}>➟</span>
                  <Badge label={to} color={colorFor(to)} />
                </div>
                <span style={{fontVariantNumeric:"tabular-nums", opacity:.9}}>{rpm}/min</span>
              </div>
              <Sparkline data={series} stroke="#fff" />
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Badge({label,color}:{label:string;color:string}){
  return <span style={{
    display:"inline-flex", alignItems:"center", justifyContent:"center",
    height:20, borderRadius:6, padding:"0 8px",
    border:`1px solid ${color}`, background:`${color}20`, color:"#fff", fontSize:11
  }}>{label}</span>;
}
