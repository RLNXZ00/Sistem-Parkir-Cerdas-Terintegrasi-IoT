import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';

const ZONES = [
  { name: 'Zona Mobil', desc: 'Basement Lantai 1', pct: 85, color: 'eco-success', status: 'Padat', borderColor: 'border-eco-success', gradFrom: 'from-eco-success/10' },
  { name: 'Zona Motor', desc: 'Basement Lantai 1', pct: 42, color: 'warning-reserved', status: 'Normal', borderColor: 'border-warning-reserved', gradFrom: 'from-warning-reserved/10' },
];

export default function DashboardManagementPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8081/api/analitik/dashboard')
      .then(res => res.json())
      .then(res => {
        setData(res);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Gagal mengambil data analitik:", err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <AppLayout breadcrumb="Management Oversight" status="Loading...">
        <div className="flex h-full items-center justify-center">
          <div className="text-xl text-primary font-mono">Memuat Data Analitik...</div>
        </div>
      </AppLayout>
    );
  }

  // Fallback data jika backend gagal
  const safeData = data || {
    pendapatanTotal: 0,
    persentasePendapatan: 0,
    totalKendaraan: 0,
    totalAnomali: 0,
    reduksiCo2Kg: 0,
    persentaseCo2: 0,
    slotKosongSaatIni: 0,
    slotTerisiSaatIni: 0,
    grafikOkupansiPerJam: []
  };

  const KPI_DATA = [
    { label: 'Pendapatan Hari Ini', value: `Rp ${safeData.pendapatanTotal.toLocaleString('id-ID')}`, sub: `${safeData.persentasePendapatan >= 0 ? '+' : ''}${safeData.persentasePendapatan}% vs Kemarin`, icon: 'payments', color: 'text-eco-success', accent: 'eco-success' },
    { label: 'Total Kendaraan', value: safeData.totalKendaraan.toLocaleString('id-ID'), sub: 'History', icon: 'directions_car', color: 'text-primary', accent: 'primary' },
    { label: 'CO2 Dicegah', value: `${safeData.reduksiCo2Kg} kg`, sub: `${safeData.persentaseCo2}% vs Worst Case`, icon: 'eco', color: 'text-secondary', accent: 'eco-success' },
    { label: 'Avg Fee / Kendaraan', value: safeData.totalKendaraan > 0 ? `Rp ${(safeData.pendapatanTotal / safeData.totalKendaraan).toLocaleString('id-ID', {maximumFractionDigits: 0})}` : 'Rp 0', sub: 'Per Kendaraan', icon: 'receipt_long', color: 'text-tertiary', accent: 'tertiary' },
  ];

  return (
    <AppLayout breadcrumb="Management Oversight" status="System Optimal">
      <div className="p-6 bg-background min-h-full flex flex-col gap-6">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-5xl font-bold text-white tracking-tight">Management Oversight</h1>
            <p className="text-on-surface-variant mt-2">Executive summary of financial, operational, and ecological metrics.</p>
          </div>
          <span className="px-4 py-2 rounded-lg bg-surface-container-high border border-outline-variant font-mono text-sm text-on-surface">
            Last updated: Just now
          </span>
        </div>

        {/* KPI Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {KPI_DATA.map(kpi => (
            <div key={kpi.label} className="bg-bg-surface rounded-xl p-5 border border-outline-variant/30 flex flex-col gap-3 group hover:brightness-110 transition-all">
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined ${kpi.color}`}>{kpi.icon}</span>
                <span className="text-on-surface-variant text-sm font-mono">{kpi.label}</span>
              </div>
              <div className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</div>
              <div className="text-xs text-text-muted font-mono">{kpi.sub}</div>
            </div>
          ))}
        </div>

        {/* Revenue Chart + Financial Impact */}
        <div className="grid grid-cols-12 gap-4">
          {/* Revenue Chart */}
          <div className="col-span-12 md:col-span-8 bg-bg-surface rounded-xl p-5 border border-outline-variant/30">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-eco-success">payments</span>
                <h2 className="text-xl font-semibold text-on-surface">Pendapatan Bulanan</h2>
              </div>
              <span className="px-2.5 py-1 bg-eco-success/20 text-eco-success rounded text-xs font-mono font-bold border border-eco-success/30">
                {safeData.persentasePendapatan >= 0 ? '+' : ''}{safeData.persentasePendapatan}% vs Kemarin
              </span>
            </div>
            <div className="text-[48px] font-bold text-eco-success tracking-tighter leading-none mb-4">
              Rp {safeData.pendapatanTotal.toLocaleString('id-ID')}
            </div>
            {/* SVG Chart */}
            <div className="h-32 w-full relative border-b border-l border-outline-variant/50">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="grad-green" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#2E8B57" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#2E8B57" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0,80 L10,75 L20,85 L30,60 L40,65 L50,40 L60,45 L70,20 L80,30 L90,10 L100,5 L100,100 L0,100 Z" fill="url(#grad-green)" />
                <path d="M0,80 L10,75 L20,85 L30,60 L40,65 L50,40 L60,45 L70,20 L80,30 L90,10 L100,5" fill="none" stroke="#2E8B57" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_8px_rgba(46,139,87,0.8)]" />
              </svg>
            </div>
            <div className="flex justify-between mt-2 font-mono text-xs text-text-muted">
              <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>Now</span>
            </div>
          </div>

          {/* Financial Impact */}
          <div className="col-span-12 md:col-span-4 bg-bg-surface rounded-xl p-5 border border-outline-variant/30 flex flex-col gap-5">
            <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-4">
              <span className="material-symbols-outlined text-primary">insert_chart</span>
              <h2 className="text-xl font-semibold text-on-surface">Financial Impact</h2>
            </div>
            <div className="bg-surface-container p-4 rounded-lg border border-outline-variant/20">
              <span className="font-mono text-sm text-on-surface-variant block mb-1">Avg Fee per Vehicle</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl text-primary font-bold">Rp {safeData.totalKendaraan > 0 ? (safeData.pendapatanTotal / safeData.totalKendaraan).toLocaleString('id-ID', {maximumFractionDigits: 0}) : 0}</span>
                <span className="text-eco-success font-mono text-sm flex items-center">
                  <span className="material-symbols-outlined text-[16px]">info</span>Avg
                </span>
              </div>
            </div>
            <div className="bg-surface-container p-4 rounded-lg border border-outline-variant/20">
              <span className="font-mono text-sm text-on-surface-variant block mb-2">Occupancy to Revenue Ratio</span>
              <div className="text-3xl text-tertiary-container font-bold mb-2">8.4</div>
              <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
                <div className="bg-tertiary-container h-full rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* CO2 + System Health */}
        <div className="grid grid-cols-12 gap-4">
          {/* CO2 Donut */}
          <div className="col-span-12 md:col-span-5 bg-bg-surface rounded-xl p-5 border border-outline-variant/30 flex flex-col items-center justify-center">
            <div className="flex items-center gap-2 mb-4 self-start">
              <span className="material-symbols-outlined text-eco-success">eco</span>
              <h2 className="text-lg font-semibold text-on-surface">CO2 Savings</h2>
            </div>
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#30363a" strokeWidth="12" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#2E8B57" strokeWidth="12"
                  strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * safeData.persentaseCo2 / 100)} strokeLinecap="round"
                  className="drop-shadow-[0_0_6px_rgba(46,139,87,0.6)]" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl text-eco-success font-bold tracking-tighter">{safeData.persentaseCo2}%</span>
                <span className="font-mono text-xs text-text-muted uppercase tracking-wider">Tercapai</span>
              </div>
            </div>
            <div className="mt-4 text-center">
              <div className="font-mono text-2xl text-on-surface font-bold">{safeData.reduksiCo2Kg} kg</div>
              <div className="text-sm text-on-surface-variant">Emisi dicegah total</div>
            </div>
          </div>

          {/* System Health */}
          <div className="col-span-12 md:col-span-7 bg-bg-surface rounded-xl p-5 border border-outline-variant/30 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-system-info">memory</span>
                <h2 className="text-xl font-semibold text-on-surface">System Health</h2>
              </div>
              <button className="text-primary font-mono text-sm hover:underline">View Node Logs</button>
            </div>
            <div className="grid grid-cols-2 gap-4 flex-1">
              <div className="bg-surface-container p-4 rounded-lg border border-outline-variant/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">sensors</span>
                  <span className="font-mono text-sm text-on-surface-variant">Active Sensors</span>
                </div>
                <div className="text-4xl text-on-surface font-bold leading-none">1.024</div>
                <div className="text-eco-success font-mono text-sm mt-1">99.8% Up</div>
                <div className="w-full bg-surface-container-highest rounded-full h-1 mt-3">
                  <div className="bg-eco-success h-full rounded-full" style={{ width: '99.8%' }}></div>
                </div>
              </div>
              <div className="bg-surface-container p-4 rounded-lg border border-outline-variant/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">wifi</span>
                  <span className="font-mono text-sm text-on-surface-variant">Network Status</span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <div className="absolute inset-0 rounded-full border-2 border-system-info/30"></div>
                    <div className="absolute inset-0 rounded-full border-t-2 border-system-info animate-spin"></div>
                    <span className="material-symbols-outlined text-system-info text-[24px]">router</span>
                  </div>
                  <div>
                    <span className="font-mono text-lg text-system-info font-bold">Stable</span>
                    <p className="text-xs text-text-muted">Ping: 12ms</p>
                  </div>
                </div>
              </div>
              <div className="col-span-2 bg-error-container/10 p-4 rounded-lg border border-alert-anomaly/30 flex items-center justify-between group cursor-pointer hover:bg-error-container/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-alert-anomaly/20 flex items-center justify-center border border-alert-anomaly/50 relative">
                    <div className="absolute inset-0 rounded-full bg-alert-anomaly animate-ping opacity-20"></div>
                    <span className="material-symbols-outlined text-alert-anomaly">warning</span>
                  </div>
                  <div>
                    <h3 className="font-mono text-base text-on-surface font-bold group-hover:text-alert-anomaly transition-colors">3 Minor Anomalies Detected</h3>
                    <p className="text-xs text-on-surface-variant">Sector B connectivity dip, Slot C-12 OCR mismatch.</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-on-surface transition-colors">chevron_right</span>
              </div>
            </div>
          </div>
        </div>

        {/* Zone Occupancy */}
        <div className="bg-bg-surface rounded-xl p-5 border border-outline-variant/30">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface">map</span>
              <h2 className="text-xl font-semibold text-on-surface">Tingkat Kepadatan per Zona</h2>
            </div>
            <div className="flex gap-4 text-sm">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-eco-success inline-block"></span><span className="text-text-muted font-mono">High</span></span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-warning-reserved inline-block"></span><span className="text-text-muted font-mono">Medium</span></span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-slot-empty inline-block"></span><span className="text-text-muted font-mono">Low</span></span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
            {ZONES.map(sector => (
              <div key={sector.name} className={`bg-surface-container rounded-lg p-4 ${sector.borderColor} border-l-4 hover:bg-surface-bright transition-colors cursor-pointer relative overflow-hidden`}>
                <div className={`absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l ${sector.gradFrom} to-transparent`}></div>
                <h3 className="font-mono text-base text-on-surface font-bold mb-1">{sector.name}</h3>
                <p className="text-xs text-on-surface-variant mb-4">{sector.desc}</p>
                <div className="flex items-end justify-between">
                  <span className="text-3xl text-on-surface font-bold">{sector.pct}%</span>
                  <span className={`font-mono text-xs mb-1 text-${sector.color}`}>{sector.status}</span>
                </div>
                <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-2">
                  <div className={`bg-${sector.color} h-full rounded-full`} style={{ width: `${sector.pct}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
