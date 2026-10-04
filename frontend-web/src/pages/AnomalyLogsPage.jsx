import { useState, useEffect, useCallback } from 'react';
import AppLayout from '../components/AppLayout';

const API_BASE = 'http://localhost:8081';

const SEVERITY_CONFIG = {
  CRITICAL: { cls: 'bg-alert-anomaly/10 border-l-4 border-alert-anomaly', badge: 'bg-error-container text-on-error-container', dot: 'bg-alert-anomaly animate-pulse', icon: 'dangerous' },
  WARNING: { cls: 'bg-warning-reserved/5 border-l-4 border-warning-reserved', badge: 'bg-warning-reserved/20 text-warning-reserved', dot: 'bg-warning-reserved', icon: 'warning' },
  INFO: { cls: 'bg-system-info/5 border-l-4 border-system-info', badge: 'bg-system-info/20 text-system-info', dot: 'bg-system-info', icon: 'info' },
};

export default function AnomalyLogsPage() {
  const [anomalies, setAnomalies] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form State for Dispatch Modal
  const [jenisAnomali, setJenisAnomali] = useState('Salah Parkir');
  const [pesanLain, setPesanLain] = useState('');

  const fetchAnomalies = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/monitoring/log-iot`);
      if (res.ok) {
        const data = await res.json();
        // Map backend model to frontend structure
        const mapped = data.map(log => ({
          id: log.idLog,
          slot: log.slotTerkait?.idSlot || '-',
          type: log.jenisKejadian,
          severity: log.tingkatKeparahan,
          time: new Date(log.waktuKejadian).toLocaleTimeString('id-ID'),
          desc: log.catatanDetail,
          plate: log.slotTerkait?.kendaraanAktif?.platNomor || 'UNKNOWN',
          status: log.statusResolusi
        }));
        setAnomalies(mapped);
      }
    } catch (e) {
      console.error('Failed to fetch anomalies', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnomalies();
    const interval = setInterval(fetchAnomalies, 5000); // Polling every 5 seconds
    return () => clearInterval(interval);
  }, [fetchAnomalies]);

  const handleAction = async (id, action) => {
    try {
      // You could pass jenisAnomali and pesanLain to backend if the API supported it
      // but for now we just resolve it
      await fetch(`${API_BASE}/api/monitoring/anomali/${id}/selesai`, {
        method: 'PUT'
      });
      fetchAnomalies(); // refresh
      setSelectedAnomaly(null);
    } catch (e) {
      console.error('Failed to resolve anomaly', e);
    }
  };

  const filtered = filter === 'ALL' ? anomalies : anomalies.filter(a => a.status === filter);
  const criticalCount = anomalies.filter(a => a.severity === 'CRITICAL' && a.status === 'BELUM_DITANGANI').length;

  return (
    <AppLayout breadcrumb="Anomaly Logs">
      <div className="p-6 bg-background min-h-full flex flex-col gap-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Anomaly Logs</h1>
            <p className="text-text-muted font-mono text-sm mt-1">IOT_SENSOR_NETWORK // OPERATIONAL CONTROL</p>
          </div>
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <div className="flex items-center gap-2 bg-error-container/20 border border-alert-anomaly/30 px-3 py-2 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-alert-anomaly animate-ping absolute"></div>
                <div className="w-2 h-2 rounded-full bg-alert-anomaly relative"></div>
                <span className="text-alert-anomaly font-mono text-sm font-bold">{criticalCount} Critical Active</span>
              </div>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-surface-variant pb-4">
          {['ALL', 'BELUM_DITANGANI', 'SELESAI_DIVALIDASI'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-mono text-sm font-semibold transition-colors ${
                filter === f
                  ? 'bg-primary-container text-on-primary-container'
                  : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'
              }`}
            >
              {f === 'ALL' ? 'Semua Log' : f === 'BELUM_DITANGANI' ? 'Belum Ditangani' : 'Selesai Divalidasi'}
            </button>
          ))}
        </div>

        {/* Anomaly List */}
        <div className="flex flex-col gap-3">
          {filtered.map(anomaly => {
            const cfg = SEVERITY_CONFIG[anomaly.severity] || SEVERITY_CONFIG.WARNING;
            const resolved = anomaly.status === 'SELESAI_DIVALIDASI' || anomaly.severity === 'INFO';
            return (
              <div key={anomaly.id} className={`rounded-xl p-5 transition-all ${cfg.cls} ${resolved ? 'opacity-60' : 'hover:brightness-110'}`}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    {/* Severity Dot */}
                    <div className="mt-1 flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full ${cfg.dot}`}></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${cfg.badge}`}>{anomaly.severity}</span>
                        <span className="text-on-surface font-bold font-mono">SLOT {anomaly.slot}</span>
                        <span className="text-on-surface-variant font-mono text-sm">— {anomaly.type}</span>
                      </div>
                      <p className="text-sm text-on-surface mb-2">{anomaly.desc}</p>
                      <div className="flex flex-wrap gap-4 text-xs font-mono text-on-surface-variant">
                        <span>Plat: <span className="text-primary">{anomaly.plate}</span></span>
                        <span>Waktu: {anomaly.time}</span>
                        <span className={`font-semibold ${resolved ? 'text-eco-success' : 'text-warning-reserved'}`}>
                          {resolved ? '✓ Selesai Divalidasi' : '⚠ Belum Ditangani'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {!resolved && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleAction(anomaly.id, 'dismiss')}
                        className="px-3 py-2 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-variant text-xs font-mono transition-colors"
                      >
                        False Positive
                      </button>
                      <button
                        onClick={() => setSelectedAnomaly(anomaly)}
                        className="px-4 py-2 rounded-lg bg-alert-anomaly hover:bg-alert-anomaly/80 text-white text-xs font-bold font-mono transition-colors"
                      >
                        Tangani
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
            <span className="material-symbols-outlined text-6xl mb-3 text-eco-success">check_circle</span>
            <p className="font-mono">Tidak ada anomali ditemukan.</p>
          </div>
        )}
      </div>

      {/* Prototype Overlay Modal: Acknowledge Anomaly */}
      {selectedAnomaly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/80 backdrop-blur-sm p-4">
          <div className="bg-surface w-full max-w-lg rounded-xl border border-surface-container-highest shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-surface-container-highest bg-surface-container-low flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-alert-anomaly"></div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-alert-anomaly/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-alert-anomaly">warning</span>
                </div>
                <h3 className="text-headline-md font-headline-md text-on-surface">Acknowledge Anomaly</h3>
              </div>
              <button 
                onClick={() => setSelectedAnomaly(null)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded hover:bg-surface-bright transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 flex flex-col gap-6">
              {/* Meta Data Row */}
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
              
              {/* Feed Placeholder / Map context */}
              <div className="w-full h-48 bg-surface-container-low rounded-lg border border-surface-container-highest relative overflow-hidden flex items-center justify-center group">
                {/* Faux Map/Feed Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary via-surface to-bg-primary"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-px bg-outline-variant/20 absolute"></div>
                  <div className="w-px h-full bg-outline-variant/20 absolute"></div>
                </div>
                {/* Alert Indicator on Map */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full border-2 border-alert-anomaly flex items-center justify-center bg-surface shadow-[0_0_15px_rgba(255,69,0,0.5)]">
                    <span className="material-symbols-outlined text-alert-anomaly">directions_car</span>
                  </div>
                  <span className="mt-2 text-xs font-tech-mono text-alert-anomaly bg-alert-anomaly/10 px-2 py-1 rounded backdrop-blur-sm border border-alert-anomaly/20">OCR: {selectedAnomaly.plate}</span>
                </div>
                {/* Top Right corner info */}
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-surface/80 px-2 py-1 rounded backdrop-blur text-[10px] font-tech-mono text-on-surface-variant border border-outline-variant/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-eco-success"></span> Cam {selectedAnomaly.slot} - Live
                </div>
              </div>
              
              <div className="flex flex-col mb-4">
                <label className="block text-sm font-bold text-on-surface mb-2">Jenis Anomali</label>
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

              <div className="flex flex-col">
                <label className="block text-sm font-bold text-on-surface mb-2">Lain-lain:</label>
                <textarea 
                  rows="3"
                  className="w-full bg-surface-container border border-outline-variant rounded p-2 text-on-surface focus:outline-none focus:border-primary resize-none placeholder:text-on-surface-variant/50"
                  placeholder="Detail kasus..."
                  value={pesanLain}
                  onChange={(e) => setPesanLain(e.target.value)}
                ></textarea>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 bg-surface-container-low border-t border-surface-container-highest flex justify-end gap-3">
              <button 
                onClick={() => setSelectedAnomaly(null)}
                className="px-6 py-2.5 rounded-DEFAULT font-bold text-on-surface-variant border border-outline-variant/50 hover:bg-surface-bright hover:text-on-surface transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={() => handleAction(selectedAnomaly.id, 'acknowledge')}
                className="px-6 py-2.5 rounded-DEFAULT font-bold text-surface bg-eco-success hover:bg-eco-success/90 transition-colors shadow-[0_0_10px_rgba(46,139,87,0.4)] flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">campaign</span> Kirim Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
