import { create } from 'zustand';
import { ProjectMember } from '../types';
import { apiRequest } from '../services/api';

interface MemberState {
  members: ProjectMember[];
  isLoading: boolean;
  error: string | null;

  fetchMembers: (projectId: string) => Promise<ProjectMember[]>;
  addMember: (projectId: string, email: string) => Promise<ProjectMember>;
  removeMember: (projectId: string, userId: string) => Promise<void>;
  clearError: () => void;
}

export const useMemberStore = create<MemberState>((set) => ({
  members: [],
  isLoading: false,
  error: null,

  fetchMembers: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiRequest<ProjectMember[]>(`/projects/${projectId}/members`);
      set({ members: data, isLoading: false });
      return data;
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch project members', isLoading: false });
      return [];
    }
  },

  addMember: async (projectId, email) => {
    set({ isLoading: true, error: null });
    try {
      const newMember = await apiRequest<ProjectMember>(`/projects/${projectId}/members`, {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      set((state) => ({
        members: [...state.members, newMember],
        isLoading: false,
      }));
      return newMember;
    } catch (err: any) {
      set({ error: err.message || 'Failed to add member', isLoading: false });
      throw err;
    }
  },

  removeMember: async (projectId, userId) => {
    set({ isLoading: true, error: null });
    try {
      await apiRequest(`/projects/${projectId}/members/${userId}`, {
        method: 'DELETE',
      });
      set((state) => ({
        members: state.members.filter((m) => m.userId !== userId),
        isLoading: false,
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to remove member', isLoading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
