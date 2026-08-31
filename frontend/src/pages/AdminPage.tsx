import React, { useEffect, useState } from 'react';
import { useAdminStore } from '../stores/adminStore';
import { useAuthStore } from '../stores/authStore';
import { UserRole } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import {
  Shield,
  Users,
  FolderGit2,
  CheckSquare,
  Search,
  Trash2,
  AlertTriangle,
  Activity,
  UserCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminPage: React.FC = () => {
  const { user } = useAuthStore();
  const {
    stats,
    users,
    projects,
    fetchStats,
    fetchUsers,
    fetchProjects,
    updateUserRole,
    deleteUser,
    deleteProject,
    isLoading,
  } = useAdminStore();

  const [activeTab, setActiveTab] = useState<'users' | 'projects'>('users');
  const [userSearch, setUserSearch] = useState('');
  const [projectSearch, setProjectSearch] = useState('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchStats();
      fetchUsers();
      fetchProjects();
    }
  }, [user]);

  if (user?.role !== 'ADMIN') {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="card-level-1 p-12 flex flex-col items-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
          <h2 className="text-2xl font-bold font-display text-white mb-2">Access Denied</h2>
          <p className="text-sm text-[#c0caad] mb-6 max-w-md">
            The DevForge Administration Area requires system administrator privileges.
          </p>
          <Link to="/dashboard">
            <button className="btn-primary text-xs">Return to Dashboard</button>
          </Link>
        </div>
      </div>
    );
  }

  const handleRoleChange = async (targetUserId: string, newRole: UserRole) => {
    try {
      await updateUserRole(targetUserId, newRole);
      setActionMessage(`Updated role to ${newRole}`);
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update role');
    }
  };

  const handleDeleteUser = async (targetUserId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"?`)) {
      return;
    }
    try {
      await deleteUser(targetUserId);
      setActionMessage(`User ${userName} deleted`);
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to delete user');
    }
  };

  const handleDeleteProject = async (projectId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to remove project "${title}"?`)) {
      return;
    }
    try {
      await deleteProject(projectId);
      setActionMessage(`Project "${title}" removed`);
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to delete project');
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredProjects = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(projectSearch.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(projectSearch.toLowerCase()))
  );

  const completionRate =
    stats && stats.totalTasks > 0
      ? Math.round((stats.completedTasks * 100) / stats.totalTasks)
      : 0;

  return (
    <div className="flex-1 w-full max-w-[1440px] mx-auto px-6 md:px-16 py-8 md:py-12">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-[#292a2a]">
        <div>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Shield className="w-9 h-9 text-[#a5fa00]" />
            <span>Platform Administration</span>
          </h1>
          <p className="font-sans text-base text-[#c0caad] mt-2">
            System overview, user role management, and content moderation controls.
          </p>
        </div>

        {actionMessage && (
          <div className="px-4 py-2 bg-[#a5fa00]/10 border border-[#a5fa00] text-[#a5fa00] font-mono-tag text-xs rounded-lg animate-in fade-in">
            {actionMessage}
          </div>
        )}
      </header>

      {/* Platform Statistics Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Stat 1 */}
        <div className="card-level-1 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center text-[#8b947a] mb-4">
            <span className="font-mono-tag text-xs uppercase tracking-wider">Total Users</span>
            <Users className="w-5 h-5 text-[#a5fa00]" />
          </div>
          <div className="font-display text-4xl font-bold text-white">
            {stats?.totalUsers ?? users.length}
          </div>
          <span className="font-mono-tag text-[10px] text-[#c0caad] mt-2">Registered Accounts</span>
        </div>

        {/* Stat 2 */}
        <div className="card-level-1 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center text-[#8b947a] mb-4">
            <span className="font-mono-tag text-xs uppercase tracking-wider">Total Projects</span>
            <FolderGit2 className="w-5 h-5 text-[#a5fa00]" />
          </div>
          <div className="font-display text-4xl font-bold text-white">
            {stats?.totalProjects ?? projects.length}
          </div>
          <span className="font-mono-tag text-[10px] text-[#a5fa00] mt-2">
            {stats?.activeProjects ?? 0} Active
          </span>
        </div>

        {/* Stat 3 */}
        <div className="card-level-1 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center text-[#8b947a] mb-4">
            <span className="font-mono-tag text-xs uppercase tracking-wider">Total Tasks</span>
            <CheckSquare className="w-5 h-5 text-[#a5fa00]" />
          </div>
          <div className="font-display text-4xl font-bold text-white">
            {stats?.totalTasks ?? 0}
          </div>
          <span className="font-mono-tag text-[10px] text-[#c0caad] mt-2">
            {stats?.completedTasks ?? 0} Completed
          </span>
        </div>

        {/* Stat 4 */}
        <div className="card-level-1 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center text-[#8b947a] mb-4">
            <span className="font-mono-tag text-xs uppercase tracking-wider">System Completion</span>
            <Activity className="w-5 h-5 text-[#a5fa00]" />
          </div>
          <div className="font-display text-4xl font-bold text-[#a5fa00]">
            {completionRate}%
          </div>
          <div className="w-full h-1.5 bg-[#292a2a] rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-[#a5fa00] rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex gap-4 mb-6 border-b border-[#292a2a] pb-3">
        <button
          onClick={() => setActiveTab('users')}
          className={`font-mono-tag text-sm uppercase pb-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'users'
              ? 'text-white border-b-2 border-[#a5fa00] font-bold'
              : 'text-[#8b947a] hover:text-white'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>User Management ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`font-mono-tag text-sm uppercase pb-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'projects'
              ? 'text-white border-b-2 border-[#a5fa00] font-bold'
              : 'text-[#8b947a] hover:text-white'
          }`}
        >
          <FolderGit2 className="w-4 h-4" />
          <span>Project Moderation ({projects.length})</span>
        </button>
      </div>

      {/* User Management View */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#8b947a]" />
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search users by name or email..."
              className="w-full pl-9 pr-4 py-2 bg-[#121414] border border-[#292a2a] rounded-lg text-white font-sans text-xs focus:outline-none focus:border-[#a5fa00]"
            />
          </div>

          <div className="elevation-1 rounded-xl border border-[#292a2a] overflow-x-auto bg-[#1b1c1c]">
            <table className="w-full text-left font-sans text-sm">
              <thead className="bg-[#121414] border-b border-[#292a2a] font-mono-tag text-xs text-[#8b947a] uppercase">
                <tr>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Registered Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#292a2a]">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#1f2020] transition-colors">
                    <td className="py-4 px-4 font-semibold text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#121414] border border-[#292a2a] flex items-center justify-center font-mono-tag text-xs text-[#a5fa00] font-bold">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{u.name}</span>
                    </td>
                    <td className="py-4 px-4 text-[#c0caad] font-mono-tag text-xs">{u.email}</td>
                    <td className="py-4 px-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                        className="bg-[#121414] border border-[#292a2a] rounded px-2.5 py-1 font-mono-tag text-xs text-white focus:outline-none focus:border-[#a5fa00]"
                      >
                        <option value="MEMBER">MEMBER</option>
                        <option value="LEADER">LEADER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="py-4 px-4 text-[#8b947a] font-mono-tag text-xs">
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'N/A'}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded border border-transparent hover:border-red-900 transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="p-8 text-center text-xs text-[#8b947a]">
                No users found matching "{userSearch}".
              </div>
            )}
          </div>
        </div>
      )}

      {/* Project Moderation View */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#8b947a]" />
            <input
              type="text"
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-9 pr-4 py-2 bg-[#121414] border border-[#292a2a] rounded-lg text-white font-sans text-xs focus:outline-none focus:border-[#a5fa00]"
            />
          </div>

          <div className="elevation-1 rounded-xl border border-[#292a2a] overflow-x-auto bg-[#1b1c1c]">
            <table className="w-full text-left font-sans text-sm">
              <thead className="bg-[#121414] border-b border-[#292a2a] font-mono-tag text-xs text-[#8b947a] uppercase">
                <tr>
                  <th className="py-3.5 px-4">Project Title</th>
                  <th className="py-3.5 px-4">Leader</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Members</th>
                  <th className="py-3.5 px-4">Tasks</th>
                  <th className="py-3.5 px-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#292a2a]">
                {filteredProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-[#1f2020] transition-colors">
                    <td className="py-4 px-4 font-semibold text-white">
                      <Link to={`/projects/${p.id}`} className="hover:text-[#a5fa00] transition-colors">
                        {p.title}
                      </Link>
                    </td>
                    <td className="py-4 px-4 text-[#c0caad] font-mono-tag text-xs">
                      {p.leader?.name || p.leaderId}
                    </td>
                    <td className="py-4 px-4 font-mono-tag text-xs">
                      <span className="px-2 py-0.5 rounded border border-[#292a2a] bg-[#121414] text-[#a5fa00]">
                        {p.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-[#8b947a] font-mono-tag text-xs">{p.memberCount}</td>
                    <td className="py-4 px-4 text-[#8b947a] font-mono-tag text-xs">{p.taskCount}</td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleDeleteProject(p.id, p.title)}
                        className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-950/60 rounded border border-red-900 transition-colors font-mono-tag flex items-center gap-1.5 ml-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove Project</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredProjects.length === 0 && (
              <div className="p-8 text-center text-xs text-[#8b947a]">
                No projects found matching "{projectSearch}".
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
