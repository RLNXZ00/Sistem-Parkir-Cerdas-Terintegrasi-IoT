// Import hook useState, useEffect, dan useCallback dari pustaka react untuk penanganan state dan efek samping
import { useState, useEffect, useCallback } from 'react';
// Import komponen AppLayout sebagai kerangka tata letak navigasi halaman
import AppLayout from '../components/AppLayout';
// Import hook useLanguage dari konteks bahasa untuk internasionalisasi antarmuka
import { useLanguage } from '../context/LanguageContext';

// Mendefinisikan konstanta alamat dasar server backend Spring Boot (port 8081)
const API_BASE = 'http://localhost:8081';

// Konfigurasi visual lencana tingkat keparahan anomali sistem (CRITICAL, WARNING, INFO)
const SEVERITY_CONFIG = {
  CRITICAL: { cls: 'bg-alert-anomaly/10 border-l-4 border-alert-anomaly', badge: 'bg-error-container text-on-error-container', dot: 'bg-alert-anomaly animate-pulse', icon: 'dangerous' },
  WARNING: { cls: 'bg-warning-reserved/5 border-l-4 border-warning-reserved', badge: 'bg-warning-reserved/20 text-warning-reserved', dot: 'bg-warning-reserved', icon: 'warning' },
  INFO: { cls: 'bg-system-info/5 border-l-4 border-system-info', badge: 'bg-system-info/20 text-system-info', dot: 'bg-system-info', icon: 'info' },
};

