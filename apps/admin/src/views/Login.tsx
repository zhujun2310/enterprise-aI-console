import { useMemo, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';

type PresetRole = 'admin' | 'viewer';

export default function Login() {
  const authStore = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [form, setForm] = useState({
    username: 'admin',
    password: 'admin123'
  });

  const redirectPath = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('redirect') || '/dashboard';
  }, [location.search]);

  function applyPreset(role: PresetRole) {
    if (role === 'admin') {
      setForm({
        username: 'admin',
        password: 'admin123'
      });
      return;
    }

    setForm({
      username: 'viewer',
      password: 'viewer123'
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      await authStore.login(form.username, form.password);
      navigate(redirectPath, { replace: true });
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Enterprise AI Console</p>
        <h1 className="mt-3 text-3xl font-semibold">Login</h1>
        <p className="mt-2 text-sm text-slate-300">
          使用 `admin / admin123` 或 `viewer / viewer123` 验证 RBAC 链路。
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Username</span>
            <input
              value={form.username}
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 outline-none transition focus:border-cyan-400"
              type="text"
              autoComplete="username"
              onChange={(event) => {
                setForm((current) => ({
                  ...current,
                  username: event.target.value
                }));
              }}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Password</span>
            <input
              value={form.password}
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 outline-none transition focus:border-cyan-400"
              type="password"
              autoComplete="current-password"
              onChange={(event) => {
                setForm((current) => ({
                  ...current,
                  password: event.target.value
                }));
              }}
            />
          </label>

          {errorMessage ? (
            <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-xl bg-cyan-400 px-4 py-3 text-sm font-medium text-slate-950 transition hover:bg-cyan-300"
            disabled={submitting}
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            className="rounded-xl border border-white/10 px-4 py-3 text-left text-sm transition hover:border-cyan-400"
            onClick={() => {
              applyPreset('admin');
            }}
          >
            <span className="block font-medium text-white">Admin</span>
            <span className="mt-1 block text-slate-300">Full permissions</span>
          </button>
          <button
            type="button"
            className="rounded-xl border border-white/10 px-4 py-3 text-left text-sm transition hover:border-cyan-400"
            onClick={() => {
              applyPreset('viewer');
            }}
          >
            <span className="block font-medium text-white">Viewer</span>
            <span className="mt-1 block text-slate-300">Read-only dashboard access</span>
          </button>
        </div>
      </div>
    </div>
  );
}
