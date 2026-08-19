import { create } from 'zustand';
import { Project, CreateProjectPayload, UpdateProjectPayload } from '../types';
import { apiRequest } from '../services/api';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;

  fetchProjects: (statusFilter?: string) => Promise<void>;
  fetchProjectById: (id: string) => Promise<Project>;
  createProject: (payload: CreateProjectPayload) => Promise<Project>;
  updateProject: (id: string, payload: UpdateProjectPayload) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  clearCurrentProject: () => void;
  clearError: () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,

  fetchProjects: async (statusFilter) => {
    set({ isLoading: true, error: null });
    try {
      const endpoint = statusFilter ? `/projects?status=${statusFilter}` : '/projects';
      const data = await apiRequest<Project[]>(endpoint);
      set({ projects: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch projects', isLoading: false });
    }
  },

  fetchProjectById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiRequest<Project>(`/projects/${id}`);
      set({ currentProject: data, isLoading: false });
      return data;
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch project details', isLoading: false });
      throw err;
    }
  },

  createProject: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const newProj = await apiRequest<Project>('/projects', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      set((state) => ({
        projects: [newProj, ...state.projects],
        isLoading: false,
      }));
      return newProj;
    } catch (err: any) {
      set({ error: err.message || 'Failed to create project', isLoading: false });
      throw err;
    }
  },

  updateProject: async (id, payload) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await apiRequest<Project>(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? updated : p)),
        currentProject: state.currentProject?.id === id ? updated : state.currentProject,
        isLoading: false,
      }));
      return updated;
    } catch (err: any) {
      set({ error: err.message || 'Failed to update project', isLoading: false });
      throw err;
    }
  },

  deleteProject: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiRequest(`/projects/${id}`, {
        method: 'DELETE',
      });
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        currentProject: state.currentProject?.id === id ? null : state.currentProject,
        isLoading: false,
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete project', isLoading: false });
      throw err;
    }
  },

  clearCurrentProject: () => set({ currentProject: null }),
  clearError: () => set({ error: null }),
}));
