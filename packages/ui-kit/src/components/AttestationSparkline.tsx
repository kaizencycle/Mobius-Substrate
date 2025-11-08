import React from 'react';
export default function AttestationSparkline({ points=[2,4,6,4,8,9,7,10,12,11] }:{ points?: number[] }){
  const max = Math.max(...points, 1);
  const path = points.map((v,i)=> `${i===0?'M':'L'} ${i*10} ${20-(v/max)*20}`).join(' ');
  return (
    <svg viewBox="0 0 100 24" width="100%" height="24">
      <path d={path} stroke="#40E0D0" strokeWidth="2" fill="none"/>
    </svg>
  )
}

