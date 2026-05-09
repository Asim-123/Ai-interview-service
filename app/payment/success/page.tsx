'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkoutId = searchParams.get('checkout_id');

  useEffect(() => {
    // Auto-redirect to copilot after 5 seconds
    const timer = setTimeout(() => {
      router.push('/copilot');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <div className="glass-panel rounded-2xl p-12">
            <div className="text-6xl mb-6">🎉</div>
            
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
              Welcome to Pro!
            </h1>
            
            <p className="text-xl text-gray-300 mb-8">
              Your subscription is now active. You have unlimited access to all features!
            </p>

            <div className="space-y-3 mb-8 text-left max-w-md mx-auto">
              <div className="flex items-center gap-3 text-gray-300">
                <span className="text-neon-cyan text-2xl">✓</span>
                <span>Unlimited copilot answers</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <span className="text-neon-cyan text-2xl">✓</span>
                <span>Unlimited mock interviews</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <span className="text-neon-cyan text-2xl">✓</span>
                <span>Resume personalization</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <span className="text-neon-cyan text-2xl">✓</span>
                <span>Full report history</span>
              </div>
            </div>

            <button
              onClick={() => router.push('/copilot')}
              className="px-8 py-4 bg-gradient-to-r from-neon-cyan to-neon-purple text-black font-bold rounded-lg hover:opacity-90 transition-opacity"
            >
              Go to Copilot
            </button>

            <p className="text-sm text-gray-500 mt-6">
              Redirecting automatically in 5 seconds...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
