// Import hook useState dari pustaka react untuk manajemen state filter lokal
import { useState } from 'react';
// Import hook useNavigate dari react-router-dom untuk navigasi halaman saat item notifikasi diklik
import { useNavigate } from 'react-router-dom';
// Import kustom hook useLanguage untuk mendukung multi-bahasa terjemahan
import { useLanguage } from '../context/LanguageContext';

// Deklarasi fungsi komponen publik NotificationPopover untuk panel daftar notifikasi mengambang
export default function NotificationPopover({
  isOpen, // Properti boolean penanda apakah popover sedang terbuka
  onClose, // Fungsi callback untuk menutup popover
  notifications = [], // Array data daftar notifikasi (default array kosong)
  onMarkAllRead, // Fungsi callback untuk menandai semua notifikasi telah dibaca
  onNotificationClick, // Fungsi callback saat salah satu item notifikasi diklik
}) {
  // Mengambil fungsi penerjemah t dari LanguageContext
  const { t } = useLanguage();
  // Inisialisasi instance navigate untuk perpindahan rute URL
  const navigate = useNavigate();
  // Inisialisasi state activeFilter bertipe string dengan nilai awal 'ALL' ('ALL' | 'ENTRY' | 'ANOMALY')
  const [activeFilter, setActiveFilter] = useState('ALL');

  // Jika popover tidak dalam keadaan terbuka, jangan render elemen antarmuka (return null)
  if (!isOpen) return null;

  // Memfilter daftar notifikasi berdasarkan tab filter yang sedang aktif
  const filteredNotifications = notifications.filter((item) => {
    // Jika filter ENTRY aktif, hanya sertakan notifikasi bertipe 'ENTRY'
    if (activeFilter === 'ENTRY') return item.type === 'ENTRY';
    // Jika filter ANOMALY aktif, hanya sertakan notifikasi bertipe 'ANOMALY'
    if (activeFilter === 'ANOMALY') return item.type === 'ANOMALY';
    // Jika filter ALL, tampilkan seluruh item
    return true;
  });

  // Menghitung jumlah notifikasi yang belum dibaca (isRead === false)
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Deklarasi fungsi penanganan klik pada item notifikasi
  const handleItemClick = (item) => {
    // Panggil handler eksternal jika disediakan
    if (onNotificationClick) {
      onNotificationClick(item);
    }
    // Jika item memiliki tautan tujuan, arahkan ke rute tersebut dan tutup popover
    if (item.link) {
      navigate(item.link);
      onClose();
    }
  };

  // Deklarasi fungsi getIcon untuk memilih nama ikon Material Symbols berdasarkan tipe notifikasi
  const getIcon = (type) => {
    switch (type) {
      case 'ANOMALY':
        return 'warning'; // Ikon tanda peringatan untuk anomali
      case 'ENTRY':
        return 'directions_car'; // Ikon mobil untuk kendaraan masuk
      case 'EXIT':
        return 'logout'; // Ikon pintu keluar untuk kendaraan pulang
      default:
        return 'notifications'; // Ikon lonceng standar untuk sistem
    }
  };

  // Deklarasi fungsi getIconColors untuk menentukan skema warna ikon berdasarkan tipe dan tingkat urgensi
  const getIconColors = (type, severity) => {
    // Kondisi bila notifikasi bertipe anomali atau berstatus kritis
    if (type === 'ANOMALY' || severity === 'CRITICAL' || severity === 'critical') {
      return 'bg-red-500/10 text-red-500 border border-red-500/30';
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
      {/* Header popover berisi judul, lencana jumlah notifikasi baru, dan tombol tandai telah dibaca */}
      <div className="notification-popover-header px-4 py-3.5 border-b border-[#242f3b] flex items-center justify-between">
        {/* Judul dan lencana hitungan */}
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[19px] text-[#7ad0ff]">notifications_active</span>
          <h3 className="font-semibold text-sm text-white notification-title">
            {t('notification.title', 'Notifikasi Sistem')}
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

      {/* Baris tombol filter kategori notifikasi */}
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

        {/* Filter notifikasi kendaraan masuk */}
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
              {t('notification.empty', 'Tidak ada notifikasi')}
            </p>
          </div>
        ) : (
          // Looping untuk merender setiap item notifikasi yang cocok
          filteredNotifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`p-3.5 flex items-start gap-3 hover:bg-[#1c2430] transition-colors cursor-pointer group notification-item ${
                !item.isRead ? 'bg-[#18212b]/60 notification-item-unread' : ''
              }`}
            >
              {/* Ikon kategori notifikasi */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${getIconColors(
                  item.type,
                  item.severity
                )}`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {getIcon(item.type)}
                </span>
              </div>

              {/* Rincian teks notifikasi */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  {/* Judul notifikasi */}
                  <span className="text-xs font-semibold text-white truncate notification-item-title group-hover:text-[#7ad0ff] transition-colors">
                    {item.title}
                  </span>
                  {/* Titik penanda item belum dibaca */}
                  {!item.isRead && (
                    <span className="w-2 h-2 rounded-full bg-[#ea580c] shrink-0" title="Belum dibaca"></span>
                  )}
                </div>

                {/* Deskripsi ringkas isi pemberitahuan */}
                <p className="text-[11px] text-[#9bb0c1] leading-relaxed line-clamp-2 notification-item-desc mb-1.5">
                  {item.description}
                </p>

                {/* Informasi waktu dan ID slot terkait */}
                <div className="flex items-center justify-between text-[10px] font-mono text-[#7d90a1] notification-item-time">
                  <span>{item.time}</span>
                  {item.slotId && (
                    <span className="px-1.5 py-0.2 rounded bg-[#10151a] border border-[#273542] text-[#7ad0ff] notification-item-slot">
                      Slot: {item.slotId}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bagian footer popover berisi tautan cepat ke modul log anomali dan kamera gerbang */}
      <div className="px-4 py-2.5 bg-[#0f1419] border-t border-[#242f3b] flex items-center justify-between text-xs font-mono notification-popover-footer">
        {/* Tautan navigasi ke halaman Log Anomali */}
        <button
          onClick={() => {
            navigate('/anomaly-logs');
            onClose();
          }}
          className="text-[#f87171] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>Log Anomali</span>
          <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
        </button>

        {/* Tautan navigasi ke halaman Gate Live OCR */}
        <button
          onClick={() => {
            navigate('/gate-live');
            onClose();
          }}
          className="text-[#7ad0ff] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>Gate Live OCR</span>
          <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
