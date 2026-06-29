import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import {
  defaultMenus,
  filterMenus,
  getPermissionIds,
  getPermissionsByUser,
  getStoredToken,
  getUserInfo,
  hasPermission as checkPermission,
  logout as clearStoredAuth,
  persistToken,
  type Menu,
  type Permission,
  type Role,
  type User
} from '../../../../packages/auth/dist/index.js';
import { getUserInfoRequest, loginRequest, logoutRequest } from '../api/auth';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(getUserInfo());
  const token = ref<string | null>(getStoredToken());
  const hydrated = ref(false);
  const routesReady = ref(false);
  const lastError = ref<string | null>(null);

  const roles = computed<Role[]>(() => user.value?.roles ?? []);
  const permissions = computed<Permission[]>(() => getPermissionsByUser(user.value));
  const permissionIds = computed<string[]>(() => getPermissionIds(user.value));
  const menus = computed<Menu[]>(() => filterMenus(defaultMenus, permissionIds.value));
  const isAuthenticated = computed<boolean>(() => Boolean(token.value && user.value));

  function setUser(nextUser: User | null): void {
    user.value = nextUser;
  }

  function setToken(nextToken: string | null): void {
    token.value = nextToken;
  }

  function markRoutesReady(value: boolean): void {
    routesReady.value = value;
  }

  async function hydrate(): Promise<void> {
    if (!token.value) {
      hydrated.value = true;
      return;
    }

    try {
      const response = await getUserInfoRequest(token.value);
      setUser(response.user);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to restore session.';
      lastError.value = message;
      resetSession();
    } finally {
      hydrated.value = true;
    }
  }

  async function login(username: string, password: string): Promise<void> {
    const result = await loginRequest(username, password);

    persistToken(result.token, result.refreshToken);
    setToken(result.token);

    const response = await getUserInfoRequest(result.token);
    setUser(response.user);
    routesReady.value = false;
    hydrated.value = true;
    lastError.value = null;
  }

  async function logout(): Promise<void> {
    if (token.value) {
      try {
        await logoutRequest(token.value);
      } catch {
        // Ignore logout transport failures and clear the local session anyway.
      }
    }

    resetSession();
  }

  function resetSession(): void {
    clearStoredAuth();
    setToken(null);
    setUser(null);
    routesReady.value = false;
  }

  function hasPermission(code: string | string[]): boolean {
    return checkPermission(user.value, code);
  }

  return {
    user,
    token,
    roles,
    permissions,
    permissionIds,
    menus,
    hydrated,
    routesReady,
    lastError,
    isAuthenticated,
    setUser,
    setToken,
    markRoutesReady,
    hydrate,
    login,
    logout,
    hasPermission,
    resetSession
  };
});
