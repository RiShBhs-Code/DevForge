import React, { useState } from 'react';
import { useTaskStore } from '../../stores/taskStore';
import { ProjectMember, TaskPriority, TaskStatus } from '../../types';
import { X, CheckSquare } from 'lucide-react';

interface CreateTaskModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  members: ProjectMember[];
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  projectId,
  isOpen,
  onClose,
  onSuccess,
  members,
}) => {
  const { createTask, isLoading } = useTaskStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [deadline, setDeadline] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Task title is required.');
      return;
    }
    setErrorMessage(null);

    try {
      await createTask(projectId, {
        title: title.trim(),
        description: description.trim(),
        assignedTo: assignedTo || undefined,
        priority,
        status,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
      });
      setTitle('');
      setDescription('');
      setAssignedTo('');
      setPriority('MEDIUM');
      setStatus('TODO');
      setDeadline('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create task');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="card-level-1 w-full max-w-lg p-6 relative border border-[#292a2a] shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8b947a] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded bg-[#121414] border border-[#292a2a] flex items-center justify-center text-[#a5fa00]">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-white">Create New Task</h2>
            <p className="font-sans text-xs text-[#c0caad]">Add a work item to the project Kanban board.</p>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-950/40 border border-red-800 rounded text-red-300 text-xs">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-sm">
          <div>
            <label className="block text-xs font-mono-tag text-[#8b947a] uppercase mb-1">
              Task Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Implement Redis caching layer"
              className="w-full px-3 py-2 bg-[#121414] border border-[#292a2a] rounded text-white focus:outline-none focus:border-[#a5fa00] text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono-tag text-[#8b947a] uppercase mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the task scope, requirements, or deliverables..."
              rows={3}
              className="w-full px-3 py-2 bg-[#121414] border border-[#292a2a] rounded text-white focus:outline-none focus:border-[#a5fa00] text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono-tag text-[#8b947a] uppercase mb-1">
                Assignee
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2 bg-[#121414] border border-[#292a2a] rounded text-white focus:outline-none focus:border-[#a5fa00] text-sm"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.user?.name || m.user?.email || m.userId} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono-tag text-[#8b947a] uppercase mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 bg-[#121414] border border-[#292a2a] rounded text-white focus:outline-none focus:border-[#a5fa00] text-sm"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono-tag text-[#8b947a] uppercase mb-1">
                Initial Column
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 bg-[#121414] border border-[#292a2a] rounded text-white focus:outline-none focus:border-[#a5fa00] text-sm"
              >
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono-tag text-[#8b947a] uppercase mb-1">
                Target Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 bg-[#121414] border border-[#292a2a] rounded text-white focus:outline-none focus:border-[#a5fa00] text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#292a2a]">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs px-4 py-2"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary text-xs px-5 py-2 flex items-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
