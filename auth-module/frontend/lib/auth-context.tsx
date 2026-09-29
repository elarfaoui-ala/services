'use client';

import {
  createContext, useContext, useEffect, useState, useCallback, ReactNode,
} from 'react';
import { authApi, User, AuthTokens } from './auth-api';

interface AuthState {
  user:         User | null;
  accessToken:  string | null;
  refreshToken: string | null;
  isLoading:    boolean;
}

interface AuthContext extends AuthState {
  login:    (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout:   () => Promise<void>;
}

const TOKEN_KEY   = 'auth_access_token';
const REFRESH_KEY = 'auth_refresh_token';

function getTokens(): { accessToken: string | null; refreshToken: string | null } {
  if (typeof window === 'undefined') return { accessToken: null, refreshToken: null };
  return {
    accessToken:  localStorage.getItem(TOKEN_KEY),
    refreshToken: localStorage.getItem(REFRESH_KEY),
  };
}

function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
}

function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

const Ctx = createContext<AuthContext | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null, accessToken: null, refreshToken: null, isLoading: true,
  });

  const tryRefresh = useCallback(async (): Promise<{ accessToken: string; refreshToken: string } | null> => {
    const { refreshToken } = getTokens();
    if (!refreshToken) return null;
    try {
      const tokens = await authApi.refresh(refreshToken);
      setTokens(tokens.accessToken, tokens.refreshToken);
      return tokens;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const { accessToken, refreshToken } = getTokens();
    if (!accessToken || !refreshToken) {
      setState(s => ({ ...s, isLoading: false }));
      return;
    }
    authApi.me(accessToken)
      .then(({ user }) => setState({ user, accessToken, refreshToken, isLoading: false }))
      .catch(async () => {
        const tokens = await tryRefresh();
        if (tokens) {
          authApi.me(tokens.accessToken)
            .then(({ user }) => setState({ user, ...tokens, isLoading: false }))
            .catch(() => {
              clearTokens();
              setState({ user: null, accessToken: null, refreshToken: null, isLoading: false });
            });
        } else {
          clearTokens();
          setState({ user: null, accessToken: null, refreshToken: null, isLoading: false });
        }
      });
  }, [tryRefresh]);

  const persist = useCallback((accessToken: string, refreshToken: string, user: User) => {
    setTokens(accessToken, refreshToken);
    setState({ user, accessToken, refreshToken, isLoading: false });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    persist(res.accessToken, res.refreshToken, res.user);
  }, [persist]);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const res = await authApi.register({ email, password, name });
    persist(res.accessToken, res.refreshToken, res.user);
  }, [persist]);

  const logout = useCallback(async () => {
    const { accessToken, refreshToken } = getTokens();
    if (accessToken && refreshToken) {
      await authApi.logout(accessToken, refreshToken).catch(() => {});
    }
    clearTokens();
    setState({ user: null, accessToken: null, refreshToken: null, isLoading: false });
  }, []);

  return (
    <Ctx.Provider value={{ ...state, login, register, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
