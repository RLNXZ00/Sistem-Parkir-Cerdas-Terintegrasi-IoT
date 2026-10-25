// Import hook useState, useEffect, dan useCallback dari pustaka react untuk state dan lifecycle
import { useState, useEffect, useCallback } from 'react';
// Import komponen AppLayout sebagai kerangka halaman aplikasi web
import AppLayout from '../components/AppLayout';
// Import hook useLanguage untuk dukungan internasionalisasi teks
import { useLanguage } from '../context/LanguageContext';

// Mendefinisikan konstanta alamat dasar server backend Spring Boot (port 8081)
const API_BASE = 'http://localhost:8081';

// Pemetaan ID perangkat kamera backend ke label antarmuka yang informatif dan arah gerbang
const KAMERA_LABELS = {
  'PG-IN-MOB':  { label: 'Entry-Mobil (A)', arah: 'MASUK' }, // Kamera gerbang masuk mobil
  'PG-IN-MOT':  { label: 'Entry-Motor (B)', arah: 'MASUK' }, // Kamera gerbang masuk motor
  'PG-OUT-MOB': { label: 'Exit-Mobil',      arah: 'KELUAR' }, // Kamera gerbang keluar mobil
  'PG-OUT-MOT': { label: 'Exit-Motor',      arah: 'KELUAR' }, // Kamera gerbang keluar motor
};

// Objek gaya tampilan visual status deteksi kamera ANPR
const statusStyles = {
  success: { label: 'TERBACA',      cls: 'bg-eco-success/20 text-eco-success border border-eco-success/30',       dot: 'bg-eco-success',    border: 'border-outline-variant' }, // Status plat nomor berhasil dikenali
  anomaly: { label: 'SALDO KURANG', cls: 'bg-alert-anomaly/20 text-alert-anomaly border border-alert-anomaly/30 animate-pulse', dot: 'bg-alert-anomaly', border: 'border-alert-anomaly/50' }, // Status anomali pembayaran gerbang keluar
  idle:    { label: 'IDLE',         cls: 'bg-surface-variant text-on-surface-variant border border-outline-variant', dot: 'bg-outline-variant', border: 'border-outline-variant' }, // Status siaga menunggu kendaraan
  offline: { label: 'OFFLINE',      cls: 'bg-red-950/30 text-red-400 border border-red-700/40',                  dot: 'bg-red-500',        border: 'border-red-700/40' }, // Status kamera terputus
};

