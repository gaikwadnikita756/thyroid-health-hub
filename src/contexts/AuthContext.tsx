import React, { createContext, useContext, useEffect, useState } from 'react';

type UserRole = 'patient' | 'doctor' | 'admin' | null;

interface User {
  id: string;
  email: string;
  fullName: string;
}

interface AuthResult {
  error: Error | null;
  user?: User;
  role?: UserRole;
}

interface AuthContextType {
  user: User | null;
  role: UserRole;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: 'patient' | 'doctor') => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const API_URL = 'http://localhost:3001/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedRole = localStorage.getItem('role');

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }

    if (storedRole) {
      setRole(storedRole as UserRole);
    }
  }, []);

  const signUp = async (email: string, password: string, fullName: string, userRole: 'patient' | 'doctor') => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, role: userRole }),
      });

      if (!response.ok) {
        const data = await response.json();
        return { error: new Error(data.error || 'Registration failed') };
      }

      const userData = await response.json();
      const authUser = { id: userData.id, email: userData.email, fullName: userData.fullName };
      const authRole = userData.role?.name || userRole;
      setUser(authUser);
      setRole(authRole);
      localStorage.setItem('user', JSON.stringify(authUser));
      localStorage.setItem('role', authRole);
      return { error: null, user: authUser, role: authRole };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Registration failed') };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        return { error: new Error(data.error || 'Login failed') };
      }

      const userData = await response.json();
      const authUser = { id: userData.id, email: userData.email, fullName: userData.fullName };
      const authRole = userData.role?.name || null;
      setUser(authUser);
      setRole(authRole);
      localStorage.setItem('user', JSON.stringify(authUser));
      localStorage.setItem('role', authRole || '');
      return { error: null, user: authUser, role: authRole };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Login failed') };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
