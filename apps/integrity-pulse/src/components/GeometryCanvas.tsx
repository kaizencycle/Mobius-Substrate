'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { buildGoldenFieldGeometry } from '../three/goldenField';
import { makePaletteTexture } from '../three/paletteTexture';

// Shader strings (inline for Next.js compatibility)
const vertShader = `
precision highp float;

attribute float aSize;
attribute float aColorIdx;

uniform float uTime;
uniform float uEnergy;     // 0..~1 mic energy
uniform float uSizePx;     // base point size in px
uniform float uRadius;     // sphere radius
uniform float uSeed;

varying float vColorIdx;
varying float vFade;

void main() {
  vec3 p = position;

  // golden-ratio breathing: swirl around local tangent using energy
  float sw = 0.35 + 1.25 * uEnergy;      // swirl strength
  float t  = uTime * (0.15 + 0.85*uEnergy);
  float phase = (aColorIdx * 6.28318) + uSeed;

  // rotate around normal-ish axes
  float cs = cos(t + phase);
  float sn = sin(t + phase);
  mat2 rot = mat2(cs, -sn, sn, cs);

  // split into two axes for mild "torus" wobble
  vec2 xz = rot * p.xz;
  p.x = xz.x;
  p.z = xz.y;

  // micro wobble along latitude
  p.y += sw * 0.02 * sin(12.9898 * phase + t);

  // slight inflate/deflate with energy
  p *= (1.0 + 0.05 * uEnergy);

  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // distance fade maintains density
  float dist = length(mvPosition.xyz);
  vFade = clamp(1.5 / dist, 0.0, 1.0);

  // screen-space size
  gl_PointSize = (uSizePx * aSize) * vFade;
  vColorIdx = aColorIdx;
}
`;

const fragShader = `
precision highp float;

uniform sampler2D uPalette;
uniform float uEnergy;

varying float vColorIdx;
varying float vFade;

void main() {
  // circular sprite mask
  vec2 uv = gl_PointCoord * 2.0 - 1.0;
  float r2 = dot(uv, uv);
  if (r2 > 1.0) discard;

  // soft edge
  float alpha = smoothstep(1.0, 0.4, r2);

  // palette sample (1D texture)
  vec3 col = texture2D(uPalette, vec2(vColorIdx, 0.0)).rgb;

  // bloom-ready brightness with energy breathing
  float glow = 0.6 + 0.8 * uEnergy;
  vec3 color = col * glow;

  gl_FragColor = vec4(color, alpha * vFade);
}
`;

type Props = {
  palette: string[];
  count: number;
  seed: number;
  baseSize?: number;
  energyRef: React.MutableRefObject<number>;
};

export default function GeometryCanvas({ palette, count, seed, baseSize = 2, energyRef }: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0b0f1a');

    const camera = new THREE.PerspectiveCamera(55, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 3.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const geo = buildGoldenFieldGeometry({
      count,
      radius: 1.2,
      seed,
      baseSize,
    });

    const paletteTex = makePaletteTexture(palette);
    const uniforms = {
      uTime:   { value: 0.0 },
      uEnergy: { value: 0.0 },
      uSizePx: { value: 2.2 },
      uRadius: { value: 1.2 },
      uSeed:   { value: seed },
      uPalette:{ value: paletteTex },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: vertShader,
      fragmentShader: fragShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geo, material);
    scene.add(points);

    // simple camera orbit
    let t = 0;
    let raf = 0;
    const clock = new THREE.Clock();

    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    const loop = () => {
      t += clock.getDelta();
      uniforms.uTime.value = t;
      uniforms.uEnergy.value = energyRef.current; // from mic hook
      // slow orbit
      camera.position.x = Math.cos(t * 0.15) * 3.5;
      camera.position.z = Math.sin(t * 0.15) * 3.5;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      geo.dispose();
      paletteTex.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [palette, count, seed, baseSize, energyRef]);

  return <div ref={mountRef} className="w-full h-full" />;
}
