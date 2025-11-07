import React from 'react';
type Mode = 'svg' | 'webgl';
export default function RenderModeToggle({ mode, setMode }: { mode: Mode, setMode: (m: Mode)=>void }){
  return (
    <div style={{display:'inline-flex', gap:8, background:'rgba(255,255,255,0.06)', padding:8, borderRadius:8}}>
      <button onClick={()=>setMode('svg')} style={{opacity: mode==='svg'?1:0.6}}>SVG</button>
      <button onClick={()=>setMode('webgl')} style={{opacity: mode==='webgl'?1:0.6}}>3D</button>
    </div>
  )
}

