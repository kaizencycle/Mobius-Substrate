# Kaizen UI Kit

Shared React components and design system for Kaizen OS.

## Design System (Kaizen UI v0.1)

This package contains design tokens, component guidelines, and assets for the AI-native Kaizen OS.

### Design Tokens

- `tokens.json` — color, type, and motion tokens

### Components

- `AttestationSparkline` — Sparkline visualization for attestation data
- `EntropyWave` — Entropy waveform visualization
- `GIMeter` — Global Integrity meter component
- `KaizenButton` — Primary button component with variants (primary, ghost, danger)
- `GIBadge` — GI score badge component
- `IntegrityMeter` — Integrity meter component
- `ProofCard` — Proof card component
- `ServiceTable` — Service status table
- `StatusIndicator` — Status indicator component

### Usage

```tsx
import { KaizenButton, GIMeter, EntropyWave, AttestationSparkline } from '@civic/ui-kit';

function MyComponent() {
  return (
    <div>
      <GIMeter gi={0.987} />
      <EntropyWave entropy={0.15} />
      <AttestationSparkline points={[2,4,6,4,8,9,7,10,12,11]} />
      <KaizenButton variant="primary">Click me</KaizenButton>
    </div>
  );
}
```

### Design Assets

- Sacred Geometry SVGs: `assets/sg/` (fibonacci_spiral.svg, flower_of_life.svg, torus_field.svg)
- Figma Prompts: `docs/design/figma_prompts/`
- OpenAPI Specs: `docs/06-specifications/apis/`

### Related Documentation

- Design tokens: See `tokens.json`
- Figma prompts: See `docs/design/figma_prompts/`
- OpenAPI specs: See `docs/06-specifications/apis/`

