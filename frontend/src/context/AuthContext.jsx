import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe, login as apiLogin, signup as apiSignup } from '../services/api';

const defaultAuthValue = {
  user: null,
  token: null,
  loading: true,
  isAuthenticated: false,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  updateUser: () => {}
};

const AuthContext = createContext(defaultAuthValue);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const isGitHubPages = typeof window !== 'undefined' && window.location.hostname.includes('github.io');

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        if (token.startsWith('demo-token-')) {
          const storedUser = localStorage.getItem('demo-user');
          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser));
            } catch (e) {
              setUser({
                id: 1,
                name: 'John Doe',
                email: 'admin@docintel.com',
                role: 'ADMIN',
                department: 'Executive Administration',
                designation: 'Root System Administrator'
              });
            }
          } else {
            setUser({
              id: 1,
              name: 'John Doe',
              email: 'admin@docintel.com',
              role: 'ADMIN',
              department: 'Executive Administration',
              designation: 'Root System Administrator'
            });
          }
          setLoading(false);
          return;
        }

        try {
          const res = await getMe();
          setUser(res.data.data.user);
        } catch (error) {
          // If offline on GitHub Pages, fallback to stored demo user
          if (isGitHubPages) {
            setUser({
              id: 1,
              name: 'John Doe',
              email: 'admin@docintel.com',
              role: 'ADMIN',
              department: 'Executive Administration',
              designation: 'Root System Administrator'
            });
          } else {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
          }
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await apiLogin({ email, password });
      const { token, user } = res.data.data;
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      return user;
    } catch (err) {
      if (isGitHubPages || !err.response) {
        // Fallback for static GitHub Pages showcase
        const isAdmin = !email || !email.toLowerCase().includes('user');
        const demoUser = {
          id: 1,
          name: email && email.includes('@') ? (email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1)) : 'John Doe',
          email: email || 'admin@docintel.com',
          role: isAdmin ? 'ADMIN' : 'USER',
          department: isAdmin ? 'Executive Administration' : 'Operations',
          designation: isAdmin ? 'Root System Administrator' : 'Senior Specialist'
        };
        const demoToken = 'demo-token-' + Date.now();
        localStorage.setItem('token', demoToken);
        localStorage.setItem('demo-user', JSON.stringify(demoUser));
        setToken(demoToken);
        setUser(demoUser);
        return demoUser;
      }
      throw err;
    }
  };

  const signup = async (name, email, password, role, department, designation) => {
    try {
      const res = await apiSignup({ name, email, password, role, department, designation });
      const { token, user } = res.data.data;
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      return user;
    } catch (err) {
      if (isGitHubPages || !err.response) {
        // Fallback for static GitHub Pages showcase
        const demoUser = {
          id: Math.floor(Math.random() * 9000) + 1000,
          name: name || 'Enterprise User',
          email: email || 'user@docintel.com',
          role: role || 'ADMIN',
          department: department || (role === 'ADMIN' ? 'Executive' : 'Operations'),
          designation: designation || (role === 'ADMIN' ? 'Compliance Officer' : 'Team Member')
        };
        const demoToken = 'demo-token-' + Date.now();
        localStorage.setItem('token', demoToken);
        localStorage.setItem('demo-user', JSON.stringify(demoUser));
        setToken(demoToken);
        setUser(demoUser);
        return demoUser;
      }
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('demo-user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (newUserData) => {
    setUser(prev => {
      const updated = { ...prev, ...newUserData };
      localStorage.setItem('demo-user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated: !!user, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context || defaultAuthValue;
};

