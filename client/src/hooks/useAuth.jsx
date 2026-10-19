import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, tokenStore } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(tokenStore.get()));

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  useEffect(() => {
    if (!tokenStore.get()) return;
    api.me().then((r) => setUser(r.user)).catch(logout).finally(() => setLoading(false));
  }, [logout]);

  useEffect(() => {
    window.addEventListener('spendwise:unauthorized', logout);
    return () => window.removeEventListener('spendwise:unauthorized', logout);
  }, [logout]);

  const authenticate = async (fn, body) => {
    const r = await fn(body);
    tokenStore.set(r.token);
    setUser(r.user);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      setUser,
      login: (b) => authenticate(api.login, b),
      register: (b) => authenticate(api.register, b),
      logout,
    }),
    [user, loading, logout]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
