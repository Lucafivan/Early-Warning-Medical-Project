import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import EarlyMonitoringPage from './pages/EarlyMonitoringPage';
import BudgetTargetingPage from './pages/BudgetTargetingPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <>
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
          <Route path="/early-monitoring" element={<EarlyMonitoringPage />} />
          <Route path="/budget-targeting" element={<BudgetTargetingPage />} />
        </Route>
      </Route>

      {/* Rute untuk halaman yang tidak ditemukan */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    </>
  );
}

export default App;