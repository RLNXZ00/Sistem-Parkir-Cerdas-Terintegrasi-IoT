// Import hook useState dari pustaka react untuk penanganan state lokal antarmuka
import { useState } from 'react';
// Import komponen AppLayout sebagai kerangka tata letak halaman standar SPCT
import AppLayout from '../components/AppLayout';
// Import hook useLanguage untuk mendukung alih bahasa antarmuka (ID/EN)
import { useLanguage } from '../context/LanguageContext';

// Deklarasi fungsi komponen publik PanduanPage untuk petunjuk operasional dan SOP sistem parkir
export default function PanduanPage() {
  // Mengambil bahasa aktif lang dan helper terjemahan t dari LanguageContext
  const { lang, t } = useLanguage();
  // Inisialisasi state activeCategory bertipe string dengan nilai awal 'ALL' untuk tab filter SOP
  const [activeCategory, setActiveCategory] = useState('ALL');
  // Inisialisasi state searchQuery bertipe string untuk kata kunci pencarian prosedur
  const [searchQuery, setSearchQuery] = useState('');
  // Inisialisasi state expandedId bertipe string dengan nilai default 'PK-UC001' untuk akordion yang terbuka awal
  const [expandedId, setExpandedId] = useState('PK-UC001');

  // Basis data Narasi Use Case dari dokumen Blueprint RPL (Tahap_V_SistemParkirCerdas.pdf) dengan dukungan dwibahasa ID/EN
  const panduanList = [
    {
      id: 'PK-UC001',
      title: lang === 'id' ? 'Mendeteksi Plat & Klasifikasi Kendaraan' : 'License Plate Recognition & Vehicle Classification',
      category: 'ENTRY',
      badge: lang === 'id' ? 'Alur Gerbang Masuk' : 'Entry Gate Flow',
      badgeColor: 'bg-eco-success/20 text-eco-success border-eco-success/40',
      actors: lang === 'id' ? 'Pengendara, Kamera ANPR Gerbang, AI Vision Engine' : 'Driver, Gate ANPR Camera, AI Vision Engine',
      summary: lang === 'id'
        ? 'Proses identifikasi otomatis nomor polisi dan jenis kendaraan di gerbang masuk via YOLOv11 + OCR.'
        : 'Automated identification of license plates and vehicle types at the entry gate via YOLOv11 + OCR.',
      steps: [
        { no: '1', actor: lang === 'id' ? 'Pengendara' : 'Driver', text: lang === 'id' ? 'Menghentikan kendaraan tepat di depan garis henti terminal gerbang masuk.' : 'Stops the vehicle right at the entry gate terminal stop line.' },
        { no: '2', actor: lang === 'id' ? 'Pengendara' : 'Driver', text: lang === 'id' ? 'Menekan tombol hijau pada terminal kios masuk.' : 'Presses the green button on the entry kiosk terminal.' },
        { no: '3', actor: lang === 'id' ? 'Kamera ANPR' : 'ANPR Camera', text: lang === 'id' ? 'Menangkap citra plat nomor resolusi tinggi secara otomatis.' : 'Automatically captures high-resolution license plate imagery.' },
        { no: '4', actor: lang === 'id' ? 'AI YOLOv11' : 'YOLOv11 AI', text: lang === 'id' ? 'Mengekstrak karakter string plat dan memvalidasi kejelasan nomor (< 3 detik).' : 'Extracts plate characters and validates legibility (< 3 seconds).' },
        { no: '5', actor: lang === 'id' ? 'Sistem Backend' : 'Backend System', text: lang === 'id' ? 'Mencatat timestamp masuk dan memanggil alokasi slot kosong (PK-UC002).' : 'Logs entry timestamp and triggers smart slot allocation (PK-UC002).' }
      ],
      troubleshooting: lang === 'id'
        ? 'Jika plat kotor atau tidak terbaca, layar terminal meminta pengendara memajukan kendaraan sedikit atau menekan tombol panggil bantuan ke petugas pos.'
        : 'If the plate is dirty or unreadable, the screen prompts the driver to move slightly forward or call operator assistance.',
      businessRules: lang === 'id'
        ? 'Pengendara wajib memilih gerbang sesuai jenis kendaraan (Jalur Mobil vs Jalur Motor) untuk memastikan alokasi slot yang tepat.'
        : 'Drivers must choose the appropriate lane (Car vs Motorcycle) to ensure accurate slot allocation.'
    },
    {
      id: 'PK-UC002',
      title: lang === 'id' ? 'Mencari & Mengalokasikan Slot Parkir Cerdas' : 'Intelligent Parking Slot Search & Allocation',
      category: 'ENTRY',
      badge: lang === 'id' ? 'Alokasi Algoritma' : 'Allocation Algorithm',
      badgeColor: 'bg-system-info/20 text-system-info border-system-info/40',
      actors: lang === 'id' ? 'Sistem Backend, Terminal Kios Gerbang, Layar Panduan' : 'Backend System, Gate Kiosk Terminal, Route Screen',
      summary: lang === 'id'
        ? 'Sistem mencari slot parkir basement yang masih KOSONG terdekat dan mengubah statusnya menjadi DIPESAN.'
        : 'System locates the closest EMPTY basement slot and updates its status to RESERVED.',
      steps: [
        { no: '1', actor: lang === 'id' ? 'Sistem Backend' : 'Backend System', text: lang === 'id' ? 'Memeriksa ketersediaan slot parkir multi-lantai secara real-time.' : 'Checks real-time multi-floor parking slot availability.' },
        { no: '2', actor: lang === 'id' ? 'Algoritma Graf A*' : 'A* Graph Algorithm', text: lang === 'id' ? 'Memilih slot kosong terdekat dengan pintu akses basement.' : 'Selects the closest available slot to the basement entrance.' },
        { no: '3', actor: 'Database', text: lang === 'id' ? 'Mengubah status slot terpilih menjadi DIPESAN agar tidak diserobot pengendara lain.' : 'Marks the selected slot as RESERVED to prevent double allocation.' },
        { no: '4', actor: lang === 'id' ? 'Terminal Kios' : 'Kiosk Terminal', text: lang === 'id' ? 'Mengarahkan pengendara ke halaman denah navigasi visual (PK-UC003).' : 'Directs the driver to the visual route guidance map (PK-UC003).' },
        { no: '5', actor: lang === 'id' ? 'Sistem Gerbang' : 'Gate System', text: lang === 'id' ? 'Membuka palang pintu gerbang masuk secara otomatis.' : 'Automatically opens the entry barrier gate.' }
      ],
      troubleshooting: lang === 'id'
        ? 'Jika seluruh slot berstatus TERISI/DIPESAN (penuh), palang gerbang tidak terbuka dan menampilkan status "Parkir Penuh".'
        : 'If all slots are OCCUPIED/RESERVED, the barrier remains closed and displays "Parking Full".',
      businessRules: lang === 'id'
        ? 'Slot yang berstatus DIPESAN memiliki batas waktu toleransi perjalanan (Grace Period Reservasi) sebelum dianggap kedaluwarsa.'
        : 'RESERVED slots have a travel grace period before expiring.'
    },
    {
      id: 'PK-UC003',
      title: lang === 'id' ? 'Menampilkan Panduan Rute Denah Visual' : 'Visual Route Map Guidance Display',
      category: 'NAVIGATION',
      badge: lang === 'id' ? 'Navigasi Kiosk' : 'Kiosk Navigation',
      badgeColor: 'bg-primary/20 text-primary border-primary/40',
      actors: lang === 'id' ? 'Pengendara, Terminal Kios Pengendara' : 'Driver, Driver Kiosk Terminal',
      summary: lang === 'id'
        ? 'Memberikan panduan arah belokan dan kode slot target (misal B1-05) pada layar sentuh kios sebagai pengganti karcis kertas.'
        : 'Provides turn-by-turn guidance and assigned slot code (e.g., B1-05) on the touchscreen kiosk instead of paper tickets.',
      steps: [
        { no: '1', actor: lang === 'id' ? 'Terminal Kios' : 'Kiosk Terminal', text: lang === 'id' ? 'Menampilkan denah interaktif Basement lengkap dengan nomor slot dan rute garis hijau.' : 'Displays an interactive basement map with slot IDs and a highlighted green route.' },
        { no: '2', actor: lang === 'id' ? 'Pengendara' : 'Driver', text: lang === 'id' ? 'Mengingat atau memindai kode slot yang dialokasikan di layar kiosk.' : 'Notes or scans the assigned slot ID displayed on the kiosk screen.' },
        { no: '3', actor: lang === 'id' ? 'Pengendara' : 'Driver', text: lang === 'id' ? 'Melajukan kendaraan menuju area basement mengikuti tanda panah arah rute.' : 'Drives into the basement following directional route arrows.' }
      ],
      troubleshooting: lang === 'id'
        ? 'Pengendara dapat melihat papan petunjuk fisik di dalam basement jika lupa nomor slot yang dialokasikan di kios gerbang.'
        : 'Drivers may check physical overhead signs inside the basement if they forget their assigned slot number.',
      businessRules: lang === 'id'
        ? 'Sistem SPCT mengusung konsep paperless 100%, menghilangkan penggunaan tiket kertas konvensional.'
        : 'SPCT operates 100% paperless, eliminating conventional thermal paper tickets.'
    },
    {
      id: 'PK-UC004',
      title: lang === 'id' ? 'Pemantauan Okupansi Slot Fisik via IoT' : 'Physical Slot Occupancy Monitoring via IoT',
      category: 'IOT',
      badge: lang === 'id' ? 'Telemetri IoT' : 'IoT Telemetry',
      badgeColor: 'bg-[#ffd700]/20 text-[#ffd700] border-yellow-700/40',
      actors: lang === 'id' ? 'Sensor Ultrasonik, Broker Telemetri, Web Dashboard' : 'Ultrasonic Sensors, Telemetry Broker, Web Dashboard',
      summary: lang === 'id'
        ? 'Sensor mendeteksi keberadaan kendaraan fisik pada slot dan mencatat waktu tiba untuk kalkulasi reduksi emisi CO₂.'
        : 'Sensors detect physical vehicle presence in slots and record arrival timestamps for CO₂ emission reduction metrics.',
      steps: [
        { no: '1', actor: lang === 'id' ? 'Kendaraan' : 'Vehicle', text: lang === 'id' ? 'Masuk dan berhenti tepat di dalam area slot yang dialokasikan.' : 'Enters and stops squarely inside the assigned parking slot.' },
        { no: '2', actor: lang === 'id' ? 'Sensor IoT' : 'IoT Sensor', text: lang === 'id' ? 'Mendeteksi jarak pantulan ultrasonik stabil (< 50 cm) selama minimal 4 detik.' : 'Detects stable ultrasonic reflection (< 50 cm) for at least 4 seconds.' },
        { no: '3', actor: lang === 'id' ? 'Sistem Backend' : 'Backend System', text: lang === 'id' ? 'Menerima sinyal telemetri dan mengubah status slot dari DIPESAN menjadi TERISI.' : 'Receives telemetry and updates slot status from RESERVED to OCCUPIED.' },
        { no: '4', actor: lang === 'id' ? 'Kalkulator Eco' : 'Eco Calculator', text: lang === 'id' ? 'Mencatat waktuTibaSlot dan menghitung menitDihemat untuk kalkulasi reduksi polusi CO₂.' : 'Records arrival time and computes minutes saved for CO₂ pollution reduction.' }
      ],
      troubleshooting: lang === 'id'
        ? 'Jika sensor mendeteksi objek namun tidak ada kendaraan yang terdaftar (penyerobotan), sistem otomatis mencatat peringatan anomali (PK-UC005).'
        : 'If an unallocated vehicle occupies a slot, the system automatically logs an anomaly alert (PK-UC005).',
      businessRules: lang === 'id'
        ? 'Filter debounce 4 detik diterapkan agar orang yang lewat atau berdiri sesaat tidak menyebabkan perubahan status slot.'
        : 'A 4-second debounce filter prevents passing pedestrians from triggering false slot occupancy.'
    },
    {
      id: 'PK-UC005',
      title: lang === 'id' ? 'Deteksi Anomali & Peringatan Salah Parkir' : 'Anomaly Detection & Misplacement Alert',
      category: 'OPS',
      badge: lang === 'id' ? 'Operasional Lapangan' : 'Field Operations',
      badgeColor: 'bg-alert-anomaly/20 text-alert-anomaly border-alert-anomaly/40',
      actors: lang === 'id' ? 'Sistem Backend, Petugas Lapangan' : 'Backend System, Field Officer',
      summary: lang === 'id'
        ? 'Penanganan insiden salah tempat parkir, sensor offline, atau ketidaksesuaian status di basement.'
        : 'Handling misplaced vehicles, offline sensors, or slot status discrepancies in the basement.',
      steps: [
        { no: '1', actor: lang === 'id' ? 'Sistem Deteksi' : 'Detection Engine', text: lang === 'id' ? 'Mendeteksi status slot anomali (misal sensor terisi di luar slot alokasi).' : 'Detects anomalous slot states (e.g., unauthorized occupancy outside allocation).' },
        { no: '2', actor: 'Dashboard', text: lang === 'id' ? 'Memunculkan kartu berkedip merah (pulse alert) pada panel Active Alerts.' : 'Triggers a pulsing red alert card in the Active Alerts panel.' },
        { no: '3', actor: lang === 'id' ? 'Petugas Lapangan' : 'Field Officer', text: lang === 'id' ? 'Membuka menu Anomaly Logs, memeriksa slot fisik di basement atau via Gate Live Feed.' : 'Opens Anomaly Logs and verifies the slot physically or via Gate Live Feed.' },
        { no: '4', actor: lang === 'id' ? 'Petugas Lapangan' : 'Field Officer', text: lang === 'id' ? 'Melakukan validasi lapangan dan memperbarui status tiket menjadi SELESAI_DIVALIDASI.' : 'Completes field validation and marks the incident as VALIDATED.' }
      ],
      troubleshooting: lang === 'id'
        ? 'Petugas dapat memindahkan kendaraan yang salah slot secara persuasif untuk mencegah efek domino saat gerbang keluar.'
        : 'Officers may persuasively relocate misplaced vehicles to prevent exit gate conflicts.',
      businessRules: lang === 'id'
        ? 'Setiap anomali tingkat CRITICAL wajib ditangani sebelum laporan operasional harian ditutup.'
        : 'All CRITICAL anomalies must be resolved before daily operational shift closure.'
    },
    {
      id: 'PK-UC006',
      title: lang === 'id' ? 'Menghitung Durasi & Tarif Parkir Gerbang Keluar' : 'Exit Gate Duration & Fee Calculation',
      category: 'EXIT',
      badge: lang === 'id' ? 'Alur Gerbang Keluar' : 'Exit Gate Flow',
      badgeColor: 'bg-eco-success/20 text-eco-success border-eco-success/40',
      actors: lang === 'id' ? 'Pengendara, Kamera ANPR Keluar, Sistem Transaksi' : 'Driver, Exit ANPR Camera, Transaction Engine',
      summary: lang === 'id'
        ? 'Kamera keluar membaca plat nomor kendaraan dan backend menghitung total durasi serta nominal tagihan.'
        : 'Exit camera scans the license plate and the backend calculates total parking duration and fee.',
      steps: [
        { no: '1', actor: lang === 'id' ? 'Pengendara' : 'Driver', text: lang === 'id' ? 'Menghentikan kendaraan di terminal gerbang keluar.' : 'Stops the vehicle at the exit gate terminal.' },
        { no: '2', actor: lang === 'id' ? 'Kamera Keluar' : 'Exit Camera', text: lang === 'id' ? 'Memindai plat nomor dan mencocokkan dengan transaksi parkir aktif di database.' : 'Scans plate and matches the active parking transaction in the database.' },
        { no: '3', actor: lang === 'id' ? 'Sistem Tagihan' : 'Billing Engine', text: lang === 'id' ? 'Menghitung durasiTotalMenit = waktuKeluar - waktuMasuk.' : 'Computes total duration minutes = exitTime - entryTime.' },
        { no: '4', actor: lang === 'id' ? 'Aturan Bisnis' : 'Business Rules', text: lang === 'id' ? 'Jika durasi ≤ 10 menit (Grace Period Drop-Off), tagihan otomatis Rp 0 (LUNAS).' : 'If duration ≤ 10 minutes (Grace Period), fee is Rp 0 (FREE).' },
        { no: '5', actor: lang === 'id' ? 'Layar Kiosk' : 'Kiosk Screen', text: lang === 'id' ? 'Menampilkan rincian waktu parkir dan QRIS pembayaran digital (PK-UC007).' : 'Displays duration breakdown and dynamic QRIS checkout (PK-UC007).' }
      ],
      troubleshooting: lang === 'id'
        ? 'Jika data transaksi masuk tidak ditemukan karena OCR gerbang masuk sebelumnya bermasalah, sistem memanggil petugas pos keluar.'
        : 'If no entry record matches, the terminal alerts the exit booth operator for manual verification.',
      businessRules: lang === 'id'
        ? 'Tarif mengikuti aturan resmi: ≤ 10 mnt Rp 0, ≤ 8 jam flat Rp 5.000, jam ke 9–12 +Rp 2.000/jam, > 12 jam maksimal Rp 10.000.'
        : 'Official tariff applies: ≤ 10m Rp 0, ≤ 8h flat Rp 5,000, hours 9–12 +Rp 2,000/hr, > 12h capped at Rp 10,000.'
    },
    {
      id: 'PK-UC007',
      title: lang === 'id' ? 'Proses Pembayaran Nirkontak (Cashless Gateway)' : 'Contactless Cashless Payment Processing',
      category: 'EXIT',
      badge: lang === 'id' ? 'Pembayaran Digital' : 'Digital Payment',
      badgeColor: 'bg-system-info/20 text-system-info border-system-info/40',
      actors: lang === 'id' ? 'Pengendara, Kios Gerbang Keluar, Payment Gateway' : 'Driver, Exit Kiosk, Payment Gateway',
      summary: lang === 'id'
        ? 'Pembayaran non-tunai via scan QRIS dinamis atau kartu E-Toll pada terminal keluar.'
        : 'Cashless payment via dynamic QRIS scan or E-Toll card tap at the exit kiosk.',
      steps: [
        { no: '1', actor: lang === 'id' ? 'Pengendara' : 'Driver', text: lang === 'id' ? 'Memilih metode pembayaran (QRIS atau E-Toll) pada layar terminal.' : 'Selects payment method (QRIS or E-Toll) on the kiosk screen.' },
        { no: '2', actor: lang === 'id' ? 'Pengendara' : 'Driver', text: lang === 'id' ? 'Melakukan scan barcode QRIS menggunakan mobile banking / e-wallet.' : 'Scans the QRIS barcode using a mobile banking or e-wallet app.' },
        { no: '3', actor: 'Payment Gateway', text: lang === 'id' ? 'Mengirimkan sinyal callback bahwa transaksi berhasil lunas.' : 'Sends webhook callback confirming payment settlement.' },
        { no: '4', actor: lang === 'id' ? 'Sistem Backend' : 'Backend System', text: lang === 'id' ? 'Memperbarui status pembayaran menjadi LUNAS dan slot asal menjadi KOSONG.' : 'Marks payment as PAID and releases the occupied slot back to EMPTY.' }
      ],
      troubleshooting: lang === 'id'
        ? 'Jika terjadi kendala koneksi internet pada terminal, sistem dapat beralih ke pembayaran darurat melalui pos petugas.'
        : 'If terminal connectivity drops, the system switches to backup payment at the attendant booth.',
      businessRules: lang === 'id'
        ? 'Sistem tidak menerima uang tunai di gerbang otomatis guna mencegah antrean kemacetan.'
        : 'Automated gates are strictly cashless to prevent exit lane bottlenecks.'
    },
    {
      id: 'PK-UC008',
      title: lang === 'id' ? 'Pembukaan Palang Gerbang Keluar Otomatis' : 'Automated Exit Barrier Gate Opening',
      category: 'EXIT',
      badge: lang === 'id' ? 'Otomasi Palang' : 'Barrier Automation',
      badgeColor: 'bg-eco-success/20 text-eco-success border-eco-success/40',
      actors: lang === 'id' ? 'Sistem Gerbang Keluar, Pengendara' : 'Exit Gate System, Driver',
      summary: lang === 'id'
        ? 'Palang pintu gerbang terbuka segera setelah status pembayaran diverifikasi LUNAS.'
        : 'Exit barrier gate opens automatically once payment status is verified as PAID.',
      steps: [
        { no: '1', actor: lang === 'id' ? 'Sistem Gerbang' : 'Gate System', text: lang === 'id' ? 'Memvalidasi status transaksi parkir telah LUNAS atau GRACE_PERIOD.' : 'Validates that transaction status is PAID or GRACE_PERIOD_FREE.' },
        { no: '2', actor: lang === 'id' ? 'Motor Servo Palang' : 'Gate Servo Motor', text: lang === 'id' ? 'Mengangkat palang pintu gerbang keluar secara otomatis.' : 'Lifts the exit barrier arm automatically.' },
        { no: '3', actor: lang === 'id' ? 'Pengendara' : 'Driver', text: lang === 'id' ? 'Melajukan kendaraan meninggalkan area parkir fasilitas.' : 'Drives the vehicle out of the parking premises.' },
        { no: '4', actor: lang === 'id' ? 'Sensor Loop Keluar' : 'Exit Loop Sensor', text: lang === 'id' ? 'Mendeteksi kendaraan telah lewat dan menurunkan kembali palang gerbang.' : 'Detects vehicle clearance and lowers the barrier gate.' }
      ],
      troubleshooting: lang === 'id'
        ? 'Tersedia tombol manual bypass palang gerbang untuk kondisi darurat kebakaran atau evakuasi bencana.'
        : 'A manual barrier bypass switch is available for emergency evacuation situations.',
      businessRules: lang === 'id'
        ? 'Palang tidak akan terbuka jika status transaksi belum tercatat lunas.'
        : 'The exit barrier will remain closed until transaction settlement is recorded.'
    },
    {
      id: 'PK-UC009',
      title: lang === 'id' ? 'Pemantauan Kondisi Real-Time (Command Center)' : 'Real-Time Operations Monitoring (Command Center)',
      category: 'OPS',
      badge: lang === 'id' ? 'Petugas Lapangan' : 'Field Officer',
      badgeColor: 'bg-primary/20 text-primary border-primary/40',
      actors: lang === 'id' ? 'Petugas Lapangan, Web Dashboard' : 'Field Officer, Web Dashboard',
      summary: lang === 'id'
        ? 'Dashboard terpusat untuk memantau denah slot, 4 kamera ANPR, dan log telemetri sensor.'
        : 'Centralized dashboard for monitoring slot maps, 4 ANPR cameras, and IoT sensor telemetry logs.',
      steps: [
        { no: '1', actor: lang === 'id' ? 'Petugas' : 'Officer', text: lang === 'id' ? 'Login menggunakan akun peran PETUGAS_LAPANGAN.' : 'Logs in with PETUGAS_LAPANGAN role credentials.' },
        { no: '2', actor: 'Dashboard', text: lang === 'id' ? 'Menampilkan Peta Slot Real-Time dengan indikator warna (Hijau, Kuning, Merah).' : 'Displays Real-Time Slot Map with semantic color indicators.' },
        { no: '3', actor: 'Live Gate Monitor', text: lang === 'id' ? 'Memantau tangkapan video 4 kamera gerbang (Entry/Exit Mobil dan Motor).' : 'Monitors 4 gate camera feeds (Car & Motorcycle Entry/Exit).' },
        { no: '4', actor: 'Hardware Strip', text: lang === 'id' ? 'Menampilkan status konektivitas unit sensor ultrasonik.' : 'Displays live online/offline connectivity for ultrasonic sensor units.' }
      ],
      troubleshooting: lang === 'id'
        ? 'Data dashboard secara otomatis melakukan sinkronisasi real-time berkala tanpa perlu me-refresh browser (F5).'
        : 'Dashboard data synchronizes periodically without needing manual browser refreshes.',
      businessRules: lang === 'id'
        ? 'Petugas lapangan hanya memiliki akses pemantauan operasional taktis, bukan laporan analitik finansial.'
        : 'Field officers only access tactical operational views; financial analytics are restricted to management.'
    },
    {
      id: 'PK-UC010',
      title: lang === 'id' ? 'Analitik Bisnis & Ekspor Laporan Resmi (PDF/Excel)' : 'Business Analytics & Official Report Export (PDF/Excel)',
      category: 'MGMT',
      badge: lang === 'id' ? 'Manajemen RS' : 'Hospital Management',
      badgeColor: 'bg-[#00BFFF]/20 text-[#00BFFF] border-cyan-700/40',
      actors: lang === 'id' ? 'Manajemen RS / Direksi, Web Dashboard' : 'Hospital Management / Executives, Web Dashboard',
      summary: lang === 'id'
        ? 'Rekapitulasi total pendapatan, tren okupansi kendaraan, penghematan emisi CO₂, dan ekspor berkas.'
        : 'Summary of total revenue, vehicle occupancy trends, CO₂ savings, and official document exports.',
      steps: [
        { no: '1', actor: lang === 'id' ? 'Manajemen' : 'Manager', text: lang === 'id' ? 'Login menggunakan akun peran Manajemen RS atau Admin.' : 'Logs in with Hospital Management or Admin role credentials.' },
        { no: '2', actor: lang === 'id' ? 'Dashboard Manajemen' : 'Management Dashboard', text: lang === 'id' ? 'Melihat Revenue Tracker, Total Transaksi, dan Metrik Reduksi CO₂.' : 'Reviews Revenue Tracker, Vehicle Volume, and CO₂ Reduction metrics.' },
        { no: '3', actor: lang === 'id' ? 'Menu Laporan' : 'Reports Menu', text: lang === 'id' ? 'Memilih rentang tanggal dan jenis laporan (Finansial, Operasional, Lingkungan, Komprehensif).' : 'Selects date range and report type (Financial, Operational, Environmental, Comprehensive).' },
        { no: '4', actor: lang === 'id' ? 'Tombol Unduh' : 'Export Buttons', text: lang === 'id' ? 'Klik "Unduh PDF" untuk dokumen resmi bergrafik atau "Unduh Excel" untuk file spreadsheet.' : 'Clicks "Export PDF" for formatted documents or "Export XLSX" for Excel spreadsheets.' }
      ],
      troubleshooting: lang === 'id'
        ? 'Jika unduhan laporan gagal, pastikan backend Spring Boot port 8081 aktif dan koneksi database PostgreSQL stabil.'
        : 'If report export fails, verify that the Spring Boot backend on port 8081 and PostgreSQL are running.',
      businessRules: lang === 'id'
        ? 'Setiap aksi pengunduhan laporan dicatat ke dalam tabel log_audit_laporan untuk keperluan audit kepatuhan.'
        : 'Every report download action is recorded into log_audit_laporan for compliance auditing.'
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
    // Membungkus halaman dengan kerangka AppLayout dengan breadcrumb terlokalisasi
    <AppLayout breadcrumb={t('topbar.systemGuide', 'Pusat Bantuan & SOP')} status={t('topbar.systemHealthy', 'Sistem Normal')}>
      {/* Wadah isi utama halaman dengan batas lebar maksimum */}
      <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6">

        {/* Banner header modul panduan SOP */}
        <div className="bg-gradient-to-r from-surface-container-low via-surface-container to-surface-container-low p-6 rounded-2xl border border-surface-container flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[24px]">menu_book</span>
              </div>
              <h1 className="text-2xl font-bold text-on-surface">{t('guide.title', 'Panduan Pengoperasian Sistem (SOP)')}</h1>
            </div>
            <p className="text-sm text-on-surface-variant font-mono">
              {t('guide.subtitle', 'Dokumentasi resmi alur operasional Sistem Parkir Cerdas Terintegrasi IoT berdasarkan Narasi Use Case PK-UC001 s.d. PK-UC010.')}
            </p>
          </div>

          {/* Lencana penanda standar dokumen Blueprint Tahap V */}
          <div className="flex items-center gap-2 bg-surface-container-highest/60 px-4 py-2 rounded-xl border border-outline-variant">
            <span className="material-symbols-outlined text-primary text-[20px]">verified_user</span>
            <div className="text-left font-mono">
              <span className="text-[10px] text-text-muted uppercase block leading-none">{t('guide.docStdLabel', 'Standar Dokumen')}</span>
              <span className="text-xs font-bold text-on-surface">{t('guide.docStdValue', 'RPL Tahap V (BluePrint)')}</span>
            </div>
          </div>
        </div>

        {/* Panel filter kategori dan kotak input pencarian */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-surface-container-low p-4 rounded-xl border border-surface-container">
          {/* Tab penyaring kelompok alur */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {[
              { id: 'ALL', label: t('guide.catAll', 'Semua Use Case (10)'), icon: 'list_alt' },
              { id: 'ENTRY', label: t('guide.catEntry', 'Gerbang Masuk'), icon: 'login' },
              { id: 'EXIT', label: t('guide.catExit', 'Gerbang Keluar'), icon: 'logout' },
              { id: 'OPS', label: t('guide.catOps', 'Operasional Lapangan & IoT'), icon: 'sensors' },
              { id: 'MGMT', label: t('guide.catMgmt', 'Manajemen & Analitik'), icon: 'bar_chart' }
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
              placeholder={t('guide.searchPlaceholder', 'Cari use case atau kata kunci...')}
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
                      <span className="text-on-surface-variant">{t('guide.actorsLabel', 'Aktor yang Terlibat:')}</span>
                      <span className="text-on-surface font-semibold">{item.actors}</span>
                    </div>

                    {/* Daftar langkah alur kerja standar (Step-by-step) */}
                    <div>
                      <h3 className="text-xs font-bold font-mono text-on-surface uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-eco-success text-[18px]">format_list_numbered</span>
                        {t('guide.stepsLabel', 'Alur Langkah Standar (Typical Course of Events):')}
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
                          {t('guide.troubleshootingLabel', 'Solusi Kendala & Alur Alternatif:')}
                        </div>
                        <p className="text-xs text-on-surface font-mono leading-relaxed">
                          {item.troubleshooting}
                        </p>
                      </div>

                      {/* Kotak aturan bisnis (Business Rules) */}
                      <div className="p-4 rounded-xl bg-surface-container border border-surface-variant space-y-1.5">
                        <div className="flex items-center gap-2 text-system-info font-bold text-xs font-mono">
                          <span className="material-symbols-outlined text-[18px]">rule</span>
                          {t('guide.businessRulesLabel', 'Aturan Bisnis & Kepatuhan:')}
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
              <p className="text-sm font-mono text-on-surface-variant">{t('guide.emptySearch', 'Tidak ada use case yang cocok dengan kata kunci "{query}".', { query: searchQuery })}</p>
            </div>
          )}
        </div>

      </div>
    </AppLayout>
  );
}
