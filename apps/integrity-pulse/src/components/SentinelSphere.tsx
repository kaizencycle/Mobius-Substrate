'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SentinelSphereProps {
  agentId: string;
  position: [number, number, number];
  color: number;
  gi: number;        // Global Integrity (0.95-1.0)
  eventRate: number; // Events per second
  particleCount?: number;
  radius?: number;
}

const waveVertexShader = `
  uniform float uTime;
  uniform float uAmp;
  uniform float uFreq;
  uniform float uPhase;
  attribute float aScale;
  varying vec3 vColor;

  void main() {
    vec3 p = position;

    // Radial wave displacement
    float r = length(p);
    float wave = sin(uFreq * r * 6.2831 + uTime + uPhase) * uAmp;

    // Displace outward by wave + particle scale noise
    p += normalize(p) * (wave + aScale * 0.02);

    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = (aScale * 6.0) * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const glowFragmentShader = `
  precision highp float;
  uniform vec3 uColor;
  uniform float uIntensity;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = dot(uv, uv);
    float alpha = smoothstep(0.25, 0.0, d) * uIntensity;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

export function SentinelSphere({
  agentId,
  position,
  color,
  gi,
  eventRate,
  particleCount = 8000,
  radius = 1.4
}: SentinelSphereProps) {
  const meshRef = useRef<THREE.Points>(null);

  // Generate particle positions using golden angle sphere distribution
  const { positions, scales } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < particleCount; i++) {
      const y = 1 - (i / (particleCount - 1)) * 2; // -1 to 1
      const r = Math.sqrt(1 - y * y);
      const theta = goldenAngle * i;
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;

      positions[i * 3 + 0] = x * radius;
      positions[i * 3 + 1] = y * radius;
      positions[i * 3 + 2] = z * radius;

      scales[i] = 0.7 + Math.random() * 0.6; // Size variation
    }

    return { positions, scales };
  }, [particleCount, radius]);

  // Shader uniforms
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uAmp: { value: 0.2 },
    uFreq: { value: 1.0 },
    uPhase: { value: Math.random() * Math.PI * 2 },
    uColor: { value: new THREE.Color(color) },
    uIntensity: { value: 1.0 }
  }), [color]);

  // Update wave parameters based on GI and event rate
  useFrame((state) => {
    if (!meshRef.current) return;

    const material = meshRef.current.material as THREE.ShaderMaterial;
    const elapsed = state.clock.getElapsedTime();

    // Update time
    material.uniforms.uTime.value = elapsed;

    // Map GI to amplitude (lower GI = more chaotic)
    // GI range: 0.95-1.0 → amp range: 0.28-0.12
    const giNormalized = (gi - 0.95) / 0.05; // 0-1
    material.uniforms.uAmp.value = THREE.MathUtils.lerp(0.28, 0.12, giNormalized);

    // Map event rate to frequency (more events = faster wave)
    // eventRate range: 0-20 → freq range: 0.6-2.2
    material.uniforms.uFreq.value = THREE.MathUtils.clamp(0.6 + eventRate * 0.08, 0.6, 2.2);

    // Pulse intensity based on GI health
    const intensity = gi >= 0.99 ? 1.2 : gi >= 0.97 ? 1.0 : 0.8;
    material.uniforms.uIntensity.value = THREE.MathUtils.lerp(
      material.uniforms.uIntensity.value,
      intensity,
      0.05
    );
  });

  return (
    <points ref={meshRef} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aScale"
          count={particleCount}
          array={scales}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={waveVertexShader}
        fragmentShader={glowFragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Metadata for tooltip/labels
export const SENTINEL_CONFIG = [
  { id: 'AUREA',  color: 0xffa94d, name: 'AUREA', role: 'Systems Architecture' },
  { id: 'ZEUS',   color: 0x6ae6ff, name: 'ZEUS', role: 'Governance Meta-Anchor' },
  { id: 'HERMES', color: 0x8cff6a, name: 'HERMES', role: 'Economic Design' },
  { id: 'EVE',    color: 0xff6ad5, name: 'EVE', role: 'Ethics & Civility' },
  { id: 'JADE',   color: 0xb48cff, name: 'JADE', role: 'Narrative & Culture' },
  { id: 'ATLAS',  color: 0xffff6a, name: 'ATLAS', role: 'Operations' },
  { id: 'ECHO',   color: 0x6affb7, name: 'ECHO', role: 'Ledger Synchronization' },
] as const;
