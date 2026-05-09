import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { verifyToken } from '@/lib/firebase-admin';
import pdfParse from 'pdf-parse';
import { streamOpenRouterResponse } from '@/lib/openrouter';

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

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Parse PDF
    const pdfData = await pdfParse(buffer);
    const resumeText = pdfData.text;

    // Extract structured data using AI
    const extractionPrompt = `Extract the following information from this resume and return it as valid JSON with these exact keys: name, skills (array of strings), experience (array of strings, each being a job title/company), targetRoles (array of potential job roles this person is qualified for).

Resume:
${resumeText}

Return ONLY valid JSON, no markdown formatting.`;

    let extractedData = '';

    await new Promise<void>((resolve, reject) => {
      streamOpenRouterResponse(
        {
          messages: [
            { role: 'system', content: 'You are a resume parsing assistant. Return only valid JSON.' },
            { role: 'user', content: extractionPrompt },
          ],
          temperature: 0.3,
          max_tokens: 1000,
        },
        (chunk) => {
          extractedData += chunk;
        },
        () => resolve(),
        (error) => reject(error)
      );
    });

    // Parse JSON response
    let resumeData;
    try {
      // Remove markdown code blocks if present
      const cleanedData = extractedData.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      resumeData = JSON.parse(cleanedData);
    } catch (err) {
      console.error('Failed to parse AI response:', extractedData);
      // Fallback to basic extraction
      resumeData = {
        name: 'Unknown',
        skills: [],
        experience: [],
        targetRoles: [],
      };
    }

    await connectDB();

    // Update user with resume data
    const user = await User.findOneAndUpdate(
      { uid: decodedToken.uid },
      {
        $set: {
          resume: {
            name: resumeData.name || 'Unknown',
            skills: resumeData.skills || [],
            experience: resumeData.experience || [],
            targetRoles: resumeData.targetRoles || [],
            rawText: resumeText.substring(0, 2000), // Store first 2000 chars
          },
        },
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      resume: user?.resume,
    });
  } catch (error: any) {
    console.error('Resume upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
