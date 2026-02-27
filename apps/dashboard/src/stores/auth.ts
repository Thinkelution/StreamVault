import { create } from 'zustand';
import { authApi, type User } from '../api/client';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authApi.login(email, password);
      localStorage.setItem('sv_token', data.token);
      localStorage.setItem('sv_user', JSON.stringify(data.user));
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Invalid credentials';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('sv_token');
    localStorage.removeItem('sv_user');
    set({ user: null, token: null, isAuthenticated: false });
    window.location.href = '/login';
  },

  hydrate: () => {
    const token = localStorage.getItem('sv_token');
    const userStr = localStorage.getItem('sv_user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        set({ user, token, isAuthenticated: true });
      } catch {
        localStorage.removeItem('sv_token');
        localStorage.removeItem('sv_user');
      }
    }
  },
}));

useAuthStore.getState().hydrate();
