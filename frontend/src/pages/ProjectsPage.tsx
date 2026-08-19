import React, { useEffect, useState } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { useAuthStore } from '../stores/authStore';
import { Project, ProjectStatus } from '../types';
import { ProjectCard } from '../components/projects/ProjectCard';
import { CreateProjectModal } from '../components/projects/CreateProjectModal';
import { EditProjectModal } from '../components/projects/EditProjectModal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Button } from '../components/ui/Button';
import { FolderPlus, Search, Filter, FolderGit2 } from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const { projects, fetchProjects, isLoading } = useProjectStore();
  const { user } = useAuthStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || p.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const isLeaderOrAdmin = (proj: Project) => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    return proj.leaderId === user.id;
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#242424]">
        <div>
          <h1 className="text-3xl font-bold font-display text-white tracking-tight flex items-center gap-3">
            Projects Catalog
          </h1>
          <p className="text-sm text-[#8b947a] mt-1 font-sans">
            Discover, manage, and collaborate across development projects
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsCreateOpen(true)}
          className="gap-2 self-start md:self-auto"
        >
          <FolderPlus className="w-4 h-4" />
          Create New Project
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#8b947a] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#121414] border border-[#242424] text-[#e3e2e2] placeholder-[#656464] rounded-md pl-10 pr-3.5 py-2 text-sm focus-neon-glow"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-[#8b947a] shrink-0 mr-1 hidden sm:inline-block" />
          {['ALL', 'PLANNING', 'ACTIVE', 'COMPLETED', 'ARCHIVED'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono-tag transition-all shrink-0 cursor-pointer ${
                selectedStatus === status
                  ? 'bg-[#A8FF00]/15 text-[#A8FF00] border border-[#A8FF00]'
                  : 'bg-[#121414] text-[#8b947a] border border-[#242424] hover:border-[#414a34]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      {isLoading && projects.length === 0 ? (
        <div className="py-20">
          <LoadingSpinner size="lg" label="Loading project catalog..." />
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isLeaderOrAdmin={isLeaderOrAdmin(project)}
              onEdit={(p) => setEditingProject(p)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="surface-level-2 border border-[#242424] rounded-xl p-12 text-center flex flex-col items-center justify-center my-8">
          <div className="p-4 bg-[#121414] border border-[#242424] rounded-full mb-4 text-[#8b947a]">
            <FolderGit2 className="w-10 h-10" />
          </div>
          <h3 className="font-display font-bold text-xl text-white">No Projects Found</h3>
          <p className="text-sm text-[#8b947a] mt-1 max-w-md">
            {searchTerm || selectedStatus !== 'ALL'
              ? 'No projects matched your active search filters.'
              : 'There are no active projects yet. Get started by initializing your first development project.'}
          </p>

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsCreateOpen(true)}
            className="mt-6 gap-2"
          >
            <FolderPlus className="w-4 h-4" />
            Create Your First Project
          </Button>
        </div>
      )}

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
