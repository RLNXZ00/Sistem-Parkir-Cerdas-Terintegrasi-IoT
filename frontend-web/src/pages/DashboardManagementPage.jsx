import { useState, useEffect, useRef } from 'react';
import AppLayout from '../components/AppLayout';
import Chart from 'chart.js/auto';

// Daftar 15 Slot Standar Lantai 1
const DEFAULT_SLOTS = [
  'B1-01', 'B1-02', 'B1-03', 'B1-04', 'B1-05', 'B1-06', 'B1-07', 'B1-08',
  'B1-09', 'B1-10', 'B1-11', 'B1-12', 'B1-13', 'B1-14', 'B1-15'
];

export default function DashboardManagementPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [networkPing, setNetworkPing] = useState(null);

  // Modal 1: 10 Log Anomali (Tabel Kronologis)
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [anomaliList, setAnomaliList] = useState([]);
  const [isLoadingAnomali, setIsLoadingAnomali] = useState(false);

  // Modal 2: Visual Node Map (Denah Spasial Lantai 1)
  const [isNodeMapModalOpen, setIsNodeMapModalOpen] = useState(false);
  const [slotsList, setSlotsList] = useState([]);
  const [nodeAnomaliMap, setNodeAnomaliMap] = useState({});
  const [selectedSlotNode, setSelectedSlotNode] = useState(null);
  const [isLoadingNodeMap, setIsLoadingNodeMap] = useState(false);

  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  // Ambil data analitik dan ukur latency ping nyata
  const fetchDashboardData = () => {
    const startTime = performance.now();
    fetch('http://localhost:8081/api/analitik/dashboard')
      .then(res => {
        const ping = Math.round(performance.now() - startTime);
        setNetworkPing(ping);
        return res.json();
      })
      .then(res => {
        setData(res);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Gagal mengambil data analitik:", err);
        setNetworkPing(999);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000); // Polling tiap 10 detik
    return () => clearInterval(interval);
  }, []);

  // Helper untuk mengekstrak ID slot dari objek log
  const extractSlotId = (log) => {
    if (log.slotTerkait && log.slotTerkait.idSlot) return log.slotTerkait.idSlot;
    if (log.catatanDetail) {
      const match = log.catatanDetail.match(/Slot\s+(B1-\d{2})/i);
      if (match) return match[1].toUpperCase();
    }
    return null;
  };

  // Buka Modal 1: Daftar 10 Anomali Terbaru (Klik banner bawah)
  const openAnomaliListModal = () => {
    setIsListModalOpen(true);
    setIsLoadingAnomali(true);
    fetch('http://localhost:8081/api/monitoring/log-iot')
      .then(res => res.json())
      .then(logs => {
        setAnomaliList(logs.slice(0, 10));
        setIsLoadingAnomali(false);
      })
      .catch(err => {
        console.error("Gagal mengambil log anomali:", err);
        setIsLoadingAnomali(false);
      });
  };

  // Buka Modal 2: Visual Node Logs Denah Lantai 1 (Klik "View Node Logs")
  const openNodeMapModal = async () => {
    setIsNodeMapModalOpen(true);
    setIsLoadingNodeMap(true);
    setSelectedSlotNode(null);

    try {
      const [slotsRes, logsRes] = await Promise.all([
        fetch('http://localhost:8081/api/monitoring/slots'),
        fetch('http://localhost:8081/api/monitoring/log-iot')
      ]);

      const slots = slotsRes.ok ? await slotsRes.json() : [];
      const logs = logsRes.ok ? await logsRes.json() : [];

      setSlotsList(slots.length > 0 ? slots : DEFAULT_SLOTS.map(id => ({ idSlot: id })));

      // Ambil 10 log terakhir dan kelompokkan insiden anomali berdasarkan ID slot
      const latest10 = logs.slice(0, 10);
      const anomaliGroup = {};
      let firstErrorSlot = null;

      latest10.forEach(log => {
        const slotId = extractSlotId(log);
        const isAnomaly = log.tingkatKeparahan === 'CRITICAL' || log.jenisKejadian?.includes('ANOMALI');

        if (slotId && isAnomaly) {
          if (!anomaliGroup[slotId]) {
            anomaliGroup[slotId] = [];
            if (!firstErrorSlot) firstErrorSlot = slotId;
          }
          anomaliGroup[slotId].push(log);
        }
      });

      setNodeAnomaliMap(anomaliGroup);
      if (firstErrorSlot) {
        setSelectedSlotNode(firstErrorSlot);
      } else {
        setSelectedSlotNode('B1-01');
      }
    } catch (e) {
      console.error("Gagal memuat denah node log:", e);
    } finally {
      setIsLoadingNodeMap(false);
    }
  };

  // Render Grafik Chart.js Pendapatan Harian (Tgl 1 s.d. Hari Ini)
  useEffect(() => {
    if (!data || !chartRef.current) return;

    const dailyData = data.grafikPendapatanHarian || [];
    if (dailyData.length === 0) return;

    const labels = dailyData.map(item => `Tgl ${item.hari}`);
    const values = dailyData.map(item => item.nominal || 0);

    // Hancurkan chart lama jika ada
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 150);
    gradient.addColorStop(0, 'rgba(46, 139, 87, 0.45)');
    gradient.addColorStop(1, 'rgba(46, 139, 87, 0.0)');

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Pendapatan Harian (Rp)',
          data: values,
          borderColor: '#10b981',
          borderWidth: 2.5,
          backgroundColor: gradient,
          fill: true,
          tension: 0.35,
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#050B14',
          pointHoverRadius: 6,
          pointRadius: 4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0F172A',
            borderColor: '#334155',
            borderWidth: 1,
            titleFont: { family: 'Space Grotesk', size: 12 },
            bodyFont: { family: 'Space Grotesk', size: 13, weight: 'bold' },
            callbacks: {
              label: (context) => `Rp ${Number(context.raw).toLocaleString('id-ID')}`
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: {
              color: '#94A3B8',
              font: { family: 'Space Grotesk', size: 11 }
            }
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: {
              color: '#94A3B8',
              font: { family: 'Space Grotesk', size: 10 },
              callback: (val) => val >= 1000 ? `${val / 1000}k` : val
            }
          }
        }
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [data]);

  if (isLoading) {
    return (
      <AppLayout breadcrumb="Management Oversight" status="Loading...">
        <div className="flex h-full items-center justify-center">
          <div className="text-xl text-primary font-mono animate-pulse">Memuat Data Analitik...</div>
        </div>
      </AppLayout>
    );
  }

  // Fallback data jika backend gagal
  const safeData = data || {
    pendapatanTotal: 0,
    pendapatanHariIni: 0,
    pendapatanBulanan: 0,
    persentasePendapatan: 0,
    totalKendaraan: 0,
    totalAnomali: 0,
    reduksiCo2Kg: 0,
    persentaseCo2: 0,
    slotKosongSaatIni: 0,
    slotTerisiSaatIni: 0,
    totalSensor: 15,
    totalSensorAktif: 15,
    totalTransaksiLunas: 0,
    rataRataTarifTransaksi: 0,
    revenuePerSlot: 0,
    occupancyRateSaatIni: 0,
    totalKendaraanHariIni: 0,
    grafikOkupansiPerJam: [],
    grafikPendapatanHarian: []
  };

  const pendapatanHariIniVal = safeData.pendapatanHariIni ?? safeData.pendapatanTotal ?? 0;
  const pendapatanBulananVal = safeData.pendapatanBulanan ?? safeData.pendapatanTotal ?? 0;

  // Kalkulasi Dinamis Kepadatan Zona Mobil
  const totalSlotMobil = (safeData.slotTerisiSaatIni + safeData.slotKosongSaatIni) || 15;
  const pctMobil = Math.min(100, Math.round((safeData.slotTerisiSaatIni / totalSlotMobil) * 100));
  const statusMobil = pctMobil > 80 ? 'Padat' : (pctMobil >= 50 ? 'Sedang' : 'Normal');
  const colorMobil = pctMobil > 80 ? 'text-alert-anomaly' : (pctMobil >= 50 ? 'text-warning-reserved' : 'text-eco-success');
  const borderColorMobil = pctMobil > 80 ? 'border-alert-anomaly' : (pctMobil >= 50 ? 'border-warning-reserved' : 'border-eco-success');
  const barBgMobil = pctMobil > 80 ? 'bg-alert-anomaly' : (pctMobil >= 50 ? 'bg-warning-reserved' : 'bg-eco-success');

  // Metrik Finansial & Okupansi Riil
  const totalTransaksiLunasVal = safeData.totalTransaksiLunas ?? 0;
  const avgFeeVal = safeData.rataRataTarifTransaksi ?? (totalTransaksiLunasVal > 0 ? Math.round(pendapatanBulananVal / totalTransaksiLunasVal) : 0);
  const revenuePerSlotVal = safeData.revenuePerSlot ?? (totalSlotMobil > 0 ? Math.round(pendapatanBulananVal / totalSlotMobil) : 0);

  const ZONES = [
    { 
      name: 'Zona Mobil', 
      desc: `Basement Lantai 1 (${safeData.slotTerisiSaatIni} dari ${totalSlotMobil} Slot)`, 
      pct: pctMobil, 
      colorClass: colorMobil, 
      status: statusMobil, 
      borderColor: borderColorMobil,
      barBg: barBgMobil
    },
    { 
      name: 'Zona Motor', 
      desc: 'Basement Lantai 1 (Dalam Perencanaan)', 
      pct: 42, 
      colorClass: 'text-warning-reserved', 
      status: 'Normal', 
      borderColor: 'border-warning-reserved',
      barBg: 'bg-warning-reserved'
    },
  ];

  const KPI_DATA = [
    { 
      label: 'Pendapatan Hari Ini', 
      value: `Rp ${Number(pendapatanHariIniVal).toLocaleString('id-ID')}`, 
      sub: `${safeData.persentasePendapatan >= 0 ? '+' : ''}${safeData.persentasePendapatan}% vs Kemarin`, 
      icon: 'payments', 
      color: 'text-eco-success' 
    },
    { 
      label: 'Total Kendaraan', 
      value: safeData.totalKendaraan.toLocaleString('id-ID'), 
      sub: `${safeData.totalKendaraanHariIni || 0} Masuk Hari Ini`, 
      icon: 'directions_car', 
      color: 'text-primary' 
    },
    { 
      label: 'CO2 Dicegah', 
      value: `${safeData.reduksiCo2Kg} kg`, 
      sub: `${safeData.persentaseCo2}% vs Benchmark`, 
      icon: 'eco', 
      color: 'text-secondary' 
    },
    { 
      label: 'Avg Fee / Kendaraan', 
      value: `Rp ${Number(avgFeeVal).toLocaleString('id-ID')}`, 
      sub: `${totalTransaksiLunasVal} Transaksi Lunas Bulan Ini`, 
      icon: 'receipt_long', 
      color: 'text-tertiary' 
    },
  ];

  const sensorAktif = safeData.totalSensorAktif ?? 15;
  const totalSensor = safeData.totalSensor ?? 15;
  const sensorPct = totalSensor > 0 ? Math.round((sensorAktif / totalSensor) * 100) : 100;

  // Render Baris Slot Lantai 1
  const row1Slots = DEFAULT_SLOTS.slice(0, 8); // B1-01 s.d. B1-08 (8 Slot)
  const row2Slots = DEFAULT_SLOTS.slice(8, 15); // B1-09 s.d. B1-15 (7 Slot)

  return (
    <AppLayout breadcrumb="Management Oversight" status="System Optimal">
      <style>{`
        .pulse-anomaly { animation: pulse-red 2s infinite; }
        @keyframes pulse-red {
          0%   { box-shadow: 0 0 0 0 rgba(255,69,0,0.7); border-color: #FF4500; }
          70%  { box-shadow: 0 0 0 10px rgba(255,69,0,0); border-color: transparent; }
          100% { box-shadow: 0 0 0 0 rgba(255,69,0,0); border-color: #FF4500; }
        }
      `}</style>

      <div className="p-6 bg-background min-h-full flex flex-col gap-6">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-5xl font-bold text-white tracking-tight font-['Space_Grotesk']">Management Oversight</h1>
            <p className="text-on-surface-variant mt-2">Ringkasan eksekutif metrik keuangan, operasional, dan reduksi emisi CO2.</p>
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
          <div className="col-span-12 md:col-span-8 bg-bg-surface rounded-xl p-5 border border-outline-variant/30 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-eco-success">payments</span>
                  <h2 className="text-xl font-semibold text-on-surface">Pendapatan Bulanan</h2>
                </div>
                <span className="px-2.5 py-1 bg-eco-success/20 text-eco-success rounded text-xs font-mono font-bold border border-eco-success/30">
                  Bulan Berjalan ({safeData.grafikPendapatanHarian?.length || 1} Hari)
                </span>
              </div>
              <div className="text-[44px] font-bold text-eco-success tracking-tighter leading-none mb-4 font-mono">
                Rp {Number(pendapatanBulananVal).toLocaleString('id-ID')}
              </div>
            </div>

            {/* Real Chart Canvas */}
            <div className="w-full h-44 relative mt-2">
              <canvas ref={chartRef}></canvas>
            </div>
            <div className="text-right text-[11px] text-text-muted font-mono mt-2">
              *Pertumbuhan pendapatan akumulatif harian dari tanggal 1 s.d. hari ini
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
                <span className="text-3xl text-primary font-bold">
                  Rp {Number(avgFeeVal).toLocaleString('id-ID')}
                </span>
                <span className="text-eco-success font-mono text-xs flex items-center gap-1" title="Rata-rata pembayaran per transaksi lunas di bulan berjalan">
                  <span className="material-symbols-outlined text-[16px]">info</span>{totalTransaksiLunasVal} Transaksi Lunas
                </span>
              </div>
            </div>
            <div className="bg-surface-container p-4 rounded-lg border border-outline-variant/20">
              <div className="flex justify-between items-center mb-1">
                <span className="font-mono text-sm text-on-surface-variant">Occupancy & Revenue Yield</span>
                <span className="text-xs font-mono text-tertiary-container font-semibold" title="RevPAS: Pendapatan rata-rata per kapasitas slot">
                  Rp {Number(revenuePerSlotVal).toLocaleString('id-ID')}/slot
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl text-tertiary-container font-bold">
                  {pctMobil}%
                </span>
                <span className="text-text-muted font-mono text-xs">
                  Okupansi Fisik Saat Ini ({safeData.slotTerisiSaatIni}/{totalSlotMobil} Slot)
                </span>
              </div>
              <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${barBgMobil}`} 
                  style={{ width: `${Math.max(pctMobil, 4)}%` }}
                ></div>
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
              <div className="text-sm text-on-surface-variant">Emisi dicegah total berdasarkan sensor IoT</div>
            </div>
          </div>

          {/* System Health */}
          <div className="col-span-12 md:col-span-7 bg-bg-surface rounded-xl p-5 border border-outline-variant/30 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-system-info">memory</span>
                <h2 className="text-xl font-semibold text-on-surface">System Health</h2>
              </div>
              
              {/* TOMBOL VIEW NODE LOGS: MEMBUKA MODAL DENAH SPASIAL LANTAI 1 */}
              <button 
                onClick={openNodeMapModal}
                className="text-primary font-mono text-sm hover:underline cursor-pointer flex items-center gap-1 bg-primary/10 hover:bg-primary/20 px-3 py-1 rounded-lg border border-primary/30 transition-colors"
                title="Buka Denah Spasial Node Sensor & Indikasi Kesalahan Parkir"
              >
                <span className="material-symbols-outlined text-sm">grid_view</span>
                <span>View Node Logs</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 flex-1">
              {/* Active Sensors Real-Time */}
              <div className="bg-surface-container p-4 rounded-lg border border-outline-variant/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">sensors</span>
                  <span className="font-mono text-sm text-on-surface-variant">Active Sensors</span>
                </div>
                <div className="text-4xl text-on-surface font-bold leading-none font-mono">
                  {sensorAktif} <span className="text-sm text-text-muted font-normal font-sans">/ {totalSensor} Unit</span>
                </div>
                <div className="text-eco-success font-mono text-sm mt-1">{sensorPct}% Up</div>
                <div className="w-full bg-surface-container-highest rounded-full h-1 mt-3">
                  <div className="bg-eco-success h-full rounded-full" style={{ width: `${sensorPct}%` }}></div>
                </div>
              </div>

              {/* Real Latency Network Ping */}
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
                    <span className={`font-mono text-lg font-bold ${networkPing && networkPing < 100 ? 'text-system-info' : 'text-warning-reserved'}`}>
                      {networkPing === null ? 'Checking...' : (networkPing < 100 ? 'Stable' : 'Slow')}
                    </span>
                    <p className="text-xs text-text-muted font-mono">
                      Ping: {networkPing !== null ? `${networkPing}ms` : '--'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Anomaly Notification Bar (Klik ikon > untuk melihat modal daftar 10 riwayat teks) */}
              <div 
                onClick={openAnomaliListModal}
                className="col-span-2 bg-error-container/10 p-4 rounded-lg border border-alert-anomaly/30 flex items-center justify-between group cursor-pointer hover:bg-error-container/20 transition-all shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-alert-anomaly/20 flex items-center justify-center border border-alert-anomaly/50 relative">
                    {safeData.totalAnomali > 0 && (
                      <div className="absolute inset-0 rounded-full bg-alert-anomaly animate-ping opacity-20"></div>
                    )}
                    <span className="material-symbols-outlined text-alert-anomaly">warning</span>
                  </div>
                  <div>
                    <h3 className="font-mono text-base text-on-surface font-bold group-hover:text-alert-anomaly transition-colors">
                      {safeData.totalAnomali > 0 
                        ? `${safeData.totalAnomali} Anomali Aktif Membutuhkan Validasi` 
                        : "Sistem Normal — Tidak Ada Anomali Aktif"}
                    </h3>
                    <p className="text-xs text-on-surface-variant">
                      Klik untuk melihat daftar 10 riwayat kronologis anomali & operasional sensor terbaru dari database.
                    </p>
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
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-eco-success inline-block"></span><span className="text-text-muted font-mono">Normal (&lt;50%)</span></span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-warning-reserved inline-block"></span><span className="text-text-muted font-mono">Sedang (50-80%)</span></span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-alert-anomaly inline-block"></span><span className="text-text-muted font-mono">Padat (&gt;80%)</span></span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ZONES.map(sector => (
              <div key={sector.name} className={`bg-surface-container rounded-lg p-4 ${sector.borderColor} border-l-4 hover:bg-surface-bright transition-colors relative overflow-hidden`}>
                <h3 className="font-mono text-base text-on-surface font-bold mb-1">{sector.name}</h3>
                <p className="text-xs text-on-surface-variant mb-4">{sector.desc}</p>
                <div className="flex items-end justify-between">
                  <span className="text-3xl text-on-surface font-bold font-mono">{sector.pct}%</span>
                  <span className={`font-mono text-xs mb-1 ${sector.colorClass}`}>{sector.status}</span>
                </div>
                <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-2">
                  <div className={`${sector.barBg} h-full rounded-full transition-all duration-500`} style={{ width: `${sector.pct}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MODAL 1: DAFTAR 10 LOG ANOMALI TERAKHIR (TABEL KRONOLOGIS) */}
        {/* ========================================================================= */}
        {isListModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-[#0B1526] border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-700/60 bg-[#08101E]">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-alert-anomaly text-2xl">warning</span>
                  <div>
                    <h2 className="text-xl font-bold text-white font-['Space_Grotesk']">10 Log Anomali & Operasional IoT Terakhir</h2>
                    <p className="text-xs text-slate-400">Data riil kronologis langsung dari tabel <code className="text-sky-300">log_operasional_iot</code> database.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsListModalOpen(false)}
                  className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-3">
                {isLoadingAnomali ? (
                  <div className="flex items-center justify-center py-12 text-slate-400 font-mono animate-pulse">
                    Mengambil data log anomali dari server...
                  </div>
                ) : anomaliList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-2">
                    <span className="material-symbols-outlined text-4xl">check_circle</span>
                    <span>Tidak ada catatan anomali di database.</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {anomaliList.map((log) => {
                      const isCritical = log.tingkatKeparahan === 'CRITICAL' || log.jenisKejadian?.includes('ANOMALI');
                      const tanggal = log.waktuKejadian ? new Date(log.waktuKejadian).toLocaleString('id-ID', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit', second: '2-digit'
                      }) : '-';
                      const slotId = extractSlotId(log);

                      return (
                        <div 
                          key={log.idLog} 
                          className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                            isCritical 
                              ? 'bg-red-950/20 border-red-500/40' 
                              : 'bg-slate-900/60 border-slate-700/50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className={`material-symbols-outlined text-xl mt-0.5 ${isCritical ? 'text-red-400' : 'text-sky-400'}`}>
                              {isCritical ? 'report' : 'info'}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-white text-sm">
                                  {slotId ? `Slot ${slotId}` : 'Hardware Node'}
                                </span>
                                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                                  isCritical ? 'bg-red-900/40 text-red-300 border border-red-700/40' : 'bg-slate-800 text-slate-300'
                                }`}>
                                  {log.jenisKejadian}
                                </span>
                              </div>
                              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                                {log.catatanDetail || 'Tidak ada catatan tambahan.'}
                              </p>
                            </div>
                          </div>

                          <div className="flex md:flex-col items-end justify-between md:justify-center gap-1 shrink-0 text-right">
                            <span className="text-[11px] font-mono text-slate-400">
                              {tanggal}
                            </span>
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                              log.statusResolusi === 'SELESAI_DIVALIDASI' 
                                ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-700/40' 
                                : 'bg-amber-900/30 text-amber-300 border border-amber-700/40'
                            }`}>
                              {log.statusResolusi || 'BELUM_DITANGANI'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-700/60 bg-[#08101E] flex justify-end">
                <button
                  onClick={() => setIsListModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 2: DENAH SPASIAL NODE LOGS LANTAI 1 (PERSIS SEPERTI GAMBAR 2) */}
        {/* ========================================================================= */}
        {isNodeMapModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-[#0B1526] border border-slate-700/80 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-700/60 bg-[#08101E]">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-sky-950/80 border border-sky-500/40 text-sky-400 flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">grid_view</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                      Peta Denah Spasial Node Sensor & Kesalahan Parkir
                    </h2>
                    <p className="text-xs text-slate-400">
                      Visualisasi indikasi slot yang teridentifikasi mengalami anomali atau salah parkir dari 10 log IoT terbaru.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Legend Mini */}
                  <div className="hidden md:flex items-center gap-3 text-xs font-mono">
                    <div className="flex items-center gap-1.5 text-red-400">
                      <div className="w-3 h-3 bg-red-600/30 border border-red-500 rounded-sm animate-pulse"></div>
                      <span>Anomali Terindikasi</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <div className="w-3 h-3 border border-dashed border-slate-600 rounded-sm"></div>
                      <span>Node Normal</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setIsNodeMapModalOpen(false)}
                    className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              </div>

              {/* Modal Body: Denah Lantai 1 */}
              <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
                
                {isLoadingNodeMap ? (
                  <div className="flex items-center justify-center py-20 text-slate-400 font-mono animate-pulse">
                    Memuat pemetaan denah node sensor...
                  </div>
                ) : (
                  <>
                    {/* DENAH GRID SESUAI GAMBAR 2 (LANTAI 1) */}
                    <div className="bg-[#050B14] rounded-xl border border-slate-800 p-6 relative overflow-hidden shadow-inner">
                      
                      {/* Grid background styling */}
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-40"></div>

                      {/* Header Lantai 1 */}
                      <div className="text-xs font-mono text-slate-400 text-center border-y border-slate-800 py-1.5 mb-6 uppercase tracking-widest relative z-10 font-semibold">
                        LANTAI 1
                      </div>

                      {/* Baris 1: 8 Slot (B1-01 s.d. B1-08) */}
                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 relative z-10 mb-3">
                        {row1Slots.map(slotId => {
                          const hasAnomaly = !!nodeAnomaliMap[slotId];
                          const isSelected = selectedSlotNode === slotId;
                          const anomalyCount = hasAnomaly ? nodeAnomaliMap[slotId].length : 0;

                          return (
                            <div
                              key={slotId}
                              onClick={() => setSelectedSlotNode(slotId)}
                              className={`h-14 rounded-lg flex flex-col items-center justify-center font-mono text-xs cursor-pointer transition-all relative ${
                                hasAnomaly
                                  ? 'bg-alert-anomaly/20 border-2 border-alert-anomaly text-alert-anomaly pulse-anomaly hover:bg-alert-anomaly/30 shadow-[0_0_15px_rgba(255,69,0,0.4)]'
                                  : 'border border-slate-700/80 border-dashed text-slate-400 hover:border-sky-400 hover:text-slate-200 bg-[#08101E]/40'
                              } ${isSelected ? 'ring-2 ring-sky-400 scale-105 z-20' : ''}`}
                            >
                              <span className="font-bold tracking-wider">{slotId}</span>
                              {hasAnomaly && (
                                <span className="text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.2 rounded-full absolute -top-2 -right-2 shadow-md">
                                  {anomalyCount}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Baris 2: 7 Slot (B1-09 s.d. B1-15) */}
                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 relative z-10">
                        {row2Slots.map(slotId => {
                          const hasAnomaly = !!nodeAnomaliMap[slotId];
                          const isSelected = selectedSlotNode === slotId;
                          const anomalyCount = hasAnomaly ? nodeAnomaliMap[slotId].length : 0;

                          return (
                            <div
                              key={slotId}
                              onClick={() => setSelectedSlotNode(slotId)}
                              className={`h-14 rounded-lg flex flex-col items-center justify-center font-mono text-xs cursor-pointer transition-all relative ${
                                hasAnomaly
                                  ? 'bg-alert-anomaly/20 border-2 border-alert-anomaly text-alert-anomaly pulse-anomaly hover:bg-alert-anomaly/30 shadow-[0_0_15px_rgba(255,69,0,0.4)]'
                                  : 'border border-slate-700/80 border-dashed text-slate-400 hover:border-sky-400 hover:text-slate-200 bg-[#08101E]/40'
                              } ${isSelected ? 'ring-2 ring-sky-400 scale-105 z-20' : ''}`}
                            >
                              <span className="font-bold tracking-wider">{slotId}</span>
                              {hasAnomaly && (
                                <span className="text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.2 rounded-full absolute -top-2 -right-2 shadow-md">
                                  {anomalyCount}
                                </span>
                              )}
                            </div>
                          );
                        })}

                        {/* Slot ke-8 baris kedua kosong / lorong akses */}
                        <div className="h-14 rounded-lg border border-slate-900 border-dashed text-slate-700 flex items-center justify-center font-mono text-[10px] opacity-40">
                          EXIT / RAM
                        </div>
                      </div>

                    </div>

                    {/* DETAIL PANEL UNTUK SLOT YANG DIPILIH */}
                    <div className="bg-[#08101E] border border-slate-800 rounded-xl p-5">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-sky-400">info</span>
                          <h3 className="font-mono text-base text-white font-bold">
                            Detail Insiden Node: <span className="text-sky-300">{selectedSlotNode || 'Pilih Slot'}</span>
                          </h3>
                        </div>
                        {selectedSlotNode && (
                          <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full ${
                            nodeAnomaliMap[selectedSlotNode]
                              ? 'bg-red-950/50 text-red-300 border border-red-700/50'
                              : 'bg-emerald-950/50 text-emerald-300 border border-emerald-700/50'
                          }`}>
                            {nodeAnomaliMap[selectedSlotNode] 
                              ? `${nodeAnomaliMap[selectedSlotNode].length} Insiden Anomali Terdeteksi` 
                              : 'Status Normal'}
                          </span>
                        )}
                      </div>

                      {selectedSlotNode && nodeAnomaliMap[selectedSlotNode] ? (
                        <div className="flex flex-col gap-3">
                          {nodeAnomaliMap[selectedSlotNode].map((item, idx) => (
                            <div key={idx} className="bg-red-950/20 border border-red-800/40 rounded-lg p-3.5 flex flex-col gap-1">
                              <div className="flex items-center justify-between text-xs font-mono">
                                <span className="text-red-400 font-bold">{item.jenisKejadian}</span>
                                <span className="text-slate-400">
                                  {item.waktuKejadian ? new Date(item.waktuKejadian).toLocaleString('id-ID') : '-'}
                                </span>
                              </div>
                              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                                {item.catatanDetail}
                              </p>
                              <div className="mt-2 flex items-center gap-2 text-[11px] font-mono text-slate-400">
                                <span>Resolusi: <strong className="text-amber-300">{item.statusResolusi || 'BELUM_DITANGANI'}</strong></span>
                                <span>•</span>
                                <span>Keparahan: <strong className="text-red-400">{item.tingkatKeparahan}</strong></span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-slate-400 text-xs py-4 text-center font-mono flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-emerald-400 text-lg">verified</span>
                          <span>Slot {selectedSlotNode} tidak memiliki catatan kesalahan atau anomali pada 10 log IoT terbaru.</span>
                        </div>
                      )}
                    </div>

                  </>
                )}

              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-700/60 bg-[#08101E] flex justify-between items-center">
                <span className="text-xs text-slate-500 font-mono">
                  *Klik pada kotak slot mana saja di peta untuk melihat riwayat insiden node terkait.
                </span>
                <button
                  onClick={() => setIsNodeMapModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
