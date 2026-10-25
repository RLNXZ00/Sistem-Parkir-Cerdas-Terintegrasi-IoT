// Import hook createContext, useContext, useState, useEffect, useCallback, dan useMemo dari pustaka react
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

// Membuat objek context NotificationContext untuk mengelola dan mendistribusikan data notifikasi sistem
const NotificationContext = createContext();

// Konstanta kunci localStorage untuk menyimpan ID notifikasi yang telah ditandai dibaca
export const STORAGE_KEY_READ_NOTIFS = 'spct_read_notification_ids';
// Konstanta URL dasar endpoint API backend Spring Boot SPCT
const API_BASE = 'http://localhost:8081';

// Deklarasi array objek DEFAULT_NOTIFICATIONS sebagai data awal notifikasi sistem parkir
export const DEFAULT_NOTIFICATIONS = [
  {
    id: 'notif-anomali-live', // Identitas unik notifikasi
    type: 'ANOMALY', // Kategori notifikasi anomali
    title: 'Anomali: Penyerobotan Slot B1-03', // Judul ringkas notifikasi
    description: 'Sensor ultrasonik mendeteksi kendaraan di Slot B1-03 padahal status reservasi masih KOSONG.', // Deskripsi detail
    time: 'Baru saja', // Keterangan waktu relatif
    isRead: false, // Status keterbacaan notifikasi
    slotId: 'B1-03', // ID slot terkait
    severity: 'CRITICAL', // Tingkat keparahan kritis
    link: '/anomaly-logs', // Rute tautan halaman penanganan
  },
  {
    id: 'notif-masuk-live', // Identitas unik notifikasi
    type: 'ENTRY', // Kategori notifikasi kedatangan kendaraan
    title: 'Kendaraan Masuk: B 1842 SPZ', // Judul kedatangan plat nomor
    description: 'Mobil Toyota Fortuner terdeteksi di Barrier Gate Masuk 1. Rute alokasi diarahkan ke Slot A1-02.', // Keterangan rute
    time: '2 mnt lalu', // Waktu relatif kejadian
    isRead: false, // Status belum dibaca
    slotId: 'A1-02', // Kode slot yang dialokasikan
    severity: 'INFO', // Tingkat urgensi informasi
    link: '/gate-live', // Rute navigasi ke siaran langsung gerbang
  },
  {
    id: 'notif-masuk-live-2', // Identitas unik notifikasi
    type: 'ENTRY', // Kategori kedatangan kendaraan
    title: 'Kendaraan Masuk: D 9921 AB', // Judul notifikasi
    description: 'Kendaraan terdeteksi di Gerbang Utama. Slot B1-01 dialokasikan otomatis oleh AI Gateway.', // Penjelasan alokasi
    time: '7 mnt lalu', // Keterangan waktu
    isRead: true, // Status telah dibaca
    slotId: 'B1-01', // Kode slot parkir
    severity: 'INFO', // Tingkat keparahan
    link: '/gate-live', // Tautan rute halaman
  },
  {
    id: 'notif-anomali-live-2', // Identitas unik notifikasi
    type: 'ANOMALY', // Kategori anomali
    title: 'Anomali Durasi: Melebihi Batas Slot A2-05', // Judul pelanggaran batas waktu
    description: 'Kendaraan parkir melebihi kuota 24 jam tanpa perpanjangan sesi.', // Deskripsi insiden
    time: '18 mnt lalu', // Waktu kejadian
    isRead: true, // Status telah dibaca
    slotId: 'A2-05', // Kode slot parkir
    severity: 'WARNING', // Tingkat urgensi peringatan
    link: '/anomaly-logs', // Tautan menuju log anomali
  },
];

// Deklarasi fungsi pembantu getSavedReadIds untuk membaca himpunan (Set) ID notifikasi yang tersimpan di localStorage
const getSavedReadIds = () => {
  try {
    // Mengambil data string JSON dari localStorage
    const raw = localStorage.getItem(STORAGE_KEY_READ_NOTIFS);
    // Jika tidak ditemukan data, kembalikan Set kosong
    if (!raw) return new Set();
    // Mengurai data string ke array JSON
    const parsed = JSON.parse(raw);
    // Mengembalikan objek Set dari array ID
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    // Jika terjadi galat parsing, kembalikan Set kosong
    return new Set();
  }
};

