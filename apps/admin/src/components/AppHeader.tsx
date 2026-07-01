import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/app';
import { useAuthStore } from '../stores/auth';

export default function AppHeader() {
  const appStore = useAppStore();
  const authStore = useAuthStore();
  const navigate = useNavigate();
  const roleLabels = authStore.roles.map((role) => role.id).join(', ');
  const headerSubtitle = authStore.user
    ? `${appStore.subtitle} · ${authStore.user.username}`
    : appStore.subtitle;

  async function handleLogout() {
    await authStore.logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex w-full items-center justify-between px-3 py-4 lg:px-4">
        <div>
          <p className="text-lg font-semibold text-slate-900">{appStore.title}</p>
          <p className="text-sm text-slate-500">{headerSubtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          {authStore.user ? (
            <div className="hidden rounded-xl bg-slate-100 px-4 py-2 text-right md:block">
              <p className="text-sm font-medium text-slate-900">{authStore.user.username}</p>
              <p className="text-xs text-slate-500">{roleLabels || '-'}</p>
            </div>
          ) : null}

          {authStore.isAuthenticated ? (
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              onClick={() => {
                void handleLogout();
              }}
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Go to Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
