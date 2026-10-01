import { NavLink, useNavigate } from 'react-router-dom';

// Definisi menu navigasi
const navItems = [
  { to: '/dashboard', icon: 'dashboard', label: 'Live Dashboard' },
  { to: '/gate-live', icon: 'videocam', label: 'Gate OCR Feed' },
  { to: '/anomaly-logs', icon: 'report_problem', label: 'Anomaly Logs' },
  { to: '/reports', icon: 'bar_chart', label: 'Reports' },
];

export default function Sidebar() {
  const navigate = useNavigate();

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
                `flex items-center gap-4 px-3 py-3 rounded-lg transition-all duration-200 ease-in-out
                ${isActive
                  ? 'text-primary font-bold border-r-4 border-primary bg-secondary-container/10'
                  : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'
                }`
              }
            >
              <span className="material-symbols-outlined">{icon}</span>
              <span className="hidden lg:block whitespace-nowrap">{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Bottom Links */}
      <ul className="flex flex-col gap-1 px-2 lg:px-4 mt-auto">
        <li>
          <button className="w-full flex items-center gap-4 px-3 py-3 rounded-lg text-on-surface-variant hover:bg-surface-variant hover:text-on-surface transition-all duration-200">
            <span className="material-symbols-outlined">settings</span>
            <span className="hidden lg:block whitespace-nowrap">Settings</span>
          </button>
        </li>
        <li>
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-4 px-3 py-3 rounded-lg text-on-surface-variant hover:bg-surface-variant hover:text-on-surface transition-all duration-200"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="hidden lg:block whitespace-nowrap">Logout</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
