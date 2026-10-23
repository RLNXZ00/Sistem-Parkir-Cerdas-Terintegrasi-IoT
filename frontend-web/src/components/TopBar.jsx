import { useLanguage } from '../context/LanguageContext';

// TopBar: Header yang muncul di semua halaman fitur menu
export default function TopBar({ breadcrumb, status }) {
  const { lang, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(lang === 'id' ? 'en' : 'id');
  };

  const displayStatus = status || t('topbar.systemHealthy', 'IoT Connected');

  return (
    <header className="bg-surface border-b border-surface-container flex justify-between items-center h-16 px-6 fixed top-0 right-0 z-10 left-20 lg:left-64">
      {/* Breadcrumb */}
      <nav className="flex text-on-surface-variant font-mono text-sm items-center gap-1">
        <span className="hover:text-primary transition-colors cursor-pointer">SPCT IoT</span>
        <span className="mx-1 opacity-50">/</span>
        <span className="text-primary font-semibold">{breadcrumb}</span>
      </nav>

      {/* Right Actions */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* Quick Language Switcher Pill */}
        <button
          onClick={toggleLanguage}
          title={lang === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-surface-container-high bg-surface-container hover:bg-surface-container-highest transition-all text-xs font-mono font-bold cursor-pointer"
        >
          <span className="material-symbols-outlined text-[15px] text-primary">translate</span>
          <span className={lang === 'id' ? 'text-primary font-extrabold' : 'text-text-muted'}>ID</span>
          <span className="text-text-muted opacity-40">|</span>
          <span className={lang === 'en' ? 'text-primary font-extrabold' : 'text-text-muted'}>EN</span>
        </button>

        {/* IoT Status Badge */}
        <div className="hidden md:flex items-center gap-2 bg-surface-container-high px-3 py-1.5 rounded-full border border-outline-variant">
          <div className="w-2.5 h-2.5 rounded-full bg-eco-success shadow-[0_0_8px_rgba(46,139,87,0.8)] animate-pulse"></div>
          <span className="font-mono text-[12px] text-on-surface">{displayStatus}</span>
        </div>

        {/* Icon Buttons */}
        <div className="flex items-center gap-2">
          <button
            title="Notifikasi Sistem"
            className="text-on-surface-variant hover:text-primary transition-all duration-200 w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </button>
          <button
            title="Status Jaringan IoT"
            className="text-on-surface-variant hover:text-primary transition-all duration-200 w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">wifi</span>
          </button>
          <button
            title="Indikator Efisiensi Eco"
            className="text-eco-success hover:text-primary transition-all duration-200 w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">eco</span>
          </button>
        </div>
      </div>
    </header>
  );
}
