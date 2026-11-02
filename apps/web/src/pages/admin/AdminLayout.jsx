import React, { useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore.js';

const NAV_LINKS = [
  { to: '/admin/settings', label: 'Settings' },
  { to: '/admin/roles', label: 'Roles' },
  { to: '/admin/map-nodes', label: 'Map Nodes' },
  { to: '/admin/journey', label: 'Journey' },
  { to: '/admin/certifications', label: 'Certifications' },
  { to: '/admin/projects', label: 'Projects' },
  { to: '/admin/latest-post', label: 'Latest Post' },
];

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const sidebarContent = (
    <>
      <div className="mb-5 px-2">
        <span className="font-extrabold text-base tracking-tight text-ink">CMS</span>
        {user && (
          <p className="font-mono text-[10px] text-muted mt-0.5 truncate">{user.email}</p>
        )}
      </div>

      {NAV_LINKS.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) =>
            `rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-accent text-white'
                : 'text-muted hover:text-ink hover:bg-cell'
            }`
          }
        >
          {label}
        </NavLink>
      ))}
    </>
  );

  return (
    <div className="min-h-screen bg-bg font-sans flex flex-col md:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-52 shrink-0 bg-surface border-r border-line flex-col py-6 px-4 gap-1">
        {sidebarContent}
      </aside>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-60 bg-surface flex flex-col py-6 px-4 gap-1 shadow-xl transition-transform duration-200 md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="self-end mb-3 text-muted hover:text-ink text-xl leading-none"
          aria-label="Close menu"
        >
          ✕
        </button>
        {sidebarContent}
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 shrink-0 bg-surface border-b border-line flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only */}
            <button
              className="md:hidden text-muted hover:text-ink p-1"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <rect y="3" width="20" height="2" rx="1"/>
                <rect y="9" width="20" height="2" rx="1"/>
                <rect y="15" width="20" height="2" rx="1"/>
              </svg>
            </button>
            <span className="font-mono text-xs text-muted tracking-widest uppercase">Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-muted hover:text-accent transition-colors"
            >
              View site ↗
            </Link>
            <button
              onClick={handleLogout}
              className="font-mono text-xs text-muted hover:text-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
