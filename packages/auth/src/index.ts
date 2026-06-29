export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

export interface User {
  id: string;
  username: string;
  avatar?: string;
  roles: Role[];
}

export interface Menu {
  id: string;
  name: string;
  path: string;
  icon?: string;
  children?: Menu[];
  permissionCode?: string;
}

export interface LoginResult {
  token: string;
  refreshToken: string;
  user: User;
}

interface UserRecord {
  user: User;
  password: string;
}

interface TokenPayload {
  userId: string;
  username: string;
  roleIds: string[];
  expiresAt: number;
}

const ACCESS_TOKEN_KEY = 'enterprise-ai-console.access-token';
const REFRESH_TOKEN_KEY = 'enterprise-ai-console.refresh-token';
const TOKEN_TTL = 1000 * 60 * 60 * 8;

export const permissions: Record<
  'dashboardView' | 'userCreate' | 'userEdit' | 'userDelete',
  Permission
> = {
  dashboardView: {
    id: 'dashboard:view',
    name: 'Dashboard View',
    description: 'Allows reading the dashboard page and dashboard APIs.'
  },
  userCreate: {
    id: 'user:create',
    name: 'User Create',
    description: 'Allows creating users and opening user management pages.'
  },
  userEdit: {
    id: 'user:edit',
    name: 'User Edit',
    description: 'Allows editing user data.'
  },
  userDelete: {
    id: 'user:delete',
    name: 'User Delete',
    description: 'Allows deleting users.'
  }
};

export const roles: Record<'admin' | 'viewer', Role> = {
  admin: {
    id: 'admin',
    name: 'Administrator',
    permissions: Object.values(permissions)
  },
  viewer: {
    id: 'viewer',
    name: 'Viewer',
    permissions: [permissions.dashboardView]
  }
};

export const defaultMenus: Menu[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    path: '/dashboard',
    icon: 'i-lucide-layout-dashboard',
    permissionCode: permissions.dashboardView.id
  },
  {
    id: 'users',
    name: 'Users',
    path: '/users',
    icon: 'i-lucide-users',
    permissionCode: permissions.userCreate.id
  }
];

const seedUsers: UserRecord[] = [
  {
    user: {
      id: 'u_admin',
      username: 'admin',
      roles: [roles.admin]
    },
    password: 'admin123'
  },
  {
    user: {
      id: 'u_viewer',
      username: 'viewer',
      roles: [roles.viewer]
    },
    password: 'viewer123'
  }
];

function encodeBase64(value: string): string {
  if (typeof globalThis.btoa === 'function') {
    return globalThis.btoa(value);
  }

  return Buffer.from(value, 'utf8').toString('base64');
}

function decodeBase64(value: string): string {
  if (typeof globalThis.atob === 'function') {
    return globalThis.atob(value);
  }

  return Buffer.from(value, 'base64').toString('utf8');
}

function createTokenPayload(user: User): TokenPayload {
  return {
    userId: user.id,
    username: user.username,
    roleIds: user.roles.map((role) => role.id),
    expiresAt: Date.now() + TOKEN_TTL
  };
}

function createAccessToken(user: User): string {
  return encodeBase64(JSON.stringify(createTokenPayload(user)));
}

function createRefreshToken(user: User): string {
  return encodeBase64(`${user.id}:${Date.now()}:refresh`);
}

function readTokenPayload(token: string): TokenPayload | null {
  try {
    const payload = JSON.parse(decodeBase64(token)) as TokenPayload;

    if (payload.expiresAt <= Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

function deduplicatePermissions(items: Permission[]): Permission[] {
  const permissionMap = new Map<string, Permission>();

  for (const permission of items) {
    permissionMap.set(permission.id, permission);
  }

  return Array.from(permissionMap.values());
}

function findUserRecordByUsername(username: string): UserRecord | null {
  return seedUsers.find((record) => record.user.username === username) ?? null;
}

function findUserById(userId: string): User | null {
  return seedUsers.find((record) => record.user.id === userId)?.user ?? null;
}

function getStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage;
}

export function getSeedUsers(): User[] {
  return seedUsers.map((record) => record.user);
}

export function getPermissionsByUser(user: User | null): Permission[] {
  if (!user) {
    return [];
  }

  return deduplicatePermissions(user.roles.flatMap((role) => role.permissions));
}

export function getPermissionIds(user: User | null): string[] {
  return getPermissionsByUser(user).map((permission) => permission.id);
}

export function hasPermission(user: User | null, code: string | string[]): boolean {
  const permissionIds = new Set(getPermissionIds(user));
  const targets = Array.isArray(code) ? code : [code];

  return targets.some((target) => permissionIds.has(target));
}

export function hasRole(user: User | null, roleId: string | string[]): boolean {
  if (!user) {
    return false;
  }

  const roleIds = new Set(user.roles.map((role) => role.id));
  const targets = Array.isArray(roleId) ? roleId : [roleId];

  return targets.some((target) => roleIds.has(target));
}

export function filterMenus(menus: Menu[], permissionIds: string[]): Menu[] {
  return menus
    .filter((menu) => !menu.permissionCode || permissionIds.includes(menu.permissionCode))
    .map((menu) => ({
      ...menu,
      children: menu.children ? filterMenus(menu.children, permissionIds) : undefined
    }));
}

export function login(username: string, password: string): LoginResult {
  const normalizedUsername = username.trim();
  const record = findUserRecordByUsername(normalizedUsername);

  if (!record || record.password !== password) {
    throw new Error('Invalid username or password.');
  }

  const token = createAccessToken(record.user);
  const refreshToken = createRefreshToken(record.user);

  return {
    token,
    refreshToken,
    user: record.user
  };
}

export function logout(): void {
  const storage = getStorage();

  storage?.removeItem(ACCESS_TOKEN_KEY);
  storage?.removeItem(REFRESH_TOKEN_KEY);
}

export function persistToken(token: string, refreshToken?: string): void {
  const storage = getStorage();

  storage?.setItem(ACCESS_TOKEN_KEY, token);

  if (refreshToken) {
    storage?.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function getStoredToken(): string | null {
  return getStorage()?.getItem(ACCESS_TOKEN_KEY) ?? null;
}

export function getStoredRefreshToken(): string | null {
  return getStorage()?.getItem(REFRESH_TOKEN_KEY) ?? null;
}

export function getUserInfo(token = getStoredToken()): User | null {
  if (!token) {
    return null;
  }

  const payload = readTokenPayload(token);

  if (!payload) {
    return null;
  }

  return findUserById(payload.userId);
}
