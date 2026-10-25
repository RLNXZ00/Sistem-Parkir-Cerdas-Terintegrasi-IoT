// Import komponen NavLink, useNavigate, dan useLocation dari react-router-dom untuk tautan menu dan deteksi rute aktif
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
// Import hook useLanguage dari konteks bahasa untuk internasionalisasi label navigasi
import { useLanguage } from '../context/LanguageContext';

// Deklarasi fungsi komponen publik Sidebar untuk panel bilah samping navigasi utama aplikasi
export default function Sidebar() {
  // Inisialisasi fungsi navigate untuk berpindah rute halaman secara terprogram
  const navigate = useNavigate();
  // Inisialisasi objek location untuk memperoleh path URL yang sedang dibuka pengguna
  const location = useLocation();
  // Mengambil fungsi translasi t dari context LanguageContext
  const { t } = useLanguage();

  // Membaca data pengguna yang tersimpan di sessionStorage atau fallback ke objek kosong
  const userData = JSON.parse(sessionStorage.getItem('spct_user') || '{}');

  // Menentukan apakah rute aktif saat ini berada di bawah cakupan modul manajemen (/dashboard-management atau /reports)
  const isManagementRoute = location.pathname.startsWith('/dashboard-management') || location.pathname.startsWith('/reports');
  // Menentukan status boolean apakah peran pengguna tergolong manajerial (ADMIN atau Manajemen RS) atau berada di rute manajemen
  const isManager = userData.role === 'ADMIN' || userData.role === 'Manajemen RS' || isManagementRoute;

  // Mendefinisikan daftar item menu navigasi secara dinamis berbasis Role-Based Access Control (RBAC)
  const navItems = isManager 
    ? [
        // Menu untuk peran Manajemen RS: Live Dashboard Manajemen dan Laporan Analitik
        { to: '/dashboard-management', icon: 'dashboard', label: t('nav.fieldDashboard', 'Live Dashboard') },
        { to: '/reports', icon: 'bar_chart', label: t('nav.reports', 'Reports') }
      ]
    : [
        // Menu untuk peran Petugas Lapangan: Live Dashboard Operasional, Gate OCR Feed, dan Log Anomali
        { to: '/dashboard', icon: 'dashboard', label: t('nav.fieldDashboard', 'Live Dashboard') },
        { to: '/gate-live', icon: 'videocam', label: t('nav.gateLive', 'Gate OCR Feed') },
        { to: '/anomaly-logs', icon: 'report_problem', label: t('nav.anomalyLogs', 'Anomaly Logs') }
      ];

  // Mengembalikan elemen JSX bilah samping navigasi
  return (
    // Wadah navigasi tetap (fixed) di sisi kiri layar dengan lebar responsif
    <nav className="bg-surface w-20 lg:w-64 h-screen fixed left-0 top-0 border-r border-surface-container-low flex flex-col py-6 z-20">
      {/* Bagian identitas brand dan ikon panel kontrol di puncak sidebar */}
      <div className="px-4 lg:px-6 mb-8 flex items-center gap-4">
        {/* Lingkaran pembungkus ikon administrator */}
        <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-primary">admin_panel_settings</span>
        </div>
        {/* Teks nama aplikasi yang hanya tampak pada layar desktop besar (lg) */}
        <div className="hidden lg:block overflow-hidden">
          <p className="font-semibold text-[16px] leading-tight text-primary truncate">Smart Parking</p>
          <p className="font-mono text-[12px] text-text-muted truncate">Green Earth System</p>
        </div>
      </div>

      {/* Daftar tautan navigasi utama */}
      <ul className="flex flex-col flex-1 gap-1 px-2 lg:px-4">
        {/* Looping untuk merender setiap item menu sesuai hak akses peran pengguna */}
        {navItems.map(({ to, icon, label }) => (
          <li key={to}>
            {/* Tautan navigasi NavLink dengan visualisasi status aktif otomatis */}
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 ease-in-out font-medium
                ${isActive
                  ? 'text-primary font-bold border-r-4 border-primary bg-primary/10 shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'
                }`
              }
            >
              {/* Ikon menu Material Symbols */}
              <span className="material-symbols-outlined transition-colors duration-200">{icon}</span>
              {/* Label nama menu navigasi */}
              <span className="hidden lg:block whitespace-nowrap">{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Daftar tautan di bagian bawah sidebar untuk pengaturan dan tombol keluar */}
      <ul className="flex flex-col gap-1 px-2 lg:px-4 mt-auto">
        {/* Item menu Pengaturan Sistem */}
        <li>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 ease-in-out font-medium
              ${isActive
                ? 'text-primary font-bold border-r-4 border-primary bg-primary/10 shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'
              }`
            }
          >
            <span className="material-symbols-outlined transition-colors duration-200">settings</span>
            <span className="hidden lg:block whitespace-nowrap">{t('nav.settings', 'Settings')}</span>
          </NavLink>
        </li>
        {/* Tombol keluar (Logout) akun dari sistem */}
        <li>
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-4 px-3 py-3 rounded-xl text-on-surface-variant hover:bg-surface-variant hover:text-on-surface transition-all duration-200 ease-in-out font-medium cursor-pointer"
          >
            <span className="material-symbols-outlined transition-colors duration-200">logout</span>
            <span className="hidden lg:block whitespace-nowrap">{t('nav.logout', 'Logout')}</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
