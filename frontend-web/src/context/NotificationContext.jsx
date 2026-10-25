import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const NotificationContext = createContext();

export const STORAGE_KEY_READ_NOTIFS = 'spct_read_notification_ids';
const API_BASE = 'http://localhost:8081';

// Data notifikasi sistem bawaan awal
export const DEFAULT_NOTIFICATIONS = [
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

// Helper membaca set ID yang telah dibaca dari localStorage
const getSavedReadIds = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_READ_NOTIFS);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
};

// Helper menyimpan set ID ke localStorage
const saveReadIds = (readSet) => {
  try {
    const arr = Array.from(readSet);
    localStorage.setItem(STORAGE_KEY_READ_NOTIFS, JSON.stringify(arr));
    // Kirim custom event untuk sinkronisasi jika ada tab lain
    window.dispatchEvent(new Event('spct_notifications_change'));
  } catch {
    // Abaikan jika localStorage tidak dapat diakses
  }
};

export function NotificationProvider({ children }) {
  const [readIds, setReadIds] = useState(getSavedReadIds);
  const [notifications, setNotifications] = useState(() => {
    const initialRead = getSavedReadIds();
    return DEFAULT_NOTIFICATIONS.map((item) => ({
      ...item,
      isRead: item.isRead || initialRead.has(item.id),
    }));
  });

  // Ambil log IoT dari backend untuk memperkaya notifikasi secara real-time
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/monitoring/log-iot`, { cache: 'no-store' });
      if (!res.ok) return;
      const logs = await res.json();

      if (Array.isArray(logs) && logs.length > 0) {
        const currentReadIds = getSavedReadIds();

        const mapped = logs.slice(0, 10).map((log) => {
          const isAnomaly = log.jenisKejadian?.includes('ANOMALI');
          const isEntry = log.jenisKejadian?.includes('MASUK') || log.jenisKejadian?.includes('TIBA');
          const isExit = log.jenisKejadian?.includes('KELUAR');

          let type = 'SYSTEM';
          if (isAnomaly) type = 'ANOMALY';
          else if (isEntry) type = 'ENTRY';
          else if (isExit) type = 'EXIT';

          const waktu = log.waktuKejadian
            ? new Date(log.waktuKejadian).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
            : 'Hari ini';

          const id = `iot-log-${log.idLog}`;
          const isAlreadyRead = currentReadIds.has(id) || log.statusResolusi === 'SELESAI_DIVALIDASI';

          return {
            id,
            type,
            title: isAnomaly
              ? `Anomali: ${log.jenisAnomali && log.jenisAnomali !== '-' ? log.jenisAnomali : 'Deteksi Sensor'}`
              : isEntry
              ? `Kendaraan Tiba di Slot ${log.slotTerkait?.idSlot || '-'}`
              : `Aktivitas Sensor IoT #${log.idLog}`,
            description: log.catatanDetail || 'Pembaruan telemetri sensor sistem parkir.',
            time: waktu,
            isRead: isAlreadyRead,
            slotId: log.slotTerkait?.idSlot,
            severity: log.tingkatKeparahan || (isAnomaly ? 'CRITICAL' : 'INFO'),
            link: isAnomaly ? '/anomaly-logs' : '/dashboard',
          };
        });

        setNotifications((prev) => {
          const ids = new Set(mapped.map((m) => m.id));
          const filteredPrev = prev.filter((p) => !ids.has(p.id));
          const combined = [...mapped, ...filteredPrev].slice(0, 15);
          return combined.map((item) => ({
            ...item,
            isRead: item.isRead || currentReadIds.has(item.id),
          }));
        });
      }
    } catch {
      // Backend offline, biarkan state notifikasi lokal tetap berjalan
    }
  }, []);

  // Polling backend setiap 10 detik
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Sinkronisasi jika ada perubahan storage
  useEffect(() => {
    const handleSync = () => {
      const latestRead = getSavedReadIds();
      setReadIds(latestRead);
      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          isRead: item.isRead || latestRead.has(item.id),
        }))
      );
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('spct_notifications_change', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('spct_notifications_change', handleSync);
    };
  }, []);

  // Tandai semua notifikasi telah dibaca secara persisten
  const markAllRead = useCallback(() => {
    setNotifications((prev) => {
      const newReadIds = new Set(getSavedReadIds());
      prev.forEach((item) => newReadIds.add(item.id));
      saveReadIds(newReadIds);
      setReadIds(newReadIds);
      return prev.map((item) => ({ ...item, isRead: true }));
    });
  }, []);

  // Tandai satu notifikasi tertentu telah dibaca secara persisten
  const markAsRead = useCallback((id) => {
    if (!id) return;
    setNotifications((prev) => {
      const newReadIds = new Set(getSavedReadIds());
      newReadIds.add(id);
      saveReadIds(newReadIds);
      setReadIds(newReadIds);
      return prev.map((item) => (item.id === id ? { ...item, isRead: true } : item));
    });
  }, []);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAllRead,
        markAsRead,
        refreshNotifications: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
