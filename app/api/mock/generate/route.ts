import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/firebase-admin';
import { generateMockQuestions } from '@/lib/openrouter';

export async function POST(req: NextRequest) {
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

    const { jobRole, level, count } = await req.json();

    const questions = await generateMockQuestions(
      jobRole || 'Software Engineer',
      level || 'Mid-level',
      count || 10
    );

    return NextResponse.json({ questions });
  } catch (error: any) {
    console.error('Mock generation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
