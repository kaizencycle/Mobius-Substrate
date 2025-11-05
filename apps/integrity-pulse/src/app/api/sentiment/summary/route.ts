import { NextResponse } from 'next/server';

const LEDGER_URL = process.env.CIVIC_LEDGER_URL || 'http://localhost:3000';

export async function GET() {
  try {
    const response = await fetch(`${LEDGER_URL}/sentiment/summary`, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 5 }, // Cache for 5 seconds
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch sentiment' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching sentiment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
