'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import Navbar from '@/components/Navbar';

export default function PricingPage() {
  const router = useRouter();
  const { user, loading, userData } = useAuthStore();
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleUpgrade = async () => {
    if (!user) return;

    setUpgrading(true);

    try {
      // In production, you would create a Polar checkout session
      // For now, we'll simulate the upgrade
      const POLAR_CHECKOUT_URL = `https://polar.sh/checkout/${process.env.NEXT_PUBLIC_POLAR_ORGANIZATION_ID}/pro`;
      
      // Redirect to Polar checkout
      window.location.href = POLAR_CHECKOUT_URL;
    } catch (error) {
      console.error('Upgrade error:', error);
      setUpgrading(false);
    }
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
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
              Choose Your Plan
            </h1>
            <p className="text-gray-400 text-lg">
              Unlock unlimited interview assistance
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <div className="glass-panel rounded-2xl p-8 border-2 border-gray-800">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Free</h2>
                <div className="text-5xl font-bold mb-2">$0</div>
                <div className="text-gray-400">per month</div>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3 text-gray-300">
                  <span className="text-neon-cyan text-xl">✓</span>
                  <span>10 copilot answers per month</span>
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <span className="text-neon-cyan text-xl">✓</span>
                  <span>2 mock interviews per month</span>
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <span className="text-neon-cyan text-xl">✓</span>
                  <span>Basic question detection</span>
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <span className="text-neon-cyan text-xl">✓</span>
                  <span>Chrome extension access</span>
                </li>
                <li className="flex items-start gap-3 text-gray-400">
                  <span className="text-gray-600 text-xl">✗</span>
                  <span>Resume personalization</span>
                </li>
                <li className="flex items-start gap-3 text-gray-400">
                  <span className="text-gray-600 text-xl">✗</span>
                  <span>Unlimited answers</span>
                </li>
                <li className="flex items-start gap-3 text-gray-400">
                  <span className="text-gray-600 text-xl">✗</span>
                  <span>Full report history</span>
                </li>
              </ul>

              {userData?.plan === 'free' && (
                <div className="py-3 bg-gray-800 text-center rounded-lg text-gray-400 font-semibold">
                  Current Plan
                </div>
              )}
            </div>

            {/* Pro Plan */}
            <div className="glass-panel rounded-2xl p-8 border-2 border-neon-cyan relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-gradient-to-r from-neon-cyan to-neon-purple text-black text-xs font-bold px-3 py-1 rounded-full">
                POPULAR
              </div>

              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Pro</h2>
                <div className="text-5xl font-bold mb-2 bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
                  $19
                </div>
                <div className="text-gray-400">per month</div>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3 text-white">
                  <span className="text-neon-cyan text-xl">✓</span>
                  <span className="font-semibold">Unlimited copilot answers</span>
                </li>
                <li className="flex items-start gap-3 text-white">
                  <span className="text-neon-cyan text-xl">✓</span>
                  <span className="font-semibold">Unlimited mock interviews</span>
                </li>
                <li className="flex items-start gap-3 text-white">
                  <span className="text-neon-cyan text-xl">✓</span>
                  <span className="font-semibold">Resume personalization</span>
                </li>
                <li className="flex items-start gap-3 text-white">
                  <span className="text-neon-cyan text-xl">✓</span>
                  <span>Advanced question detection</span>
                </li>
                <li className="flex items-start gap-3 text-white">
                  <span className="text-neon-cyan text-xl">✓</span>
                  <span>All answer styles (STAR, Technical)</span>
                </li>
                <li className="flex items-start gap-3 text-white">
                  <span className="text-neon-cyan text-xl">✓</span>
                  <span>Full report history</span>
                </li>
                <li className="flex items-start gap-3 text-white">
                  <span className="text-neon-cyan text-xl">✓</span>
                  <span>Priority support</span>
                </li>
              </ul>

              {userData?.plan === 'pro' ? (
                <div className="py-3 bg-gradient-to-r from-neon-cyan to-neon-purple text-black text-center rounded-lg font-bold">
                  ⭐ Current Plan
                </div>
              ) : (
                <button
                  onClick={handleUpgrade}
                  disabled={upgrading}
                  className="w-full py-4 bg-gradient-to-r from-neon-cyan to-neon-purple text-black font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {upgrading ? 'Redirecting...' : 'Upgrade to Pro'}
                </button>
              )}
            </div>
          </div>

          {/* Features Comparison */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center mb-8 text-white">
              Why Upgrade to Pro?
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="glass-panel rounded-xl p-6 text-center">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-xl font-bold text-white mb-2">Unlimited Usage</h3>
                <p className="text-gray-400 text-sm">
                  No limits on answers or mock interviews. Practice as much as you need.
                </p>
              </div>

              <div className="glass-panel rounded-xl p-6 text-center">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-bold text-white mb-2">Personalized Answers</h3>
                <p className="text-gray-400 text-sm">
                  Answers tailored to your resume and experience for authentic responses.
                </p>
              </div>

              <div className="glass-panel rounded-xl p-6 text-center">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-bold text-white mb-2">Full Analytics</h3>
                <p className="text-gray-400 text-sm">
                  Track your performance over time with detailed reports and insights.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center mb-8 text-white">
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              <details className="glass-panel rounded-xl p-6">
                <summary className="font-semibold text-white cursor-pointer">
                  Can I cancel anytime?
                </summary>
                <p className="text-gray-400 mt-3 text-sm">
                  Yes! You can cancel your Pro subscription at any time. You'll retain access until the end of your billing period.
                </p>
              </details>

              <details className="glass-panel rounded-xl p-6">
                <summary className="font-semibold text-white cursor-pointer">
                  Is my data secure?
                </summary>
                <p className="text-gray-400 mt-3 text-sm">
                  Absolutely. We use Firebase authentication and encrypt all data. Your interview sessions are private and never shared.
                </p>
              </details>

              <details className="glass-panel rounded-xl p-6">
                <summary className="font-semibold text-white cursor-pointer">
                  Does the Chrome extension work on all platforms?
                </summary>
                <p className="text-gray-400 mt-3 text-sm">
                  Yes! Our extension supports Google Meet, Zoom web client, and Microsoft Teams. It works invisibly in the background.
                </p>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
