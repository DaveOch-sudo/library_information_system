/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { User, AuthResponse } from '../types';
import toast from 'react-hot-toast';
import api from '../api/axios';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (data: AuthResponse) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
  }, []);

  const refreshUser = useCallback(async () => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) return;
    try {
      const { data } = await api.get('/auth/me');
      const me = data.data as User;
      setUser(me);
      localStorage.setItem('user', JSON.stringify(me));
    } catch {
      setUser(null);
      setToken(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const savedToken = localStorage.getItem('token');
      if (!savedToken) {
        if (!cancelled) setIsLoading(false);
        return;
      }

      if (!cancelled) setToken(savedToken);

      try {
        const { data } = await api.get('/auth/me');
        if (cancelled) return;
        const me = data.data as User;
        setUser(me);
        localStorage.setItem('user', JSON.stringify(me));
      } catch {
        if (cancelled) return;
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = (data: AuthResponse) => {
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('token', data.token);
    toast.success(`Welcome back, ${data.user.fullName}!`);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        refreshUser,
        isAuthenticated: !!token,
        isLoading,
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
