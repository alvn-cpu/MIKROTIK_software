import React from 'react';
import { getApi, setAuthToken, clearAuthToken } from '../services/api';

export const AuthContext = React.createContext({
  user: null,
  token: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  loading: true,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = React.useState(null);
  const [token, setToken] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const t = localStorage.getItem('auth_token');
    if (t) {
      setToken(t);
      setAuthToken(t);
      // Fetch current user
      getApi('/api/auth/me')
        .then((r) => r.json())
        .then((data) => setUser(data.user))
        .catch(() => {
          localStorage.removeItem('auth_token');
          clearAuthToken();
          setUser(null);
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const doLogin = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    localStorage.setItem('auth_token', data.token);
    setAuthToken(data.token);
    setUser(data.user);
    setToken(data.token);
    return data;
  };

  const doRegister = async (email, phone, password) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, phone, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Register failed');
    localStorage.setItem('auth_token', data.token);
    setAuthToken(data.token);
    setUser(data.user);
    setToken(data.token);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    clearAuthToken();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login: doLogin, register: doRegister, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
