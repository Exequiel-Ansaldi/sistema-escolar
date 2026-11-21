import { createContext, useContext, useState, type ReactNode } from 'react';
import { api } from '../services/api';

interface AuthContextType {
  user: any | null; token: string | null; login: (nombreUsuario: string, contrasena: string) => Promise<void>; logout: () => void;
}
const AuthContext = createContext<AuthContextType>(null!);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Hidratación SINCRÓNICA desde localStorage: si el estado arrancara en
  // null y se hidratara en un useEffect, el primer render de ProtectedRoute
  // vería rol indefinido y rebotaría al deep-link pedido.
  const [user, setUser] = useState<any | null>(() => {
    if (!localStorage.getItem('token')) return null;
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

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
