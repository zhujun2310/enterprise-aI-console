import type { ReactNode } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import { useAuthStore } from '../stores/auth';
import Dashboard from '../views/Dashboard';
import Forbidden from '../views/Forbidden';
import Login from '../views/Login';
import Users from '../views/Users';

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-sm text-slate-300">
      Restoring session...
    </div>
  );
}

function RequireAuth({ children }: { children: ReactNode }) {
  const authStore = useAuthStore();
  const location = useLocation();

  if (!authStore.hydrated) {
    return <LoadingScreen />;
  }

  if (!authStore.isAuthenticated) {
    const redirect = `${location.pathname}${location.search}`;
    return <Navigate replace to={`/login?redirect=${encodeURIComponent(redirect)}`} />;
  }

  return <>{children}</>;
}

function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const authStore = useAuthStore();

  if (!authStore.hydrated) {
    return <LoadingScreen />;
  }

  if (authStore.isAuthenticated) {
    return <Navigate replace to="/dashboard" />;
  }

  return <>{children}</>;
}

function PermissionRoute({
  permissionCode,
  children
}: {
  permissionCode: string;
  children: ReactNode;
}) {
  const authStore = useAuthStore();

  if (!authStore.hasPermission(permissionCode)) {
    return <Navigate replace to="/403" />;
  }

  return <>{children}</>;
}

function RootRedirect() {
  const authStore = useAuthStore();

  if (!authStore.hydrated) {
    return <LoadingScreen />;
  }

  return <Navigate replace to={authStore.isAuthenticated ? '/dashboard' : '/login'} />;
}

function ProtectedShell() {
  return (
    <RequireAuth>
      <AdminLayout />
    </RequireAuth>
  );
}

function ProtectedOutlet() {
  return <Outlet />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route element={<ProtectedShell />}>
          <Route element={<ProtectedOutlet />}>
            <Route
              path="/dashboard"
              element={
                <PermissionRoute permissionCode="dashboard:view">
                  <Dashboard />
                </PermissionRoute>
              }
            />
            <Route
              path="/users"
              element={
                <PermissionRoute permissionCode="user:create">
                  <Users />
                </PermissionRoute>
              }
            />
            <Route path="/403" element={<Forbidden />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
