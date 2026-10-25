import { useState, useEffect, useCallback } from 'react';
import AppLayout from '../components/AppLayout';
import { useLanguage } from '../context/LanguageContext';

const API_BASE = 'http://localhost:8081';

// Map ID kamera dari backend ke label UI yang ramah
const KAMERA_LABELS = {
  'PG-IN-MOB':  { label: 'Entry-Mobil (A)', arah: 'MASUK' },
  'PG-IN-MOT':  { label: 'Entry-Motor (B)', arah: 'MASUK' },
  'PG-OUT-MOB': { label: 'Exit-Mobil',      arah: 'KELUAR' },
  'PG-OUT-MOT': { label: 'Exit-Motor',      arah: 'KELUAR' },
};

const statusStyles = {
  success: { label: 'TERBACA',      cls: 'bg-eco-success/20 text-eco-success border border-eco-success/30',       dot: 'bg-eco-success',    border: 'border-outline-variant' },
  anomaly: { label: 'SALDO KURANG', cls: 'bg-alert-anomaly/20 text-alert-anomaly border border-alert-anomaly/30 animate-pulse', dot: 'bg-alert-anomaly', border: 'border-alert-anomaly/50' },
  idle:    { label: 'IDLE',         cls: 'bg-surface-variant text-on-surface-variant border border-outline-variant', dot: 'bg-outline-variant', border: 'border-outline-variant' },
  offline: { label: 'OFFLINE',      cls: 'bg-red-950/30 text-red-400 border border-red-700/40',                  dot: 'bg-red-500',        border: 'border-red-700/40' },
};

