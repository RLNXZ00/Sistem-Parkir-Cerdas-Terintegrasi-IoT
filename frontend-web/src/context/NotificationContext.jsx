// Import hook createContext, useContext, useState, useEffect, useCallback, dan useMemo dari pustaka react
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

// Membuat objek context NotificationContext untuk mengelola dan mendistribusikan data notifikasi sistem
const NotificationContext = createContext();

// Konstanta kunci localStorage untuk menyimpan ID notifikasi yang telah ditandai dibaca
export const STORAGE_KEY_READ_NOTIFS = 'spct_read_notification_ids';
// Konstanta URL dasar endpoint API backend Spring Boot SPCT
const API_BASE = 'http://localhost:8081';

// Deklarasi array objek DEFAULT_NOTIFICATIONS sebagai data awal notifikasi operasional petugas lapangan
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

// Deklarasi array objek DEFAULT_MANAGER_NOTIFICATIONS sebagai notifikasi sambutan manajer bila riwayat ekspor database masih kosong
export const DEFAULT_MANAGER_NOTIFICATIONS = [
  {
    id: 'mgr-info-export-ready', // Identitas unik notifikasi bawaan manajer
    type: 'REPORT', // Kategori notifikasi laporan manajerial
    format: 'PDF', // Penanda format berkas dukungan
    title: 'Ekspor Laporan Analitik Siap Digunakan', // Judul pengantar fitur ekspor laporan
    description: 'Riwayat dan notifikasi akan otomatis tercatat di sini setiap kali Anda mengekspor file PDF atau Excel di menu Laporan.', // Keterangan penggunaan
    time: 'Hari ini', // Waktu relatif notifikasi
    isRead: false, // Status belum dibaca secara bawaan
    fileBadge: 'PDF / XLSX', // Lencana format berkas
    severity: 'INFO', // Tingkat keparahan informasi
    link: '/reports', // Tautan langsung menuju halaman Laporan Analitik
    i18nMeta: {
      kind: 'MANAGER_WELCOME', // Penanda tipe metadata terjemahan sambutan manajer
    },
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

// Fungsi pembantu formatReportTypeIndo untuk memformat label kategori laporan dalam Bahasa Indonesia
const formatReportTypeIndo = (jenis) => {
  // Normalisasi teks jenis laporan ke huruf kecil
  const lower = String(jenis || '').toLowerCase();
  // Kembalikan padanan kategori laporan resmi
  if (lower.includes('finansial')) return 'Finansial';
  if (lower.includes('operasional')) return 'Operasional';
  if (lower.includes('lingkungan')) return 'Lingkungan (Eco)';
  if (lower.includes('komprehensif')) return 'Komprehensif';
  return jenis || 'Analitik';
};

// Deklarasi fungsi komponen publik NotificationProvider untuk menyediakan state notifikasi real-time lintas peran
export function NotificationProvider({ children }) {
  // Inisialisasi state readIds dengan himpunan ID yang telah dibaca dari penyimpanan lokal
  const [readIds, setReadIds] = useState(getSavedReadIds);
  // Inisialisasi state notifications (operasional petugas) dengan data default yang disinkronkan status bacanya
  const [notifications, setNotifications] = useState(() => {
    // Membaca himpunan ID terbaca
    const initialRead = getSavedReadIds();
    // Memetakan notifikasi default dengan status isRead yang relevan
    return DEFAULT_NOTIFICATIONS.map((item) => ({
      ...item,
      isRead: item.isRead || initialRead.has(item.id),
    }));
  });
  // Inisialisasi state reportNotifications untuk menyimpan riwayat dan notifikasi ekspor laporan manajer dari backend
  const [reportNotifications, setReportNotifications] = useState([]);

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

          // Mengembalikan objek notifikasi yang telah distandardisasi beserta metadata terjemahan reaktif
          return {
            id,
            type,
            title: isAnomaly
              ? `Anomali: ${log.jenisAnomali && log.jenisAnomali !== '-' ? log.jenisAnomali : 'Deteksi Sensor'}`
              : isEntry
              ? `Kendaraan Tiba di Slot ${(log.slotTerkait?.idSlot || '-').replace(/^M(\d+)/, 'B$1')}`
              : `Aktivitas Sensor IoT #${log.idLog}`,
            description: log.catatanDetail || 'Pembaruan telemetri sensor sistem parkir.',
            time: waktu,
            isRead: isAlreadyRead,
            slotId: log.slotTerkait?.idSlot ? log.slotTerkait.idSlot.replace(/^M(\d+)/, 'B$1') : undefined,
            severity: log.tingkatKeparahan || (isAnomaly ? 'CRITICAL' : 'INFO'),
            link: isAnomaly ? '/anomaly-logs' : '/dashboard',
            i18nMeta: {
              kind: isAnomaly ? 'ANOMALY' : (isEntry ? 'ENTRY' : 'SYSTEM'),
              idLog: log.idLog,
              jenisAnomali: log.jenisAnomali,
              slotId: (log.slotTerkait?.idSlot || '-').replace(/^M(\d+)/, 'B$1'),
              rawDetail: log.catatanDetail,
              hasWaktu: Boolean(log.waktuKejadian),
            },
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

  // Deklarasi fungsi asinkron fetchManagerReportAudit untuk mengambil riwayat ekspor PDF/Excel dari tabel log_audit_laporan
  const fetchManagerReportAudit = useCallback(async () => {
    try {
      // Mengirimkan permintaan HTTP GET ke endpoint audit unduhan laporan backend tanpa cache
      const res = await fetch(`${API_BASE}/api/laporan/audit`, { cache: 'no-store' });
      // Hentikan eksekusi apabila respons server tidak sukses
      if (!res.ok) return;
      // Mengurai respons JSON menjadi array rekaman audit
      const auditList = await res.json();

      // Memastikan data berupa array
      if (Array.isArray(auditList)) {
        // Mengambil himpunan ID notifikasi terbaca terkini dari localStorage
        const currentReadIds = getSavedReadIds();

        // Memetakan hingga 15 rekaman audit ekspor laporan menjadi item notifikasi manajer
        const mappedReports = auditList.slice(0, 15).map((log) => {
          // Menstandarkan label format berkas ke huruf kapital ('PDF' atau 'XLSX')
          const formatBerkas = String(log.formatBerkas || 'PDF').toUpperCase();
          // Membentuk ID unik notifikasi berdasarkan ID rekaman audit database
          const id = `report-audit-${log.idAudit}`;
          // Menentukan apakah notifikasi ekspor laporan ini telah ditandai dibaca oleh manajer
          const isAlreadyRead = currentReadIds.has(id);
          // Menghitung ukuran berkas dalam satuan Kilobyte (KB)
          const ukuranKB = log.ukuranByte ? (log.ukuranByte / 1024).toFixed(1) : '0.0';
          // Memformat stempel waktu unduhan menjadi jam dan menit setempat
          const waktu = log.waktuUnduh
            ? new Date(log.waktuUnduh).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
            : 'Hari ini';
          // Memformat kategori jenis laporan ke Bahasa Indonesia yang ramah
          const jenisLabel = formatReportTypeIndo(log.jenisLaporan);

          // Mengembalikan struktur objek notifikasi ekspor laporan yang siap dirender dan diterjemahkan
          return {
            id,
            type: 'REPORT',
            format: formatBerkas,
            title: `Ekspor ${formatBerkas}: Laporan ${jenisLabel}`,
            description: `Berkas ${log.namaBerkas || 'Dokumen Laporan'} (${ukuranKB} KB) telah diekspor oleh ${log.pengguna || 'Manajemen RS'}.`,
            time: waktu,
            isRead: isAlreadyRead,
            fileBadge: formatBerkas,
            severity: formatBerkas === 'PDF' ? 'INFO' : 'SUCCESS',
            link: '/reports',
            i18nMeta: {
              kind: 'REPORT_EXPORT',
              formatBerkas,
              jenisLaporan: log.jenisLaporan,
              namaBerkas: log.namaBerkas || 'Report Document',
              ukuranKB,
              pengguna: log.pengguna || 'Manajemen RS',
            },
          };
        });

        // Menyimpan daftar notifikasi riwayat ekspor laporan ke state reportNotifications
        setReportNotifications(mappedReports);
      }
    } catch {
      // Abaikan kesalahan secara tenang apabila layanan backend sedang offline
    }
  }, []);

  // Hook useEffect untuk menjalankan polling notifikasi operasional dan audit laporan setiap 10 detik (10000 ms)
  useEffect(() => {
    // Memanggil pembaruan data notifikasi lapangan dan laporan manajer saat pertama kali dimuat
    fetchNotifications();
    fetchManagerReportAudit();
    // Menyetel interval waktu 10 detik untuk polling berkelanjutan kedua sumber data
    const interval = setInterval(() => {
      fetchNotifications();
      fetchManagerReportAudit();
    }, 10000);
    // Membersihkan interval timer saat komponen NotificationProvider dilepas
    return () => clearInterval(interval);
  }, [fetchNotifications, fetchManagerReportAudit]);

  // Hook useEffect untuk menyelaraskan status baca notifikasi dari localStorage dan event lintas tab
  useEffect(() => {
    // Fungsi sinkronisasi status baca
    const handleSync = () => {
      // Membaca daftar ID terbaru dari storage
      const latestRead = getSavedReadIds();
      // Memperbarui state readIds
      setReadIds(latestRead);
      // Memperbarui properti isRead pada array notifikasi lapangan
      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          isRead: item.isRead || latestRead.has(item.id),
        }))
      );
      // Memperbarui properti isRead pada array notifikasi ekspor laporan manajer
      setReportNotifications((prev) =>
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

  // Memadukan daftar notifikasi khusus Manajer: riwayat ekspor laporan sebagai fokus utama ditambah peringatan anomali kritis
  const managerNotifications = useMemo(() => {
    // Menyaring hanya item bertipe ANOMALY dari log sistem untuk pengawasan manajerial (mengabaikan log rutin keluar-masuk gerbang)
    const anomalyAlerts = notifications.filter((item) => item.type === 'ANOMALY');
    // Jika telah terdapat riwayat ekspor dari database, tampilkan di urutan teratas diikuti peringatan anomali
    if (reportNotifications.length > 0) {
      return [...reportNotifications, ...anomalyAlerts].slice(0, 15);
    }
    // Jika riwayat ekspor backend masih kosong, tampilkan pesan pengantar manajer yang disinkronkan status bacanya bersama anomali aktif
    const currentReadIds = readIds;
    const defaultWelcome = DEFAULT_MANAGER_NOTIFICATIONS.map((item) => ({
      ...item,
      isRead: item.isRead || currentReadIds.has(item.id),
    }));
    return [...defaultWelcome, ...anomalyAlerts].slice(0, 15);
  }, [reportNotifications, notifications, readIds]);

  // Deklarasi fungsi memoize markAllRead untuk menandai seluruh notifikasi telah dibaca berdasarkan cakupan peran aktif
  const markAllRead = useCallback((scope = 'all') => {
    // Membaca himpunan ID terbaca terkini dari localStorage
    const newReadIds = new Set(getSavedReadIds());

    // Menambahkan ID sesuai cakupan peran ('manager', 'operator', atau 'all')
    if (scope === 'manager') {
      managerNotifications.forEach((item) => newReadIds.add(item.id));
    } else if (scope === 'operator') {
      notifications.forEach((item) => newReadIds.add(item.id));
    } else {
      notifications.forEach((item) => newReadIds.add(item.id));
      managerNotifications.forEach((item) => newReadIds.add(item.id));
    }

    // Menyimpan pembaruan himpunan ID terbaca ke localStorage
    saveReadIds(newReadIds);
    // Memperbarui state readIds
    setReadIds(newReadIds);

    // Memperbarui status isRead pada daftar notifikasi petugas
    setNotifications((prev) =>
      prev.map((item) => (newReadIds.has(item.id) ? { ...item, isRead: true } : item))
    );
    // Memperbarui status isRead pada daftar notifikasi ekspor laporan manajer
    setReportNotifications((prev) =>
      prev.map((item) => (newReadIds.has(item.id) ? { ...item, isRead: true } : item))
    );
  }, [notifications, managerNotifications]);

  // Deklarasi fungsi memoize markAsRead untuk menandai satu item notifikasi spesifik telah dibaca
  const markAsRead = useCallback((id) => {
    // Validasi parameter ID agar tidak kosong
    if (!id) return;
    // Membuat himpunan ID baru dan menambahkan ID target
    const newReadIds = new Set(getSavedReadIds());
    newReadIds.add(id);
    // Menyimpan perubahan ke localStorage
    saveReadIds(newReadIds);
    // Memperbarui state readIds
    setReadIds(newReadIds);

    // Mengubah properti isRead item yang cocok pada state notifikasi petugas
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
    );
    // Mengubah properti isRead item yang cocok pada state notifikasi laporan manajer
    setReportNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
    );
  }, []);

  // Menghitung jumlah notifikasi petugas yang belum dibaca menggunakan hook useMemo
  const unreadCount = useMemo(() => {
    // Memfilter notifikasi yang belum dibaca dan mengembalikan panjang array-nya
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  // Menghitung jumlah notifikasi manajer yang belum dibaca menggunakan hook useMemo
  const managerUnreadCount = useMemo(() => {
    // Memfilter daftar notifikasi manajer yang belum dibaca dan mengembalikan panjang array-nya
    return managerNotifications.filter((n) => !n.isRead).length;
  }, [managerNotifications]);

  // Mengembalikan penyedia NotificationContext beserta seluruh nilai state dan method aksinya
  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        managerNotifications,
        managerUnreadCount,
        markAllRead,
        markAsRead,
        refreshNotifications: fetchNotifications,
        refreshManagerNotifications: fetchManagerReportAudit,
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
