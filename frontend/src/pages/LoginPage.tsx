import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const validate = () => {
    const errors: { email?: string; password?: string } = {};
    if (!email) errors.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Please enter a valid email address';

    if (!password) errors.password = 'Password is required';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      // Error in store
    }
  };

  return (
    <div className="min-h-screen bg-[#121414] text-[#e3e2e2] flex items-center justify-center p-6 md:p-16 antialiased selection:bg-[#a5fa00] selection:text-[#0d0e0f]">
      {/* Login Canvas (No Nav Shell per Transactional Rule) */}
      <main className="w-full max-w-[440px] relative glow-effect rounded-xl">
        <div className="bg-[#121414] border border-[#414a34] rounded-xl p-8 md:p-12 flex flex-col items-center shadow-2xl">
          {/* Brand Header */}
          <div className="flex flex-col items-center mb-10 w-full text-center">
            <div className="mb-6 flex items-center justify-center">
              {/* Minimalist Geometric Logo */}
              <svg className="text-[#a5fa00]" fill="none" height="48" viewBox="0 0 32 32" width="48" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5"></path>
                <path d="M16 2V16L28 9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
                <path d="M4 9L16 16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
              </svg>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight">
              Dev<span className="text-[#a5fa00]">Forge</span>
            </h1>
            <p className="font-sans text-sm text-[#c0caad] mt-2">Sign in to your workspace</p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="w-full flex items-center gap-2 p-3 bg-[#93000a]/20 border border-[#ffb4ab]/30 rounded-md text-xs text-[#ffb4ab] mb-6">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form Container */}
          <form onSubmit={handleSubmit} className="w-full space-y-6">
            {/* Email Field */}
            <div className="flex flex-col space-y-2">
              <label className="font-mono-tag text-xs text-[#c0caad] uppercase" htmlFor="email">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b947a] group-focus-within:text-[#a5fa00] transition-colors pointer-events-none" />
                <input
                  id="email"
                  name="email"
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
              {fieldErrors.email && (
                <span className="text-xs text-[#ffb4ab] mt-0.5">{fieldErrors.email}</span>
              )}
            </div>

            {/* Password Field */}
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center">
                <label className="font-mono-tag text-xs text-[#c0caad] uppercase" htmlFor="password">
                  Password
                </label>
              </div>
              <div className="relative group">
                <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b947a] group-focus-within:text-[#a5fa00] transition-colors pointer-events-none" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-[#1b1c1c] border ${
                    fieldErrors.password ? 'border-[#ffb4ab]' : 'border-[#414a34]'
                  } rounded py-3 pl-11 pr-4 font-sans text-sm text-[#e3e2e2] placeholder-[#656464] focus:border-[#a5fa00] focus:ring-1 focus:ring-[#a5fa00] focus:outline-none transition-all shadow-sm`}
                  required
                />
              </div>
              {fieldErrors.password && (
                <span className="text-xs text-[#ffb4ab] mt-0.5">{fieldErrors.password}</span>
              )}
            </div>

            {/* Submit Action */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#a5fa00] text-[#112000] font-display text-base font-bold py-3 px-4 rounded hover:bg-[#90db00] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Entering Workspace...</span>
                ) : (
                  <>
                    <span>Enter Workspace</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Registration Link */}
          <div className="mt-8 text-center border-t border-[#414a34]/40 pt-6 w-full">
            <p className="font-sans text-sm text-[#c0caad]">
              New to the forge?{' '}
              <Link to="/register" className="text-[#a5fa00] hover:underline transition-colors font-medium ml-1">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
