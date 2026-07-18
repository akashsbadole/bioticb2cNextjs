import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as fs from 'fs';

async function checkDatabase(): Promise<{ status: string; latencyMs: number }> {
  const start = Date.now();
  try {
    await db.$queryRaw`SELECT 1`;
    return { status: 'ok', latencyMs: Date.now() - start };
  } catch {
    return { status: 'error', latencyMs: Date.now() - start };
  }
}

async function checkEmail(): Promise<{ status: string; configured: boolean }> {
  const smtpHost = process.env.SMTP_HOST;
  if (!smtpHost) {
    return { status: 'skipped', configured: false };
  }
  return { status: 'ok', configured: true };
}

function checkDiskSpace(): { status: string; freeMb?: number } {
  try {
    const stats = fs.statfsSync(process.cwd());
    const freeMb = Math.round((stats.bavail * stats.bsize) / (1024 * 1024));
    return { status: freeMb < 200 ? 'warn' : 'ok', freeMb };
  } catch {
    return { status: 'unknown' };
  }
}

export async function GET() {
  const database = await checkDatabase();
  const email = await checkEmail();
  const disk = checkDiskSpace();

  const allHealthy =
    database.status === 'ok' &&
    email.status !== 'error' &&
    disk.status !== 'warn';

  return NextResponse.json(
    {
      status: allHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      checks: {
        database,
        email,
        disk,
      },
    },
    { status: allHealthy ? 200 : 503 }
  );
}
