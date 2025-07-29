"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'auth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed.user || null);
        setToken(parsed.token || null);
        setRole(parsed.role || (parsed.user ? parsed.user.role : null));
      } catch (e) {
        // Invalid JSON, clear
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    if (user && token) {
      // Persist full auth object
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ user, token, role: user.role })
      );
      // Also store raw access_token for fetchWithAuth
      localStorage.setItem("access_token", token);
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem("access_token");
    }
  }, [user, token, role]);

  const login = (user: User, token: string) => {
    setUser(user);
    setToken(token);
    setRole(user.role);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRole(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem("access_token");
  };

  return (
    <AuthContext.Provider value={{ user, token, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
} 