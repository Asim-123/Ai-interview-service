'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { auth } from '@/lib/firebase';
import Navbar from '@/components/Navbar';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Session {
  _id: string;
  type: 'live' | 'mock';
  jobRole: string;
  platform?: string;
  questions: any[];
  startTime: string;
  endTime?: string;
  duration?: number;
  status: string;
}

export default function ReportsPage() {
  const router = useRouter();
  const { user, loading, userData } = useAuthStore();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    } else if (user) {
      fetchSessions();
    }
  }, [user, loading, router]);

  const fetchSessions = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const response = await fetch('/api/reports', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (error) {
      console.error('Fetch sessions error:', error);
    } finally {
      setLoadingSessions(false);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const chartData = sessions.slice(0, 10).reverse().map((session, i) => ({
    name: `#${sessions.length - i}`,
    questions: session.questions.length,
  }));

  if (loading || loadingSessions) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-cyan"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
            Interview Reports
          </h1>
          <p className="text-gray-400 mb-8">
            View your past interview sessions and performance
          </p>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="glass-panel rounded-xl p-6">
              <div className="text-neon-cyan text-3xl font-bold mb-2">
                {sessions.length}
              </div>
              <div className="text-gray-400 text-sm">Total Sessions</div>
            </div>

            <div className="glass-panel rounded-xl p-6">
              <div className="text-neon-purple text-3xl font-bold mb-2">
                {sessions.reduce((acc, s) => acc + s.questions.length, 0)}
              </div>
              <div className="text-gray-400 text-sm">Questions Answered</div>
            </div>

            <div className="glass-panel rounded-xl p-6">
              <div className="text-neon-yellow text-3xl font-bold mb-2">
                {userData?.copilotAnswersUsed || 0}
              </div>
              <div className="text-gray-400 text-sm">Copilot Answers Used</div>
            </div>
          </div>

          {/* Chart */}
          {sessions.length > 0 && (
            <div className="glass-panel rounded-xl p-6 mb-8">
              <h2 className="text-xl font-bold text-white mb-4">Questions Per Session</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="questions"
                    stroke="#00ffff"
                    strokeWidth={2}
                    dot={{ fill: '#00ffff', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Sessions List */}
          <div className="space-y-4">
            {sessions.length === 0 ? (
              <div className="glass-panel rounded-xl p-12 text-center">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-300 mb-2">
                  No sessions yet
                </h3>
                <p className="text-gray-500">
                  Start your first interview to see reports here
                </p>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session._id}
                  onClick={() => setSelectedSession(session)}
                  className="glass-panel rounded-xl p-6 cursor-pointer hover:border-neon-cyan transition-all border border-transparent"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            session.type === 'live'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}
                        >
                          {session.type === 'live' ? '🎯 LIVE' : '🎓 MOCK'}
                        </span>
                        {session.platform && (
                          <span className="px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-400">
                            {session.platform.toUpperCase()}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-semibold text-white mb-1">
                        {session.jobRole}
                      </h3>

                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>
                          📅 {new Date(session.startTime).toLocaleDateString()}
                        </span>
                        <span>
                          ⏱️ {formatDuration(session.duration)}
                        </span>
                        <span>
                          💬 {session.questions.length} questions
                        </span>
                      </div>
                    </div>

                    <div className="text-neon-cyan text-2xl">→</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Session Detail Modal */}
          {selectedSession && (
            <div
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedSession(null)}
            >
              <div
                className="glass-panel rounded-xl p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {selectedSession.jobRole}
                    </h2>
                    <p className="text-gray-400 text-sm">
                      {new Date(selectedSession.startTime).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedSession(null)}
                    className="text-gray-400 hover:text-white text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  {selectedSession.questions.map((q, i) => (
                    <div key={i} className="bg-gray-800/50 rounded-lg p-4">
                      <h4 className="font-semibold text-white mb-2">
                        {i + 1}. {q.question}
                      </h4>
                      <p className="text-gray-300 text-sm whitespace-pre-wrap">
                        {q.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
