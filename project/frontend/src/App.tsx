import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import EarlyWarningPage from './pages/EarlyWarningPage';
import ReportPage from './pages/ReportPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { UIProvider } from './contexts/UIcontext'; 

function App() {
  return (
    // Bungkus semua rute dengan UIProvider
    <UIProvider>
      <Toaster position="top-center" reverseOrder={false} />

      <Routes>
        {/* Public route */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected route */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/early-warning" element={<EarlyWarningPage />} />
            <Route path="/report" element={<ReportPage />} />
          </Route>
        </Route>

        {/* Rute untuk halaman yang tidak ditemukan */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </UIProvider>
  );
}

export default App;