import { useCallback, useEffect, useMemo, useState } from 'react';
import { createUserRequest, getDashboardSummaryRequest } from '../api/auth';
import { useAuthStore } from '../stores/auth';

interface DashboardCard {
  title: string;
  value: string;
  description: string;
}

export default function Dashboard() {
  const authStore = useAuthStore();
  const [summaryMessage, setSummaryMessage] = useState('');
  const roleSummary = authStore.roles.map((role) => role.id).join(', ');

  const cards = useMemo<DashboardCard[]>(
    () => [
      {
        title: 'Workspace',
        value: 'Ready',
        description: 'Monorepo and RBAC scaffolding are initialized.'
      },
      {
        title: 'Active Roles',
        value: roleSummary || 'none',
        description: 'Current roles are resolved from the authenticated session.'
      },
      {
        title: 'Permissions',
        value: String(authStore.permissionIds.length),
        description: 'Permissions are reflected in routing, menus, buttons, and API access.'
      }
    ],
    [authStore.permissionIds.length, roleSummary]
  );

  const loadSummary = useCallback(async () => {
    if (!authStore.token) {
      setSummaryMessage('Missing access token.');
      return;
    }

    try {
      const response = await getDashboardSummaryRequest(authStore.token);
      setSummaryMessage(response.message);
    } catch (error: unknown) {
      setSummaryMessage(error instanceof Error ? error.message : 'Failed to load summary.');
    }
  }, [authStore.token]);

  const createUser = useCallback(async () => {
    if (!authStore.token) {
      setSummaryMessage('Missing access token.');
      return;
    }

    try {
      const response = await createUserRequest(authStore.token, `user-${Date.now()}`, ['viewer']);
      setSummaryMessage(response.message);
    } catch (error: unknown) {
      setSummaryMessage(error instanceof Error ? error.message : 'Failed to create user.');
    }
  }, [authStore.token]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Overview</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-slate-500">
          该页面用于验证登录状态、权限集合、API 鉴权与按钮级权限控制。
        </p>
      </div>

      {summaryMessage ? (
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-800">
          {summaryMessage}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <article key={card.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm text-slate-500">{card.title}</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">{card.value}</p>
            <p className="mt-2 text-sm text-slate-500">{card.description}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-lg font-semibold text-slate-900">Current Session</p>
          <dl className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex justify-between gap-4">
              <dt>Username</dt>
              <dd className="font-medium text-slate-900">{authStore.user?.username ?? '-'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Roles</dt>
              <dd className="font-medium text-slate-900">{roleSummary || '-'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Permissions</dt>
              <dd className="font-medium text-slate-900">
                {authStore.permissionIds.join(', ') || '-'}
              </dd>
            </div>
          </dl>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-lg font-semibold text-slate-900">Permission Actions</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {authStore.hasPermission('dashboard:view') ? (
              <button
                type="button"
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                onClick={() => {
                  void loadSummary();
                }}
              >
                Refresh Summary
              </button>
            ) : null}
            {authStore.hasPermission('user:create') ? (
              <button
                type="button"
                className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400"
                onClick={() => {
                  void createUser();
                }}
              >
                Create User API
              </button>
            ) : null}
          </div>
        </article>
      </div>
    </section>
  );
}
