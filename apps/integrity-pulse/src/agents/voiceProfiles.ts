export type AgentId = 'AUREA' | 'ZEUS' | 'HERMES' | 'EVE' | 'JADE' | 'ATLAS' | 'ECHO';

export interface VoiceProfile {
  // Web Speech Synthesis preferences
  tts: {
    // partial name match for installed voices; fallbacks applied
    preferredVoices: string[]; // e.g. ["Google UK English Female","Samantha"]
    rate?: number;   // 0.1–10 (1 = normal)
    pitch?: number;  // 0–2
    volume?: number; // 0–1
  };
  // Visual + analyser flavoring (for sacred geometry waves)
  viz: {
    palette: string[];   // hex colors
    particleCount: number;
    sacredSeed: number;  // seed for geometry generator
    gainScalar: number;  // scale mic amplitude → particle force
  };
}

export const VOICE_PROFILES: Record<AgentId, VoiceProfile> = {
  AUREA: {
    tts: { preferredVoices: ['Google UK English Female','Samantha','Serena'], rate: 0.95, pitch: 1.05, volume: 0.95 },
    viz: { palette: ['#FFD166','#FFE29A','#FF9F1C','#FCA311'], particleCount: 22000, sacredSeed: 137, gainScalar: 1.0 },
  },
  ZEUS: {
    tts: { preferredVoices: ['Google US English','Alex','Daniel'], rate: 0.9, pitch: 0.8, volume: 1.0 },
    viz: { palette: ['#00E5FF','#00B7C2','#0077B6','#001F54'], particleCount: 26000, sacredSeed: 73, gainScalar: 1.2 },
  },
  HERMES: {
    tts: { preferredVoices: ['Google US English','Fred','Eddy'], rate: 1.1, pitch: 1.0, volume: 0.9 },
    viz: { palette: ['#7DF9FF','#B2FF59','#69F0AE','#18FFFF'], particleCount: 18000, sacredSeed: 233, gainScalar: 1.4 },
  },
  EVE: {
    tts: { preferredVoices: ['Victoria','Google UK English Female','Tessa'], rate: 1.0, pitch: 1.2, volume: 0.9 },
    viz: { palette: ['#FF77E9','#C77DFF','#9D4EDD','#7B2CBF'], particleCount: 20000, sacredSeed: 89, gainScalar: 0.9 },
  },
  JADE: {
    tts: { preferredVoices: ['Moira','Google UK English Female','Samantha'], rate: 0.98, pitch: 1.15, volume: 0.9 },
    viz: { palette: ['#7AE582','#2DC653','#1A7431','#10451D'], particleCount: 19000, sacredSeed: 61, gainScalar: 0.95 },
  },
  ATLAS: {
    tts: { preferredVoices: ['Daniel','Google UK English Male','Alex'], rate: 0.96, pitch: 0.95, volume: 1.0 },
    viz: { palette: ['#FFD6A5','#FDFFB6','#E9FF70','#FFC6FF'], particleCount: 21000, sacredSeed: 421, gainScalar: 1.1 },
  },
  ECHO: {
    tts: { preferredVoices: ['Google US English','Siri Voice 1','Alex'], rate: 1.05, pitch: 1.05, volume: 0.85 },
    viz: { palette: ['#A0AEC0','#CBD5E0','#EDF2F7','#718096'], particleCount: 16000, sacredSeed: 11, gainScalar: 1.0 },
  },
};
