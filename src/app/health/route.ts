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

export async function HEAD() {
  const payload = await getHealthStatus();
  return new NextResponse(null, {
    status: payload.status === 'ok' ? 200 : payload.status === 'degraded' ? 503 : 500,
    headers: {
      'X-Service-Status': payload.status,
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
