import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api } from '../services/api';

interface AuthContextType {
  user: any | null; token: string | null; login: (nombreUsuario: string, contrasena: string) => Promise<void>; logout: () => void;
}
const AuthContext = createContext<AuthContextType>(null!);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      const stored = localStorage.getItem('user');
      if (stored) setUser(JSON.parse(stored));
    }
  }, [token]);

  const login = async (nombreUsuario: string, contrasena: string) => {
    const res = await api.login({ nombreUsuario, contrasena });
    localStorage.setItem('token', res.accessToken);
    localStorage.setItem('user', JSON.stringify(res.usuario));
    setToken(res.accessToken);
    setUser(res.usuario);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, token, login, logout }}>{children}</AuthContext.Provider>;
}
