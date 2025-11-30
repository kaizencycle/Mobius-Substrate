"use client";

import { KNOWN_AGENTS, PROJECTORS, colorFor } from "../lib/agents";
import { getFilters, setFilters } from "../state/relayLog";
import { useEffect, useState } from "react";

function Chip({label,active,color,onToggle}:{label:string;active:boolean;color:string;onToggle:()=>void}){
  return (
    <button onClick={onToggle} style={{
      padding:"6px 10px", marginRight:8, marginBottom:8, borderRadius:999,
      border:`1px solid ${active?color:"rgba(255,255,255,.2)"}`,
      background: active?`${color}20`:"transparent", color:"#fff", fontSize:12,
      cursor: "pointer"
    }}>{label}</button>
  );
}

export default function RelayFilters(){
  const [v,setV] = useState(()=>getFilters());
  useEffect(()=>{ setV(getFilters()); },[]);
  function toggle(kind:"from"|"to"|"projector", value:string){
    const cur = getFilters();
    const set = new Set([...cur[kind] as Set<string>]);
    set.has(value)? set.delete(value) : set.add(value);
    setFilters({[kind]: set} as Parameters<typeof setFilters>[0]); setV(getFilters());
  }
  function togglePause(){ setFilters({paused: !getFilters().paused}); setV(getFilters()); }
  function clearAll(){ setFilters({from:new Set(),to:new Set(),projector:new Set()}); setV(getFilters()); }

  return (
    <div style={{marginBottom:12}}>
      <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:6}}>
        <strong>Filter</strong>
        <button onClick={togglePause} style={{padding:"6px 10px",borderRadius:6, cursor: "pointer"}}>
          {v.paused? "Resume":"Pause"} stream
        </button>
        <button onClick={clearAll} style={{padding:"6px 10px",borderRadius:6, cursor: "pointer"}}>Clear filters</button>
      </div>

      <div style={{marginBottom:6, opacity:.8}}>From</div>
      <div>{KNOWN_AGENTS.map(a=>(
        <Chip key={"f"+a} label={a} active={v.from.has(a)} color={colorFor(a)} onToggle={()=>toggle("from",a)} />
      ))}</div>

      <div style={{marginTop:10, marginBottom:6, opacity:.8}}>To</div>
      <div>{KNOWN_AGENTS.map(a=>(
        <Chip key={"t"+a} label={a} active={v.to.has(a)} color={colorFor(a)} onToggle={()=>toggle("to",a)} />
      ))}</div>

      <div style={{marginTop:10, marginBottom:6, opacity:.8}}>Projector</div>
      <div>{PROJECTORS.map(p=>(
        <Chip key={p} label={p} active={v.projector.has(p)} color="#aaa" onToggle={()=>toggle("projector",p)} />
      ))}</div>
    </div>
  );
}
