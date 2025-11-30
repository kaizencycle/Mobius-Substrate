import { NextRequest, NextResponse } from 'next/server';
import { commitName } from '@/lib/ledger';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const out = await commitName(body?.reservation_id, body?.did, body?.content_root);
    return NextResponse.json(out, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 400 });
  }
}

