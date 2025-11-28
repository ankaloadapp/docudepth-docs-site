import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

/**
 * On-demand cache revalidation API
 *
 * Usage:
 * POST /api/revalidate
 * Body: { "generationId": "abc123", "secret": "YOUR_SECRET" }
 *
 * This endpoint allows the docudepth backend to invalidate cached documentation
 * immediately after regeneration, instead of waiting for ISR to expire.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { generationId, secret } = body;

    // Validate secret token
    const expectedSecret = process.env.REVALIDATION_SECRET;
    if (!expectedSecret) {
      console.error(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'error',
        message: 'REVALIDATION_SECRET not configured',
      }));
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (secret !== expectedSecret) {
      console.warn(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'warn',
        message: 'Invalid revalidation secret',
        context: { generationId },
      }));
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    if (!generationId || typeof generationId !== 'string') {
      return NextResponse.json(
        { error: 'generationId is required' },
        { status: 400 }
      );
    }

    // Invalidate cache for this generation
    revalidateTag(`docs-${generationId}`);

    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'Cache revalidated',
      context: { generationId },
    }));

    return NextResponse.json({
      revalidated: true,
      generationId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'error',
      message: 'Revalidation failed',
      context: {
        error: error instanceof Error ? error.message : String(error),
      },
    }));

    return NextResponse.json(
      { error: 'Revalidation failed' },
      { status: 500 }
    );
  }
}

// Health check for the revalidation endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/revalidate',
    method: 'POST',
    requiredBody: {
      generationId: 'string',
      secret: 'string',
    },
  });
}
