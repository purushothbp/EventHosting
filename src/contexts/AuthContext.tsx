// src/contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getSession, signIn, signOut } from 'next-auth/react';
import type { Session } from 'next-auth';
type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  organization?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCoordinator: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      const session = await getSession();
      setSession(session as any);
      setLoading(false);
    };
    loadSession();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      throw new Error(result.error);
    }

    const session = await getSession();
    setSession(session as any);
  };

  const logout = async () => {
    await signOut({ redirect: false });
    setSession(null);
  };

  const user = session?.user as User | null;
  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin' || user?.role === 'super-admin';
  const isCoordinator = user?.role === 'coordinator' || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated,
        isAdmin,
        isCoordinator,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};