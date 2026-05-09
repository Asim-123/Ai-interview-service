'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { auth } from '@/lib/firebase';
import Navbar from '@/components/Navbar';

interface TailoredResume {
  name: string;
  targetRoles: string[];
  skills: string[];
  experience: string[];
  summary?: string;
  changes?: string[];
}

function ResumePreview({ resume, tailored, isLoading }: {
  resume: any;
  tailored: TailoredResume | null;
  isLoading: boolean;
}) {
  const display = tailored ?? resume;
  if (!display) return null;

  return (
    <div className="h-full overflow-y-auto">
      {/* Resume paper */}
      <div
        className="mx-auto rounded-xl p-8 text-sm leading-relaxed"
        style={{
          background: '#fff',
          color: '#1a1a1a',
          maxWidth: 680,
          fontFamily: "'Georgia', serif",
          boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
        }}
      >
        {/* Spinner overlay while loading */}
        {isLoading && (
          <div className="absolute inset-0 rounded-xl flex items-center justify-center z-10"
            style={{ background: 'rgba(255,255,255,0.8)' }}>
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Tailoring your resume…</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center border-b-2 border-gray-800 pb-4 mb-5">
          <h1 className="text-2xl font-bold tracking-wide uppercase" style={{ letterSpacing: '0.12em' }}>
            {display.name && display.name !== 'Unknown' ? display.name : 'Your Resume'}
          </h1>
          {display.targetRoles?.length > 0 && (
            <p className="text-sm mt-1 text-gray-600">{display.targetRoles.join(' · ')}</p>
          )}
        </div>

        {/* Summary */}
        {display.summary && (
          <section className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-2"
              style={{ color: '#4f46e5' }}>
              Professional Summary
            </h2>
            <p className="text-gray-700 text-sm leading-relaxed">{display.summary}</p>
          </section>
        )}

        {/* Skills */}
        {display.skills?.length > 0 && (
          <section className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-2"
              style={{ color: '#4f46e5' }}>
              Skills
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {display.skills.map((skill: string, i: number) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded text-xs"
                  style={{
                    background: tailored ? '#ede9fe' : '#f3f4f6',
                    color: tailored ? '#4f46e5' : '#374151',
                    border: `1px solid ${tailored ? '#c4b5fd' : '#e5e7eb'}`,
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Experience */}
        {display.experience?.length > 0 && (
          <section className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-3"
              style={{ color: '#4f46e5' }}>
              Experience
            </h2>
            <ul className="space-y-2">
              {display.experience.map((exp: string, i: number) => (
                <li key={i} className="flex gap-2 text-sm text-gray-700">
                  <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span>{exp}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Changes banner — only shown after tailoring */}
        {tailored?.changes && tailored.changes.length > 0 && (
          <section className="mt-6 p-4 rounded-lg" style={{ background: '#f0fdf4', border: '1px solid #86efac' }}>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#16a34a' }}>
              AI Changes Made
            </h3>
            <ul className="space-y-1">
              {tailored.changes.map((c, i) => (
                <li key={i} className="flex gap-2 text-xs text-green-800">
                  <span>✓</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

export default function ResumePage() {
  const router = useRouter();
  const { user, loading, userData, setUserData } = useAuthStore();

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Tailor state
  const [jd, setJd] = useState('');
  const [tailoring, setTailoring] = useState(false);
  const [tailored, setTailored] = useState<TailoredResume | null>(null);
  const [tailorError, setTailorError] = useState<string | null>(null);

  // View mode
  const [view, setView] = useState<'upload' | 'tailor'>('upload');

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading, router]);

  useEffect(() => {
    // Auto-switch to tailor view if resume already uploaded
    if (userData?.resume && view === 'upload') setView('tailor');
  }, [userData?.resume]);

  const handleFileUpload = async (file: File) => {
    if (!file || file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }
    setUploading(true);
    setUploadSuccess(false);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/resume/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setUserData({ ...userData, resume: data.resume } as any);
        setUploadSuccess(true);
        setView('tailor');
      } else {
        const err = await res.json();
        alert(`Upload failed: ${err.error}`);
      }
    } catch (err) {
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleTailor = async () => {
    if (!userData?.resume || !jd.trim()) return;
    setTailoring(true);
    setTailorError(null);
    setTailored(null);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/resume/tailor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ resume: userData.resume, jobDescription: jd }),
      });
      if (!res.ok) {
        const err = await res.json();
        setTailorError(err.error ?? 'Something went wrong');
        return;
      }
      const { tailored: result } = await res.json();
      setTailored(result);
    } catch (err: any) {
      setTailorError(err.message);
    } finally {
      setTailoring(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <Navbar />

      {/* Tabs */}
      <div className="flex items-center gap-2 px-6 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <button
          onClick={() => setView('upload')}
          className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
          style={view === 'upload'
            ? { background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.35)' }
            : { background: 'transparent', color: 'var(--text-muted)', border: '1px solid transparent' }}
        >
          Upload Resume
        </button>
        <button
          onClick={() => setView('tailor')}
          disabled={!userData?.resume}
          className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-40"
          style={view === 'tailor'
            ? { background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.35)' }
            : { background: 'transparent', color: 'var(--text-muted)', border: '1px solid transparent' }}
        >
          Tailor to JD
        </button>
        {userData?.resume && (
          <span className="ml-2 text-xs px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}>
            Resume uploaded
          </span>
        )}
      </div>

      {/* ── UPLOAD VIEW ─────────────────────────────────────────────── */}
      {view === 'upload' && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-xl">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Resume Manager
            </h1>
            <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
              Upload your PDF resume. We'll extract and store your skills and experience to power personalized AI answers and JD tailoring.
            </p>

            <div
              onDrop={(e) => { e.preventDefault(); setDragActive(false); e.dataTransfer.files[0] && handleFileUpload(e.dataTransfer.files[0]); }}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              className="rounded-xl p-12 text-center border-2 border-dashed transition-all cursor-pointer"
              style={{
                borderColor: dragActive ? '#6366f1' : 'var(--border)',
                background: dragActive ? 'rgba(99,102,241,0.06)' : 'var(--surface)',
              }}
            >
              <input type="file" accept=".pdf" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                disabled={uploading} className="hidden" id="fileInput" />
              <label htmlFor="fileInput" className="cursor-pointer">
                <div className="text-5xl mb-4">📄</div>
                {uploading ? (
                  <>
                    <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Processing resume…</p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                      Drop your PDF here or click to browse
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>PDF only · max 5 MB</p>
                  </>
                )}
              </label>
            </div>

            {uploadSuccess && (
              <div className="mt-4 p-4 rounded-xl flex items-start gap-3"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                <span className="text-lg">✅</span>
                <div>
                  <p className="font-semibold text-sm" style={{ color: '#10b981' }}>Resume uploaded!</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Switch to <strong>Tailor to JD</strong> to customize it for a specific role.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAILOR VIEW — split panel ──────────────────────────────── */}
      {view === 'tailor' && (
        <div className="flex-1 flex overflow-hidden">

          {/* LEFT: JD input */}
          <div className="w-2/5 flex flex-col flex-shrink-0 border-r"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>

            <div className="px-5 py-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
                JOB DESCRIPTION
              </h2>
            </div>

            <div className="flex-1 flex flex-col p-5 gap-4 overflow-y-auto">
              <textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste the job description here…"
                className="flex-1 w-full resize-none rounded-xl text-sm p-4 outline-none min-h-[300px]"
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  lineHeight: 1.7,
                }}
              />

              {tailorError && (
                <p className="text-xs px-3 py-2 rounded-lg"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {tailorError}
                </p>
              )}

              <button
                onClick={handleTailor}
                disabled={!jd.trim() || tailoring}
                className="w-full py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white' }}
              >
                {tailoring ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Tailoring…
                  </span>
                ) : '✨ Tailor Resume to JD'}
              </button>

              {tailored && (
                <button
                  onClick={() => setTailored(null)}
                  className="text-xs text-center transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Reset to original
                </button>
              )}
            </div>
          </div>

          {/* RIGHT: Resume preview */}
          <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg)' }}>
            <div className="px-5 py-4 flex-shrink-0 flex items-center justify-between"
              style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
                {tailored ? 'TAILORED PREVIEW' : 'RESUME PREVIEW'}
              </h2>
              {tailored && (
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)' }}>
                  Tailored to JD
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 relative">
              {userData?.resume ? (
                <ResumePreview resume={userData.resume} tailored={tailored} isLoading={tailoring} />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Upload a resume first to see the preview
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
