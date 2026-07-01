import type { ReactNode } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import { useAuthStore } from '../stores/auth';
import Agents from '../views/Agents';
import AiCopilot from '../views/AiCopilot';
import Dashboard from '../views/Dashboard';
import Forbidden from '../views/Forbidden';
import Login from '../views/Login';
import Screens from '../views/Screens';
import System from '../views/System';
import Users from '../views/Users';
import Workflows from '../views/Workflows';
import DeviceCenterShell from '../modules/device';
import DeviceListView from '../modules/device/views/DeviceList';
import DeviceDetailView from '../modules/device/views/DeviceDetail';
import DeviceMonitorView from '../modules/device/views/DeviceMonitor';
import AlarmCenterView from '../modules/device/views/AlarmCenter';
import OperationCenterView from '../modules/device/views/OperationCenter';

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
            <Route
              path="/devices"
              element={
                <PermissionRoute permissionCode="device:view">
                  <DeviceCenterShell />
                </PermissionRoute>
              }
            >
              <Route index element={<DeviceListView />} />
              <Route path="alarms" element={<AlarmCenterView />} />
              <Route path="ops" element={<OperationCenterView />} />
              <Route path=":deviceId/monitor" element={<DeviceMonitorView />} />
              <Route path=":deviceId" element={<DeviceDetailView />} />
            </Route>
            <Route
              path="/ai-copilot"
              element={
                <PermissionRoute permissionCode="dashboard:view">
                  <AiCopilot />
                </PermissionRoute>
              }
            />
            <Route
              path="/agents"
              element={
                <PermissionRoute permissionCode="dashboard:view">
                  <Agents />
                </PermissionRoute>
              }
            />
            <Route
              path="/workflows"
              element={
                <PermissionRoute permissionCode="dashboard:view">
                  <Workflows />
                </PermissionRoute>
              }
            />
            <Route
              path="/screens"
              element={
                <PermissionRoute permissionCode="dashboard:view">
                  <Screens />
                </PermissionRoute>
              }
            />
            <Route
              path="/system"
              element={
                <PermissionRoute permissionCode="dashboard:view">
                  <System />
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
