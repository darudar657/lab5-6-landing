import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from './types';
import { hashPassword, storage, uid } from './storage';
import { seedNewUser } from './seed';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  register: (input: RegisterInput) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => void;
  updateUser: (patch: Partial<User>) => void;
  changePassword: (current: string, next: string) => Promise<{ ok: true } | { ok: false; error: string }>;
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadCurrentUser(): User | null {
  const session = storage.getSession();
  if (!session) return null;
  if (new Date(session.expiresAt).getTime() < Date.now()) {
    storage.setSession(null);
    return null;
  }
  return storage.getUsers().find((u) => u.id === session.userId) ?? null;
}

function issueSession(userId: string) {
  const now = new Date();
  const expires = new Date(now);
  expires.setHours(expires.getHours() + 24);
  storage.setSession({
    userId,
    issuedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(loadCurrentUser());
    setLoading(false);
  }, []);

  const login = useCallback<AuthContextValue['login']>(async (email, password) => {
    const users = storage.getUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!found) return { ok: false, error: 'No account with that email' };
    const hash = await hashPassword(password);
    if (hash !== found.passwordHash) return { ok: false, error: 'Wrong password' };
    issueSession(found.id);
    setUser(found);
    return { ok: true };
  }, []);

  const register = useCallback<AuthContextValue['register']>(async (input) => {
    const users = storage.getUsers();
    if (users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
      return { ok: false, error: 'Email already registered' };
    }
    const hash = await hashPassword(input.password);
    const newUser: User = {
      id: uid(),
      email: input.email,
      passwordHash: hash,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      createdAt: new Date().toISOString(),
      kycLevel: 'basic',
      twoFa: false,
    };
    storage.setUsers([...users, newUser]);
    await seedNewUser(newUser);
    issueSession(newUser.id);
    setUser(newUser);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    storage.setSession(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((patch: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...patch };
      const users = storage.getUsers().map((u) => (u.id === updated.id ? updated : u));
      storage.setUsers(users);
      return updated;
    });
  }, []);

  const changePassword = useCallback<AuthContextValue['changePassword']>(
    async (current, next) => {
      if (!user) return { ok: false, error: 'Not logged in' };
      const currentHash = await hashPassword(current);
      if (currentHash !== user.passwordHash) return { ok: false, error: 'Current password wrong' };
      const nextHash = await hashPassword(next);
      const updated = { ...user, passwordHash: nextHash };
      storage.setUsers(storage.getUsers().map((u) => (u.id === user.id ? updated : u)));
      setUser(updated);
      return { ok: true };
    },
    [user],
  );

  const value = useMemo(
    () => ({ user, loading, login, register, logout, updateUser, changePassword }),
    [user, loading, login, register, logout, updateUser, changePassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
