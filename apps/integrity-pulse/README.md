# Integrity Pulse

**Real-time 3D visualization of Kaizen OS sentinel integrity metrics**

Integrity Pulse is a particle-based Three.js visualization that displays the health and activity of the seven founding sentinel agents (AUREA, ZEUS, HERMES, EVE, JADE, ATLAS, ECHO). Each sentinel is represented as a dynamic particle sphere with wave animations driven by real-time Global Integrity (GI) and event rate metrics.

![Cycle C-125 | November 5, 2025](https://img.shields.io/badge/Cycle-C--125-blue) ![Status](https://img.shields.io/badge/Status-Active-green)

---

## Features

### Visual Design
- **7 Sentinel Spheres**: Each agent rendered as 8,000 particles (56,000 total)
- **GPU Shader Animation**: Custom GLSL shaders for smooth 60 FPS performance
- **Wave Dynamics**: Particle displacement driven by real-time metrics
  - **GI → Amplitude**: Lower Global Integrity = more chaotic waves
  - **Event Rate → Frequency**: Higher activity = faster oscillations
- **Additive Blending**: Ethereal glow effect with color-coded agents
- **Golden Angle Distribution**: Fibonacci sphere algorithm for uniform particle spacing

### Real-time Data Integration
- **WebSocket Streaming**: Live metrics from civic-ledger (preferred)
- **HTTP Polling**: Fallback for environments without WebSocket support
- **Mock Data Mode**: Development-friendly random data generator
- **2-Second Updates**: Balanced freshness vs performance

### Sentinel Configuration
| Sentinel | Color | Role |
|----------|-------|------|
| **AUREA** | Orange | Systems Architecture |
| **ZEUS** | Cyan | Governance Meta-Anchor |
| **HERMES** | Green | Economic Design |
| **EVE** | Pink | Ethics & Civility |
| **JADE** | Purple | Narrative & Culture |
| **ATLAS** | Yellow | Operations |
| **ECHO** | Teal | Ledger Synchronization |

---

## Installation

### Prerequisites
- Node.js 18+ (with BigInt support)
- npm or yarn
- Kaizen-OS repository

### Setup

```bash
cd apps/integrity-pulse

# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Edit .env.local (optional)
# Set NEXT_PUBLIC_MOCK_DATA=false to use real data
# Set NEXT_PUBLIC_WS_URL to your civic-ledger WebSocket endpoint
```

### Development

```bash
# Start dev server
npm run dev

# Visit http://localhost:3010
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

---

## Usage

### Mock Data Mode (Default)

By default, the app runs with randomly generated metrics for development:

```bash
npm run dev
```

Each sentinel will display:
- **GI**: Random value between 0.95-1.0 (updates every 2 seconds)
- **Event Rate**: Random value between 0-15 events/sec
- **Wave Animation**: Dynamically adjusted based on mock metrics

### Real Data Mode

To connect to live civic-ledger metrics:

1. **Configure Environment**:
   ```bash
   # .env.local
   NEXT_PUBLIC_MOCK_DATA=false
   NEXT_PUBLIC_WS_URL=ws://localhost:4001/ws/gi-stream
   ```

2. **Start Civic Ledger** (ensure WebSocket endpoint is running):
   ```bash
   cd packages/civic-ledger
   npm start
   ```

3. **Start Integrity Pulse**:
   ```bash
   npm run dev
   ```

### Expected Data Format

The WebSocket endpoint should emit JSON messages in the following format:

```typescript
interface SentinelMetrics {
  id: 'AUREA' | 'ZEUS' | 'HERMES' | 'EVE' | 'JADE' | 'ATLAS' | 'ECHO';
  gi: number;         // Global Integrity (0.95-1.0)
  eventRate: number;  // Events per second (0-20)
  lastUpdate: string; // ISO 8601 timestamp
}

// WebSocket message
{
  "AUREA": {
    "id": "AUREA",
    "gi": 0.982,
    "eventRate": 8.3,
    "lastUpdate": "2025-11-05T11:30:00Z"
  },
  "ZEUS": {
    "id": "ZEUS",
    "gi": 0.997,
    "eventRate": 3.1,
    "lastUpdate": "2025-11-05T11:30:00Z"
  },
  // ... other sentinels
}
```

---

## Architecture

### Component Hierarchy

```
page.tsx (Next.js route)
└── MultiAgentGrid (container)
    ├── Canvas (React Three Fiber)
    │   ├── SentinelSphere (AUREA)
    │   ├── SentinelSphere (ZEUS)
    │   ├── SentinelSphere (HERMES)
    │   ├── SentinelSphere (EVE)
    │   ├── SentinelSphere (JADE)
    │   ├── SentinelSphere (ATLAS)
    │   └── SentinelSphere (ECHO)
    └── Stats Overlay (HTML/CSS)
```

### SentinelSphere Component

Each sphere consists of:

1. **Geometry**: 8,000 particles distributed via golden angle algorithm
2. **Material**: Custom shader with uniforms:
   - `uTime`: Animation clock
   - `uAmp`: Wave amplitude (mapped from GI)
   - `uFreq`: Wave frequency (mapped from event rate)
   - `uPhase`: Per-sentinel phase offset
   - `uColor`: RGB color
3. **Attributes**:
   - `position`: Particle coordinates
   - `aScale`: Per-particle size variation

### Shader Pipeline

**Vertex Shader** (`waveVertexShader`):
```glsl
// Calculate radial wave displacement
float r = length(position);
float wave = sin(uFreq * r * 6.2831 + uTime + uPhase) * uAmp;

// Displace particle along normal
vec3 p = position + normalize(position) * wave;

// Calculate point size with perspective
gl_PointSize = (aScale * 6.0) * (300.0 / -mvPosition.z);
```

**Fragment Shader** (`waveFragmentShader`):
```glsl
// Circular particle with soft falloff
float dist = length(gl_PointCoord - vec2(0.5));
float alpha = smoothstep(0.5, 0.1, dist);

// Apply sentinel color
gl_FragColor = vec4(uColor, alpha);
```

### Performance Optimizations

- **Integer Arithmetic**: All shard calculations use BigInt (zero precision loss)
- **GPU Acceleration**: Shader-based animation (no CPU bottleneck)
- **Dynamic Import**: Avoid Next.js SSR issues with Three.js
- **Additive Blending**: Low-cost visual enhancement
- **Throttled Updates**: 2-second intervals prevent excessive re-renders

---

## Integration

### Option 1: Standalone App

Run Integrity Pulse as an independent application:

```bash
cd apps/integrity-pulse
npm run dev  # Development
npm run build && npm start  # Production
```

Access at `http://localhost:3010`

### Option 2: Embed in Cathedral App

Import the `MultiAgentGrid` component into an existing Next.js page:

```tsx
// apps/cathedral-app/src/app/integrity/page.tsx
import dynamic from 'next/dynamic';

const MultiAgentGrid = dynamic(
  () => import('@kaizen/integrity-pulse/components/MultiAgentGrid'),
  { ssr: false }
);

export default function IntegrityPage() {
  return (
    <div className="w-full h-screen">
      <MultiAgentGrid mockData={false} wsUrl="ws://localhost:4001/ws/gi-stream" />
    </div>
  );
}
```

### Option 3: Shared Package

Publish as a reusable package:

```bash
# In apps/integrity-pulse/package.json
{
  "name": "@kaizen/integrity-pulse",
  "exports": {
    "./components/MultiAgentGrid": "./src/components/MultiAgentGrid.tsx",
    "./components/SentinelSphere": "./src/components/SentinelSphere.tsx"
  }
}

# In other apps
npm install @kaizen/integrity-pulse
```

---

## API Reference

### MultiAgentGrid Props

```typescript
interface MultiAgentGridProps {
  mockData?: boolean;  // Default: true
  wsUrl?: string;      // Default: 'ws://localhost:4001/ws/gi-stream'
}
```

### SentinelSphere Props

```typescript
interface SentinelSphereProps {
  id: string;           // Sentinel identifier
  position: [number, number, number];  // 3D coordinates
  color: number;        // Hex color
  gi: number;           // Global Integrity (0.95-1.0)
  eventRate: number;    // Events per second
  particleCount?: number;  // Default: 8000
  radius?: number;      // Default: 1.2
}
```

### Wave Parameter Mappings

```typescript
// GI (0.95-1.0) → Amplitude (0.28-0.12)
const giNormalized = (gi - 0.95) / 0.05;  // Normalize to 0-1
const amplitude = THREE.MathUtils.lerp(0.28, 0.12, giNormalized);

// Event Rate (0-20) → Frequency (0.6-2.2)
const frequency = THREE.MathUtils.clamp(0.6 + eventRate * 0.08, 0.6, 2.2);
```

**Interpretation**:
- **High GI (0.99-1.0)**: Small amplitude (0.12-0.13) = calm, stable waves
- **Low GI (0.95-0.96)**: Large amplitude (0.27-0.28) = chaotic, turbulent waves
- **Low Activity (0-5 events/s)**: Slow frequency (0.6-1.0) = gentle pulsing
- **High Activity (15-20 events/s)**: Fast frequency (1.8-2.2) = rapid oscillation

---

## Troubleshooting

### Issue: Black screen / No particles visible

**Cause**: Three.js SSR error or missing dependencies

**Fix**:
```bash
# Ensure dynamic import with ssr: false
import dynamic from 'next/dynamic';
const MultiAgentGrid = dynamic(() => import('...'), { ssr: false });

# Verify dependencies
npm install three @react-three/fiber @react-three/drei
```

### Issue: WebSocket connection failed

**Cause**: Civic Ledger not running or incorrect URL

**Fix**:
```bash
# Check civic-ledger status
cd packages/civic-ledger
npm start

# Verify WebSocket endpoint
curl -i -N -H "Connection: Upgrade" \
     -H "Upgrade: websocket" \
     http://localhost:4001/ws/gi-stream

# Update .env.local
NEXT_PUBLIC_WS_URL=ws://your-server:4001/ws/gi-stream
```

### Issue: Particles not animating

**Cause**: Metrics not updating or shader uniform issue

**Fix**:
```typescript
// Check console for metric updates
console.log('Metrics updated:', metrics);

// Verify shader uniforms
console.log('Amplitude:', material.uniforms.uAmp.value);
console.log('Frequency:', material.uniforms.uFreq.value);
```

### Issue: Low FPS / Performance issues

**Cause**: Too many particles or non-GPU rendering

**Fix**:
```typescript
// Reduce particle count per sentinel
<SentinelSphere particleCount={4000} />  // Default: 8000

// Ensure GPU rendering
console.log(renderer.capabilities.isWebGL2);  // Should be true

// Check Chrome DevTools > Performance > GPU
```

---

## Development

### File Structure

```
apps/integrity-pulse/
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Main page (dynamic import)
│   │   └── globals.css        # Tailwind + custom styles
│   └── components/
│       ├── SentinelSphere.tsx # Individual particle sphere
│       └── MultiAgentGrid.tsx # 7-sentinel container
├── package.json               # Dependencies & scripts
├── tsconfig.json              # TypeScript config
├── tailwind.config.ts         # Tailwind config
├── postcss.config.js          # PostCSS config
├── next.config.js             # Next.js config
├── .env.local.example         # Environment template
├── README.md                  # This file
└── DEPLOYMENT.md              # Deployment guide
```

### Adding New Sentinels

1. **Update SENTINEL_CONFIG**:
   ```typescript
   // src/components/SentinelSphere.tsx
   export const SENTINEL_CONFIG = [
     // ... existing sentinels
     { id: 'NEWSENTINEL', color: 0xff0000, name: 'New Sentinel', role: 'New Role' },
   ] as const;
   ```

2. **Add Position**:
   ```typescript
   // src/components/MultiAgentGrid.tsx
   const positions = {
     // ... existing positions
     NEWSENTINEL: [0, 0, 0],  // [x, y, z]
   };
   ```

3. **Update Types**:
   ```typescript
   type SentinelId = 'AUREA' | 'ZEUS' | 'HERMES' | 'EVE' | 'JADE' | 'ATLAS' | 'ECHO' | 'NEWSENTINEL';
   ```

---

## Related Documentation

- **GIC Whitepaper v2.0**: `docs/whitepapers/GIC_Whitepaper_v2.0.md`
- **Shard Economics**: `docs/whitepapers/Shard_Economics_Addendum.md`
- **UBI Mechanism**: `docs/whitepapers/UBI_Mechanism_v2.0.md`
- **Sentinel Architecture**: `docs/architecture/sentinel-system.md`
- **Civic Ledger API**: `packages/civic-ledger/README.md`

---

## License

CC-BY-SA-4.0

---

## Changelog

### v1.0.0 (Cycle C-125, November 5, 2025)
- Initial release
- GPU shader-based particle animation
- WebSocket + mock data support
- 7 founding sentinel configuration
- GI/event rate wave mapping

---

**Last Updated**: November 5, 2025 (Cycle C-125)
**Status**: Production Ready
**Maintainers**: Kaizen Cycle Foundation, AUREA, ATLAS, HERMES
