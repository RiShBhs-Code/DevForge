import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { User as UserIcon, Shield, Mail, Calendar, CheckCircle2, AlertCircle, LogOut } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, logout, isLoading, error, clearError } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccessMessage(null);

    try {
      await updateProfile(name, email);
      setSuccessMessage('Profile updated successfully.');
    } catch {
      // Error handled in store
    }
  };

  const getRoleVariant = (role?: string) => {
    switch (role) {
      case 'ADMIN': return 'admin';
      case 'LEADER': return 'leader';
      default: return 'member';
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#242424]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold font-display text-white tracking-tight">
              Developer Profile
            </h1>
            <Badge variant={getRoleVariant(user?.role)}>
              {user?.role}
            </Badge>
          </div>
          <p className="text-sm text-[#8b947a] mt-1 font-sans">
            Manage your account credentials and system identity
          </p>
        </div>

        <Button variant="secondary" size="md" onClick={logout} className="gap-2 self-start md:self-auto">
          <LogOut className="w-4 h-4 text-[#8b947a]" />
          Logout Session
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card level={2} className="md:col-span-1 border-[#242424] flex flex-col items-center text-center p-6">
          <div className="w-20 h-20 bg-[#1b1c1c] border-2 border-[#A8FF00] rounded-full flex items-center justify-center mb-4 text-[#A8FF00] shadow-lg">
            <UserIcon className="w-10 h-10" />
          </div>
          
          <h2 className="font-display font-bold text-xl text-white">{user?.name}</h2>
          <p className="text-xs text-[#8b947a] font-mono-tag mt-1">{user?.email}</p>

          <div className="w-full mt-6 pt-4 border-t border-[#242424] flex flex-col gap-3 text-left">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8b947a] flex items-center gap-1.5 font-mono-tag">
                <Shield className="w-3.5 h-3.5 text-[#A8FF00]" /> SYSTEM ROLE
              </span>
              <span className="font-bold text-white">{user?.role}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8b947a] flex items-center gap-1.5 font-mono-tag">
                <Calendar className="w-3.5 h-3.5 text-[#8b947a]" /> MEMBER SINCE
              </span>
              <span className="text-[#e3e2e2]">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </Card>

        <Card level={2} className="md:col-span-2 border-[#242424]">
          <h3 className="font-display font-bold text-lg text-white mb-4 flex items-center gap-2">
            Edit Account Details
          </h3>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-[#93000a]/20 border border-[#ffb4ab]/30 rounded-md text-xs text-[#ffb4ab]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="flex items-center gap-2 p-3 bg-[#A8FF00]/10 border border-[#A8FF00]/30 rounded-md text-xs text-[#A8FF00]">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <Input
              label="FULL NAME"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="EMAIL ADDRESS"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="primary" size="md" isLoading={isLoading}>
                Save Profile Changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
