import React, { useState } from 'react';
import { useProjectStore } from '../../stores/projectStore';
import { ProjectStatus } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { X, FolderPlus, AlertCircle } from 'lucide-react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('PLANNING');
  const [deadline, setDeadline] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);

  const { createProject, isLoading, error, clearError } = useProjectStore();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setFieldError(null);

    if (!title.trim()) {
      setFieldError('Project title is required.');
      return;
    }

    try {
      await createProject({
        title,
        description,
        status,
        deadline: deadline || undefined,
      });
      setTitle('');
      setDescription('');
      setStatus('PLANNING');
      setDeadline('');
      onClose();
      if (onSuccess) onSuccess();
    } catch {
      // Error in store
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg">
        <Card level={2} className="shadow-2xl border-[#242424] relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#8b947a] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#1b1c1c] border border-[#242424] rounded-md text-[#A8FF00]">
              <FolderPlus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-white">Create New Project</h2>
              <p className="text-xs text-[#8b947a]">Initialize a collaborative development workspace</p>
            </div>
          </div>

          {(error || fieldError) && (
            <div className="flex items-center gap-2 p-3 bg-[#93000a]/20 border border-[#ffb4ab]/30 rounded-md text-xs text-[#ffb4ab] mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{fieldError || error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="PROJECT TITLE"
              type="text"
              placeholder="e.g. DevForge Real-time Chat Engine"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="flex flex-col gap-1.5">
              <label className="font-mono-tag text-xs text-[#8b947a]">DESCRIPTION</label>
              <textarea
                rows={3}
                placeholder="Brief summary of project objectives and architecture..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#121414] border border-[#242424] text-[#e3e2e2] placeholder-[#656464] rounded-md px-3.5 py-2.5 text-sm transition-all focus-neon-glow"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-mono-tag text-xs text-[#8b947a]">INITIAL STATUS</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                  className="w-full bg-[#121414] border border-[#242424] text-[#e3e2e2] rounded-md px-3 py-2.5 text-sm focus-neon-glow"
                >
                  <option value="PLANNING">PLANNING</option>
                  <option value="ACTIVE">ACTIVE</option>
                </select>
              </div>

              <Input
                label="TARGET DEADLINE"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#242424] mt-2">
              <Button type="button" variant="secondary" size="md" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md" isLoading={isLoading}>
                Create Project
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
