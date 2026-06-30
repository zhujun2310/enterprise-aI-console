import {
  createUserAccount,
  deleteUserAccount,
  defaultMenus,
  filterMenus,
  getPermissionIds,
  getPermissionsByUser,
  getRoleCatalog,
  getUserInfo,
  listUsers,
  login,
  updateUserRoles,
  type CreateUserInput,
  type LoginResult,
  type Menu,
  type Permission,
  type Role,
  type RoleId,
  type User
} from '../../../packages/auth/dist/index.js';

export interface UserInfoPayload {
  user: User;
  permissions: Permission[];
  menus: Menu[];
}

export interface UserManagementPayload {
  users: User[];
  roles: Role[];
}

export function loginWithPassword(username: string, password: string): LoginResult {
  return login(username, password);
}

export function getUserInfoByToken(token: string): UserInfoPayload | null {
  const user = getUserInfo(token);

  if (!user) {
    return null;
  }

  const permissionIds = getPermissionIds(user);

  return {
    user,
    permissions: getPermissionsByUser(user),
    menus: filterMenus(defaultMenus, permissionIds)
  };
}

export function getUserManagementPayload(): UserManagementPayload {
  return {
    users: listUsers(),
    roles: getRoleCatalog()
  };
}

export function createManagedUser(username: string, roleIds: RoleId[]): User {
  return createUserAccount({
    username,
    roleIds
  } satisfies CreateUserInput);
}

export function updateManagedUserRoles(userId: string, roleIds: RoleId[]): User {
  return updateUserRoles({
    userId,
    roleIds
  });
}

export function deleteManagedUser(userId: string): void {
  deleteUserAccount(userId);
}
