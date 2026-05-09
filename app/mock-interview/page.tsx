'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { auth } from '@/lib/firebase';
import Navbar from '@/components/Navbar';

interface Question {
  question: string;
  userAnswer: string;
  evaluation?: string;
}

export default function MockInterviewPage() {
  const router = useRouter();
  const { user, loading, userData } = useAuthStore();
  const [stage, setStage] = useState<'setup' | 'interview' | 'results'>('setup');
  const [jobRole, setJobRole] = useState('Software Engineer');
  const [level, setLevel] = useState('Mid-level');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [generating, setGenerating] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const generateQuestions = async () => {
    setGenerating(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const response = await fetch('/api/mock/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobRole,
          level,
          count: 10,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setQuestions(
          data.questions.map((q: string) => ({
            question: q,
            userAnswer: '',
          }))
        );
        setStage('interview');
      } else {
        alert('Failed to generate questions');
      }
    } catch (error) {
      console.error('Generation error:', error);
      alert('Error generating questions');
    } finally {
      setGenerating(false);
    }
  };

  const handleNextQuestion = () => {
    if (!currentAnswer.trim()) {
      alert('Please provide an answer');
      return;
    }

    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex].userAnswer = currentAnswer;
    setQuestions(updatedQuestions);
    setCurrentAnswer('');

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      evaluateAllAnswers(updatedQuestions);
    }
  };

  const handleSkip = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentAnswer('');
    } else {
      evaluateAllAnswers(questions);
    }
  };

  const evaluateAllAnswers = async (allQuestions: Question[]) => {
    setEvaluating(true);
    setStage('results');

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const evaluatedQuestions = [...allQuestions];

      for (let i = 0; i < evaluatedQuestions.length; i++) {
        if (evaluatedQuestions[i].userAnswer) {
          const response = await fetch('/api/mock/evaluate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              question: evaluatedQuestions[i].question,
              answer: evaluatedQuestions[i].userAnswer,
              jobRole,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            evaluatedQuestions[i].evaluation = data.evaluation;
            setQuestions([...evaluatedQuestions]);
          }
        }
      }
    } catch (error) {
      console.error('Evaluation error:', error);
    } finally {
      setEvaluating(false);
    }
  };

  const handleRestart = () => {
    setStage('setup');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setCurrentAnswer('');
  };

  if (loading) {
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
        <div className="max-w-4xl mx-auto">
          {stage === 'setup' && (
            <>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
                Mock Interview
              </h1>
              <p className="text-gray-400 mb-8">
                Practice with AI-generated interview questions
              </p>

              <div className="glass-panel rounded-xl p-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Job Role
                    </label>
                    <input
                      type="text"
                      value={jobRole}
                      onChange={(e) => setJobRole(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-neon-cyan transition-colors"
                      placeholder="e.g. Senior Frontend Engineer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Experience Level
                    </label>
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-neon-cyan transition-colors"
                    >
                      <option value="Entry-level">Entry-level</option>
                      <option value="Mid-level">Mid-level</option>
                      <option value="Senior">Senior</option>
                      <option value="Lead">Lead</option>
                    </select>
                  </div>

                  <button
                    onClick={generateQuestions}
                    disabled={generating}
                    className="w-full py-4 bg-gradient-to-r from-neon-cyan to-neon-purple text-black font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {generating ? 'Generating Questions...' : 'Start Mock Interview'}
                  </button>
                </div>
              </div>
            </>
          )}

          {stage === 'interview' && questions.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-white">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </h1>
                <div className="text-sm text-gray-400">
                  {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete
                </div>
              </div>

              <div className="glass-panel rounded-xl p-8 mb-6">
                <h2 className="text-xl font-semibold text-white mb-6">
                  {questions[currentQuestionIndex].question}
                </h2>

                <textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full h-64 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan transition-colors resize-none"
                />

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleSkip}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Skip
                  </button>
                  <button
                    onClick={handleNextQuestion}
                    className="flex-1 py-3 bg-gradient-to-r from-neon-cyan to-neon-purple text-black font-bold rounded-lg hover:opacity-90 transition-opacity"
                  >
                    {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Interview'}
                  </button>
                </div>
              </div>

              <div className="flex gap-2 justify-center">
                {questions.map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded-full transition-colors ${
                      i <= currentQuestionIndex ? 'bg-neon-cyan' : 'bg-gray-800'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {stage === 'results' && (
            <>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
                Interview Results
              </h1>
              <p className="text-gray-400 mb-8">
                {evaluating ? 'Evaluating your answers...' : 'Here\'s your feedback'}
              </p>

              <div className="space-y-6 mb-8">
                {questions.map((q, i) => (
                  <div key={i} className="glass-panel rounded-xl p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white flex-1">
                        {i + 1}. {q.question}
                      </h3>
                    </div>

                    {q.userAnswer ? (
                      <>
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-400 mb-2">Your Answer:</h4>
                          <p className="text-gray-300 whitespace-pre-wrap">{q.userAnswer}</p>
                        </div>

                        {q.evaluation ? (
                          <div className="bg-neon-cyan/10 border border-neon-cyan rounded-lg p-4">
                            <h4 className="text-sm font-medium text-neon-cyan mb-2">Feedback:</h4>
                            <p className="text-gray-300 text-sm">{q.evaluation}</p>
                          </div>
                        ) : evaluating ? (
                          <div className="flex items-center gap-2 text-gray-400">
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-neon-cyan"></div>
                            <span className="text-sm">Evaluating...</span>
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <p className="text-gray-500 italic">Skipped</p>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={handleRestart}
                className="w-full py-4 bg-gradient-to-r from-neon-cyan to-neon-purple text-black font-bold rounded-lg hover:opacity-90 transition-opacity"
              >
                Start New Mock Interview
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
