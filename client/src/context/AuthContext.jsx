import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hydrateUser = async () => {
      const token = localStorage.getItem('fk_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.success) {
          setUser(res.data);
        } else {
          localStorage.removeItem('fk_token');
        }
      } catch (err) {
        console.error('Session hydration failed:', err.message);
        localStorage.removeItem('fk_token');
      } finally {
        setLoading(false);
      }
    };

    hydrateUser();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('fk_token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('fk_token');
    setUser(null);
  };

  const addAddress = async (addressData) => {
    try {
      const res = await api.post('/auth/address', addressData);
      if (res.success) {
        setUser(prev => {
          if (!prev) return null;
          return { ...prev, addresses: res.data };
        });
        return { success: true };
      }
      return { success: false, message: res.message || 'Failed to record address.' };
    } catch (err) {
      return { success: false, message: err.message || 'Communication error.' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, addAddress, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be consumed inside an AuthProvider.');
  }
  return context;
};

export default AuthContext;
