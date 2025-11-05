import React from 'react';
import { VOICE_PROFILES, AgentId } from '../agents/voiceProfiles';
import { speakAs } from '../lib/tts';

export function AgentVoiceSelector({ agent }: { agent: AgentId }) {
  const prefs = VOICE_PROFILES[agent].tts.preferredVoices;
  return (
    <div style={{display:'flex', gap:8, alignItems:'center', fontFamily:'Inter, ui-sans-serif', fontSize:12, color:'#cfd3ff'}}>
      <button 
        onClick={() => speakAs(agent, `This is ${agent}. Voice check.`)} 
        style={{
          background:'rgba(255,255,255,0.07)', 
          border:'1px solid rgba(255,255,255,0.15)',
          padding:'6px 10px', 
          borderRadius:8, 
          cursor:'pointer', 
          fontSize:12, 
          color:'#e9e9ff'
        }}
      >
        Test {agent} voice
      </button>
      <span style={{opacity:0.7, fontSize:11}}>Prefs: {prefs.join(' / ')}</span>
    </div>
  );
}
