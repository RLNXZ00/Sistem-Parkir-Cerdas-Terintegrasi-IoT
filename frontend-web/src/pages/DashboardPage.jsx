import { useState, useEffect, useCallback } from 'react';
import AppLayout from '../components/AppLayout';
import { useLanguage } from '../context/LanguageContext';

const API_BASE = 'http://localhost:8081';

const SLOT_STYLES = {
  TERISI:    'bg-eco-success/20 border border-eco-success text-eco-success',
  DIPESAN:   'bg-warning-reserved/20 border border-warning-reserved text-warning-reserved',
  KOSONG:    'border border-outline border-dashed text-outline',
  ANOMALI:   'bg-alert-anomaly/20 border-2 border-alert-anomaly text-alert-anomaly pulse-anomaly cursor-pointer hover:bg-alert-anomaly/30 group relative',
};

// Kunci sessionStorage untuk status peta (tab jenis + lantai terakhir per jenis)
const KUNCI_STATUS_PETA = 'spct_peta_slot';

// Default setelah login: Mobil, Lantai 1 untuk kedua jenis
function bacaStatusPeta() {
  const bawaan = { jenis: 'MOBIL', lantai: { MOBIL: 1, MOTOR: 1 } };
  try {
    const tersimpan = JSON.parse(sessionStorage.getItem(KUNCI_STATUS_PETA) || 'null');
    if (!tersimpan) return bawaan;
    return {
      jenis: tersimpan.jenis === 'MOTOR' ? 'MOTOR' : 'MOBIL',
      lantai: { ...bawaan.lantai, ...(tersimpan.lantai || {}) },
    };
  } catch {
    return bawaan;
  }
}

