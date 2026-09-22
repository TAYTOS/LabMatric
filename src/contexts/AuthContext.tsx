import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { arrayOf, isUser } from '../services/validators';
import { isInstitutionalEmail } from '../utils/validation';
import { mockUsers } from '../data/mockData';
import { loadFromStorage, saveToStorage, removeFromStorage, STORAGE_KEYS } from '../utils/storage';

interface RegisterInput {
  names: string;
  surnames: string;
  studentCode: string;
  email: string;
  password: string;
}

interface AuthResult {
  success: boolean;
  error?: string;
}

interface AuthContextValue {
  user: User | null;
  getUserById: (id: string) => User | undefined;
  isAuthenticated: boolean;
  isSubmitting: boolean;
  hasOnboarded: boolean;
  completeOnboarding: () => void;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (input: RegisterInput) => Promise<AuthResult>;
  logout: () => void;
  updateProfile: (patch: Partial<Pick<User, 'names' | 'surnames' | 'email'>>) => AuthResult;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function AuthProvider({ children }: {children: React.ReactNode;}) {
  const [users, setUsers] = useState<User[]>(() => loadFromStorage(STORAGE_KEYS.users, mockUsers, (value): value is User[] => arrayOf(isUser)(value) && value.length > 0));
  const [user, setUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState<boolean>(() =>
  loadFromStorage(STORAGE_KEYS.onboardingDone, false)
  );
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const sessionId = loadFromStorage<string | null>(STORAGE_KEYS.session, null, (v): v is string | null => v === null || typeof v === 'string');
    if (sessionId) {
      const found = users.find((u) => u.id === sessionId) ?? null;
      setUser(found);
      if (!found) removeFromStorage(STORAGE_KEYS.session);
    }
    setInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.users, users);
  }, [users]);

  const completeOnboarding = () => {
    setHasOnboarded(true);
    saveToStorage(STORAGE_KEYS.onboardingDone, true);
  };

  const login = async (email: string, password: string): Promise<AuthResult> => {
    setIsSubmitting(true);
    await wait(900);
    const normalizedEmail = email.trim().toLowerCase();
    const found = users.find((u) => u.email.toLowerCase() === normalizedEmail);
    setIsSubmitting(false);
    if (!found || found.password !== password) {
      return { success: false, error: 'Correo o contraseña incorrectos. Verifica tus datos e inténtalo nuevamente.' };
    }
    setUser(found);
    saveToStorage(STORAGE_KEYS.session, found.id);
    return { success: true };
  };

  const register = async (input: RegisterInput): Promise<AuthResult> => {
    setIsSubmitting(true);
    await wait(900);
    const normalizedEmail = input.email.trim().toLowerCase();
    const exists = users.some((u) => u.email.toLowerCase() === normalizedEmail || u.studentCode === input.studentCode.trim());
    if (exists) {
      setIsSubmitting(false);
      return { success: false, error: 'Ya existe una cuenta registrada con ese correo o código de estudiante.' };
    }
    const newUser: User = {
      id: `u-${Date.now()}`,
      names: input.names,
      surnames: input.surnames,
      fullName: `${input.names} ${input.surnames}`.trim(),
      studentCode: input.studentCode,
      email: input.email,
      password: input.password,
      program: 'Ingeniería de Sistemas',
      semester: 'I semestre',
      period: '2026-B',
      role: 'student',
      avatarInitials: `${input.names.charAt(0)}${input.surnames.charAt(0)}`.toUpperCase()
    };
    setUsers((prev) => [...prev, newUser]);
    setUser(newUser);
    saveToStorage(STORAGE_KEYS.session, newUser.id);
    setIsSubmitting(false);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    removeFromStorage(STORAGE_KEYS.session);
  };

  const updateProfile = (patch: Partial<Pick<User, 'names' | 'surnames' | 'email'>>) => {
    if (!user) return { success: false };
    const names = (patch.names ?? user.names).trim();
    const surnames = (patch.surnames ?? user.surnames).trim();
    const email = (patch.email ?? user.email).trim().toLowerCase();
    if (!names || !surnames || !isInstitutionalEmail(email)) return { success: false, error: 'Completa tu nombre y usa un correo @unsa.edu.pe.' };
    if (users.some((u) => u.id !== user.id && u.email.toLowerCase() === email)) return { success: false, error: 'Ese correo ya pertenece a otra cuenta.' };
    const updated = { ...user, names, surnames, email, fullName: `${names} ${surnames}`, avatarInitials: `${names[0]}${surnames[0]}`.toUpperCase() };
    setUser(updated);
    setUsers((prev) => prev.map((u) => u.id === updated.id ? updated : u));
    return { success: true };
  };
  const value: AuthContextValue = {
    user, getUserById: (id) => users.find((u) => u.id === id),
    isAuthenticated: !!user, isSubmitting, hasOnboarded, completeOnboarding, login, register, logout, updateProfile
  };

  if (!initialized) return <p role="status" className="p-6 text-center">Cargando sesión...</p>;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
