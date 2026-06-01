import { create } from 'zustand';
import type { AuthResponse } from '../types';

interface AuthState {
  user: AuthResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (data: AuthResponse) => void;
  logout: () => void;
  initialize: () => void;
}

const AUTH_KEY = 'zentask-auth';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: () => {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AuthResponse;
        set({ user: parsed, isAuthenticated: true, isLoading: false });
      } catch {
        localStorage.removeItem(AUTH_KEY);
        set({ isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },

  setAuth: (data) => {
    localStorage.setItem(AUTH_KEY, JSON.stringify(data));
    set({ user: data, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem(AUTH_KEY);
    set({ user: null, isAuthenticated: false });
  },
}));
