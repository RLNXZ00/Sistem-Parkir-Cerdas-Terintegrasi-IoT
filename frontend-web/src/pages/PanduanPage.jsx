// Import hook useState dari pustaka react untuk penanganan state lokal antarmuka
import { useState } from 'react';
// Import komponen AppLayout sebagai kerangka tata letak halaman standar SPCT
import AppLayout from '../components/AppLayout';

// Deklarasi fungsi komponen publik PanduanPage untuk petunjuk operasional dan SOP sistem parkir
export default function PanduanPage() {
  // Inisialisasi state activeCategory bertipe string dengan nilai awal 'ALL' untuk tab filter SOP
  const [activeCategory, setActiveCategory] = useState('ALL');
  // Inisialisasi state searchQuery bertipe string untuk kata kunci pencarian prosedur
  const [searchQuery, setSearchQuery] = useState('');
  // Inisialisasi state expandedId bertipe string dengan nilai default 'PK-UC001' untuk akordion yang terbuka awal
  const [expandedId, setExpandedId] = useState('PK-UC001');

  // Basis data Narasi Use Case dari dokumen Blueprint RPL (Tahap_V_SistemParkirCerdas.pdf)
  const panduanList = [
    {
      id: 'PK-UC001', // Identitas Use Case
      title: 'Mendeteksi Plat & Klasifikasi Kendaraan', // Judul prosedur
      category: 'ENTRY', // Kategori gerbang masuk
      badge: 'Alur Gerbang Masuk', // Label lencana
      badgeColor: 'bg-eco-success/20 text-eco-success border-eco-success/40', // Warna lencana
      actors: 'Pengendara, Kamera ANPR Gerbang, AI Vision Engine', // Aktor yang terlibat
      summary: 'Proses identifikasi otomatis nomor polisi dan jenis kendaraan di gerbang masuk via YOLOv11 + OCR.', // Ringkasan alur
      steps: [
        { no: '1', actor: 'Pengendara', text: 'Menghentikan kendaraan tepat di depan garis henti terminal gerbang masuk.' },
        { no: '2', actor: 'Pengendara', text: 'Menekan tombol hijau pada terminal kios masuk.' },
        { no: '3', actor: 'Kamera ANPR', text: 'Menangkap citra plat nomor resolusi tinggi secara otomatis.' },
        { no: '4', actor: 'AI YOLOv11', text: 'Mengekstrak karakter string plat dan memvalidasi kejelasan nomor (< 3 detik).' },
        { no: '5', actor: 'Sistem Backend', text: 'Mencatat timestamp masuk dan memanggil alokasi slot kosong (PK-UC002).' }
      ],
      troubleshooting: 'Jika plat kotor atau tidak terbaca, layar terminal meminta pengendara memajukan kendaraan sedikit atau menekan tombol panggil bantuan ke petugas pos.',
      businessRules: 'Pengendara wajib memilih gerbang sesuai jenis kendaraan (Jalur Mobil vs Jalur Motor) untuk memastikan alokasi slot yang tepat.'
    },
    {
      id: 'PK-UC002',
      title: 'Mencari & Mengalokasikan Slot Parkir Cerdas',
      category: 'ENTRY',
      badge: 'Alokasi Algoritma',
      badgeColor: 'bg-system-info/20 text-system-info border-system-info/40',
      actors: 'Sistem Backend, Terminal Kios Gerbang, Layar Panduan',
      summary: 'Sistem mencari slot parkir basement yang masih KOSONG terdekat dan mengubah statusnya menjadi DIPESAN.',
      steps: [
        { no: '1', actor: 'Sistem Backend', text: 'Memeriksa ketersediaan 16 slot parkir di Basement B1 secara real-time.' },
        { no: '2', actor: 'Algoritma Graf', text: 'Memilih slot kosong terdekat dengan pintu akses basement.' },
        { no: '3', actor: 'Database', text: 'Mengubah status slot terpilih menjadi DIPESAN agar tidak diserobot pengendara lain.' },
        { no: '4', actor: 'Terminal Kios', text: 'Mengarahkan pengendara ke halaman denah navigasi visual (PK-UC003).' },
        { no: '5', actor: 'Sistem Gerbang', text: 'Membuka palang pintu gerbang masuk secara otomatis.' }
      ],
      troubleshooting: 'Jika seluruh slot di Basement B1 berstatus TERISI/DIPESAN (penuh), palang gerbang tidak terbuka dan menampilkan status "Parkir Penuh".',
      businessRules: 'Slot yang berstatus DIPESAN memiliki batas waktu toleransi perjalanan (Grace Period Reservasi) sebelum dianggap kedaluwarsa.'
    },
    {
      id: 'PK-UC003',
      title: 'Menampilkan Panduan Rute Denah Visual',
      category: 'NAVIGATION',
      badge: 'Navigasi Kiosk',
      badgeColor: 'bg-primary/20 text-primary border-primary/40',
      actors: 'Pengendara, Terminal Kios Pengendara',
      summary: 'Memberikan panduan arah belokan dan kode slot target (misal B1-05) pada layar sentuh kios sebagai pengganti karcis kertas.',
      steps: [
        { no: '1', actor: 'Terminal Kios', text: 'Menampilkan denah interaktif Basement B1 lengkap dengan nomor slot dan rute garis hijau.' },
        { no: '2', actor: 'Pengendara', text: 'Mengingat atau memindai kode slot yang dialokasikan di layar kiosk.' },
        { no: '3', actor: 'Pengendara', text: 'Melajukan kendaraan menuju area basement mengikuti tanda panah arah rute.' }
      ],
      troubleshooting: 'Pengendara dapat melihat papan petunjuk fisik di dalam basement jika lupa nomor slot yang dialokasikan di kios gerbang.',
      businessRules: 'Sistem SPCT mengusung konsep paperless 100%, menghilangkan penggunaan tiket kertas konvensional.'
    },
    {
      id: 'PK-UC004',
      title: 'Pemantauan Okupansi Slot Fisik via IoT',
      category: 'IOT',
      badge: 'Telemetri IoT',
      badgeColor: 'bg-[#ffd700]/20 text-[#ffd700] border-yellow-700/40',
      actors: 'Sensor Ultrasonik (16 Unit), Broker Telemetri, Web Dashboard',
      summary: 'Sensor mendeteksi keberadaan kendaraan fisik pada slot dan mencatat waktu tiba untuk kalkulasi reduksi emisi CO₂.',
      steps: [
        { no: '1', actor: 'Kendaraan', text: 'Masuk dan berhenti tepat di dalam area slot yang dialokasikan.' },
        { no: '2', actor: 'Sensor IoT', text: 'Mendeteksi jarak pantulan ultrasonik stabil (< 50 cm) selama minimal 4 detik.' },
        { no: '3', actor: 'Sistem Backend', text: 'Menerima sinyal telemetri dan mengubah status slot dari DIPESAN menjadi TERISI.' },
        { no: '4', actor: 'Kalkulator Eco', text: 'Mencatat waktuTibaSlot dan menghitung menitDihemat untuk kalkulasi reduksi polusi CO₂.' }
      ],
      troubleshooting: 'Jika sensor mendeteksi objek namun tidak ada kendaraan yang terdaftar (penyerobotan), sistem otomatis mencatat peringatan anomali (PK-UC005).',
      businessRules: 'Filter debounce 4 detik diterapkan agar orang yang lewat atau berdiri sesaat tidak menyebabkan perubahan status slot.'
    },
    {
      id: 'PK-UC005',
      title: 'Deteksi Anomali & Peringatan Salah Parkir',
      category: 'OPS',
      badge: 'Operasional Lapangan',
      badgeColor: 'bg-alert-anomaly/20 text-alert-anomaly border-alert-anomaly/40',
      actors: 'Sistem Backend, Petugas Lapangan',
      summary: 'Penanganan insiden salah tempat parkir, sensor offline, atau ketidaksesuaian status di basement.',
      steps: [
        { no: '1', actor: 'Sistem Deteksi', text: 'Mendeteksi status slot anomali (misal sensor terisi di luar slot alokasi).' },
        { no: '2', actor: 'Dashboard', text: 'Memunculkan kartu berkedip merah (pulse alert) pada panel Active Alerts.' },
        { no: '3', actor: 'Petugas Lapangan', text: 'Membuka menu Anomaly Logs, memeriksa slot fisik di basement atau via Gate Live Feed.' },
        { no: '4', actor: 'Petugas Lapangan', text: 'Melakukan validasi lapangan dan memperbarui status tiket menjadi SELESAI_DIVALIDASI.' }
      ],
      troubleshooting: 'Petugas dapat memindahkan kendaraan yang salah slot secara persuasif untuk mencegah efek domino saat gerbang keluar.',
      businessRules: 'Setiap anomali tingkat CRITICAL wajib ditangani sebelum laporan operasional harian ditutup.'
    },
    {
      id: 'PK-UC006',
      title: 'Menghitung Durasi & Tarif Parkir Gerbang Keluar',
      category: 'EXIT',
      badge: 'Alur Gerbang Keluar',
      badgeColor: 'bg-eco-success/20 text-eco-success border-eco-success/40',
      actors: 'Pengendara, Kamera ANPR Keluar, Sistem Transaksi',
      summary: 'Kamera keluar membaca plat nomor kendaraan dan backend menghitung total durasi serta nominal tagihan.',
      steps: [
        { no: '1', actor: 'Pengendara', text: 'Menghentikan kendaraan di terminal gerbang keluar.' },
        { no: '2', actor: 'Kamera Keluar', text: 'Memindai plat nomor dan mencocokkan dengan transaksi parkir aktif di database.' },
        { no: '3', actor: 'Sistem Tagihan', text: 'Menghitung durasiTotalMenit = waktuKeluar - waktuMasuk.' },
        { no: '4', actor: 'Aturan Bisnis', text: 'Jika durasi < 10 menit (Grace Period Drop-Off), tagihan otomatis Rp 0 (LUNAS).' },
        { no: '5', actor: 'Layar Kiosk', text: 'Menampilkan rincian waktu parkir dan QRIS pembayaran digital (PK-UC007).' }
      ],
      troubleshooting: 'Jika data transaksi masuk tidak ditemukan karena OCR gerbang masuk sebelumnya bermasalah, sistem memanggil petugas pos keluar.',
      businessRules: 'Tarif dihitung per jam dengan pembulatan ke atas setelah melewati masa grace period.'
    },
    {
      id: 'PK-UC007',
      title: 'Proses Pembayaran Nirkontak (Cashless Gateway)',
      category: 'EXIT',
      badge: 'Pembayaran Digital',
      badgeColor: 'bg-system-info/20 text-system-info border-system-info/40',
      actors: 'Pengendara, Kios Gerbang Keluar, Payment Gateway',
      summary: 'Pembayaran non-tunai via scan QRIS dinamis atau kartu E-Toll pada terminal keluar.',
      steps: [
        { no: '1', actor: 'Pengendara', text: 'Memilih metode pembayaran (QRIS atau E-Toll) pada layar terminal.' },
        { no: '2', actor: 'Pengendara', text: 'Melakukan scan barcode QRIS menggunakan mobile banking / e-wallet.' },
        { no: '3', actor: 'Payment Gateway', text: 'Mengirimkan sinyal callback bahwa transaksi berhasil lunas.' },
        { no: '4', actor: 'Sistem Backend', text: 'Memperbarui status pembayaran menjadi LUNAS dan slot asal menjadi KOSONG.' }
      ],
      troubleshooting: 'Jika terjadi kendala koneksi internet pada terminal, sistem dapat beralih ke pembayaran darurat melalui pos petugas.',
      businessRules: 'Sistem tidak menerima uang tunai di gerbang otomatis guna mencegah antrean kemacetan.'
    },
    {
      id: 'PK-UC008',
      title: 'Pembukaan Palang Gerbang Keluar Otomatis',
      category: 'EXIT',
      badge: 'Otomasi Palang',
      badgeColor: 'bg-eco-success/20 text-eco-success border-eco-success/40',
      actors: 'Sistem Gerbang Keluar, Pengendara',
      summary: 'Palang pintu gerbang terbuka segera setelah status pembayaran diverifikasi LUNAS.',
      steps: [
        { no: '1', actor: 'Sistem Gerbang', text: 'Memvalidasi status transaksi parkir telah LUNAS atau GRACE_PERIOD.' },
        { no: '2', actor: 'Motor Servo Palang', text: 'Mengangkat palang pintu gerbang keluar secara otomatis.' },
        { no: '3', actor: 'Pengendara', text: 'Melajukan kendaraan meninggalkan area parkir fasilitas.' },
        { no: '4', actor: 'Sensor Loop Keluar', text: 'Mendeteksi kendaraan telah lewat dan menurunkan kembali palang gerbang.' }
      ],
      troubleshooting: 'Tersedia tombol manual bypass palang gerbang untuk kondisi darurat kebakaran atau evakuasi bencana.',
      businessRules: 'Palang tidak akan terbuka jika status transaksi belum tercatat lunas.'
    },
    {
      id: 'PK-UC009',
      title: 'Pemantauan Kondisi Real-Time (Command Center)',
      category: 'OPS',
      badge: 'Petugas Lapangan',
      badgeColor: 'bg-primary/20 text-primary border-primary/40',
      actors: 'Petugas Lapangan, Web Dashboard',
      summary: 'Dashboard terpusat untuk memantau denah 16 slot, 4 kamera ANPR, dan log telemetri sensor.',
      steps: [
        { no: '1', actor: 'Petugas', text: 'Login menggunakan akun peran PETUGAS_LAPANGAN.' },
        { no: '2', actor: 'Dashboard', text: 'Menampilkan Peta Slot Real-Time dengan indikator warna (Hijau, Kuning, Merah).' },
        { no: '3', actor: 'Live Gate Monitor', text: 'Memantau tangkapan video 4 kamera gerbang (Entry/Exit Mobil dan Motor).' },
        { no: '4', actor: 'Hardware Strip', text: 'Menampilkan status konektivitas 16 sensor ultrasonik.' }
      ],
      troubleshooting: 'Data dashboard secara otomatis melakukan sinkronisasi real-time setiap 1.5 detik tanpa perlu me-refresh browser (F5).',
      businessRules: 'Petugas lapangan hanya memiliki akses pemantauan operasional taktis, bukan laporan analitik finansial.'
    },
    {
      id: 'PK-UC010',
      title: 'Analitik Bisnis & Ekspor Laporan Resmi (PDF/Excel)',
      category: 'MGMT',
      badge: 'Manajemen RS',
      badgeColor: 'bg-[#00BFFF]/20 text-[#00BFFF] border-cyan-700/40',
      actors: 'Manajemen RS / Direksi, Web Dashboard',
      summary: 'Rekapitulasi total pendapatan, tren okupansi kendaraan, penghematan emisi CO₂, dan ekspor berkas.',
      steps: [
        { no: '1', actor: 'Manajemen', text: 'Login menggunakan akun peran Manajemen RS atau Admin.' },
        { no: '2', actor: 'Dashboard Manajemen', text: 'Melihat Revenue Tracker, Total Transaksi, dan Metrik Reduksi CO₂.' },
        { no: '3', actor: 'Menu Reports', text: 'Memilih rentang tanggal (Hari Ini, 7 Hari, 30 Hari, atau Kustom).' },
        { no: '4', actor: 'Tombol Unduh', text: 'Klik "Ekspor PDF" untuk dokumen resmi bergrafik JFreeChart atau "Ekspor Excel" untuk file spreadsheet.' }
      ],
      troubleshooting: 'Jika unduhan laporan gagal, pastikan backend Spring Boot port 8081 aktif dan koneksi database PostgreSQL stabil.',
      businessRules: 'Setiap aksi pengunduhan laporan dicatat ke dalam tabel log_audit_laporan untuk keperluan audit kepatuhan.'
    }
  ];

  // Memfilter daftar use case berdasarkan kategori yang aktif dan kata kunci pencarian
  const filteredList = panduanList.filter((item) => {
    // Evaluasi kecocokan kategori tab
    const matchesCategory =
      activeCategory === 'ALL' ? true :
      activeCategory === 'ENTRY' ? item.category === 'ENTRY' :
      activeCategory === 'EXIT' ? item.category === 'EXIT' :
      activeCategory === 'OPS' ? (item.category === 'OPS' || item.category === 'IOT' || item.category === 'NAVIGATION') :
      activeCategory === 'MGMT' ? item.category === 'MGMT' : true;

    // Evaluasi kecocokan teks pencarian pada ID, judul, ringkasan, atau aktor
    const matchesSearch =
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.actors.toLowerCase().includes(searchQuery.toLowerCase());

    // Mengembalikan true jika kedua kriteria terpenuhi
    return matchesCategory && matchesSearch;
  });

  // Mengembalikan elemen JSX antarmuka pusat bantuan dan SOP
  return (
    // Membungkus halaman dengan kerangka AppLayout
    <AppLayout breadcrumb="Pusat Bantuan & SOP" status="IoT Operational">
      {/* Wadah isi utama halaman dengan batas lebar maksimum */}
      <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6">

        {/* Banner header modul panduan SOP */}
        <div className="bg-gradient-to-r from-surface-container-low via-surface-container to-surface-container-low p-6 rounded-2xl border border-surface-container flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[24px]">menu_book</span>
              </div>
              <h1 className="text-2xl font-bold text-on-surface">Panduan Pengoperasian Sistem (SOP)</h1>
            </div>
            <p className="text-sm text-on-surface-variant font-mono">
              Dokumentasi resmi alur operasional Sistem Parkir Cerdas Terintegrasi IoT berdasarkan Narasi Use Case PK-UC001 s.d. PK-UC010.
            </p>
          </div>

          {/* Lencana penanda standar dokumen Blueprint Tahap V */}
          <div className="flex items-center gap-2 bg-surface-container-highest/60 px-4 py-2 rounded-xl border border-outline-variant">
            <span className="material-symbols-outlined text-primary text-[20px]">verified_user</span>
            <div className="text-left font-mono">
              <span className="text-[10px] text-text-muted uppercase block leading-none">Standar Dokumen</span>
              <span className="text-xs font-bold text-on-surface">RPL Tahap V (BluePrint)</span>
            </div>
          </div>
        </div>

        {/* Panel filter kategori dan kotak input pencarian */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-surface-container-low p-4 rounded-xl border border-surface-container">
          {/* Tab penyaring kelompok alur */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {[
              { id: 'ALL', label: 'Semua Use Case (10)', icon: 'list_alt' },
              { id: 'ENTRY', label: 'Gerbang Masuk', icon: 'login' },
              { id: 'EXIT', label: 'Gerbang Keluar', icon: 'logout' },
              { id: 'OPS', label: 'Operasional Lapangan & IoT', icon: 'sensors' },
              { id: 'MGMT', label: 'Manajemen & Analitik', icon: 'bar_chart' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Kotak pencarian interaktif */}
          <div className="relative w-full md:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Cari use case atau kata kunci..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline rounded-lg pl-9 pr-3 py-1.5 text-xs text-on-surface font-mono outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Daftar kartu narasi use case dengan mode akordion */}
        <div className="flex flex-col gap-4">
          {/* Looping untuk menampilkan setiap use case */}
          {filteredList.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isExpanded
                    ? 'bg-surface-container-low border-primary/60 shadow-lg'
                    : 'bg-surface-container-lowest border-surface-container hover:border-surface-variant'
                }`}
              >
                {/* Header kartu akordion (dapat diklik untuk toggle ekspansi) */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-surface-container-highest border border-outline-variant text-primary">
                      {item.id}
                    </span>
                    <div>
                      <h2 className="text-base font-bold text-on-surface">{item.title}</h2>
                      <p className="text-xs text-text-muted font-mono mt-0.5">{item.summary}</p>
                    </div>
                  </div>

                  {/* Lencana status dan ikon panah dropdown */}
                  <div className="flex items-center gap-3 self-end md:self-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                    <span className={`material-symbols-outlined text-[20px] transition-transform duration-200 text-on-surface-variant ${
                      isExpanded ? 'rotate-180 text-primary' : ''
                    }`}>
                      expand_more
                    </span>
                  </div>
                </div>

                {/* Konten detail langkah saat kartu akordion dibuka */}
                {isExpanded && (
                  <div className="px-5 pb-6 border-t border-surface-container pt-5 space-y-6">

                    {/* Metadata aktor yang terlibat */}
                    <div className="p-3 rounded-xl bg-surface-container border border-surface-variant flex items-center gap-2 text-xs font-mono">
                      <span className="material-symbols-outlined text-primary text-[18px]">group</span>
                      <span className="text-on-surface-variant">Aktor yang Terlibat:</span>
                      <span className="text-on-surface font-semibold">{item.actors}</span>
                    </div>

                    {/* Daftar langkah alur kerja standar (Step-by-step) */}
                    <div>
                      <h3 className="text-xs font-bold font-mono text-on-surface uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-eco-success text-[18px]">format_list_numbered</span>
                        Alur Langkah Standar (Typical Course of Events):
                      </h3>
                      <div className="grid grid-cols-1 gap-2">
                        {item.steps.map((step) => (
                          <div
                            key={step.no}
                            className="flex items-start gap-3 p-3 rounded-xl bg-surface-container border border-surface-variant text-xs"
                          >
                            <span className="w-5 h-5 rounded-full bg-primary/20 text-primary font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {step.no}
                            </span>
                            <div className="flex-1 font-mono">
                              <span className="text-primary font-semibold mr-2">[{step.actor}]</span>
                              <span className="text-on-surface">{step.text}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Informasi solusi troubleshooting dan kepatuhan aturan bisnis */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Kotak penanganan kendala (Troubleshooting) */}
                      <div className="p-4 rounded-xl bg-alert-anomaly/10 border border-alert-anomaly/30 space-y-1.5">
                        <div className="flex items-center gap-2 text-alert-anomaly font-bold text-xs font-mono">
                          <span className="material-symbols-outlined text-[18px]">help_outline</span>
                          Solusi Kendala & Alur Alternatif:
                        </div>
                        <p className="text-xs text-on-surface font-mono leading-relaxed">
                          {item.troubleshooting}
                        </p>
                      </div>

                      {/* Kotak aturan bisnis (Business Rules) */}
                      <div className="p-4 rounded-xl bg-surface-container border border-surface-variant space-y-1.5">
                        <div className="flex items-center gap-2 text-system-info font-bold text-xs font-mono">
                          <span className="material-symbols-outlined text-[18px]">rule</span>
                          Aturan Bisnis & Kepatuhan:
                        </div>
                        <p className="text-xs text-on-surface font-mono leading-relaxed">
                          {item.businessRules}
                        </p>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}

          {/* Kondisi saat tidak ada use case yang cocok dengan pencarian */}
          {filteredList.length === 0 && (
            <div className="p-12 text-center bg-surface-container-low rounded-2xl border border-surface-container">
              <span className="material-symbols-outlined text-[48px] text-text-muted mb-2 block">search_off</span>
              <p className="text-sm font-mono text-on-surface-variant">Tidak ada use case yang cocok dengan kata kunci "{searchQuery}".</p>
            </div>
          )}
        </div>

      </div>
    </AppLayout>
  );
}
