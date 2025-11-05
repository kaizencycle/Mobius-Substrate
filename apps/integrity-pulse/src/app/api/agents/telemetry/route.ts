import { NextResponse } from 'next/server';

type Telemetry = { 
  agent: string; 
  gi: number; 
  throughput: number; 
  errorRate: number; 
};

const AGENTS = ['AUREA','HERMES','EVE','JADE','ATLAS','ECHO'];

export async function GET() {
  // mock: gently vary values so the viz breathes
  const now = Date.now() / 1000;
  const data: Telemetry[] = AGENTS.map((id, i) => {
    const gi = 0.96 + 0.03 * (0.5 + 0.5 * Math.sin(now*0.1 + i));
    const throughput = 4 + 3 * (0.5 + 0.5 * Math.sin(now*0.35 + i*0.7));
    const errorRate = Math.max(0, 0.02 + 0.02 * Math.sin(now*0.27 + i*1.3));
    return { 
      agent: id, 
      gi: Number(gi.toFixed(3)), 
      throughput: Number(throughput.toFixed(2)), 
      errorRate: Number(errorRate.toFixed(3)) 
    };
  });
  
  return NextResponse.json(data);
}
