import mongoose from 'mongoose';
import { connectToDatabase } from '@/app/lib/mongo';

type ReadyState = 0 | 1 | 2 | 3 | 99;

const mapReadyState = (state: ReadyState) => {
  switch (state) {
    case 1:
      return 'connected';
    case 2:
      return 'connecting';
    case 0:
      return 'disconnected';
    case 3:
      return 'disconnecting';
    default:
      return 'unknown';
  }
};

export type HealthStatus = {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  uptime: number;
  services: {
    database: {
      status: string;
      latencyMs: number;
      error?: string;
    };
  };
  env: {
    nodeEnv: string | null;
    vercelEnv: string | null;
    region: string | null;
  };
};

export async function getHealthStatus(): Promise<HealthStatus> {
  const startedAt = Date.now();
  let dbStatus: string = 'unknown';
  let dbError: string | undefined;

  try {
    await connectToDatabase();
    dbStatus = mapReadyState(mongoose.connection.readyState as ReadyState);
  } catch (error) {
    dbStatus = 'error';
    dbError = error instanceof Error ? error.message : 'Unknown database error';
  }

  const latencyMs = Date.now() - startedAt;
  const overallStatus: HealthStatus['status'] =
    dbStatus === 'connected' ? 'ok' : dbStatus === 'connecting' ? 'degraded' : 'error';

  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: {
        status: dbStatus,
        latencyMs,
        ...(dbError ? { error: dbError } : {}),
      },
    },
    env: {
      nodeEnv: process.env.NODE_ENV || null,
      vercelEnv: process.env.VERCEL_ENV || null,
      region: process.env.VERCEL_REGION || null,
    },
  };
}
