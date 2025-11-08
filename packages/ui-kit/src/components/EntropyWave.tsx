import React from 'react';
export default function EntropyWave({ entropy=0.02 }: { entropy?: number }){
  const amp = Math.min(1, Math.max(0, entropy)) * 24 + 4;
  const bars = Array.from({length:48}).map((_,i)=> Math.abs(Math.sin(i*0.35)) * amp + 4);
  return (
    <div style={{display:'flex', gap:2}} aria-label="Entropy waveform">
      {bars.map((h, i)=>(<div key={i} style={{width:6, height:h, background:'rgba(255,179,71,0.85)', borderRadius:3}}/>))}
    </div>
  )
}

