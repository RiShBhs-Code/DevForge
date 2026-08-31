import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectWorkspacePage } from './pages/ProjectWorkspacePage';
import { MyTasksPage } from './pages/MyTasksPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { useAuthStore } from './stores/authStore';

const ProtectedLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#121414] text-[#e3e2e2] flex font-sans selection:bg-[#a5fa00] selection:text-[#0d0e0f]">
      <Sidebar />
      <div className="flex-1 md:ml-64 pt-16 md:pt-0 min-h-screen flex flex-col w-full">
        <Outlet />
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  const { fetchMe, token } = useAuthStore();

  useEffect(() => {
    if (token) {
      fetchMe();
    }
  }, [token, fetchMe]);

  return (
    <Router>
      <Routes>
        {/* Public Auth Routes (No Sidebar Shell per Stitch transactional rule) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected App Routes with Stitch Sidebar Layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:id" element={<ProjectWorkspacePage />} />
            <Route path="/tasks" element={<MyTasksPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Route>

        {/* Fallback Redirection */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
