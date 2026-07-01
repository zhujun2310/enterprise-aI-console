const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

interface ApiErrorPayload {
  message?: string;
}

export async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
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

export function withBearer(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`
  };
}
