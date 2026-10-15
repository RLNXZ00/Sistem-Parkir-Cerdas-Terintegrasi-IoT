import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';

const API_BASE = 'http://localhost:8081';

const REPORT_TYPES = [
  { value: 'finansial', label: 'Laporan Finansial' },
  { value: 'operasional', label: 'Laporan Operasional & Okupansi' },
  { value: 'lingkungan', label: 'Laporan Lingkungan (Eco-Metric)' },
  { value: 'komprehensif', label: 'Laporan Komprehensif (Master)' },
];

export default function ReportsPage() {
  const [reportType, setReportType] = useState('finansial');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-10-15');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [komprehensifTab, setKomprehensifTab] = useState('finansial');
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingXlsx, setDownloadingXlsx] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Mengambil Riwayat Audit Unduhan dari Backend (PK-UC010 Langkah 19-20)
  const fetchAuditLogs = async () => {
    try {
      setLoadingAudit(true);
      const res = await fetch(`${API_BASE}/api/laporan/audit`);
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoadingAudit(false);
    }
  };

  // Mengunduh Dokumen Resmi PDF ber-kop surat dan tanda tangan (Fase 3 - PK-UC010)
  const handleExportPdf = async () => {
    if (!reportData) return;
    try {
      setDownloadingPdf(true);
      const url = `${API_BASE}/api/laporan/unduh?format=pdf&jenis=${encodeURIComponent(reportType)}&dari=${encodeURIComponent(startDate)}&sampai=${encodeURIComponent(endDate)}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Gagal mengunduh dokumen PDF (HTTP ${response.status})`);
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const namaFile = `Laporan_${reportType.charAt(0).toUpperCase() + reportType.slice(1)}_${startDate}_sd_${endDate}.pdf`;
      link.setAttribute('download', namaFile);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      // Perbarui daftar audit trail setelah unduhan sukses
      fetchAuditLogs();
    } catch (err) {
      console.error('Error downloading PDF:', err);
      setErrorMsg('Gagal mengunduh dokumen PDF: ' + err.message);
    } finally {
      setDownloadingPdf(false);
    }
  };

  // Mengunduh Dokumen Resmi Spreadsheet Excel XLSX (Fase 4 - PK-UC010)
  const handleExportXlsx = async () => {
    if (!reportData) return;
    try {
      setDownloadingXlsx(true);
      const url = `${API_BASE}/api/laporan/unduh?format=xlsx&jenis=${encodeURIComponent(reportType)}&dari=${encodeURIComponent(startDate)}&sampai=${encodeURIComponent(endDate)}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Gagal mengunduh dokumen Excel (HTTP ${response.status})`);
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const namaFile = `Laporan_${reportType.charAt(0).toUpperCase() + reportType.slice(1)}_${startDate}_sd_${endDate}.xlsx`;
      link.setAttribute('download', namaFile);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      // Perbarui daftar audit trail setelah unduhan sukses
      fetchAuditLogs();
    } catch (err) {
      console.error('Error downloading Excel:', err);
      setErrorMsg('Gagal mengunduh dokumen Excel: ' + err.message);
    } finally {
      setDownloadingXlsx(false);
    }
  };

  // Mengambil laporan dari backend
  const fetchReport = async (jenis, dari, sampai) => {
    // 1. Validasi Parameter Sisi Klien (Sesuai Diagram Aktifitas & Sequence PK-UC010)
    if (!dari || !sampai) {
      setErrorMsg('Input tanggal salah: Tanggal mulai dan tanggal akhir wajib dipilih.');
      return;
    }
    if (dari > sampai) {
      setErrorMsg('Input tanggal salah: Tanggal mulai tidak boleh lebih besar dari tanggal akhir.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (dari > todayStr) {
      setErrorMsg('Input tanggal salah: Tanggal mulai tidak boleh berada di masa depan.');
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE}/api/laporan/preview?jenis=${encodeURIComponent(jenis)}&dari=${encodeURIComponent(dari)}&sampai=${encodeURIComponent(sampai)}`
      );

      if (!response.ok) {
        const errorJson = await response.json().catch(() => null);
        const pesan = errorJson?.message || `Gagal memuat laporan (HTTP ${response.status}). Silakan ulangi.`;
        setErrorMsg(pesan);
        setReportData(null);
        return;
      }

      const data = await response.json();
      setReportData(data);
    } catch (err) {
      console.error('Error fetching report:', err);
      setErrorMsg('Gagal terhubung ke server backend SPCT. Pastikan server backend sedang aktif.');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  // Muat data awal saat halaman pertama kali dibuka
  useEffect(() => {
    fetchReport(reportType, startDate, endDate);
    fetchAuditLogs();
  }, []);

  const handleGenerate = (e) => {
    e.preventDefault();
    fetchReport(reportType, startDate, endDate);
  };

  // Helper warna kartu KPI
  const getKpiColor = (warna) => {
    switch (warna) {
      case 'eco-success':
        return 'text-eco-success';
      case 'alert-anomaly':
        return 'text-alert-anomaly';
      case 'secondary':
        return 'text-secondary';
      case 'primary':
      default:
        return 'text-primary';
    }
  };

  return (
    <AppLayout breadcrumb="Operational Reports">
      <div className="p-6 bg-background min-h-full flex flex-col gap-6">

        {/* Header Halaman */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Operational Reports</h1>
            <p className="text-text-muted font-mono text-sm mt-1">MANAJEMEN // DATA HISTORIS & ANALITIK RESMI (PK-UC010)</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-primary/10 text-primary border border-primary/20">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Live Database Sync
            </span>
          </div>
        </div>

        {/* Flash Message Validasi Parameter (Error Banner Sesuai Sequence Step 6) */}
        {errorMsg && (
          <div className="bg-error-container/20 border border-error/50 rounded-xl p-4 flex items-start justify-between gap-3 text-on-surface animate-fadeIn">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-alert-anomaly text-[24px]">error</span>
              <div>
                <p className="text-xs font-mono font-bold text-alert-anomaly uppercase tracking-wider">Validasi Parameter Gagal</p>
                <p className="text-sm text-on-surface mt-0.5">{errorMsg}</p>
              </div>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-text-muted hover:text-white transition-colors p-1"
              title="Tutup pesan"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        )}

        {/* Report Generator Form */}
        <div className="bg-bg-surface rounded-xl p-5 border border-outline-variant/30 shadow-lg">
          <div className="flex items-center gap-2 mb-5">
            <span className="material-symbols-outlined text-primary text-[22px]">summarize</span>
            <h2 className="text-xl font-semibold text-on-surface">Report Generator</h2>
          </div>

          <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* Pilihan Jenis Laporan */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="font-mono text-xs text-on-surface-variant uppercase tracking-wider">Jenis Laporan</label>
              <div className="relative">
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full appearance-none bg-surface-container border border-outline-variant text-on-surface px-4 py-3 rounded-lg focus:outline-none focus:border-primary font-mono text-sm transition-colors cursor-pointer"
                >
                  {REPORT_TYPES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            {/* Tanggal Mulai */}
            <div className="flex flex-col gap-2">
              <label className="font-mono text-xs text-on-surface-variant uppercase tracking-wider">Tanggal Mulai</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant text-on-surface px-4 py-3 rounded-lg focus:outline-none focus:border-primary font-mono text-sm transition-colors cursor-pointer"
              />
            </div>

            {/* Tanggal Akhir */}
            <div className="flex flex-col gap-2">
              <label className="font-mono text-xs text-on-surface-variant uppercase tracking-wider">Tanggal Akhir</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant text-on-surface px-4 py-3 rounded-lg focus:outline-none focus:border-primary font-mono text-sm transition-colors cursor-pointer"
              />
            </div>

            {/* Tombol Generate Report */}
            <button
              type="submit"
              disabled={loading}
              className="col-span-1 md:col-span-4 w-full py-3 bg-primary-container text-on-primary-container hover:brightness-110 active:scale-[0.99] rounded-lg font-bold font-mono text-base flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-md cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                  Menarik Data dari Database...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                  Generate Report
                </>
              )}
            </button>
          </form>
        </div>

        {/* Section Pratinjau Laporan (Preview) */}
        {reportData && (
          <div className="flex flex-col gap-6 animate-fadeIn">

            {/* Kartu Ringkasan & Header Laporan */}
            <div className="bg-bg-surface rounded-xl p-5 border border-outline-variant/30 shadow-lg">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-4 border-b border-surface-variant/40">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-eco-success text-[28px]">verified</span>
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-on-surface">{reportData.metadata.judulLaporan}</h2>
                      {reportData.metadata.modeSimulasi && (
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-warning-reserved/20 text-warning-reserved border border-warning-reserved/30" title="Pembayaran gerbang keluar masih disimulasikan dari kiosk, belum payment gateway sungguhan">
                          MODE SIMULASI
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-mono text-text-muted mt-0.5">
                      Periode: {reportData.metadata.tanggalMulai} s.d. {reportData.metadata.tanggalAkhir} • Digenerate: {reportData.metadata.waktuGenerate} • Total: {reportData.metadata.totalBaris} Data
                    </p>
                  </div>
                </div>

                {/* Tombol Ekspor Dokumen Resmi (PDF & Excel) */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleExportPdf}
                    disabled={downloadingPdf}
                    title="Unduh Dokumen PDF Resmi ber-kop surat, ringkasan KPI, dan lembar pengesahan (PK-UC010)"
                    className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-red-500/40 text-red-400 bg-red-500/10 hover:bg-red-500/20 active:scale-95 text-xs font-mono font-medium transition-all cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {downloadingPdf ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[16px] text-alert-anomaly">picture_as_pdf</span>
                        Export PDF
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleExportXlsx}
                    disabled={downloadingXlsx}
                    title="Unduh Dokumen Spreadsheet Resmi Excel XLSX (PK-UC010)"
                    className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-emerald-500/40 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-95 text-xs font-mono font-medium transition-all cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {downloadingXlsx ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                        Generating XLSX...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[16px] text-eco-success">table_view</span>
                        Export XLSX
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* KPI Cards Ringkasan Eksekutif */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {reportData.ringkasan.map((kpi, idx) => (
                  <div key={idx} className="bg-surface-container rounded-lg p-4 border border-outline-variant/20 hover:border-outline-variant/40 transition-colors">
                    <p className="text-xs font-mono text-on-surface-variant mb-1">{kpi.label}</p>
                    <div className="flex items-baseline gap-1.5">
                      <p className={`text-2xl font-bold font-mono tracking-tight ${getKpiColor(kpi.warna)}`}>
                        {kpi.nilai}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Kondisi Alternate Course: Data Kosong */}
            {reportData.metadata.kosong ? (
              <div className="bg-bg-surface rounded-xl p-12 border border-outline-variant/30 text-center flex flex-col items-center justify-center gap-3">
                <span className="material-symbols-outlined text-text-muted text-[48px]">folder_off</span>
                <h3 className="text-lg font-bold text-on-surface">Data Kosong Pada Periode Ini</h3>
                <p className="text-sm text-text-muted max-w-md">{reportData.metadata.pesanStatus}</p>
                <p className="text-xs font-mono text-primary mt-2">
                  Saran: Ubah rentang tanggal mulai/akhir ke periode yang memiliki riwayat aktivitas kendaraan.
                </p>
              </div>
            ) : (
              /* Tabel Data Historis Sesuai Jenis Laporan */
              <div className="bg-bg-surface rounded-xl p-5 border border-outline-variant/30 shadow-lg flex flex-col gap-4">

                {/* Sub-Header Tabel & Tab Navigasi Khusus Laporan Komprehensif */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">table_chart</span>
                    <h3 className="text-lg font-semibold text-on-surface">Rincian Data Historis</h3>
                  </div>

                  {reportData.metadata.jenisLaporan === 'komprehensif' && (
                    <div className="flex items-center bg-surface-container p-1 rounded-lg border border-outline-variant/30 text-xs font-mono">
                      <button
                        type="button"
                        onClick={() => setKomprehensifTab('finansial')}
                        className={`px-3 py-1.5 rounded-md transition-colors ${komprehensifTab === 'finansial' ? 'bg-primary text-on-primary font-bold shadow' : 'text-on-surface-variant hover:text-white'}`}
                      >
                        1. Finansial ({reportData.tabelFinansial.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setKomprehensifTab('operasional')}
                        className={`px-3 py-1.5 rounded-md transition-colors ${komprehensifTab === 'operasional' ? 'bg-primary text-on-primary font-bold shadow' : 'text-on-surface-variant hover:text-white'}`}
                      >
                        2. Operasional ({reportData.tabelOperasional.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setKomprehensifTab('lingkungan')}
                        className={`px-3 py-1.5 rounded-md transition-colors ${komprehensifTab === 'lingkungan' ? 'bg-primary text-on-primary font-bold shadow' : 'text-on-surface-variant hover:text-white'}`}
                      >
                        3. Lingkungan ({reportData.tabelLingkungan.length})
                      </button>
                    </div>
                  )}
                </div>

                {/* TABEL 1: LAPORAN FINANSIAL */}
                {(reportData.metadata.jenisLaporan === 'finansial' ||
                  (reportData.metadata.jenisLaporan === 'komprehensif' && komprehensifTab === 'finansial')) && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-surface-variant text-on-surface-variant font-mono text-xs uppercase tracking-wider">
                          <th className="text-left pb-3 pr-3">No</th>
                          <th className="text-left pb-3 pr-4">No. Tiket</th>
                          <th className="text-left pb-3 pr-4">Plat Nomor</th>
                          <th className="text-left pb-3 pr-4">Jenis</th>
                          <th className="text-left pb-3 pr-4">Waktu Masuk</th>
                          <th className="text-left pb-3 pr-4">Waktu Keluar</th>
                          <th className="text-left pb-3 pr-4">Durasi</th>
                          <th className="text-right pb-3 pr-4">Total Biaya</th>
                          <th className="text-left pb-3 pr-4">Kanal Bayar</th>
                          <th className="text-center pb-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.tabelFinansial.map((row) => (
                          <tr key={row.idTransaksi} className="border-b border-surface-container hover:bg-surface-container-high transition-colors">
                            <td className="py-3 pr-3 font-mono text-on-surface-variant text-xs">{row.no}</td>
                            <td className="py-3 pr-4 font-mono text-primary text-xs font-semibold">{row.nomorTiket}</td>
                            <td className="py-3 pr-4 font-mono text-on-surface text-sm font-bold">{row.platNomor}</td>
                            <td className="py-3 pr-4 font-mono text-on-surface-variant text-xs">{row.jenisKendaraan}</td>
                            <td className="py-3 pr-4 font-mono text-on-surface-variant text-xs">{row.waktuMasuk}</td>
                            <td className="py-3 pr-4 font-mono text-on-surface-variant text-xs">{row.waktuKeluar}</td>
                            <td className="py-3 pr-4 font-mono text-on-surface text-xs">{row.durasiTeks}</td>
                            <td className="py-3 pr-4 font-mono text-eco-success font-bold text-sm text-right">
                              Rp {Number(row.totalTarif).toLocaleString('id-ID')}
                            </td>
                            <td className="py-3 pr-4 font-mono text-on-surface-variant text-xs">
                              <span className="px-2 py-0.5 rounded bg-surface-container-highest border border-outline-variant/30 text-[11px]">
                                {row.kanalPembayaran}
                              </span>
                            </td>
                            <td className="py-3 text-center">
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-eco-success/20 text-eco-success border border-eco-success/30">
                                {row.statusPembayaran}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* TABEL 2: LAPORAN OPERASIONAL & OKUPANSI */}
                {(reportData.metadata.jenisLaporan === 'operasional' ||
                  (reportData.metadata.jenisLaporan === 'komprehensif' && komprehensifTab === 'operasional')) && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-surface-variant text-on-surface-variant font-mono text-xs uppercase tracking-wider">
                          <th className="text-left pb-3 pr-3">No</th>
                          <th className="text-left pb-3 pr-4">ID Log</th>
                          <th className="text-left pb-3 pr-4">Waktu Kejadian</th>
                          <th className="text-left pb-3 pr-4">Slot / Node</th>
                          <th className="text-left pb-3 pr-4">Tipe Kejadian</th>
                          <th className="text-left pb-3 pr-4">Catatan Detail</th>
                          <th className="text-center pb-3 pr-4">Severity</th>
                          <th className="text-center pb-3">Status Resolusi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.tabelOperasional.map((row) => (
                          <tr key={row.idLog} className="border-b border-surface-container hover:bg-surface-container-high transition-colors">
                            <td className="py-3 pr-3 font-mono text-on-surface-variant text-xs">{row.no}</td>
                            <td className="py-3 pr-4 font-mono text-primary text-xs font-semibold">{row.idLog}</td>
                            <td className="py-3 pr-4 font-mono text-on-surface-variant text-xs">{row.waktu}</td>
                            <td className="py-3 pr-4 font-mono text-on-surface text-xs font-bold">{row.idSlot}</td>
                            <td className="py-3 pr-4 font-mono text-on-surface text-xs">{row.jenisKejadian}</td>
                            <td className="py-3 pr-4 text-xs text-text-muted max-w-xs truncate" title={row.catatanDetail}>
                              {row.catatanDetail}
                            </td>
                            <td className="py-3 pr-4 text-center">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                  row.tingkatKeparahan === 'CRITICAL'
                                    ? 'bg-alert-anomaly/20 text-alert-anomaly border border-alert-anomaly/30'
                                    : row.tingkatKeparahan === 'WARNING'
                                    ? 'bg-warning-reserved/20 text-warning-reserved border border-warning-reserved/30'
                                    : 'bg-primary/20 text-primary border border-primary/30'
                                }`}
                              >
                                {row.tingkatKeparahan}
                              </span>
                            </td>
                            <td className="py-3 text-center">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                  row.statusResolusi === 'SUDAH_DITANGANI'
                                    ? 'bg-eco-success/20 text-eco-success border border-eco-success/30'
                                    : 'bg-alert-anomaly/20 text-alert-anomaly border border-alert-anomaly/30'
                                }`}
                              >
                                {row.statusResolusi}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* TABEL 3: LAPORAN LINGKUNGAN (ECO-METRIC) */}
                {(reportData.metadata.jenisLaporan === 'lingkungan' ||
                  (reportData.metadata.jenisLaporan === 'komprehensif' && komprehensifTab === 'lingkungan')) && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-surface-variant text-on-surface-variant font-mono text-xs uppercase tracking-wider">
                          <th className="text-left pb-3 pr-3">No</th>
                          <th className="text-left pb-3 pr-4">Plat Nomor</th>
                          <th className="text-left pb-3 pr-4">Slot Tujuan</th>
                          <th className="text-left pb-3 pr-4">Waktu Masuk</th>
                          <th className="text-left pb-3 pr-4">Tiba di Slot</th>
                          <th className="text-right pb-3 pr-4">Durasi Nyata</th>
                          <th className="text-right pb-3 pr-4">Waktu Normal</th>
                          <th className="text-right pb-3 pr-4">Waktu Dihemat</th>
                          <th className="text-right pb-3">Reduksi CO2</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.tabelLingkungan.map((row) => (
                          <tr key={row.no} className="border-b border-surface-container hover:bg-surface-container-high transition-colors">
                            <td className="py-3 pr-3 font-mono text-on-surface-variant text-xs">{row.no}</td>
                            <td className="py-3 pr-4 font-mono text-on-surface text-sm font-bold">{row.platNomor}</td>
                            <td className="py-3 pr-4 font-mono text-primary text-xs font-semibold">{row.idSlot}</td>
                            <td className="py-3 pr-4 font-mono text-on-surface-variant text-xs">{row.waktuMasuk}</td>
                            <td className="py-3 pr-4 font-mono text-on-surface-variant text-xs">{row.waktuTiba}</td>
                            <td className="py-3 pr-4 font-mono text-on-surface text-xs text-right">{row.durasiTempuhDetik} dtk</td>
                            <td className="py-3 pr-4 font-mono text-text-muted text-xs text-right">{row.waktuNormalDetik} dtk</td>
                            <td className="py-3 pr-4 font-mono text-secondary font-bold text-xs text-right">
                              {row.menitDihemat} mnt
                            </td>
                            <td className="py-3 font-mono text-eco-success font-bold text-sm text-right">
                              {row.reduksiCo2Gram} g
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Section Riwayat Unduhan Dokumen (Audit Trail PK-UC010) */}
        <div className="bg-bg-surface rounded-xl p-5 border border-outline-variant/30 shadow-lg flex flex-col gap-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-variant/40 pb-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[24px]">verified_user</span>
              <div>
                <h3 className="text-lg font-bold text-on-surface">Riwayat Unduhan Dokumen (Audit Trail)</h3>
                <p className="text-xs font-mono text-text-muted mt-0.5">
                  LOG KEAMANAN // REKAM JEJAK PENARIKAN DOKUMEN RESMI (PK-UC010 LANGKAH 19–20)
                </p>
              </div>
            </div>
            <button
              onClick={fetchAuditLogs}
              disabled={loadingAudit}
              title="Perbarui daftar riwayat audit"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/60 text-on-surface-variant hover:text-white bg-surface-container hover:bg-surface-container-high text-xs font-mono transition-colors cursor-pointer"
            >
              <span className={`material-symbols-outlined text-[16px] ${loadingAudit ? 'animate-spin' : ''}`}>
                refresh
              </span>
              Refresh Audit
            </button>
          </div>

          {loadingAudit && auditLogs.length === 0 ? (
            <div className="py-8 text-center text-text-muted font-mono text-xs flex items-center justify-center gap-2">
              <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
              Memuat log audit unduhan...
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="py-8 text-center text-text-muted font-mono text-xs">
              Belum ada riwayat dokumen yang diunduh pada sistem ini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-variant text-on-surface-variant font-mono text-xs uppercase tracking-wider">
                    <th className="text-left pb-3 pr-3">ID</th>
                    <th className="text-left pb-3 pr-4">Waktu Unduh</th>
                    <th className="text-left pb-3 pr-4">Pengguna</th>
                    <th className="text-left pb-3 pr-4">Jenis Laporan</th>
                    <th className="text-center pb-3 pr-4">Format</th>
                    <th className="text-left pb-3 pr-4">Nama Berkas</th>
                    <th className="text-right pb-3 pr-4">Ukuran</th>
                    <th className="text-center pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.idAudit} className="border-b border-surface-container hover:bg-surface-container-high transition-colors">
                      <td className="py-3 pr-3 font-mono text-on-surface-variant text-xs">#{log.idAudit}</td>
                      <td className="py-3 pr-4 font-mono text-on-surface-variant text-xs">
                        {log.waktuUnduh ? log.waktuUnduh.replace('T', ' ').substring(0, 19) : '-'} WIB
                      </td>
                      <td className="py-3 pr-4 font-mono text-on-surface text-xs font-semibold">{log.pengguna}</td>
                      <td className="py-3 pr-4 font-mono text-xs">
                        <span className="px-2 py-0.5 rounded bg-surface-container-highest border border-outline-variant/30 text-[11px] text-on-surface">
                          {log.jenisLaporan}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            log.formatBerkas === 'PDF'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {log.formatBerkas}
                        </span>
                      </td>
                      <td className="py-3 pr-4 font-mono text-primary text-xs max-w-xs truncate" title={log.namaBerkas}>
                        {log.namaBerkas}
                      </td>
                      <td className="py-3 pr-4 font-mono text-on-surface-variant text-xs text-right">
                        {(log.ukuranByte / 1024).toFixed(1)} KB
                      </td>
                      <td className="py-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-eco-success/20 text-eco-success border border-eco-success/30">
                          {log.statusKeberhasilan}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </AppLayout>
  );
}
