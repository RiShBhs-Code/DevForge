import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProjectStore } from '../stores/projectStore';
import { useAuthStore } from '../stores/authStore';
import { Project } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EditProjectModal } from '../components/projects/EditProjectModal';
import {
  ArrowLeft,
  Settings,
  MoreVertical,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  GitPullRequest,
  MessageSquare,
  Users,
  CheckSquare,
  LayoutGrid,
} from 'lucide-react';

export const ProjectWorkspacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentProject, fetchProjectById, isLoading, error } = useProjectStore();
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'members' | 'chat'>('overview');
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProjectById(id).catch(() => {});
    }
  }, [id, fetchProjectById]);

  if (isLoading && !currentProject) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center">
        <LoadingSpinner size="lg" label="Loading project workspace..." />
      </div>
    );
  }

  if (error || !currentProject) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="card-level-1 p-12">
          <h2 className="text-2xl font-bold font-display text-white mb-2">Project Not Found</h2>
          <p className="text-sm text-[#c0caad] mb-6">
            The requested project workspace could not be found or you do not have permission to view it.
          </p>
          <Link to="/projects">
            <button className="btn-primary text-xs">Back to Projects Catalog</button>
          </Link>
        </div>
      </div>
    );
  }

  const isLeaderOrAdmin = user?.role === 'ADMIN' || currentProject.leaderId === user?.id;

  const formattedDeadline = currentProject.deadline
    ? new Date(currentProject.deadline).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    : 'No deadline';

  return (
    <div className="flex-1 flex flex-col min-h-screen overflow-y-auto w-full max-w-[1440px] mx-auto">
      {/* Top Breadcrumb Link */}
      <div className="px-6 md:px-16 pt-6">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 font-mono-tag text-xs text-[#c0caad] hover:text-[#a5fa00] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects Catalog</span>
        </Link>
      </div>

      {/* Project Header (TopAppBar context) */}
      <header className="w-full px-6 md:px-16 py-8 border-b border-[#292a2a] bg-[#121414] sticky top-0 z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight">
              Project: {currentProject.title}
            </h1>
            {/* Status Badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#a5fa00] text-[#a5fa00] font-mono-tag text-xs uppercase bg-[#a5fa00]/10">
              <span className="w-1.5 h-1.5 rounded-full bg-[#a5fa00]"></span>
              {currentProject.status}
            </span>
          </div>
          <p className="font-sans text-sm md:text-base text-[#c0caad] max-w-2xl leading-relaxed">
            {currentProject.description || 'Infrastructure development, sprint tasks, and team collaboration space.'}
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          {/* Team Avatars */}
          <div className="flex -space-x-3">
            <div className="w-9 h-9 rounded-full border-2 border-[#121414] bg-[#292a2a] flex items-center justify-center font-mono-tag text-xs text-white font-bold">
              {currentProject.leader?.name?.charAt(0) || 'L'}
            </div>
            <div className="w-9 h-9 rounded-full border-2 border-[#121414] bg-[#1b1c1c] border-[#414a34] flex items-center justify-center font-mono-tag text-xs text-[#a5fa00]">
              +{currentProject.memberCount}
            </div>
          </div>

          {isLeaderOrAdmin && (
            <button
              onClick={() => setIsEditOpen(true)}
              className="btn-secondary text-xs flex items-center gap-2 py-2 px-4"
            >
              <Settings className="w-4 h-4 text-[#a5fa00]" />
              <span>Project Settings</span>
            </button>
          )}
        </div>
      </header>

      {/* Sub-Navigation (Contextual Tabs) */}
      <div className="px-6 md:px-16 py-4 border-b border-[#292a2a] flex gap-8 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: LayoutGrid },
          { id: 'tasks', label: 'Tasks', icon: CheckSquare, badge: currentProject.taskCount },
          { id: 'members', label: 'Members', icon: Users, badge: currentProject.memberCount },
          { id: 'chat', label: 'Chat', icon: MessageSquare },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`font-mono-tag text-xs uppercase pb-2 transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'text-white border-b-2 border-[#a5fa00] font-bold -mb-[18px]'
                  : 'text-[#c0caad] hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="px-1.5 py-0.5 bg-[#1b1c1c] border border-[#292a2a] rounded text-[10px] text-white">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Dashboard / Tab Content Canvas */}
      <div className="p-6 md:p-16 grid grid-cols-1 md:grid-cols-12 gap-6">
        {activeTab === 'overview' && (
          <>
            {/* Bento Grid: Stats Area (Spans 8 columns) */}
            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Stat Card 1 */}
              <div className="elevation-1 rounded-xl p-6 flex flex-col gap-4">
                <span className="font-mono-tag text-xs text-[#8b947a] uppercase tracking-wider">
                  Completion
                </span>
                <div className="flex items-end gap-2">
                  <span className="font-display text-5xl md:text-6xl font-bold text-[#a5fa00] stat-glow leading-none">
                    {currentProject.progress}
                  </span>
                  <span className="font-display text-xl text-[#a5fa00] pb-1">%</span>
                </div>
                <div className="w-full h-1.5 bg-[#292a2a] rounded-full mt-auto overflow-hidden">
                  <div
                    className="h-full bg-[#a5fa00] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, currentProject.progress))}%` }}
                  ></div>
                </div>
              </div>

              {/* Stat Card 2 */}
              <div className="elevation-1 rounded-xl p-6 flex flex-col gap-4">
                <span className="font-mono-tag text-xs text-[#8b947a] uppercase tracking-wider">
                  Pending Tasks
                </span>
                <div className="flex items-end gap-2">
                  <span className="font-display text-5xl md:text-6xl font-bold text-white leading-none">
                    {currentProject.taskCount - currentProject.completedTasks}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-auto text-[#c0caad] font-mono-tag text-xs">
                  <span className="text-[#a5fa00] font-bold">Total: {currentProject.taskCount}</span>
                </div>
              </div>

              {/* Stat Card 3 */}
              <div className="elevation-1 rounded-xl p-6 flex flex-col gap-4 active-edge relative overflow-hidden group cursor-pointer transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-[#a5fa00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="font-mono-tag text-xs text-[#8b947a] uppercase tracking-wider relative z-10">
                  Next Deadline
                </span>
                <div className="flex flex-col gap-1 relative z-10">
                  <span className="font-display text-2xl font-bold text-white">{formattedDeadline}</span>
                  <span className="font-sans text-xs text-[#c0caad]">Target Release</span>
                </div>
                <div className="mt-auto flex items-center justify-between relative z-10 text-[#a5fa00] font-mono-tag text-xs uppercase">
                  <span>Sprint Active</span>
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Side Panel: Activity Log (Spans 4 columns) */}
            <div className="md:col-span-4 elevation-1 rounded-xl flex flex-col overflow-hidden h-[520px]">
              <div className="p-5 border-b border-[#292a2a] bg-[#1b1c1c] flex justify-between items-center sticky top-0">
                <h3 className="font-mono-tag text-xs uppercase tracking-wider text-white">Activity Log</h3>
                <button className="text-[#8b947a] hover:text-white transition-colors">
                  <Filter className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Log Item 1 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#a5fa00] mt-1.5 shadow-[0_0_8px_rgba(165,250,0,0.6)]"></div>
                    <div className="w-px h-full bg-[#292a2a]"></div>
                  </div>
                  <div className="flex flex-col gap-1 pb-4">
                    <p className="font-sans text-xs text-white">
                      <span className="font-bold">{currentProject.leader?.name || 'Leader'}</span> initialized workspace
                    </p>
                    <p className="font-sans text-[11px] text-[#c0caad]">Set status to {currentProject.status}</p>
                    <span className="font-mono-tag text-[10px] text-[#8b947a] mt-1">10 mins ago</span>
                  </div>
                </div>

                {/* Log Item 2 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full border border-[#292a2a] mt-1.5 bg-[#121414]"></div>
                    <div className="w-px h-full bg-[#292a2a]"></div>
                  </div>
                  <div className="flex flex-col gap-1 pb-4">
                    <p className="font-sans text-xs text-white">
                      <span className="font-bold">System</span> deployment initialized
                    </p>
                    <p className="font-sans text-[11px] text-[#c0caad]">MongoDB database collections connected.</p>
                    <span className="font-mono-tag text-[10px] text-[#8b947a] mt-1">2 hours ago</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Chart / Performance Metrics Panel (Spans 12 columns) */}
            <div className="md:col-span-12 elevation-1 rounded-xl p-8 mt-4 flex flex-col md:flex-row gap-8 items-center border-l-4 border-l-[#a5fa00]">
              <div className="flex-1">
                <h3 className="font-display text-2xl font-bold text-white mb-2">Performance Metrics</h3>
                <p className="font-sans text-sm text-[#c0caad] mb-6 max-w-xl">
                  Sprint velocity and completion rate metrics for "{currentProject.title}". Progress is updated dynamically upon task completion.
                </p>
                <button className="btn-secondary text-xs">View Detailed Workspace Report</button>
              </div>

              {/* Decorative Abstract Data Bar Chart */}
              <div className="w-full md:w-1/2 h-44 bg-[#1f2020] rounded-lg border border-[#292a2a] relative overflow-hidden flex items-end px-4 gap-3 pt-8">
                <div className="w-full bg-[#292a2a] rounded-t-sm h-[30%] hover:bg-[#a5fa00]/20 transition-colors"></div>
                <div className="w-full bg-[#292a2a] rounded-t-sm h-[45%] hover:bg-[#a5fa00]/20 transition-colors"></div>
                <div className="w-full bg-[#292a2a] rounded-t-sm h-[20%] hover:bg-[#a5fa00]/20 transition-colors"></div>
                <div className="w-full bg-[#292a2a] rounded-t-sm h-[60%] hover:bg-[#a5fa00]/20 transition-colors"></div>
                <div className="w-full bg-[#a5fa00] rounded-t-sm h-[85%] relative shadow-[0_0_15px_rgba(165,250,0,0.3)]">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 font-mono-tag text-[10px] text-[#a5fa00]">
                    {currentProject.progress}%
                  </div>
                </div>
                <div className="w-full bg-[#292a2a] rounded-t-sm h-[40%] hover:bg-[#a5fa00]/20 transition-colors"></div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'tasks' && (
          <div className="col-span-12 elevation-1 p-12 text-center flex flex-col items-center">
            <CheckSquare className="w-12 h-12 text-[#a5fa00] mb-4" />
            <h3 className="font-display font-bold text-xl text-white">Task Management & Kanban Board</h3>
            <p className="text-sm text-[#c0caad] mt-2 max-w-md">
              Milestone 3 will introduce full task tracking, priority filters, and Kanban board columns.
            </p>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="col-span-12 elevation-1 p-12 text-center flex flex-col items-center">
            <Users className="w-12 h-12 text-[#a5fa00] mb-4" />
            <h3 className="font-display font-bold text-xl text-white">Project Team & Member Roles</h3>
            <p className="text-sm text-[#c0caad] mt-2 max-w-md">
              Milestone 3 will enable adding team members and managing project permissions.
            </p>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="col-span-12 elevation-1 p-12 text-center flex flex-col items-center">
            <MessageSquare className="w-12 h-12 text-[#a5fa00] mb-4" />
            <h3 className="font-display font-bold text-xl text-white">Real-Time Project Chat</h3>
            <p className="text-sm text-[#c0caad] mt-2 max-w-md">
              Milestone 4 will integrate real-time WebSocket communication for project chat.
            </p>
          </div>
        )}
      </div>

      {/* Edit Project Modal */}
      <EditProjectModal
        project={currentProject}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onDeleted={() => navigate('/projects')}
      />
    </div>
  );
};
