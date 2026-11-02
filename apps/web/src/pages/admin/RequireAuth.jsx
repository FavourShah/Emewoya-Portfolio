import React, { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore.js';

/**
 * Route guard: redirect to /admin/login if not authenticated.
 * On first render, attempts a silent token refresh to restore an existing session.
 */
export default function RequireAuth({ children }) {
  const { accessToken, status, refresh } = useAuthStore();
  const location = useLocation();
  const hasAttemptedRefresh = useRef(false);

  useEffect(() => {
    // Attempt silent refresh once on mount if not yet authenticated
    if (!hasAttemptedRefresh.current && status === 'idle') {
      hasAttemptedRefresh.current = true;
      refresh();
    }
  }, [status, refresh]);

  // While we haven't yet determined auth state, show a loading spinner
  if (status === 'idle' || status === 'loading') {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <span className="font-mono text-xs text-muted tracking-widest animate-pulse uppercase">
          Restoring session…
        </span>
      </div>
    );
  }

  if (!accessToken) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}

