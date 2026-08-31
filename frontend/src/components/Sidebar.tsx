import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { CreateProjectModal } from './projects/CreateProjectModal';
import { useProjectStore } from '../stores/projectStore';
import { useNotificationStore } from '../stores/notificationStore';
import {
  Hexagon,
  LayoutDashboard,
  FolderGit2,
  CheckSquare,
  Bell,
  User as UserIcon,
  Settings,
  Plus,
  LogOut,
  Menu,
  X,
  Shield,
  Layers,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { fetchProjects } = useProjectStore();
  const { unreadCount, fetchNotifications } = useNotificationStore();
  const location = useLocation();
  const navigate = useNavigate();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications().catch(() => {});
    }
  }, [isAuthenticated, fetchNotifications]);

  if (!isAuthenticated) return null;

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Projects', path: '/projects', icon: FolderGit2 },
    { label: 'My Tasks', path: '/tasks', icon: CheckSquare },
    { label: 'Notifications', path: '/notifications', icon: Bell },
    { label: 'Profile', path: '/profile', icon: UserIcon },
    ...(user?.role === 'ADMIN'
      ? [{ label: 'Admin', path: '/admin', icon: Shield }]
      : []),
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Desktop SideBar (md:flex) */}
      <nav className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 border-r border-[#414a34]/30 bg-[#1f2020] py-8 z-40 select-none">
        {/* Brand Header */}
        <div className="px-6 mb-8">
          <Link to="/dashboard" className="font-display text-2xl font-bold text-white flex items-center gap-3 mb-6 tracking-tight">
            <Hexagon className="w-7 h-7 text-[#a5fa00] fill-[#a5fa00]/20" />
            <span>Dev<span className="text-[#a5fa00]">Forge</span></span>
          </Link>

          {/* Project Context Widget */}
          <div className="flex items-center gap-3 bg-[#121414] border border-[#292a2a] p-3 rounded-lg">
            <div className="w-9 h-9 rounded bg-[#1b1c1c] border border-[#414a34]/40 flex items-center justify-center text-[#a5fa00]">
              <Layers className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <h3 className="font-display font-semibold text-xs text-white truncate">Project Workspace</h3>
              <p className="font-mono-tag text-[10px] text-[#c0caad] mt-0.5">Active Sprint</p>
            </div>
          </div>
        </div>

        {/* Main Navigation Links */}
        <div className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const isNotif = item.path === '/notifications';
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-4 py-3 rounded-md font-mono-tag text-xs transition-all duration-200 ${
                  active
                    ? 'bg-[#474646]/60 text-white border-r-2 border-[#a5fa00] font-semibold translate-x-0.5 shadow-sm'
                    : 'text-[#c0caad] hover:bg-[#292a2a] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon className={`w-4 h-4 ${active ? 'text-[#a5fa00]' : 'text-[#8b947a]'}`} />
                  <span>{item.label}</span>
                </div>

                {isNotif && unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-[#a5fa00] text-[#080808] font-mono-tag text-[10px] font-bold">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* CTA Action */}
        <div className="px-6 my-6">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full btn-primary flex justify-center items-center gap-2 text-xs py-3 rounded-md shadow-md"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            New Project
          </button>
        </div>

        {/* Footer Navigation Links */}
        <div className="px-4 pt-4 border-t border-[#414a34]/30 space-y-1">
          {user && (
            <div className="px-4 py-2 flex items-center justify-between text-xs font-mono-tag text-[#8b947a] mb-1">
              <span className="truncate max-w-[120px]">{user.name}</span>
              <span className="px-1.5 py-0.5 rounded border border-[#414a34] text-[10px] text-[#a5fa00] uppercase">
                {user.role}
              </span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-md font-mono-tag text-xs text-[#c0caad] hover:bg-[#292a2a] hover:text-[#ffb4ab] transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-[#8b947a]" />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* Mobile TopNav Header (md:hidden) */}
      <nav className="md:hidden fixed top-0 left-0 right-0 w-full z-50 bg-[#121414] border-b border-[#292a2a] flex justify-between items-center px-6 h-16 shadow-md">
        <Link to="/dashboard" className="font-display font-bold text-xl text-white flex items-center gap-2">
          <Hexagon className="w-6 h-6 text-[#a5fa00] fill-[#a5fa00]/20" />
          <span>Dev<span className="text-[#a5fa00]">Forge</span></span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="p-2 bg-[#a5fa00] text-[#112000] rounded-md font-bold text-xs flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 text-[#c0caad] hover:text-white transition-colors"
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-40 bg-[#1f2020] border-b border-[#292a2a] p-6 flex flex-col justify-between animate-in slide-in-from-top-4">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-md font-mono-tag text-sm transition-all ${
                    active
                      ? 'bg-[#474646] text-[#a5fa00] font-bold border-l-4 border-[#a5fa00]'
                      : 'text-[#c0caad] hover:bg-[#292a2a] hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-6 border-t border-[#414a34]/40">
            <button
              onClick={() => {
                setIsMobileOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center justify-center gap-2 p-3 bg-[#121414] border border-[#292a2a] text-[#ffb4ab] rounded-md font-mono-tag text-xs"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout Session</span>
            </button>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => fetchProjects()}
      />
    </>
  );
};
