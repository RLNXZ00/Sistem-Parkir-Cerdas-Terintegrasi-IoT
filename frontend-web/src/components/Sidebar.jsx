import { NavLink, useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Ambil data user dari sessionStorage
  const userData = JSON.parse(sessionStorage.getItem('spct_user') || '{}');

  // 2. Deteksi konteks Manajemen RS:
  //    - Berdasarkan role user: 'ADMIN' atau 'Manajemen RS'
  //    - ATAU rute aktif berada di area manajemen (/dashboard-management atau /reports)
  const isManagementRoute = location.pathname.startsWith('/dashboard-management') || location.pathname.startsWith('/reports');
  const isManager = userData.role === 'ADMIN' || userData.role === 'Manajemen RS' || isManagementRoute;

  // 3. Menu STRICT terpisah sesuai RBAC:
  //    - Manajemen RS: HANYA 2 MENU (Live Dashboard & Reports)
  //    - Petugas Lapangan: HANYA 3 MENU (Live Dashboard, Gate OCR Feed, Anomaly Logs)
  const navItems = isManager 
    ? [
        { to: '/dashboard-management', icon: 'dashboard', label: 'Live Dashboard' },
        { to: '/reports', icon: 'bar_chart', label: 'Reports' }
      ]
    : [
        { to: '/dashboard', icon: 'dashboard', label: 'Live Dashboard' },
        { to: '/gate-live', icon: 'videocam', label: 'Gate OCR Feed' },
        { to: '/anomaly-logs', icon: 'report_problem', label: 'Anomaly Logs' }
      ];

  return (
    <nav className="bg-surface w-20 lg:w-64 h-screen fixed left-0 top-0 border-r border-surface-container-low flex flex-col py-6 z-20">
      {/* Brand */}
      <div className="px-4 lg:px-6 mb-8 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-primary">admin_panel_settings</span>
        </div>
        <div className="hidden lg:block overflow-hidden">
          <p className="font-semibold text-[16px] leading-tight text-primary truncate">Smart Parking</p>
          <p className="font-mono text-[12px] text-text-muted truncate">Green Earth System</p>
        </div>
      </div>

      {/* Nav Links */}
      <ul className="flex flex-col flex-1 gap-1 px-2 lg:px-4">
        {navItems.map(({ to, icon, label }) => (
          <li key={to}>
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
              <span className="material-symbols-outlined transition-colors duration-200">{icon}</span>
              <span className="hidden lg:block whitespace-nowrap">{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Bottom Links */}
      <ul className="flex flex-col gap-1 px-2 lg:px-4 mt-auto">
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
            <span className="hidden lg:block whitespace-nowrap">Settings</span>
          </NavLink>
        </li>
        <li>
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-4 px-3 py-3 rounded-xl text-on-surface-variant hover:bg-surface-variant hover:text-on-surface transition-all duration-200 ease-in-out font-medium"
          >
            <span className="material-symbols-outlined transition-colors duration-200">logout</span>
            <span className="hidden lg:block whitespace-nowrap">Logout</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
