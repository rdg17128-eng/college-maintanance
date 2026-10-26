import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setAuthToken } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Auto load user on mount if token exists
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('apex_auth_token');
      if (token) {
        try {
          const data = await api.getCurrentUser();
          setUser(data.user);
          setUnreadNotifications(data.unreadNotifications || 0);
        } catch (err) {
          console.warn('Session expired or invalid:', err.message);
          setAuthToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password, roleHint) => {
    const data = await api.login({ email, password, roleHint });
    setAuthToken(data.token);
    setUser(data.user);
    // Refresh notifications count
    try {
      const me = await api.getCurrentUser();
      setUnreadNotifications(me.unreadNotifications || 0);
    } catch (_) {}
    return data.user;
  };

  const register = async (userData) => {
    const data = await api.register(userData);
    setAuthToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    setUnreadNotifications(0);
  };

  // Quick switcher for instant evaluation / demo testing
  const switchDemoRole = async (targetRole) => {
    const credentials = {
      student: { email: 'student@apexcollege.edu', password: 'student123' },
      faculty: { email: 'faculty@apexcollege.edu', password: 'faculty123' },
      admin: { email: 'admin@apexcollege.edu', password: 'admin123' }
    };

    const cred = credentials[targetRole];
    if (cred) {
      return await login(cred.email, cred.password, targetRole);
    }
  };

  const refreshUserData = async () => {
    if (!user) return;
    try {
      const data = await api.getCurrentUser();
      setUser(data.user);
      setUnreadNotifications(data.unreadNotifications || 0);
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        unreadNotifications,
        setUnreadNotifications,
        login,
        register,
        logout,
        switchDemoRole,
        refreshUserData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
