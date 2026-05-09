export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterStreamOptions {
  model?: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
}

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const DEFAULT_MODEL = 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free';
const MAX_RETRIES = 3;

async function fetchWithRetry(url: string, init: RequestInit, retries = MAX_RETRIES): Promise<Response> {
  const response = await fetch(url, init);

  if (response.status === 429 && retries > 0) {
    const retryAfter = response.headers.get('Retry-After');
    const waitMs = retryAfter ? parseInt(retryAfter) * 1000 : (MAX_RETRIES - retries + 1) * 2000;
    await new Promise((r) => setTimeout(r, waitMs));
    return fetchWithRetry(url, init, retries - 1);
  }

  return response;
}

export async function streamOpenRouterResponse(
  options: OpenRouterStreamOptions,
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void
) {
  try {
    const response = await fetchWithRetry('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'AI Interview Copilot',
      },
      body: JSON.stringify({
        model: options.model || DEFAULT_MODEL,
        messages: options.messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 500,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit reached on the free AI tier. Please wait a minute and try again.');
      }
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is null');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        onComplete();
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          if (data === '[DONE]') {
            onComplete();
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            
            if (content) {
              onChunk(content);
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  } catch (error) {
    onError(error as Error);
  }
}

export function buildCopilotPrompt(
  question: string,
  answerStyle: 'concise' | 'star' | 'technical',
  jobRole: string,
  resumeContext?: string
): OpenRouterMessage[] {
  let systemPrompt = '';

  if (answerStyle === 'concise') {
    systemPrompt = `You are an expert interview coach. The user is LIVE in a job interview RIGHT NOW for a ${jobRole} position. Give a sharp, confident, first-person answer in 2-3 sentences max. Do not say you are an AI. Sound natural and human.`;
  } else if (answerStyle === 'star') {
    systemPrompt = `You are an expert interview coach. Answer this behavioral question for a ${jobRole} position using STAR format (Situation, Task, Action, Result). First person, natural tone, 2-4 paragraphs. Do not mention AI. Sound like a real experienced professional.`;
  } else {
    systemPrompt = `You are a senior ${jobRole} being interviewed. Answer this technical question clearly and confidently. Include a brief example or analogy. 2-3 paragraphs. First person. Do not mention AI.`;
  }

  if (resumeContext) {
    systemPrompt += `\n\nResume Context: ${resumeContext}`;
  }

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: question },
  ];
}

export async function generateMockQuestions(jobRole: string, level: string, count: number = 10): Promise<string[]> {
  const prompt = `Generate ${count} realistic interview questions for a ${level} ${jobRole} position. Mix behavioral and technical questions. Return ONLY the questions, one per line, numbered 1-${count}.`;

  let fullResponse = '';

  await new Promise<void>((resolve, reject) => {
    streamOpenRouterResponse(
      {
        messages: [
          { role: 'system', content: 'You are an expert technical interviewer.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.8,
        max_tokens: 1000,
      },
      (chunk) => {
        fullResponse += chunk;
      },
      () => resolve(),
      (error) => reject(error)
    );
  });

  // Parse questions from response
  const lines = fullResponse.split('\n').filter((line) => line.trim());
  const questions = lines
    .map((line) => line.replace(/^\d+\.\s*/, '').trim())
    .filter((q) => q.length > 10 && q.includes('?') || q.split(' ').length > 5);

  return questions.slice(0, count);
}

export async function evaluateAnswer(question: string, answer: string, jobRole: string): Promise<string> {
  const prompt = `Evaluate this interview answer for a ${jobRole} position.

Question: ${question}

Candidate's Answer: ${answer}

Provide a brief evaluation covering:
1. Relevance (did they answer the question?)
2. Clarity and structure
3. Specific improvements
4. Score out of 10

Keep it constructive and actionable. 3-4 sentences max.`;

  let evaluation = '';

  await new Promise<void>((resolve, reject) => {
    streamOpenRouterResponse(
      {
        messages: [
          { role: 'system', content: 'You are an expert interview coach providing feedback.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.6,
        max_tokens: 300,
      },
      (chunk) => {
        evaluation += chunk;
      },
      () => resolve(),
      (error) => reject(error)
    );
  });

  return evaluation;
}
