import React, { useEffect, useState, useRef } from 'react';
import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';
import { ProjectMember } from '../../types';
import {
  Send,
  Hash,
  Users,
  Shield,
  User,
  Radio,
  Smile,
  Paperclip,
  Code,
  Copy,
  Check,
} from 'lucide-react';

interface ProjectChatViewProps {
  projectId: string;
  projectTitle: string;
  members: ProjectMember[];
}

export const ProjectChatView: React.FC<ProjectChatViewProps> = ({
  projectId,
  projectTitle,
  members,
}) => {
  const { user } = useAuthStore();
  const {
    messages,
    fetchMessages,
    connectWebSocket,
    disconnectWebSocket,
    sendMessage,
    isConnected,
    isLoading,
  } = useChatStore();

  const [inputContent, setInputContent] = useState('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages(projectId);
    connectWebSocket(projectId);

    return () => {
      disconnectWebSocket();
    };
  }, [projectId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputContent.trim();
    if (!trimmed) return;

    sendMessage(trimmed);
    setInputContent('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // Helper to format date header
  const formatDateHeader = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="w-full h-[700px] flex flex-col xl:flex-row elevation-1 rounded-xl overflow-hidden border border-[#292a2a] bg-[#080808]">
      {/* Center Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#080808] relative">
        {/* Chat Sub-Header */}
        <div className="h-14 border-b border-[#292a2a] bg-[#121414] px-6 flex justify-between items-center shrink-0 z-10">
          <div className="flex items-center gap-3">
            <Hash className="w-5 h-5 text-[#a5fa00]" />
            <h2 className="font-display text-base font-bold text-white tracking-tight">
              {projectTitle} — Dev Workspace Chat
            </h2>
          </div>

          <div className="flex items-center gap-2 font-mono-tag text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected
                  ? 'bg-[#a5fa00] shadow-[0_0_8px_rgba(165,250,0,0.8)]'
                  : 'bg-yellow-500'
              }`}
            ></span>
            <span className={isConnected ? 'text-[#a5fa00]' : 'text-yellow-500'}>
              {isConnected ? 'LIVE WS CONNECTED' : 'CONNECTING WS...'}
            </span>
          </div>
        </div>

        {/* Messages Canvas */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-[#080808] relative">
          {/* Subtle Grid Pattern Overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage: 'radial-gradient(#414a34 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          ></div>

          <div className="flex justify-center">
            <span className="font-mono-tag text-[10px] text-[#8b947a] uppercase tracking-widest px-3 py-1 rounded-full border border-[#292a2a] bg-[#121414]">
              Start of Project Chat History
            </span>
          </div>

          {messages.map((msg) => {
            const isSelf = msg.senderId === user?.id;
            const senderName = msg.sender?.name || (isSelf ? 'You' : 'Team Member');
            const formattedTime = new Date(msg.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            // Check if message content is code snippet (starts with ``` or contains code block)
            const isCodeBlock = msg.content.includes('```');

            return (
              <div
                key={msg.id}
                className={`flex gap-4 max-w-3xl relative z-10 ${
                  isSelf ? 'self-end flex-row-reverse ml-auto' : ''
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-full border flex items-center justify-center font-display font-bold text-xs shrink-0 mt-0.5 ${
                    isSelf
                      ? 'bg-[#1b1c1c] border-[#a5fa00] text-[#a5fa00]'
                      : 'bg-[#121414] border-[#292a2a] text-white'
                  }`}
                >
                  {senderName.charAt(0).toUpperCase()}
                </div>

                <div className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-sans text-xs font-semibold text-white">
                      {isSelf ? 'You' : senderName}
                    </span>
                    <span className="font-mono-tag text-[10px] text-[#8b947a]">
                      {formattedTime}
                    </span>
                  </div>

                  {isCodeBlock ? (
                    <div className="bg-[#0d0e0f] border border-[#292a2a] rounded-lg p-3 w-full font-mono-tag text-xs text-[#a5fa00] overflow-x-auto relative group">
                      <button
                        onClick={() => handleCopyCode(msg.content.replace(/```/g, ''), msg.id)}
                        className="absolute top-2 right-2 p-1.5 bg-[#1f2020] text-[#8b947a] hover:text-white rounded border border-[#292a2a] transition-colors"
                        title="Copy Code"
                      >
                        {copiedCodeId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-[#a5fa00]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <pre className="whitespace-pre-wrap font-mono-tag text-xs leading-relaxed pt-2">
                        {msg.content.replace(/```/g, '')}
                      </pre>
                    </div>
                  ) : (
                    <div
                      className={`font-sans text-sm p-3.5 rounded-2xl max-w-xl leading-relaxed shadow-sm border ${
                        isSelf
                          ? 'bg-[#1b1c1c] border-[#a5fa00]/40 text-white rounded-tr-none'
                          : 'bg-[#121414] border-[#292a2a] text-[#e3e2e2] rounded-tl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Composer Area */}
        <div className="p-4 border-t border-[#292a2a] bg-[#121414] relative z-20">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-end gap-3 bg-[#1b1c1c] border border-[#292a2a] focus-within:border-[#a5fa00] rounded-xl p-2.5 transition-colors">
            <textarea
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message #${projectTitle}... (Enter to send, Shift+Enter for new line)`}
              rows={1}
              className="w-full bg-transparent border-none text-white font-sans text-sm focus:outline-none focus:ring-0 resize-none p-1 placeholder-[#8b947a] max-h-28"
            />

            <button
              type="submit"
              disabled={!inputContent.trim()}
              className="bg-[#a5fa00] text-[#080808] p-2.5 rounded-lg hover:bg-[#b8ff33] disabled:opacity-40 transition-all shrink-0"
              title="Send Message"
            >
              <Send className="w-4 h-4 translate-x-0.5" />
            </button>
          </form>

          <div className="flex justify-between max-w-4xl mx-auto mt-2 px-2 font-mono-tag text-[10px] text-[#8b947a]">
            <span>Press <strong>Enter</strong> to send message</span>
            <span>Real-time text chat active</span>
          </div>
        </div>
      </div>

      {/* Right Sidebar: Online Project Team Members */}
      <aside className="w-full xl:w-64 border-t xl:border-t-0 xl:border-l border-[#292a2a] bg-[#121414] flex flex-col shrink-0">
        <div className="h-14 flex items-center px-5 border-b border-[#292a2a]">
          <h3 className="font-mono-tag text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#a5fa00] animate-pulse"></span>
            <span>Team Members ({members.length})</span>
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {members.map((m) => {
            const isLeader = m.role === 'LEADER';
            const memberName = m.user?.name || 'Developer';

            return (
              <div key={m.userId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#1b1c1c] transition-colors">
                <div className="relative w-8 h-8 shrink-0">
                  <div className="w-full h-full rounded-full bg-[#1b1c1c] border border-[#292a2a] flex items-center justify-center font-bold text-xs text-[#a5fa00]">
                    {memberName.charAt(0).toUpperCase()}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#a5fa00] border-2 border-[#121414] rounded-full"></span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-sans text-xs font-semibold text-white truncate">
                    {memberName}
                  </span>
                  <span className="font-mono-tag text-[10px] text-[#8b947a] flex items-center gap-1">
                    {isLeader ? (
                      <span className="text-[#a5fa00] font-bold">Project Leader</span>
                    ) : (
                      <span>Member</span>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
};