// Deklarasi fungsi pembantu saveReadIds untuk menyimpan himpunan ID yang dibaca ke localStorage
const saveReadIds = (readSet) => {
  try {
    // Mengonversi himpunan Set menjadi array standar JavaScript
    const arr = Array.from(readSet);
    // Menyimpan array ID dalam bentuk JSON string ke localStorage
    localStorage.setItem(STORAGE_KEY_READ_NOTIFS, JSON.stringify(arr));
    // Memancarkan custom event peramban untuk sinkronisasi antar jendela atau komponen
    window.dispatchEvent(new Event('spct_notifications_change'));
  } catch {
    // Menangkap dan mengabaikan galat bila penyimpanan localStorage tidak diizinkan
  }
};

// Deklarasi fungsi komponen publik NotificationProvider untuk menyediakan state notifikasi real-time
export function NotificationProvider({ children }) {
  // Inisialisasi state readIds dengan himpunan ID yang telah dibaca dari penyimpanan lokal
  const [readIds, setReadIds] = useState(getSavedReadIds);
  // Inisialisasi state notifications dengan data default yang disinkronkan dengan status baca awal
  const [notifications, setNotifications] = useState(() => {
    // Membaca himpunan ID terbaca
    const initialRead = getSavedReadIds();
    // Memetakan notifikasi default dengan status isRead yang relevan
    return DEFAULT_NOTIFICATIONS.map((item) => ({
      ...item,
      isRead: item.isRead || initialRead.has(item.id),
    }));
  });

  // Deklarasi fungsi asinkron fetchNotifications dengan useCallback untuk polling log IoT dari server backend
  const fetchNotifications = useCallback(async () => {
    try {
      // Mengirimkan permintaan HTTP GET ke endpoint log IoT dengan menonaktifkan cache
      const res = await fetch(`${API_BASE}/api/monitoring/log-iot`, { cache: 'no-store' });
      // Jika respons gagal, hentikan eksekusi
      if (!res.ok) return;
      // Mengurai data respons log IoT ke bentuk array
      const logs = await res.json();

      // Jika data log valid dan memiliki elemen data
      if (Array.isArray(logs) && logs.length > 0) {
        // Mengambil set ID notifikasi yang sudah dibaca
        const currentReadIds = getSavedReadIds();

        // Mengambil 10 log terbaru dan memetakannya menjadi format antarmuka notifikasi
        const mapped = logs.slice(0, 10).map((log) => {
          // Evaluasi apakah log merupakan kategori anomali
          const isAnomaly = log.jenisKejadian?.includes('ANOMALI');
          // Evaluasi apakah log merupakan kedatangan atau ketibaan kendaraan
          const isEntry = log.jenisKejadian?.includes('MASUK') || log.jenisKejadian?.includes('TIBA');
          // Evaluasi apakah log merupakan kepulangan kendaraan
          const isExit = log.jenisKejadian?.includes('KELUAR');

          // Menentukan tipe notifikasi berdasarkan jenis kejadian
          let type = 'SYSTEM';
          if (isAnomaly) type = 'ANOMALY';
          else if (isEntry) type = 'ENTRY';
          else if (isExit) type = 'EXIT';

          // Memformat stempel waktu kejadian ke format jam dan menit lokal Indonesia
          const waktu = log.waktuKejadian
            ? new Date(log.waktuKejadian).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
            : 'Hari ini';

          // Menentukan format id unik notifikasi berbasis ID log database
          const id = `iot-log-${log.idLog}`;
          // Menentukan status baca apakah sudah ada di storage atau telah berstatus selesai divalidasi
          const isAlreadyRead = currentReadIds.has(id) || log.statusResolusi === 'SELESAI_DIVALIDASI';

          // Mengembalikan objek notifikasi yang telah distandardisasi
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

        // Memperbarui state notifikasi dengan menggabungkan data baru tanpa duplikasi ID
        setNotifications((prev) => {
          // Membuat himpunan ID dari data baru
          const ids = new Set(mapped.map((m) => m.id));
          // Memfilter notifikasi lama yang tidak terduplikasi
          const filteredPrev = prev.filter((p) => !ids.has(p.id));
          // Menggabungkan dan membatasi maksimal 15 item notifikasi
          const combined = [...mapped, ...filteredPrev].slice(0, 15);
          // Menyesuaikan status baca item
          return combined.map((item) => ({
            ...item,
            isRead: item.isRead || currentReadIds.has(item.id),
          }));
        });
      }
    } catch {
      // Menangkap galat jika backend sedang tidak dapat dijangkau
    }
  }, []);

  // Hook useEffect untuk menjalankan polling notifikasi backend setiap 10 detik (10000 ms)
  useEffect(() => {
    // Memanggil pembaruan data notifikasi saat pertama kali komponen dimuat
    fetchNotifications();
    // Menyetel interval waktu 10 detik untuk polling berkelanjutan
    const interval = setInterval(fetchNotifications, 10000);
    // Membersihkan interval timer saat unmount
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Hook useEffect untuk menyelaraskan status baca notifikasi dari localStorage dan event lintas tab
  useEffect(() => {
    // Fungsi sinkronisasi status baca
    const handleSync = () => {
      // Membaca daftar ID terbaru dari storage
      const latestRead = getSavedReadIds();
      // Memperbarui state readIds
      setReadIds(latestRead);
      // Memperbarui properti isRead pada array notifikasi aktif
      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          isRead: item.isRead || latestRead.has(item.id),
        }))
      );
    };

    // Mendaftarkan event listener storage dan event kustom SPCT
    window.addEventListener('storage', handleSync);
    window.addEventListener('spct_notifications_change', handleSync);
    // Menghapus event listener saat komponen NotificationProvider dilepas
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('spct_notifications_change', handleSync);
    };
  }, []);

  // Deklarasi fungsi memoize markAllRead untuk menandai seluruh notifikasi telah dibaca
  const markAllRead = useCallback(() => {
    setNotifications((prev) => {
      // Membuat himpunan baru dari ID yang tersimpan
      const newReadIds = new Set(getSavedReadIds());
      // Memasukkan seluruh ID notifikasi yang ada ke dalam himpunan
      prev.forEach((item) => newReadIds.add(item.id));
      // Menyimpan pembaruan ke localStorage
      saveReadIds(newReadIds);
      // Memperbarui state readIds
      setReadIds(newReadIds);
      // Mengembalikan array notifikasi dengan status isRead bernilai true
      return prev.map((item) => ({ ...item, isRead: true }));
    });
  }, []);

  // Deklarasi fungsi memoize markAsRead untuk menandai satu item notifikasi spesifik telah dibaca
  const markAsRead = useCallback((id) => {
    // Validasi parameter ID
    if (!id) return;
    setNotifications((prev) => {
      // Membuat himpunan ID baru dan menambahkan ID target
      const newReadIds = new Set(getSavedReadIds());
      newReadIds.add(id);
      // Menyimpan perubahan ke localStorage
      saveReadIds(newReadIds);
      // Memperbarui state readIds
      setReadIds(newReadIds);
      // Mengubah properti isRead item yang cocok menjadi true
      return prev.map((item) => (item.id === id ? { ...item, isRead: true } : item));
    });
  }, []);

  // Menghitung jumlah notifikasi yang belum dibaca menggunakan hook useMemo untuk optimasi performa
  const unreadCount = useMemo(() => {
    // Memfilter notifikasi yang belum dibaca dan mengembalikan panjang array-nya
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  // Mengembalikan penyedia NotificationContext beserta seluruh nilai state dan method aksinya
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

// Deklarasi hook kustom useNotification untuk mempermudah konsumsi NotificationContext
export function useNotification() {
  // Mengambil konteks notifikasi menggunakan useContext
  const context = useContext(NotificationContext);
  // Jika dipanggil di luar cakupan NotificationProvider, lempar Error
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  // Mengembalikan objek konteks notifikasi
  return context;
}
