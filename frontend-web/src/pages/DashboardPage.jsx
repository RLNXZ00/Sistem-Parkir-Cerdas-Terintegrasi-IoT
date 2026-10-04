import { useState, useEffect, useCallback } from 'react';
import AppLayout from '../components/AppLayout';

const API_BASE = 'http://localhost:8081';

const SLOT_STYLES = {
  TERISI:    'bg-eco-success/20 border border-eco-success text-eco-success',
  DIPESAN:   'bg-warning-reserved/20 border border-warning-reserved text-warning-reserved',
  KOSONG:    'border border-outline border-dashed text-outline',
  ANOMALI:   'bg-alert-anomaly/20 border-2 border-alert-anomaly text-alert-anomaly pulse-anomaly cursor-pointer hover:bg-alert-anomaly/30 group relative',
};

export default function DashboardPage() {
  const [slots, setSlots]           = useState([]);
  const [kameraList, setKameraList] = useState([]);
  const [sensorList, setSensorList] = useState([]);
  const [logs, setLogs]             = useState([]);
  const [isLoading, setIsLoading]   = useState(true);

  // ── Fetch semua data dari API ──────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    try {
      const [slotsRes, kameraRes, sensorRes, logsRes] = await Promise.all([
        fetch(`${API_BASE}/api/monitoring/slots`),
        fetch(`${API_BASE}/api/hardware/kamera`),
        fetch(`${API_BASE}/api/hardware/sensor`),
        fetch(`${API_BASE}/api/monitoring/log-iot`),
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
    const interval = setInterval(fetchAll, 10000); // Auto-refresh 10 detik
    return () => clearInterval(interval);
  }, [fetchAll]);

  // ── Hitung statistik ringkas ────────────────────────────────────────────
  const totalSlot     = slots.length || 0;
  const slotTerisi    = slots.filter(s => s.statusSlot === 'TERISI').length;
  const slotKosong    = slots.filter(s => s.statusSlot === 'KOSONG').length;
  const slotDipesan   = slots.filter(s => s.statusSlot === 'DIPESAN').length;
  const kameraOnline  = kameraList.filter(k => k.statusKamera === 'ON').length;
  const sensorOnline  = sensorList.filter(s => s.statusSensor === 'ON').length;
  const logBelumDitangani = logs.filter(l => l.statusResolusi === 'BELUM_DITANGANI').length;

  // ── Cari sensor per slot ────────────────────────────────────────────────
  const getSensorStatus = (idSlot) => {
    const sensor = sensorList.find(s => s.slotDipantau?.idSlot === idSlot);
    return sensor ? sensor.statusSensor : null;
  };

  const getSlotStyle = (slot) => {
    if (getSensorStatus(slot.idSlot) === 'OFF') return SLOT_STYLES.ANOMALI;
    return SLOT_STYLES[slot.statusSlot] || SLOT_STYLES.KOSONG;
  };

  // Kelompokkan slot per lantai (semua B1 dalam 1 baris demo)
  const groupedSlots = slots.reduce((acc, slot) => {
    const lantai = `Lantai ${slot.lantai || 1}`;
    if (!acc[lantai]) acc[lantai] = [];
    acc[lantai].push(slot);
    return acc;
  }, {});
  
  // Urutkan slot berdasarkan ID agar tidak acak posisinya
  Object.keys(groupedSlots).forEach(key => {
    groupedSlots[key].sort((a, b) => a.idSlot.localeCompare(b.idSlot, undefined, { numeric: true, sensitivity: 'base' }));
  });

  return (
    <AppLayout breadcrumb="Field Operations">
      <style>{`
        .pulse-anomaly { animation: pulse-red 2s infinite; }
        @keyframes pulse-red {
          0%   { box-shadow: 0 0 0 0 rgba(255,69,0,0.7); border-color: #FF4500; }
          70%  { box-shadow: 0 0 0 10px rgba(255,69,0,0); border-color: transparent; }
          100% { box-shadow: 0 0 0 0 rgba(255,69,0,0); border-color: #FF4500; }
        }
      `}</style>

      <div className="p-6 flex flex-col gap-5 bg-background min-h-full">

        {/* ── Stats Strip ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Total Slot',       val: totalSlot,            icon: 'local_parking',     color: 'text-system-info' },
            { label: 'Terisi',           val: slotTerisi,           icon: 'directions_car',    color: 'text-eco-success' },
            { label: 'Kosong',           val: slotKosong,           icon: 'check_circle',      color: 'text-text-muted' },
            { label: 'Kamera Online',    val: `${kameraOnline}/4`,  icon: 'videocam',          color: 'text-[#7ad0ff]' },
            { label: 'Sensor Online',    val: `${sensorOnline}/${sensorList.length}`, icon: 'sensors', color: 'text-[#ffd700]' },
            { label: 'Alert Aktif',      val: logBelumDitangani,    icon: 'warning',           color: 'text-warning-reserved' },
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
            <div className="bg-bg-primary rounded-xl border border-surface-variant p-5 flex flex-col">

              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-xl text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">map</span>
                  Peta Slot Parkir — Real-time
                </h2>
                <div className="flex gap-4 text-xs font-mono">
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-eco-success rounded-sm"></div>Terisi</div>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-warning-reserved rounded-sm"></div>Dipesan</div>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 border border-dashed border-outline rounded-sm"></div>Kosong</div>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-alert-anomaly rounded-sm"></div>Anomali</div>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-lg border border-surface-variant p-4 relative overflow-hidden">
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
                ) : (
                  <div className="relative z-10 flex flex-col gap-4">
                    {Object.entries(groupedSlots).map(([lantai, slotArr]) => (
                      <div key={lantai}>
                        <div className="text-xs font-mono text-outline-variant text-center border-y border-surface-variant py-1 mb-3 uppercase tracking-widest">
                          {lantai}
                        </div>
                        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(slotArr.length, 8)}, minmax(0, 1fr))` }}>
                          {slotArr.map(slot => {
                            const styleClass = getSlotStyle(slot);
                            const isAnomali = styleClass === SLOT_STYLES.ANOMALI;
                            return (
                              <div
                                key={slot.idSlot}
                                title={`${slot.idSlot} — ${slot.statusSlot}${slot.kendaraanAktif ? ` | ${slot.kendaraanAktif.platNomor}` : ''}`}
                                className={`h-10 rounded flex items-center justify-center font-mono text-xs relative ${styleClass}`}
                              >
                                {slot.idSlot}
                                {isAnomali && (
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-surface-container-high border border-alert-anomaly p-3 rounded shadow-lg hidden group-hover:block z-50 text-left">
                                    <p className="text-xs text-alert-anomaly font-bold mb-1">SENSOR OFFLINE</p>
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
                    ))}
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
                  {kameraList.map(k => (
                    <div key={k.idKamera} className={`flex items-center justify-between rounded-lg px-3 py-2 border text-xs font-mono ${k.statusKamera === 'ON' ? 'bg-eco-success/10 border-eco-success/30' : 'bg-red-950/20 border-red-700/30'}`}>
                      <span className={`${k.statusKamera === 'ON' ? 'text-eco-success' : 'text-red-400'}`}>{k.idKamera}</span>
                      <span className={`font-bold ${k.statusKamera === 'ON' ? 'text-eco-success' : 'text-red-400'}`}>{k.statusKamera}</span>
                    </div>
                  ))}
                  {kameraList.length === 0 && !isLoading && (
                    <p className="col-span-2 text-xs text-text-muted text-center font-mono py-4">Memuat data kamera...</p>
                  )}
                </div>
              </div>

              {/* Sensor IoT */}
              <div className="bg-bg-primary rounded-xl border border-surface-variant p-4">
                <h3 className="font-semibold text-sm text-on-surface flex items-center gap-2 mb-3 border-b border-surface-variant pb-2">
                  <span className="material-symbols-outlined text-[#ffd700] text-[18px]">sensors</span>
                  Status Sensor IoT ({sensorList.length} Unit)
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {sensorList.map(s => (
                    <span
                      key={s.idSensor}
                      title={`${s.idSensor}: ${s.statusSensor}`}
                      className={`text-[10px] font-mono px-2 py-1 rounded border ${s.statusSensor === 'ON' ? 'bg-eco-success/10 border-eco-success/30 text-eco-success' : 'bg-red-950/20 border-red-700/30 text-red-400'}`}
                    >
                      {s.idSensor.replace('SNS-', '')}
                    </span>
                  ))}
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
                {kameraList.length > 0 ? kameraList.map(cam => (
                  <div key={cam.idKamera} className="relative bg-surface-container-lowest rounded overflow-hidden border border-surface-variant aspect-video flex flex-col group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1a2830] via-[#0e1418] to-[#1a1f24] flex items-center justify-center">
                      {cam.statusKamera === 'OFF'
                        ? <span className="material-symbols-outlined text-[40px] text-red-900 opacity-30">videocam_off</span>
                        : <span className="material-symbols-outlined text-[40px] text-surface-variant opacity-30 group-hover:opacity-50 transition-opacity">local_parking</span>
                      }
                    </div>
                    {/* HUD Top */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
                      <div className={`w-1.5 h-1.5 rounded-full ${cam.statusKamera === 'ON' ? 'bg-eco-success animate-pulse' : 'bg-red-500'}`}></div>
                      <span className="font-mono text-[9px] text-white bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm border border-outline-variant/30">
                        {cam.idKamera}
                      </span>
                    </div>
                    {/* HUD Bottom */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md p-2 border-t border-primary/30 flex justify-between items-center z-10">
                      <div className="font-mono">
                        <span className="text-[9px] text-outline block leading-none mb-0.5">
                          {cam.posisiGerbang} — {cam.tipeKendaraan}
                        </span>
                      </div>
                      <span className={`text-[9px] font-bold border px-1.5 py-0.5 rounded leading-none ${
                        cam.statusKamera === 'ON'
                          ? 'text-eco-success border-eco-success bg-eco-success/10'
                          : 'text-red-400 border-red-700/40 bg-red-950/20'
                      }`}>
                        {cam.statusKamera}
                      </span>
                    </div>
                  </div>
                )) : (
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
