'use client';

import { useEffect, useRef } from 'react';
import { useCopilotStore } from '@/store/copilot-store';
import QuestionCard from './QuestionCard';

export default function CenterPanel() {
  const { questions, isListening, isMeetingActive } = useCopilotStore();
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [questions.length]);

  return (
    <div className="glass-panel rounded-xl h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold tracking-wide" style={{ color: 'var(--text-muted)' }}>LIVE Q&amp;A FEED</h2>
          {isMeetingActive && (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
              <div className="dot-online" style={{ width: 6, height: 6 }} />
              Live
            </span>
          )}
        </div>
        <span className="text-xs font-medium tabular-nums px-2 py-0.5 rounded-full"
          style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
          {questions.length} {questions.length === 1 ? 'question' : 'questions'}
        </span>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 space-y-3">
        <div ref={topRef} />

        {questions.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center py-16">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7"
                style={{ color: 'var(--text-muted)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
              Waiting for questions
            </h3>
            <p className="text-sm max-w-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {isListening
                ? 'Microphone is active — questions will appear here instantly.'
                : 'Start a session or connect the Chrome extension to begin.'}
            </p>
          </div>
        )}

        {questions.map((q) => (
          <QuestionCard key={q.id} question={q} />
        ))}
      </div>
    </div>
  );
}
