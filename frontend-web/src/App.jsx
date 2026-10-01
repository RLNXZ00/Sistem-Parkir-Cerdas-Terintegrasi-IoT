import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// === Autentikasi ===
import LoginPage from './pages/LoginPage';
import RegistrasiPage from './pages/RegistrasiPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// === Fitur Menu (Dashboard & App) ===
import DashboardPage from './pages/DashboardPage';
import DashboardManagementPage from './pages/DashboardManagementPage';
import GateLivePage from './pages/GateLivePage';
import AnomalyLogsPage from './pages/AnomalyLogsPage';
import ReportsPage from './pages/ReportsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* === Autentikasi === */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/registrasi" element={<RegistrasiPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* === Dashboard Petugas Lapangan === */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* === Dashboard Manajemen === */}
        <Route path="/dashboard-management" element={<DashboardManagementPage />} />

        {/* === Gate OCR Live Feed === */}
        <Route path="/gate-live" element={<GateLivePage />} />

        {/* === Anomaly Logs === */}
        <Route path="/anomaly-logs" element={<AnomalyLogsPage />} />

        {/* === Operational Reports === */}
        <Route path="/reports" element={<ReportsPage />} />

        {/* === Fallback === */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
