import { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from '../../context/ToastContext.jsx';
import { useAuthStore } from '../../stores/useAuthStore.js';
import RequireAuth from './RequireAuth.jsx';
import AdminLayout from './AdminLayout.jsx';
import AdminLogin from './AdminLogin.jsx';

// Lazy-load heavy panels
const AdminSettings = lazy(() => import('./AdminSettings.jsx'));
const AdminRoles = lazy(() => import('./AdminRoles.jsx'));
const AdminMapNodes = lazy(() => import('./AdminMapNodes.jsx'));
const AdminJourney = lazy(() => import('./AdminJourney.jsx'));
const AdminCertifications = lazy(() => import('./AdminCertifications.jsx'));
const AdminProjects = lazy(() => import('./AdminProjects.jsx'));
const AdminLatestPost = lazy(() => import('./AdminLatestPost.jsx'));

function PanelFallback() {
  return (
    <div className="flex items-center justify-center h-64 text-muted text-sm">
      Loading…
    </div>
  );
}

export default function AdminApp() {
  const refresh = useAuthStore((s) => s.refresh);

  // Attempt silent token refresh on first load so a returning user stays logged in
  useEffect(() => {
    refresh();
  }, []);

  return (
    <ToastProvider>
      <Routes>
        {/* Public admin route — inside ToastProvider so login errors can toast */}
        <Route path="login" element={<AdminLogin />} />

        {/* All other admin routes require auth */}
        <Route
          path="*"
          element={
            <RequireAuth>
              <AdminLayout>
                <Suspense fallback={<PanelFallback />}>
                  <Routes>
                    {/* Default → settings */}
                    <Route index element={<Navigate to="settings" replace />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route path="roles" element={<AdminRoles />} />
                    <Route path="map-nodes" element={<AdminMapNodes />} />
                    <Route path="journey" element={<AdminJourney />} />
                    <Route path="certifications" element={<AdminCertifications />} />
                    <Route path="projects" element={<AdminProjects />} />
                    <Route path="latest-post" element={<AdminLatestPost />} />
                    {/* Catch-all → settings */}
                    <Route path="*" element={<Navigate to="settings" replace />} />
                  </Routes>
                </Suspense>
              </AdminLayout>
            </RequireAuth>
          }
        />
      </Routes>
    </ToastProvider>
  );
}
