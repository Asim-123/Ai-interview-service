import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { InterviewSession } from '@/models/InterviewSession';
import { verifyToken } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
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

    const sessions = await InterviewSession.find({ userId: decodedToken.uid })
      .sort({ startTime: -1 })
      .limit(50);

    return NextResponse.json(sessions);
  } catch (error: any) {
    console.error('Reports fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
