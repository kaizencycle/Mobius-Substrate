import React from 'react';
import { KaizenButton, GIMeter, EntropyWave } from '@civic/ui-kit';

export default function Lab6Demo(){
  return (
    <div style={{background:'#0A0A0F', color:'#F5F8FF', minHeight:'100vh', padding:24}}>
      <h2>Citizen Shield — Demo</h2>
      <GIMeter gi={0.962}/>
      <div style={{margin:'16px 0'}}><EntropyWave entropy={0.22}/></div>
      <KaizenButton>Scan Now</KaizenButton>
    </div>
  )
}

