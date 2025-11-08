import { NextResponse } from 'next/server';

const PULSE = process.env.MOBIUS_PULSE_URL;
const PROM = process.env.PROM_URL;
const PROMQL = process.env.MII_PROMQL || 'avg_over_time(mii_value{env="prod"}[5m])';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const env = url.searchParams.get('env') || 'prod';

  try {
    // 1) Preferred: Mobius Pulse API
    if (PULSE) {
      const r = await fetch(PULSE, { 
        headers: { 'accept': 'application/json' },
        cache: 'no-store'
      });
      if (r.ok) {
        const j = await r.json();
        if (typeof j.mii === 'number') {
          return NextResponse.json({ 
            mii: j.mii, 
            env: j.env || env,
            source: 'pulse',
            updatedAt: new Date().toISOString()
          });
        }
      }
    }

    // 2) Fallback: Prometheus instant query
    if (PROM) {
      const queryUrl = `${PROM}/api/v1/query?query=${encodeURIComponent(PROMQL)}`;
      const r2 = await fetch(queryUrl, { cache: 'no-store' });
      if (r2.ok) {
        const j2 = await r2.json();
        const v = Number(j2?.data?.result?.[0]?.value?.[1]);
        if (Number.isFinite(v)) {
          return NextResponse.json({ 
            mii: v, 
            env,
            source: 'prometheus',
            updatedAt: new Date().toISOString()
          });
        }
      }
    }

    // 3) Dev fallback: mock value
    const mockMii = 0.990 + (Math.sin(Date.now() / 30000) + 1) * 0.004;
    return NextResponse.json({ 
      mii: mockMii, 
      env,
      source: 'mock',
      updatedAt: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json({ 
      mii: null, 
      env,
      error: err?.message || 'unknown',
      updatedAt: new Date().toISOString()
    }, { status: 200 });
  }
}
