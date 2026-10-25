// Import hook useState dan useEffect dari React untuk manajemen state reaktif dan efek samping komponen
import { useState, useEffect } from 'react';
// Import komponen tata letak AppLayout dari '../components/AppLayout' sebagai wadah antarmuka utama halaman pengaturan
import AppLayout from '../components/AppLayout';
// Import hook useLanguage dari '../context/LanguageContext' untuk internasionalisasi multi-bahasa (ID/EN)
import { useLanguage } from '../context/LanguageContext';

// Deklarasi fungsi komponen publik SettingsPage untuk mengelola preferensi sistem, akun, tema, dan parameter IoT
export default function SettingsPage() {
  // Inisialisasi state theme bertipe string dengan nilai awal dari localStorage 'spct_theme' atau fallback 'dark'
  const [theme, setTheme] = useState(() => localStorage.getItem('spct_theme') || 'dark');
  // Destrukturisasi kode bahasa aktif lang, fungsi setLanguage, dan fungsi translasi t dari LanguageContext
  const { lang, setLanguage, t } = useLanguage();
  // Inisialisasi state activeTab bertipe string bernilai awal 'account' untuk menandai tab aktif yang sedang dibuka
  const [activeTab, setActiveTab] = useState('account');
  // Inisialisasi state toast bertipe objek/null dengan nilai awal null untuk menampilkan pesan notifikasi mengambang
  const [toast, setToast] = useState(null);

  // Mengambil dan mem-parsing data akun operator yang sedang login dari sessionStorage atau fallback default
  const currentUser = JSON.parse(
    sessionStorage.getItem('spct_user') ||
    '{"username":"petugas01","namaLengkap":"Petugas Lapangan","role":"PETUGAS_LAPANGAN"}'
  );

  // Inisialisasi state settings bertipe objek berisi parameter teknis konfigurasi SPCT IoT dan formulir kata sandi
  const [settings, setSettings] = useState({
    emisiMobilPerDetik: 2.3, // Standar emisi mobil (gram CO2 per detik)
    emisiMotorPerDetik: 0.9, // Standar emisi motor (gram CO2 per detik)
    baselineWaktuMencari: 12, // Waktu dasar pencarian slot parkir konvensional (menit)
    targetReduksiPersen: 65, // Target persentase reduksi emisi karbon (%)
    debounceWaktuDetik: 4, // Durasi debounce filter sensor ultrasonik (detik)
    sensorTimeoutDetik: 15, // Batas waktu timeout heartbeat koneksi sensor (detik)
    autoAlertAnomali: true, // Sakelar otomatisasi pembuatan tiket peringatan anomali
    confidenceThreshold: 80, // Ambang batas minimum keyakinan pembacaan plat nomor OCR (%)
    fallbackManualEntry: true, // Opsi pengaktifan input plat manual jika OCR gagal
    kameraStreamFps: 25, // Kecepatan frame video streaming kamera gerbang (FPS)
    retensiHari: 90, // Kebijakan masa simpan log telemetri di database (hari)
    audioAlarmAnomali: true, // Opsi membunyikan alarm suara saat anomali terdeteksi
    passwordLama: '', // Kolom input kata sandi lama
    passwordBaru: '', // Kolom input kata sandi baru
    konfirmasiPassword: '' // Kolom input konfirmasi kata sandi baru
  });

  // Inisialisasi state sopCategory bertipe string bernilai 'ALL' untuk filter kategori dokumen SOP
  const [sopCategory, setSopCategory] = useState('ALL');
  // Inisialisasi state sopSearch bertipe string bernilai '' untuk kata kunci pencarian dokumen use case SOP
  const [sopSearch, setSopSearch] = useState('');
  // Inisialisasi state expandedSopId bertipe string bernilai 'PK-UC001' untuk akordion kartu SOP yang sedang terbuka
  const [expandedSopId, setExpandedSopId] = useState('PK-UC001');

  // Inisialisasi state showNewPassword bertipe boolean bernilai awal false untuk sakelar intip kata sandi baru
  const [showNewPassword, setShowNewPassword] = useState(false);
  // Inisialisasi state showConfirmPassword bertipe boolean bernilai awal false untuk sakelar intip konfirmasi kata sandi
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Deklarasi fungsi handleThemeChange untuk mengubah tema tampilan dan menyinkronkannya ke DOM dan localStorage
  const handleThemeChange = (newTheme) => {
    // Perbarui nilai state theme
    setTheme(newTheme);
    // Simpan pilihan tema ke penyimpanan lokal peramban (localStorage)
    localStorage.setItem('spct_theme', newTheme);
    // Jika tema yang dipilih adalah tema terang, tambahkan kelas 'light-theme' pada elemen root HTML
    if (newTheme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      // Jika tema gelap, hapus kelas 'light-theme' dari elemen root HTML
      document.documentElement.classList.remove('light-theme');
    }
    // Tampilkan notifikasi toast umpan balik perubahan tema dalam bahasa yang sesuai
    showToast(
      lang === 'id'
        ? `Tema berhasil diubah ke ${newTheme === 'light' ? 'Cerah (Light Mode)' : 'Gelap (Dark Mode)'}`
        : `Theme successfully changed to ${newTheme === 'light' ? 'Light Mode' : 'Dark Mode'}`
    );
  };

  // Deklarasi fungsi handleLanguageChange untuk memperbarui bahasa operasional sistem
  const handleLanguageChange = (newLang) => {
    // Panggil fungsi setLanguage dari LanguageContext
    setLanguage(newLang);
    // Tampilkan notifikasi toast konfirmasi perubahan bahasa antarmuka
    showToast(
      newLang === 'id' ? 'Bahasa berhasil diubah ke Bahasa Indonesia' : 'Language changed to English'
    );
  };

  // Hook useEffect untuk memuat preferensi parameter teknis tersimpan dari localStorage saat halaman pertama kali dibuka
  useEffect(() => {
    // Ambil string JSON konfigurasi dari localStorage
    const saved = localStorage.getItem('spct_system_settings');
    // Jika data konfigurasi ditemukan, parsing dan gabungkan ke dalam state settings
    if (saved) {
      try {
        setSettings(prev => ({ ...prev, ...JSON.parse(saved) }));
      } catch (err) {
        // Cetak pesan kesalahan ke konsol jika format JSON rusak
        console.error('Gagal parsing settings lokal:', err);
      }
    }
  }, []); // Array dependensi kosong menandakan efek hanya berjalan sekali pada saat inisialisasi

  // Deklarasi fungsi showToast untuk menampilkan pesan banner pop-up selama 3.5 detik
  const showToast = (message, type = 'success') => {
    // Simpan pesan dan jenis notifikasi (success, error, info) ke state toast
    setToast({ message, type });
    // Atur timer untuk menghilangkan pesan toast secara otomatis setelah 3500 milidetik
    setTimeout(() => setToast(null), 3500);
  };

  // Deklarasi fungsi handleInputChange untuk memperbarui nilai properti tertentu pada state settings
  const handleInputChange = (field, val) => {
    setSettings(prev => ({ ...prev, [field]: val }));
  };

  // Deklarasi fungsi handleSaveSettings untuk menyimpan seluruh konfigurasi parameter teknis ke localStorage
  const handleSaveSettings = (e) => {
    // Mencegah perilaku reload bawaan formulir HTML jika dipicu oleh event submit
    e?.preventDefault();
    // Simpan objek settings ke localStorage dalam format string JSON
    localStorage.setItem('spct_system_settings', JSON.stringify(settings));
    // Tampilkan toast konfirmasi keberhasilan penyimpanan
    showToast(
      lang === 'id'
        ? 'Konfigurasi pengaturan berhasil disimpan ke sistem!'
        : 'System configuration settings saved successfully!'
    );
  };

  // Deklarasi fungsi handleResetDefault untuk mengembalikan seluruh parameter teknis ke setelan standar pabrik
  const handleResetDefault = () => {
    // Siapkan teks dialog konfirmasi bilingual
    const confirmMsg = lang === 'id'
      ? 'Kembalikan seluruh parameter teknis ke setelan standar pabrik (default)?'
      : 'Reset all technical parameters to factory defaults?';

    // Tampilkan jendela konfirmasi peramban
    if (window.confirm(confirmMsg)) {
      // Hapus data kustom pengaturan dari localStorage
      localStorage.removeItem('spct_system_settings');
      // Kembalikan nilai state settings ke default pabrik
      setSettings(prev => ({
        ...prev,
        emisiMobilPerDetik: 2.3,
        emisiMotorPerDetik: 0.9,
        baselineWaktuMencari: 12,
        targetReduksiPersen: 65,
        debounceWaktuDetik: 4,
        sensorTimeoutDetik: 15,
        confidenceThreshold: 80,
        retensiHari: 90,
        audioAlarmAnomali: true
      }));
      // Tampilkan toast informasi bahwa pengaturan telah di-reset
      showToast(lang === 'id' ? 'Pengaturan telah di-reset ke nilai default.' : 'Settings restored to default.', 'info');
    }
  };

  // Deklarasi fungsi asinkron handleGantiPassword untuk validasi dan pengiriman pembaruan kata sandi akun ke backend
  const handleGantiPassword = async (e) => {
    // Mencegah reload halaman bawaan formulir
    e.preventDefault();
    // Validasi apakah kata sandi baru dan konfirmasinya telah diisi
    if (!settings.passwordBaru || !settings.konfirmasiPassword) {
      showToast(lang === 'id' ? 'Password baru dan konfirmasi wajib diisi!' : 'New password and confirmation are required!', 'error');
      return;
    }
    // Validasi panjang minimum kata sandi minimal 8 karakter
    if (settings.passwordBaru.length < 8) {
      showToast(lang === 'id' ? 'Kata sandi minimal 8 karakter!' : 'Password must be at least 8 characters!', 'error');
      return;
    }
    // Validasi keberadaan kombinasi angka pada kata sandi baru menggunakan regex
    if (!/\d/.test(settings.passwordBaru)) {
      showToast(lang === 'id' ? 'Kata sandi harus mengandung kombinasi angka!' : 'Password must contain a number combination!', 'error');
      return;
    }
    // Validasi keberadaan simbol atau karakter khusus pada kata sandi baru menggunakan regex
    if (!/[^A-Za-z0-9]/.test(settings.passwordBaru)) {
      showToast(lang === 'id' ? 'Kata sandi harus mengandung kombinasi karakter khusus!' : 'Password must contain special characters!', 'error');
      return;
    }
    // Validasi kecocokan antara kata sandi baru dan konfirmasinya
    if (settings.passwordBaru !== settings.konfirmasiPassword) {
      showToast(lang === 'id' ? 'Konfirmasi password tidak cocok!' : 'Password confirmation does not match!', 'error');
      return;
    }

    // Blok try-catch untuk mengirim permintaan HTTP POST pembaruan kata sandi ke backend
    try {
      const res = await fetch('http://localhost:8081/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUser.username,
          passwordBaru: settings.passwordBaru
        })
      });

      // Parsing respon JSON dari backend
      const data = await res.json().catch(() => null);

      // Jika server mengembalikan status sukses (200 OK)
      if (res.ok) {
        showToast(data?.pesan || (lang === 'id' ? 'Kata sandi berhasil diperbarui!' : 'Password updated successfully!'), 'success');
        // Kosongkan kembali kolom isian kata sandi pada state
        setSettings(prev => ({ ...prev, passwordLama: '', passwordBaru: '', konfirmasiPassword: '' }));
      } else {
        // Tampilkan pesan error dari server jika gagal
        showToast(data?.pesan || (lang === 'id' ? 'Gagal mengubah password di server.' : 'Failed to update password on server.'), 'error');
      }
    } catch {
      // Tangani kondisi server backend tidak dapat dihubungi
      showToast(lang === 'id' ? 'Server backend offline, perubahan belum tersinkronisasi.' : 'Backend offline, changes pending.', 'error');
    }
  };

  // Deklarasi array dokumen SOP terintegrasi berisi 10 narasi Use Case resmi (PK-UC001 sampai PK-UC010)
  const panduanList = [
    {
      id: 'PK-UC001',
      title: lang === 'id' ? 'Mendeteksi Plat & Klasifikasi Kendaraan' : 'License Plate Recognition & Vehicle Classification',
      category: 'ENTRY',
      badge: lang === 'id' ? 'Gerbang Masuk' : 'Entry Gate',
      badgeColor: 'bg-eco-success/20 text-eco-success border-eco-success/40',
      actors: lang === 'id' ? 'Pengendara, Kamera ANPR Gerbang, AI Vision' : 'Driver, Gate ANPR Camera, AI Vision Engine',
      summary: lang === 'id'
        ? 'Pengenalan otomatis nomor polisi dan jenis kendaraan di gerbang masuk via YOLOv11 + OCR.'
        : 'Automated identification of license plates and vehicle class at the entry gate using YOLOv11 + OCR.',
      steps: [
        { no: '1', actor: lang === 'id' ? 'Pengendara' : 'Driver', text: lang === 'id' ? 'Menghentikan kendaraan tepat di depan garis henti terminal gerbang masuk.' : 'Stops vehicle right at the entry gate stop line.' },
        { no: '2', actor: lang === 'id' ? 'Pengendara' : 'Driver', text: lang === 'id' ? 'Menekan tombol hijau pada terminal kios masuk.' : 'Presses the green button on the kiosk terminal.' },
        { no: '3', actor: lang === 'id' ? 'Kamera ANPR' : 'ANPR Camera', text: lang === 'id' ? 'Menangkap citra plat nomor resolusi tinggi secara otomatis.' : 'Automatically captures high-res plate image.' },
        { no: '4', actor: lang === 'id' ? 'AI YOLOv11' : 'YOLOv11 AI', text: lang === 'id' ? 'Mengekstrak karakter string plat dan memvalidasi kejelasan nomor (< 3 detik).' : 'Extracts plate string and validates legibility in < 3s.' },
        { no: '5', actor: lang === 'id' ? 'Sistem Backend' : 'Backend System', text: lang === 'id' ? 'Mencatat timestamp masuk dan memanggil alokasi slot kosong.' : 'Records entry timestamp and requests slot allocation.' }
      ],
      troubleshooting: lang === 'id'
        ? 'Jika plat kotor/tidak terbaca, layar terminal meminta pengendara memajukan kendaraan sedikit atau menekan tombol panggil bantuan ke petugas pos.'
        : 'If plate is unreadable, screen prompts driver to adjust position or press the help button for operator assistance.',
      businessRules: lang === 'id'
        ? 'Pengendara wajib memilih gerbang sesuai jenis kendaraan (Jalur Mobil vs Motor) untuk memastikan alokasi slot yang tepat.'
        : 'Drivers must enter via correct lane (Car vs Motorcycle) for proper slot allocation.'
    },
    {
      id: 'PK-UC002',
      title: lang === 'id' ? 'Mencari & Mengalokasikan Slot Parkir Cerdas' : 'Intelligent Parking Slot Search & Allocation',
      category: 'ENTRY',
      badge: lang === 'id' ? 'Alokasi Algoritma' : 'Allocation Logic',
      badgeColor: 'bg-system-info/20 text-system-info border-system-info/40',
      actors: lang === 'id' ? 'Sistem Backend, Terminal Kios Gerbang' : 'Backend System, Gate Kiosk Terminal',
      summary: lang === 'id'
        ? 'Sistem mencari slot parkir basement yang masih KOSONG terdekat dan mengubah statusnya menjadi DIPESAN.'
        : 'System searches the closest EMPTY basement slot and updates its status to RESERVED.',
      steps: [
        { no: '1', actor: lang === 'id' ? 'Sistem Backend' : 'Backend', text: lang === 'id' ? 'Memeriksa ketersediaan 16 slot parkir di Basement B1 secara real-time.' : 'Checks availability of 16 slots on Basement B1 in real-time.' },
        { no: '2', actor: lang === 'id' ? 'Algoritma Graf' : 'Graph Algorithm', text: lang === 'id' ? 'Memilih slot kosong terdekat dengan pintu akses basement.' : 'Selects closest available slot to basement entrance.' },
        { no: '3', actor: lang === 'id' ? 'Database' : 'Database', text: lang === 'id' ? 'Mengubah status slot terpilih menjadi DIPESAN agar tidak diserobot.' : 'Sets slot status to RESERVED to prevent conflicts.' },
        { no: '4', actor: lang === 'id' ? 'Terminal Kios' : 'Kiosk Terminal', text: lang === 'id' ? 'Mengarahkan pengendara ke halaman denah navigasi visual.' : 'Navigates driver to interactive route guidance map.' },
        { no: '5', actor: lang === 'id' ? 'Sistem Gerbang' : 'Barrier System', text: lang === 'id' ? 'Membuka palang pintu gerbang masuk secara otomatis.' : 'Opens entry barrier gate automatically.' }
      ],
      troubleshooting: lang === 'id'
        ? 'Jika seluruh slot di Basement B1 berstatus TERISI/DIPESAN (penuh), palang gerbang tidak terbuka dan menampilkan status "Parkir Penuh".'
        : 'If all slots are FULL, gate stays closed and displays "Parking Lot Full".',
      businessRules: lang === 'id'
        ? 'Slot yang berstatus DIPESAN memiliki batas waktu toleransi perjalanan sebelum dianggap kedaluwarsa.'
        : 'RESERVED slots expire if vehicle fails to reach the slot within the tolerance grace period.'
    },
    {
      id: 'PK-UC003',
      title: lang === 'id' ? 'Menampilkan Panduan Rute Denah Visual' : 'Interactive Navigation & Route Visualizer',
      category: 'NAVIGATION',
      badge: lang === 'id' ? 'Navigasi Kiosk' : 'Kiosk Guidance',
      badgeColor: 'bg-primary/20 text-primary border-primary/40',
      actors: lang === 'id' ? 'Pengendara, Terminal Kios' : 'Driver, Kiosk Terminal',
      summary: lang === 'id'
        ? 'Memberikan panduan arah belokan dan kode slot target (misal B1-05) pada layar kiosk sebagai pengganti karcis kertas.'
        : 'Displays route map and assigned slot code on the touchscreen terminal, replacing physical paper tickets.',
      steps: [
        { no: '1', actor: lang === 'id' ? 'Terminal Kios' : 'Kiosk Terminal', text: lang === 'id' ? 'Menampilkan denah interaktif Basement B1 lengkap dengan nomor slot dan rute garis hijau.' : 'Shows interactive map of Basement B1 with highlighted green route.' },
        { no: '2', actor: lang === 'id' ? 'Pengendara' : 'Driver', text: lang === 'id' ? 'Mengingat atau memindai kode slot yang dialokasikan di layar kiosk.' : 'Notes or scans the assigned slot ID on screen.' },
        { no: '3', actor: lang === 'id' ? 'Pengendara' : 'Driver', text: lang === 'id' ? 'Melajukan kendaraan menuju area basement mengikuti tanda panah arah rute.' : 'Drives into basement following route visual indicators.' }
      ],
      troubleshooting: lang === 'id'
        ? 'Pengendara dapat melihat papan petunjuk fisik di dalam basement jika lupa nomor slot.'
        : 'Driver can check physical overhead indicator boards inside the basement.',
      businessRules: lang === 'id'
        ? 'Sistem SPCT mengusung konsep paperless 100%, menghilangkan penggunaan tiket kertas konvensional.'
        : 'SPCT is 100% paperless, eliminating physical tickets and thermal paper waste.'
    },
    {
      id: 'PK-UC004',
      title: lang === 'id' ? 'Pemantauan Okupansi Slot Fisik via IoT' : 'Physical Slot Occupancy Monitoring via IoT',
      category: 'IOT',
      badge: lang === 'id' ? 'Telemetri IoT' : 'IoT Telemetry',
      badgeColor: 'bg-[#ffd700]/20 text-[#ffd700] border-yellow-700/40',
      actors: lang === 'id' ? 'Sensor Ultrasonik (16 Unit), Broker Telemetri' : 'Ultrasonic Sensors (16 Units), Telemetry Broker',
      summary: lang === 'id'
        ? 'Sensor mendeteksi kendaraan fisik pada slot dan mencatat waktu tiba untuk kalkulasi reduksi emisi CO₂.'
        : 'Sensor detects vehicle presence and records arrival time for CO2 emission savings calculation.',
      steps: [
        { no: '1', actor: lang === 'id' ? 'Kendaraan' : 'Vehicle', text: lang === 'id' ? 'Masuk dan berhenti tepat di dalam area slot yang dialokasikan.' : 'Parks accurately inside designated slot boundaries.' },
        { no: '2', actor: lang === 'id' ? 'Sensor IoT' : 'IoT Sensor', text: lang === 'id' ? 'Mendeteksi jarak pantulan ultrasonik stabil (< 50 cm) selama minimal 4 detik.' : 'Measures stable reflection distance (<50cm) for at least 4s.' },
        { no: '3', actor: lang === 'id' ? 'Backend' : 'Backend', text: lang === 'id' ? 'Menerima sinyal telemetri dan mengubah status slot dari DIPESAN menjadi TERISI.' : 'Updates slot status from RESERVED to OCCUPIED.' },
        { no: '4', actor: lang === 'id' ? 'Kalkulator Eco' : 'Eco Calculator', text: lang === 'id' ? 'Mencatat waktuTibaSlot dan menghitung menitDihemat untuk kalkulasi reduksi polusi CO₂.' : 'Computes minutes saved for real-time CO2 reduction analytics.' }
      ],
      troubleshooting: lang === 'id'
        ? 'Jika sensor mendeteksi objek namun tidak ada alokasi aktif, sistem otomatis mencatat peringatan anomali.'
        : 'If an unallocated vehicle takes the slot, system logs an anomaly ticket.',
      businessRules: lang === 'id'
        ? 'Filter debounce 4 detik diterapkan agar orang yang lewat tidak memicu status slot terisi.'
        : 'A 4-second debounce prevents pedestrian movement from falsely occupying slots.'
    },
    {
      id: 'PK-UC005',
      title: lang === 'id' ? 'Deteksi Anomali & Peringatan Salah Parkir' : 'Parking Anomaly & Misplacement Alert',
      category: 'OPS',
      badge: lang === 'id' ? 'Operasional Lapangan' : 'Field Operations',
      badgeColor: 'bg-alert-anomaly/20 text-alert-anomaly border-alert-anomaly/40',
      actors: lang === 'id' ? 'Sistem Backend, Petugas Lapangan' : 'Backend System, Field Operator',
      summary: lang === 'id'
        ? 'Penanganan insiden salah tempat parkir, sensor offline, atau ketidaksesuaian status di basement.'
        : 'Handling misplaced vehicles, offline sensors, and slot status mismatches in basement.',
      steps: [
        { no: '1', actor: lang === 'id' ? 'Sistem Deteksi' : 'Detection Engine', text: lang === 'id' ? 'Mendeteksi status slot anomali (misal sensor terisi di luar slot alokasi).' : 'Detects abnormal condition (e.g., unauthorized vehicle occupancy).' },
        { no: '2', actor: lang === 'id' ? 'Dashboard' : 'Dashboard', text: lang === 'id' ? 'Memunculkan kartu berkedip merah (pulse alert) pada panel Active Alerts.' : 'Triggers pulsing red alert in Active Alerts panel.' },
        { no: '3', actor: lang === 'id' ? 'Petugas' : 'Operator', text: lang === 'id' ? 'Membuka menu Anomaly Logs, memeriksa slot fisik di basement atau via Gate Live Feed.' : 'Checks Anomaly Logs, inspects slot physically or via Gate CCTV feed.' },
        { no: '4', actor: lang === 'id' ? 'Petugas' : 'Operator', text: lang === 'id' ? 'Melakukan validasi lapangan dan memperbarui status tiket menjadi SELESAI_DIVALIDASI.' : 'Resolves issue and marks anomaly as RESOLVED.' }
      ],
      troubleshooting: lang === 'id'
        ? 'Petugas dapat mengarahkan kendaraan yang salah slot secara persuasif untuk mencegah efek domino saat keluar.'
        : 'Operator directs driver to correct slot to prevent exit gate verification failure.',
      businessRules: lang === 'id'
        ? 'Setiap anomali tingkat CRITICAL wajib ditangani sebelum laporan operasional harian ditutup.'
        : 'All CRITICAL anomalies must be resolved before daily shift reconciliation.'
    },
    {
      id: 'PK-UC006',
      title: lang === 'id' ? 'Menghitung Durasi & Tarif Parkir Gerbang Keluar' : 'Exit Gate Duration & Fee Calculation',
      category: 'EXIT',
      badge: lang === 'id' ? 'Gerbang Keluar' : 'Exit Gate',
      badgeColor: 'bg-eco-success/20 text-eco-success border-eco-success/40',
      actors: lang === 'id' ? 'Pengendara, Kamera ANPR Keluar, Backend' : 'Driver, Exit ANPR Camera, Backend',
      summary: lang === 'id'
        ? 'Kamera keluar membaca plat nomor kendaraan dan backend menghitung durasi serta nominal tagihan.'
        : 'Exit camera reads plate string and backend calculates parking duration and fee.',
      steps: [
        { no: '1', actor: lang === 'id' ? 'Pengendara' : 'Driver', text: lang === 'id' ? 'Menghentikan kendaraan di terminal gerbang keluar.' : 'Stops at the exit terminal stop line.' },
        { no: '2', actor: lang === 'id' ? 'Kamera Keluar' : 'Exit Camera', text: lang === 'id' ? 'Memindai plat nomor dan mencocokkan dengan transaksi parkir aktif di database.' : 'Scans plate and matches active transaction in DB.' },
        { no: '3', actor: lang === 'id' ? 'Sistem Tagihan' : 'Billing Engine', text: lang === 'id' ? 'Menghitung durasiTotalMenit = waktuKeluar - waktuMasuk.' : 'Calculates total parking duration in minutes.' },
        { no: '4', actor: lang === 'id' ? 'Aturan Bisnis' : 'Business Rules', text: lang === 'id' ? 'Jika durasi < 10 menit (Grace Period Drop-Off), tagihan otomatis Rp 0 (LUNAS).' : 'If duration < 10 mins (Grace Period), fee is Rp 0 (PAID).' },
        { no: '5', actor: lang === 'id' ? 'Layar Kiosk' : 'Kiosk Screen', text: lang === 'id' ? 'Menampilkan rincian waktu parkir dan QRIS pembayaran digital.' : 'Displays duration summary and dynamic QRIS payment QR.' }
      ],
      troubleshooting: lang === 'id'
        ? 'Jika data transaksi masuk tidak ditemukan, sistem memanggil petugas pos keluar.'
        : 'If entry record is missing, terminal rings operator post for manual verification.',
      businessRules: lang === 'id'
        ? 'Tarif dihitung per jam dengan pembulatan ke atas setelah melewati masa grace period.'
        : 'Tariff is calculated hourly with upward rounding after grace period.'
    },
    {
      id: 'PK-UC007',
      title: lang === 'id' ? 'Proses Pembayaran Nirkontak (Cashless Gateway)' : 'Cashless Payment Gateway Processing',
      category: 'EXIT',
      badge: lang === 'id' ? 'Pembayaran Digital' : 'Cashless Gateway',
      badgeColor: 'bg-system-info/20 text-system-info border-system-info/40',
      actors: lang === 'id' ? 'Pengendara, Kios Keluar, Payment Gateway' : 'Driver, Exit Kiosk, Payment Gateway',
      summary: lang === 'id'
        ? 'Pembayaran non-tunai via scan QRIS dinamis atau kartu E-Toll pada terminal keluar.'
        : 'Cashless payment via dynamic QRIS or E-Toll tap at the automated exit terminal.',
      steps: [
        { no: '1', actor: lang === 'id' ? 'Pengendara' : 'Driver', text: lang === 'id' ? 'Memilih metode pembayaran (QRIS atau E-Toll) pada layar terminal.' : 'Selects payment method (QRIS or E-Toll) on kiosk screen.' },
        { no: '2', actor: lang === 'id' ? 'Pengendara' : 'Driver', text: lang === 'id' ? 'Melakukan scan barcode QRIS menggunakan mobile banking / e-wallet.' : 'Scans QRIS barcode via mobile banking or e-wallet.' },
        { no: '3', actor: lang === 'id' ? 'Payment Gateway' : 'Gateway', text: lang === 'id' ? 'Mengirimkan sinyal callback bahwa transaksi berhasil lunas.' : 'Returns webhook confirmation that payment is successful.' },
        { no: '4', actor: lang === 'id' ? 'Backend' : 'Backend', text: lang === 'id' ? 'Memperbarui status pembayaran menjadi LUNAS dan slot asal menjadi KOSONG.' : 'Marks payment as PAID and frees up the occupied slot to EMPTY.' }
      ],
      troubleshooting: lang === 'id'
        ? 'Jika koneksi gateway terputus, terminal mengaktifkan mode transaksi darurat lewat pos operator.'
        : 'If gateway is unreachable, terminal switches to operator backup post.',
      businessRules: lang === 'id'
        ? 'Sistem tidak menerima uang tunai di gerbang otomatis guna mencegah antrean kemacetan.'
        : 'Automated gates are strictly cashless to prevent bottleneck queues.'
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
        : 'Barrier gate opens immediately after payment verification is confirmed PAID.',
      steps: [
        { no: '1', actor: lang === 'id' ? 'Sistem Gerbang' : 'Gate System', text: lang === 'id' ? 'Memvalidasi status transaksi parkir telah LUNAS atau GRACE_PERIOD.' : 'Validates transaction is PAID or GRACE_PERIOD.' },
        { no: '2', actor: lang === 'id' ? 'Motor Servo Palang' : 'Barrier Servo', text: lang === 'id' ? 'Mengangkat palang pintu gerbang keluar secara otomatis.' : 'Lifts the barrier gate arm automatically.' },
        { no: '3', actor: lang === 'id' ? 'Pengendara' : 'Driver', text: lang === 'id' ? 'Melajukan kendaraan meninggalkan area parkir fasilitas.' : 'Drives out of the facility premises.' },
        { no: '4', actor: lang === 'id' ? 'Sensor Loop' : 'Loop Sensor', text: lang === 'id' ? 'Mendeteksi kendaraan telah lewat dan menurunkan kembali palang gerbang.' : 'Detects vehicle departure and closes barrier gate.' }
      ],
      troubleshooting: lang === 'id'
        ? 'Tersedia tombol manual bypass palang gerbang untuk evakuasi darurat.'
        : 'Emergency manual bypass switch is available at exit booth for rapid evacuation.',
      businessRules: lang === 'id'
        ? 'Palang tidak akan terbuka jika status transaksi belum tercatat lunas.'
        : 'Barrier will not open until transaction is marked PAID.'
    },
    {
      id: 'PK-UC009',
      title: lang === 'id' ? 'Pemantauan Kondisi Real-Time (Command Center)' : 'Real-Time Field Operations Command Center',
      category: 'OPS',
      badge: lang === 'id' ? 'Petugas Lapangan' : 'Field Operator',
      badgeColor: 'bg-primary/20 text-primary border-primary/40',
      actors: lang === 'id' ? 'Petugas Lapangan, Web Dashboard' : 'Field Operator, Web Dashboard',
      summary: lang === 'id'
        ? 'Dashboard terpusat untuk memantau denah 16 slot, 4 kamera ANPR, dan log telemetri sensor.'
        : 'Centralized command center for 16-slot map, 4 ANPR cameras, and sensor telemetry.',
      steps: [
        { no: '1', actor: lang === 'id' ? 'Petugas' : 'Operator', text: lang === 'id' ? 'Login menggunakan akun peran PETUGAS_LAPANGAN.' : 'Logs in with PETUGAS_LAPANGAN credentials.' },
        { no: '2', actor: lang === 'id' ? 'Dashboard' : 'Dashboard', text: lang === 'id' ? 'Menampilkan Peta Slot Real-Time dengan indikator warna (Hijau, Kuning, Merah).' : 'Views real-time slot grid with color indicators (Green, Yellow, Red).' },
        { no: '3', actor: lang === 'id' ? 'Live Gate Monitor' : 'Live Gate Feed', text: lang === 'id' ? 'Memantau tangkapan video 4 kamera gerbang (Entry/Exit Mobil dan Motor).' : 'Monitors 4 live gate camera feeds (Entry/Exit Car & Bike).' },
        { no: '4', actor: lang === 'id' ? 'Hardware Strip' : 'Hardware Strip', text: lang === 'id' ? 'Menampilkan status online/offline 16 sensor ultrasonik.' : 'Monitors online/offline telemetry status of 16 ultrasonic sensors.' }
      ],
      troubleshooting: lang === 'id'
        ? 'Data dashboard secara otomatis melakukan sinkronisasi real-time setiap 1.5 detik.'
        : 'Dashboard auto-polls every 1.5s for seamless real-time synchronization.',
      businessRules: lang === 'id'
        ? 'Petugas lapangan hanya memiliki akses pemantauan operasional taktis, bukan analitik finansial.'
        : 'Field operators have operational visibility, while financial metrics are restricted to management.'
    },
    {
      id: 'PK-UC010',
      title: lang === 'id' ? 'Analitik Bisnis & Ekspor Laporan Resmi (PDF/Excel)' : 'Management Analytics & Official Report Export (PDF/Excel)',
      category: 'MGMT',
      badge: lang === 'id' ? 'Manajemen RS' : 'RS Management',
      badgeColor: 'bg-[#00BFFF]/20 text-[#00BFFF] border-cyan-700/40',
      actors: lang === 'id' ? 'Manajemen RS / Direksi, Web Dashboard' : 'Hospital Management, Web Dashboard',
      summary: lang === 'id'
        ? 'Rekapitulasi total pendapatan, tren okupansi kendaraan, penghematan emisi CO₂, dan ekspor berkas.'
        : 'Executive tracking of gross revenue, vehicle turnover, CO2 savings, and certified exports.',
      steps: [
        { no: '1', actor: lang === 'id' ? 'Manajemen' : 'Manager', text: lang === 'id' ? 'Login menggunakan akun peran Manajemen RS atau Admin.' : 'Logs in with Manager or Admin privileges.' },
        { no: '2', actor: lang === 'id' ? 'Dashboard Manajemen' : 'Management Dashboard', text: lang === 'id' ? 'Melihat Revenue Tracker, Total Transaksi, dan Metrik Reduksi CO₂.' : 'Inspects Revenue Tracker, Total Transactions, and Eco-Impact CO2 savings.' },
        { no: '3', actor: lang === 'id' ? 'Menu Reports' : 'Reports Menu', text: lang === 'id' ? 'Memilih rentang tanggal (Hari Ini, 7 Hari, 30 Hari, atau Kustom).' : 'Filters operational reports by date range (Today, 7D, 30D, Custom).' },
        { no: '4', actor: lang === 'id' ? 'Tombol Unduh' : 'Export Buttons', text: lang === 'id' ? 'Klik "Ekspor PDF" untuk dokumen bergrafik JFreeChart atau "Ekspor Excel" untuk file spreadsheet.' : 'Exports formal PDF with JFreeChart graphs or structured Excel XLSX spreadsheet.' }
      ],
      troubleshooting: lang === 'id'
        ? 'Jika unduhan laporan gagal, pastikan backend Spring Boot port 8081 aktif.'
        : 'If report export fails, ensure backend Spring Boot service on port 8081 is active.',
      businessRules: lang === 'id'
        ? 'Setiap aksi pengunduhan laporan dicatat ke dalam log_audit_laporan untuk audit kepatuhan.'
        : 'All report generation triggers are recorded into log_audit_laporan for audit compliance.'
    }
  ];

  // Logika pemfilteran use case berdasarkan kategori yang dipilih dan kata kunci pencarian teks
  const filteredSop = panduanList.filter((item) => {
    // Evaluasi kecocokan kategori use case
    const matchesCategory =
      sopCategory === 'ALL' ? true :
      sopCategory === 'ENTRY' ? item.category === 'ENTRY' :
      sopCategory === 'EXIT' ? item.category === 'EXIT' :
      sopCategory === 'OPS' ? (item.category === 'OPS' || item.category === 'IOT' || item.category === 'NAVIGATION') :
      sopCategory === 'MGMT' ? item.category === 'MGMT' : true;

    // Evaluasi pencarian string pada ID, judul, ringkasan, atau aktor yang terlibat
    const matchesSearch =
      item.id.toLowerCase().includes(sopSearch.toLowerCase()) ||
      item.title.toLowerCase().includes(sopSearch.toLowerCase()) ||
      item.summary.toLowerCase().includes(sopSearch.toLowerCase()) ||
      item.actors.toLowerCase().includes(sopSearch.toLowerCase());

    // Kembalikan true jika kedua kriteria terpenuhi
    return matchesCategory && matchesSearch;
  });

  // Evaluasi peran akun yang sedang login apakah berkategori Manajer / Admin (Role-Based Access Control)
  const isManager = currentUser.role === 'ADMIN' || currentUser.role === 'Manajemen RS';

  // Deklarasi tab umum (bagian atas) yang dapat diakses oleh seluruh peran pengguna
  const commonTopTabs = [
    {
      id: 'account',
      label: lang === 'id' ? 'Akun & Keamanan' : 'Account & Security',
      icon: 'manage_accounts',
      desc: lang === 'id' ? 'Profil pengguna & perbarui kata sandi' : 'User profile & password update'
    },
    {
      id: 'display',
      label: lang === 'id' ? 'Tampilan & Bahasa' : 'Theme & Language',
      icon: 'palette',
      desc: lang === 'id' ? 'Mode tema gelap/cerah & pilihan bahasa' : 'Dark/light theme & language selector'
    },
  ];

  // Deklarasi tab khusus untuk peran Petugas Lapangan (fokus sensor IoT dan kamera gerbang)
  const fieldOperatorTabs = [
    {
      id: 'iot',
      label: lang === 'id' ? 'Sensor IoT & Basement' : 'IoT Sensors & Basement',
      icon: 'sensors',
      desc: lang === 'id' ? 'Debounce filter & ambang batas sensor' : 'Debounce filter & sensor tolerance'
    },
    {
      id: 'anpr',
      label: lang === 'id' ? 'Kamera ANPR & AI' : 'ANPR Camera & AI',
      icon: 'videocam',
      desc: lang === 'id' ? 'Confidence threshold YOLOv11 & OCR' : 'YOLOv11 & OCR confidence threshold'
    },
  ];

  // Deklarasi tab khusus untuk peran Manajemen RS / Admin (fokus formula emisi karbon dan retensi data)
  const managementTabs = [
    {
      id: 'eco',
      label: lang === 'id' ? 'Eco-Metrics & Emisi' : 'Eco-Metrics & Carbon',
      icon: 'eco',
      desc: lang === 'id' ? 'Rumus standar CO₂ & baseline efisiensi' : 'CO2 standard formula & baseline'
    },
    {
      id: 'retention',
      label: lang === 'id' ? 'Retensi & Kebijakan Data' : 'Data Retention Policy',
      icon: 'auto_delete',
      desc: lang === 'id' ? 'Siklus hidup log telemetri 90 hari' : '90-day telemetry log lifecycle'
    },
  ];

  // Deklarasi tab referensi (bagian bawah) berupa panduan SOP yang dapat diakses seluruh pengguna
  const commonBottomTabs = [
    {
      id: 'sop',
      label: lang === 'id' ? 'Panduan Sistem (SOP)' : 'System Guide (SOP)',
      icon: 'menu_book',
      desc: lang === 'id' ? 'Prosedur operasional sistem parkir cerdas' : 'Smart parking operational procedures'
    },
  ];

  // Menggabungkan susunan tab menu secara dinamis sesuai peran login aktif (RBAC)
  const tabs = [
    ...commonTopTabs,
    ...(isManager ? managementTabs : fieldOperatorTabs),
    ...commonBottomTabs
  ];

  // Evaluasi dinamis validasi ketentuan kata sandi akun
  const pwdLengthValid = (settings.passwordBaru || '').length >= 8; // Panjang minimal 8 karakter
  const pwdNumberValid = /\d/.test(settings.passwordBaru || ''); // Mengandung angka
  const pwdSpecialValid = /[^A-Za-z0-9]/.test(settings.passwordBaru || ''); // Mengandung karakter khusus
  const pwdAllValid = pwdLengthValid && pwdNumberValid && pwdSpecialValid; // Seluruh kriteria terpenuhi
  const pwdMatch = Boolean(settings.passwordBaru && settings.konfirmasiPassword && settings.passwordBaru === settings.konfirmasiPassword); // Kecocokan konfirmasi

  // Mengembalikan elemen antarmuka JSX halaman pengaturan sistem
  return (
    // Membungkus seluruh antarmuka dengan komponen AppLayout
    <AppLayout breadcrumb={lang === 'id' ? 'Pengaturan Sistem' : 'System Settings'} status="IoT Operational">
      {/* Kontainer utama halaman pengaturan dengan lebar maksimum 7xl */}
      <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6">

        {/* Seksi Header Halaman Pengaturan (Judul, Deskripsi, dan Tombol Tindakan Cepat) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-container-low p-6 rounded-2xl border border-surface-container shadow-sm">
          <div>
            <div className="flex items-center gap-3 mb-1">
              {/* Ikon penanda modul pengaturan sistem */}
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[24px]">tune</span>
              </div>
              {/* Judul utama halaman pengaturan */}
              <h1 className="text-2xl font-bold text-on-surface">
                {lang === 'id' ? 'Pengaturan Sistem (SPCT IoT)' : 'System Settings (SPCT IoT)'}
              </h1>
            </div>
            {/* Deskripsi ringkas cakupan modul konfigurasi */}
            <p className="text-sm text-on-surface-variant font-mono">
              {lang === 'id'
                ? 'Konfigurasi tema, bahasa, panduan operasional SOP, dan parameter teknis terintegrasi.'
                : 'Configure theme, language, SOP operational guide, and integrated technical parameters.'}
            </p>
          </div>

          {/* Tombol aksi header: Reset Default dan Simpan Perubahan */}
          <div className="flex items-center gap-3">
            {/* Tombol untuk mengembalikan pengaturan ke standar pabrik */}
            <button
              onClick={handleResetDefault}
              className="px-4 py-2 rounded-xl text-xs font-mono font-semibold border border-outline-variant hover:bg-surface-variant text-on-surface-variant transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              {lang === 'id' ? 'Reset Default' : 'Reset Defaults'}
            </button>
            {/* Tombol untuk menyimpan perubahan parameter ke localStorage */}
            <button
              onClick={handleSaveSettings}
              className="px-5 py-2 rounded-xl text-xs font-mono font-bold bg-primary text-on-primary hover:bg-primary/90 transition-all shadow-md flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              {lang === 'id' ? 'Simpan Perubahan' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Seksi Notifikasi Toast Pop-up Umpan Balik Pengguna */}
        {toast && (
          <div className={`p-4 rounded-xl font-mono text-xs flex items-center justify-between border ${
            toast.type === 'success' ? 'bg-eco-success/20 border-eco-success text-eco-success' :
            toast.type === 'error' ? 'bg-alert-anomaly/20 border-alert-anomaly text-alert-anomaly' :
            'bg-system-info/20 border-system-info text-system-info'
          }`}>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">
                {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info'}
              </span>
              <span>{toast.message}</span>
            </div>
            {/* Tombol silang untuk menutup notifikasi secara manual */}
            <button onClick={() => setToast(null)} className="opacity-70 hover:opacity-100">✕</button>
          </div>
        )}

        {/* Tata Letak Grid Navigasi Tab (Kolom Kiri) dan Isi Konten Aktif (Kolom Kanan) */}
        <div className="grid grid-cols-12 gap-6">

          {/* Kolom Kiri (4 Kolom pada Desktop): Bilah Navigasi Menu Tab Pengaturan */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-3">

            {/* Lencana Konteks Peran Login Pengguna (Role Context Badge) */}
            <div className={`p-3 rounded-xl border flex items-center gap-3 ${
              isManager
                ? 'bg-[#00BFFF]/10 border-[#00BFFF]/30'
                : 'bg-eco-success/10 border-eco-success/30'
            }`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isManager ? 'bg-[#00BFFF]/20' : 'bg-eco-success/20'
              }`}>
                <span className={`material-symbols-outlined text-[18px] ${
                  isManager ? 'text-[#00BFFF]' : 'text-eco-success'
                }`}>
                  {isManager ? 'admin_panel_settings' : 'engineering'}
                </span>
              </div>
              <div className="min-w-0">
                <p className={`text-xs font-bold leading-tight ${
                  isManager ? 'text-[#00BFFF]' : 'text-eco-success'
                }`}>
                  {isManager
                    ? (lang === 'id' ? 'Manajer / Admin' : 'Manager / Admin')
                    : (lang === 'id' ? 'Petugas Lapangan' : 'Field Operator')}
                </p>
                <p className="text-[10px] text-text-muted font-mono truncate">
                  {isManager
                    ? (lang === 'id' ? 'Akses: Manajemen Data & Analitik' : 'Access: Data Management & Analytics')
                    : (lang === 'id' ? 'Akses: Pemantauan Lapangan & Sensor' : 'Access: Field Monitoring & Sensors')}
                </p>
              </div>
            </div>

            {/* Kelompok Tab Umum (Atas): Akun & Keamanan dan Tampilan & Bahasa */}
            <div className="flex flex-col gap-1.5">
              <p className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-widest px-1">
                {lang === 'id' ? 'Umum' : 'General'}
              </p>
              {commonTopTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-start gap-4 p-4 rounded-xl text-left transition-all border ${
                      isActive
                        ? 'bg-surface-container border-primary shadow-sm text-primary font-semibold'
                        : 'bg-surface-container-lowest border-surface-container hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[24px] mt-0.5 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
                      {tab.icon}
                    </span>
                    <div className="flex-1">
                      <p className={`text-sm ${isActive ? 'text-on-surface font-bold' : 'font-medium'}`}>{tab.label}</p>
                      <p className="text-xs text-text-muted mt-0.5 font-mono">{tab.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Kelompok Tab Khusus Peran (Tengah): Sensor/ANPR untuk Operator, atau Eco/Retensi untuk Manajemen */}
            <div className="flex flex-col gap-1.5">
              <p className={`text-[10px] font-mono font-bold uppercase tracking-widest px-1 ${
                isManager ? 'text-[#00BFFF]/70' : 'text-eco-success/70'
              }`}>
                {isManager
                  ? (lang === 'id' ? 'Manajemen Data' : 'Data Management')
                  : (lang === 'id' ? 'Pemantauan Lapangan' : 'Field Monitoring')}
              </p>
              {(isManager ? managementTabs : fieldOperatorTabs).map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-start gap-4 p-4 rounded-xl text-left transition-all border ${
                      isActive
                        ? 'bg-surface-container border-primary shadow-sm text-primary font-semibold'
                        : isManager
                          ? 'bg-[#00BFFF]/5 border-[#00BFFF]/15 hover:bg-[#00BFFF]/10 text-on-surface-variant hover:text-on-surface'
                          : 'bg-eco-success/5 border-eco-success/15 hover:bg-eco-success/10 text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[24px] mt-0.5 ${
                      isActive
                        ? 'text-primary'
                        : isManager ? 'text-[#00BFFF]/60' : 'text-eco-success/60'
                    }`}>
                      {tab.icon}
                    </span>
                    <div className="flex-1">
                      <p className={`text-sm ${isActive ? 'text-on-surface font-bold' : 'font-medium'}`}>{tab.label}</p>
                      <p className="text-xs text-text-muted mt-0.5 font-mono">{tab.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Kelompok Tab Referensi (Bawah): Panduan Sistem SOP */}
            <div className="flex flex-col gap-1.5">
              <p className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-widest px-1">
                {lang === 'id' ? 'Referensi' : 'Reference'}
              </p>
              {commonBottomTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-start gap-4 p-4 rounded-xl text-left transition-all border ${
                      isActive
                        ? 'bg-surface-container border-primary shadow-sm text-primary font-semibold'
                        : 'bg-surface-container-lowest border-surface-container hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[24px] mt-0.5 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
                      {tab.icon}
                    </span>
                    <div className="flex-1">
                      <p className={`text-sm ${isActive ? 'text-on-surface font-bold' : 'font-medium'}`}>{tab.label}</p>
                      <p className="text-xs text-text-muted mt-0.5 font-mono">{tab.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

          </div>

          {/* Kolom Kanan (8 Kolom pada Desktop): Konten Panel dari Tab yang Sedang Aktif */}
          <div className="col-span-12 lg:col-span-8 bg-surface-container-low p-6 rounded-2xl border border-surface-container shadow-sm min-h-[500px]">

            {/* Panel Tab: Tampilan & Bahasa (Theme & Language) */}
            {activeTab === 'display' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">palette</span>
                    {lang === 'id' ? 'Pengaturan Tema Antarmuka & Bahasa' : 'Display Theme & Language Settings'}
                  </h3>
                  <p className="text-xs text-on-surface-variant font-mono mt-1">
                    {lang === 'id'
                      ? 'Kustomisasi preferensi visual aplikasi dan bahasa operasional sistem.'
                      : 'Customize visual theme appearance and operational system language.'}
                  </p>
                </div>

                {/* 1. Pemilihan Mode Tema Tampilan: Dark vs Light */}
                <div className="space-y-3">
                  <p className="text-xs font-mono font-bold text-on-surface uppercase tracking-wider">
                    {lang === 'id' ? '1. Mode Tema Aplikasi:' : '1. Application Theme Mode:'}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Kartu Pemilihan Tema Gelap (Dark Mode) */}
                    <div
                      onClick={() => handleThemeChange('dark')}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col gap-3 ${
                        theme === 'dark'
                          ? 'border-primary bg-surface-container shadow-md'
                          : 'border-surface-variant bg-surface-container-lowest hover:border-outline'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2.5">
                          <span className="material-symbols-outlined text-[24px] text-[#7ad0ff]">dark_mode</span>
                          <span className="font-bold text-sm text-on-surface">
                            {lang === 'id' ? 'Tema Gelap (Dark)' : 'Dark Mode'}
                          </span>
                        </div>
                        {theme === 'dark' && (
                          <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                        )}
                      </div>
                      <p className="text-xs text-text-muted font-mono leading-relaxed">
                        {lang === 'id'
                          ? 'Nuansa latar hitam (#0e1418) dengan aksen Green-IoT. Mengurangi kelelahan mata operator di ruang kontrol.'
                          : 'Dark background (#0e1418) with Green-IoT semantic accents. Reduces eye strain in operator control rooms.'}
                      </p>
                      {/* Palet warna tema gelap */}
                      <div className="h-4 rounded-full bg-[#121212] border border-[#333] flex items-center px-2 gap-1.5 mt-auto">
                        <div className="w-2 h-2 rounded-full bg-[#2E8B57]" />
                        <div className="w-2 h-2 rounded-full bg-[#00BFFF]" />
                        <div className="w-2 h-2 rounded-full bg-[#FFD700]" />
                      </div>
                    </div>

                    {/* Kartu Pemilihan Tema Cerah (Light Mode) */}
                    <div
                      onClick={() => handleThemeChange('light')}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col gap-3 ${
                        theme === 'light'
                          ? 'border-primary bg-surface-container shadow-md'
                          : 'border-surface-variant bg-surface-container-lowest hover:border-outline'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2.5">
                          <span className="material-symbols-outlined text-[24px] text-[#ffb86e]">light_mode</span>
                          <span className="font-bold text-sm text-on-surface">
                            {lang === 'id' ? 'Tema Cerah (Light)' : 'Light Mode'}
                          </span>
                        </div>
                        {theme === 'light' && (
                          <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                        )}
                      </div>
                      <p className="text-xs text-text-muted font-mono leading-relaxed">
                        {lang === 'id'
                          ? 'Latar terang bersih (#f4f6f9) dengan teks kontras tinggi. Nyaman digunakan di area gerbang luar ruangan yang terang.'
                          : 'Clean light background (#f4f6f9) with high contrast text. Optimal for bright outdoor gate terminals.'}
                      </p>
                      {/* Palet warna tema terang */}
                      <div className="h-4 rounded-full bg-[#f1f5f9] border border-[#cbd5e1] flex items-center px-2 gap-1.5 mt-auto">
                        <div className="w-2 h-2 rounded-full bg-[#00703f]" />
                        <div className="w-2 h-2 rounded-full bg-[#00668a]" />
                        <div className="w-2 h-2 rounded-full bg-[#b45309]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Pemilihan Bahasa Operasional Antarmuka */}
                <div className="space-y-3 pt-4 border-t border-surface-variant">
                  <p className="text-xs font-mono font-bold text-on-surface uppercase tracking-wider">
                    {lang === 'id' ? '2. Bahasa Antarmuka (Language):' : '2. System Interface Language:'}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Opsi Bahasa Indonesia */}
                    <div
                      onClick={() => handleLanguageChange('id')}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                        lang === 'id'
                          ? 'border-primary bg-surface-container shadow-sm'
                          : 'border-surface-variant bg-surface-container-lowest hover:border-outline'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🇮🇩</span>
                        <div>
                          <p className="font-bold text-sm text-on-surface">Bahasa Indonesia</p>
                          <p className="text-xs text-text-muted font-mono">Bahasa Resmi Sistem (Standar RPL)</p>
                        </div>
                      </div>
                      {lang === 'id' && (
                        <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                      )}
                    </div>

                    {/* Opsi English */}
                    <div
                      onClick={() => handleLanguageChange('en')}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                        lang === 'en'
                          ? 'border-primary bg-surface-container shadow-sm'
                          : 'border-surface-variant bg-surface-container-lowest hover:border-outline'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🇬🇧</span>
                        <div>
                          <p className="font-bold text-sm text-on-surface">English (US)</p>
                          <p className="text-xs text-text-muted font-mono">International Operational Language</p>
                        </div>
                      </div>
                      {lang === 'en' && (
                        <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Catatan informasi penyimpanan preferensi di peramban */}
                <div className="p-4 rounded-xl bg-surface-container border border-surface-variant flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[20px]">info</span>
                  <p className="text-xs font-mono text-on-surface-variant">
                    {lang === 'id'
                      ? 'Preferensi tema dan bahasa disimpan secara otomatis di peramban (browser) operator.'
                      : 'Theme and language preferences are stored locally in the operator’s browser session.'}
                  </p>
                </div>
              </div>
            )}

            {/* Panel Tab: Panduan Sistem SOP (SOP Terintegrasi Blueprint RPL) */}
            {activeTab === 'sop' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">menu_book</span>
                    {lang === 'id' ? 'Panduan Pengoperasian Sistem (SOP Terintegrasi)' : 'System Operational Procedures (Integrated SOP)'}
                  </h3>
                  <p className="text-xs text-on-surface-variant font-mono mt-1">
                    {lang === 'id'
                      ? 'Dokumentasi langkah kerja resmi dan standar operasional sistem parkir cerdas (Blueprint RPL).'
                      : 'Official standard operating procedures for smart parking system operations.'}
                  </p>
                </div>

                {/* Bilah Filter Kategori dan Kolom Input Pencarian Dokumen SOP */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-3 bg-surface-container p-3 rounded-xl border border-surface-variant">
                  {/* Deretan tombol pil filter kategori SOP */}
                  <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
                    {[
                      { id: 'ALL', label: lang === 'id' ? 'Semua (10)' : 'All (10)' },
                      { id: 'ENTRY', label: lang === 'id' ? 'Masuk' : 'Entry' },
                      { id: 'EXIT', label: lang === 'id' ? 'Keluar' : 'Exit' },
                      { id: 'OPS', label: lang === 'id' ? 'Operasional Lapangan' : 'Field Ops' },
                      { id: 'MGMT', label: lang === 'id' ? 'Manajemen' : 'Management' }
                    ].map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSopCategory(cat.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-colors ${
                          sopCategory === cat.id
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Input pencarian use case dengan ikon kaca pembesar */}
                  <div className="relative w-full md:w-60">
                    <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted text-[16px]">
                      search
                    </span>
                    <input
                      type="text"
                      placeholder={lang === 'id' ? 'Cari use case...' : 'Search use case...'}
                      value={sopSearch}
                      onChange={(e) => setSopSearch(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-outline rounded-lg pl-8 pr-3 py-1 text-xs text-on-surface font-mono outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Daftar Akordion Kartu Use Case Hasil Filter */}
                <div className="flex flex-col gap-3">
                  {filteredSop.map((item) => {
                    // Evaluasi apakah kartu use case ini sedang dalam kondisi terbuka (expanded)
                    const isExpanded = expandedSopId === item.id;
                    return (
                      <div
                        key={item.id}
                        className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                          isExpanded
                            ? 'bg-surface-container border-primary/60 shadow-md'
                            : 'bg-surface-container-lowest border-surface-container hover:border-surface-variant'
                        }`}
                      >
                        {/* Header Kartu Akordion Use Case (Bisa diklik) */}
                        <div
                          onClick={() => setExpandedSopId(isExpanded ? null : item.id)}
                          className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div>
                              <h4 className="text-sm font-bold text-on-surface">{item.title}</h4>
                              <p className="text-xs text-text-muted font-mono mt-0.5">{item.summary}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            {/* Lencana kategori use case */}
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${item.badgeColor}`}>
                              {item.badge}
                            </span>
                            {/* Ikon panah rotasi penanda buka/tutup */}
                            <span className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${
                              isExpanded ? 'rotate-180 text-primary' : 'text-on-surface-variant'
                            }`}>
                              expand_more
                            </span>
                          </div>
                        </div>

                        {/* Konten Rincian Terbuka Saat Akordion Aktif */}
                        {isExpanded && (
                          <div className="px-4 pb-5 border-t border-surface-variant pt-4 space-y-4">
                            {/* Aktor yang Terlibat */}
                            <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-surface-variant flex items-center gap-2 text-xs font-mono">
                              <span className="material-symbols-outlined text-primary text-[16px]">group</span>
                              <span className="text-on-surface-variant">{lang === 'id' ? 'Aktor Terlibat:' : 'Actors:'}</span>
                              <span className="text-on-surface font-semibold">{item.actors}</span>
                            </div>

                            {/* Daftar Alur Prosedur Kerja Standar (Typical Events) */}
                            <div>
                              <p className="text-xs font-bold font-mono text-on-surface uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-eco-success text-[16px]">format_list_numbered</span>
                                {lang === 'id' ? 'Alur Prosedur Standar (Typical Events):' : 'Standard Event Flow:'}
                              </p>
                              <div className="flex flex-col gap-1.5">
                                {item.steps.map((st) => (
                                  <div key={st.no} className="flex items-start gap-2.5 p-2 rounded-lg bg-surface-container-lowest border border-surface-variant text-xs">
                                    <span className="w-4 h-4 rounded-full bg-primary/20 text-primary font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                                      {st.no}
                                    </span>
                                    <div className="flex-1 font-mono">
                                      <span className="text-primary font-semibold mr-1.5">[{st.actor}]</span>
                                      <span className="text-on-surface">{st.text}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Grid Penanganan Kendala (Troubleshooting) dan Aturan Bisnis */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {/* Kotak Troubleshooting */}
                              <div className="p-3 rounded-lg bg-alert-anomaly/10 border border-alert-anomaly/30 space-y-1">
                                <p className="text-xs font-bold font-mono text-alert-anomaly flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[16px]">help_outline</span>
                                  {lang === 'id' ? 'Solusi Kendala (Troubleshooting):' : 'Troubleshooting:'}
                                </p>
                                <p className="text-xs text-on-surface font-mono leading-relaxed">{item.troubleshooting}</p>
                              </div>

                              {/* Kotak Aturan Bisnis */}
                              <div className="p-3 rounded-lg bg-surface-container-lowest border border-surface-variant space-y-1">
                                <p className="text-xs font-bold font-mono text-system-info flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[16px]">rule</span>
                                  {lang === 'id' ? 'Aturan Bisnis (Rules):' : 'Business Rules:'}
                                </p>
                                <p className="text-xs text-on-surface font-mono leading-relaxed">{item.businessRules}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Panel Tab: Eco-Metrics & Emisi Karbon (Khusus Peran Manajemen RS / Admin) */}
            {activeTab === 'eco' && (
              <div className="space-y-6">
                {/* Lencana penanda hak akses peran */}
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#00BFFF]/10 border border-[#00BFFF]/30">
                  <span className="material-symbols-outlined text-[18px] text-[#00BFFF] flex-shrink-0">admin_panel_settings</span>
                  <p className="text-[11px] font-mono text-[#00BFFF]">
                    {lang === 'id'
                      ? 'Tab ini hanya ditampilkan untuk peran Manajer RS / Admin — konfigurasi metrik karbon & KPI ekologi.'
                      : 'This tab is visible to Manager / Admin role only — carbon metrics & ecological KPI configuration.'}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-eco-success">eco</span>
                    {lang === 'id' ? 'Parameter Standarisasi Emisi Gas Buang (CO₂)' : 'CO₂ Emission Standarization Parameters'}
                  </h3>
                  <p className="text-xs text-on-surface-variant font-mono mt-1">
                    Formula: Reduksi CO₂ = (Baseline Waktu - Waktu Tiba Nyata) × Standar Emisi Kendaraan.
                  </p>
                </div>

                {/* Grid Input Parameter Emisi Gas Buang */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Input Emisi Mobil */}
                  <div className="p-4 rounded-xl bg-surface-container border border-surface-variant flex flex-col gap-2">
                    <label className="text-xs font-mono text-on-surface-variant uppercase tracking-wider">
                      {lang === 'id' ? 'Emisi Mobil (Gram CO₂ / Detik)' : 'Car Emission (g CO₂ / sec)'}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={settings.emisiMobilPerDetik}
                      onChange={(e) => handleInputChange('emisiMobilPerDetik', parseFloat(e.target.value) || 0)}
                      className="bg-surface-container-lowest border border-outline px-3 py-2 rounded-lg text-sm text-on-surface font-mono focus:border-primary outline-none"
                    />
                    <span className="text-[11px] text-text-muted font-mono">
                      {lang === 'id' ? 'Standar mesin bensin 1500cc saat bergerak di basement.' : 'Standard 1500cc gasoline engine in basement movement.'}
                    </span>
                  </div>

                  {/* Input Emisi Motor */}
                  <div className="p-4 rounded-xl bg-surface-container border border-surface-variant flex flex-col gap-2">
                    <label className="text-xs font-mono text-on-surface-variant uppercase tracking-wider">
                      {lang === 'id' ? 'Emisi Motor (Gram CO₂ / Detik)' : 'Motorcycle Emission (g CO₂ / sec)'}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={settings.emisiMotorPerDetik}
                      onChange={(e) => handleInputChange('emisiMotorPerDetik', parseFloat(e.target.value) || 0)}
                      className="bg-surface-container-lowest border border-outline px-3 py-2 rounded-lg text-sm text-on-surface font-mono focus:border-primary outline-none"
                    />
                    <span className="text-[11px] text-text-muted font-mono">
                      {lang === 'id' ? 'Standar mesin motor 125-150cc operasional lambat.' : 'Standard 125-150cc engine slow cruise.'}
                    </span>
                  </div>

                  {/* Input Baseline Waktu Konvensional */}
                  <div className="p-4 rounded-xl bg-surface-container border border-surface-variant flex flex-col gap-2">
                    <label className="text-xs font-mono text-on-surface-variant uppercase tracking-wider">
                      {lang === 'id' ? 'Baseline Waktu Konvensional (Menit)' : 'Conventional Search Baseline (Mins)'}
                    </label>
                    <input
                      type="number"
                      value={settings.baselineWaktuMencari}
                      onChange={(e) => handleInputChange('baselineWaktuMencari', parseInt(e.target.value) || 1)}
                      className="bg-surface-container-lowest border border-outline px-3 py-2 rounded-lg text-sm text-on-surface font-mono focus:border-primary outline-none"
                    />
                    <span className="text-[11px] text-text-muted font-mono">
                      {lang === 'id' ? 'Waktu rata-rata mencari slot tanpa sistem navigasi.' : 'Average search duration without smart navigation.'}
                    </span>
                  </div>

                  {/* Input Target Reduksi Efisiensi */}
                  <div className="p-4 rounded-xl bg-surface-container border border-surface-variant flex flex-col gap-2">
                    <label className="text-xs font-mono text-on-surface-variant uppercase tracking-wider">
                      {lang === 'id' ? 'Target Reduksi Efisiensi (%)' : 'Carbon Reduction Target (%)'}
                    </label>
                    <input
                      type="number"
                      value={settings.targetReduksiPersen}
                      onChange={(e) => handleInputChange('targetReduksiPersen', parseInt(e.target.value) || 0)}
                      className="bg-surface-container-lowest border border-outline px-3 py-2 rounded-lg text-sm text-on-surface font-mono focus:border-primary outline-none"
                    />
                    <span className="text-[11px] text-text-muted font-mono">
                      {lang === 'id' ? 'Target KPI reduksi karbon pada dashboard manajemen.' : 'KPI target on executive dashboard.'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Panel Tab: Sensor IoT & Basement (Khusus Peran Petugas Lapangan) */}
            {activeTab === 'iot' && (
              <div className="space-y-6">
                {/* Lencana hak akses Petugas Lapangan */}
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-eco-success/10 border border-eco-success/30">
                  <span className="material-symbols-outlined text-[18px] text-eco-success flex-shrink-0">engineering</span>
                  <p className="text-[11px] font-mono text-eco-success">
                    {lang === 'id'
                      ? 'Tab ini hanya ditampilkan untuk peran Petugas Lapangan — konfigurasi telemetri sensor fisik basement.'
                      : 'This tab is visible to Field Operator role only — basement physical sensor telemetry configuration.'}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#ffd700]">sensors</span>
                    {lang === 'id' ? 'Konfigurasi Telemetri Sensor Ultrasonic (16 Unit)' : 'Ultrasonic Sensor Telemetry Config (16 Units)'}
                  </h3>
                  <p className="text-xs text-on-surface-variant font-mono mt-1">
                    {lang === 'id'
                      ? 'Atur sensitivitas dan toleransi sensor untuk mencegah false-positive saat ada manusia lewat.'
                      : 'Adjust sensor debounce to prevent false positives from pedestrian movement.'}
                  </p>
                </div>

                {/* Grid Input Parameter Sensor */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Input Debounce Stabilisasi Objek */}
                  <div className="p-4 rounded-xl bg-surface-container border border-surface-variant flex flex-col gap-2">
                    <label className="text-xs font-mono text-on-surface-variant uppercase tracking-wider">
                      {lang === 'id' ? 'Debounce Stabilisasi Objek (Detik)' : 'Debounce Filter Duration (Secs)'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="15"
                      value={settings.debounceWaktuDetik}
                      onChange={(e) => handleInputChange('debounceWaktuDetik', parseInt(e.target.value) || 1)}
                      className="bg-surface-container-lowest border border-outline px-3 py-2 rounded-lg text-sm text-on-surface font-mono focus:border-primary outline-none"
                    />
                    <span className="text-[11px] text-text-muted font-mono">
                      {lang === 'id'
                        ? 'Durasi objek harus diam sebelum sensor mengubah status menjadi TERISI.'
                        : 'Object must remain stationary for this duration before marking slot OCCUPIED.'}
                    </span>
                  </div>

                  {/* Input Timeout Heartbeat MQTT */}
                  <div className="p-4 rounded-xl bg-surface-container border border-surface-variant flex flex-col gap-2">
                    <label className="text-xs font-mono text-on-surface-variant uppercase tracking-wider">
                      {lang === 'id' ? 'Timeout Heartbeat MQTT (Detik)' : 'MQTT Heartbeat Timeout (Secs)'}
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="60"
                      value={settings.sensorTimeoutDetik}
                      onChange={(e) => handleInputChange('sensorTimeoutDetik', parseInt(e.target.value) || 5)}
                      className="bg-surface-container-lowest border border-outline px-3 py-2 rounded-lg text-sm text-on-surface font-mono focus:border-primary outline-none"
                    />
                    <span className="text-[11px] text-text-muted font-mono">
                      {lang === 'id' ? 'Batas sebelum sensor dinyatakan OFFLINE / Anomali Hardware.' : 'Maximum duration before sensor is flagged OFFLINE.'}
                    </span>
                  </div>
                </div>

                {/* Sakelar Checkbox Pembuatan Tiket Anomali Otomatis */}
                <div className="p-4 rounded-xl bg-surface-container border border-surface-variant space-y-3">
                  <p className="text-xs font-bold font-mono text-on-surface uppercase tracking-wider">
                    {lang === 'id' ? 'Tindakan Otomatis Anomali Sensor:' : 'Automatic Anomaly Trigger:'}
                  </p>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoAlertAnomali}
                      onChange={(e) => handleInputChange('autoAlertAnomali', e.target.checked)}
                      className="w-4 h-4 accent-primary rounded"
                    />
                    <span className="text-xs font-mono text-on-surface">
                      {lang === 'id'
                        ? 'Otomatis buat tiket LogOperasionalIoT tingkat CRITICAL saat sensor mati mendadak'
                        : 'Automatically raise CRITICAL incident log if a sensor drops abruptly'}
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Panel Tab: Kamera ANPR & Model AI (Khusus Peran Petugas Lapangan) */}
            {activeTab === 'anpr' && (
              <div className="space-y-6">
                {/* Lencana hak akses Petugas Lapangan */}
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-eco-success/10 border border-eco-success/30">
                  <span className="material-symbols-outlined text-[18px] text-eco-success flex-shrink-0">engineering</span>
                  <p className="text-[11px] font-mono text-eco-success">
                    {lang === 'id'
                      ? 'Tab ini hanya ditampilkan untuk peran Petugas Lapangan — konfigurasi parameter kamera ANPR & model AI.'
                      : 'This tab is visible to Field Operator role only — ANPR camera & AI model parameter configuration.'}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#7ad0ff]">videocam</span>
                    {lang === 'id' ? 'Ambang Batas Model AI (YOLOv11 + OCR)' : 'AI Vision Parameters (YOLOv11 + OCR)'}
                  </h3>
                  <p className="text-xs text-on-surface-variant font-mono mt-1">
                    {lang === 'id'
                      ? 'Konfigurasi integrasi computer vision pada 4 gerbang masuk & keluar.'
                      : 'Vision recognition thresholds for 4 automated gate cameras.'}
                  </p>
                </div>

                {/* Grid Input Pengaturan Ambang Batas Keyakinan dan FPS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Penggeser Slider Ambang Batas Keyakinan OCR */}
                  <div className="p-4 rounded-xl bg-surface-container border border-surface-variant flex flex-col gap-2">
                    <label className="text-xs font-mono text-on-surface-variant uppercase tracking-wider">
                      {lang === 'id' ? 'Confidence Threshold Minimum (%)' : 'Minimum Confidence Threshold (%)'}
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="50"
                        max="98"
                        value={settings.confidenceThreshold}
                        onChange={(e) => handleInputChange('confidenceThreshold', parseInt(e.target.value))}
                        className="flex-1 accent-primary"
                      />
                      <span className="font-mono font-bold text-sm text-primary w-12 text-right">
                        {settings.confidenceThreshold}%
                      </span>
                    </div>
                    <span className="text-[11px] text-text-muted font-mono">
                      {lang === 'id'
                        ? 'Tingkat akurasi minimum pembacaan nomor polisi kendaraan.'
                        : 'Minimum acceptable OCR string recognition accuracy.'}
                    </span>
                  </div>

                  {/* Input Target FPS Streaming Video Kamera */}
                  <div className="p-4 rounded-xl bg-surface-container border border-surface-variant flex flex-col gap-2">
                    <label className="text-xs font-mono text-on-surface-variant uppercase tracking-wider">
                      {lang === 'id' ? 'Target Frame Rate (FPS) Stream' : 'Target Stream Frame Rate (FPS)'}
                    </label>
                    <input
                      type="number"
                      value={settings.kameraStreamFps}
                      onChange={(e) => handleInputChange('kameraStreamFps', parseInt(e.target.value) || 15)}
                      className="bg-surface-container-lowest border border-outline px-3 py-2 rounded-lg text-sm text-on-surface font-mono focus:border-primary outline-none"
                    />
                    <span className="text-[11px] text-text-muted font-mono">
                      {lang === 'id' ? 'Optimalisasi bandwidth RTSP jaringan lokal gerbang.' : 'LAN RTSP video bandwidth optimization.'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Panel Tab: Kebijakan Retensi Data (Khusus Peran Manajemen RS / Admin) */}
            {activeTab === 'retention' && (
              <div className="space-y-6">
                {/* Lencana hak akses Manajemen RS */}
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#00BFFF]/10 border border-[#00BFFF]/30">
                  <span className="material-symbols-outlined text-[18px] text-[#00BFFF] flex-shrink-0">admin_panel_settings</span>
                  <p className="text-[11px] font-mono text-[#00BFFF]">
                    {lang === 'id'
                      ? 'Tab ini hanya ditampilkan untuk peran Manajer RS / Admin — kebijakan siklus hidup dan retensi data log IoT.'
                      : 'This tab is visible to Manager / Admin role only — data lifecycle and IoT log retention policy configuration.'}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-warning-reserved">auto_delete</span>
                    {lang === 'id' ? 'Kebijakan Retensi Data & Siklus Pembersihan' : 'Data Retention & Purge Policy'}
                  </h3>
                  <p className="text-xs text-on-surface-variant font-mono mt-1">
                    {lang === 'id'
                      ? 'Konfigurasi cron job berkala pembersihan log operasional IoT sesuai kebijakan database.'
                      : 'Scheduled cron policy for periodic purge of normal IoT telemetry records.'}
                  </p>
                </div>

                {/* Kotak Pengaturan Masa Simpan Log Telemetri */}
                <div className="p-4 rounded-xl bg-surface-container border border-surface-variant space-y-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <p className="text-sm font-semibold text-on-surface">
                        {lang === 'id' ? 'Masa Simpan Log IoT Rutin' : 'Normal Telemetry Log Retention'}
                      </p>
                      <p className="text-xs text-text-muted font-mono mt-0.5">
                        {lang === 'id'
                          ? 'Log telemetri normal yang lebih lama dari batas ini akan di-purge secara otomatis.'
                          : 'Normal telemetry logs older than this limit will be purged by daily cron.'}
                      </p>
                    </div>
                    {/* Input numerik hari retensi */}
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="7"
                        max="365"
                        value={settings.retensiHari}
                        onChange={(e) => handleInputChange('retensiHari', parseInt(e.target.value) || 30)}
                        className="w-24 bg-surface-container-lowest border border-outline px-3 py-1.5 rounded-lg text-sm text-on-surface font-mono text-center outline-none focus:border-primary"
                      />
                      <span className="text-xs font-mono text-on-surface-variant">{lang === 'id' ? 'Hari' : 'Days'}</span>
                    </div>
                  </div>

                  {/* Keterangan jadwal pembersihan cron dan service backend */}
                  <div className="border-t border-surface-variant pt-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-on-surface-variant">{lang === 'id' ? 'Jadwal Cron Pembersihan:' : 'Cron Purge Schedule:'}</span>
                      <span className="text-system-info font-bold">02:00 WIB (Daily)</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-on-surface-variant">{lang === 'id' ? 'Status Service Backend:' : 'Backend Service Status:'}</span>
                      <span className="text-eco-success font-bold">DataRetentionService.java (ACTIVE)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Panel Tab: Akun & Keamanan (Profil Pengguna dan Penggantian Kata Sandi) */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">manage_accounts</span>
                    {lang === 'id' ? 'Profil Pengguna & Keamanan Akun' : 'Operator Profile & Account Security'}
                  </h3>
                  <p className="text-xs text-on-surface-variant font-mono mt-1">
                    {lang === 'id' ? 'Informasi akun operator aktif dan pengaturan kata sandi.' : 'Active session profile and password security settings.'}
                  </p>
                </div>

                {/* Grid Rincian Identitas Pengguna Aktif (Username, NIP, Nama Lengkap, Peran Akses) */}
                <div className="p-4 rounded-xl bg-surface-container border border-surface-variant grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="text-[11px] font-mono text-text-muted uppercase">Username</span>
                    <p className="text-sm font-bold font-mono text-on-surface mt-0.5">{currentUser.username || 'petugas01'}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-text-muted uppercase">NIP</span>
                    <p className="text-sm font-bold font-mono text-primary mt-0.5">{currentUser.nip || '-'}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-text-muted uppercase">{lang === 'id' ? 'Nama Lengkap' : 'Full Name'}</span>
                    <p className="text-sm font-semibold text-on-surface mt-0.5">{currentUser.namaLengkap || 'Petugas Lapangan'}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-text-muted uppercase">{lang === 'id' ? 'Peran Akses' : 'Role Access'}</span>
                    <span className="inline-block mt-0.5 px-2 py-0.5 bg-primary/20 text-primary border border-primary/40 rounded text-xs font-mono font-bold">
                      {currentUser.role || 'PETUGAS_LAPANGAN'}
                    </span>
                  </div>
                </div>

                {/* Formulir Pengubahan Kata Sandi Akun */}
                <form onSubmit={handleGantiPassword} className="p-4 rounded-xl bg-surface-container border border-surface-variant space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold font-mono text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-primary">lock_reset</span>
                      {lang === 'id' ? 'Perbarui Kata Sandi Akun:' : 'Change Account Password:'}
                    </p>
                    {/* Lencana konfirmasi jika seluruh ketentuan kata sandi terpenuhi */}
                    {pwdAllValid && (
                      <span className="text-[10px] font-mono text-eco-success flex items-center gap-1 bg-eco-success/10 border border-eco-success/30 px-2 py-0.5 rounded-full">
                        <span className="material-symbols-outlined text-[12px]">verified</span>
                        {lang === 'id' ? 'Ketentuan Terpenuhi' : 'Requirements Met'}
                      </span>
                    )}
                  </div>
                  
                  {/* Grid Input Password Baru dan Konfirmasi Password */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Kolom Isian Password Baru */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-mono text-on-surface-variant">{lang === 'id' ? 'Password Baru' : 'New Password'}</label>
                        <span className="text-[10px] font-mono text-primary font-semibold">{lang === 'id' ? 'Min. 8 Karakter' : 'Min. 8 Chars'}</span>
                      </div>
                      <div className="relative flex items-center">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          placeholder={lang === 'id' ? 'Minimal 8 karakter' : 'Min. 8 characters'}
                          value={settings.passwordBaru}
                          onChange={(e) => handleInputChange('passwordBaru', e.target.value)}
                          className="w-full bg-surface-container-lowest border border-outline px-3 pr-10 py-2 rounded-lg text-sm text-on-surface font-mono outline-none focus:border-primary transition-colors"
                        />
                        {/* Tombol intip sandi (toggle visibility) */}
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-2.5 text-text-muted hover:text-on-surface p-1 focus:outline-none cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {showNewPassword ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Kolom Isian Konfirmasi Password */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-mono text-on-surface-variant">{lang === 'id' ? 'Konfirmasi Password' : 'Confirm Password'}</label>
                        {/* Indikator status kecocokan kata sandi */}
                        {settings.konfirmasiPassword && (
                          <span className={`text-[10px] font-mono font-semibold ${pwdMatch ? 'text-eco-success' : 'text-rose-400'}`}>
                            {pwdMatch ? (lang === 'id' ? '✓ Cocok' : '✓ Match') : (lang === 'id' ? '✗ Belum cocok' : '✗ Mismatch')}
                          </span>
                        )}
                      </div>
                      <div className="relative flex items-center">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder={lang === 'id' ? 'Ulangi password baru' : 'Repeat new password'}
                          value={settings.konfirmasiPassword}
                          onChange={(e) => handleInputChange('konfirmasiPassword', e.target.value)}
                          className="w-full bg-surface-container-lowest border border-outline px-3 pr-10 py-2 rounded-lg text-sm text-on-surface font-mono outline-none focus:border-primary transition-colors"
                        />
                        {/* Tombol intip konfirmasi sandi */}
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-2.5 text-text-muted hover:text-on-surface p-1 focus:outline-none cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {showConfirmPassword ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Kotak Daftar Ketentuan Keamanan Kata Sandi Dinamis */}
                  <div className="p-3 rounded-lg bg-surface-container-lowest border border-surface-variant flex flex-col gap-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted font-semibold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px] text-primary">shield_lock</span>
                      {lang === 'id' ? 'Ketentuan Kata Sandi' : 'Password Requirements'}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono">
                      {/* Syarat 1: Minimal 8 karakter */}
                      <span className={`flex items-center gap-1.5 transition-colors ${pwdLengthValid ? 'text-eco-success' : 'text-text-muted'}`}>
                        <span className="material-symbols-outlined text-[15px]">
                          {pwdLengthValid ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        {lang === 'id' ? 'Min. 8 karakter' : 'Min. 8 characters'}
                      </span>
                      {/* Syarat 2: Mengandung kombinasi angka */}
                      <span className={`flex items-center gap-1.5 transition-colors ${pwdNumberValid ? 'text-eco-success' : 'text-text-muted'}`}>
                        <span className="material-symbols-outlined text-[15px]">
                          {pwdNumberValid ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        {lang === 'id' ? 'Kombinasi angka' : 'Include numbers'}
                      </span>
                      {/* Syarat 3: Mengandung simbol atau karakter khusus */}
                      <span className={`flex items-center gap-1.5 transition-colors ${pwdSpecialValid ? 'text-eco-success' : 'text-text-muted'}`}>
                        <span className="material-symbols-outlined text-[15px]">
                          {pwdSpecialValid ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        {lang === 'id' ? 'Karakter khusus' : 'Special character'}
                      </span>
                    </div>
                  </div>

                  {/* Tombol Simpan Pembaruan Password */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary text-on-primary text-xs font-mono font-bold rounded-lg hover:bg-primary/90 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[15px]">check</span>
                      {lang === 'id' ? 'Perbarui Password' : 'Save New Password'}
                    </button>
                  </div>
                </form>

                {/* Sakelar Checkbox Audio Alarm Anomali */}
                <div className="p-4 rounded-xl bg-surface-container border border-surface-variant space-y-3">
                  <p className="text-xs font-bold font-mono text-on-surface uppercase tracking-wider">
                    {lang === 'id' ? 'Preferensi Audio Alarm:' : 'Audio Alert Settings:'}
                  </p>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.audioAlarmAnomali}
                      onChange={(e) => handleInputChange('audioAlarmAnomali', e.target.checked)}
                      className="w-4 h-4 accent-primary rounded"
                    />
                    <span className="text-xs font-mono text-on-surface">
                      {lang === 'id'
                        ? 'Aktifkan bunyi peringatan audio (Buzzer/Beep) di Dashboard jika terdeteksi Anomali CRITICAL'
                        : 'Enable audible buzzer alert on Dashboard whenever a CRITICAL anomaly is detected'}
                    </span>
                  </label>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </AppLayout>
  );
}
