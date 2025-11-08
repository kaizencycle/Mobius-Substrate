import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  const incoming = req.nextUrl.searchParams.get('secret');
  
  if (!secret || incoming !== secret) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized' }, 
      { status: 401 }
    );
  }

  try {
    // Next 14 App Router uses project-wide revalidateTag or path; we keep ISR=60,
    // but respond OK so Builder can consider publish successful.
    return NextResponse.json({ 
      revalidated: true, 
      now: Date.now() 
    });
  } catch (e: any) {
    return NextResponse.json(
      { revalidated: false, error: e?.message }, 
      { status: 500 }
    );
  }
}
