import { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import NotificationPopover from './NotificationPopover';

const API_BASE = 'http://localhost:8081';

// Data bawaan awal agar notifikasi langsung menampilkan contoh kendaraan masuk dan anomali secara jelas
const DEFAULT_NOTIFICATIONS = [
  {
    id: 'notif-anomali-live',
    type: 'ANOMALY',
    title: 'Anomali: Penyerobotan Slot B1-03',
    description: 'Sensor ultrasonik mendeteksi kendaraan di Slot B1-03 padahal status reservasi masih KOSONG.',
    time: 'Baru saja',
    isRead: false,
    slotId: 'B1-03',
    severity: 'CRITICAL',
    link: '/anomaly-logs',
  },
  {
    id: 'notif-masuk-live',
    type: 'ENTRY',
    title: 'Kendaraan Masuk: B 1842 SPZ',
    description: 'Mobil Toyota Fortuner terdeteksi di Barrier Gate Masuk 1. Rute alokasi diarahkan ke Slot A1-02.',
    time: '2 mnt lalu',
    isRead: false,
    slotId: 'A1-02',
    severity: 'INFO',
    link: '/gate-live',
  },
  {
    id: 'notif-masuk-live-2',
    type: 'ENTRY',
    title: 'Kendaraan Masuk: D 9921 AB',
    description: 'Kendaraan terdeteksi di Gerbang Utama. Slot B1-01 dialokasikan otomatis oleh AI Gateway.',
    time: '7 mnt lalu',
    isRead: true,
    slotId: 'B1-01',
    severity: 'INFO',
    link: '/gate-live',
  },
  {
    id: 'notif-anomali-live-2',
    type: 'ANOMALY',
    title: 'Anomali Durasi: Melebihi Batas Slot A2-05',
    description: 'Kendaraan parkir melebihi kuota 24 jam tanpa perpanjangan sesi.',
    time: '18 mnt lalu',
    isRead: true,
    slotId: 'A2-05',
    severity: 'WARNING',
    link: '/anomaly-logs',
  },
];

// TopBar: Header yang muncul di semua halaman fitur menu
export default function TopBar({ breadcrumb, status }) {
  const { lang, setLanguage, t } = useLanguage();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);
  const notificationRef = useRef(null);

  const toggleLanguage = () => {
    setLanguage(lang === 'id' ? 'en' : 'id');
  };

  const displayStatus = status || t('topbar.systemHealthy', 'IoT Connected');

  // Ambil data log real-time dari backend untuk memperkaya notifikasi
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/monitoring/log-iot`, { cache: 'no-store' });
      if (!res.ok) return;
      const logs = await res.json();

      if (Array.isArray(logs) && logs.length > 0) {
        // Konversi log backend menjadi objek notifikasi
        const mapped = logs.slice(0, 10).map((log) => {
          const isAnomaly = log.jenisKejadian?.includes('ANOMALI');
          const isEntry = log.jenisKejadian?.includes('MASUK') || log.jenisKejadian?.includes('TIBA');
          const isExit = log.jenisKejadian?.includes('KELUAR');

          let type = 'SYSTEM';
          if (isAnomaly) type = 'ANOMALY';
          else if (isEntry) type = 'ENTRY';
          else if (isExit) type = 'EXIT';

          const waktu = log.waktuKejadian ? new Date(log.waktuKejadian).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'Hari ini';

          return {
            id: `iot-log-${log.idLog}`,
            type,
            title: isAnomaly
              ? `Anomali: ${log.jenisAnomali && log.jenisAnomali !== '-' ? log.jenisAnomali : 'Deteksi Sensor'}`
              : isEntry
              ? `Kendaraan Tiba di Slot ${log.slotTerkait?.idSlot || '-'}`
              : `Aktivitas Sensor IoT #${log.idLog}`,
            description: log.catatanDetail || 'Pembaruan telemetri sensor sistem parkir.',
            time: waktu,
            isRead: log.statusResolusi === 'SELESAI_DIVALIDASI',
            slotId: log.slotTerkait?.idSlot,
            severity: log.tingkatKeparahan || (isAnomaly ? 'CRITICAL' : 'INFO'),
            link: isAnomaly ? '/anomaly-logs' : '/dashboard',
          };
        });

        // Gabungkan notifikasi dinamis backend dengan notifikasi visual agar informatif
        setNotifications((prev) => {
          const ids = new Set(mapped.map((m) => m.id));
          const filteredPrev = prev.filter((p) => !ids.has(p.id));
          return [...mapped, ...filteredPrev].slice(0, 15);
        });
      }
    } catch {
      // Jika backend tidak tersambung, DEFAULT_NOTIFICATIONS tetap aktif
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Tutup popover jika pengguna mengklik di luar area notifikasi
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };

    if (isNotificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationOpen]);

  // Tandai semua notifikasi telah dibaca
  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // Tandai satu notifikasi telah dibaca saat diklik
  const handleNotificationClick = (item) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
    );
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="bg-surface border-b border-surface-container flex justify-between items-center h-16 px-6 fixed top-0 right-0 z-40 left-20 lg:left-64">
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
          {/* Tombol Lonceng Notifikasi */}
          <div className="relative z-50" ref={notificationRef}>
            <button
              id="btn-topbar-notification"
              onClick={() => setIsNotificationOpen((prev) => !prev)}
              title="Notifikasi Sistem"
              className={`text-on-surface-variant hover:text-primary transition-all duration-200 w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-high cursor-pointer relative ${
                isNotificationOpen ? 'bg-surface-container-high text-primary' : ''
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#ea580c] text-white text-[10px] font-bold font-mono flex items-center justify-center shadow-md animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Menu Popover Notifikasi */}
            <NotificationPopover
              isOpen={isNotificationOpen}
              onClose={() => setIsNotificationOpen(false)}
              notifications={notifications}
              onMarkAllRead={handleMarkAllRead}
              onNotificationClick={handleNotificationClick}
            />
          </div>

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

