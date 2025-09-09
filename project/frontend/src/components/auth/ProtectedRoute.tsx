import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect, useState } from 'react';

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);

  // Cek token di localStorage saat ProtectedRoute pertama kali render
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      // Token ada, biarkan isAuthenticated nanti di-sync oleh context
    }
    setLoading(false);
  }, []);

  if (loading) return <div>Loading...</div>;

  // Redirect ke login kalau tidak ada token & tidak authenticated
  if (!isAuthenticated && !localStorage.getItem("access_token")) {
    return <Navigate to="/login" replace />;
  }

  // Kalau login, tampilkan route child
  return <Outlet />;
};

export default ProtectedRoute;
