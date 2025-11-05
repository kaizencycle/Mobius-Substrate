import * as THREE from 'three';

export interface GoldenFieldOpts {
  count: number;        // particles
  radius?: number;      // sphere radius
  seed?: number;        // deterministic phase offset
  baseSize?: number;    // point size in px
}

export function buildGoldenFieldGeometry({
  count,
  radius = 1.0,
  seed = 137,
  baseSize = 2.0,
}: GoldenFieldOpts) {
  // Fibonacci sphere distribution + phyllotaxis twist
  const positions = new Float32Array(count * 3);
  const sizes     = new Float32Array(count);
  const colorIdx  = new Float32Array(count); // 0..1 lookup into palette

  const phi = (1 + Math.sqrt(5)) / 2;
  const goldenAngle = 2 * Math.PI * (1 - 1 / phi);

  function pseudoRand(n: number) {
    return fract(Math.sin(n * 133.3) * 43758.5453);
  }
  function fract(x: number) { return x - Math.floor(x); }

  for (let i = 0; i < count; i++) {
    // Fibonacci sphere
    const t   = i / (count - 1);
    const y   = 1 - 2 * t;
    const r   = Math.sqrt(Math.max(0, 1 - y * y));
    const th  = (i + seed) * goldenAngle;

    const x = Math.cos(th) * r;
    const z = Math.sin(th) * r;

    positions[3 * i + 0] = x * radius;
    positions[3 * i + 1] = y * radius;
    positions[3 * i + 2] = z * radius;

    // base size + subtle variation
    sizes[i] = baseSize * (0.8 + 0.4 * pseudoRand(i + seed));
    // evenly spread across palette
    colorIdx[i] = (i % 1024) / 1023; // high-res grad
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geo.setAttribute('aColorIdx', new THREE.BufferAttribute(colorIdx, 1));
  return geo;
}
