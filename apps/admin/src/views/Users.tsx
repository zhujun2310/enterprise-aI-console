import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Role, RoleId, User } from '@enterprise-ai-console/auth';
import {
  createUserRequest,
  deleteUserRequest,
  getUsersRequest,
  updateUserRolesRequest
} from '../api/auth';
import { useAuthStore } from '../stores/auth';

type DraftRoleMap = Record<string, RoleId[]>;

export default function Users() {
  const authStore = useAuthStore();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [roleDrafts, setRoleDrafts] = useState<DraftRoleMap>({});
  const [createForm, setCreateForm] = useState<{
    username: string;
    primaryRole: RoleId;
  }>({
    username: '',
    primaryRole: 'viewer'
  });

  const availableRoleIds = useMemo<RoleId[]>(
    () => availableRoles.map((role) => role.id as RoleId),
    [availableRoles]
  );

  const syncDrafts = useCallback((nextUsers: User[]) => {
    setRoleDrafts(
      Object.fromEntries(
        nextUsers.map((user) => [user.id, user.roles.map((role) => role.id as RoleId)])
      )
    );
  }, []);

  const loadUsers = useCallback(async () => {
    if (!authStore.token) {
      setFeedback('Current session is missing an access token.');
      return;
    }

    try {
      const response = await getUsersRequest(authStore.token);
      setUsers(response.users);
      setAvailableRoles(response.roles);
      syncDrafts(response.users);

      const nextAvailableRoleIds = response.roles.map((role) => role.id as RoleId);
      setCreateForm((current) => ({
        ...current,
        primaryRole: nextAvailableRoleIds.includes(current.primaryRole)
          ? current.primaryRole
          : (nextAvailableRoleIds[0] ?? 'viewer')
      }));
    } catch (error: unknown) {
      setFeedback(error instanceof Error ? error.message : 'Failed to load users.');
    }
  }, [authStore.token, syncDrafts]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  function getPermissionIdsByUser(user: User): string[] {
    return Array.from(
      new Set(user.roles.flatMap((role) => role.permissions.map((permission) => permission.id)))
    );
  }

  function isRoleChecked(userId: string, roleId: string): boolean {
    return roleDrafts[userId]?.includes(roleId as RoleId) ?? false;
  }

  function toggleRole(userId: string, roleId: RoleId, event: ChangeEvent<HTMLInputElement>) {
    if (!availableRoleIds.includes(roleId)) {
      return;
    }

    setRoleDrafts((current) => {
      const currentRoles = current[userId] ?? [];

      if (event.target.checked) {
        return {
          ...current,
          [userId]: Array.from(new Set([...currentRoles, roleId]))
        };
      }

      return {
        ...current,
        [userId]: currentRoles.filter((currentRoleId) => currentRoleId !== roleId)
      };
    });
  }

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!authStore.token) {
      setFeedback('Current session is missing an access token.');
      return;
    }

    const username = createForm.username.trim();

    if (!username) {
      setFeedback('Please enter a username.');
      return;
    }

    try {
      const response = await createUserRequest(authStore.token, username, [createForm.primaryRole]);
      setFeedback(response.message);
      setCreateForm({
        username: '',
        primaryRole: availableRoleIds[0] ?? 'viewer'
      });
      await loadUsers();
    } catch (error: unknown) {
      setFeedback(error instanceof Error ? error.message : 'Failed to create user.');
    }
  }

  async function saveRoles(userId: string) {
    if (!authStore.token) {
      setFeedback('Current session is missing an access token.');
      return;
    }

    const nextRoleIds = roleDrafts[userId] ?? [];

    if (nextRoleIds.length === 0) {
      setFeedback('At least one role must remain assigned.');
      return;
    }

    try {
      const response = await updateUserRolesRequest(authStore.token, userId, nextRoleIds);
      setFeedback(response.message);
      await loadUsers();

      if (authStore.user?.id === userId) {
        await authStore.refreshCurrentUser();

        if (!authStore.hasPermission('user:create')) {
          navigate('/dashboard', { replace: true });
        }
      }
    } catch (error: unknown) {
      setFeedback(error instanceof Error ? error.message : 'Failed to save roles.');
    }
  }

  async function removeUser(userId: string) {
    if (!authStore.token) {
      setFeedback('Current session is missing an access token.');
      return;
    }

    try {
      const response = await deleteUserRequest(authStore.token, userId);
      setFeedback(response.message);
      await loadUsers();
    } catch (error: unknown) {
      setFeedback(error instanceof Error ? error.message : 'Failed to delete user.');
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">RBAC</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">User Management</h1>
          <p className="mt-2 text-slate-500">管理用户列表、分配角色，并查看角色对应权限。</p>
        </div>

        <form
          className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_auto_auto]"
          onSubmit={createUser}
        >
          <input
            value={createForm.username}
            type="text"
            placeholder="New username"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-400"
            onChange={(event) => {
              setCreateForm((current) => ({
                ...current,
                username: event.target.value
              }));
            }}
          />
          <select
            value={createForm.primaryRole}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-400"
            onChange={(event) => {
              setCreateForm((current) => ({
                ...current,
                primaryRole: event.target.value as RoleId
              }));
            }}
          >
            {availableRoles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          {authStore.hasPermission('user:create') ? (
            <button
              type="submit"
              className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400"
            >
              Create User
            </button>
          ) : null}
        </form>
      </div>

      {feedback ? (
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-800">
          {feedback}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        {users.map((user) => (
          <article
            key={user.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold text-slate-900">{user.username}</p>
                  {authStore.user?.id === user.id ? (
                    <span className="rounded-full bg-cyan-100 px-2 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-cyan-700">
                      current
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-slate-500">User ID: {user.id}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {user.roles.map((role) => (
                  <span
                    key={`${user.id}-${role.id}`}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    {role.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-900">角色分配</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {availableRoles.map((role) => (
                    <label
                      key={`${user.id}-${role.id}-checkbox`}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
                    >
                      <input
                        checked={isRoleChecked(user.id, role.id)}
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-cyan-500 focus:ring-cyan-500"
                        onChange={(event) => {
                          toggleRole(user.id, role.id as RoleId, event);
                        }}
                      />
                      <span>{role.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-900">生效权限</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {getPermissionIdsByUser(user).map((permissionId) => (
                    <span
                      key={`${user.id}-${permissionId}`}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600"
                    >
                      {permissionId}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {authStore.hasPermission('user:edit') ? (
                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                    onClick={() => {
                      void saveRoles(user.id);
                    }}
                  >
                    Save Roles
                  </button>
                ) : null}
                {authStore.hasPermission('user:delete') ? (
                  <button
                    type="button"
                    disabled={authStore.user?.id === user.id}
                    className="rounded-xl border border-rose-200 px-4 py-2 text-sm text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => {
                      void removeUser(user.id);
                    }}
                  >
                    Delete User
                  </button>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
