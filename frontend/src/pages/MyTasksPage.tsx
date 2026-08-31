import React, { useEffect, useState } from 'react';
import { useTaskStore } from '../stores/taskStore';
import { Task, TaskPriority, TaskStatus } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import {
  CheckSquare,
  Calendar,
  Clock,
  CheckCircle2,
  ChevronRight,
  Filter,
  AlertCircle,
  ArrowUpRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const MyTasksPage: React.FC = () => {
  const { myTasks, fetchMyTasks, updateTask, isLoading } = useTaskStore();
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'TODO' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');

  useEffect(() => {
    fetchMyTasks();
  }, [fetchMyTasks]);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
      fetchMyTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTasks = myTasks.filter((task) => {
    if (statusFilter === 'ALL') return true;
    return task.status === statusFilter;
  });

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'HIGH':
        return (
          <span className="font-mono-tag text-[10px] text-red-400 border border-red-800/80 bg-red-950/40 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
            High Priority
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="font-mono-tag text-[10px] text-[#c9c6c5] border border-[#474646] bg-[#1f2020] px-2 py-0.5 rounded uppercase tracking-wider">
            Med Priority
          </span>
        );
      case 'LOW':
        return (
          <span className="font-mono-tag text-[10px] text-[#8b947a] border border-[#292a2a] px-2 py-0.5 rounded uppercase tracking-wider">
            Low Priority
          </span>
        );
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'TODO':
        return (
          <span className="status-badge-neutral">
            <span className="status-dot-neutral"></span> TODO
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="status-badge-active">
            <span className="status-dot-active"></span> IN PROGRESS
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#a5fa00] text-[#a5fa00] font-mono-tag text-xs uppercase bg-[#a5fa00]/10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#a5fa00]"></span> COMPLETED
          </span>
        );
    }
  };

  return (
    <div className="flex-1 w-full max-w-[1440px] mx-auto px-6 md:px-16 py-8 md:py-12">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-[#292a2a]">
        <div>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-white tracking-tight flex items-center gap-3">
            My Assigned Tasks
          </h1>
          <p className="font-sans text-base text-[#c0caad] mt-2">
            Centralized workspace for all development items assigned to your profile.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 bg-[#121414] p-1.5 rounded-lg border border-[#292a2a]">
          {(['ALL', 'TODO', 'IN_PROGRESS', 'COMPLETED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded font-mono-tag text-xs uppercase transition-colors ${
                statusFilter === tab
                  ? 'bg-[#a5fa00] text-[#080808] font-bold'
                  : 'text-[#c0caad] hover:text-white'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>
      </header>

      {isLoading && myTasks.length === 0 ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" label="Loading assigned tasks..." />
        </div>
      ) : filteredTasks.length > 0 ? (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="card-level-1 p-6 rounded-xl border border-[#292a2a] hover:border-[#a5fa00] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#1b1c1c] group"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono-tag text-xs text-[#8b947a]">
                    ID: {task.id.slice(-6)}
                  </span>
                  {getStatusBadge(task.status)}
                  {getPriorityBadge(task.priority)}
                </div>

                <h3 className="font-display font-bold text-lg text-white group-hover:text-[#a5fa00] transition-colors">
                  {task.title}
                </h3>

                {task.description && (
                  <p className="font-sans text-xs text-[#c0caad] line-clamp-2 max-w-3xl">
                    {task.description}
                  </p>
                )}

                <div className="flex items-center gap-6 pt-2 font-mono-tag text-xs text-[#8b947a]">
                  <Link
                    to={`/projects/${task.projectId}`}
                    className="text-[#a5fa00] hover:underline flex items-center gap-1"
                  >
                    <span>View Project Workspace</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>

                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      Deadline:{' '}
                      {task.deadline
                        ? new Date(task.deadline).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'None'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Update Quick Actions */}
              <div className="flex items-center gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-[#292a2a]">
                {task.status !== 'TODO' && (
                  <button
                    onClick={() => handleStatusChange(task.id, 'TODO')}
                    className="btn-secondary text-xs px-3 py-2"
                  >
                    Set TODO
                  </button>
                )}
                {task.status !== 'IN_PROGRESS' && (
                  <button
                    onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')}
                    className="px-3 py-2 bg-[#121414] hover:bg-[#a5fa00] text-[#a5fa00] hover:text-[#080808] border border-[#a5fa00]/60 rounded font-mono-tag text-xs font-bold transition-colors"
                  >
                    In Progress
                  </button>
                )}
                {task.status !== 'COMPLETED' && (
                  <button
                    onClick={() => handleStatusChange(task.id, 'COMPLETED')}
                    className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Complete</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-level-1 p-12 text-center flex flex-col items-center justify-center">
          <CheckSquare className="w-12 h-12 text-[#8b947a] mb-4" />
          <h3 className="font-display font-bold text-xl text-white">No Tasks Found</h3>
          <p className="font-sans text-xs text-[#c0caad] mt-2 max-w-md">
            You do not currently have any assigned tasks matching the "{statusFilter}" filter.
          </p>
        </div>
      )}
    </div>
  );
};
