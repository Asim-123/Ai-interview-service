import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { InterviewSession } from '@/models/InterviewSession';
import { verifyToken } from '@/lib/firebase-admin';
import { streamOpenRouterResponse, buildCopilotPrompt } from '@/lib/openrouter';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { question, resumeContext, jobRole, answerStyle, sessionId, source, platform, confidence } = await req.json();

    // Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response('Unauthorized', { status: 401 });
    }

    const token = authHeader.substring(7);
    const decodedToken = await verifyToken(token);
    if (!decodedToken) {
      return new Response('Invalid token', { status: 401 });
    }

    await connectDB();

    // Get user and check usage limits
    const user = await User.findOne({ uid: decodedToken.uid });
    if (!user) {
      return new Response('User not found', { status: 404 });
    }

    // Check usage limits for free plan
    if (user.plan === 'free' && user.copilotAnswersUsed >= 10) {
      return new Response(
        JSON.stringify({ error: 'Free plan limit reached. Upgrade to Pro for unlimited answers.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Increment usage counter
    user.copilotAnswersUsed += 1;
    await user.save();

    // Build prompt with resume context if available
    const resumeCtx = resumeContext || (user.resume ? `Skills: ${user.resume.skills.join(', ')}. Experience: ${user.resume.experience.join('; ')}` : undefined);
    const messages = buildCopilotPrompt(question, answerStyle || 'concise', jobRole, resumeCtx);

    // Create SSE stream
    const encoder = new TextEncoder();
    let fullAnswer = '';

    const stream = new ReadableStream({
      async start(controller) {
        try {
          await streamOpenRouterResponse(
            { messages },
            (chunk) => {
              fullAnswer += chunk;
              const data = `data: ${JSON.stringify({ chunk })}\n\n`;
              controller.enqueue(encoder.encode(data));
            },
            async () => {
              // Save Q&A to session
              if (sessionId) {
                try {
                  await InterviewSession.findByIdAndUpdate(sessionId, {
                    $push: {
                      questions: {
                        question,
                        answer: fullAnswer,
                        source: source || 'manual',
                        platform: platform || 'other',
                        confidence: confidence || 0,
                        timestamp: new Date(),
                        answerStyle: answerStyle || 'concise',
                      },
                    },
                  });
                } catch (err) {
                  console.error('Error saving Q&A to session:', err);
                }
              }

              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              controller.close();
            },
            (error) => {
              console.error('OpenRouter error:', error);
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: error.message })}\n\n`));
              controller.close();
            }
          );
        } catch (error: any) {
          console.error('Stream error:', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: error.message })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('API error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
