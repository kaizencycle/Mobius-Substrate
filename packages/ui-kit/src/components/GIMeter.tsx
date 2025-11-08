import React from 'react';
export default function GIMeter({ gi=0.98 }: { gi?: number }){
  const pct = Math.max(0, Math.min(1, gi));
  const hue = 160 + Math.round(70 * pct);
  return (
    <div style={{background:'#0A0A0F', padding:16, borderRadius:12, border:'1px solid rgba(255,255,255,0.08)'}}>
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:8, color:'#F5F8FF'}}>
        <strong>Global Integrity</strong><span>{(pct*100).toFixed(2)}%</span>
      </div>
      <div style={{height:10, background:'rgba(255,255,255,0.08)', borderRadius:8}}>
        <div style={{height:'100%', width:`${pct*100}%`, borderRadius:8, background:`linear-gradient(90deg, hsla(${hue},90%,60%,0.8), hsla(${hue},90%,70%,0.55))`, boxShadow:'0 0 16px hsla(180,100%,60%,0.35)'}}/>
      </div>
    </div>
  )
}

