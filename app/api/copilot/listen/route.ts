import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/firebase-admin';
import { registerConnection, unregisterConnection } from '@/lib/sse-connections';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) return new Response('Unauthorized', { status: 401 });

    const decodedToken = await verifyToken(token);
    if (!decodedToken) return new Response('Invalid token', { status: 401 });

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      start(controller) {
        registerConnection(decodedToken.uid, controller);

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`));

        const heartbeat = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(`: heartbeat\n\n`));
          } catch {
            clearInterval(heartbeat);
            unregisterConnection(decodedToken.uid);
          }
        }, 15000);

        req.signal.addEventListener('abort', () => {
          clearInterval(heartbeat);
          unregisterConnection(decodedToken.uid);
          try { controller.close(); } catch { /* already closed */ }
        });
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Listen error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
