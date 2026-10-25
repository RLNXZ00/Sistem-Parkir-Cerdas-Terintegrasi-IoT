// Import hook useState, useEffect, dan useRef dari react untuk state dan referensi DOM elemen popover
import { useState, useEffect, useRef } from 'react';
// Import hook useLanguage dari konteks bahasa untuk alih bahasa antarmuka
import { useLanguage } from '../context/LanguageContext';
// Import hook useNotification dari konteks notifikasi untuk mengelola badge lonceng dan daftar peringatan
import { useNotification } from '../context/NotificationContext';
// Import komponen NotificationPopover untuk menampilkan daftar notifikasi melayang
import NotificationPopover from './NotificationPopover';

// Deklarasi fungsi komponen publik TopBar untuk bilah navigasi bagian atas halaman aplikasi web
export default function TopBar({ breadcrumb, status }) {
  // Destrukturisasi bahasa aktif, fungsi alih bahasa, dan helper terjemahan t dari LanguageContext
  const { lang, setLanguage, t } = useLanguage();
  // Destrukturisasi state notifikasi, jumlah belum dibaca, dan aksi baca dari NotificationContext
  const { notifications, unreadCount, markAllRead, markAsRead } = useNotification();
  // Inisialisasi state isNotificationOpen bertipe boolean dengan nilai awal false untuk status buka/tutup popover
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  // Inisialisasi referensi notificationRef untuk mendeteksi klik di luar wadah popover
  const notificationRef = useRef(null);

  // Deklarasi fungsi toggleLanguage untuk beralih antara Bahasa Indonesia dan Bahasa Inggris
  const toggleLanguage = () => {
    setLanguage(lang === 'id' ? 'en' : 'id');
  };

  // Menentukan teks status koneksi yang ditampilkan (dari prop status atau fallback teks terjemahan)
  const displayStatus = status || t('topbar.systemHealthy', 'IoT Connected');

  // Hook useEffect untuk menutup popover secara otomatis saat pengguna mengklik di luar area notifikasi
  useEffect(() => {
    // Fungsi event listener klik di luar
    const handleClickOutside = (event) => {
      // Jika ref terpasang dan target klik berada di luar elemen ref, tutup popover
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };

    // Jika popover sedang terbuka, pasang event listener mousedown pada dokumen
    if (isNotificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    // Hapus event listener saat popover tertutup atau komponen dilepas
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationOpen]);

  // Deklarasi fungsi handleMarkAllRead untuk menandai semua notifikasi telah dibaca
  const handleMarkAllRead = () => {
    markAllRead();
  };

  // Deklarasi fungsi handleNotificationClick untuk menandai satu item notifikasi spesifik telah dibaca
  const handleNotificationClick = (item) => {
    markAsRead(item.id);
  };

  // Mengembalikan elemen JSX bilah atas (TopBar)
  return (
    // Wadah header tetap (fixed) di bagian atas layar dengan penyesuaian margin kiri terhadap sidebar
    <header className="bg-surface border-b border-surface-container flex justify-between items-center h-16 px-6 fixed top-0 right-0 z-40 left-20 lg:left-64">
      {/* Bagian jejak navigasi (Breadcrumb) halaman */}
      <nav className="flex text-on-surface-variant font-mono text-sm items-center gap-1">
        <span className="hover:text-primary transition-colors cursor-pointer">SPCT IoT</span>
        <span className="mx-1 opacity-50">/</span>
        <span className="text-primary font-semibold">{breadcrumb}</span>
      </nav>

      {/* Bagian kontrol aksi di sisi kanan bilah atas */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* Tombol kapsul pengalih bahasa (ID / EN) cepat */}
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

        {/* Lencana status kesehatan IoT dengan lampu indikator hijau berdenyut */}
        <div className="hidden md:flex items-center gap-2 bg-surface-container-high px-3 py-1.5 rounded-full border border-outline-variant">
          <div className="w-2.5 h-2.5 rounded-full bg-eco-success shadow-[0_0_8px_rgba(46,139,87,0.8)] animate-pulse"></div>
          <span className="font-mono text-[12px] text-on-surface">{displayStatus}</span>
        </div>

        {/* Kelompok tombol ikon interaktif */}
        <div className="flex items-center gap-2">
          {/* Wadah pembungkus tombol lonceng dan popover notifikasi */}
          <div className="relative z-50" ref={notificationRef}>
            {/* Tombol ikon lonceng notifikasi */}
            <button
              id="btn-topbar-notification"
              onClick={() => setIsNotificationOpen((prev) => !prev)}
              title="Notifikasi Sistem"
              className={`text-on-surface-variant hover:text-primary transition-all duration-200 w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-high cursor-pointer relative ${
                isNotificationOpen ? 'bg-surface-container-high text-primary' : ''
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              {/* Lencana penanda jumlah notifikasi belum terbaca */}
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#ea580c] text-white text-[10px] font-bold font-mono flex items-center justify-center shadow-md animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Komponen popover daftar notifikasi */}
            <NotificationPopover
              isOpen={isNotificationOpen}
              onClose={() => setIsNotificationOpen(false)}
              notifications={notifications}
              onMarkAllRead={handleMarkAllRead}
              onNotificationClick={handleNotificationClick}
            />
          </div>

          {/* Tombol ikon status jaringan IoT */}
          <button
            title="Status Jaringan IoT"
            className="text-on-surface-variant hover:text-primary transition-all duration-200 w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">wifi</span>
          </button>
          {/* Tombol ikon efisiensi ramah lingkungan */}
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
