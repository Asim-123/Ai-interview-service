'use client';

import { useState, useEffect } from 'react';
import { QuestionItem, useCopilotStore } from '@/store/copilot-store';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/store/auth-store';

interface Props {
  question: QuestionItem;
}

const SOURCE_META: Record<string, { label: string; color: string; bg: string }> = {
  mic:     { label: 'Mic',     color: '#818cf8', bg: 'rgba(99,102,241,0.12)' },
  chat:    { label: 'Chat',    color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
  caption: { label: 'Caption', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  manual:  { label: 'Manual',  color: '#94a3b8', bg: 'rgba(148,163,184,0.1)'  },
};

const PLATFORM_META: Record<string, { label: string; color: string }> = {
  meet:  { label: 'Meet',  color: '#4285F4' },
  zoom:  { label: 'Zoom',  color: '#2D8CFF' },
  teams: { label: 'Teams', color: '#5059C9' },
};

export default function QuestionCard({ question }: Props) {
  const { updateQuestion, answerStyle, useResume, jobRole, sessionId } = useCopilotStore();
  const { userData } = useAuthStore();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (question.isStreaming && !question.answer) {
      streamAnswer();
    }
  }, [question.isStreaming]);

  const streamAnswer = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const resumeContext =
        useResume && userData?.resume
          ? `Skills: ${userData.resume.skills.join(', ')}. Experience: ${userData.resume.experience.join('; ')}`
          : undefined;

      const response = await fetch('/api/copilot/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question: question.question,
          resumeContext,
          jobRole,
          answerStyle: question.answerStyle,
          sessionId,
          source: question.source,
          platform: question.platform,
          confidence: question.confidence,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        updateQuestion(question.id, { answer: error.error || 'Failed to generate answer', isStreaming: false });
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let fullAnswer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        for (const line of chunk.split('\n')) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              updateQuestion(question.id, { answer: fullAnswer, isStreaming: false });
              return;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.chunk) {
                fullAnswer += parsed.chunk;
                updateQuestion(question.id, { answer: fullAnswer });
              }
            } catch { /* skip */ }
          }
        }
      }
    } catch {
      updateQuestion(question.id, { answer: 'Error: Failed to generate answer', isStreaming: false });
    }
  };

  const handleCopy = () => {
    if (!question.answer) return;
    navigator.clipboard.writeText(question.answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const src = SOURCE_META[question.source] ?? SOURCE_META.manual;
  const plt = question.platform && question.platform !== 'other' ? PLATFORM_META[question.platform] : null;

  return (
    <div
      className="rounded-xl overflow-hidden animate-fade-up"
      style={{
        background: 'var(--surface-2)',
        border: `1px solid ${question.isAnswered ? 'var(--border)' : 'var(--border)'}`,
        opacity: question.isAnswered ? 0.55 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Source badge */}
          <span className="badge" style={{ background: src.bg, color: src.color }}>
            {src.label}
          </span>

          {/* Platform badge */}
          {plt && (
            <span className="badge" style={{ background: `${plt.color}18`, color: plt.color }}>
              {plt.label}
            </span>
          )}

          {/* Confidence */}
          {question.confidence > 0 && (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {question.confidence}%
            </span>
          )}
        </div>

        <time className="text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>
          {new Date(question.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </time>
      </div>

      {/* Question text */}
      <div className="px-4 pt-3 pb-2">
        <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>
          {question.question}
        </p>
      </div>

      {/* Answer */}
      <div className="px-4 pb-3">
        <div className="rounded-lg p-3 min-h-[52px]" style={{ background: 'var(--surface-3)' }}>
          {question.isStreaming && !question.answer && (
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full" style={{
                    background: '#6366f1',
                    animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Generating answer…</span>
            </div>
          )}

          {question.answer && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
              {question.answer}
              {question.isStreaming && <span className="streaming-cursor" />}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 px-4 pb-3">
        <button
          onClick={handleCopy}
          disabled={!question.answer}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
          style={{ background: 'var(--surface-3)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
        >
          {copied ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
              Copied
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" /></svg>
              Copy
            </>
          )}
        </button>

        <button
          onClick={() => updateQuestion(question.id, { answer: '', isStreaming: true })}
          disabled={question.isStreaming}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
          style={{ background: 'var(--surface-3)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Retry
        </button>

        {!question.isAnswered && (
          <button
            onClick={() => updateQuestion(question.id, { isAnswered: true })}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            Answered
          </button>
        )}
      </div>
    </div>
  );
}
