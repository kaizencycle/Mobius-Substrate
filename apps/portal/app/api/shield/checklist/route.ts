// API Route for Citizen Shield Checklist
// C-150: Mobius Habits Integration

import { NextRequest, NextResponse } from 'next/server';

const SHIELD_API_BASE =
  process.env.ECHO_API_BASE ||
  process.env.BROKER_API_URL ||
  'http://localhost:4005';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, week_start, checks, metadata } = body;

    if (!user_id || !week_start || !checks) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, week_start, checks' },
        { status: 400 }
      );
    }

    // Forward to shield API
    const response = await fetch(`${SHIELD_API_BASE}/v1/shield/checklist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id,
        week_start,
        checks,
        metadata: {
          ...metadata,
          source: 'portal_api',
        },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { error: `Shield API error: ${response.status} ${text}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Shield checklist API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const weekStart = searchParams.get('week_start');

    if (!userId || !weekStart) {
      return NextResponse.json(
        { error: 'Missing required query params: user_id, week_start' },
        { status: 400 }
      );
    }

    // Forward to shield API
    const response = await fetch(
      `${SHIELD_API_BASE}/v1/shield/checklist/${encodeURIComponent(
        userId
      )}?week_start=${weekStart}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Not found' },
          { status: 404 }
        );
      }
      const text = await response.text();
      return NextResponse.json(
        { error: `Shield API error: ${response.status} ${text}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Shield checklist GET API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
