import React from 'react';
import { Link } from 'react-router-dom';
import { Project, ProjectStatus } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Calendar, Users, CheckSquare, ArrowUpRight, User as UserIcon } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  isLeaderOrAdmin?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  isLeaderOrAdmin,
}) => {
  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'PLANNING':
        return <Badge variant="neutral">PLANNING</Badge>;
      case 'ACTIVE':
        return <Badge variant="signal">ACTIVE</Badge>;
      case 'COMPLETED':
        return <Badge variant="member">COMPLETED</Badge>;
      case 'ARCHIVED':
        return <Badge variant="neutral">ARCHIVED</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const formattedDate = project.deadline
    ? new Date(project.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : 'No deadline';

  return (
    <Card level={2} className="group border-[#242424] hover:border-[#414a34] flex flex-col justify-between transition-all duration-200">
      <div>
        {/* Header Badges & Actions */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            {getStatusBadge(project.status)}
            <span className="font-mono-tag text-[10px] text-[#8b947a]">
              ID: {project.id.slice(-6)}
            </span>
          </div>

          {isLeaderOrAdmin && onEdit && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onEdit(project);
              }}
              className="text-xs font-mono-tag text-[#8b947a] hover:text-[#A8FF00] transition-colors"
            >
              [EDIT]
            </button>
          )}
        </div>

        {/* Title & Description */}
        <Link to={`/projects/${project.id}`} className="block group-hover:text-[#A8FF00] transition-colors">
          <h3 className="font-display font-bold text-xl text-white flex items-center justify-between">
            <span>{project.title}</span>
            <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-[#A8FF00] transition-opacity shrink-0 ml-2" />
          </h3>
        </Link>

        <p className="text-xs text-[#8b947a] mt-2 line-clamp-2 leading-relaxed">
          {project.description || 'No project description provided.'}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-[#242424] flex flex-col gap-3">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-[11px] font-mono-tag mb-1.5">
            <span className="text-[#8b947a]">PROGRESS</span>
            <span className="text-[#A8FF00] font-bold">{project.progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#121414] rounded-full overflow-hidden border border-[#242424]">
            <div
              className="h-full bg-[#A8FF00] transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, project.progress))}%` }}
            ></div>
          </div>
        </div>

        {/* Workspace Summary Info */}
        <div className="flex items-center justify-between text-xs text-[#8b947a] font-mono-tag">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-[#A8FF00]" />
              {project.memberCount}
            </span>
            <span className="flex items-center gap-1">
              <CheckSquare className="w-3.5 h-3.5 text-[#8b947a]" />
              {project.completedTasks}/{project.taskCount}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px]">
            <Calendar className="w-3.5 h-3.5 text-[#8b947a]" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
