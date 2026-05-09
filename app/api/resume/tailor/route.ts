import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { resume, jobDescription } = await req.json() as {
      resume?: { name: string; skills: string[]; experience: string[]; targetRoles: string[]; rawText: string };
      jobDescription?: string;
    };

    if (!resume || !jobDescription?.trim()) {
      return NextResponse.json({ error: 'Resume and job description are required' }, { status: 400 });
    }

    const prompt = `You are an expert resume writer. Tailor the following resume to the provided job description.
Keep ALL sections present. Only update wording, reorder skills, and strengthen bullet points to better match the JD.
Do NOT fabricate experience. Do NOT remove real experience.

Return a JSON object with exactly this shape:
{
  "name": "string",
  "targetRoles": ["string"],
  "skills": ["string"],
  "experience": ["string"],
  "summary": "string",
  "changes": ["short description of each change made"]
}

RESUME:
Name: ${resume.name}
Target Roles: ${resume.targetRoles.join(', ')}
Skills: ${resume.skills.join(', ')}
Experience:
${resume.experience.map((e, i) => `${i + 1}. ${e}`).join('\n')}

JOB DESCRIPTION:
${jobDescription.trim()}

Return ONLY the JSON. No explanation before or after.`;

    // Use a list of models to try in order — prefer instruction-following models that reliably output JSON
    const MODELS = [
      'google/gemma-3-12b-it:free',
      'meta-llama/llama-3.2-3b-instruct:free',
      'mistralai/mistral-7b-instruct:free',
    ];

    type Choice = { message?: { content?: string; reasoning?: string } };
    let raw = '';

    for (const model of MODELS) {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
          'X-Title': 'AI Interview Copilot',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: 'You are an expert resume writer. Always respond with valid JSON only. No explanations.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.3,
          max_tokens: 1500,
        }),
      });

      if (!response.ok) {
        console.warn(`[Tailor] Model ${model} returned ${response.status}, trying next…`);
        continue;
      }

      const data = await response.json() as { choices?: Choice[] };
      const msg = data.choices?.[0]?.message;
      // Some reasoning models put output in `reasoning` when `content` is empty
      raw = (msg?.content?.trim() || msg?.reasoning?.trim()) ?? '';

      if (raw) {
        console.log(`[Tailor] Got response from model: ${model}`);
        break;
      }
      console.warn(`[Tailor] Model ${model} returned empty content, trying next…`);
    }

    if (!raw) {
      return NextResponse.json({ error: 'All AI models returned empty responses. Please try again.' }, { status: 502 });
    }

    // Strip reasoning think blocks and markdown fences, then extract JSON object
    let jsonStr = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    jsonStr = jsonStr.replace(/```(?:json)?\n?/g, '').replace(/```/g, '').trim();
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) jsonStr = jsonMatch[0];

    let tailored: object;
    try {
      tailored = JSON.parse(jsonStr);
    } catch {
      console.error('[Tailor] Failed to parse JSON:', jsonStr.slice(0, 300));
      return NextResponse.json({ error: 'Failed to parse AI response. Please try again.' }, { status: 502 });
    }

    return NextResponse.json({ tailored });
  } catch (err: any) {
    console.error('[Tailor] Unexpected error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
