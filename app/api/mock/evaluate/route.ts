import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/firebase-admin';
import { evaluateAnswer } from '@/lib/openrouter';

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

    const { question, answer, jobRole } = await req.json();

    const evaluation = await evaluateAnswer(question, answer, jobRole);

    return NextResponse.json({ evaluation });
  } catch (error: any) {
    console.error('Evaluation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