function CameraCard({ kamera, deteksiTerbaru }) {
  // Tentukan status visual kamera
  const isOffline = kamera.statusKamera === 'OFF';
  const hasDeteksi = deteksiTerbaru && deteksiTerbaru.hasilDeteksi === 'BERHASIL';
  const isAnomaly  = deteksiTerbaru && deteksiTerbaru.hasilDeteksi === 'GAGAL';

  let styleKey = 'idle';
  if (isOffline)  styleKey = 'offline';
  else if (hasDeteksi) styleKey = 'success';
  else if (isAnomaly)  styleKey = 'anomaly';

  const style = statusStyles[styleKey];
  const labelInfo = KAMERA_LABELS[kamera.idKamera] || { label: kamera.idKamera };
  const plateTampil = hasDeteksi ? `ID Kendaraan: ${deteksiTerbaru.idKendaraan}` : null;

  return (
    <div className={`relative isolate z-0 bg-black rounded-lg border overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] ${style.border} ${styleKey === 'anomaly' ? 'shadow-[inset_0_0_20px_rgba(255,69,0,0.1)]' : ''}`}>
      {/* Background simulasi kamera */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a2830] via-[#0e1418] to-[#1a1f24] flex items-center justify-center">
        {isOffline
          ? <span className="material-symbols-outlined text-[80px] text-red-900 opacity-30">videocam_off</span>
          : hasDeteksi
            ? <span className="material-symbols-outlined text-[80px] text-surface-variant opacity-20">local_parking</span>
            : <span className="material-symbols-outlined text-[80px] text-text-muted opacity-10">videocam</span>
        }
      </div>
      {/* Scanning lines animasi */}
      {!isOffline && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
          <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-[#7ad0ff] to-transparent animate-[scan_3s_linear_infinite]" style={{animation: 'scan 3s linear infinite'}}></div>
        </div>
      )}
      {styleKey === 'anomaly' && <div className="absolute inset-0 bg-alert-anomaly/10 pointer-events-none"></div>}

      {/* Top HUD */}
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

      {/* Bottom HUD */}
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

      {/* Scan frame HUD */}
      {hasDeteksi && (
        <div className="absolute inset-0 border-[0.5px] border-system-info/20 m-6 rounded pointer-events-none"></div>
      )}
    </div>
  );
}

export default function GateLivePage() {
  const { t, lang } = useLanguage();
  const [kameraList, setKameraList] = useState([]);
  const [logDeteksi, setLogDeteksi] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  // Mengambil data kamera dari tabel kamera_anpr
  const fetchKamera = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/hardware/kamera`);
      if (res.ok) {
        const data = await res.json();
        // Urutkan: masuk dulu, baru keluar
        const sorted = data.sort((a, b) => {
          if (a.posisiGerbang === b.posisiGerbang) return a.idKamera.localeCompare(b.idKamera);
          return a.posisiGerbang === 'MASUK' ? -1 : 1;
        });
        setKameraList(sorted);
      }
    } catch {
      // Backend tidak merespons - tetap tampilkan state kosong
    }
  }, []);

  // Mengambil log deteksi plat terbaru dari tabel log_deteksi_plat
  const fetchLogDeteksi = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/gate/log`);
      if (res.ok) {
        const data = await res.json();
        setLogDeteksi(data);
      }
    } catch {
      // Endpoint belum ada log — tetap tampilkan data kosong
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchKamera(), fetchLogDeteksi()]);
    setLastRefresh(new Date().toLocaleTimeString('id-ID'));
    setIsLoading(false);
  }, [fetchKamera, fetchLogDeteksi]);

  useEffect(() => {
    fetchAll();
    // Auto-refresh tiap 10 detik untuk mensimulasikan live feed
    const interval = setInterval(fetchAll, 10000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  // Cari log deteksi terbaru per kamera untuk ditampilkan di card
  const getDeteksiTerakhir = (idKamera) => {
    const logsKamera = logDeteksi.filter(l => l.kameraAsal?.idKamera === idKamera);
    return logsKamera.length > 0 ? logsKamera[0] : null;
  };

  // Hitung statistik ringkas
  const totalOnline  = kameraList.filter(k => k.statusKamera === 'ON').length;
  const totalOffline = kameraList.filter(k => k.statusKamera === 'OFF').length;

  return (
    <AppLayout breadcrumb={t('topbar.gateOps', 'Gate OCR Feed')}>
      <style>{`
        @keyframes scan {
          0%   { top: -2px; }
          100% { top: 100%; }
        }
      `}</style>
      <div className="p-6 bg-bg-surface flex flex-col gap-6 min-h-full">

        {/* Header */}
        <div className="flex justify-between items-end border-b border-surface-container-highest pb-4">
          <div>
            <h1 className="text-4xl font-bold text-on-surface tracking-tight">{t('gate.title', 'Live OCR Feed')}</h1>
            <p className="text-text-muted font-mono text-sm mt-1">
              GATE_CLUSTER // {totalOnline} {lang === 'en' ? 'ACTIVE CAMERAS' : 'KAMERA AKTIF'} {totalOffline > 0 && `• ${totalOffline} OFFLINE`}
              {lastRefresh && <span className="ml-3 text-[#5d8099]">Last update: {lastRefresh}</span>}
            </p>
          </div>
          <div className="flex gap-2">
            {/* Status badge per kamera */}
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

        {/* Quad Camera Grid — 4 kamera dari tabel kamera_anpr */}
        {isLoading && kameraList.length === 0 ? (
          <div className="h-[600px] flex items-center justify-center text-text-muted font-mono text-sm">
            <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
            {t('dash.loading','Memuat data kamera dari server...')}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5" style={{ height: '600px' }}>
            {kameraList.map(kam => (
              <CameraCard
                key={kam.idKamera}
                kamera={kam}
                deteksiTerbaru={getDeteksiTerakhir(kam.idKamera)}
              />
            ))}
          </div>
        )}

        {/* Activity Stream — dari log_deteksi_plat */}
        <div className="bg-surface-container rounded-xl border border-surface-container-highest p-5">
          <div className="flex justify-between items-center border-b border-surface-container-highest pb-3 mb-3">
            <h3 className="font-mono text-sm text-on-surface font-bold tracking-wider">
              Activity Stream — Log Deteksi Plat
            </h3>
            <span className="text-xs text-text-muted font-mono">
              {logDeteksi.length > 0 ? `${logDeteksi.length} RECORDS` : (lang === 'en' ? 'NO DATA YET' : 'BELUM ADA DATA')}
            </span>
          </div>

          {logDeteksi.length === 0 ? (
            <div className="py-8 text-center text-text-muted font-mono text-xs">
              <span className="material-symbols-outlined text-[40px] mb-2 block opacity-30">history</span>
              Belum ada log deteksi plat. Simulasi ALPR akan mengisi tabel ini.
            </div>
          ) : (
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
                      <span className="font-mono text-xs text-text-muted">
                        {log.waktuDeteksi ? new Date(log.waktuDeteksi).toLocaleTimeString('id-ID') : '-'}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-mono border ${isGagal ? 'text-alert-anomaly border-alert-anomaly/30 bg-surface-container-highest' : 'text-primary border-surface-variant bg-surface-container-highest'}`}>
                        {log.kendaraanTerdeteksi?.platNomor || 'TIDAK TERBACA'}
                      </span>
                      <span className="text-xs text-on-surface-variant">{kameraLabel}</span>
                      <span className="text-xs text-[#5d8099] font-mono">{log.arah}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {log.confidenceScore && (
                        <span className="text-xs font-mono text-[#5d8099]">
                          {(log.confidenceScore * 100).toFixed(1)}%
                        </span>
                      )}
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
