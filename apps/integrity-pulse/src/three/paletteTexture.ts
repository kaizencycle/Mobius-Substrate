import * as THREE from 'three';

export function makePaletteTexture(hexes: string[]) {
  const N = Math.max(2, hexes.length);
  const data = new Uint8Array(N * 4);
  const cols = hexes.map(h => new THREE.Color(h));

  for (let i = 0; i < N; i++) {
    const c = cols[Math.min(i, cols.length - 1)];
    data[4 * i + 0] = Math.round(c.r * 255);
    data[4 * i + 1] = Math.round(c.g * 255);
    data[4 * i + 2] = Math.round(c.b * 255);
    data[4 * i + 3] = 255;
  }

  const tex = new THREE.DataTexture(data, N, 1, THREE.RGBAFormat);
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearFilter;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.needsUpdate = true;
  return tex;
}