export default function DashboardPage() {
  const { t } = useLanguage();
  const [slots, setSlots]           = useState([]);
  const [kameraList, setKameraList] = useState([]);
  const [sensorList, setSensorList] = useState([]);
  const [logs, setLogs]             = useState([]);
  const [isLoading, setIsLoading]   = useState(true);
  // Status peta disimpan di sessionStorage (bertahan saat pindah halaman, di-reset saat login).
  // Lantai diingat PER jenis kendaraan: mis. Mobil di Lantai 3, Motor di Lantai 2.
  const [jenisAktif, setJenisAktif] = useState(() => bacaStatusPeta().jenis);
  const [lantaiPerJenis, setLantaiPerJenis] = useState(() => bacaStatusPeta().lantai);
  const lantaiAktif = lantaiPerJenis[jenisAktif] || 1;
  const setLantaiUntukJenis = (lt) => setLantaiPerJenis(prev => ({ ...prev, [jenisAktif]: lt }));

  useEffect(() => {
    sessionStorage.setItem(KUNCI_STATUS_PETA, JSON.stringify({ jenis: jenisAktif, lantai: lantaiPerJenis }));
  }, [jenisAktif, lantaiPerJenis]);

  // ── Fetch semua data dari API ──────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    try {
      const [slotsRes, kameraRes, sensorRes, logsRes] = await Promise.all([
        fetch(`${API_BASE}/api/monitoring/slots`, { cache: 'no-store' }),
        fetch(`${API_BASE}/api/hardware/kamera`, { cache: 'no-store' }),
        fetch(`${API_BASE}/api/hardware/sensor`, { cache: 'no-store' }),
        fetch(`${API_BASE}/api/monitoring/log-iot`, { cache: 'no-store' }),
      ]);

      if (slotsRes.ok)  setSlots(await slotsRes.json());
      if (kameraRes.ok) setKameraList(await kameraRes.json());
      if (sensorRes.ok) setSensorList(await sensorRes.json());
      if (logsRes.ok)   setLogs(await logsRes.json());
    } catch {
      // Backend belum siap untuk beberapa endpoint - tetap lanjut
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 1500); // Auto-refresh real-time 1.5 detik
    return () => clearInterval(interval);
  }, [fetchAll]);

  // ── Hitung statistik ringkas (case-insensitive untuk toleransi nilai DB) ──
  const totalSlot     = slots.length || 0;
  const slotTerisi    = slots.filter(s => s.statusSlot === 'TERISI').length;
  const slotKosong    = slots.filter(s => s.statusSlot === 'KOSONG').length;
  const slotDipesan   = slots.filter(s => s.statusSlot === 'DIPESAN').length;
  const kameraOnline  = kameraList.filter(k => k.statusKamera?.toUpperCase() === 'ON').length;
  const sensorOnline  = sensorList.filter(s => s.statusSensor?.toUpperCase() === 'ON').length;
  const logBelumDitangani = logs.filter(l => l.statusResolusi === 'BELUM_DITANGANI').length;

  // ── Cari sensor per slot (case-insensitive) ─────────────────────────────
  const getSensorStatus = (idSlot) => {
    const sensor = sensorList.find(s => s.slotDipantau?.idSlot === idSlot);
    return sensor ? sensor.statusSensor?.toUpperCase() : null;
  };

  // ── Helper: apakah status hardware ON? (case-insensitive) ───────────────
  const isOn = (status) => status?.toUpperCase() === 'ON';

  const getSlotStyle = (slot) => {
    if (getSensorStatus(slot.idSlot) === 'OFF') return SLOT_STYLES.ANOMALI;
    
    const hasUnresolvedCriticalLog = logs.some(
      log => log.slotTerkait?.idSlot === slot.idSlot && 
             log.tingkatKeparahan === 'CRITICAL' && 
             log.statusResolusi !== 'SELESAI_DIVALIDASI'
    );
    if (hasUnresolvedCriticalLog) return SLOT_STYLES.ANOMALI;
    
    return SLOT_STYLES[slot.statusSlot] || SLOT_STYLES.KOSONG;
  };

  // ── Filter peta: lantai & jenis kendaraan yang sedang dipilih ────────────
  // Slot lama tanpa jenisKendaraan dianggap MOBIL
  const getJenisSlot = (slot) => (slot.jenisKendaraan || 'MOBIL').toUpperCase();

  // Daftar lantai dibentuk dinamis dari data slot (mendukung Lantai 1, 2, 3, dst.)
  const daftarLantai = [...new Set(slots.map(s => s.lantai || 1))].sort((a, b) => a - b);
  const lantaiTersedia = daftarLantai.length > 0 ? daftarLantai : [1];
  const lantaiTerpilih = lantaiTersedia.includes(lantaiAktif) ? lantaiAktif : lantaiTersedia[0];

  // Hitung slot kosong untuk badge pada tab (per lantai & jenis)
  const hitungKosong = (lantai, jenis) => slots.filter(
    s => (s.lantai || 1) === lantai && getJenisSlot(s) === jenis && s.statusSlot === 'KOSONG'
  ).length;

  // Slot yang ditampilkan, diurutkan berdasarkan ID agar tidak acak posisinya
  const visibleSlots = slots
    .filter(s => (s.lantai || 1) === lantaiTerpilih && getJenisSlot(s) === jenisAktif)
    .sort((a, b) => a.idSlot.localeCompare(b.idSlot, undefined, { numeric: true, sensitivity: 'base' }));

  // Sensor yang ditampilkan mengikuti slot pada tab aktif
  const visibleSlotIds = new Set(visibleSlots.map(s => s.idSlot));
  const visibleSensors = sensorList.filter(s => visibleSlotIds.has(s.slotDipantau?.idSlot));

  const TAB_JENIS = [
    { key: 'MOBIL', label: t('dash.car', 'Mobil'), icon: 'directions_car' },
    { key: 'MOTOR', label: t('dash.motorcycle', 'Motor'), icon: 'two_wheeler' },
  ];

  return (
    <AppLayout breadcrumb={t('topbar.fieldOps', 'Field Operations')}>
      <style>{`
        .pulse-anomaly { animation: pulse-red 2s infinite; }
        @keyframes pulse-red {
          0%   { box-shadow: 0 0 0 0 rgba(255,69,0,0.7); border-color: #FF4500; }
          70%  { box-shadow: 0 0 0 10px rgba(255,69,0,0); border-color: transparent; }
          100% { box-shadow: 0 0 0 0 rgba(255,69,0,0); border-color: #FF4500; }
        }

        /* ── Tab Mobil/Motor bergaya tab browser (Chrome) ── */
        .map-shell {
          --card-bg: #121212;
          --panel-bg: #090f13;
          --tab-hover: rgba(255,255,255,0.08);
          --tab-idle: #87929b;
          --tab-active: #dee3e8;
        }
        html.light-theme .map-shell {
          --card-bg: #ffffff;
          --panel-bg: #f8fafc;
          --tab-hover: rgba(15,23,42,0.07);
          --tab-idle: #64748b;
          --tab-active: #0f172a;
        }
        .slot-tabs {
          display: flex;
          align-items: flex-end;
          padding: 0 20px;
          position: relative;
          z-index: 1;
        }
        .slot-panel { position: relative; z-index: 0; }
        .slot-tab {
          position: relative;
          isolation: isolate;
          display: flex;
          align-items: center;
          gap: 8px;
          height: 40px;
          min-width: 168px;
          padding: 0 18px;
          margin-bottom: -1px;
          border: 0;
          background: transparent;
          color: var(--tab-idle);
          font-size: 13px;
          cursor: pointer;
          border-radius: 12px 12px 0 0;
          transition: color .2s ease;
        }
        /* Hover tab non-aktif: pill lembut seperti Chrome */
        .slot-tab:not(.active)::before {
          content: '';
          position: absolute;
          inset: 6px 2px;
          border-radius: 8px;
          background: transparent;
          transition: background .2s ease;
          z-index: -1;
        }
        .slot-tab:not(.active):hover { color: var(--tab-active); }
        .slot-tab:not(.active):hover::before { background: var(--tab-hover); }
        .slot-tab-count {
          margin-left: auto;
          font-size: 10px;
          opacity: .75;
        }
        /* Tab aktif: menyatu dengan panel peta + lekukan terbalik di kiri-kanan bawah */
        .slot-tab.active {
          background: var(--panel-bg);
          color: var(--tab-active);
          z-index: 2;
        }
        .slot-tab.active::before,
        .slot-tab.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          width: 12px;
          height: 12px;
          background: transparent;
          inset-inline: auto;
          z-index: auto;
        }
        .slot-tab.active::before {
          left: -12px;
          top: auto;
          background: radial-gradient(circle at top left, transparent 12px, var(--panel-bg) 12.5px);
        }
        .slot-tab.active::after {
          right: -12px;
          left: auto;
          top: auto;
          width: 12px;
          opacity: 1;
          background: radial-gradient(circle at top right, transparent 12px, var(--panel-bg) 12.5px);
        }
        .slot-fade-in { animation: slot-fade .25s ease; }
        @keyframes slot-fade {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="p-6 flex flex-col gap-5 bg-background min-h-full">

        {/* ── Stats Strip ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: t('dash.totalSlots', 'Total Slot'),       val: totalSlot,            icon: 'local_parking',     color: 'text-system-info' },
            { label: t('dash.occupied', 'Terisi'),           val: slotTerisi,           icon: 'directions_car',    color: 'text-eco-success' },
            { label: t('dash.vacant', 'Kosong'),           val: slotKosong,           icon: 'check_circle',      color: 'text-text-muted' },
            { label: t('dash.cameraOnline', 'Kamera Online'),    val: `${kameraOnline}/4`,  icon: 'videocam',          color: 'text-[#7ad0ff]' },
            { label: t('dash.sensorOnline', 'Sensor Online'),    val: `${sensorOnline}/${sensorList.length}`, icon: 'sensors', color: 'text-[#ffd700]' },
            { label: t('dash.activeAlerts', 'Alert Aktif'),      val: logBelumDitangani,    icon: 'warning',           color: 'text-warning-reserved' },
          ].map(s => (
            <div key={s.label} className="bg-bg-primary rounded-xl border border-surface-variant p-4 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined text-[18px] ${s.color}`}>{s.icon}</span>
                <span className="text-xs font-mono text-text-muted uppercase tracking-wider">{s.label}</span>
              </div>
              <span className={`text-2xl font-bold ${s.color}`}>{isLoading ? '...' : s.val}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-4">

          {/* ── LEFT: Slot Map (dari slot_parkir API) ─────────────────── */}
          <div className="col-span-12 xl:col-span-8 flex flex-col gap-4">
            <div className="map-shell bg-bg-primary rounded-xl border border-surface-variant p-5 flex flex-col">

              {/* Header: judul di kiri */}
              <div className="flex justify-between items-center gap-4 flex-wrap mb-4">
                <h2 className="font-semibold text-xl text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">map</span>
                  {t('dash.slotMapTitle', 'Peta Slot Parkir — Real-time')}
                </h2>
              </div>

              {/* Tab jenis kendaraan bergaya tab browser (Mobil / Motor) */}
              <div className="slot-tabs" role="tablist" aria-label="Pilih jenis kendaraan">
                {TAB_JENIS.map(t => {
                  const aktif = t.key === jenisAktif;
                  return (
                    <button
                      key={t.key}
                      id={`tab-jenis-${t.key.toLowerCase()}`}
                      type="button"
                      role="tab"
                      aria-selected={aktif}
                      onClick={() => setJenisAktif(t.key)}
                      className={`slot-tab ${aktif ? 'active' : ''}`}
                    >
                      <span className={`material-symbols-outlined text-[18px] ${aktif ? 'text-primary' : ''}`}>{t.icon}</span>
                      <span className="font-semibold">{t.label}</span>
                      <span className="slot-tab-count font-mono">{hitungKosong(lantaiTerpilih, t.key)} kosong</span>
                    </button>
                  );
                })}
              </div>

              {/* Sub-header baris 1: Legenda di kanan atas panel slot */}
              <div className="flex justify-end items-center px-1 pt-2 pb-1">
                <div className="flex gap-4 text-xs font-mono">
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-eco-success rounded-sm"></div>{t('dash.legendOccupied', 'Terisi')}</div>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-warning-reserved rounded-sm"></div>{t('dash.legendReserved', 'Dipesan')}</div>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 border border-dashed border-outline rounded-sm"></div>{t('dash.legendVacant', 'Kosong')}</div>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-alert-anomaly rounded-sm"></div>{t('dash.legendAnomaly', 'Anomali / Periksa')}</div>
                </div>
              </div>

              {/* Sub-header baris 2: Panel pemilih lantai — di bawah legenda, di atas grid slot */}
              <div className="flex justify-start items-center px-1 py-2 border-b border-surface-variant/50 mb-0">
                <div id="panel-lantai" className="floor-panel inline-flex items-center gap-1 p-1 rounded-lg border border-surface-variant bg-surface-container-lowest" role="tablist" aria-label="Pilih lantai">
                  <span className="material-symbols-outlined text-[18px] text-text-muted px-1.5">layers</span>
                  {lantaiTersedia.map(lt => {
                    const aktif = lt === lantaiTerpilih;
                    return (
                      <button
                        key={lt}
                        id={`btn-lantai-${lt}`}
                        type="button"
                        role="tab"
                        aria-selected={aktif}
                        onClick={() => setLantaiUntukJenis(lt)}
                        className={`floor-btn px-3 py-1.5 rounded-md text-xs font-semibold font-mono border transition-all duration-200 ${
                          aktif
                            ? 'bg-primary/15 text-primary border-primary/40 shadow-[0_0_10px_rgba(143,214,255,0.15)]'
                            : 'border-transparent text-text-muted hover:text-on-surface hover:bg-surface-variant/40'
                        }`}
                      >
                        {t('dash.floor', 'Lantai')} {lt}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="slot-panel bg-surface-container-lowest rounded-lg border border-surface-variant p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-30"></div>

                {isLoading ? (
                  <div className="py-12 text-center text-text-muted font-mono text-xs">
                    <span className="material-symbols-outlined animate-spin text-[32px] mb-2 block">progress_activity</span>
                    Memuat data slot dari server...
                  </div>
                ) : slots.length === 0 ? (
                  <div className="py-12 text-center text-text-muted font-mono text-xs">
                    Tidak ada data slot parkir.
                  </div>
                ) : visibleSlots.length === 0 ? (
                  <div className="py-12 text-center text-text-muted font-mono text-xs">
                    Belum ada slot {jenisAktif.toLowerCase()} di Lantai {lantaiTerpilih}.
                  </div>
                ) : (
                  <div className="relative z-10 flex flex-col gap-4" key={`${lantaiTerpilih}-${jenisAktif}`}>
                    <div className="slot-fade-in">
                      <div className="text-xs font-mono text-outline-variant text-center border-y border-surface-variant py-1 mb-3 uppercase tracking-widest">
                        Lantai {lantaiTerpilih} — {jenisAktif}
                      </div>
                      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.max(1, Math.min(visibleSlots.length, 8))}, minmax(0, 1fr))` }}>
                        {visibleSlots.map(slot => {
                          const styleClass = getSlotStyle(slot);
                          const isAnomali = styleClass === SLOT_STYLES.ANOMALI;
                          return (
                            <div
                              key={slot.idSlot}
                              title={`${slot.idSlot} — ${slot.statusSlot}${slot.kendaraanAktif ? ` | ${slot.kendaraanAktif.platNomor}` : ''}`}
                              className={`group h-10 rounded flex items-center justify-center font-mono text-xs relative ${styleClass}`}
                            >
                              {slot.idSlot}
                              {isAnomali && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-surface-container-high border border-alert-anomaly p-3 rounded shadow-lg hidden group-hover:block z-50 text-left">
                                  <p className="text-xs text-alert-anomaly font-bold mb-1">ANOMALI SLOT</p>
                                  <p className="text-xs text-on-surface-variant font-mono">Slot: {slot.idSlot}</p>
                                  {slot.kendaraanAktif && (
                                    <p className="text-xs text-on-surface-variant font-mono">Plat: {slot.kendaraanAktif.platNomor}</p>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Hardware Status: Kamera & Sensor ─────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Kamera ANPR */}
              <div className="bg-bg-primary rounded-xl border border-surface-variant p-4">
                <h3 className="font-semibold text-sm text-on-surface flex items-center gap-2 mb-3 border-b border-surface-variant pb-2">
                  <span className="material-symbols-outlined text-[#7ad0ff] text-[18px]">videocam</span>
                  Status Kamera ANPR (4 Unit)
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {kameraList.map(k => {
                    const kOn = isOn(k.statusKamera);
                    return (
                      <div
                        key={k.idKamera}
                        className={`flex items-center justify-between rounded-lg px-3 py-2 border text-xs font-mono transition-all duration-500 ${
                          kOn
                            ? 'bg-eco-success/10 border-eco-success/30'
                            : 'bg-red-950/30 border-red-600/50 shadow-[inset_0_0_8px_rgba(239,68,68,0.15)]'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${kOn ? 'bg-eco-success animate-pulse' : 'bg-red-500'}`} />
                          <span className={kOn ? 'text-eco-success' : 'text-red-400'}>{k.idKamera}</span>
                        </div>
                        <span className={`font-bold text-[10px] px-1.5 py-0.5 rounded border ${
                          kOn
                            ? 'text-eco-success border-eco-success/40 bg-eco-success/10'
                            : 'text-red-400 border-red-600/50 bg-red-950/40'
                        }`}>
                          {kOn ? 'ON' : 'OFF'}
                        </span>
                      </div>
                    );
                  })}
                  {kameraList.length === 0 && !isLoading && (
                    <p className="col-span-2 text-xs text-text-muted text-center font-mono py-4">Memuat data kamera...</p>
                  )}
                </div>
              </div>

              {/* Sensor IoT */}
              <div className="bg-bg-primary rounded-xl border border-surface-variant p-4">
                <h3 className="font-semibold text-sm text-on-surface flex items-center gap-2 mb-3 border-b border-surface-variant pb-2">
                  <span className="material-symbols-outlined text-[#ffd700] text-[18px]">sensors</span>
                  {t('dash.sensorIotStatus', 'Status Sensor IoT')} — {jenisAktif === 'MOTOR' ? `B${lantaiTerpilih}` : `${t('dash.floor','Lantai')} ${lantaiTerpilih}`} · {jenisAktif === 'MOBIL' ? t('dash.car','Mobil') : t('dash.motorcycle','Motor')}
                </h3>
                <div className="flex flex-wrap gap-1.5 w-full">
                  {visibleSensors.map(s => {
                    const sOn = isOn(s.statusSensor);
                    return (
                      <span
                        key={s.idSensor}
                        title={`${s.idSensor}: ${sOn ? 'ON' : 'OFF'}`}
                        className={`text-[10px] font-mono px-2 py-1 rounded border transition-all duration-500 ${
                          sOn
                            ? 'bg-eco-success/10 border-eco-success/30 text-eco-success'
                            : 'bg-red-950/30 border-red-600/60 text-red-400 shadow-[0_0_6px_rgba(239,68,68,0.3)]'
                        }`}
                      >
                        {s.idSensor.replace('SNS-', '')}
                      </span>
                    );
                  })}
                  {sensorList.length === 0 && !isLoading && (
                    <p className="text-xs text-text-muted text-center font-mono py-4 w-full">Memuat data sensor...</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Alerts dari log_operasional_iot + Live Gate Monitor ── */}
          <div className="col-span-12 xl:col-span-4 flex flex-col gap-4">

            {/* Active Alerts dari log_operasional_iot */}
            <div className="bg-bg-primary rounded-xl border border-surface-variant p-5 flex flex-col flex-1">
              <div className="flex justify-between items-center mb-4 border-b border-surface-variant pb-3">
                <h2 className="font-semibold text-lg text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-warning-reserved">warning</span>
                  Active Alerts
                </h2>
                <span className="bg-warning-reserved/20 text-warning-reserved border border-warning-reserved/50 px-2 py-0.5 rounded text-xs font-bold">
                  {logBelumDitangani} Alerts
                </span>
              </div>
              <div className="flex flex-col gap-3 overflow-y-auto pr-1 max-h-72">
                {isLoading ? (
                  <p className="text-xs text-text-muted font-mono text-center py-6">Memuat log...</p>
                ) : logs.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="material-symbols-outlined text-[40px] text-eco-success opacity-50 block mb-2">check_circle</span>
                    <p className="text-xs text-text-muted font-mono">Tidak ada anomali aktif.</p>
                  </div>
                ) : (
                  logs.slice(0, 10).map(log => {
                    const resolved = log.statusResolusi === 'SELESAI_DIVALIDASI';
                    return (
                      <div
                        key={log.idLog}
                        className={`border-l-4 p-3 rounded shadow-sm transition-colors ${
                          resolved
                            ? 'bg-surface-container border-outline-variant opacity-60'
                            : log.tingkatKeparahan === 'CRITICAL' ? 'bg-surface-container border-alert-anomaly' : 'bg-surface-container border-warning-reserved'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className={`font-mono text-sm font-bold ${resolved ? 'text-on-surface-variant line-through' : (log.tingkatKeparahan === 'CRITICAL' ? 'text-alert-anomaly' : 'text-warning-reserved')}`}>
                            {log.slotTerkait?.idSlot || '-'} — {log.jenisKejadian}
                          </span>
                          <span className="text-xs text-on-surface-variant font-mono">
                            {new Date(log.waktuKejadian).toLocaleTimeString('id-ID')}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface">{log.catatanDetail}</p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className={`inline-block text-[10px] font-mono px-2 py-0.5 rounded border ${log.tingkatKeparahan === 'CRITICAL' ? 'text-red-400 border-red-700/40' : log.tingkatKeparahan === 'WARNING' ? 'text-[#ffd700] border-yellow-700/40' : 'text-[#5d8099] border-outline-variant'}`}>
                            {log.tingkatKeparahan}
                          </span>
                          {(!resolved && log.tingkatKeparahan !== 'INFO') && (
                            <button
                              onClick={() => window.location.href = '/anomaly-logs'}
                              className="px-3 py-1 bg-primary text-on-primary text-xs font-semibold rounded hover:bg-primary/90 transition-colors"
                            >
                              Tangani
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Live Gate Monitor — 4 kamera mini */}
            <div className="bg-bg-primary rounded-xl border border-surface-variant p-5 flex flex-col">
              <h2 className="font-semibold text-lg text-on-surface flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary">videocam</span>
                Live Gate Monitor
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {kameraList.length > 0 ? kameraList.map(cam => {
                  const camOn = isOn(cam.statusKamera);
                  return (
                  <div key={cam.idKamera} className={`relative bg-surface-container-lowest rounded overflow-hidden border aspect-video flex flex-col group transition-all duration-500 ${
                    camOn ? 'border-surface-variant' : 'border-red-700/50 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                  }`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1a2830] via-[#0e1418] to-[#1a1f24] flex items-center justify-center">
                      {!camOn
                        ? <span className="material-symbols-outlined text-[40px] text-red-800 opacity-50">videocam_off</span>
                        : <span className="material-symbols-outlined text-[40px] text-surface-variant opacity-30 group-hover:opacity-50 transition-opacity">local_parking</span>
                      }
                    </div>
                    {/* Overlay merah saat OFF */}
                    {!camOn && (
                      <div className="absolute inset-0 bg-red-950/20 pointer-events-none z-0" />
                    )}
                    {/* HUD Top */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
                      <div className={`w-1.5 h-1.5 rounded-full ${camOn ? 'bg-eco-success animate-pulse' : 'bg-red-500 animate-pulse'}`}></div>
                      <span className={`font-mono text-[9px] bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm border ${
                        camOn ? 'text-white border-outline-variant/30' : 'text-red-300 border-red-700/40'
                      }`}>
                        {cam.idKamera}
                      </span>
                    </div>
                    {/* HUD Bottom */}
                    <div className={`absolute bottom-0 left-0 right-0 backdrop-blur-md p-2 border-t flex justify-between items-center z-10 ${
                      camOn ? 'bg-black/80 border-primary/30' : 'bg-red-950/80 border-red-700/50'
                    }`}>
                      <div className="font-mono">
                        <span className={`text-[9px] block leading-none mb-0.5 ${camOn ? 'text-outline' : 'text-red-400'}`}>
                          {cam.posisiGerbang} — {cam.tipeKendaraan}
                        </span>
                      </div>
                      <span className={`text-[9px] font-bold border px-1.5 py-0.5 rounded leading-none ${
                        camOn
                          ? 'text-eco-success border-eco-success bg-eco-success/10'
                          : 'text-red-300 border-red-600/60 bg-red-900/40'
                      }`}>
                        {camOn ? 'ON' : 'OFF'}
                      </span>
                    </div>
                  </div>
                  );
                }) : (
                  // Fallback 4 card dummy saat loading
                  ['Entry-Mobil', 'Entry-Motor', 'Exit-Mobil', 'Exit-Motor'].map(name => (
                    <div key={name} className="relative bg-surface-container-lowest rounded overflow-hidden border border-surface-variant aspect-video flex items-center justify-center">
                      <span className="text-[9px] font-mono text-text-muted">{name}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
