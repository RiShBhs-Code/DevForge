import { create } from 'zustand';
import { User, AuthResponse } from '../types';
import { apiRequest } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  fetchMe: () => Promise<void>;
  updateProfile: (name: string, email: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('devforge_token'),
  isAuthenticated: !!localStorage.getItem('devforge_token'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('devforge_token', res.token);
      set({
        user: res.user,
        token: res.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to login', isLoading: false });
      throw err;
    }
  },

  register: async (name, email, password, role) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiRequest<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role }),
      });
      localStorage.setItem('devforge_token', res.token);
      set({
        user: res.user,
        token: res.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to register', isLoading: false });
      throw err;
    }
  },

  fetchMe: async () => {
    const token = get().token;
    if (!token) return;

    set({ isLoading: true, error: null });
    try {
      const user = await apiRequest<User>('/auth/me');
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      localStorage.removeItem('devforge_token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  updateProfile: async (name, email) => {
    set({ isLoading: true, error: null });
    try {
      const updatedUser = await apiRequest<User>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ name, email }),
      });
      set({ user: updatedUser, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to update profile', isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('devforge_token');
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  clearError: () => set({ error: null }),
}));
