import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const stored = localStorage.getItem('user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const { data } = await authAPI.login(credentials);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  const isAdmin   = user?.role === 'ADMIN';
  const isWarden  = user?.role === 'WARDEN';
  const isStudent = user?.role === 'STUDENT';
  const isStaff   = isAdmin || isWarden;

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isWarden, isStudent, isStaff }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
