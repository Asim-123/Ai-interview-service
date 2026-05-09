'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, githubProvider } from '@/lib/firebase';

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuthStore();
  const [authLoading, setAuthLoading] = useState<'google' | 'github' | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.push('/copilot');
    }
  }, [user, loading, router]);

  const handleGoogleSignIn = async () => {
    setAuthLoading('google');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google sign in error:', error);
    } finally {
      setAuthLoading(null);
    }
  };

  const handleGithubSignIn = async () => {
    setAuthLoading('github');
    try {
      await signInWithPopup(auth, githubProvider);
    } catch (error) {
      console.error('GitHub sign in error:', error);
    } finally {
      setAuthLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading…</span>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
        </svg>
      ),
      label: 'Live Transcription',
      desc: 'Captures questions from mic, chat and captions in real time',
      accent: '#6366f1',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
        </svg>
      ),
      label: 'Instant AI Answers',
      desc: 'Streams answers in under 2 s powered by Nvidia Nemotron',
      accent: '#8b5cf6',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
        </svg>
      ),
      label: 'Completely Invisible',
      desc: 'Zero visible UI during calls — the interviewer sees nothing',
      accent: '#a78bfa',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
      ),
      label: 'Resume-Aware',
      desc: 'Personalises every answer using your skills and experience',
      accent: '#c084fc',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
        </svg>
      ),
      label: 'Session Reports',
      desc: 'Full analytics and transcripts after every interview',
      accent: '#818cf8',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
        </svg>
      ),
      label: 'Auto-Detect Meetings',
      desc: 'Chrome extension detects Google Meet, Zoom & Teams automatically',
      accent: '#6366f1',
    },
  ];

  const platforms = [
    { name: 'Google Meet', color: '#4285F4' },
    { name: 'Zoom', color: '#2D8CFF' },
    { name: 'Microsoft Teams', color: '#5059C9' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Top bar */}
      <header className="border-b" style={{ borderColor: 'var(--border)', background: 'rgba(9,11,16,0.8)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg accent-gradient flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm1 14.93V17a1 1 0 0 0-2 0v-.07A8.004 8.004 0 0 1 4.07 11H5a1 1 0 0 0 0-2h-.93A8.004 8.004 0 0 1 11 4.07V5a1 1 0 0 0 2 0v-.93A8.004 8.004 0 0 1 19.93 11H19a1 1 0 0 0 0 2h.93A8.004 8.004 0 0 1 13 16.93z"/>
              </svg>
            </div>
            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Ghost Interviewer</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleGoogleSignIn}
              className="px-4 py-1.5 text-sm font-medium rounded-lg btn-ghost"
            >
              Sign in
            </button>
            <button
              onClick={handleGoogleSignIn}
              className="px-4 py-1.5 text-sm font-semibold rounded-lg btn-accent text-white"
            >
              Get started free
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
          style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          Powered by Nvidia Nemotron &middot; Free tier available
        </div>

        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-5 max-w-3xl mx-auto" style={{ lineHeight: 1.1 }}>
          <span style={{ color: 'var(--text-primary)' }}>Your invisible AI</span>
          <br />
          <span className="accent-gradient-text">interview co-pilot</span>
        </h1>

        <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
          Detects questions live from Google Meet, Zoom &amp; Teams. Streams AI answers in real time. The interviewer sees nothing.
        </p>

        {/* Auth buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <button
            onClick={handleGoogleSignIn}
            disabled={authLoading !== null}
            className="flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-semibold text-sm transition-all"
            style={{ background: 'white', color: '#111', border: 'none' }}
          >
            {authLoading === 'google' ? (
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continue with Google
          </button>

          <button
            onClick={handleGithubSignIn}
            disabled={authLoading !== null}
            className="flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-semibold text-sm transition-all"
            style={{ background: 'var(--surface-2)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
          >
            {authLoading === 'github' ? (
              <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12Z"/>
              </svg>
            )}
            Continue with GitHub
          </button>
        </div>

        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          No credit card required &middot; 10 free AI answers/day
        </p>
      </section>

      {/* Platform logos */}
      <section className="container mx-auto px-6 pb-16">
        <p className="text-center text-xs font-medium uppercase tracking-widest mb-6" style={{ color: 'var(--text-muted)' }}>
          Auto-detected platforms
        </p>
        <div className="flex gap-6 justify-center items-center flex-wrap">
          {platforms.map((p) => (
            <div key={p.name} className="flex items-center gap-2 px-4 py-2 rounded-lg"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
              <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{p.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Feature grid */}
      <section className="container mx-auto px-6 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            Everything you need to ace the interview
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>Built for engineers, product managers, and anyone who interviews</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {features.map((f) => (
            <div key={f.label} className="glass-card p-5">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                style={{ background: `${f.accent}18`, color: f.accent }}>
                {f.icon}
              </div>
              <h3 className="font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>{f.label}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center" style={{ borderColor: 'var(--border)' }}>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          &copy; {new Date().getFullYear()} Ghost Interviewer &middot; Built to win
        </p>
      </footer>
    </div>
  );
}
