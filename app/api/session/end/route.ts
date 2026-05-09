import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { InterviewSession } from '@/models/InterviewSession';
import { verifyToken } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    // Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decodedToken = await verifyToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectDB();

    // End session
    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.userId !== decodedToken.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000);

    session.endTime = endTime;
    session.duration = duration;
    session.status = 'ended';
    await session.save();

    return NextResponse.json({
      success: true,
      endTime,
      duration,
      questionsCount: session.questions.length,
    });
  } catch (error: any) {
    console.error('Session end error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
