'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { auth } from '@/lib/firebase';
import Navbar from '@/components/Navbar';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Get started with the basics',
    color: '#6b7280',
    gradient: 'from-gray-500 to-gray-600',
    features: [
      { text: 'Unlimited copilot answers', included: true },
      { text: '3 mock interviews / month', included: true },
      { text: 'Basic question detection', included: true },
      { text: 'Chrome extension access', included: true },
      { text: 'Resume tailor (3 / month)', included: true },
      { text: 'STAR & technical answer styles', included: false },
      { text: 'Full interview report history', included: false },
      { text: 'Priority support', included: false },
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 9,
    period: 'month',
    description: 'For active job seekers',
    color: '#6366f1',
    gradient: 'from-indigo-500 to-violet-500',
    badge: 'MOST POPULAR',
    features: [
      { text: 'Unlimited copilot answers', included: true },
      { text: 'Unlimited mock interviews', included: true },
      { text: 'Advanced question detection', included: true },
      { text: 'Chrome extension access', included: true },
      { text: 'Unlimited resume tailoring', included: true },
      { text: 'STAR & technical answer styles', included: true },
      { text: 'Full interview report history', included: false },
      { text: 'Priority support', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    period: 'month',
    description: 'For professionals & power users',
    color: '#10b981',
    gradient: 'from-emerald-400 to-cyan-400',
    features: [
      { text: 'Everything in Starter', included: true },
      { text: 'Full interview report history', included: true },
      { text: 'Resume & answer personalization', included: true },
      { text: 'Multi-platform meeting support', included: true },
      { text: 'Tab audio transcription (Gemini)', included: true },
      { text: 'Export reports as PDF', included: true },
      { text: 'API access', included: true },
      { text: 'Priority support', included: true },
    ],
  },
];

export default function PricingPage() {
  const router = useRouter();
  const { user, loading, userData } = useAuthStore();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleUpgrade = async (planId: string) => {
    if (!user) { router.push('/'); return; }
    if (planId === 'free') return;

    setLoadingPlan(planId);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: planId }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(`Checkout error: ${err.error ?? 'Unknown error'}`);
        return;
      }

      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentPlan = userData?.plan ?? 'free';

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Simple, transparent pricing
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-muted)' }}>
            Start free. Upgrade when you need more.
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            const isPaid = plan.id !== 'free';

            return (
              <div
                key={plan.id}
                className="relative rounded-2xl flex flex-col overflow-hidden"
                style={{
                  background: 'var(--surface)',
                  border: `1px solid ${plan.badge ? plan.color + '50' : 'var(--border)'}`,
                  boxShadow: plan.badge ? `0 0 40px ${plan.color}18` : 'none',
                }}
              >
                {plan.badge && (
                  <div
                    className="absolute top-0 left-0 right-0 text-center text-xs font-bold py-1.5 tracking-widest"
                    style={{ background: `linear-gradient(90deg, ${plan.color}, #818cf8)`, color: 'white' }}
                  >
                    {plan.badge}
                  </div>
                )}

                <div className={`p-8 flex-1 ${plan.badge ? 'pt-10' : ''}`}>
                  {/* Plan name & price */}
                  <div className="mb-6">
                    <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                      {plan.name}
                    </h2>
                    <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                      {plan.description}
                    </p>
                    <div className="flex items-end gap-1">
                      <span className="text-5xl font-bold" style={{ color: plan.badge ? plan.color : 'var(--text-primary)' }}>
                        ${plan.price}
                      </span>
                      {isPaid && (
                        <span className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
                          / {plan.period}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <span
                          className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-xs"
                          style={{
                            background: f.included ? `${plan.color}20` : 'var(--surface-2)',
                            color: f.included ? plan.color : 'var(--text-muted)',
                          }}
                        >
                          {f.included ? '✓' : '✗'}
                        </span>
                        <span style={{ color: f.included ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                          {f.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <div className="px-8 pb-8">
                  {isCurrent ? (
                    <div
                      className="w-full py-3 rounded-xl text-sm font-semibold text-center"
                      style={{ background: `${plan.color}15`, color: plan.color, border: `1px solid ${plan.color}30` }}
                    >
                      ✓ Current Plan
                    </div>
                  ) : plan.id === 'free' ? (
                    <div
                      className="w-full py-3 rounded-xl text-sm font-semibold text-center"
                      style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                    >
                      Default Plan
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={loadingPlan === plan.id}
                      className="w-full py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-60"
                      style={{
                        background: `linear-gradient(135deg, ${plan.color}, #818cf8)`,
                        color: 'white',
                      }}
                    >
                      {loadingPlan === plan.id ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Redirecting…
                        </span>
                      ) : (
                        `Get ${plan.name} →`
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature comparison table */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-center mb-8" style={{ color: 'var(--text-primary)' }}>
            Why upgrade?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '🎙️', title: 'Dual audio detection', desc: 'Captures both your mic and the interviewer\'s voice via tab audio for complete question detection.' },
              { icon: '✏️', title: 'Resume tailoring', desc: 'AI rewrites your resume to match each job description while preserving your original format.' },
              { icon: '📊', title: 'Full report history', desc: 'Review every past session, track improvement, and export your interview reports.' },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-xl p-6 text-center"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div className="text-4xl mb-3">{f.icon}</div>
                <h3 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Setup note */}
        <p className="text-center mt-10 text-xs" style={{ color: 'var(--text-muted)' }}>
          Payments powered by{' '}
          <a href="https://polar.sh" target="_blank" rel="noopener noreferrer" className="underline">
            Polar.sh
          </a>
          . Cancel anytime. You keep access until the end of your billing period.
        </p>
      </div>
    </div>
  );
}
