import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Terminal, LayoutDashboard, FolderGit2, CheckSquare, Bell, User as UserIcon, LogOut } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleVariant = (role?: string) => {
    switch (role) {
      case 'ADMIN': return 'admin';
      case 'LEADER': return 'leader';
      default: return 'member';
    }
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Projects', path: '/projects', icon: FolderGit2 },
    { label: 'My Tasks', path: '/tasks', icon: CheckSquare },
    { label: 'Notifications', path: '/notifications', icon: Bell },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#121414]/90 backdrop-blur-md border-b border-[#242424]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-[#1b1c1c] border border-[#242424] group-hover:border-[#A8FF00] rounded-md flex items-center justify-center transition-colors">
              <Terminal className="w-5 h-5 text-[#A8FF00]" />
            </div>
            <div>
              <span className="font-display font-bold text-lg text-white tracking-tight">
                DEV<span className="text-[#A8FF00]">FORGE</span>
              </span>
            </div>
          </Link>

          {/* Primary Navigation Links */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono-tag transition-colors ${
                      active
                        ? 'bg-[#1b1c1c] text-[#A8FF00] border border-[#A8FF00]/40'
                        : 'text-[#8b947a] hover:text-white hover:bg-[#1f2020]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {/* User Session Profile & Controls */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <>
              <Link to="/profile" className="flex items-center gap-2">
                <Badge variant={getRoleVariant(user.role)}>
                  {user.role}
                </Badge>
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#e3e2e2] bg-[#1b1c1c] border border-[#242424] px-2.5 py-1.5 rounded-md hover:border-[#414a34] transition-colors">
                  <UserIcon className="w-3.5 h-3.5 text-[#A8FF00]" />
                  <span>{user.name}</span>
                </div>
              </Link>

              <Button variant="secondary" size="sm" onClick={handleLogout} className="gap-1.5">
                <LogOut className="w-3.5 h-3.5 text-[#8b947a]" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
