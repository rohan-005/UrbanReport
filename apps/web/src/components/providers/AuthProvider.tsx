'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole } from '@/lib/types';
import { authService } from '@/lib/services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
  login: (email: string, password?: string) => Promise<User>;
  register: (data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    confirmPassword?: string;
    aadhaarNumber: string;
  }) => Promise<User>;
  logout: () => void;
  updateNotificationPreferences: (prefs: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const res = await authService.login(email, password);
      setUser(res.user);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    confirmPassword?: string;
    aadhaarNumber: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await authService.register(data);
      setUser(res.user);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateNotificationPreferences = async (prefs: any) => {
    const updatedPrefs = await authService.updateNotificationPreferences(prefs);
    if (user) {
      setUser({ ...user, notificationPreferences: updatedPrefs });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        role: user ? user.role : null,
        login,
        register,
        logout,
        updateNotificationPreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
