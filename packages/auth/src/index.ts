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

export type RoleId = 'admin' | 'viewer';

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

export interface CreateUserInput {
  username: string;
  avatar?: string;
  roleIds: RoleId[];
  password?: string;
}

export interface UpdateUserRolesInput {
  userId: string;
  roleIds: RoleId[];
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
const DEFAULT_PASSWORD = 'changeme123';
let userSequence = 3;

export const permissions: Record<
  'dashboardView' | 'deviceView' | 'userCreate' | 'userEdit' | 'userDelete',
  Permission
> = {
  dashboardView: {
    id: 'dashboard:view',
    name: '首页访问',
    description: '允许访问首页页面及相关接口。'
  },
  deviceView: {
    id: 'device:view',
    name: '设备中心访问',
    description: '允许访问设备中心模块及其页面。'
  },
  userCreate: {
    id: 'user:create',
    name: '用户创建',
    description: '允许创建用户并访问用户管理页面。'
  },
  userEdit: {
    id: 'user:edit',
    name: '用户编辑',
    description: '允许编辑用户数据。'
  },
  userDelete: {
    id: 'user:delete',
    name: '用户删除',
    description: '允许删除用户。'
  }
};

export const roles: Record<RoleId, Role> = {
  admin: {
    id: 'admin',
    name: '管理员',
    permissions: Object.values(permissions)
  },
  viewer: {
    id: 'viewer',
    name: '只读用户',
    permissions: [permissions.dashboardView, permissions.deviceView]
  }
};

export const defaultMenus: Menu[] = [
  {
    id: 'dashboard',
    name: '首页',
    path: '/dashboard',
    icon: 'i-lucide-layout-dashboard',
    permissionCode: permissions.dashboardView.id
  },
  {
    id: 'devices',
    name: '设备中心',
    path: '/devices',
    icon: 'i-lucide-cpu',
    permissionCode: permissions.deviceView.id
  },
  {
    id: 'ai-copilot',
    name: 'AI Copilot',
    path: '/ai-copilot',
    icon: 'i-lucide-sparkles',
    permissionCode: permissions.dashboardView.id
  },
  {
    id: 'agents',
    name: '智能体',
    path: '/agents',
    icon: 'i-lucide-bot',
    permissionCode: permissions.dashboardView.id
  },
  {
    id: 'workflows',
    name: '工作流',
    path: '/workflows',
    icon: 'i-lucide-git-branch',
    permissionCode: permissions.dashboardView.id
  },
  {
    id: 'screens',
    name: '数字大屏',
    path: '/screens',
    icon: 'i-lucide-monitor',
    permissionCode: permissions.dashboardView.id
  },
  {
    id: 'system',
    name: '系统管理',
    path: '/system',
    icon: 'i-lucide-settings',
    permissionCode: permissions.dashboardView.id
  },
  {
    id: 'users',
    name: '用户管理',
    path: '/users',
    icon: 'i-lucide-users',
    permissionCode: permissions.userCreate.id
  }
];

const userRecords: UserRecord[] = [
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

function clonePermission(permission: Permission): Permission {
  return {
    ...permission
  };
}

function cloneRole(role: Role): Role {
  return {
    ...role,
    permissions: role.permissions.map(clonePermission)
  };
}

function cloneUser(user: User): User {
  return {
    ...user,
    roles: user.roles.map(cloneRole)
  };
}

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

function normalizeRoleIds(roleIds: RoleId[]): RoleId[] {
  return Array.from(new Set(roleIds));
}

function ensureRoles(roleIds: RoleId[]): Role[] {
  const normalizedRoleIds = normalizeRoleIds(roleIds);

  if (normalizedRoleIds.length === 0) {
    throw new Error('At least one role must be assigned.');
  }

  return normalizedRoleIds.map((roleId) => {
    const role = roles[roleId];

    if (!role) {
      throw new Error(`Unknown role: ${roleId}`);
    }

    return cloneRole(role);
  });
}

function findUserRecordByUsername(username: string): UserRecord | null {
  return userRecords.find((record) => record.user.username === username) ?? null;
}

function findUserById(userId: string): User | null {
  const user = userRecords.find((record) => record.user.id === userId)?.user ?? null;

  return user ? cloneUser(user) : null;
}

function findUserRecordById(userId: string): UserRecord | null {
  return userRecords.find((record) => record.user.id === userId) ?? null;
}

function getStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage;
}

export function getSeedUsers(): User[] {
  return userRecords.map((record) => cloneUser(record.user));
}

export function getRoleCatalog(): Role[] {
  return Object.values(roles).map(cloneRole);
}

export function listUsers(): User[] {
  return userRecords.map((record) => cloneUser(record.user));
}

export function createUserAccount(input: CreateUserInput): User {
  const username = input.username.trim();

  if (!username) {
    throw new Error('Username is required.');
  }

  if (findUserRecordByUsername(username)) {
    throw new Error('Username already exists.');
  }

  const newUser: User = {
    id: `u_${String(userSequence).padStart(4, '0')}`,
    username,
    avatar: input.avatar,
    roles: ensureRoles(input.roleIds)
  };

  userSequence += 1;

  userRecords.push({
    user: newUser,
    password: input.password ?? DEFAULT_PASSWORD
  });

  return cloneUser(newUser);
}

export function updateUserRoles(input: UpdateUserRolesInput): User {
  const record = findUserRecordById(input.userId);

  if (!record) {
    throw new Error('User not found.');
  }

  record.user.roles = ensureRoles(input.roleIds);

  return cloneUser(record.user);
}

export function deleteUserAccount(userId: string): void {
  const index = userRecords.findIndex((record) => record.user.id === userId);

  if (index === -1) {
    throw new Error('User not found.');
  }

  userRecords.splice(index, 1);
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
    user: cloneUser(record.user)
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