// Komponen pembantu CameraCard untuk merender feed visual simulasi per kamera gerbang
function CameraCard({ kamera, deteksiTerbaru }) {
  // Evaluasi boolean apakah perangkat kamera berstatus mati (OFF)
  const isOffline = kamera.statusKamera === 'OFF';
  // Evaluasi boolean apakah deteksi plat terbaru dinyatakan BERHASIL
  const hasDeteksi = deteksiTerbaru && deteksiTerbaru.hasilDeteksi === 'BERHASIL';
  // Evaluasi boolean apakah deteksi plat terbaru dinyatakan GAGAL
  const isAnomaly  = deteksiTerbaru && deteksiTerbaru.hasilDeteksi === 'GAGAL';

  // Inisialisasi kunci gaya tampilan awal dengan nilai 'idle'
  let styleKey = 'idle';
  // Jika kamera offline, gunakan kunci gaya 'offline'
  if (isOffline)  styleKey = 'offline';
  // Jika deteksi sukses terbaca, gunakan kunci gaya 'success'
  else if (hasDeteksi) styleKey = 'success';
  // Jika terjadi anomali deteksi, gunakan kunci gaya 'anomaly'
  else if (isAnomaly)  styleKey = 'anomaly';

  // Mengambil konfigurasi styling sesuai kunci gaya yang aktif
  const style = statusStyles[styleKey];
  // Mengambil informasi label ramah kamera dari KAMERA_LABELS
  const labelInfo = KAMERA_LABELS[kamera.idKamera] || { label: kamera.idKamera };
  // Menentukan teks ID plat kendaraan yang ditampilkan jika deteksi berhasil
  const plateTampil = hasDeteksi ? `ID Kendaraan: ${deteksiTerbaru.idKendaraan}` : null;

  // Mengembalikan elemen JSX kartu visual kamera live OCR
  return (
    // Wadah kartu kamera bernuansa monitor terminal hitam dengan bayangan dalam
    <div className={`relative isolate z-0 bg-black rounded-lg border overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] ${style.border} ${styleKey === 'anomaly' ? 'shadow-[inset_0_0_20px_rgba(255,69,0,0.1)]' : ''}`}>
      {/* Lapisan latar belakang simulasi feed kamera */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a2830] via-[#0e1418] to-[#1a1f24] flex items-center justify-center">
        {isOffline
          ? <span className="material-symbols-outlined text-[80px] text-red-900 opacity-30">videocam_off</span>
          : hasDeteksi
            ? <span className="material-symbols-outlined text-[80px] text-surface-variant opacity-20">local_parking</span>
            : <span className="material-symbols-outlined text-[80px] text-text-muted opacity-10">videocam</span>
        }
      </div>
      {/* Animasi garis pemindai sinar inframerah horizontal saat kamera online */}
      {!isOffline && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
          <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-[#7ad0ff] to-transparent animate-[scan_3s_linear_infinite]" style={{animation: 'scan 3s linear infinite'}}></div>
        </div>
      )}
      {/* Lapisan aksen kemerahan saat terjadi anomali */}
      {styleKey === 'anomaly' && <div className="absolute inset-0 bg-alert-anomaly/10 pointer-events-none"></div>}

      {/* Bagian HUD atas kartu kamera memuat label lokasi dan status aktif */}
      <div className="absolute top-0 left-0 w-full p-3 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent z-[2]">
        <div className="flex items-center gap-2">
          <span className={`material-symbols-outlined text-sm ${isOffline ? 'text-red-500' : hasDeteksi ? 'text-system-info' : 'text-text-muted'}`}>videocam</span>
          <span className={`font-mono text-xs font-bold tracking-widest ${isOffline ? 'text-red-400' : hasDeteksi ? 'text-system-info' : 'text-text-muted'}`}>{labelInfo.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] text-[#5d8099] bg-black/60 px-1.5 py-0.5 rounded border border-outline-variant/20">{kamera.idKamera}</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider backdrop-blur-sm flex items-center gap-1 ${style.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
            {style.label}
          </span>
        </div>
      </div>

      {/* Bagian HUD bawah kartu kamera menampilkan hasil deteksi plat nomor dan tingkat keyakinan (confidence) */}
      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black via-black/80 to-transparent z-[2]">
        {isOffline ? (
          <p className="font-mono text-xs text-red-400 tracking-widest text-center">KAMERA OFFLINE — PERLU MAINTENANCE</p>
        ) : hasDeteksi ? (
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] text-text-muted font-mono uppercase tracking-widest mb-1">Last Detected Plate</p>
              <p className="font-mono text-xl font-bold tracking-widest drop-shadow-lg text-primary">
                {plateTampil}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-text-muted font-mono uppercase tracking-widest mb-1">Confidence</p>
              <p className="font-mono text-sm text-eco-success">
                {deteksiTerbaru.confidenceScore ? `${(deteksiTerbaru.confidenceScore * 100).toFixed(1)}%` : 'N/A'}
              </p>
            </div>
          </div>
        ) : (
          <p className="font-mono text-xs text-text-muted tracking-widest text-center">WAITING FOR VEHICLE...</p>
        )}
      </div>

      {/* Garis bingkai bidikan scanner kamera jika deteksi teridentifikasi */}
      {hasDeteksi && (
        <div className="absolute inset-0 border-[0.5px] border-system-info/20 m-6 rounded pointer-events-none"></div>
      )}
    </div>
  );
}

// Deklarasi fungsi komponen utama GateLivePage untuk monitoring siaran langsung OCR seluruh gerbang
export default function GateLivePage() {
  // Mengambil helper t dan bahasa aktif lang dari context LanguageContext
  const { t, lang } = useLanguage();
  // Inisialisasi state kameraList bertipe array kosong untuk daftar perangkat kamera ANPR
  const [kameraList, setKameraList] = useState([]);
  // Inisialisasi state logDeteksi bertipe array kosong untuk riwayat pencatatan OCR
  const [logDeteksi, setLogDeteksi] = useState([]);
  // Inisialisasi state isLoading bertipe boolean dengan nilai awal true
  const [isLoading, setIsLoading] = useState(true);
  // Inisialisasi state lastRefresh untuk mencatat waktu pembaruan terakhir data
  const [lastRefresh, setLastRefresh] = useState(null);

  // Deklarasi fungsi memoize fetchKamera untuk mengambil data perangkat kamera dari backend
  const fetchKamera = useCallback(async () => {
    try {
      // Mengirimkan permintaan HTTP GET ke endpoint daftar kamera
      const res = await fetch(`${API_BASE}/api/hardware/kamera`);
      // Jika respons berhasil, olah dan urutkan kamera berdasarkan posisi gerbang
      if (res.ok) {
        const data = await res.json();
        // Mengurutkan kamera masuk terlebih dahulu, kemudian kamera keluar
        const sorted = data.sort((a, b) => {
          if (a.posisiGerbang === b.posisiGerbang) return a.idKamera.localeCompare(b.idKamera);
          return a.posisiGerbang === 'MASUK' ? -1 : 1;
        });
        setKameraList(sorted);
      }
    } catch {
      // Menangkap galat jika backend offline
    }
  }, []);

  // Deklarasi fungsi memoize fetchLogDeteksi untuk mengambil rekam jejak deteksi plat nomor
  const fetchLogDeteksi = useCallback(async () => {
    try {
      // Mengirimkan permintaan HTTP GET ke endpoint log deteksi
      const res = await fetch(`${API_BASE}/api/gate/log`);
      // Jika respons sukses, simpan data ke state logDeteksi
      if (res.ok) {
        const data = await res.json();
        setLogDeteksi(data);
      }
    } catch {
      // Menangkap galat jika belum ada rekaman log
    }
  }, []);

  // Deklarasi fungsi agregasi fetchAll untuk memuat kamera dan log deteksi secara paralel
  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchKamera(), fetchLogDeteksi()]);
    setLastRefresh(new Date().toLocaleTimeString('id-ID'));
    setIsLoading(false);
  }, [fetchKamera, fetchLogDeteksi]);

  // Hook useEffect untuk memicu pemanggilan awal dan interval polling setiap 10 detik
  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 10000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  // Fungsi pembantu untuk menemukan data deteksi terbaru dari ID kamera tertentu
  const getDeteksiTerakhir = (idKamera) => {
    const logsKamera = logDeteksi.filter(l => l.kameraAsal?.idKamera === idKamera);
    return logsKamera.length > 0 ? logsKamera[0] : null;
  };

  // Menghitung jumlah kamera berstatus ON (Online)
  const totalOnline  = kameraList.filter(k => k.statusKamera === 'ON').length;
  // Menghitung jumlah kamera berstatus OFF (Offline)
  const totalOffline = kameraList.filter(k => k.statusKamera === 'OFF').length;

  // Mengembalikan elemen antarmuka JSX halaman pemantauan feed kamera gerbang
  return (
    // Membungkus halaman dengan kerangka AppLayout dan judul jejak navigasi
    <AppLayout breadcrumb={t('topbar.gateOps', 'Gate OCR Feed')}>
      {/* Definisi animasi keyframes sinar pemindai kamera */}
      <style>{`
        @keyframes scan {
          0%   { top: -2px; }
          100% { top: 100%; }
        }
      `}</style>
      {/* Wadah isi utama halaman */}
      <div className="p-6 bg-bg-surface flex flex-col gap-6 min-h-full">

        {/* Baris header judul halaman dan tombol refresh */}
        <div className="flex justify-between items-end border-b border-surface-container-highest pb-4">
          <div>
            <h1 className="text-4xl font-bold text-on-surface tracking-tight">{t('gate.title', 'Live OCR Feed')}</h1>
            <p className="text-text-muted font-mono text-sm mt-1">
              GATE_CLUSTER // {totalOnline} {lang === 'en' ? 'ACTIVE CAMERAS' : 'KAMERA AKTIF'} {totalOffline > 0 && `• ${totalOffline} OFFLINE`}
              {lastRefresh && <span className="ml-3 text-[#5d8099]">Last update: {lastRefresh}</span>}
            </p>
          </div>
          <div className="flex gap-2">
            {/* Lencana ringkasan status online dan offline kamera */}
            <div className="flex gap-2 mr-2">
              <span className="flex items-center gap-1.5 text-xs font-mono text-eco-success bg-eco-success/10 border border-eco-success/20 px-3 py-1.5 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-eco-success animate-pulse"></span>
                {totalOnline} Online
              </span>
              {totalOffline > 0 && (
                <span className="flex items-center gap-1.5 text-xs font-mono text-red-400 bg-red-950/30 border border-red-700/40 px-3 py-1.5 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  {totalOffline} Offline
                </span>
              )}
            </div>
            {/* Tombol manual untuk menyegarkan data feed kamera */}
            <button
              onClick={fetchAll}
              disabled={isLoading}
              className="bg-primary-container text-on-primary-container hover:brightness-110 disabled:opacity-50 px-3 py-1.5 rounded text-sm font-mono font-bold transition-all flex items-center gap-1.5"
            >
              <span className={`material-symbols-outlined text-[16px] ${isLoading ? 'animate-spin' : ''}`}>refresh</span>
              REFRESH FEED
            </button>
          </div>
        </div>

        {/* Grid 4 kamera ANPR gerbang masuk dan keluar */}
        {isLoading && kameraList.length === 0 ? (
          <div className="h-[600px] flex items-center justify-center text-text-muted font-mono text-sm">
            <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
            {t('dash.loading','Memuat data kamera dari server...')}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5" style={{ height: '600px' }}>
            {/* Looping untuk merender masing-masing kartu feed kamera */}
            {kameraList.map(kam => (
              <CameraCard
                key={kam.idKamera}
                kamera={kam}
                deteksiTerbaru={getDeteksiTerakhir(kam.idKamera)}
              />
            ))}
          </div>
        )}

        {/* Bagian panel Activity Stream rekam jejak deteksi plat nomor */}
        <div className="bg-surface-container rounded-xl border border-surface-container-highest p-5">
          <div className="flex justify-between items-center border-b border-surface-container-highest pb-3 mb-3">
            <h3 className="font-mono text-sm text-on-surface font-bold tracking-wider">
              Activity Stream — Log Deteksi Plat
            </h3>
            <span className="text-xs text-text-muted font-mono">
              {logDeteksi.length > 0 ? `${logDeteksi.length} RECORDS` : (lang === 'en' ? 'NO DATA YET' : 'BELUM ADA DATA')}
            </span>
          </div>

          {/* Tampilan pesan kosong jika log deteksi belum ada data */}
          {logDeteksi.length === 0 ? (
            <div className="py-8 text-center text-text-muted font-mono text-xs">
              <span className="material-symbols-outlined text-[40px] mb-2 block opacity-30">history</span>
              Belum ada log deteksi plat. Simulasi ALPR akan mengisi tabel ini.
            </div>
          ) : (
            // Daftar baris log deteksi plat nomor
            <div className="flex flex-col gap-1">
              {logDeteksi.slice(0, 20).map((log, i) => {
                const isGagal = log.hasilDeteksi === 'GAGAL';
                const kameraLabel = KAMERA_LABELS[log.kameraAsal?.idKamera]?.label || log.kameraAsal?.idKamera || '-';
                return (
                  <div
                    key={log.idLogDeteksi || i}
                    className={`flex items-center justify-between py-2 border-b border-surface-container-lowest hover:bg-surface-container-high px-2 rounded transition-colors ${isGagal ? 'bg-alert-anomaly/5 border-l-2 border-l-alert-anomaly' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Waktu deteksi jam dan menit */}
                      <span className="font-mono text-xs text-text-muted">
                        {log.waktuDeteksi ? new Date(log.waktuDeteksi).toLocaleTimeString('id-ID') : '-'}
                      </span>
                      {/* Nomor plat kendaraan terdeteksi */}
                      <span className={`px-2 py-0.5 rounded text-xs font-mono border ${isGagal ? 'text-alert-anomaly border-alert-anomaly/30 bg-surface-container-highest' : 'text-primary border-surface-variant bg-surface-container-highest'}`}>
                        {log.kendaraanTerdeteksi?.platNomor || 'TIDAK TERBACA'}
                      </span>
                      {/* Label identitas kamera penangkap */}
                      <span className="text-xs text-on-surface-variant">{kameraLabel}</span>
                      {/* Arah pergerakan kendaraan (MASUK/KELUAR) */}
                      <span className="text-xs text-[#5d8099] font-mono">{log.arah}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Persentase skor keyakinan OCR */}
                      {log.confidenceScore && (
                        <span className="text-xs font-mono text-[#5d8099]">
                          {(log.confidenceScore * 100).toFixed(1)}%
                        </span>
                      )}
                      {/* Status hasil pembacaan plat nomor */}
                      <span className={`text-xs font-mono ${isGagal ? 'text-alert-anomaly' : 'text-eco-success'}`}>
                        {log.hasilDeteksi}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
