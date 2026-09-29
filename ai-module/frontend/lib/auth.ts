'use client';

const ACCESS_KEY = 'ai_access_token';
const REFRESH_KEY = 'ai_refresh_token';

const AUTH_URL =
  process.env.NEXT_PUBLIC_AUTH_URL ?? 'http://localhost:4000/api';

export const AUTH_LOGOUT_EVENT = 'auth:logout';

function extractMessage(data: any, fallback: string): string {
  if (Array.isArray(data?.message)) return data.message[0];
  return data?.message ?? fallback;
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(ACCESS_KEY);
  } catch {
    return null;
  }
}

export function hasSession(): boolean {
  return getAccessToken() !== null;
}

export async function login(email: string, password: string): Promise<void> {
  const res = await fetch(`${AUTH_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(extractMessage(data, `HTTP ${res.status}`));
  localStorage.setItem(ACCESS_KEY, data.accessToken);
  localStorage.setItem(REFRESH_KEY, data.refreshToken);
}

export function logout(): void {
  try {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
}

async function refreshAccessToken(): Promise<boolean> {
  let refreshToken: string | null = null;
  try {
    refreshToken = localStorage.getItem(REFRESH_KEY);
  } catch {
    return false;
  }
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${AUTH_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    localStorage.setItem(ACCESS_KEY, data.accessToken);
    localStorage.setItem(REFRESH_KEY, data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

/**
 * fetch wrapper that attaches the Bearer token, refreshes it once on 401
 * and broadcasts a logout event when the session is truly gone.
 */
export async function authorizedFetch(
  input: string | URL,
  init?: RequestInit,
): Promise<Response> {
  const doFetch = (): Promise<Response> => {
    const token = getAccessToken();
    const headers = new Headers(init?.headers);
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return fetch(input, { ...init, headers });
  };

  let res = await doFetch();

  if (res.status === 401 && (await refreshAccessToken())) {
    res = await doFetch();
  }

  if (res.status === 401) {
    logout();
  }

  return res;
}
