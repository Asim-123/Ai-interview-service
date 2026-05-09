import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/firebase-admin';
import { connectDB } from '@/lib/mongodb';
import { isInterviewQuestion } from '@/lib/question-detector';
import { pushToConnection } from '@/lib/sse-connections';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, source, platform, userToken, eventType } = body;

    const decodedToken = await verifyToken(userToken);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // ── Meeting lifecycle event ─────────────────────────────────────────────
    if (eventType === 'meeting_start') {
      pushToConnection(decodedToken.uid, {
        type: 'meeting_detected',
        platform: platform ?? 'other',
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({ success: true });
    }

    // ── Question ingest ─────────────────────────────────────────────────────
    await connectDB();

    const detection = isInterviewQuestion(question ?? '');
    if (!detection.isQuestion) {
      return NextResponse.json(
        { error: 'Not detected as a question', detection },
        { status: 400 }
      );
    }

    pushToConnection(decodedToken.uid, {
      type: 'question',
      data: {
        question,
        source,
        platform,
        confidence: detection.confidence,
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      confidence: detection.confidence,
      reason: detection.reason,
    });
  } catch (error: any) {
    console.error('Ingest error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
