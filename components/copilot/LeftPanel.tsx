'use client';

import { useState, useEffect } from 'react';
import { useCopilotStore } from '@/store/copilot-store';
import { useAuthStore } from '@/store/auth-store';

const PLATFORMS = [
  { value: 'meet', label: 'Google Meet', color: '#4285F4' },
  { value: 'zoom', label: 'Zoom', color: '#2D8CFF' },
  { value: 'teams', label: 'Microsoft Teams', color: '#5059C9' },
  { value: 'other', label: 'Other', color: '#6366f1' },
];

export default function LeftPanel() {
  const {
    platform, setPlatform,
    jobRole, setJobRole,
    extensionConnected,
    isMeetingActive, setMeetingActive,
    isListening, setListening,
    systemAudioEnabled, setSystemAudioEnabled,
    sessionStartTime, startSession, endSession,
  } = useCopilotStore();

  const { userData } = useAuthStore();
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [bars, setBars] = useState<number[]>(Array(16).fill(2));
  const [autoDetectedPlatform, setAutoDetectedPlatform] = useState<string | null>(null);

  // Timer
  useEffect(() => {
    if (!isMeetingActive || !sessionStartTime) return;
    const id = setInterval(() => {
      const diff = Math.floor((Date.now() - sessionStartTime.getTime()) / 1000);
      const h = Math.floor(diff / 3600).toString().padStart(2, '0');
      const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
      const s = (diff % 60).toString().padStart(2, '0');
      setElapsedTime(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(id);
  }, [isMeetingActive, sessionStartTime]);

  // Mic visualizer
  useEffect(() => {
    if (!isListening) { setBars(Array(16).fill(2)); return; }
    const id = setInterval(() => {
      setBars(Array(16).fill(0).map(() => Math.floor(Math.random() * 80) + 4));
    }, 120);
    return () => clearInterval(id);
  }, [isListening]);

  // Listen for auto-detected meeting events (dispatched by copilot page from SSE)
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const { platform: p } = e.detail;
      setAutoDetectedPlatform(p);
    };
    window.addEventListener('meeting_detected' as any, handler);
    return () => window.removeEventListener('meeting_detected' as any, handler);
  }, []);

  const handleStartMeeting = () => {
    setMeetingActive(true);
    startSession();
    setAutoDetectedPlatform(null);
  };

  const handleEndMeeting = () => {
    setMeetingActive(false);
    endSession();
    setElapsedTime('00:00:00');
  };

  const activePlatform = PLATFORMS.find((p) => p.value === platform);

  return (
    <div className="glass-panel rounded-xl h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="text-sm font-semibold tracking-wide" style={{ color: 'var(--text-muted)' }}>
          MEETING CONTROL
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 flex flex-col gap-4">

        {/* Auto-detected meeting banner */}
        {autoDetectedPlatform && !isMeetingActive && (
          <div className="meeting-alert p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="dot-online" />
                  <span className="text-sm font-semibold" style={{ color: '#10b981' }}>Meeting Detected</span>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {PLATFORMS.find((p) => p.value === autoDetectedPlatform)?.label ?? autoDetectedPlatform} is active
                </p>
              </div>
              <button
                onClick={() => { setPlatform(autoDetectedPlatform as any); handleStartMeeting(); }}
                className="flex-shrink-0 px-3 py-1 rounded-md text-xs font-semibold"
                style={{ background: '#10b981', color: 'white' }}
              >
                Join Now
              </button>
            </div>
          </div>
        )}

        {/* Session timer (when active) */}
        {isMeetingActive && (
          <div className="rounded-xl p-4 text-center"
            style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <div className="text-2xl font-bold font-mono tracking-widest mb-0.5" style={{ color: '#818cf8' }}>
              {elapsedTime}
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Session duration</p>
          </div>
        )}

        {/* Platform selector */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Platform</label>
          <div className="grid grid-cols-2 gap-1.5">
            {PLATFORMS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPlatform(p.value as any)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left"
                style={{
                  background: platform === p.value ? `${p.color}18` : 'var(--surface-2)',
                  border: `1px solid ${platform === p.value ? `${p.color}60` : 'var(--border)'}`,
                  color: platform === p.value ? p.color : 'var(--text-secondary)',
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Job Role */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Job Role</label>
          <input
            type="text"
            value={jobRole}
            onChange={(e) => setJobRole(e.target.value)}
            placeholder="e.g. Senior Frontend Engineer"
            className="w-full px-3 py-2 text-sm rounded-lg input-dark"
          />
          {userData?.resume && (
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Resume skills will be applied</p>
          )}
        </div>

        {/* Status row */}
        <div className="space-y-2">
          {/* Extension */}
          <div className="flex items-center justify-between px-3 py-2.5 rounded-lg"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Chrome Extension</span>
            <div className="flex items-center gap-1.5">
              <div className={extensionConnected ? 'dot-online' : 'dot-offline'} />
              <span className="text-xs font-semibold" style={{ color: extensionConnected ? '#10b981' : 'var(--text-muted)' }}>
                {extensionConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          {/* Meeting status */}
          <div className="flex items-center justify-between px-3 py-2.5 rounded-lg"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Meeting</span>
            <div className="flex items-center gap-1.5">
              <div className={isMeetingActive ? 'dot-online' : 'dot-offline'} />
              <span className="text-xs font-semibold" style={{ color: isMeetingActive ? '#10b981' : 'var(--text-muted)' }}>
                {isMeetingActive ? 'Active' : 'Waiting'}
              </span>
            </div>
          </div>
        </div>

        {/* Microphone */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Microphone</span>
            <button
              onClick={() => setListening(!isListening)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all"
              style={
                isListening
                  ? { background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }
                  : { background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
              }
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
              </svg>
              {isListening ? 'Listening' : 'Paused'}
            </button>
          </div>

          {/* Visualizer */}
          <div className="h-10 rounded-lg flex items-end gap-px px-2"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            {bars.map((h: number, i: number) => (
              <div
                key={i}
                className="flex-1 rounded-sm transition-all duration-100"
                style={{
                  height: `${h}%`,
                  background: isListening
                    ? `linear-gradient(to top, #6366f1, #a78bfa)`
                    : 'var(--surface-3)',
                }}
              />
            ))}
          </div>
        </div>

        {/* System audio toggle */}
        <div className="flex items-center justify-between px-3 py-2.5 rounded-lg"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <div>
            <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>System Audio</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Capture tab audio</p>
          </div>
          <button
            onClick={() => setSystemAudioEnabled(!systemAudioEnabled)}
            className="toggle"
            style={{ background: systemAudioEnabled ? '#6366f1' : 'var(--surface-3)' }}
          >
            <div className="toggle-thumb" style={{ transform: systemAudioEnabled ? 'translateX(20px)' : 'translateX(0)' }} />
          </button>
        </div>
      </div>

      {/* Action button */}
      <div className="px-5 py-4" style={{ borderTop: '1px solid var(--border)' }}>
        {!isMeetingActive ? (
          <button
            onClick={handleStartMeeting}
            className="w-full py-2.5 rounded-xl text-sm font-semibold btn-accent text-white"
          >
            Start Session
          </button>
        ) : (
          <button
            onClick={handleEndMeeting}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-colors"
            style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}
          >
            End Session
          </button>
        )}
      </div>
    </div>
  );
}
