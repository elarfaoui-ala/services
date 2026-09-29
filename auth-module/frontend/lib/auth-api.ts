const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export interface AuthTokens {
  accessToken:  string;
  refreshToken: string;
}

export interface User {
  id:    string;
  email: string;
  name:  string;
  role:  string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

function extractErrorMessage(data: any): string {
  if (typeof data === 'string') return data;
  if (data?.message) {
    if (Array.isArray(data.message)) return data.message[0] ?? 'Request failed';
    return data.message;
  }
  return 'Request failed';
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(extractErrorMessage(data));
  return data as T;
}

export const authApi = {
  register: (body: { email: string; password: string; name: string }) =>
    request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  refresh: (refreshToken: string) =>
    request<AuthTokens>('/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken }) }),

  logout: (accessToken: string, refreshToken: string) =>
    request('/auth/logout', {
      method:  'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body:    JSON.stringify({ refreshToken }),
    }),

  me: (accessToken: string) =>
    request<{ user: User }>('/auth/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  verifyEmail: (token: string) =>
    request('/auth/verify-email', { method: 'POST', body: JSON.stringify({ token }) }),

  forgotPassword: (email: string) =>
    request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),

  resetPassword: (token: string, password: string) =>
    request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) }),
};
