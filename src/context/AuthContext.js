import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [advisor, setAdvisor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('advisor_user');
    const token = localStorage.getItem('advisor_token');
    if (stored && token) {
      setAdvisor(JSON.parse(stored));
      // Verify token is still valid
      authAPI.getMe()
        .then(r => setAdvisor(r.data))
        .catch(() => { logout(); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('advisor_token', data.token);
    localStorage.setItem('advisor_user', JSON.stringify(data.advisor));
    setAdvisor(data.advisor);
    return data;
  };

  const register = async (formData) => {
    const { data } = await authAPI.register(formData);
    localStorage.setItem('advisor_token', data.token);
    localStorage.setItem('advisor_user', JSON.stringify(data.advisor));
    setAdvisor(data.advisor);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('advisor_token');
    localStorage.removeItem('advisor_user');
    setAdvisor(null);
  };

  const updateProfile = async (profileData) => {
    const { data } = await authAPI.updateProfile(profileData);
    setAdvisor(data);
    localStorage.setItem('advisor_user', JSON.stringify(data));
    return data;
  };

  return (
    <AuthContext.Provider value={{ advisor, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
