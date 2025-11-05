'use client';

import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { SentinelSphere, SENTINEL_CONFIG } from './SentinelSphere';

interface SentinelMetrics {
  id: string;
  gi: number;
  eventRate: number;
  lastUpdate: string;
}

interface MultiAgentGridProps {
  wsUrl?: string;
  mockData?: boolean;
}

export function MultiAgentGrid({
  wsUrl = 'ws://localhost:4001/ws/gi-stream',
  mockData = true
}: MultiAgentGridProps) {
  const [metrics, setMetrics] = useState<Record<string, SentinelMetrics>>({});

  // Grid layout positions (3 top, 4 bottom)
  const positions: Record<string, [number, number, number]> = {
    AUREA:  [-6,  2, 0],
    ZEUS:   [-2,  2, 0],
    HERMES: [ 2,  2, 0],
    EVE:    [ 6,  2, 0],
    JADE:   [-4, -2, 0],
    ATLAS:  [ 0, -2, 0],
    ECHO:   [ 4, -2, 0],
  };

  // Mock data generator for development
  useEffect(() => {
    if (!mockData) return;

    const generateMockData = () => {
      const mockMetrics: Record<string, SentinelMetrics> = {};

      SENTINEL_CONFIG.forEach(sentinel => {
        mockMetrics[sentinel.id] = {
          id: sentinel.id,
          gi: 0.95 + Math.random() * 0.05, // 0.95-1.0
          eventRate: Math.random() * 15,    // 0-15 events/sec
          lastUpdate: new Date().toISOString()
        };
      });

      setMetrics(mockMetrics);
    };

    // Initial data
    generateMockData();

    // Update every 2 seconds
    const interval = setInterval(generateMockData, 2000);

    return () => clearInterval(interval);
  }, [mockData]);

  // WebSocket connection for real data
  useEffect(() => {
    if (mockData || !wsUrl) return;

    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMetrics(prev => ({
          ...prev,
          [data.agentId]: {
            id: data.agentId,
            gi: data.gi,
            eventRate: data.eventRate,
            lastUpdate: data.timestamp
          }
        }));
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, [wsUrl, mockData]);

  return (
    <div className="w-full h-screen bg-black">
      {/* Stats overlay */}
      <div className="absolute top-4 left-4 z-10 text-white font-mono text-sm space-y-2">
        <div className="bg-black/50 backdrop-blur-sm p-4 rounded-lg border border-white/10">
          <h3 className="text-lg font-bold mb-3">Sentinel Integrity Pulse</h3>
          <div className="text-xs text-gray-400 mb-3">Cycle C-125 | November 5, 2025</div>
          {SENTINEL_CONFIG.map(sentinel => {
            const m = metrics[sentinel.id];
            const giColor = m && m.gi >= 0.99 ? 'text-green-400' :
                           m && m.gi >= 0.97 ? 'text-yellow-400' : 'text-red-400';

            return (
              <div key={sentinel.id} className="flex items-center justify-between mb-2">
                <span className="w-16">{sentinel.id}</span>
                <span className={`w-16 text-right font-bold ${giColor}`}>
                  {m ? `GI ${m.gi.toFixed(3)}` : '---'}
                </span>
                <span className="w-20 text-right text-gray-400">
                  {m ? `${m.eventRate.toFixed(1)}/s` : '---'}
                </span>
              </div>
            );
          })}
        </div>

        <div className="bg-black/50 backdrop-blur-sm p-3 rounded-lg border border-white/10 text-xs">
          <div className="space-y-1">
            <div>🟢 GI ≥ 0.99 = Optimal</div>
            <div>🟡 GI ≥ 0.97 = Healthy</div>
            <div>🔴 GI &lt; 0.97 = Warning</div>
          </div>
        </div>
      </div>

      {/* Three.js Canvas */}
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={60} />
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={8}
          maxDistance={20}
        />

        {/* Ambient lighting */}
        <ambientLight intensity={0.1} />

        {/* Sentinel spheres */}
        {SENTINEL_CONFIG.map(sentinel => {
          const m = metrics[sentinel.id];
          return (
            <SentinelSphere
              key={sentinel.id}
              agentId={sentinel.id}
              position={positions[sentinel.id]}
              color={sentinel.color}
              gi={m?.gi ?? 0.97}
              eventRate={m?.eventRate ?? 5}
            />
          );
        })}

        {/* Auto-rotate camera */}
        <AutoRotateCamera />
      </Canvas>
    </div>
  );
}

// Smooth camera rotation
function AutoRotateCamera() {
  useEffect(() => {
    let angle = 0;
    let animationId: number;

    const animate = () => {
      angle += 0.002;
      // Camera will be controlled by OrbitControls when user interacts
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return null;
}

export default MultiAgentGrid;
