import { NextResponse } from 'next/server';

/**
 * GET /api/health
 *
 * Simple liveness probe for deployment validation.
 * Used by Vercel and monitoring tools.
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      service: 'voxdesk',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? '0.1.0',
    },
    { status: 200 }
  );
}
