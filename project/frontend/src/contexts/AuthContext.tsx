import { createContext, useState, useContext, useEffect, type ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Cek token di localStorage saat app pertama kali load
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const login = () => {
    console.log("Fungsi login dipanggil!");
    setIsAuthenticated(true);
    // token sudah disimpan di LoginPage, jadi tidak perlu lagi di sini
  };

  const logout = () => {
    console.log("Fungsi logout dipanggil!");
    setIsAuthenticated(false);
    localStorage.removeItem("access_token"); // hapus token saat logout
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
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
