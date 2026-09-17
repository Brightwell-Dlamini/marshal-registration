import React, { useEffect, useState } from 'react';
import { RegistrationPage } from './pages/RegistrationPage';
import { AdminPage } from './pages/AdminPage';

function getPath(): string {
  if (typeof window === 'undefined') return '/';
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  return path;
}

function isAdminPath(path: string): boolean {
  return path === '/admin' || path.startsWith('/admin/');
}

/**
 * Top-level router:
 * - `/`           → Public marshal registration form only
 * - `/admin`      → Staff dashboard + directory (registry)
 * - anything else → redirect to `/`
 */
export default function App() {
  const [path, setPath] = useState(getPath);

  useEffect(() => {
    const onPop = () => setPath(getPath());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Normalize unknown paths to home (except /admin)
  useEffect(() => {
    const p = getPath();
    if (p !== '/' && !isAdminPath(p)) {
      window.history.replaceState(null, '', '/');
      setPath('/');
    }
  }, []);

  if (isAdminPath(path)) {
    return <AdminPage />;
  }

  return <RegistrationPage />;
}
