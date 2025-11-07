import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { IcosahedronGeometry, InstancedMesh, Object3D, Color } from 'three';

export function FractalSpheres({ gi = 0.98, eventsPerMin = 1 }: { gi?: number; eventsPerMin?: number }) {
  const mesh = useRef<InstancedMesh>(null!);
  const temp = new Object3D();
  const N = 450;
  const color = new Color().setHSL(0.33 + 0.1 * gi, 0.9, 0.55);
  const geo = useMemo(() => new IcosahedronGeometry(1, 2), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    for (let i = 0; i < N; i++) {
      const phi = (i / N) * Math.PI * 2;
      const r = 6 + 2 * Math.sin(t * 0.8 + i * 0.15);
      temp.position.set(Math.cos(phi) * r, Math.sin(phi * 3.0 + t * 0.6) * 0.8, Math.sin(phi) * r);
      const s = 0.12 + 0.1 * Math.sin(t * 1.2 + i * 0.07 + eventsPerMin * 0.3);
      temp.scale.setScalar(s);
      temp.lookAt(0, 0, 0);
      temp.updateMatrix();
      // @ts-ignore
      mesh.current.setMatrixAt(i, temp.matrix);
      // @ts-ignore
      mesh.current.setColorAt?.(i, color);
    }
    // @ts-ignore
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  // @ts-ignore material typed at runtime
  return <instancedMesh ref={mesh} args={[geo, undefined, N]} />;
}

export default function SacredPulse3D({ gi, eventsPerMin }: { gi: number; eventsPerMin: number }) {
  return (
    <Canvas camera={{ position: [0, 0, 18], fov: 55 }}>
      {/* @ts-ignore */}
      <color attach="background" args={['#0b1d12']} />
      <ambientLight intensity={0.7} />
      <pointLight position={[0, 0, 0]} intensity={2} color={'white'} />
      <FractalSpheres gi={gi} eventsPerMin={eventsPerMin} />
      <EffectComposer>
        <Bloom intensity={1.2} luminanceThreshold={0.2} luminanceSmoothing={0.4} />
      </EffectComposer>
    </Canvas>
  );
}

