// Import komponen BrowserRouter, Routes, Route, dan Navigate dari react-router-dom untuk routing aplikasi berbasis web
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// Import LanguageProvider dari context/LanguageContext untuk menyediakan state internasionalisasi bahasa
import { LanguageProvider } from './context/LanguageContext';
// Import NotificationProvider dari context/NotificationContext untuk menyediakan state notifikasi sistem
import { NotificationProvider } from './context/NotificationContext';

// Import halaman LoginPage untuk antarmuka masuk autentikasi pengguna
import LoginPage from './pages/LoginPage';
// Import halaman RegistrasiPage untuk antarmuka pendaftaran akun petugas baru
import RegistrasiPage from './pages/RegistrasiPage';
// Import halaman ResetPasswordPage untuk antarmuka pengaturan ulang kata sandi
import ResetPasswordPage from './pages/ResetPasswordPage';

// Import halaman DashboardPage untuk panel pemantauan operasional petugas lapangan
import DashboardPage from './pages/DashboardPage';
// Import halaman DashboardManagementPage untuk panel metrik analitik eksekutif dan manajemen
import DashboardManagementPage from './pages/DashboardManagementPage';
// Import halaman GateLivePage untuk pemantauan kamera gerbang OCR real-time
import GateLivePage from './pages/GateLivePage';
// Import halaman AnomalyLogsPage untuk rekam jejak anomali dan insiden parkir
import AnomalyLogsPage from './pages/AnomalyLogsPage';
// Import halaman ReportsPage untuk laporan operasional dan ekspor dokumen
import ReportsPage from './pages/ReportsPage';
// Import halaman SettingsPage untuk konfigurasi sistem dan preferensi pengguna
import SettingsPage from './pages/SettingsPage';
// Import halaman PanduanPage untuk petunjuk operasional dan standar prosedur (SOP)
import PanduanPage from './pages/PanduanPage';

// Deklarasi fungsi komponen utama publik App sebagai pusat konfigurasi rute aplikasi web SPCT
export default function App() {
  // Mengembalikan hierarki penyedia context dan routing React Router
  return (
    // Penyedia context bahasa (LanguageProvider) untuk mendukung dwibahasa (ID dan EN)
    <LanguageProvider>
      {/* Penyedia context notifikasi (NotificationProvider) untuk lonceng peringatan */}
      <NotificationProvider>
        {/* Router berbasis peramban (BrowserRouter) untuk sinkronisasi URL dengan UI */}
        <BrowserRouter>
          {/* Wadah deklarasi kumpulan rute (Routes) */}
          <Routes>
            {/* Rute autentikasi: Halaman masuk login default */}
            <Route path="/" element={<LoginPage />} />
            {/* Rute autentikasi: Halaman registrasi akun baru */}
            <Route path="/registrasi" element={<RegistrasiPage />} />
            {/* Rute autentikasi: Halaman reset password akun */}
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Rute dashboard operasional untuk petugas lapangan */}
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Rute dashboard manajerial analitik untuk supervisor dan eksekutif */}
            <Route path="/dashboard-management" element={<DashboardManagementPage />} />

            {/* Rute pemantauan siaran langsung feed kamera gerbang OCR */}
            <Route path="/gate-live" element={<GateLivePage />} />

            {/* Rute audit log dan pencatatan anomali operasional */}
            <Route path="/anomaly-logs" element={<AnomalyLogsPage />} />

            {/* Rute pembuatan dan peninjauan laporan operasional */}
            <Route path="/reports" element={<ReportsPage />} />

            {/* Rute halaman panduan pengguna dan SOP parkir cerdas */}
            <Route path="/panduan" element={<PanduanPage />} />

            {/* Rute halaman pengaturan konfigurasi sistem dan akun */}
            <Route path="/settings" element={<SettingsPage />} />

            {/* Rute fallback untuk mengarahkan rute yang tidak dikenal kembali ke halaman login */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </LanguageProvider>
  );
}
