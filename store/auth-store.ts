import { create } from 'zustand';
import { User, getIdToken } from 'firebase/auth';

interface AuthState {
  user: User | null;
  userData: any | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setUserData: (userData: any) => void;
  setLoading: (loading: boolean) => void;
  refreshUserData: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  userData: null,
  loading: true,
  setUser: (user) => set({ user }),
  setUserData: (userData) => set({ userData }),
  setLoading: (loading) => set({ loading }),

  refreshUserData: async () => {
    const { user } = get();
    if (!user) return;
    try {
      const token = await getIdToken(user, /* forceRefresh */ true);
      const res = await fetch('/api/auth/user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const fresh = await res.json();
        set({ userData: fresh });
      }
    } catch (err) {
      console.error('[AuthStore] refreshUserData error:', err);
    }
  },
}));
