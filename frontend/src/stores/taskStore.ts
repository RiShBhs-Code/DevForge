import { create } from 'zustand';
import { Task, CreateTaskPayload, UpdateTaskPayload } from '../types';
import { apiRequest } from '../services/api';

interface TaskState {
  tasks: Task[];
  myTasks: Task[];
  isLoading: boolean;
  error: string | null;

  fetchProjectTasks: (projectId: string, statusFilter?: string) => Promise<Task[]>;
  fetchMyTasks: (statusFilter?: string) => Promise<Task[]>;
  createTask: (projectId: string, payload: CreateTaskPayload) => Promise<Task>;
  updateTask: (taskId: string, payload: UpdateTaskPayload) => Promise<Task>;
  deleteTask: (taskId: string) => Promise<void>;
  clearError: () => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  myTasks: [],
  isLoading: false,
  error: null,

  fetchProjectTasks: async (projectId, statusFilter) => {
    set({ isLoading: true, error: null });
    try {
      const endpoint = statusFilter
        ? `/projects/${projectId}/tasks?status=${statusFilter}`
        : `/projects/${projectId}/tasks`;
      const data = await apiRequest<Task[]>(endpoint);
      set({ tasks: data, isLoading: false });
      return data;
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch project tasks', isLoading: false });
      return [];
    }
  },

  fetchMyTasks: async (statusFilter) => {
    set({ isLoading: true, error: null });
    try {
      const endpoint = statusFilter ? `/tasks/my?status=${statusFilter}` : '/tasks/my';
      const data = await apiRequest<Task[]>(endpoint);
      set({ myTasks: data, isLoading: false });
      return data;
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch assigned tasks', isLoading: false });
      return [];
    }
  },

  createTask: async (projectId, payload) => {
    set({ isLoading: true, error: null });
    try {
      const newTask = await apiRequest<Task>(`/projects/${projectId}/tasks`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      set((state) => ({
        tasks: [...state.tasks, newTask],
        isLoading: false,
      }));
      return newTask;
    } catch (err: any) {
      set({ error: err.message || 'Failed to create task', isLoading: false });
      throw err;
    }
  },

  updateTask: async (taskId, payload) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await apiRequest<Task>(`/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === taskId ? updated : t)),
        myTasks: state.myTasks.map((t) => (t.id === taskId ? updated : t)),
        isLoading: false,
      }));
      return updated;
    } catch (err: any) {
      set({ error: err.message || 'Failed to update task', isLoading: false });
      throw err;
    }
  },

  deleteTask: async (taskId) => {
    set({ isLoading: true, error: null });
    try {
      await apiRequest(`/tasks/${taskId}`, {
        method: 'DELETE',
      });
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== taskId),
        myTasks: state.myTasks.filter((t) => t.id !== taskId),
        isLoading: false,
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete task', isLoading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
