// Import hook useState dan useEffect dari pustaka react untuk state dan siklus hidup komponen
import { useState, useEffect } from 'react';
// Import komponen AppLayout sebagai kerangka tata letak antarmuka aplikasi
import AppLayout from '../components/AppLayout';
// Import hook useLanguage dari konteks bahasa untuk internasionalisasi label dan teks
import { useLanguage } from '../context/LanguageContext';

// Mendefinisikan konstanta alamat dasar server backend Spring Boot (port 8081)
const API_BASE = 'http://localhost:8081';

// Deklarasi fungsi komponen publik ReportsPage untuk pelaporan analitik, pratinjau, dan ekspor dokumen resmi
export default function ReportsPage() {
  // Mengambil fungsi penerjemah t dari context LanguageContext
  const { t } = useLanguage();

  // Daftar opsi jenis laporan resmi sesuai modul PK-UC010
  const REPORT_TYPES = [
    { value: 'finansial', label: t('reports.typeFinancial', 'Laporan Finansial') }, // Laporan transaksi dan pendapatan
    { value: 'operasional', label: t('reports.typeOperational', 'Laporan Operasional & Okupansi') }, // Laporan log telemetri dan anomali
    { value: 'lingkungan', label: t('reports.typeEnvironmental', 'Laporan Lingkungan (Eco-Metric)') }, // Laporan reduksi karbon CO2 dan waktu
    { value: 'komprehensif', label: t('reports.typeComprehensive', 'Laporan Komprehensif (Master)') }, // Laporan rekapitulasi komprehensif master
  ];
  // Inisialisasi state reportType bertipe string dengan nilai bawaan 'finansial'
  const [reportType, setReportType] = useState('finansial');
  // Inisialisasi state startDate bertipe string dengan tanggal awal bulan berjalan
  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-01`;
  });
  // Inisialisasi state endDate bertipe string dengan tanggal hari ini
  const [endDate, setEndDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  // Inisialisasi state loading bertipe boolean untuk memantau status pengambilan pratinjau laporan
  const [loading, setLoading] = useState(false);
  // Inisialisasi state errorMsg bertipe string atau null untuk menyimpan pesan galat validasi parameter
  const [errorMsg, setErrorMsg] = useState(null);
  // Inisialisasi state reportData bertipe objek atau null untuk menyimpan data respons laporan backend
  const [reportData, setReportData] = useState(null);
  // Inisialisasi state komprehensifTab bertipe string dengan nilai awal 'finansial' untuk sub-tab laporan master
  const [komprehensifTab, setKomprehensifTab] = useState('finansial');
  // Inisialisasi state downloadingPdf bertipe boolean untuk status proses unduh berkas PDF
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  // Inisialisasi state downloadingXlsx bertipe boolean untuk status proses unduh berkas Excel
  const [downloadingXlsx, setDownloadingXlsx] = useState(false);
  // Inisialisasi state auditLogs bertipe array kosong untuk daftar riwayat penarikan dokumen
  const [auditLogs, setAuditLogs] = useState([]);
  // Inisialisasi state loadingAudit bertipe boolean untuk pemantauan data audit trail
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Deklarasi fungsi asinkron fetchAuditLogs untuk mengambil riwayat penarikan dokumen (Audit Trail PK-UC010)
  const fetchAuditLogs = async () => {
    try {
      // Mengaktifkan status loading audit
      setLoadingAudit(true);
      // Mengirimkan permintaan HTTP GET ke endpoint audit laporan backend
      const res = await fetch(`${API_BASE}/api/laporan/audit`);
      // Jika respons berhasil, perbarui state auditLogs
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data);
      }
    } catch (err) {
      // Menampilkan log galat audit ke konsol
      console.error('Error fetching audit logs:', err);
    } finally {
      // Mematikan status loading audit
      setLoadingAudit(false);
    }
  };

  // Deklarasi fungsi asinkron handleExportPdf untuk mengunduh dokumen resmi format PDF
  const handleExportPdf = async () => {
    // Jika data laporan belum tersedia, batalkan eksekusi
    if (!reportData) return;
    try {
      // Mengaktifkan indikator proses pengunduhan PDF
      setDownloadingPdf(true);
      // Membentuk URL permintaan unduhan PDF dengan query parameter yang telah di-encode
      const url = `${API_BASE}/api/laporan/unduh?format=pdf&jenis=${encodeURIComponent(reportType)}&dari=${encodeURIComponent(startDate)}&sampai=${encodeURIComponent(endDate)}`;

      // Mengirimkan permintaan HTTP fetch untuk mendapatkan berkas biner PDF
      const response = await fetch(url);
      // Jika respons tidak sukses, lempar pesan galat
      if (!response.ok) {
        throw new Error(`Gagal mengunduh dokumen PDF (HTTP ${response.status})`);
      }

      // Mengubah respons biner menjadi objek Blob
      const blob = await response.blob();
      // Membuat URL sementara dari Blob
      const blobUrl = window.URL.createObjectURL(blob);
      // Membuat elemen tautan HTML <a> secara dinamis
      const link = document.createElement('a');
      link.href = blobUrl;
      // Menentukan nama berkas unduhan PDF
      const namaFile = `Laporan_${reportType.charAt(0).toUpperCase() + reportType.slice(1)}_${startDate}_sd_${endDate}.pdf`;
      link.setAttribute('download', namaFile);
      // Menyisipkan elemen tautan ke dalam DOM body
      document.body.appendChild(link);
      // Memicu klik otomatis pada elemen tautan untuk memulai unduhan
      link.click();
      // Menghapus elemen tautan dari DOM
      document.body.removeChild(link);
      // Mencabut URL sementara Blob untuk membebaskan alokasi memori browser
      window.URL.revokeObjectURL(blobUrl);

      // Memperbarui rekam jejak audit unduhan terbaru
      fetchAuditLogs();
    } catch (err) {
      // Menampilkan log kesalahan ke konsol
      console.error('Error downloading PDF:', err);
      // Menampilkan pesan galat di antarmuka pengguna
      setErrorMsg('Gagal mengunduh dokumen PDF: ' + err.message);
    } finally {
      // Mematikan status loading unduh PDF
      setDownloadingPdf(false);
    }
  };

  // Deklarasi fungsi asinkron handleExportXlsx untuk mengunduh dokumen resmi spreadsheet format Excel (.xlsx)
  const handleExportXlsx = async () => {
    // Jika data laporan belum tersedia, batalkan eksekusi
    if (!reportData) return;
    try {
      // Mengaktifkan indikator proses pengunduhan Excel
      setDownloadingXlsx(true);
      // Membentuk URL permintaan unduhan XLSX dengan query parameter ter-encode
      const url = `${API_BASE}/api/laporan/unduh?format=xlsx&jenis=${encodeURIComponent(reportType)}&dari=${encodeURIComponent(startDate)}&sampai=${encodeURIComponent(endDate)}`;

      // Mengirimkan permintaan HTTP fetch untuk mengambil berkas biner Excel
      const response = await fetch(url);
      // Jika respons gagal, lempar galat
      if (!response.ok) {
        throw new Error(`Gagal mengunduh dokumen Excel (HTTP ${response.status})`);
      }

      // Mengubah respons ke format Blob
      const blob = await response.blob();
      // Membuat URL objek sementara
      const blobUrl = window.URL.createObjectURL(blob);
      // Membuat elemen tautan <a>
      const link = document.createElement('a');
      link.href = blobUrl;
      // Menentukan nama berkas spreadsheet Excel
      const namaFile = `Laporan_${reportType.charAt(0).toUpperCase() + reportType.slice(1)}_${startDate}_sd_${endDate}.xlsx`;
      link.setAttribute('download', namaFile);
      // Memasang elemen ke DOM
      document.body.appendChild(link);
      // Memicu unduhan berkas
      link.click();
      // Menghapus elemen dari DOM
      document.body.removeChild(link);
      // Membersihkan alokasi memori URL objek Blob
      window.URL.revokeObjectURL(blobUrl);

      // Memperbarui rekam jejak audit unduhan
      fetchAuditLogs();
    } catch (err) {
      // Menampilkan galat ke konsol
      console.error('Error downloading Excel:', err);
      // Menampilkan pesan kegagalan ke antarmuka
      setErrorMsg('Gagal mengunduh dokumen Excel: ' + err.message);
    } finally {
      // Mematikan status loading unduh Excel
      setDownloadingXlsx(false);
    }
  };

  // Deklarasi fungsi asinkron fetchReport untuk memvalidasi parameter dan mengambil pratinjau data laporan dari backend
  const fetchReport = async (jenis, dari, sampai) => {
    // Validasi parameter: memastikan tanggal mulai dan akhir telah terisi
    if (!dari || !sampai) {
      setErrorMsg('Input tanggal salah: Tanggal mulai dan tanggal akhir wajib dipilih.');
      return;
    }
    // Validasi kronologi: tanggal mulai tidak boleh melebihi tanggal akhir
    if (dari > sampai) {
      setErrorMsg('Input tanggal salah: Tanggal mulai tidak boleh lebih besar dari tanggal akhir.');
      return;
    }

    // Validasi masa depan: tanggal mulai tidak boleh melebihi hari ini
    const todayStr = new Date().toISOString().split('T')[0];
    if (dari > todayStr) {
      setErrorMsg('Input tanggal salah: Tanggal mulai tidak boleh berada di masa depan.');
      return;
    }

    // Mereset pesan galat menjadi null
    setErrorMsg(null);
    // Mengaktifkan status pemuatan data
    setLoading(true);

    try {
      // Mengirimkan permintaan HTTP GET ke endpoint pratinjau laporan
      const response = await fetch(
        `${API_BASE}/api/laporan/preview?jenis=${encodeURIComponent(jenis)}&dari=${encodeURIComponent(dari)}&sampai=${encodeURIComponent(sampai)}`
      );

      // Jika respons tidak berhasil (non-2xx)
      if (!response.ok) {
        const errorJson = await response.json().catch(() => null);
        const pesan = errorJson?.message || `Gagal memuat laporan (HTTP ${response.status}). Silakan ulangi.`;
        setErrorMsg(pesan);
        setReportData(null);
        return;
      }

      // Mengurai data respons JSON laporan
      const data = await response.json();
      // Menyimpan data laporan ke dalam state reportData
      setReportData(data);
    } catch (err) {
      // Menampilkan pesan kesalahan koneksi server ke konsol
      console.error('Error fetching report:', err);
      setErrorMsg('Gagal terhubung ke server backend SPCT. Pastikan server backend sedang aktif.');
      setReportData(null);
    } finally {
      // Mematikan status loading
      setLoading(false);
    }
  };

  // Hook useEffect untuk memuat data awal laporan dan audit log saat pertama kali komponen dirender
  useEffect(() => {
    fetchReport(reportType, startDate, endDate);
    fetchAuditLogs();
  }, []);

  // Deklarasi fungsi penanganan tombol submit pemicu pembuatan laporan
  const handleGenerate = (e) => {
    // Mencegah submit standar form
    e.preventDefault();
    // Memanggil pemuatan laporan dengan parameter terbaru
    fetchReport(reportType, startDate, endDate);
  };

  // Deklarasi fungsi pembantu getKpiColor untuk menentukan kelas warna kartu ringkasan KPI
  const getKpiColor = (warna) => {
    switch (warna) {
      case 'eco-success':
        return 'text-eco-success'; // Warna hijau ekologis
      case 'alert-anomaly':
        return 'text-alert-anomaly'; // Warna oranye-merah anomali
      case 'secondary':
        return 'text-secondary'; // Warna sekunder
      case 'primary':
      default:
        return 'text-primary'; // Warna primer bawaan
    }
  };

  // Mengembalikan elemen JSX modul laporan analitik dan operasional
  return (
    // Membungkus halaman dengan kerangka AppLayout dan breadcrumb navigasi
    <AppLayout breadcrumb={t('topbar.reports', 'Operational Reports')}>
      {/* Wadah isi utama halaman dengan penataan vertikal */}
      <div className="p-6 bg-background min-h-full flex flex-col gap-6">

        {/* Bagian header judul halaman dan status sinkronisasi */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-on-surface tracking-tight">{t('reports.title', 'Operational Reports')}</h1>
            <p className="text-text-muted font-mono text-sm mt-1">{t('reports.subtitle', 'MANAJEMEN // DATA HISTORIS & ANALITIK RESMI (PK-UC010)')}</p>
          </div>
          {/* Lencana status sinkronisasi database langsung */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-primary/10 text-primary border border-primary/20">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Live Database Sync
            </span>
          </div>
        </div>

        {/* Banner peringatan jika validasi parameter tanggal gagal */}
        {errorMsg && (
          <div className="bg-error-container/20 border border-error/50 rounded-xl p-4 flex items-start justify-between gap-3 text-on-surface animate-fadeIn">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-alert-anomaly text-[24px]">error</span>
              <div>
                <p className="text-xs font-mono font-bold text-alert-anomaly uppercase tracking-wider">Validasi Parameter Gagal</p>
                <p className="text-sm text-on-surface mt-0.5">{errorMsg}</p>
              </div>
            </div>
            {/* Tombol penutup pesan kesalahan */}
            <button
              onClick={() => setErrorMsg(null)}
              className="text-text-muted hover:text-on-surface transition-colors p-1 cursor-pointer"
              title="Tutup pesan"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        )}

        {/* Panel formulir pemilihan parameter laporan (Report Generator) */}
        <div className="bg-bg-surface rounded-xl p-5 border border-outline-variant/30 shadow-lg">
          <div className="flex items-center gap-2 mb-5">
            <span className="material-symbols-outlined text-primary text-[22px]">summarize</span>
            <h2 className="text-xl font-semibold text-on-surface">Report Generator</h2>
          </div>

          <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* Pilihan jenis laporan (Dropdown) */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="font-mono text-xs text-on-surface-variant uppercase tracking-wider">{t('reports.type', 'Jenis Laporan')}</label>
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

            {/* Input tanggal batas awal */}
            <div className="flex flex-col gap-2">
              <label className="font-mono text-xs text-on-surface-variant uppercase tracking-wider">{t('reports.startDate', 'Tanggal Mulai')}</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant text-on-surface px-4 py-3 rounded-lg focus:outline-none focus:border-primary font-mono text-sm transition-colors cursor-pointer"
              />
            </div>

            {/* Input tanggal batas akhir */}
            <div className="flex flex-col gap-2">
              <label className="font-mono text-xs text-on-surface-variant uppercase tracking-wider">{t('reports.endDate', 'Tanggal Akhir')}</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant text-on-surface px-4 py-3 rounded-lg focus:outline-none focus:border-primary font-mono text-sm transition-colors cursor-pointer"
              />
            </div>

            {/* Tombol aksi pemroses pembuatan laporan */}
            <button
              type="submit"
              disabled={loading}
              className="col-span-1 md:col-span-4 w-full py-3 bg-primary-container text-on-primary-container hover:brightness-110 active:scale-[0.99] rounded-lg font-bold font-mono text-base flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-md cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                  {t('common.loading', 'Menarik Data dari Database...')}
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                  {t('reports.btnPreview', 'Generate Report')}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Bagian pratinjau hasil penarikan laporan (Preview) */}
        {reportData && (
          <div className="flex flex-col gap-6 animate-fadeIn">

            {/* Kartu judul metadata laporan dan tombol ekspor resmi */}
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

                {/* Tombol ekspor dokumen PDF dan spreadsheet Excel */}
                <div className="flex items-center gap-3">
                  {/* Tombol unduh dokumen PDF */}
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

                  {/* Tombol unduh lembar kerja Excel */}
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

              {/* Grid kartu indikator metrik KPI ringkasan */}
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

              {/* Tiga pilar sorotan khusus laporan komprehensif master */}
              {reportData.metadata.jenisLaporan === 'komprehensif' && (
                <div className="mt-4 pt-4 border-t border-surface-variant/40 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-surface-container/60 rounded-lg p-3 border border-outline-variant/20 flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-[24px]">payments</span>
                    <div>
                      <p className="text-[11px] font-mono text-on-surface-variant uppercase">Pilar 1: Finansial</p>
                      <p className="text-xs font-semibold text-on-surface">Rekap Transaksi & Omset Parkir</p>
                    </div>
                  </div>
                  <div className="bg-surface-container/60 rounded-lg p-3 border border-warning-reserved/30 flex items-center gap-3">
                    <span className="material-symbols-outlined text-warning-reserved text-[24px]">sensors</span>
                    <div>
                      <p className="text-[11px] font-mono text-on-surface-variant uppercase">Pilar 2: IoT & Okupansi</p>
                      <p className="text-xs font-semibold text-on-surface">Log Node & Resolusi Anomali</p>
                    </div>
                  </div>
                  <div className="bg-surface-container/60 rounded-lg p-3 border border-eco-success/30 flex items-center gap-3">
                    <span className="material-symbols-outlined text-eco-success text-[24px]">eco</span>
                    <div>
                      <p className="text-[11px] font-mono text-on-surface-variant uppercase">Pilar 3: Eco-Metric</p>
                      <p className="text-xs font-semibold text-on-surface">Reduksi Karbon & Waktu Efisien</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tampilan pesan bila tidak ada data historis dalam periode terpilih */}
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
              /* Tabel rincian data historis sesuai kategori laporan */
              <div className="bg-bg-surface rounded-xl p-5 border border-outline-variant/30 shadow-lg flex flex-col gap-4">

                {/* Sub-header tabel dan navigasi tab komprehensif */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">table_chart</span>
                    <h3 className="text-lg font-semibold text-on-surface">Rincian Data Historis</h3>
                  </div>

                  {/* Tab selektor pilar data pada laporan komprehensif */}
                  {reportData.metadata.jenisLaporan === 'komprehensif' && (
                    <div className="flex items-center bg-surface-container p-1 rounded-lg border border-outline-variant/30 text-xs font-mono">
                      <button
                        type="button"
                        onClick={() => setKomprehensifTab('finansial')}
                        className={`px-3 py-1.5 rounded-md transition-colors ${komprehensifTab === 'finansial' ? 'bg-primary text-on-primary font-bold shadow' : 'text-on-surface-variant hover:text-on-surface'}`}
                      >
                        1. Finansial ({reportData.tabelFinansial.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setKomprehensifTab('operasional')}
                        className={`px-3 py-1.5 rounded-md transition-colors ${komprehensifTab === 'operasional' ? 'bg-primary text-on-primary font-bold shadow' : 'text-on-surface-variant hover:text-on-surface'}`}
                      >
                        2. Operasional ({reportData.tabelOperasional.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setKomprehensifTab('lingkungan')}
                        className={`px-3 py-1.5 rounded-md transition-colors ${komprehensifTab === 'lingkungan' ? 'bg-primary text-on-primary font-bold shadow' : 'text-on-surface-variant hover:text-on-surface'}`}
                      >
                        3. Lingkungan ({reportData.tabelLingkungan.length})
                      </button>
                    </div>
                  )}
                </div>

                {/* TABEL 1: RINCIAN LAPORAN FINANSIAL */}
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

                {/* TABEL 2: RINCIAN LAPORAN OPERASIONAL & OKUPANSI */}
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
                          <th className="text-left pb-3 pr-4">Jenis Anomali</th>
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
                            <td className="py-3 pr-4 font-mono text-on-surface text-xs">
                              <span className="px-2 py-0.5 rounded bg-surface-container-highest border border-outline-variant/30 text-[11px] font-semibold text-primary">
                                {row.jenisAnomali || '-'}
                              </span>
                            </td>
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
                                  (row.statusResolusi === 'SELESAI_DIVALIDASI' || row.statusResolusi === 'SUDAH_DITANGANI')
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

                {/* TABEL 3: RINCIAN LAPORAN LINGKUNGAN (ECO-METRIC) */}
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

        {/* Bagian Riwayat Unduhan Dokumen (Audit Trail PK-UC010 Langkah 19–20) */}
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
            {/* Tombol penyegaran rekam jejak audit */}
            <button
              onClick={fetchAuditLogs}
              disabled={loadingAudit}
              title="Perbarui daftar riwayat audit"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/60 text-on-surface-variant hover:text-on-surface bg-surface-container hover:bg-surface-container-high text-xs font-mono transition-colors cursor-pointer"
            >
              <span className={`material-symbols-outlined text-[16px] ${loadingAudit ? 'animate-spin' : ''}`}>
                refresh
              </span>
              Refresh Audit
            </button>
          </div>

          {/* Menampilkan indikator loading atau tabel rekam jejak audit unduhan */}
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
