import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const token = form.get('token') as string | null;
    const audio = form.get('audio') as Blob | null;

    if (!token || !audio) {
      return NextResponse.json({ error: 'Missing token or audio' }, { status: 400 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ error: 'OPENROUTER_API_KEY not configured' }, { status: 500 });
    }

    // Convert the WAV blob to base64
    const arrayBuffer = await audio.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');

    // Gemini supports: wav, mp3, aiff, aac, ogg, flac — we send WAV
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
        'X-Title': 'AI Interview Copilot',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Transcribe the spoken words in this audio exactly as heard. Output ONLY the transcribed words — no labels, punctuation fixes, or explanations. If there is no speech, output an empty string.',
              },
              {
                type: 'input_audio',
                input_audio: {
                  data: base64Audio,
                  format: 'wav',
                },
              },
            ],
          },
        ],
        temperature: 0,
        max_tokens: 512,
      }),
    });

    const rawBody = await response.text();

    if (!response.ok) {
      console.error('[Transcribe] OpenRouter error', response.status, rawBody);
      return NextResponse.json(
        { error: 'Transcription failed', detail: rawBody },
        { status: 502 }
      );
    }

    let data: { choices?: { message?: { content?: string } }[] };
    try {
      data = JSON.parse(rawBody);
    } catch {
      console.error('[Transcribe] Non-JSON response:', rawBody);
      return NextResponse.json({ error: 'Invalid response from model' }, { status: 502 });
    }

    const transcript = data.choices?.[0]?.message?.content?.trim() ?? '';
    return NextResponse.json({ transcript });
  } catch (err: any) {
    console.error('[Transcribe] Unexpected error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
