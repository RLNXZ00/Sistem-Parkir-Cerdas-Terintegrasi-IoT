import { useState } from 'react';
import AppLayout from '../components/AppLayout';

const REPORT_TYPES = [
  { value: 'finansial', label: 'Laporan Finansial' },
  { value: 'operasional', label: 'Laporan Operasional & Okupansi' },
  { value: 'lingkungan', label: 'Laporan Lingkungan (Eco-Metric)' },
];

const DUMMY_LOGS = [
  { id: 'LOG-001', type: 'ANOMALI_PENYEROBOTAN', slot: 'B-02', time: '10:42:15', severity: 'CRITICAL', status: 'Resolved' },
  { id: 'LOG-002', type: 'SENSOR_OFFLINE_TIMEOUT', slot: 'C-05', time: '10:15:02', severity: 'WARNING', status: 'Open' },
  { id: 'LOG-003', type: 'ANOMALI_PENYEROBOTAN', slot: 'A-07', time: '09:55:44', severity: 'CRITICAL', status: 'Resolved' },
  { id: 'LOG-004', type: 'OCR_MISMATCH', slot: 'Gate N1', time: '09:12:30', severity: 'WARNING', status: 'Resolved' },
  { id: 'LOG-005', type: 'SENSOR_OFFLINE_TIMEOUT', slot: 'B-09', time: '08:45:00', severity: 'WARNING', status: 'Resolved' },
];

export default function ReportsPage() {
  const [reportType, setReportType] = useState('finansial');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-10-01');
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGenerate = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setGenerated(true); }, 1200);
  };

  return (
    <AppLayout breadcrumb="Operational Reports">
      <div className="p-6 bg-background min-h-full flex flex-col gap-6">

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Operational Reports</h1>
          <p className="text-text-muted font-mono text-sm mt-1">MANAJEMEN // DATA HISTORIS & ANALITIK</p>
        </div>

        {/* Report Generator */}
        <div className="bg-bg-surface rounded-xl p-5 border border-outline-variant/30">
          <div className="flex items-center gap-2 mb-5">
            <span className="material-symbols-outlined text-primary">summarize</span>
            <h2 className="text-xl font-semibold text-on-surface">Report Generator</h2>
          </div>
          <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* Report Type */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="font-mono text-xs text-on-surface-variant uppercase tracking-wider">Jenis Laporan</label>
              <div className="relative">
                <select
                  value={reportType}
                  onChange={e => setReportType(e.target.value)}
                  className="w-full appearance-none bg-surface-container border border-outline-variant text-on-surface px-4 py-3 rounded-lg focus:outline-none focus:border-primary font-mono text-sm transition-colors cursor-pointer"
                >
                  {REPORT_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
              </div>
            </div>
            {/* Date Range */}
            <div className="flex flex-col gap-2">
              <label className="font-mono text-xs text-on-surface-variant uppercase tracking-wider">Tanggal Mulai</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant text-on-surface px-4 py-3 rounded-lg focus:outline-none focus:border-primary font-mono text-sm transition-colors"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-mono text-xs text-on-surface-variant uppercase tracking-wider">Tanggal Akhir</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant text-on-surface px-4 py-3 rounded-lg focus:outline-none focus:border-primary font-mono text-sm transition-colors"
              />
            </div>
            {/* Generate Button */}
            <button
              type="submit"
              disabled={loading}
              className="col-span-1 md:col-span-4 w-full py-3 bg-primary-container text-on-primary-container hover:brightness-110 rounded-lg font-bold font-mono text-base flex items-center justify-center gap-2 transition-all disabled:opacity-70"
            >
              {loading ? (
                <><span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>Generating...</>
              ) : (
                <><span className="material-symbols-outlined text-[20px]">play_arrow</span>Generate Report</>
              )}
            </button>
          </form>
        </div>

        {/* Generated Results */}
        {generated && (
          <div className="bg-bg-surface rounded-xl p-5 border border-eco-success/30">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-eco-success">check_circle</span>
                <h2 className="text-xl font-semibold text-on-surface">
                  {REPORT_TYPES.find(r => r.value === reportType)?.label}
                </h2>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-variant text-sm font-mono transition-colors">
                <span className="material-symbols-outlined text-[18px]">download</span>
                Export PDF
              </button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
              {[
                { label: 'Total Pendapatan', value: 'Rp 24.892.500', color: 'text-eco-success' },
                { label: 'Total Kendaraan', value: '1.348', color: 'text-primary' },
                { label: 'Reduksi CO2', value: '124.5 kg', color: 'text-secondary' },
                { label: 'Anomali Tercatat', value: '5', color: 'text-alert-anomaly' },
              ].map(s => (
                <div key={s.label} className="bg-surface-container rounded-lg p-4 border border-outline-variant/20">
                  <p className="text-xs font-mono text-on-surface-variant mb-1">{s.label}</p>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* System Audit Log Table */}
        <div className="bg-bg-surface rounded-xl p-5 border border-outline-variant/30">
          <div className="flex items-center gap-2 mb-5">
            <span className="material-symbols-outlined text-on-surface-variant">history</span>
            <h2 className="text-xl font-semibold text-on-surface">System Audit Log</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-variant text-on-surface-variant font-mono text-xs uppercase tracking-wider">
                  <th className="text-left pb-3 pr-4">ID Log</th>
                  <th className="text-left pb-3 pr-4">Tipe Kejadian</th>
                  <th className="text-left pb-3 pr-4">Slot / Node</th>
                  <th className="text-left pb-3 pr-4">Waktu</th>
                  <th className="text-left pb-3 pr-4">Severity</th>
                  <th className="text-left pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {DUMMY_LOGS.map(log => (
                  <tr key={log.id} className="border-b border-surface-container hover:bg-surface-container-high transition-colors">
                    <td className="py-3 pr-4 font-mono text-on-surface-variant text-xs">{log.id}</td>
                    <td className="py-3 pr-4 font-mono text-primary text-xs">{log.type}</td>
                    <td className="py-3 pr-4 font-mono text-on-surface text-xs font-bold">{log.slot}</td>
                    <td className="py-3 pr-4 font-mono text-on-surface-variant text-xs">{log.time}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${log.severity === 'CRITICAL' ? 'bg-error-container text-on-error-container' : 'bg-warning-reserved/20 text-warning-reserved'}`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${log.status === 'Resolved' ? 'bg-eco-success/20 text-eco-success' : 'bg-alert-anomaly/20 text-alert-anomaly'}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
