'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { LoginRequest, RegisterRequest, User } from '@repo/shared';
import { api, tokenStore } from './api';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!tokenStore.access) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await api.users.me();
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const login = useCallback(
    async (data: LoginRequest) => {
      const tokens = await api.auth.login(data);
      tokenStore.set(tokens);
      await refreshUser();
    },
    [refreshUser],
  );

  const register = useCallback(
    async (data: RegisterRequest) => {
      const tokens = await api.auth.register(data);
      tokenStore.set(tokens);
      await refreshUser();
    },
    [refreshUser],
  );

  const logout = useCallback(async () => {
    const refresh = tokenStore.refresh;
    if (refresh) await api.auth.logout(refresh).catch(() => undefined);
    tokenStore.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
