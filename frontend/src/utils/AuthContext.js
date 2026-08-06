/**
 * AuthContext.js - Authentication context provider
 *
 * Provides authentication state throughout the app
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import { isAuthenticated, login as authLogin, logout as authLogout, getCurrentUser } from './auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [authenticated, setAuthenticated] = useState(isAuthenticated());
  const [user, setUser] = useState(getCurrentUser());

  // Check authentication status on mount
  useEffect(() => {
    setAuthenticated(isAuthenticated());
    setUser(getCurrentUser());
  }, []);

  const login = (username, password) => {
    const success = authLogin(username, password);
    if (success) {
      setAuthenticated(true);
      setUser(getCurrentUser());
    }
    return success;
  };

  const logout = () => {
    authLogout();
    setAuthenticated(false);
    setUser(null);
  };

  const value = {
    authenticated,
    user,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
