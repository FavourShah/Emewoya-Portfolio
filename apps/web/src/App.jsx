import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import PublicSite from './pages/PublicSite.jsx';

// Lazy-load admin app per 04-frontend.md
const AdminApp = lazy(() => import('./pages/admin/AdminApp.jsx'));

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicSite />} />
      <Route
        path="/admin/*"
        element={
          <Suspense
            fallback={
              <div className="min-h-screen bg-bg flex items-center justify-center font-mono text-sm text-muted">
                Loading admin...
              </div>
            }
          >
            <AdminApp />
          </Suspense>
        }
      />
    </Routes>
  );
}
