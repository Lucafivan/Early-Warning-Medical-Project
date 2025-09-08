import { createContext, useState, useContext, type ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  userEmail: string | null;
  setUserEmail: (email: string | null) => void;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const login = () => {
    console.log("Fungsi login dipanggil!");
    setIsAuthenticated(true);
  };

  const logout = () => {
    console.log("Fungsi logout dipanggil!");
    setIsAuthenticated(false);
    setUserEmail(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userEmail, setUserEmail, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
};