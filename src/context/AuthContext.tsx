import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User } from '../types';
import { authAPI } from '../services/api';

interface AuthCtx {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const u = await authAPI.me();
      setUser(u);
    } catch {
      localStorage.removeItem('jsl_token');
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('jsl_token');
    if (token) {
      refreshUser().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const { token, user: u } = await authAPI.login(email, password);
    localStorage.setItem('jsl_token', token);
    setUser(u);
  };

  const register = async (payload: any) => {
    const { token, user: u } = await authAPI.register(payload);
    localStorage.setItem('jsl_token', token);
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem('jsl_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