// Deklarasi fungsi komponen publik AnomalyLogsPage untuk rekam jejak insiden dan validasi lapangan
export default function AnomalyLogsPage() {
  // Mengambil fungsi penerjemah t dari context LanguageContext
  const { t } = useLanguage();
  // Inisialisasi state anomalies bertipe array kosong untuk menampung seluruh daftar log anomali IoT
  const [anomalies, setAnomalies] = useState([]);
  // Inisialisasi state filter bertipe string dengan nilai awal 'ALL' untuk menyaring status penanganan
  const [filter, setFilter] = useState('ALL');
  // Inisialisasi state selectedAnomaly bertipe objek atau null untuk menampung data modal investigasi
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  // Inisialisasi state isLoading bertipe boolean dengan nilai awal true
  const [isLoading, setIsLoading] = useState(true);
  
  // Inisialisasi state jenisAnomali bertipe string dengan nilai awal 'Salah Parkir' untuk opsi form modal
  const [jenisAnomali, setJenisAnomali] = useState('Salah Parkir');
  // Inisialisasi state pesanLain bertipe string dengan nilai awal string kosong untuk catatan tambahan petugas
  const [pesanLain, setPesanLain] = useState('');

  // Deklarasi fungsi memoize fetchAnomalies untuk mengambil rekam jejak telemetri sensor dari backend
  const fetchAnomalies = useCallback(async () => {
    try {
      // Mengirimkan permintaan HTTP GET ke endpoint log sensor IoT
      const res = await fetch(`${API_BASE}/api/monitoring/log-iot`);
      // Jika respons berhasil, olah array data log
      if (res.ok) {
        const data = await res.json();
        // Memetakan properti model entitas backend ke dalam format state antarmuka frontend
        const mapped = data.map(log => ({
          // Nomor identitas rekaman log
          id: log.idLog,
          // Kode slot parkir terkait
          slot: log.slotTerkait?.idSlot || '-',
          // Kategori kejadian sistem
          type: log.jenisKejadian,
          // Kategori spesifik anomali
          jenisAnomali: log.jenisAnomali || '-',
          // Tingkat urgensi keparahan
          severity: log.tingkatKeparahan,
          // Waktu terjadinya anomali dalam format string waktu lokal Indonesia
          time: new Date(log.waktuKejadian).toLocaleTimeString('id-ID'),
          // Deskripsi detail insiden dari sensor
          desc: log.catatanDetail,
          // Nomor plat kendaraan yang terdeteksi berada di slot
          plate: log.slotTerkait?.kendaraanAktif?.platNomor || 'UNKNOWN',
          // Status resolusi anomali saat ini
          status: log.statusResolusi
        }));
        // Memperbarui state anomalies dengan data yang telah dipetakan
        setAnomalies(mapped);
      }
    } catch (e) {
      // Menampilkan pesan kegagalan ke konsol jika permintaan gagal
      console.error('Failed to fetch anomalies', e);
    } finally {
      // Mematikan status loading
      setIsLoading(false);
    }
  }, []);

  // Hook useEffect untuk memanggil fetchAnomalies awal dan mengaktifkan interval polling setiap 5 detik
  useEffect(() => {
    fetchAnomalies();
    const interval = setInterval(fetchAnomalies, 5000);
    return () => clearInterval(interval);
  }, [fetchAnomalies]);

  // Deklarasi fungsi asinkron handleAction untuk mengirim resolusi anomali ke endpoint backend
  const handleAction = async (id, action) => {
    try {
      // Menyiapkan payload tubuh permintaan JSON yang akan dikirim ke server
      const payload = {
        // Jika aksi dismiss (False Positive), set kategori 'False Positive'; jika tidak, ambil nilai state jenisAnomali
        jenisAnomali: action === 'dismiss' ? 'False Positive' : jenisAnomali,
        // Jika aksi dismiss, gunakan catatan default; jika tidak, kirim isi textarea pesanLain
        catatanTambahan: action === 'dismiss' ? 'Ditandai False Positive oleh petugas' : pesanLain
      };

      // Mengirimkan permintaan HTTP PUT ke endpoint /api/monitoring/anomali/{id}/selesai
      await fetch(`${API_BASE}/api/monitoring/anomali/${id}/selesai`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      // Mengambil ulang data anomali terbaru dari database
      fetchAnomalies();
      // Menutup tampilan jendela modal dialog
      setSelectedAnomaly(null);
      // Mengosongkan isian catatan tambahan
      setPesanLain('');
      // Mereset pilihan jenis anomali ke 'Salah Parkir'
      setJenisAnomali('Salah Parkir');
    } catch (e) {
      // Menampilkan pesan kesalahan di konsol
      console.error('Failed to resolve anomaly', e);
    }
  };

  // Memfilter daftar anomali berdasarkan tab filter aktif ('ALL', 'BELUM_DITANGANI', atau 'SELESAI_DIVALIDASI')
  const filtered = filter === 'ALL' ? anomalies : anomalies.filter(a => a.status === filter);
  // Menghitung jumlah anomali kritis yang belum ditangani
  const criticalCount = anomalies.filter(a => a.severity === 'CRITICAL' && a.status === 'BELUM_DITANGANI').length;

  // Mengembalikan elemen JSX halaman log anomali
  return (
    // Membungkus halaman dengan kerangka AppLayout dan breadcrumb
    <AppLayout breadcrumb={t('topbar.anomalyLogs', 'Anomaly Logs')}>
      {/* Wadah utama halaman dengan latar belakang tema gelap */}
      <div className="p-6 bg-background min-h-full flex flex-col gap-6">

        {/* Bagian header judul halaman dan lencana peringatan kritis */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-4xl font-bold text-on-surface tracking-tight">{t('anomaly.title', 'Anomaly Logs')}</h1>
            <p className="text-text-muted font-mono text-sm mt-1">{t('anomaly.subtitle', 'IOT_SENSOR_NETWORK // OPERATIONAL CONTROL')}</p>
          </div>
          {/* Lencana peringatan jumlah anomali kritis aktif */}
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <div className="flex items-center gap-2 bg-error-container/20 border border-alert-anomaly/30 px-3 py-2 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-alert-anomaly animate-ping absolute"></div>
                <div className="w-2 h-2 rounded-full bg-alert-anomaly relative"></div>
                <span className="text-alert-anomaly font-mono text-sm font-bold">{criticalCount} {t('anomaly.criticalActive','Critical Aktif')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Baris tab tombol penyaring status anomali */}
        <div className="flex gap-2 border-b border-surface-variant pb-4">
          {['ALL', 'BELUM_DITANGANI', 'SELESAI_DIVALIDASI'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-mono text-sm font-semibold transition-colors cursor-pointer ${
                filter === f
                  ? 'bg-primary-container text-on-primary-container'
                  : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'
              }`}
            >
              {f === 'ALL' ? t('common.all', 'Semua Log') : f === 'BELUM_DITANGANI' ? t('anomaly.tabUnresolved', 'Belum Ditangani') : t('anomaly.tabResolved', 'Selesai Divalidasi')}
            </button>
          ))}
        </div>

        {/* Daftar kartu rekaman anomali */}
        <div className="flex flex-col gap-3">
          {/* Looping untuk merender masing-masing kartu anomali */}
          {filtered.map(anomaly => {
            const cfg = SEVERITY_CONFIG[anomaly.severity] || SEVERITY_CONFIG.WARNING;
            const resolved = anomaly.status === 'SELESAI_DIVALIDASI' || anomaly.severity === 'INFO';
            return (
              <div key={anomaly.id} className={`rounded-xl p-5 transition-all ${cfg.cls} ${resolved ? 'opacity-60' : 'hover:brightness-110'}`}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    {/* Titik indikator warna tingkat urgensi */}
                    <div className="mt-1 flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full ${cfg.dot}`}></div>
                    </div>
                    {/* Informasi detail anomali */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${cfg.badge}`}>{anomaly.severity}</span>
                        <span className="text-on-surface font-bold font-mono">SLOT {anomaly.slot}</span>
                        <span className="text-on-surface-variant font-mono text-sm">— {anomaly.type}</span>
                      </div>
                      <p className="text-sm text-on-surface mb-2">{anomaly.desc}</p>
                      <div className="flex flex-wrap gap-4 text-xs font-mono text-on-surface-variant">
                        <span>{t('anomaly.plate','Plat')}: <span className="text-primary">{anomaly.plate}</span></span>
                        <span>{t('anomaly.time','Waktu')}: {anomaly.time}</span>
                        {anomaly.jenisAnomali && anomaly.jenisAnomali !== '-' && (
                          <span>{t('anomaly.category','Kategori')}: <span className="text-on-surface font-semibold bg-surface-container px-2 py-0.5 rounded border border-outline-variant/30 text-primary">{anomaly.jenisAnomali}</span></span>
                        )}
                        <span className={`font-semibold ${resolved ? 'text-eco-success' : 'text-warning-reserved'}`}>
                          {resolved ? t('anomaly.resolved','✓ Selesai Divalidasi') : t('anomaly.pending','⚠ Belum Ditangani')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tombol aksi penanganan anomali jika belum selesai divalidasi */}
                  {!resolved && (
                    <div className="flex gap-2 flex-shrink-0">
                      {/* Tombol aksi False Positive */}
                      <button
                        onClick={() => handleAction(anomaly.id, 'dismiss')}
                        className="px-3 py-2 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-variant text-xs font-mono transition-colors"
                      >
                        {t('anomaly.falsePositive','False Positive')}
                      </button>
                      {/* Tombol aksi Tangani untuk membuka modal dispatch petugas */}
                      <button
                        onClick={() => {
                          setSelectedAnomaly(anomaly);
                          setJenisAnomali('Salah Parkir');
                          setPesanLain('');
                        }}
                        className="px-4 py-2 rounded-lg bg-alert-anomaly hover:bg-alert-anomaly/80 text-white text-xs font-bold font-mono transition-colors"
                      >
                        {t('anomaly.handle','Tangani')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Tampilan kondisi kosong saat tidak ada anomali yang ditemukan */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
            <span className="material-symbols-outlined text-6xl mb-3 text-eco-success">check_circle</span>
            <p className="font-mono">{t('anomaly.noAnomaly','Tidak ada anomali ditemukan.')}</p>
          </div>
        )}
      </div>

      {/* Modal Dialog Tindak Lanjut Anomali (Acknowledge Anomaly) */}
      {selectedAnomaly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/80 backdrop-blur-sm p-4">
          <div className="bg-surface w-full max-w-lg rounded-xl border border-surface-container-highest shadow-2xl overflow-hidden flex flex-col">
            {/* Header modal dialog */}
            <div className="px-6 py-4 border-b border-surface-container-highest bg-surface-container-low flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-alert-anomaly"></div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-alert-anomaly/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-alert-anomaly">warning</span>
                </div>
                <h3 className="text-headline-md font-headline-md text-on-surface">Acknowledge Anomaly</h3>
              </div>
              {/* Tombol silang untuk menutup modal */}
              <button 
                onClick={() => setSelectedAnomaly(null)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded hover:bg-surface-bright transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            {/* Tubuh modal dialog dengan informasi target slot dan konteks peta */}
            <div className="p-6 flex flex-col gap-6">
              {/* Baris data slot target dan waktu deteksi */}
              <div className="grid grid-cols-2 gap-4 bg-surface-container px-4 py-3 rounded-lg border border-outline-variant/20">
                <div className="flex flex-col">
                  <span className="text-xs font-tech-mono text-on-surface-variant uppercase tracking-wider mb-1">Target Slot</span>
                  <span className="text-lg font-tech-mono text-on-surface font-bold">{selectedAnomaly.slot}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-tech-mono text-on-surface-variant uppercase tracking-wider mb-1">Detected At</span>
                  <span className="text-lg font-tech-mono text-on-surface font-bold">{selectedAnomaly.time} <span className="text-sm opacity-50 font-normal">WIB</span></span>
                </div>
              </div>
              
              {/* Visualisasi radar posisi anomali */}
              <div className="w-full h-48 bg-surface-container-low rounded-lg border border-surface-container-highest relative overflow-hidden flex items-center justify-center group">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary via-surface to-bg-primary"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-px bg-outline-variant/20 absolute"></div>
                  <div className="w-px h-full bg-outline-variant/20 absolute"></div>
                </div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full border-2 border-alert-anomaly flex items-center justify-center bg-surface shadow-[0_0_15px_rgba(255,69,0,0.5)]">
                    <span className="material-symbols-outlined text-alert-anomaly">directions_car</span>
                  </div>
                  <span className="mt-2 text-xs font-tech-mono text-alert-anomaly bg-alert-anomaly/10 px-2 py-1 rounded backdrop-blur-sm border border-alert-anomaly/20">OCR: {selectedAnomaly.plate}</span>
                </div>
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-surface/80 px-2 py-1 rounded backdrop-blur text-[10px] font-tech-mono text-on-surface-variant border border-outline-variant/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-eco-success"></span> Cam {selectedAnomaly.slot} - Live
                </div>
              </div>
              
              {/* Pilihan jenis anomali */}
              <div className="flex flex-col mb-4">
                <label className="block text-sm font-bold text-on-surface mb-2">{t('anomaly.dispatchType','Jenis Anomali')}</label>
                <select 
                  className="w-full bg-surface-container border border-outline-variant rounded p-2 text-on-surface focus:outline-none focus:border-primary"
                  value={jenisAnomali}
                  onChange={(e) => setJenisAnomali(e.target.value)}
                >
                  <option value="Salah Parkir">Salah Parkir</option>
                  <option value="Benda Asing">Benda Asing</option>
                  <option value="Keberadaan Manusia">Keberadaan Manusia</option>
                </select>
              </div>

              {/* Kolom catatan tambahan petugas lapangan */}
              <div className="flex flex-col">
                <label className="block text-sm font-bold text-on-surface mb-2">{t('anomaly.dispatchNote','Lain-lain:')}</label>
                <textarea 
                  rows="3"
                  className="w-full bg-surface-container border border-outline-variant rounded p-2 text-on-surface focus:outline-none focus:border-primary resize-none placeholder:text-on-surface-variant/50"
                  placeholder={t('anomaly.dispatchPlaceholder','Detail kasus...')}
                  value={pesanLain}
                  onChange={(e) => setPesanLain(e.target.value)}
                ></textarea>
              </div>
            </div>
            
            {/* Bagian footer modal berisi tombol batal dan kirim dispatch */}
            <div className="px-6 py-4 bg-surface-container-low border-t border-surface-container-highest flex justify-end gap-3">
              <button 
                onClick={() => setSelectedAnomaly(null)}
                className="px-6 py-2.5 rounded-DEFAULT font-bold text-on-surface-variant border border-outline-variant/50 hover:bg-surface-bright hover:text-on-surface transition-colors"
              >
                {t('anomaly.cancel','Batal')}
              </button>
              <button 
                onClick={() => handleAction(selectedAnomaly.id, 'acknowledge')}
                className="px-6 py-2.5 rounded-DEFAULT font-bold text-surface bg-eco-success hover:bg-eco-success/90 transition-colors shadow-[0_0_10px_rgba(46,139,87,0.4)] flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">campaign</span> {t('anomaly.dispatchBtn','Kirim Dispatch')}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
