import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Mail, Lock, User as UserIcon, ArrowRight, AlertCircle, Shield } from 'lucide-react';
import { UserRole } from '../types';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('MEMBER');
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  const { register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const validate = () => {
    const errors: { name?: string; email?: string; password?: string } = {};
    if (!name.trim()) errors.name = 'Full name is required';
    if (!email) errors.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Please enter a valid email address';

    if (!password) errors.password = 'Password is required';
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;

    try {
      await register(name, email, password, role);
      navigate('/dashboard');
    } catch {
      // Error handled in store
    }
  };

  return (
    <div className="min-h-screen bg-[#121414] text-[#e3e2e2] flex items-center justify-center p-6 md:p-16 antialiased selection:bg-[#a5fa00] selection:text-[#0d0e0f]">
      <main className="w-full max-w-[480px] relative glow-effect rounded-xl">
        <div className="bg-[#121414] border border-[#414a34] rounded-xl p-8 md:p-12 flex flex-col items-center shadow-2xl">
          {/* Brand Header */}
          <div className="flex flex-col items-center mb-8 w-full text-center">
            <div className="mb-4 flex items-center justify-center">
              <svg className="text-[#a5fa00]" fill="none" height="48" viewBox="0 0 32 32" width="48" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5"></path>
                <path d="M16 2V16L28 9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
                <path d="M4 9L16 16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
              </svg>
            </div>
            <h1 className="font-display text-3xl font-bold text-white tracking-tight">
              Dev<span className="text-[#a5fa00]">Forge</span>
            </h1>
            <p className="font-sans text-sm text-[#c0caad] mt-1">Forge your developer account</p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="w-full flex items-center gap-2 p-3 bg-[#93000a]/20 border border-[#ffb4ab]/30 rounded-md text-xs text-[#ffb4ab] mb-6">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-5">
            {/* Full Name */}
            <div className="flex flex-col space-y-1.5">
              <label className="font-mono-tag text-xs text-[#c0caad] uppercase" htmlFor="name">
                Full Name
              </label>
              <div className="relative group">
                <UserIcon className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b947a] group-focus-within:text-[#a5fa00] transition-colors pointer-events-none" />
                <input
                  id="name"
                  type="text"
                  placeholder="Aryan Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full bg-[#1b1c1c] border ${
                    fieldErrors.name ? 'border-[#ffb4ab]' : 'border-[#414a34]'
                  } rounded py-3 pl-11 pr-4 font-sans text-sm text-[#e3e2e2] placeholder-[#656464] focus:border-[#a5fa00] focus:ring-1 focus:ring-[#a5fa00] focus:outline-none transition-all shadow-sm`}
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="flex flex-col space-y-1.5">
              <label className="font-mono-tag text-xs text-[#c0caad] uppercase" htmlFor="email">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b947a] group-focus-within:text-[#a5fa00] transition-colors pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  placeholder="developer@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full bg-[#1b1c1c] border ${
                    fieldErrors.email ? 'border-[#ffb4ab]' : 'border-[#414a34]'
                  } rounded py-3 pl-11 pr-4 font-sans text-sm text-[#e3e2e2] placeholder-[#656464] focus:border-[#a5fa00] focus:ring-1 focus:ring-[#a5fa00] focus:outline-none transition-all shadow-sm`}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col space-y-1.5">
              <label className="font-mono-tag text-xs text-[#c0caad] uppercase" htmlFor="password">
                Password
              </label>
              <div className="relative group">
                <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b947a] group-focus-within:text-[#a5fa00] transition-colors pointer-events-none" />
                <input
                  id="password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-[#1b1c1c] border ${
                    fieldErrors.password ? 'border-[#ffb4ab]' : 'border-[#414a34]'
                  } rounded py-3 pl-11 pr-4 font-sans text-sm text-[#e3e2e2] placeholder-[#656464] focus:border-[#a5fa00] focus:ring-1 focus:ring-[#a5fa00] focus:outline-none transition-all shadow-sm`}
                  required
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="flex flex-col space-y-1.5">
              <label className="font-mono-tag text-xs text-[#c0caad] uppercase">Initial System Role</label>
              <div className="grid grid-cols-3 gap-2">
                {(['MEMBER', 'LEADER', 'ADMIN'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2 px-3 text-xs font-mono-tag rounded border transition-all cursor-pointer ${
                      role === r
                        ? 'border-[#a5fa00] bg-[#a5fa00]/10 text-[#a5fa00] font-bold'
                        : 'border-[#414a34] bg-[#1b1c1c] text-[#8b947a] hover:border-[#8b947a]'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#a5fa00] text-[#112000] font-display text-base font-bold py-3 px-4 rounded hover:bg-[#90db00] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Create Developer Account</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center border-t border-[#414a34]/40 pt-6 w-full">
            <p className="font-sans text-sm text-[#c0caad]">
              Already forged an account?{' '}
              <Link to="/login" className="text-[#a5fa00] hover:underline transition-colors font-medium ml-1">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
