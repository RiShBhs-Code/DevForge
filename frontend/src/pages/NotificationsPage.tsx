import React, { useEffect, useState } from 'react';
import { useNotificationStore } from '../stores/notificationStore';
import { NotificationItem, NotificationType } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import {
  Bell,
  CheckCircle2,
  CheckSquare,
  UserPlus,
  MessageSquare,
  AlertCircle,
  CheckCheck,
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    isLoading,
  } = useNotificationStore();

  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filteredNotifs = notifications.filter((item) => {
    if (filter === 'UNREAD') return !item.read;
    return true;
  });

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'MEMBER_ADDED':
        return <UserPlus className="w-5 h-5 text-[#a5fa00]" />;
      case 'TASK_ASSIGNED':
        return <CheckSquare className="w-5 h-5 text-[#a5fa00]" />;
      case 'TASK_COMPLETED':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'CHAT_MESSAGE':
        return <MessageSquare className="w-5 h-5 text-sky-400" />;
      default:
        return <Bell className="w-5 h-5 text-[#a5fa00]" />;
    }
  };

  return (
    <div className="flex-1 w-full max-w-[1440px] mx-auto px-6 md:px-16 py-8 md:py-12">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-[#292a2a]">
        <div>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Notifications Center
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#a5fa00] text-[#080808] font-mono-tag text-xs font-bold">
                {unreadCount} Unread
              </span>
            )}
          </h1>
          <p className="font-sans text-base text-[#c0caad] mt-2">
            Real-time activity logs, team invitations, and task event notifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="btn-secondary text-xs flex items-center gap-2 py-2 px-4"
            >
              <CheckCheck className="w-4 h-4 text-[#a5fa00]" />
              <span>Mark All as Read</span>
            </button>
          )}

          {/* Filter Tabs */}
          <div className="flex gap-2 bg-[#121414] p-1.5 rounded-lg border border-[#292a2a]">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 rounded font-mono-tag text-xs uppercase transition-colors ${
                filter === 'ALL'
                  ? 'bg-[#a5fa00] text-[#080808] font-bold'
                  : 'text-[#c0caad] hover:text-white'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('UNREAD')}
              className={`px-3 py-1.5 rounded font-mono-tag text-xs uppercase transition-colors ${
                filter === 'UNREAD'
                  ? 'bg-[#a5fa00] text-[#080808] font-bold'
                  : 'text-[#c0caad] hover:text-white'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>
      </header>

      {/* Notifications List */}
      {isLoading && notifications.length === 0 ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" label="Loading notifications..." />
        </div>
      ) : filteredNotifs.length > 0 ? (
        <div className="space-y-3">
          {filteredNotifs.map((item) => {
            const formattedDate = new Date(item.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={item.id}
                onClick={() => !item.read && markAsRead(item.id)}
                className={`p-5 rounded-xl border transition-all flex items-start justify-between gap-4 cursor-pointer ${
                  item.read
                    ? 'bg-[#121414] border-[#292a2a] opacity-80 hover:opacity-100'
                    : 'bg-[#1b1c1c] border-[#a5fa00]/50 shadow-[inset_0_0_10px_rgba(165,250,0,0.05)]'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#121414] border border-[#292a2a] flex items-center justify-center shrink-0 mt-0.5">
                    {getNotificationIcon(item.type)}
                  </div>

                  <div className="space-y-1">
                    <p className={`font-sans text-sm ${item.read ? 'text-[#c0caad]' : 'text-white font-semibold'}`}>
                      {item.message}
                    </p>
                    <span className="font-mono-tag text-[11px] text-[#8b947a] block">
                      {formattedDate}
                    </span>
                  </div>
                </div>

                {!item.read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(item.id);
                    }}
                    className="p-1.5 text-[#a5fa00] hover:text-[#b8ff33] font-mono-tag text-xs flex items-center gap-1 shrink-0"
                    title="Mark as read"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#a5fa00]"></span>
                    <span>Unread</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card-level-1 p-12 text-center flex flex-col items-center justify-center">
          <Bell className="w-12 h-12 text-[#8b947a] mb-4" />
          <h3 className="font-display font-bold text-xl text-white">No Notifications</h3>
          <p className="font-sans text-xs text-[#c0caad] mt-2 max-w-md">
            You do not currently have any notifications in this view.
          </p>
        </div>
      )}
    </div>
  );
};
