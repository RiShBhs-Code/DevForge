import React, { useState } from 'react';
import { Task, TaskPriority, TaskStatus, ProjectMember } from '../../types';
import { useTaskStore } from '../../stores/taskStore';
import { CreateTaskModal } from './CreateTaskModal';
import { EditTaskModal } from './EditTaskModal';
import {
  Search,
  Plus,
  Filter,
  User,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreHorizontal,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

interface KanbanBoardProps {
  projectId: string;
  tasks: Task[];
  members: ProjectMember[];
  isLeaderOrAdmin: boolean;
  onTasksUpdated: () => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  projectId,
  tasks,
  members,
  isLeaderOrAdmin,
  onTasksUpdated,
}) => {
  const { updateTask } = useTaskStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPriority =
      priorityFilter === 'ALL' || task.priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  const todoTasks = filteredTasks.filter((t) => t.status === 'TODO');
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'IN_PROGRESS');
  const completedTasks = filteredTasks.filter((t) => t.status === 'COMPLETED');

  const handleStatusQuickMove = async (
    e: React.MouseEvent,
    task: Task,
    newStatus: TaskStatus
  ) => {
    e.stopPropagation();
    try {
      await updateTask(task.id, { status: newStatus });
      onTasksUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'HIGH':
        return (
          <span className="font-mono-tag text-[10px] text-red-400 border border-red-800/80 bg-red-950/40 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
            High
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="font-mono-tag text-[10px] text-[#c9c6c5] border border-[#474646] bg-[#1f2020] px-1.5 py-0.5 rounded uppercase tracking-wider">
            Med
          </span>
        );
      case 'LOW':
        return (
          <span className="font-mono-tag text-[10px] text-[#8b947a] border border-[#292a2a] px-1.5 py-0.5 rounded uppercase tracking-wider">
            Low
          </span>
        );
    }
  };

  return (
    <div className="w-full flex flex-col h-full space-y-6">
      {/* Board Controls & Filter Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#121414] p-4 rounded-xl border border-[#292a2a]">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#8b947a]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks by title..."
              className="w-full pl-9 pr-4 py-1.5 bg-[#1b1c1c] border border-[#292a2a] rounded text-white text-xs font-sans focus:outline-none focus:border-[#a5fa00] transition-colors"
            />
          </div>

          {/* Priority Filter */}
          <div className="relative">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-1.5 bg-[#1b1c1c] border border-[#292a2a] rounded text-white text-xs font-mono-tag focus:outline-none focus:border-[#a5fa00]"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>
        </div>

        {isLeaderOrAdmin && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary text-xs flex items-center gap-1.5 py-2 px-4 shadow-md w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Task</span>
          </button>
        )}
      </div>

      {/* Kanban Board Columns Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start pb-8">
        {/* Column 1: TODO */}
        <div className="elevation-1 rounded-xl p-4 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#292a2a]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8b947a]"></span>
              <h3 className="font-mono-tag text-xs font-bold text-[#c0caad] uppercase tracking-wider">
                TODO
              </h3>
              <span className="px-2 py-0.5 bg-[#1f2020] border border-[#292a2a] rounded font-mono-tag text-[10px] text-white font-bold">
                {todoTasks.length}
              </span>
            </div>
            {isLeaderOrAdmin && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="text-[#8b947a] hover:text-white transition-colors"
                title="Add task"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex-1 space-y-3">
            {todoTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className="elevation-1 p-4 rounded-lg cursor-pointer border border-[#292a2a] hover:border-[#a5fa00] transition-all group bg-[#1b1c1c]"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-mono-tag text-[10px] text-[#8b947a]">
                    ID: {task.id.slice(-6)}
                  </span>
                  {getPriorityBadge(task.priority)}
                </div>

                <h4 className="font-display font-semibold text-sm text-white group-hover:text-[#a5fa00] transition-colors leading-snug mb-2">
                  {task.title}
                </h4>

                {task.description && (
                  <p className="font-sans text-xs text-[#c0caad] line-clamp-2 mb-3">
                    {task.description}
                  </p>
                )}

                <div className="flex items-center justify-between border-t border-[#292a2a]/60 pt-3 mt-3">
                  <div className="flex items-center gap-2 text-xs font-mono-tag text-[#8b947a]">
                    {task.assignee ? (
                      <div
                        className="w-6 h-6 rounded-full bg-[#292a2a] border border-[#a5fa00]/40 flex items-center justify-center font-bold text-[10px] text-[#a5fa00]"
                        title={task.assignee.name}
                      >
                        {task.assignee.name.charAt(0).toUpperCase()}
                      </div>
                    ) : (
                      <div
                        className="w-6 h-6 rounded-full bg-[#121414] border border-dashed border-[#474646] flex items-center justify-center text-[#8b947a]"
                        title="Unassigned"
                      >
                        <User className="w-3 h-3" />
                      </div>
                    )}
                    <span className="text-[11px] truncate max-w-[100px]">
                      {task.assignee ? task.assignee.name.split(' ')[0] : 'Unassigned'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleStatusQuickMove(e, task, 'IN_PROGRESS')}
                      className="px-2 py-1 bg-[#121414] hover:bg-[#a5fa00] hover:text-[#080808] border border-[#292a2a] text-[#a5fa00] rounded text-[10px] font-mono-tag font-bold transition-colors flex items-center gap-1"
                      title="Move to In Progress"
                    >
                      <span>Start</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {todoTasks.length === 0 && (
              <div className="p-8 text-center border border-dashed border-[#292a2a] rounded-lg text-xs text-[#8b947a]">
                No pending TODO tasks
              </div>
            )}
          </div>
        </div>

        {/* Column 2: IN PROGRESS */}
        <div className="elevation-1 rounded-xl p-4 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#292a2a]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#a5fa00] shadow-[0_0_8px_rgba(165,250,0,0.8)]"></span>
              <h3 className="font-mono-tag text-xs font-bold text-white uppercase tracking-wider">
                IN PROGRESS
              </h3>
              <span className="px-2 py-0.5 bg-[#a5fa00]/10 border border-[#a5fa00]/40 rounded font-mono-tag text-[10px] text-[#a5fa00] font-bold">
                {inProgressTasks.length}
              </span>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            {inProgressTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className="elevation-1 p-4 rounded-lg cursor-pointer border border-[#a5fa00]/60 shadow-[inset_0_0_10px_rgba(165,250,0,0.08)] bg-[#1b1c1c] hover:border-[#a5fa00] transition-all group"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-mono-tag text-[10px] text-[#a5fa00]">
                    ID: {task.id.slice(-6)}
                  </span>
                  {getPriorityBadge(task.priority)}
                </div>

                <h4 className="font-display font-semibold text-sm text-white group-hover:text-[#a5fa00] transition-colors leading-snug mb-2">
                  {task.title}
                </h4>

                {task.description && (
                  <p className="font-sans text-xs text-[#c0caad] line-clamp-2 mb-3">
                    {task.description}
                  </p>
                )}

                <div className="w-full bg-[#121414] h-1.5 rounded-full mb-3 overflow-hidden border border-[#292a2a]">
                  <div className="bg-[#a5fa00] h-full rounded-full w-[65%] shadow-[0_0_8px_rgba(165,250,0,0.6)]"></div>
                </div>

                <div className="flex items-center justify-between border-t border-[#292a2a]/60 pt-3 mt-2">
                  <div className="flex items-center gap-2 text-xs font-mono-tag text-[#8b947a]">
                    {task.assignee ? (
                      <div
                        className="w-6 h-6 rounded-full bg-[#292a2a] border border-[#a5fa00] flex items-center justify-center font-bold text-[10px] text-[#a5fa00]"
                        title={task.assignee.name}
                      >
                        {task.assignee.name.charAt(0).toUpperCase()}
                      </div>
                    ) : (
                      <div
                        className="w-6 h-6 rounded-full bg-[#121414] border border-dashed border-[#474646] flex items-center justify-center text-[#8b947a]"
                        title="Unassigned"
                      >
                        <User className="w-3 h-3" />
                      </div>
                    )}
                    <span className="text-[11px] truncate max-w-[90px]">
                      {task.assignee ? task.assignee.name.split(' ')[0] : 'Unassigned'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleStatusQuickMove(e, task, 'TODO')}
                      className="p-1 bg-[#121414] hover:bg-[#292a2a] border border-[#292a2a] text-[#8b947a] hover:text-white rounded transition-colors"
                      title="Move back to TODO"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleStatusQuickMove(e, task, 'COMPLETED')}
                      className="px-2 py-1 bg-[#a5fa00] text-[#080808] hover:bg-[#b8ff33] rounded text-[10px] font-mono-tag font-bold transition-colors flex items-center gap-1 shadow-sm"
                      title="Mark Completed"
                    >
                      <span>Complete</span>
                      <CheckCircle2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {inProgressTasks.length === 0 && (
              <div className="p-8 text-center border border-dashed border-[#292a2a] rounded-lg text-xs text-[#8b947a]">
                No active tasks in progress
              </div>
            )}
          </div>
        </div>

        {/* Column 3: COMPLETED */}
        <div className="elevation-1 rounded-xl p-4 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#292a2a]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#c9c6c5]"></span>
              <h3 className="font-mono-tag text-xs font-bold text-[#c9c6c5] uppercase tracking-wider">
                COMPLETED
              </h3>
              <span className="px-2 py-0.5 bg-[#1f2020] border border-[#292a2a] rounded font-mono-tag text-[10px] text-[#c9c6c5] font-bold">
                {completedTasks.length}
              </span>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            {completedTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className="elevation-1 p-4 rounded-lg cursor-pointer border border-[#292a2a] opacity-80 hover:opacity-100 transition-all group bg-[#1b1c1c]"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-mono-tag text-[10px] text-[#8b947a]">
                    ID: {task.id.slice(-6)}
                  </span>
                  <span className="font-mono-tag text-[10px] text-[#a5fa00] border border-[#a5fa00]/40 px-1.5 py-0.5 rounded uppercase font-bold">
                    Done
                  </span>
                </div>

                <h4 className="font-display font-semibold text-sm text-white/90 line-through decoration-[#474646] group-hover:text-white transition-colors leading-snug mb-2">
                  {task.title}
                </h4>

                <div className="flex items-center justify-between border-t border-[#292a2a]/60 pt-3 mt-3">
                  <div className="flex items-center gap-2 text-xs font-mono-tag text-[#8b947a]">
                    {task.assignee ? (
                      <div className="w-6 h-6 rounded-full bg-[#292a2a] border border-[#474646] flex items-center justify-center font-bold text-[10px] text-white">
                        {task.assignee.name.charAt(0).toUpperCase()}
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-[#121414] border border-[#292a2a] flex items-center justify-center text-[#8b947a]">
                        <User className="w-3 h-3" />
                      </div>
                    )}
                    <span className="text-[11px] truncate max-w-[100px]">
                      {task.assignee ? task.assignee.name.split(' ')[0] : 'Unassigned'}
                    </span>
                  </div>

                  <button
                    onClick={(e) => handleStatusQuickMove(e, task, 'IN_PROGRESS')}
                    className="px-2 py-1 bg-[#121414] hover:bg-[#292a2a] border border-[#292a2a] text-[#8b947a] hover:text-white rounded text-[10px] font-mono-tag transition-colors"
                    title="Reopen task"
                  >
                    Reopen
                  </button>
                </div>
              </div>
            ))}

            {completedTasks.length === 0 && (
              <div className="p-8 text-center border border-dashed border-[#292a2a] rounded-lg text-xs text-[#8b947a]">
                No completed tasks yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateTaskModal
        projectId={projectId}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={onTasksUpdated}
        members={members}
      />

      <EditTaskModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onSuccess={onTasksUpdated}
        members={members}
        isLeaderOrAdmin={isLeaderOrAdmin}
      />
    </div>
  );
};
