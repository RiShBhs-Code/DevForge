import { create } from 'zustand';
import { ChatMessage, WSMessageEvent } from '../types';
import { apiRequest } from '../services/api';

interface ChatState {
  messages: ChatMessage[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  activeSocket: WebSocket | null;

  fetchMessages: (projectId: string) => Promise<ChatMessage[]>;
  connectWebSocket: (projectId: string) => void;
  disconnectWebSocket: () => void;
  sendMessage: (content: string) => void;
  appendMessage: (msg: ChatMessage) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isConnected: false,
  isLoading: false,
  error: null,
  activeSocket: null,

  fetchMessages: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiRequest<ChatMessage[]>(`/projects/${projectId}/messages`);
      set({ messages: data, isLoading: false });
      return data;
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch messages', isLoading: false });
      return [];
    }
  },

  connectWebSocket: (projectId) => {
    const existingSocket = get().activeSocket;
    if (existingSocket) {
      existingSocket.close();
    }

    const token = localStorage.getItem('devforge_token');
    if (!token) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = import.meta.env.VITE_WS_URL || `${protocol}//${window.location.hostname}:8080`;
    const wsUrl = `${host}/ws/projects/${projectId}?token=${encodeURIComponent(token)}`;

    try {
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        set({ isConnected: true, activeSocket: socket, error: null });
      };

      socket.onmessage = (event) => {
        try {
          const parsed: WSMessageEvent = JSON.parse(event.data);
          if (parsed.type === 'message:new' && parsed.payload) {
            get().appendMessage(parsed.payload as ChatMessage);
          }
        } catch (e) {
          console.error('Failed to parse WebSocket message', e);
        }
      };

      socket.onerror = () => {
        set({ isConnected: false, error: 'WebSocket connection error' });
      };

      socket.onclose = () => {
        set({ isConnected: false, activeSocket: null });
      };

      set({ activeSocket: socket });
    } catch (err: any) {
      set({ isConnected: false, error: err.message || 'Failed to connect WebSocket' });
    }
  },

  disconnectWebSocket: () => {
    const socket = get().activeSocket;
    if (socket) {
      socket.close();
      set({ activeSocket: null, isConnected: false });
    }
  },

  sendMessage: (content) => {
    const socket = get().activeSocket;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ content }));
    }
  },

  appendMessage: (msg) => {
    set((state) => {
      // Prevent duplicate messages if already appended
      if (state.messages.some((m) => m.id === msg.id)) {
        return state;
      }
      return { messages: [...state.messages, msg] };
    });
  },
}));
