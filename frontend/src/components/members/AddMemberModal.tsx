import React, { useState } from 'react';
import { useMemberStore } from '../../stores/memberStore';
import { X, UserPlus, Mail } from 'lucide-react';

interface AddMemberModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  projectId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { addMember, isLoading } = useMemberStore();
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('User email is required.');
      return;
    }
    setErrorMessage(null);

    try {
      await addMember(projectId, email.trim());
      setEmail('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to add project member');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="card-level-1 w-full max-w-md p-6 relative border border-[#292a2a] shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8b947a] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded bg-[#121414] border border-[#292a2a] flex items-center justify-center text-[#a5fa00]">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-white">Add Team Member</h2>
            <p className="font-sans text-xs text-[#c0caad]">Grant project workspace access by user email.</p>
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
              Registered User Email *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-[#8b947a]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@devforge.io"
                className="w-full pl-9 pr-3 py-2 bg-[#121414] border border-[#292a2a] rounded text-white focus:outline-none focus:border-[#a5fa00] text-sm"
                required
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
              {isLoading ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
