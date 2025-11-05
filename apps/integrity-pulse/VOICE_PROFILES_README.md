# Sacred Viz Enhancement — Voice Profiles & Golden Geometry

## 🎯 Overview

This PR adds comprehensive voice profiles, TTS support, and a golden-ratio sacred geometry particle system to the Integrity Pulse dashboard. All microphone streams are properly cleaned up on unmount to resolve privacy/performance concerns.

## ✅ Changes Made

### 1. **Microphone Cleanup Fix** ✅
- Fixed microphone stream cleanup in `SacredViz.tsx`
- Properly stops all media tracks and closes AudioContext on unmount
- Resolves GitHub Codex privacy review comment

### 2. **Reusable Microphone Hook** ✅
- `src/hooks/useMicrophoneAnalyser.ts`
- Safe mic capture with automatic cleanup
- Exposes `start()`, `stop()`, and frequency analysis methods
- Can be reused across all visualizations

### 3. **Voice Profiles** ✅
- `src/agents/voiceProfiles.ts`
- Per-agent TTS preferences (voice, rate, pitch, volume)
- Per-agent visual palettes and particle system parameters
- Supports: AUREA, ZEUS, HERMES, EVE, JADE, ATLAS, ECHO

### 4. **TTS Helper** ✅
- `src/lib/tts.ts`
- `speakAs(agent, text)` function with graceful voice fallback
- Handles async voice loading for browser compatibility

### 5. **Golden-Ratio Particle System** ✅
- `src/three/goldenField.ts` - Fibonacci sphere distribution generator
- `src/three/paletteTexture.ts` - 1D palette texture creator
- `src/three/shaders/particles.vert.glsl` - Vertex shader with energy-driven motion
- `src/three/shaders/particles.frag.glsl` - Fragment shader with bloom-ready glow
- `src/components/GeometryCanvas.tsx` - React component that wires everything together

### 6. **Next.js Configuration** ✅
- Updated `next.config.js` to handle `.glsl` files via webpack
- Shaders can be imported as strings (or kept inline for compatibility)

## 📁 File Structure

```
apps/integrity-pulse/
├── src/
│   ├── hooks/
│   │   └── useMicrophoneAnalyser.ts       # Safe mic hook
│   ├── agents/
│   │   └── voiceProfiles.ts               # Agent profiles
│   ├── lib/
│   │   └── tts.ts                          # TTS helper
│   ├── three/
│   │   ├── goldenField.ts                  # Geometry generator
│   │   ├── paletteTexture.ts               # Palette texture
│   │   └── shaders/
│   │       ├── particles.vert.glsl         # Vertex shader
│   │       └── particles.frag.glsl         # Fragment shader
│   ├── components/
│   │   ├── SacredViz.tsx                  # Fixed cleanup ✅
│   │   ├── GeometryCanvas.tsx              # New golden field viz
│   │   └── AgentVoiceSelector.tsx         # Voice test component
│   └── app/
│       └── api/
│           └── agents/
│               └── telemetry/
│                   └── route.ts            # Telemetry API
└── next.config.js                          # Updated for GLSL ✅
```

## 🔧 Usage Examples

### Using the Microphone Hook

```typescript
import { useMicrophoneAnalyser } from '@/hooks/useMicrophoneAnalyser';

function MyComponent() {
  const mic = useMicrophoneAnalyser({ 
    fftSize: 2048, 
    autoStart: true 
  });
  
  // mic.analyser, mic.stream, mic.start(), mic.stop()
  // mic.getByteFrequencyData(buffer)
}
```

### Using Voice Profiles

```typescript
import { speakAs } from '@/lib/tts';
import { VOICE_PROFILES } from '@/agents/voiceProfiles';

// Speak as an agent
speakAs('AUREA', 'Systems architecture online.');

// Access visual parameters
const profile = VOICE_PROFILES['HERMES'];
const palette = profile.viz.palette;      // ['#7DF9FF', '#B2FF59', ...]
const particleCount = profile.viz.particleCount;  // 18000
const seed = profile.viz.sacredSeed;     // 233
```

### Using GeometryCanvas

```typescript
import GeometryCanvas from '@/components/GeometryCanvas';
import { useRef } from 'react';

function MyViz() {
  const energyRef = useRef(0);
  
  // Update energyRef.current from mic analysis
  
  return (
    <GeometryCanvas
      palette={['#FFD166', '#FFE29A', '#FF9F1C']}
      count={22000}
      seed={137}
      baseSize={2.0}
      energyRef={energyRef}
    />
  );
}
```

## 🎨 Agent Visual Profiles

Each agent has unique visual characteristics:

| Agent | Palette Colors | Particles | Seed | Gain Scalar |
|-------|---------------|-----------|------|-------------|
| AUREA | Gold/Yellow tones | 22,000 | 137 | 1.0 |
| ZEUS | Cyan/Blue tones | 26,000 | 73 | 1.2 |
| HERMES | Cyan/Green tones | 18,000 | 233 | 1.4 |
| EVE | Magenta/Purple tones | 20,000 | 89 | 0.9 |
| JADE | Green tones | 19,000 | 61 | 0.95 |
| ATLAS | Yellow/White tones | 21,000 | 421 | 1.1 |
| ECHO | Gray/Silver tones | 16,000 | 11 | 1.0 |

## 🔒 Privacy & Performance

### Microphone Cleanup
- ✅ All media tracks stopped on unmount
- ✅ AudioContext closed properly
- ✅ No ghost mic sessions
- ✅ Browser permission indicator turns off

### Performance
- Optimized particle counts per agent
- Efficient GLSL shaders
- Proper Three.js disposal
- Memory cleanup on unmount

## 🧪 Testing

### Test Voice Profiles
```typescript
import { AgentVoiceSelector } from '@/components/AgentVoiceSelector';

<AgentVoiceSelector agent="AUREA" />
```

### Test Microphone Hook
```typescript
const mic = useMicrophoneAnalyser({ autoStart: false });
await mic.start();
// ... use mic
mic.stop(); // Cleanup
```

## 📝 Commit Message

```
fix(audio): properly stop microphone stream on unmount + add voice profiles

- Fixed microphone stream cleanup in SacredViz (resolves Codex privacy review)
- Added useMicrophoneAnalyser hook with full cleanup
- Added VOICE_PROFILES (TTS + viz palettes/params) for all agents
- Added tts.speakAs(agent,text) helper with graceful voice fallback
- Added golden-ratio sacred geometry particle system
- Added GeometryCanvas component for golden field visualization
- Updated next.config.js to handle GLSL shader files
- Added AgentVoiceSelector component for voice testing

Resolves: Microphone stream never stops (privacy/performance issue)
```

## 🚀 Next Steps

1. **Wire live telemetry**: Replace mock API with real Lab6 Proof feeds
2. **Add per-agent views**: Create individual viz pages per agent
3. **Post-processing bloom**: Add EffectComposer for true bloom (optional)
4. **GI color mapping**: Shift colors when GI < 0.97 (warning state)

## 📚 References

- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Web Speech Synthesis API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis)
- [Three.js Shaders](https://threejs.org/docs/#manual/en/introduction/Shader-materials)
- [Fibonacci Sphere Distribution](https://en.wikipedia.org/wiki/Fibonacci_sphere)
