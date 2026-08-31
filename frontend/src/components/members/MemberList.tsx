import React, { useState } from 'react';
import { ProjectMember } from '../../types';
import { useMemberStore } from '../../stores/memberStore';
import { AddMemberModal } from './AddMemberModal';
import { UserPlus, Shield, User, Trash2, Calendar, Mail } from 'lucide-react';

interface MemberListProps {
  projectId: string;
  members: ProjectMember[];
  isLeaderOrAdmin: boolean;
  onMembersUpdated: () => void;
}

export const MemberList: React.FC<MemberListProps> = ({
  projectId,
  members,
  isLeaderOrAdmin,
  onMembersUpdated,
}) => {
  const { removeMember } = useMemberStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRemove = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to remove ${userName} from this project?`)) {
      return;
    }
    setErrorMessage(null);
    try {
      await removeMember(projectId, userId);
      onMembersUpdated();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to remove member');
    }
  };

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#121414] p-6 rounded-xl border border-[#292a2a]">
        <div>
          <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
            <span>Project Team</span>
            <span className="px-2 py-0.5 bg-[#a5fa00]/10 border border-[#a5fa00]/40 rounded font-mono-tag text-xs text-[#a5fa00]">
              {members.length} Members
            </span>
          </h2>
          <p className="font-sans text-xs text-[#c0caad] mt-1">
            Manage development team roles and project access permissions.
          </p>
        </div>

        {isLeaderOrAdmin && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary text-xs flex items-center gap-2 py-2.5 px-4 shadow-md"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Team Member</span>
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-950/40 border border-red-800 rounded-lg text-red-300 text-xs">
          {errorMessage}
        </div>
      )}

      {/* Members Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => {
          const isLeader = member.role === 'LEADER';
          const userName = member.user?.name || 'Developer';
          const userEmail = member.user?.email || member.userId;

          return (
            <div
              key={member.id || member.userId}
              className="elevation-1 p-6 rounded-xl border border-[#292a2a] flex flex-col justify-between group hover:border-[#a5fa00] transition-colors relative bg-[#1b1c1c]"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-[#121414] border border-[#292a2a] flex items-center justify-center font-display font-bold text-lg text-[#a5fa00] group-hover:border-[#a5fa00] transition-colors shadow-inner">
                    {userName.charAt(0).toUpperCase()}
                  </div>

                  {/* Role Badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono-tag text-[10px] uppercase font-bold tracking-wider ${
                      isLeader
                        ? 'bg-[#a5fa00]/10 border border-[#a5fa00] text-[#a5fa00]'
                        : 'bg-[#121414] border border-[#292a2a] text-[#c0caad]'
                    }`}
                  >
                    {isLeader ? <Shield className="w-3 h-3 text-[#a5fa00]" /> : <User className="w-3 h-3 text-[#8b947a]" />}
                    <span>{member.role}</span>
                  </span>
                </div>

                <h3 className="font-display font-bold text-base text-white mb-1">{userName}</h3>

                <div className="flex items-center gap-1.5 text-xs text-[#c0caad] font-sans mb-3 truncate">
                  <Mail className="w-3.5 h-3.5 text-[#8b947a] shrink-0" />
                  <span className="truncate">{userEmail}</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-[#292a2a] pt-4 mt-4 text-[11px] font-mono-tag text-[#8b947a]">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    Joined{' '}
                    {member.joinedAt
                      ? new Date(member.joinedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Recently'}
                  </span>
                </div>

                {isLeaderOrAdmin && !isLeader && (
                  <button
                    onClick={() => handleRemove(member.userId, userName)}
                    className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Remove Member"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {members.length === 0 && (
        <div className="p-12 card-level-1 text-center text-xs text-[#8b947a]">
          No project members listed.
        </div>
      )}

      {/* Add Member Modal */}
      <AddMemberModal
        projectId={projectId}
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={onMembersUpdated}
      />
    </div>
  );
};
