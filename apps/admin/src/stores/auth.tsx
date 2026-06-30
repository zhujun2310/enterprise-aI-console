import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';
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
} from '@enterprise-ai-console/auth';
import { getUserInfoRequest, loginRequest, logoutRequest } from '../api/auth';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  roles: Role[];
  permissions: Permission[];
  permissionIds: string[];
  menus: Menu[];
  hydrated: boolean;
  lastError: string | null;
  isAuthenticated: boolean;
  refreshCurrentUser: () => Promise<void>;
  hydrate: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (code: string | string[]) => boolean;
  resetSession: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getUserInfo());
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [hydrated, setHydrated] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const resetSession = useCallback(() => {
    clearStoredAuth();
    setToken(null);
    setUser(null);
  }, []);

  const hydrate = useCallback(async () => {
    const storedToken = getStoredToken();

    if (!storedToken) {
      setToken(null);
      setUser(null);
      setHydrated(true);
      return;
    }

    setToken(storedToken);

    try {
      const response = await getUserInfoRequest(storedToken);
      setUser(response.user);
      setLastError(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to restore session.';
      setLastError(message);
      resetSession();
    } finally {
      setHydrated(true);
    }
  }, [resetSession]);

  const refreshCurrentUser = useCallback(async () => {
    const activeToken = token ?? getStoredToken();

    if (!activeToken) {
      return;
    }

    const response = await getUserInfoRequest(activeToken);
    setUser(response.user);
    setLastError(null);
  }, [token]);

  const login = useCallback(async (username: string, password: string) => {
    const result = await loginRequest(username, password);
    persistToken(result.token, result.refreshToken);
    setToken(result.token);

    const response = await getUserInfoRequest(result.token);
    setUser(response.user);
    setHydrated(true);
    setLastError(null);
  }, []);

  const logout = useCallback(async () => {
    const activeToken = token ?? getStoredToken();

    if (activeToken) {
      try {
        await logoutRequest(activeToken);
      } catch {
        // Ignore transport failures and clear local auth regardless.
      }
    }

    resetSession();
  }, [resetSession, token]);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const roles = useMemo<Role[]>(() => user?.roles ?? [], [user]);
  const permissions = useMemo<Permission[]>(() => getPermissionsByUser(user), [user]);
  const permissionIds = useMemo<string[]>(() => getPermissionIds(user), [user]);
  const menus = useMemo<Menu[]>(() => filterMenus(defaultMenus, permissionIds), [permissionIds]);
  const isAuthenticated = Boolean(token && user);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      roles,
      permissions,
      permissionIds,
      menus,
      hydrated,
      lastError,
      isAuthenticated,
      refreshCurrentUser,
      hydrate,
      login,
      logout,
      hasPermission: (code: string | string[]) => checkPermission(user, code),
      resetSession
    }),
    [
      user,
      token,
      roles,
      permissions,
      permissionIds,
      menus,
      hydrated,
      lastError,
      isAuthenticated,
      refreshCurrentUser,
      hydrate,
      login,
      logout,
      resetSession
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthStore(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthStore must be used within AuthProvider.');
  }

  return context;
}
