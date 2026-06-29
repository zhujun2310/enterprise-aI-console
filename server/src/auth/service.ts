import {
  defaultMenus,
  filterMenus,
  getPermissionIds,
  getPermissionsByUser,
  getUserInfo,
  login,
  type LoginResult,
  type Menu,
  type Permission,
  type User
} from '../../../packages/auth/dist/index.js';

export interface UserInfoPayload {
  user: User;
  permissions: Permission[];
  menus: Menu[];
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
