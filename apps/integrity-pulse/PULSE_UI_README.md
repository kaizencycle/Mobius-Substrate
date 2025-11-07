# Integrity Pulse — Sacred Geometry UI

Two renderers:
- **SVG** (lightweight, themable)
- **WebGL/Three.js** (fractal spheres + bloom)

## Install
npm i three @react-three/fiber @react-three/drei @react-three/postprocessing

## Env
NEXT_PUBLIC_PULSE_API=https://your-api/pulse

## Files
- components/IntegrityPulseSVG.tsx
- components/SacredPulse3D.tsx
- components/RenderModeToggle.tsx
- hooks/usePulseFeed.ts
- lib/pulseMetrics.ts
- app/pulse-demo/page.tsx
- styles/pulseTheme.ts

## Usage

Access the demo at `/pulse-demo` route in the Next.js app.

The component supports two rendering modes:
- **SVG Mode**: Lightweight SVG-based sacred geometry visualization
- **3D Mode**: WebGL/Three.js fractal sphere visualization with bloom effects

Both modes use the `usePulseFeed` hook to fetch real-time GI metrics from the API endpoint configured via `NEXT_PUBLIC_PULSE_API`.

