'use client';

import { create } from 'zustand';
import { setCookie, deleteCookie, getCookie } from 'cookies-next';
import { apiFetch } from '@/lib/api';

interface State {
  isLoggedIn: boolean;
  isAuthInitialized: boolean; // New state
}

interface Actions {
  actions: {
    login: (token: string) => void;
    logout: () => void;
    initializeAuth: () => Promise<void>;
  };
}

export const useAuthStore = create<State & Actions>((set) => ({
  isLoggedIn: false,
  isAuthInitialized: false, // Initial value
  actions: {
    login: (token: string) => {
      setCookie('accessToken', token, { maxAge: 60 * 60 * 24 });
      set({ isLoggedIn: true });
    },
    logout: async () => {
      try {
        await apiFetch('/auth/logout', { method: 'POST' });
      } catch (error) {
        console.error('Logout API call failed', error);
      } finally {
        deleteCookie('accessToken');
        set({ isLoggedIn: false });
      }
    },
    initializeAuth: async () => {
      try {
        const token = getCookie('accessToken');
        if (token) {
          set({ isLoggedIn: true });
        }
      } catch (err) {
        // It's okay if this fails
        console.error(err);
      } finally {
        set({ isAuthInitialized: true }); // Set to true after check
      }
    },
  },
}));