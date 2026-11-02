import { create } from 'zustand';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const useAuthStore = create((set, get) => ({
  accessToken: null,
  user: null,
  status: 'idle', // 'idle' | 'loading' | 'authenticated' | 'unauthenticated'
  error: null,

  login: async (email, password) => {
    set({ status: 'loading', error: null });
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // sends and receives cookies
        body: JSON.stringify({ email, password }),
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error || 'Login failed');
      }

      set({
        accessToken: body.accessToken,
        user: body.user,
        status: 'authenticated',
        error: null,
      });
      return true;
    } catch (err) {
      set({ status: 'unauthenticated', error: err.message });
      return false;
    }
  },

  refresh: async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        set({ accessToken: null, user: null, status: 'unauthenticated' });
        return false;
      }

      const body = await res.json();
      set({
        accessToken: body.accessToken,
        user: body.user,
        status: 'authenticated',
      });
      return true;
    } catch {
      set({ accessToken: null, user: null, status: 'unauthenticated' });
      return false;
    }
  },

  logout: async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // ignore network errors on logout
    } finally {
      set({ accessToken: null, user: null, status: 'unauthenticated' });
    }
  },
}));

