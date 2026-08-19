import React, { useState, useEffect } from 'react';
import { Project, ProjectStatus } from '../../types';
import { useProjectStore } from '../../stores/projectStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { X, Settings, Trash2, AlertCircle } from 'lucide-react';

interface EditProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted?: () => void;
}

export const EditProjectModal: React.FC<EditProjectModalProps> = ({
  project,
  isOpen,
  onClose,
  onDeleted,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('PLANNING');
  const [deadline, setDeadline] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const { updateProject, deleteProject, isLoading, error, clearError } = useProjectStore();

  useEffect(() => {
    if (project) {
      setTitle(project.title || '');
      setDescription(project.description || '');
      setStatus(project.status || 'PLANNING');
      if (project.deadline) {
        setDeadline(new Date(project.deadline).toISOString().split('T')[0]);
      } else {
        setDeadline('');
      }
    }
    setShowConfirmDelete(false);
  }, [project]);

  if (!isOpen || !project) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await updateProject(project.id, {
        title,
        description,
        status,
        deadline: deadline || undefined,
      });
      onClose();
    } catch {
      // Error in store
    }
  };

  const handleDelete = async () => {
    clearError();
    try {
      await deleteProject(project.id);
      onClose();
      if (onDeleted) onDeleted();
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
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-white">Project Settings</h2>
              <p className="text-xs text-[#8b947a]">Update project status, parameters, or lifecycle</p>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-[#93000a]/20 border border-[#ffb4ab]/30 rounded-md text-xs text-[#ffb4ab] mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!showConfirmDelete ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="PROJECT TITLE"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <div className="flex flex-col gap-1.5">
                <label className="font-mono-tag text-xs text-[#8b947a]">DESCRIPTION</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#121414] border border-[#242424] text-[#e3e2e2] rounded-md px-3.5 py-2.5 text-sm transition-all focus-neon-glow"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono-tag text-xs text-[#8b947a]">PROJECT STATUS</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                    className="w-full bg-[#121414] border border-[#242424] text-[#e3e2e2] rounded-md px-3 py-2.5 text-sm focus-neon-glow"
                  >
                    <option value="PLANNING">PLANNING</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>

                <Input
                  label="TARGET DEADLINE"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-[#242424] mt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowConfirmDelete(true)}
                  className="text-[#ffb4ab] hover:text-white"
                >
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  Delete Project
                </Button>

                <div className="flex gap-2">
                  <Button type="button" variant="secondary" size="md" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="md" isLoading={isLoading}>
                    Save Changes
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            <div className="p-4 bg-[#93000a]/10 border border-[#ffb4ab]/30 rounded-lg text-center flex flex-col items-center">
              <Trash2 className="w-10 h-10 text-[#ffb4ab] mb-3 animate-pulse" />
              <h3 className="font-display font-bold text-lg text-white">Delete Project?</h3>
              <p className="text-xs text-[#ffb4ab] mt-1 mb-6 max-w-sm">
                This action is permanent and will remove "{project.title}" along with all associated workspace data.
              </p>

              <div className="flex gap-3">
                <Button variant="secondary" size="md" onClick={() => setShowConfirmDelete(false)}>
                  Cancel
                </Button>
                <Button variant="danger" size="md" onClick={handleDelete} isLoading={isLoading}>
                  Confirm Delete
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
