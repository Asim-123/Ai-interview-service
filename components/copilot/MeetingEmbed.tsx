'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useCopilotStore } from '@/store/copilot-store';

interface Props {
  onStreamReady?: (stream: MediaStream) => void;
  onStreamEnded?: () => void;
}

const PLATFORM_INFO: Record<string, { label: string; hint: string; color: string }> = {
  meet:  { label: 'Google Meet',      hint: 'share the Meet tab',        color: '#4285F4' },
  zoom:  { label: 'Zoom',             hint: 'share the Zoom tab',        color: '#2D8CFF' },
  teams: { label: 'Microsoft Teams',  hint: 'share the Teams tab',       color: '#5059C9' },
  other: { label: 'Your Meeting',     hint: 'share the meeting window',  color: '#6366f1' },
};

export default function MeetingEmbed({ onStreamReady, onStreamEnded }: Props) {
  const { platform, isMeetingActive } = useCopilotStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoSize, setVideoSize] = useState<{ w: number; h: number } | null>(null);

  const info = PLATFORM_INFO[platform] ?? PLATFORM_INFO.other;

  const startCapture = useCallback(async () => {
    setError(null);
    setIsConnecting(true);
    try {
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({
        video: { frameRate: { ideal: 30 } },
        audio: true,
        preferCurrentTab: true,          // Chrome 107+ preselects the current tab
        selfBrowserSurface: 'exclude',   // Don't offer this very tab
        surfaceSwitching: 'include',
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;   // We handle audio ourselves
        videoRef.current.play().catch(() => {});
      }

      // Track when user stops sharing via browser UI
      stream.getVideoTracks()[0].addEventListener('ended', stopCapture);

      setIsSharing(true);
      onStreamReady?.(stream);
    } catch (err: any) {
      if (err.name !== 'NotAllowedError') {
        setError('Could not capture screen. Please try again.');
      }
    } finally {
      setIsConnecting(false);
    }
  }, [onStreamReady, platform]);

  const stopCapture = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsSharing(false);
    setVideoSize(null);
    onStreamEnded?.();
  }, [onStreamEnded]);

  // Clean up on unmount
  useEffect(() => () => stopCapture(), []);

  // Read actual video dimensions once metadata loaded
  const handleMetadata = () => {
    if (videoRef.current) {
      setVideoSize({ w: videoRef.current.videoWidth, h: videoRef.current.videoHeight });
    }
  };

  return (
    <div className="flex flex-col h-full rounded-xl overflow-hidden"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>

      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: isSharing ? '#10b981' : 'var(--text-muted)' }} />
          <span className="text-xs font-semibold tracking-wide" style={{ color: 'var(--text-muted)' }}>
            {isSharing ? info.label.toUpperCase() : 'MEETING VIEW'}
          </span>
          {isSharing && videoSize && (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {videoSize.w}×{videoSize.h}
            </span>
          )}
        </div>
        {isSharing && (
          <button
            onClick={stopCapture}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
            Stop
          </button>
        )}
      </div>

      {/* Video / placeholder */}
      <div className="flex-1 relative overflow-hidden" style={{ background: '#000' }}>
        <video
          ref={videoRef}
          onLoadedMetadata={handleMetadata}
          className="w-full h-full"
          style={{ objectFit: 'contain', display: isSharing ? 'block' : 'none' }}
          playsInline
          muted
        />

        {!isSharing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-6">
            {/* Platform icon area */}
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: `${info.color}15`, border: `1px solid ${info.color}30` }}>
              <svg viewBox="0 0 24 24" fill="none" stroke={info.color} strokeWidth="1.5" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </div>

            <div className="text-center">
              <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                Embed Your Meeting
              </h3>
              <p className="text-xs leading-relaxed max-w-[200px]" style={{ color: 'var(--text-muted)' }}>
                Share {info.hint} to see it here while the AI assists you
              </p>
            </div>

            {error && (
              <p className="text-xs text-center px-4 py-2 rounded-lg"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </p>
            )}

            <button
              onClick={startCapture}
              disabled={isConnecting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 transition-all"
              style={{ background: info.color, color: 'white' }}
            >
              {isConnecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Connecting…
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12H3" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="m9 6-6 6 6 6" />
                  </svg>
                  Share {info.label} Tab
                </>
              )}
            </button>

            <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
              Browser will ask which tab/window to share
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
