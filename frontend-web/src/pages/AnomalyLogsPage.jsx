import { useState } from 'react';
import AppLayout from '../components/AppLayout';

const INITIAL_ANOMALIES = [
  { id: 1, slot: 'B-02', type: 'SALAH PARKIR', severity: 'CRITICAL', time: '10:42:15', desc: 'Kendaraan terdeteksi di slot yang tidak terdaftar. Sensor ultrasonic & YOLO konfirmasi.', plate: 'AB 1234 CD', status: 'BELUM_DITANGANI' },
  { id: 2, slot: 'C-05', type: 'OBSTRUKSI SENSOR', severity: 'WARNING', time: '10:15:02', desc: 'Benda non-kendaraan (kemungkinan troli/barang) memicu sensor ultrasonik secara palsu.', plate: '-', status: 'BELUM_DITANGANI' },
  { id: 3, slot: 'A-07', type: 'SALAH PARKIR', severity: 'CRITICAL', time: '09:55:44', desc: 'Plat nomor tidak dikenali di sistem. Kendaraan tidak terdaftar.', plate: 'UNKNOWN', status: 'BELUM_DITANGANI' },
  { id: 4, slot: 'Gate N1', type: 'OCR MISMATCH', severity: 'WARNING', time: '09:12:30', desc: 'Confidence OCR di bawah threshold 70%. Perlu verifikasi manual.', plate: 'B 8877 XY', status: 'SELESAI_DIVALIDASI' },
  { id: 5, slot: 'B-09', type: 'SENSOR TIMEOUT', severity: 'WARNING', time: '08:45:00', desc: 'Sensor slot B-09 tidak mengirim sinyal selama >5 menit.', plate: '-', status: 'SELESAI_DIVALIDASI' },
];

const SEVERITY_CONFIG = {
  CRITICAL: { cls: 'bg-alert-anomaly/10 border-l-4 border-alert-anomaly', badge: 'bg-error-container text-on-error-container', dot: 'bg-alert-anomaly animate-pulse', icon: 'dangerous' },
  WARNING: { cls: 'bg-warning-reserved/5 border-l-4 border-warning-reserved', badge: 'bg-warning-reserved/20 text-warning-reserved', dot: 'bg-warning-reserved', icon: 'warning' },
  INFO: { cls: 'bg-system-info/5 border-l-4 border-system-info', badge: 'bg-system-info/20 text-system-info', dot: 'bg-system-info', icon: 'info' },
};

export default function AnomalyLogsPage() {
  const [anomalies, setAnomalies] = useState(INITIAL_ANOMALIES);
  const [filter, setFilter] = useState('ALL');

  const handleAction = (id, action) => {
    setAnomalies(prev => prev.map(a =>
      a.id === id ? { ...a, status: action === 'acknowledge' ? 'SELESAI_DIVALIDASI' : 'SELESAI_DIVALIDASI' } : a
    ));
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
            const resolved = anomaly.status === 'SELESAI_DIVALIDASI';
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
                        onClick={() => handleAction(anomaly.id, 'acknowledge')}
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
    </AppLayout>
  );
}
