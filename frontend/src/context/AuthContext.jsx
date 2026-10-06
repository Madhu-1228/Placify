import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('placify_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('placify_user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error parsing stored user:', e);
        localStorage.removeItem('placify_user');
      }
    }
    setLoading(false);
  }, [token]);

  const login = (authToken, userData) => {
    localStorage.setItem('placify_token', authToken);
    localStorage.setItem('placify_user', JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
  };

  const updateUserData = (updatedFields) => {
    setUser(prev => {
      const nextUser = { ...prev, ...updatedFields };
      localStorage.setItem('placify_user', JSON.stringify(nextUser));
      return nextUser;
    });
  };

  const logout = () => {
    localStorage.removeItem('placify_token');
    localStorage.removeItem('placify_user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: !!token,
    isStudent: user?.role === 'STUDENT' || user?.role === 'ROLE_STUDENT',
    isAdmin: user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN',
    login,
    updateUserData,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
