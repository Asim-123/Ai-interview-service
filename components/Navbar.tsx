'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/copilot', label: 'Live Assistant' },
  { href: '/mock-interview', label: 'Mock Interview' },
  { href: '/resume', label: 'Resume' },
  { href: '/reports', label: 'Reports' },
  { href: '/pricing', label: 'Pricing' },
];

export default function Navbar() {
  const { user, userData } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  return (
    <nav style={{ background: 'rgba(9,11,16,0.85)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 40 }}>
      <div className="container mx-auto px-6 py-0">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/copilot" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg accent-gradient flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="white" className="w-3.5 h-3.5">
                <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm1 14.93V17a1 1 0 0 0-2 0v-.07A8.004 8.004 0 0 1 4.07 11H5a1 1 0 0 0 0-2h-.93A8.004 8.004 0 0 1 11 4.07V5a1 1 0 0 0 2 0v-.93A8.004 8.004 0 0 1 19.93 11H19a1 1 0 0 0 0 2h.93A8.004 8.004 0 0 1 13 16.93z"/>
              </svg>
            </div>
            <span className="font-semibold text-sm hidden sm:block" style={{ color: 'var(--text-primary)' }}>Ghost Interviewer</span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            {NAV_ITEMS.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className="hidden md:block px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                  style={{
                    color: active ? 'var(--accent-light)' : 'var(--text-secondary)',
                    background: active ? 'rgba(99,102,241,0.1)' : 'transparent',
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          {/* User area */}
          {userData && (
            <div className="flex items-center gap-3">
              <span
                className="badge hidden sm:inline-flex items-center"
                style={
                  userData.plan === 'pro'
                    ? { background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)' }
                    : { background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
                }
              >
                {userData.plan === 'pro' ? 'PRO' : 'FREE'}
              </span>

              {user?.photoURL && (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="w-7 h-7 rounded-full"
                  style={{ border: '1px solid var(--border)' }}
                />
              )}

              <button
                onClick={handleSignOut}
                className="text-xs font-medium transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
