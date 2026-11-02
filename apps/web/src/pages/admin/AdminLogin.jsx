import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore.js';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, status, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo / branding */}
        <div className="mb-8 text-center">
          <span className="font-extrabold text-2xl tracking-tight text-ink">Portfolio CMS</span>
          <p className="font-mono text-xs text-muted mt-1 tracking-widest uppercase">Admin Access</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-surface rounded-3xl p-8 border border-line shadow-sm"
          noValidate
        >
          <h1 className="text-xl font-bold text-ink mb-6">Sign in</h1>

          {error && (
            <div
              role="alert"
              className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 font-mono"
            >
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="email" className="block font-mono text-xs text-muted mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-line bg-cell px-4 py-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block font-mono text-xs text-muted mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-line bg-cell px-4 py-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="mt-6 w-full bg-accent text-white font-semibold rounded-xl py-3 px-4 text-sm hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {status === 'loading' ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

