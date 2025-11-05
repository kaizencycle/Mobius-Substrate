# Sacred Viz — Audio-Reactive Sacred Geometry Visualization

An audio-reactive, shader-driven visualization system for the Integrity Pulse dashboard, featuring Windows Media Player-style visuals with sacred geometry patterns.

## Features

### 🎵 Audio Input
- **Microphone**: Real-time audio analysis from your microphone
- **File Upload**: Load and play audio files (MP3, WAV, etc.) without page reload
- Automatic frequency analysis using Web Audio API FFT

### 🌸 Geometry Presets
Switch between four sacred geometry patterns:

1. **🌹 Rose** (default)
   - Rose-knot/torus blend
   - Smooth, organic spirals
   - Audio modulates radius and twist

2. **🔮 Torus Knot**
   - Parametric torus knot with p/q parameters
   - Bass controls p, mids control q
   - Creates complex, interwoven patterns

3. **🌸 Flower of Life**
   - 19-circle grid pattern
   - Each agent renders as a ring
   - Represents harmony and interconnectedness

4. **🪞 Lissajous**
   - Multi-frequency parametric curves
   - Each frequency band drives different axes
   - Creates mesmerizing, wave-like patterns

### ✨ Visual Effects
- **Bloom Toggle**: Adds glow effect to bright particles
- **Additive Blending**: Creates crisp, space-fractal feel (not cloudy blobs)
- **Per-Agent Layers**: Each agent (AUREA, HERMES, EVE, JADE, ATLAS, ECHO) has its own:
  - Color palette (gold, cyan, magenta, green, blue, ember)
  - Visual response to telemetry
  - Independent animation phase

### 📊 Telemetry Integration
Visual mapping of agent metrics:
- **GI Score** → Scale (higher GI = larger visualization)
- **Error Rate** → Twist (more errors = more chaotic geometry)
- **Throughput** → Tension (rose ↔ torus blend)
- **Audio Bands** → Modulate geometry parameters in real-time

## Usage

### Access
- Grid View: `http://localhost:3010/`
- Sacred View: `http://localhost:3010/sacred`
- Toggle between views using the button in the top-right corner

### Controls
Located in the top-left control panel:
- **🎤 Mic**: Switch to microphone input
- **📁 File**: Upload and play an audio file
- **Preset Dropdown**: Select geometry pattern (Rose, Torus Knot, Flower of Life, Lissajous)
- **✨ Bloom**: Toggle glow effect on/off

## Architecture

### Components
- `SacredViz.tsx`: Main visualization component with Three.js shader rendering
- `PulseToggle.tsx`: Toggle component for switching between views
- `MultiAgentGrid.tsx`: Original grid-based visualization

### API
- `/api/agents/telemetry`: Provides agent telemetry data
  - Returns: `{ agent: string, gi: number, throughput: number, errorRate: number }[]`
  - Currently uses mock data (sine wave variations)
  - Ready to wire to live telemetry sources

### Technical Details
- **60,000 particles** per agent layer
- **2048-point FFT** for audio analysis
- **Custom GLSL shaders** for geometry generation
- **Additive blending** for crisp visuals
- **Real-time updates** at 60fps

## Wiring Live Telemetry

Replace the mock API endpoint with your live source:

```typescript
// apps/integrity-pulse/src/app/api/agents/telemetry/route.ts
export async function GET() {
  // Replace with your telemetry source
  const data = await fetchTelemetryFromLab6Proof();
  return NextResponse.json(data);
}
```

For WebSocket integration, modify `SacredViz.tsx` to subscribe to your WebSocket stream instead of polling.

## Performance

- Optimized for 60fps on modern GPUs
- Particle count can be reduced by modifying `COUNT` constant
- Audio analysis runs efficiently in real-time
- Memory cleanup handled automatically on unmount

## Future Enhancements

- [ ] Post-processing pipeline for true bloom (requires EffectComposer)
- [ ] Per-agent geometry preset selection
- [ ] Particle count slider in UI
- [ ] Recording/export functionality
- [ ] Multiple camera angles/presets
- [ ] Color palette customization per agent

## Credits

Built for Kaizen OS Integrity Pulse Dashboard
Inspired by Windows Media Player visualizations and sacred geometry patterns
