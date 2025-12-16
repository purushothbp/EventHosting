import { NextResponse } from 'next/server';
import { getHealthStatus } from '@/lib/health';

export const dynamic = 'force-dynamic';

export async function GET() {
  const payload = await getHealthStatus();
  return NextResponse.json(payload, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
