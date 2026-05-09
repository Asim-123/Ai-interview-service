'use client';

import React, { useEffect } from 'react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useTabSpeechRecognition } from '@/hooks/useTabSpeechRecognition';
import { useCopilotStore } from '@/store/copilot-store';

interface Props {
  /** Audio+video MediaStream from getDisplayMedia — used to detect interviewer questions */
  tabStream: MediaStream | null;
}

export default function SpeechRecognitionManager({ tabStream }: Props) {
  const { isListening } = useCopilotStore();

  // Mic channel — captures YOUR voice (useful for manual question repeats)
  const { transcript, isSupported } = useSpeechRecognition();

  // Tab audio channel — captures the INTERVIEWER'S voice via Gemini transcription
  useTabSpeechRecognition(tabStream);

  useEffect(() => {
    if (!isSupported) {
      console.warn('⚠️ Speech Recognition not supported in this browser');
    }
  }, [isSupported]);

  if (!isSupported) return null;

  return (
    <>
      {isListening && transcript && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-gray-900/95 border border-indigo-500/40 rounded-lg px-6 py-3 max-w-2xl z-50 shadow-xl">
          <div className="text-xs text-gray-400 mb-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse inline-block" />
            Listening (mic)…
          </div>
          <div className="text-sm text-white leading-relaxed">{transcript}</div>
        </div>
      )}

      {tabStream && (
        <div className="fixed bottom-6 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold z-50"
          style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Listening for interviewer
        </div>
      )}
    </>
  );
}
