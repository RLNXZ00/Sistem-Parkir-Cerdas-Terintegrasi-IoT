// Import hook useState dari pustaka react untuk manajemen state filter lokal
import { useState } from 'react';
// Import hook useNavigate dan useLocation dari react-router-dom untuk navigasi dan deteksi rute aktif
import { useNavigate, useLocation } from 'react-router-dom';
// Import kustom hook useLanguage untuk mendukung multi-bahasa terjemahan
import { useLanguage } from '../context/LanguageContext';
// Import fungsi helper penerjemahan kategori anomali, rincian log IoT, dan kategori laporan
import { translateAnomalyCategory, translateLogDetail, translateReportType } from '../i18n/i18nHelpers';

// Deklarasi fungsi komponen publik NotificationPopover untuk panel daftar notifikasi mengambang
export default function NotificationPopover({
  isOpen, // Properti boolean penanda apakah popover sedang terbuka
  onClose, // Fungsi callback untuk menutup popover
  notifications = [], // Array data daftar notifikasi (default array kosong)
  onMarkAllRead, // Fungsi callback untuk menandai semua notifikasi telah dibaca
  onNotificationClick, // Fungsi callback saat salah satu item notifikasi diklik
}) {
  // Mengambil fungsi penerjemah t dan kode bahasa aktif lang dari LanguageContext
  const { t, lang } = useLanguage();
  // Inisialisasi instance navigate untuk perpindahan rute URL
  const navigate = useNavigate();
  // Mengambil instance lokasi rute aktif saat ini
  const location = useLocation();
  // Membaca data profil pengguna dari sessionStorage atau fallback objek kosong
  const userData = JSON.parse(sessionStorage.getItem('spct_user') || '{}');
  // Menentukan apakah rute aktif saat ini berada di bawah cakupan modul manajemen (/dashboard-management atau /reports)
  const isManagementRoute = location.pathname.startsWith('/dashboard-management') || location.pathname.startsWith('/reports');
  // Menentukan status boolean apakah pengguna bertindak sebagai Manajer
  const isManager = userData.role === 'ADMIN' || userData.role === 'Manajemen RS' || isManagementRoute;

  // Inisialisasi state activeFilter bertipe string dengan nilai awal 'ALL' ('ALL' | 'ENTRY' | 'REPORT' | 'ANOMALY')
  const [activeFilter, setActiveFilter] = useState('ALL');

  // Jika popover tidak dalam keadaan terbuka, jangan render elemen antarmuka (return null)
  if (!isOpen) return null;

  // Memfilter daftar notifikasi berdasarkan tab filter yang sedang aktif dan peran pengguna
  const filteredNotifications = notifications.filter((item) => {
    // Jika filter ENTRY aktif dan bukan mode manajer, hanya sertakan notifikasi kedatangan kendaraan
    if (activeFilter === 'ENTRY' && !isManager) return item.type === 'ENTRY';
    // Jika filter REPORT aktif dan berada di mode manajer, hanya sertakan notifikasi riwayat ekspor laporan
    if (activeFilter === 'REPORT' && isManager) return item.type === 'REPORT';
    // Jika filter ANOMALY aktif, hanya sertakan notifikasi bertipe 'ANOMALY'
    if (activeFilter === 'ANOMALY') return item.type === 'ANOMALY';
    // Jika filter ALL atau filter tidak berlaku untuk peran aktif, tampilkan seluruh item
    return true;
  });

  // Menghitung jumlah notifikasi yang belum dibaca (isRead === false)
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Deklarasi fungsi penanganan klik pada item notifikasi
  const handleItemClick = (item) => {
    // Panggil handler eksternal jika disediakan untuk menandai sudah dibaca
    if (onNotificationClick) {
      onNotificationClick(item);
    }
    // Jika item memiliki tautan tujuan, arahkan ke rute tersebut dan tutup popover
    if (item.link) {
      navigate(item.link);
      onClose();
    }
  };

  // Deklarasi fungsi getIcon untuk memilih nama ikon Material Symbols berdasarkan tipe dan format notifikasi
  const getIcon = (item) => {
    switch (item.type) {
      case 'ANOMALY':
        return 'warning'; // Ikon tanda peringatan untuk anomali
      case 'ENTRY':
        return 'directions_car'; // Ikon mobil untuk kendaraan masuk
      case 'EXIT':
        return 'logout'; // Ikon pintu keluar untuk kendaraan pulang
      case 'REPORT':
        // Pilih ikon dokumen khusus PDF, Spreadsheet Excel, atau dokumen umum
        if (item.format === 'PDF') return 'picture_as_pdf';
        if (item.format === 'XLSX' || item.format === 'EXCEL') return 'table_view';
        return 'description';
      default:
        return 'notifications'; // Ikon lonceng standar untuk sistem
    }
  };

  // Deklarasi fungsi getIconColors untuk menentukan skema warna ikon berdasarkan tipe, format berkas, dan tingkat urgensi
  const getIconColors = (item) => {
    const { type, severity, format } = item;
    // Kondisi bila notifikasi bertipe anomali atau berstatus kritis
    if (type === 'ANOMALY' || severity === 'CRITICAL' || severity === 'critical') {
      return 'bg-red-500/10 text-red-500 border border-red-500/30';
    }
    // Kondisi bila notifikasi bertipe ekspor laporan manajerial (PDF merah mawar, Excel hijau zamrud)
    if (type === 'REPORT') {
      if (format === 'XLSX' || format === 'EXCEL') {
        return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30';
      }
      if (format === 'PDF') {
        return 'bg-rose-500/10 text-rose-500 border border-rose-500/30';
      }
      return 'bg-sky-500/10 text-sky-500 border border-sky-500/30';
    }
    // Kondisi bila notifikasi bertipe kedatangan kendaraan masuk
    if (type === 'ENTRY') {
      return 'bg-sky-500/10 text-sky-500 border border-sky-500/30';
    }
    // Kondisi bila notifikasi bertipe kendaraan keluar
    if (type === 'EXIT') {
      return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30';
    }
    // Kondisi umum lainnya dengan warna kuning amber
    return 'bg-amber-500/10 text-amber-500 border border-amber-500/30';
  };

  // Mengembalikan elemen antarmuka JSX panel popover notifikasi
  return (
    // Wadah panel popover dengan posisi absolut di bawah lonceng notifikasi TopBar
    <div
      className="notification-popover absolute right-0 top-full mt-2 w-[340px] sm:w-[400px] bg-[#141b22] border border-[#2d3a47] rounded-2xl shadow-2xl z-50 overflow-hidden transition-all duration-200 animate-fadeIn"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header popover berisi judul adaptif peran, lencana jumlah notifikasi baru, dan tombol tandai telah dibaca */}
      <div className="notification-popover-header px-4 py-3.5 border-b border-[#242f3b] flex items-center justify-between">
        {/* Judul dan lencana hitungan */}
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[19px] text-[#7ad0ff]">
            {isManager ? 'receipt_long' : 'notifications_active'}
          </span>
          <h3 className="font-semibold text-sm text-white notification-title">
            {isManager
              ? t('notification.managerTitle', 'Riwayat & Notifikasi Manajer')
              : t('notification.title', 'Notifikasi Sistem')}
          </h3>
          {/* Lencana angka belum dibaca */}
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#ea580c] text-white">
              {unreadCount} {t('notification.new', 'Baru')}
            </span>
          )}
        </div>

        {/* Tombol aksi cepat untuk menandai semua notifikasi telah dibaca */}
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="text-[11px] font-mono text-[#7ad0ff] hover:text-white hover:underline transition-colors cursor-pointer flex items-center gap-1"
            title={t('notification.markAllRead', 'Tandai semua telah dibaca')}
          >
            <span className="material-symbols-outlined text-[14px]">done_all</span>
            <span>{t('notification.markAll', 'Tandai Dibaca')}</span>
          </button>
        )}
      </div>

      {/* Baris tombol filter kategori notifikasi adaptif sesuai peran pengguna */}
      <div className="px-3 pt-2.5 pb-2 border-b border-[#242f3b] flex gap-1.5 notification-popover-filter bg-[#0f1419]/50">
        {/* Filter semua notifikasi */}
        <button
          onClick={() => setActiveFilter('ALL')}
          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
            activeFilter === 'ALL'
              ? 'bg-[#1e2936] text-[#7ad0ff] border border-[#3b4b5d] notification-filter-active'
              : 'text-[#8fa0b0] hover:text-white hover:bg-[#1a232d] notification-filter-inactive'
          }`}
        >
          {t('notification.all', 'Semua')} ({notifications.length})
        </button>

        {/* Jika Manajer, tampilkan filter Ekspor Laporan; jika Petugas Lapangan, tampilkan filter Kendaraan Masuk */}
        {isManager ? (
          <button
            onClick={() => setActiveFilter('REPORT')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer flex items-center gap-1 ${
              activeFilter === 'REPORT'
                ? 'bg-[#102438] text-[#7ad0ff] border border-[#1b4363] notification-filter-active'
                : 'text-[#8fa0b0] hover:text-white hover:bg-[#1a232d] notification-filter-inactive'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
            {t('notification.exportReport', 'Ekspor Laporan')}
          </button>
        ) : (
          <button
            onClick={() => setActiveFilter('ENTRY')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer flex items-center gap-1 ${
              activeFilter === 'ENTRY'
                ? 'bg-[#102438] text-[#7ad0ff] border border-[#1b4363] notification-filter-active'
                : 'text-[#8fa0b0] hover:text-white hover:bg-[#1a232d] notification-filter-inactive'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#00bfff]"></span>
            {t('notification.entry', 'Kendaraan Masuk')}
          </button>
        )}

        {/* Filter notifikasi insiden anomali */}
        <button
          onClick={() => setActiveFilter('ANOMALY')}
          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer flex items-center gap-1 ${
            activeFilter === 'ANOMALY'
              ? 'bg-[#2b1619] text-[#f87171] border border-[#52252a] notification-filter-active-anomaly'
              : 'text-[#8fa0b0] hover:text-white hover:bg-[#1a232d] notification-filter-inactive'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]"></span>
          {t('notification.anomaly', 'Anomali')}
        </button>
      </div>

      {/* Daftar gulir item notifikasi */}
      <div className="max-h-[320px] overflow-y-auto divide-y divide-[#242f3b] notification-popover-list">
        {/* Jika tidak ada notifikasi pada filter yang aktif, tampilkan ilustrasi kosong */}
        {filteredNotifications.length === 0 ? (
          <div className="py-8 px-4 text-center flex flex-col items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[36px] text-[#55697d]">notifications_off</span>
            <p className="text-xs text-[#8fa0b0] font-mono">
              {isManager
                ? t('notification.emptyManager', 'Belum ada riwayat ekspor laporan atau peringatan audit')
                : t('notification.empty', 'Tidak ada notifikasi')}
            </p>
          </div>
        ) : (
          // Looping untuk merender setiap item notifikasi yang cocok secara dwibahasa
          filteredNotifications.map((item) => {
            // Inisialisasi judul tampil dengan nilai asli item
            let displayTitle = item.title;
            // Terapkan translasi judul otomatis bila antarmuka menggunakan Bahasa Inggris
            if (lang === 'en') {
              if (item.i18nMeta?.kind === 'REPORT_EXPORT') {
                // Terjemahkan judul notifikasi hasil ekspor PDF / XLSX
                const reportLabel = translateReportType(item.i18nMeta.jenisLaporan, 'en');
                displayTitle = `Exported ${item.i18nMeta.formatBerkas}: ${reportLabel} Report`;
              } else if (item.i18nMeta?.kind === 'MANAGER_WELCOME') {
                // Terjemahkan judul pengantar pusat laporan manajer
                displayTitle = 'Analytics Report Export Ready';
              } else if (item.i18nMeta) {
                if (item.i18nMeta.kind === 'ANOMALY') {
                  const cat = item.i18nMeta.jenisAnomali && item.i18nMeta.jenisAnomali !== '-'
                    ? translateAnomalyCategory(item.i18nMeta.jenisAnomali, 'en')
                    : 'Sensor Detection';
                  displayTitle = `Anomaly: ${cat}`;
                } else if (item.i18nMeta.kind === 'ENTRY') {
                  displayTitle = `Vehicle Arrived at Slot ${item.i18nMeta.slotId}`;
                } else {
                  displayTitle = `IoT Sensor Activity #${item.i18nMeta.idLog}`;
                }
              } else {
                displayTitle = String(item.title || '')
                  .replace(/^Anomali: Penyerobotan Slot\b/i, 'Anomaly: Slot Poaching')
                  .replace(/^Anomali Durasi: Melebihi Batas Slot\b/i, 'Duration Anomaly: Exceeded Limit at Slot')
                  .replace(/^Kendaraan Masuk:/i, 'Vehicle Entry:');
              }
            }

            // Menentukan deskripsi notifikasi reaktif sesuai tipe metadata dan bahasa aktif
            let displayDesc = item.description;
            if (item.i18nMeta?.kind === 'REPORT_EXPORT') {
              if (lang === 'en') {
                displayDesc = `File ${item.i18nMeta.namaBerkas} (${item.i18nMeta.ukuranKB} KB) exported by ${item.i18nMeta.pengguna}.`;
              }
            } else if (item.i18nMeta?.kind === 'MANAGER_WELCOME') {
              if (lang === 'en') {
                displayDesc = 'Export history and notifications will appear automatically here whenever you download PDF or Excel reports.';
              }
            } else {
              displayDesc = item.i18nMeta?.rawDetail
                ? translateLogDetail(item.i18nMeta.rawDetail, lang)
                : translateLogDetail(item.description, lang);
              if (lang === 'en' && !item.i18nMeta?.rawDetail) {
                displayDesc = displayDesc
                  .replace('Pembaruan telemetri sensor sistem parkir.', 'Parking system sensor telemetry update.')
                  .replace('Sensor ultrasonik mendeteksi kendaraan di Slot', 'Ultrasonic sensor detected a vehicle in Slot')
                  .replace('padahal status reservasi masih KOSONG.', 'while reservation status is still VACANT.')
                  .replace('Kendaraan terdeteksi di Gerbang Utama. Slot', 'Vehicle detected at Main Gate. Slot')
                  .replace('dialokasikan otomatis oleh AI Gateway.', 'was automatically allocated by AI Gateway.')
                  .replace('terdeteksi di Barrier Gate Masuk 1. Rute alokasi diarahkan ke Slot', 'detected at Entry Barrier Gate 1. Route guided to Slot')
                  .replace('Kendaraan parkir melebihi kuota 24 jam tanpa perpanjangan sesi.', 'Vehicle exceeded the 24-hour parking quota without session extension.');
              }
            }

            // Tentukan format waktu relatif sesuai bahasa aktif
            const displayTime = lang === 'en'
              ? String(item.time || '')
                  .replace(/^Baru saja$/i, 'Just now')
                  .replace(/^Hari ini$/i, 'Today')
                  .replace(/(\d+)\s*mnt lalu/gi, '$1 mins ago')
              : item.time;

            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`p-3.5 flex items-start gap-3 hover:bg-[#1c2430] transition-colors cursor-pointer group notification-item ${
                  !item.isRead ? 'bg-[#18212b]/60 notification-item-unread' : ''
                }`}
              >
                {/* Ikon kategori atau tipe berkas notifikasi */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${getIconColors(item)}`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {getIcon(item)}
                  </span>
                </div>

                {/* Rincian teks notifikasi */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    {/* Judul notifikasi */}
                    <span className="text-xs font-semibold text-white truncate notification-item-title group-hover:text-[#7ad0ff] transition-colors">
                      {displayTitle}
                    </span>
                    {/* Titik penanda item belum dibaca */}
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#ea580c] shrink-0" title={t('notification.unreadTooltip', 'Belum dibaca')}></span>
                    )}
                  </div>

                  {/* Deskripsi ringkas isi pemberitahuan */}
                  <p className="text-[11px] text-[#9bb0c1] leading-relaxed line-clamp-2 notification-item-desc mb-1.5">
                    {displayDesc}
                  </p>

                  {/* Informasi waktu serta lencana format berkas atau ID slot terkait */}
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#7d90a1] notification-item-time">
                    <span>{displayTime}</span>
                    {item.fileBadge ? (
                      <span
                        className={`px-1.5 py-0.2 rounded font-bold border ${
                          item.format === 'XLSX'
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                            : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                        }`}
                      >
                        {item.fileBadge}
                      </span>
                    ) : item.slotId ? (
                      <span className="px-1.5 py-0.2 rounded bg-[#10151a] border border-[#273542] text-[#7ad0ff] notification-item-slot">
                        Slot: {item.slotId}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bagian footer popover berisi tautan cepat adaptif berbasis peran pengguna (Role-Based Access) */}
      <div className="px-4 py-2.5 bg-[#0f1419] border-t border-[#242f3b] flex items-center justify-between text-xs font-mono notification-popover-footer">
        {/* Tautan navigasi ke halaman Log Anomali */}
        <button
          onClick={() => {
            navigate('/anomaly-logs');
            onClose();
          }}
          className="text-[#f87171] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>{t('notification.anomalyLogs', 'Log Anomali')}</span>
          <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
        </button>

        {/* Tautan navigasi adaptif: Laporan Analitik untuk Manajer, atau Gate Live OCR untuk Petugas Lapangan */}
        {isManager ? (
          <button
            onClick={() => {
              navigate('/reports');
              onClose();
            }}
            className="text-[#7ad0ff] hover:underline flex items-center gap-1 cursor-pointer"
            title={t('topbar.reports', 'Laporan Analitik')}
          >
            <span>{t('notification.reports', 'Laporan Analitik')}</span>
            <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
          </button>
        ) : (
          <button
            onClick={() => {
              navigate('/gate-live');
              onClose();
            }}
            className="text-[#7ad0ff] hover:underline flex items-center gap-1 cursor-pointer"
            title={t('nav.gateLive', 'Gate Live OCR Feed')}
          >
            <span>{t('notification.gateLive', 'Gate Live OCR')}</span>
            <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
          </button>
        )}
      </div>
    </div>
  );
}
