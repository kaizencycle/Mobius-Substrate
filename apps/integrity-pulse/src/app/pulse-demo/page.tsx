'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import IntegrityPulseSVG from '../components/IntegrityPulseSVG';
import RenderModeToggle from '../components/RenderModeToggle';
import { usePulseFeed } from '../hooks/usePulseFeed';

const SacredPulse3D = dynamic(() => import('../components/SacredPulse3D'), { ssr: false });

export default function PulseDemo(){
  const [mode, setMode] = useState<'svg'|'webgl'>('svg');
  const { gi, entropy, eventsPerMin } = usePulseFeed(process.env.NEXT_PUBLIC_PULSE_API);
  return (
    <div style={{minHeight:'100vh', background:'#0b1d12', color:'white'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 18px'}}>
        <h2 style={{margin:0}}>Integrity Pulse — Sacred Geometry</h2>
        <RenderModeToggle mode={mode} setMode={setMode}/>
      </div>
      <div style={{height:'calc(100vh - 68px)', padding:12}}>
        {mode==='svg' ? (
          <IntegrityPulseSVG gi={gi} entropy={entropy} eventsPerMin={eventsPerMin}/>
        ) : (
          <SacredPulse3D gi={gi} eventsPerMin={eventsPerMin}/>
        )}
      </div>
    </div>
  );
}

