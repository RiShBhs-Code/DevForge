import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useProjectStore } from '../stores/projectStore';
import { useTaskStore } from '../stores/taskStore';
import { CreateProjectModal } from '../components/projects/CreateProjectModal';
import { EditProjectModal } from '../components/projects/EditProjectModal';
import { Project } from '../types';
import {
  Search,
  Bell,
  Plus,
  ArrowRight,
  GitCommit,
  CheckCircle,
  AlertTriangle,
  FolderGit2,
  Calendar,
  Users,
  CheckSquare,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { projects, fetchProjects } = useProjectStore();
  const { myTasks, fetchMyTasks } = useTaskStore();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    fetchProjects();
    fetchMyTasks();
  }, [fetchProjects, fetchMyTasks]);

  const activeProjects = projects.filter((p) => p.status === 'ACTIVE');
  const totalTasks = projects.reduce((sum, p) => sum + p.taskCount, 0);

  const filteredAssignedTasks = myTasks.filter((task) => {
    if (taskFilter === 'pending') return task.status !== 'COMPLETED';
    if (taskFilter === 'completed') return task.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="flex-1 w-full max-w-[1440px] mx-auto px-6 md:px-16 py-8 md:py-12">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-8 border-b border-[#292a2a]">
        <div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight">
            Overview
          </h1>
          <p className="font-sans text-base md:text-lg text-[#c0caad] mt-3 max-w-2xl">
            Good morning, <span className="text-white font-semibold">{user?.name}</span>. You have{' '}
            <span className="text-[#a5fa00] font-bold">{activeProjects.length} active projects</span> and{' '}
            <span className="text-white font-bold">{myTasks.length} assigned tasks</span> requiring attention.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button className="p-3 border border-[#292a2a] rounded bg-[#121414] text-[#c0caad] hover:text-white hover:border-[#8b947a] transition-colors group relative cursor-pointer">
            <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>

          <Link to="/notifications" className="p-3 border border-[#292a2a] rounded bg-[#121414] text-[#c0caad] hover:text-white hover:border-[#8b947a] transition-colors group relative">
            <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#a5fa00]"></span>
          </Link>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="btn-primary flex items-center gap-2 text-sm shadow-md"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Project</span>
          </button>
        </div>
      </header>

      {/* Grid Layout for Dashboard Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Active Projects (Bento Grid Section - Spans 8 cols) */}
        <section className="md:col-span-8 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold text-white">Active Projects</h2>
            <Link
              to="/projects"
              className="font-mono-tag text-xs text-[#c0caad] hover:text-[#a5fa00] transition-colors flex items-center gap-1"
            >
              <span>VIEW ALL</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {projects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {projects.slice(0, 4).map((project) => (
                <article
                  key={project.id}
                  className="card-level-1 flex flex-col group hover:border-[#a5fa00] transition-colors relative overflow-hidden p-6 shadow-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1b1c1c] to-[#121414] z-0"></div>
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6">
                      <span className="font-mono-tag text-xs text-[#8b947a] uppercase truncate max-w-[140px]">
                        ID: {project.id.slice(-6)}
                      </span>
                      <div className={project.status === 'ACTIVE' ? 'status-badge-active' : 'status-badge-neutral'}>
                        <span className={project.status === 'ACTIVE' ? 'status-dot-active' : 'status-dot-neutral'}></span>
                        <span>{project.status}</span>
                      </div>
                    </div>

                    <Link to={`/projects/${project.id}`} className="group-hover:text-[#a5fa00] transition-colors">
                      <h3 className="font-display text-xl font-bold text-white mb-2">
                        {project.title}
                      </h3>
                    </Link>

                    <p className="font-sans text-sm text-[#c0caad] mb-6 flex-1 line-clamp-2 leading-relaxed">
                      {project.description || 'No detailed project overview provided.'}
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-[11px] font-mono-tag mb-1">
                        <span className="text-[#8b947a]">PROGRESS</span>
                        <span className="text-[#a5fa00] font-bold">{project.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#0d0e0f] rounded-full overflow-hidden border border-[#292a2a]">
                        <div
                          className="h-full bg-[#a5fa00] transition-all duration-300"
                          style={{ width: `${Math.min(100, Math.max(0, project.progress))}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Footer Avatar Stack & Deadline */}
                    <div className="flex items-center justify-between border-t border-[#292a2a] pt-4 mt-auto">
                      <div className="flex items-center gap-2 text-xs font-mono-tag text-[#c0caad]">
                        <Users className="w-3.5 h-3.5 text-[#a5fa00]" />
                        <span>{project.memberCount} Members</span>
                      </div>

                      <div className="font-mono-tag text-xs text-[#8b947a] flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {project.deadline ? new Date(project.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No Date'}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="card-level-1 p-8 text-center flex flex-col items-center justify-center">
              <FolderGit2 className="w-10 h-10 text-[#8b947a] mb-3" />
              <h3 className="font-display font-bold text-lg text-white">No Active Projects</h3>
              <p className="text-xs text-[#8b947a] mt-1 max-w-sm">
                Get started by creating your first collaborative software project.
              </p>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="btn-primary text-xs mt-4 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Project
              </button>
            </div>
          )}
        </section>

        {/* Sidebar Content (Spans 4 cols) */}
        <aside className="md:col-span-4 flex flex-col gap-6">
          {/* Weekly Progress Bar Chart */}
          <div className="card-level-1 p-6">
            <h2 className="font-mono-tag text-xs text-[#8b947a] uppercase tracking-wider mb-6">
              Assigned Task Health
            </h2>
            <div className="flex items-end gap-3 h-32 mb-4 border-b border-[#292a2a] pb-4">
              <div className="w-full bg-[#292a2a] rounded h-[40%] hover:bg-[#a5fa00] transition-colors cursor-pointer relative group">
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#121414] border border-[#292a2a] px-1.5 py-0.5 rounded font-mono-tag text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  TODO
                </div>
              </div>
              <div className="w-full bg-[#a5fa00] rounded h-[85%] shadow-[0_0_15px_rgba(165,250,0,0.3)] cursor-pointer relative group">
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#121414] border border-[#a5fa00] px-1.5 py-0.5 rounded font-mono-tag text-[10px] text-[#a5fa00] font-bold z-10">
                  Active
                </div>
              </div>
              <div className="w-full bg-[#292a2a] rounded h-[60%] hover:bg-[#a5fa00] transition-colors cursor-pointer relative group">
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#121414] border border-[#292a2a] px-1.5 py-0.5 rounded font-mono-tag text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  Done
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-display font-bold text-xl text-white">{myTasks.length} Assigned Tasks</span>
              <Link to="/tasks" className="font-mono-tag text-xs text-[#a5fa00] hover:underline">
                Manage Tasks
              </Link>
            </div>
          </div>

          {/* Recent Activity Timeline Feed */}
          <div className="card-level-1 p-6 flex-1">
            <h2 className="font-mono-tag text-xs text-[#8b947a] uppercase tracking-wider mb-6">
              Recent Activity
            </h2>
            <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-[15px] before:w-px before:bg-[#292a2a]">
              <div className="relative flex gap-4 pl-8 group cursor-pointer">
                <div className="absolute left-0 top-0.5 w-8 h-8 rounded-full bg-[#121414] border border-[#292a2a] flex items-center justify-center z-10 group-hover:border-[#a5fa00] transition-colors">
                  <CheckCircle className="w-4 h-4 text-[#8b947a] group-hover:text-[#a5fa00]" />
                </div>
                <div>
                  <p className="font-sans text-sm text-white">Milestone 3 Tasks & Team loaded</p>
                  <p className="font-mono-tag text-[11px] text-[#8b947a] mt-1">Just now</p>
                </div>
              </div>

              <div className="relative flex gap-4 pl-8 group cursor-pointer">
                <div className="absolute left-0 top-0.5 w-8 h-8 rounded-full bg-[#121414] border border-[#292a2a] flex items-center justify-center z-10 group-hover:border-[#a5fa00] transition-colors">
                  <GitCommit className="w-4 h-4 text-[#8b947a] group-hover:text-[#a5fa00]" />
                </div>
                <div>
                  <p className="font-sans text-sm text-white">Kanban task board integrated</p>
                  <p className="font-mono-tag text-[11px] text-[#8b947a] mt-1">Today</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Assigned Tasks (List View Section - Spans 12 cols) */}
      <section className="mt-16">
        <div className="flex items-center justify-between mb-8 border-b border-[#292a2a] pb-4">
          <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <span>Assigned Tasks</span>
            <span className="px-2 py-0.5 bg-[#a5fa00]/10 border border-[#a5fa00]/40 rounded font-mono-tag text-xs text-[#a5fa00]">
              {myTasks.length} Total
            </span>
          </h2>
          <div className="flex gap-4">
            <button
              onClick={() => setTaskFilter('all')}
              className={`font-mono-tag text-xs pb-1 transition-colors ${
                taskFilter === 'all'
                  ? 'text-white border-b-2 border-[#a5fa00]'
                  : 'text-[#8b947a] hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTaskFilter('pending')}
              className={`font-mono-tag text-xs pb-1 transition-colors ${
                taskFilter === 'pending'
                  ? 'text-white border-b-2 border-[#a5fa00]'
                  : 'text-[#8b947a] hover:text-white'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setTaskFilter('completed')}
              className={`font-mono-tag text-xs pb-1 transition-colors ${
                taskFilter === 'completed'
                  ? 'text-white border-b-2 border-[#a5fa00]'
                  : 'text-[#8b947a] hover:text-white'
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {filteredAssignedTasks.length > 0 ? (
          <div className="flex flex-col gap-3">
            {filteredAssignedTasks.map((task) => (
              <div
                key={task.id}
                className="bg-[#1b1c1c] hover:bg-[#1f2020] border border-transparent hover:border-[#292a2a] rounded-lg p-4 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-4">
                  <CheckSquare className="w-5 h-5 text-[#a5fa00]" />
                  <span className="font-mono-tag text-xs text-[#8b947a] uppercase w-24">
                    ID: {task.id.slice(-6)}
                  </span>
                  <span className="font-sans text-sm font-medium text-white group-hover:text-[#a5fa00] transition-colors">
                    {task.title}
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <div className={task.status === 'COMPLETED' ? 'status-badge-neutral' : 'status-badge-active'}>
                    <span className={task.status === 'COMPLETED' ? 'status-dot-neutral' : 'status-dot-active'}></span>
                    <span>{task.status}</span>
                  </div>
                  <span className="font-mono-tag text-xs text-[#8b947a] w-24 text-right">
                    {task.priority} Priority
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 card-level-1 text-center text-xs text-[#8b947a]">
            No tasks found matching filter.
          </div>
        )}
      </section>

      {/* Modals */}
      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => fetchProjects()}
      />

      <EditProjectModal
        project={editingProject}
        isOpen={!!editingProject}
        onClose={() => setEditingProject(null)}
        onDeleted={() => fetchProjects()}
      />
    </div>
  );
};
