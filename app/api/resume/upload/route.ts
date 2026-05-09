import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { verifyToken } from '@/lib/firebase-admin';
import pdfParse from 'pdf-parse';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function parseAiJson(raw: string): object | null {
  // Strip reasoning model think blocks
  let text = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  // Strip markdown code fences
  text = text.replace(/```(?:json)?\n?/g, '').replace(/```/g, '').trim();
  // Extract the first JSON object
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

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

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfData = await pdfParse(buffer);
    const resumeText = pdfData.text;

    const extractionPrompt = `Extract the following information from this resume and return it as valid JSON with these exact keys:
- name: full name of the person (string)
- skills: list of technical/professional skills (array of strings)
- experience: list of job titles and companies (array of strings like "Software Engineer at Google")
- targetRoles: array of job roles this person is qualified for

Resume text:
${resumeText.substring(0, 3000)}

Return ONLY valid JSON object. No markdown, no explanation.`;

    const MODELS = [
      'google/gemma-3-12b-it:free',
      'meta-llama/llama-3.2-3b-instruct:free',
      'mistralai/mistral-7b-instruct:free',
    ];

    type Choice = { message?: { content?: string; reasoning?: string } };
    let resumeData: any = null;

    for (const model of MODELS) {
      const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
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
            { role: 'system', content: 'You are a resume parsing assistant. Always respond with valid JSON only. No explanations.' },
            { role: 'user', content: extractionPrompt },
          ],
          temperature: 0.2,
          max_tokens: 1200,
        }),
      });

      if (!aiResponse.ok) {
        console.warn(`[Resume Upload] Model ${model} returned ${aiResponse.status}, trying next…`);
        continue;
      }

      const aiJson = await aiResponse.json() as { choices?: Choice[] };
      const msg = aiJson.choices?.[0]?.message;
      const raw = (msg?.content?.trim() || msg?.reasoning?.trim()) ?? '';

      if (!raw) {
        console.warn(`[Resume Upload] Model ${model} returned empty content, trying next…`);
        continue;
      }

      resumeData = parseAiJson(raw);
      if (resumeData) {
        console.log(`[Resume Upload] AI parsed name: ${resumeData.name} (model: ${model})`);
        break;
      }
      console.warn(`[Resume Upload] Model ${model} failed JSON parse. Raw:`, raw.slice(0, 200));
    }

    // Fallback: extract name from first non-empty short line of PDF text
    if (!resumeData || !resumeData.name || resumeData.name === 'Unknown') {
      const nameGuess = resumeText.split('\n')
        .map(l => l.trim())
        .find(l => l.length > 2 && l.length < 60 && /^[A-Za-z][A-Za-z\s.'-]+$/.test(l));
      if (!resumeData) {
        resumeData = { name: nameGuess || 'My Resume', skills: [], experience: [], targetRoles: [] };
      } else {
        resumeData.name = nameGuess || 'My Resume';
      }
    }

    await connectDB();

    const user = await User.findOneAndUpdate(
      { uid: decodedToken.uid },
      {
        $set: {
          resume: {
            name: resumeData.name || 'My Resume',
            skills: Array.isArray(resumeData.skills) ? resumeData.skills : [],
            experience: Array.isArray(resumeData.experience) ? resumeData.experience : [],
            targetRoles: Array.isArray(resumeData.targetRoles) ? resumeData.targetRoles : [],
            rawText: resumeText.substring(0, 2000),
          },
        },
      },
      { new: true }
    );

    return NextResponse.json({ success: true, resume: user?.resume });
  } catch (error: any) {
    console.error('Resume upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
