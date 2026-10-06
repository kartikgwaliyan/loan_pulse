import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const DEMO_CREDENTIALS = {
  CUSTOMER: { username: 'customer', password: 'Password@123', label: 'Customer (Rahul Sharma)' },
  LOAN_OFFICER: { username: 'officer', password: 'Password@123', label: 'Loan Officer (Ananya Iyer)' },
  RISK_ANALYST: { username: 'analyst', password: 'Password@123', label: 'Risk Analyst (Rohan Deshmukh)' },
  MANAGER: { username: 'manager', password: 'Password@123', label: 'Credit Manager (Sanjay Singhania)' },
  COLLECTION_OFFICER: { username: 'collection', password: 'Password@123', label: 'Collection Officer (Kavita Rao)' },
  ADMIN: { username: 'admin', password: 'Password@123', label: 'Administrator (Vikram Mehta)' },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('loanpulse_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('loanpulse_access_token'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleAuthExpired = () => {
      setUser(null);
      setToken(null);
    };
    window.addEventListener('loanpulse_auth_expired', handleAuthExpired);
    return () => window.removeEventListener('loanpulse_auth_expired', handleAuthExpired);
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const data = await api.post('/auth/login/', { username, password });
      if (data.access) {
        localStorage.setItem('loanpulse_access_token', data.access);
        localStorage.setItem('loanpulse_user', JSON.stringify(data.user));
        setToken(data.access);
        setUser(data.user);
        return { success: true, user: data.user };
      }
      return { success: false, message: 'Invalid response from server' };
    } catch (err) {
      return {
        success: false,
        message: err.message || 'Login failed. Please verify your credentials.',
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register/', formData);
      return { success: true, data: res };
    } catch (err) {
      return { success: false, message: err.message || 'Registration failed.' };
    } finally {
      setLoading(false);
    }
  };

  const switchDemoRole = async (roleKey) => {
    const creds = DEMO_CREDENTIALS[roleKey];
    if (!creds) return;
    return await login(creds.username, creds.password);
  };

  const logout = () => {
    localStorage.removeItem('loanpulse_access_token');
    localStorage.removeItem('loanpulse_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        role: user?.role || null,
        login,
        register,
        logout,
        switchDemoRole,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
