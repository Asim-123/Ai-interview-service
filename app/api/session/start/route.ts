import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { InterviewSession } from '@/models/InterviewSession';
import { verifyToken } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const { jobRole, platform, type } = await req.json();

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

    // Create new session
    const session = await InterviewSession.create({
      userId: decodedToken.uid,
      type: type || 'live',
      jobRole,
      platform: platform || 'other',
      questions: [],
      startTime: new Date(),
      status: 'active',
      resumeUsed: false,
    });

    return NextResponse.json({
      sessionId: session._id.toString(),
      startTime: session.startTime,
    });
  } catch (error: any) {
    console.error('Session start error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
