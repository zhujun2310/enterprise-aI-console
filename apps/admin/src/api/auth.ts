import type {
  LoginResult,
  Menu,
  Permission,
  Role,
  RoleId,
  User
} from '@enterprise-ai-console/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

interface ApiErrorPayload {
  message?: string;
}

export interface UserInfoResponse {
  user: User;
  permissions: Permission[];
  menus: Menu[];
}

export interface DashboardSummaryResponse {
  message: string;
  permissions: string[];
  roleIds: string[];
}

export interface CreateUserResponse {
  success: boolean;
  message: string;
}

export interface UserManagementResponse {
  users: User[];
  roles: Role[];
}

export interface UpdateUserRolesResponse {
  success: boolean;
  message: string;
  user: User;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    },
    ...init
  });

  const data = (await response.json()) as T & ApiErrorPayload;

  if (!response.ok) {
    throw new Error(data.message ?? 'Request failed.');
  }

  return data;
}

export async function loginRequest(username: string, password: string): Promise<LoginResult> {
  return requestJson<LoginResult>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      username,
      password
    })
  });
}

export async function logoutRequest(token: string): Promise<{ success: boolean }> {
  return requestJson<{ success: boolean }>('/auth/logout', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export async function getUserInfoRequest(token: string): Promise<UserInfoResponse> {
  return requestJson<UserInfoResponse>('/user/info', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export async function getDashboardSummaryRequest(token: string): Promise<DashboardSummaryResponse> {
  return requestJson<DashboardSummaryResponse>('/dashboard/summary', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export async function createUserRequest(
  token: string,
  username: string,
  roleIds: RoleId[]
): Promise<CreateUserResponse> {
  return requestJson<CreateUserResponse>('/users', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      username,
      roleIds
    })
  });
}

export async function getUsersRequest(token: string): Promise<UserManagementResponse> {
  return requestJson<UserManagementResponse>('/users', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export async function updateUserRolesRequest(
  token: string,
  userId: string,
  roleIds: RoleId[]
): Promise<UpdateUserRolesResponse> {
  return requestJson<UpdateUserRolesResponse>(`/users/${userId}/roles`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      roleIds
    })
  });
}

export async function deleteUserRequest(
  token: string,
  userId: string
): Promise<CreateUserResponse> {
  return requestJson<CreateUserResponse>(`/users/${userId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}
