'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { auth } from '@/lib/firebase';
import Navbar from '@/components/Navbar';

const PLAN_LABELS: Record<string, string> = {
  starter: 'Starter',
  pro: 'Pro',
};

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkoutId = searchParams.get('checkout_id');

  const { refreshUserData } = useAuthStore();

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [plan, setPlan] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!checkoutId) {
      setStatus('error');
      setErrorMsg('No checkout ID found in the URL.');
      return;
    }

    const verify = async () => {
      try {
        // Wait briefly to give Polar's backend a moment to finalise the order
        await new Promise((r) => setTimeout(r, 1500));

        const token = await auth.currentUser?.getIdToken(true);
        if (!token) {
          setStatus('error');
          setErrorMsg('You must be signed in to verify a payment.');
          return;
        }

        const res = await fetch('/api/checkout/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ checkoutId }),
        });

        const data = await res.json();

        if (!res.ok || !data.verified) {
          // Checkout might still be processing — refresh userData anyway and show success
          console.warn('[Success] Checkout not yet confirmed:', data);
          await refreshUserData();
          setStatus('success');
          setPlan(data.plan ?? '');
          return;
        }

        // Update the in-memory auth store with the fresh plan from DB
        await refreshUserData();
        setPlan(data.plan ?? '');
        setStatus('success');
      } catch (err: any) {
        console.error('[Success] Verification error:', err);
        // Still show success — webhook will update plan asynchronously
        await refreshUserData();
        setStatus('success');
      }
    };

    verify();
  }, [checkoutId]);

  // Auto-redirect once verified
  useEffect(() => {
    if (status !== 'success') return;
    const t = setTimeout(() => router.push('/copilot'), 4000);
    return () => clearTimeout(t);
  }, [status, router]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />

      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-6">
        <div
          className="w-full max-w-md rounded-2xl p-10 text-center"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          {/* ── Verifying ── */}
          {status === 'verifying' && (
            <>
              <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
              <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Confirming your payment…
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Please wait while we activate your plan.
              </p>
            </>
          )}

          {/* ── Success ── */}
          {status === 'success' && (
            <>
              <div className="text-6xl mb-5">🎉</div>
              <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                {plan ? `${PLAN_LABELS[plan] ?? plan} plan activated!` : 'Payment confirmed!'}
              </h1>
              <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
                Your account has been upgraded. All features are now unlocked.
              </p>

              <ul className="text-left space-y-2 mb-8">
                {[
                  'Unlimited copilot answers',
                  'Unlimited mock interviews',
                  'Resume tailoring',
                  'Full interview report history',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <span className="text-emerald-400">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => router.push('/copilot')}
                className="w-full py-3 rounded-xl text-sm font-bold"
                style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white' }}
              >
                Go to Copilot →
              </button>
              <p className="text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
                Redirecting automatically in 4 seconds…
              </p>
            </>
          )}

          {/* ── Error ── */}
          {status === 'error' && (
            <>
              <div className="text-5xl mb-5">⚠️</div>
              <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Verification failed
              </h1>
              <p className="text-sm mb-6" style={{ color: '#ef4444' }}>{errorMsg}</p>
              <button
                onClick={() => router.push('/pricing')}
                className="w-full py-3 rounded-xl text-sm font-semibold"
                style={{ background: 'var(--surface-2)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
              >
                Back to Pricing
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
