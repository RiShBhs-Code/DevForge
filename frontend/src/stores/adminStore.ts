import { create } from 'zustand';
import { User, Project, UserRole } from '../types';
import { apiRequest } from '../services/api';

export interface PlatformStats {
  totalUsers: number;
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  activeProjects: number;
}

interface AdminState {
  stats: PlatformStats | null;
  users: User[];
  projects: Project[];
  isLoading: boolean;
  error: string | null;

  fetchStats: () => Promise<PlatformStats | null>;
  fetchUsers: () => Promise<User[]>;
  updateUserRole: (userId: string, role: UserRole) => Promise<User>;
  deleteUser: (userId: string) => Promise<void>;
  fetchProjects: () => Promise<Project[]>;
  deleteProject: (projectId: string) => Promise<void>;
  clearError: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  stats: null,
  users: [],
  projects: [],
  isLoading: false,
  error: null,

  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiRequest<PlatformStats>('/admin/stats');
      set({ stats: data, isLoading: false });
      return data;
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch platform stats', isLoading: false });
      return null;
    }
  },

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiRequest<User[]>('/admin/users');
      set({ users: data, isLoading: false });
      return data;
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch users', isLoading: false });
      return [];
    }
  },

  updateUserRole: async (userId, role) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await apiRequest<User>(`/admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      });
      set((state) => ({
        users: state.users.map((u) => (u.id === userId ? updated : u)),
        isLoading: false,
      }));
      return updated;
    } catch (err: any) {
      set({ error: err.message || 'Failed to update user role', isLoading: false });
      throw err;
    }
  },

  deleteUser: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      await apiRequest(`/admin/users/${userId}`, {
        method: 'DELETE',
      });
      set((state) => ({
        users: state.users.filter((u) => u.id !== userId),
        isLoading: false,
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete user', isLoading: false });
      throw err;
    }
  },

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiRequest<Project[]>('/admin/projects');
      set({ projects: data, isLoading: false });
      return data;
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch projects', isLoading: false });
      return [];
    }
  },

  deleteProject: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      await apiRequest(`/admin/projects/${projectId}`, {
        method: 'DELETE',
      });
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== projectId),
        isLoading: false,
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete project', isLoading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
