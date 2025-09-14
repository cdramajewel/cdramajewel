
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import type { User } from '../types';
import { ADMIN_EMAIL } from '../constants';

interface AuthContextType {
  user: User | null;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('c-drama-jewel-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('c-drama-jewel-user');
    }
  }, []);

  const login = useCallback(async (password: string): Promise<boolean> => {
    // In a real app, this would be a network request.
    // Here, we just check for a mock password.
    return new Promise(resolve => {
      setTimeout(() => {
        if (password === 'Jewel') {
          const userData: User = { email: ADMIN_EMAIL };
          setUser(userData);
          localStorage.setItem('c-drama-jewel-user', JSON.stringify(userData));
          resolve(true);
        } else {
          resolve(false);
        }
      }, 500);
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('c-drama-jewel-user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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
