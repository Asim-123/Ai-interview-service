'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useCopilotStore } from '@/store/copilot-store';
import { auth } from '@/lib/firebase';
import LeftPanel from '@/components/copilot/LeftPanel';
import CenterPanel from '@/components/copilot/CenterPanel';
import RightPanel from '@/components/copilot/RightPanel';
import MeetingEmbed from '@/components/copilot/MeetingEmbed';
import FloatingMiniMode from '@/components/copilot/FloatingMiniMode';
import SpeechRecognitionManager from '@/components/copilot/SpeechRecognitionManager';
import Navbar from '@/components/Navbar';

interface MeetingToast {
  platform: string;
  label: string;
}

const PLATFORM_LABELS: Record<string, string> = {
  meet:  'Google Meet',
  zoom:  'Zoom',
  teams: 'Microsoft Teams',
  other: 'Meeting',
};

export default function CopilotPage() {
  const router = useRouter();
  const { user, loading } = useAuthStore();
  const {
    sessionId, setSessionId,
    setExtensionConnected,
    setPlatform, setMeetingActive, startSession,
  } = useCopilotStore();

  const [showMiniMode, setShowMiniMode] = useState(false);
  const [showMeetingEmbed, setShowMeetingEmbed] = useState(false);
  const [meetingStreaming, setMeetingStreaming] = useState(false);
  const [tabStream, setTabStream] = useState<MediaStream | null>(null);
  const [meetingToast, setMeetingToast] = useState<MeetingToast | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading, router]);

  useEffect(() => {
    if (user && !sessionId) startBackendSession();
  }, [user, sessionId]);

  // SSE connection
  useEffect(() => {
    if (!user) return;

    const connectSSE = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) return;

        const es = new EventSource(`/api/copilot/listen?token=${token}`);
        eventSourceRef.current = es;

        es.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'connected') {
              setExtensionConnected(true);
            } else if (data.type === 'question') {
              handleIncomingQuestion(data.data);
            } else if (data.type === 'meeting_detected') {
              handleMeetingDetected(data.platform ?? 'other');
            }
          } catch { /* heartbeat */ }
        };

        es.onerror = () => {
          setExtensionConnected(false);
          es.close();
          setTimeout(connectSSE, 5000);
        };
      } catch (err) {
        console.error('SSE setup error:', err);
      }
    };

    connectSSE();
    return () => eventSourceRef.current?.close();
  }, [user]);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.code === 'Space') {
        e.preventDefault();
        setShowMiniMode((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const startBackendSession = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      const res = await fetch('/api/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ jobRole: 'Software Engineer', platform: 'other', type: 'live' }),
      });
      if (res.ok) {
        const data = await res.json();
        setSessionId(data.sessionId);
      }
    } catch (err) {
      console.error('Error starting session:', err);
    }
  };

  const handleIncomingQuestion = (qData: any) => {
    useCopilotStore.getState().addQuestion({
      id: Date.now().toString(),
      question: qData.question,
      answer: '',
      source: qData.source,
      platform: qData.platform,
      confidence: qData.confidence,
      timestamp: new Date(),
      answerStyle: useCopilotStore.getState().answerStyle,
      isStreaming: true,
    });
  };

  const handleMeetingDetected = (platform: string) => {
    window.dispatchEvent(new CustomEvent('meeting_detected', { detail: { platform } }));
    const label = PLATFORM_LABELS[platform] ?? 'Meeting';
    setMeetingToast({ platform, label });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setMeetingToast(null), 8000);
    // Auto-open meeting embed panel
    setShowMeetingEmbed(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <Navbar />

      {/* Meeting detected toast */}
      {meetingToast && (
        <div className="fixed top-16 right-4 z-50 animate-fade-up"
          style={{
            background: 'rgba(16,185,129,0.12)',
            border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: '0.75rem',
            padding: '12px 16px',
            backdropFilter: 'blur(12px)',
            minWidth: 280,
          }}>
          <div className="flex items-center gap-3">
            <div className="dot-online" />
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: '#10b981' }}>
                {meetingToast.label} Detected
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                Meeting view opened — click "Share Tab" to embed it
              </p>
            </div>
            <button onClick={() => setMeetingToast(null)} style={{ color: 'var(--text-muted)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Toolbar strip */}
      <div className="flex items-center gap-2 px-4 py-2 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <button
          onClick={() => setShowMeetingEmbed((v) => !v)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
          style={
            showMeetingEmbed
              ? { background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.35)' }
              : { background: 'var(--surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }
          }
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
          {showMeetingEmbed ? 'Hide Meeting' : 'Show Meeting'}
          {meetingStreaming && (
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          )}
        </button>

        <div className="flex-1" />

        <kbd className="text-xs px-2 py-1 rounded"
          style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
          Ctrl+Shift+Space
        </kbd>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>mini mode</span>
      </div>

      {/* Main layout */}
      <div className="flex-1 overflow-hidden p-4">
        {showMeetingEmbed ? (
          /* ── Meeting + Copilot split layout ─────────────────────────────── */
          <div className="grid grid-cols-12 gap-4 h-full">
            {/* Left controls (narrow) */}
            <div className="col-span-2 h-full">
              <LeftPanel />
            </div>

            {/* Meeting embed */}
            <div className="col-span-5 h-full">
              <MeetingEmbed
                onStreamReady={(s) => { setMeetingStreaming(true); setTabStream(s); }}
                onStreamEnded={() => { setMeetingStreaming(false); setTabStream(null); }}
              />
            </div>

            {/* Q&A feed */}
            <div className="col-span-3 h-full">
              <CenterPanel />
            </div>

            {/* Quick actions */}
            <div className="col-span-2 h-full">
              <RightPanel />
            </div>
          </div>
        ) : (
          /* ── Standard layout ─────────────────────────────────────────────── */
          <div className="grid grid-cols-12 gap-4 h-full">
            <div className="col-span-3 h-full"><LeftPanel /></div>
            <div className="col-span-6 h-full"><CenterPanel /></div>
            <div className="col-span-3 h-full"><RightPanel /></div>
          </div>
        )}
      </div>

      {showMiniMode && <FloatingMiniMode onClose={() => setShowMiniMode(false)} />}
      <SpeechRecognitionManager tabStream={tabStream} />
    </div>
  );
}
