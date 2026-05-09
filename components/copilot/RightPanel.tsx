'use client';

import { useState } from 'react';
import { useCopilotStore } from '@/store/copilot-store';
import { isInterviewQuestion } from '@/lib/question-detector';

const ANSWER_STYLES = [
  {
    value: 'concise',
    label: 'Concise',
    desc: '2–3 sentences, quick delivery',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
      </svg>
    ),
  },
  {
    value: 'star',
    label: 'STAR Format',
    desc: 'Situation · Task · Action · Result',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
      </svg>
    ),
  },
  {
    value: 'technical',
    label: 'Technical',
    desc: 'In-depth with examples',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
      </svg>
    ),
  },
] as const;

const DEFAULT_KEYWORDS = [
  'STAR method', 'Leadership', 'Conflict resolution',
  'Technical skills', 'Problem-solving', 'Team collaboration',
  'Project management', 'Innovation', 'Ownership', 'Data-driven',
];

export default function RightPanel() {
  const { addQuestion, answerStyle, setAnswerStyle, useResume, setUseResume, jobRole } = useCopilotStore();
  const [manualQuestion, setManualQuestion] = useState('');
  const [notes, setNotes] = useState('');

  const handleAskQuestion = () => {
    const q = manualQuestion.trim();
    if (!q) return;
    const detection = isInterviewQuestion(q);
    addQuestion({
      id: Date.now().toString(),
      question: q,
      answer: '',
      source: 'manual',
      confidence: detection.confidence,
      timestamp: new Date(),
      answerStyle,
      isStreaming: true,
    });
    setManualQuestion('');
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setManualQuestion(text);
    } catch { /* ignore */ }
  };

  return (
    <div className="glass-panel rounded-xl h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="text-sm font-semibold tracking-wide" style={{ color: 'var(--text-muted)' }}>QUICK ACTIONS</h2>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 flex flex-col gap-5">

        {/* Manual question input */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Ask Manually</label>
          <textarea
            value={manualQuestion}
            onChange={(e) => setManualQuestion(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleAskQuestion(); }}
            placeholder="Type or paste a question…"
            rows={3}
            className="w-full px-3 py-2.5 text-sm rounded-lg input-dark resize-none"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleAskQuestion}
              disabled={!manualQuestion.trim()}
              className="flex-1 py-2 rounded-lg text-sm font-semibold btn-accent text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Ask
            </button>
            <button
              onClick={handlePaste}
              title="Paste from clipboard"
              className="px-3 py-2 rounded-lg text-sm btn-ghost"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
              </svg>
            </button>
          </div>
          <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>Ctrl+Enter to submit</p>
        </div>

        {/* Answer style */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Answer Style</label>
          <div className="flex flex-col gap-1.5">
            {ANSWER_STYLES.map((s) => (
              <button
                key={s.value}
                onClick={() => setAnswerStyle(s.value)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all"
                style={
                  answerStyle === s.value
                    ? { background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.35)', color: '#818cf8' }
                    : { background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }
                }
              >
                <span style={{ color: answerStyle === s.value ? '#818cf8' : 'var(--text-muted)' }}>{s.icon}</span>
                <div>
                  <p className="text-xs font-semibold" style={{ color: answerStyle === s.value ? '#e0e7ff' : 'var(--text-primary)' }}>{s.label}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Resume context toggle */}
        <div className="flex items-center justify-between px-3 py-2.5 rounded-lg"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <div>
            <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Resume Context</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Personalise answers</p>
          </div>
          <button
            onClick={() => setUseResume(!useResume)}
            className="toggle"
            style={{ background: useResume ? '#6366f1' : 'var(--surface-3)' }}
          >
            <div className="toggle-thumb" style={{ transform: useResume ? 'translateX(20px)' : 'translateX(0)' }} />
          </button>
        </div>

        {/* Keywords */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Keyword Cheatsheet</label>
          <div className="flex flex-wrap gap-1.5">
            {DEFAULT_KEYWORDS.map((kw) => (
              <span key={kw} className="text-xs px-2.5 py-1 rounded-full"
                style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                {kw}
              </span>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="flex-1 flex flex-col min-h-[100px]">
          <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Quick Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Jot down key points…"
            className="flex-1 px-3 py-2.5 text-sm rounded-lg input-dark resize-none"
            style={{ minHeight: 100 }}
          />
        </div>
      </div>
    </div>
  );
}
