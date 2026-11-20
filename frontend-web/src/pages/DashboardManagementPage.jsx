// Import hook useState, useEffect, dan useRef dari React untuk manajemen state, efek samping siklus hidup, dan referensi elemen DOM
import { useState, useEffect, useRef } from 'react';
// Import komponen tata letak AppLayout dari '../components/AppLayout' sebagai wadah antarmuka utama halaman pengawasan manajemen
import AppLayout from '../components/AppLayout';
// Import pustaka Chart dari 'chart.js/auto' untuk visualisasi grafik analitik interaktif berbasis canvas HTML5
import Chart from 'chart.js/auto';
// Import hook useLanguage dari '../context/LanguageContext' untuk dukungan multi-bahasa (internasionalisasi i18n)
import { useLanguage } from '../context/LanguageContext';

// Deklarasi konstanta DEFAULT_MOBIL_SLOTS berisi daftar 16 kode slot parkir mobil pada Basement Lantai 1
const DEFAULT_MOBIL_SLOTS = [
  'B1-01', 'B1-02', 'B1-03', 'B1-04', 'B1-05', 'B1-06', 'B1-07', 'B1-08',
  'B1-09', 'B1-10', 'B1-11', 'B1-12', 'B1-13', 'B1-14', 'B1-15', 'B1-16'
];

// Deklarasi konstanta DEFAULT_MOTOR_SLOTS berisi daftar 16 kode slot parkir motor pada Basement Lantai 1
const DEFAULT_MOTOR_SLOTS = [
  'M1-01', 'M1-02', 'M1-03', 'M1-04', 'M1-05', 'M1-06', 'M1-07', 'M1-08',
  'M1-09', 'M1-10', 'M1-11', 'M1-12', 'M1-13', 'M1-14', 'M1-15', 'M1-16'
];

// Alias DEFAULT_SLOTS untuk kompatibilitas bawaan
const DEFAULT_SLOTS = DEFAULT_MOBIL_SLOTS;

// Deklarasi konstanta CURRENT_CALENDAR_YEAR untuk label kalender tahun berjalan
const CURRENT_CALENDAR_YEAR = new Date().getFullYear();

// Deklarasi fungsi komponen publik DashboardManagementPage sebagai modul pengawasan analitik eksekutif
export default function DashboardManagementPage() {
  // Destrukturisasi fungsi translasi t dan variabel kode bahasa aktif lang dari LanguageContext
  const { t, lang } = useLanguage();
  // Inisialisasi state data bertipe objek/null dengan nilai awal null untuk menampung data ringkasan analitik dari backend
  const [data, setData] = useState(null);
  // Inisialisasi state isLoading bertipe boolean dengan nilai awal true untuk menandai proses pemuatan data awal
  const [isLoading, setIsLoading] = useState(true);
  // Inisialisasi state networkPing bertipe number/null untuk menyimpan nilai latensi respon jaringan ke server dalam milidetik (ms)
  const [networkPing, setNetworkPing] = useState(null);

  // Inisialisasi state isListModalOpen bertipe boolean bernilai awal false untuk mengontrol visibilitas modal tabel riwayat 10 anomali
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  // Inisialisasi state anomaliList bertipe array dengan nilai awal [] untuk menyimpan daftar 10 log anomali terbaru
  const [anomaliList, setAnomaliList] = useState([]);
  // Inisialisasi state isLoadingAnomali bertipe boolean bernilai awal false untuk menandai status pemuatan log anomali
  const [isLoadingAnomali, setIsLoadingAnomali] = useState(false);

  // Inisialisasi state isNodeMapModalOpen bertipe boolean bernilai awal false untuk mengontrol visibilitas modal denah spasial Lantai 1
  const [isNodeMapModalOpen, setIsNodeMapModalOpen] = useState(false);
  // Inisialisasi state slotsList bertipe array dengan nilai awal [] untuk menampung daftar status 16 slot sensor lantai 1
  const [slotsList, setSlotsList] = useState([]);
  // Inisialisasi state nodeAnomaliMap bertipe objek dengan nilai awal {} untuk memetakan insiden anomali berdasarkan kode slot
  const [nodeAnomaliMap, setNodeAnomaliMap] = useState({});
  // Inisialisasi state selectedSlotNode bertipe string/null untuk menyimpan kode slot yang sedang aktif dipilih pada denah visual
  const [selectedSlotNode, setSelectedSlotNode] = useState(null);
  // Inisialisasi state isLoadingNodeMap bertipe boolean bernilai awal false untuk menandai status pemuatan data denah spasial
  const [isLoadingNodeMap, setIsLoadingNodeMap] = useState(false);

  // Inisialisasi state anomaliFilter bertipe string ('ALL' | 'MOBIL' | 'MOTOR') untuk filter daftar riwayat log anomali
  const [anomaliFilter, setAnomaliFilter] = useState('ALL');
  // Inisialisasi state nodeMapCategory bertipe string ('MOBIL' | 'MOTOR') untuk tab denah visual peta node sensor
  const [nodeMapCategory, setNodeMapCategory] = useState('MOBIL');

  // Inisialisasi state revenuePeriod bertipe string ('BULANAN' | 'TAHUNAN' | 'SEMUA') untuk filter periode kartu pendapatan
  const [revenuePeriod, setRevenuePeriod] = useState('BULANAN');

  // Membaca preferensi target efisiensi dari pengaturan sistem lokal jika tersedia di peramban
  const [systemSettings] = useState(() => {
    // Mengecek apakah objek window dan localStorage tersedia
    if (typeof window !== 'undefined') {
      try {
        // Mengambil string konfigurasi dari localStorage dengan kunci spct_system_settings
        const saved = localStorage.getItem('spct_system_settings');
        // Jika data konfigurasi ditemukan, parsing JSON dan kembalikan objeknya
        if (saved) return JSON.parse(saved);
      } catch (e) {
        // Mencatat pesan kegagalan jika parsing preferensi gagal
        console.error('Gagal membaca preferensi sistem:', e);
      }
    }
    // Nilai default target reduksi persentase emisi karbon 65%
    return { targetReduksiPersen: 65, baselineWaktuMenit: 12 };
  });

  // Inisialisasi state isLight bertipe boolean untuk mendeteksi mode tema terang (light theme) secara adaptif
  const [isLight, setIsLight] = useState(() => {
    // Mengecek apakah objek window dan document tersedia di peramban
    if (typeof document !== 'undefined') {
      // Mengembalikan true jika kelas CSS root mengandung 'light-theme' atau preferensi localStorage bernilai 'light'
      return document.documentElement.classList.contains('light-theme') || localStorage.getItem('spct_theme') === 'light';
    }
    // Nilai default adalah false (tema gelap default)
    return false;
  });

  // Hook useEffect untuk mengamati perubahan kelas tema pada elemen root HTML secara dinamis
  useEffect(() => {
    // Memastikan objek document tersedia di peramban
    if (typeof document === 'undefined') return;
    // Inisialisasi pengamat mutasi DOM untuk mendeteksi penambahan atau penghapusan kelas 'light-theme'
    const observer = new MutationObserver(() => {
      // Memperbarui nilai state isLight saat atribut class pada elemen <html> berubah
      setIsLight(document.documentElement.classList.contains('light-theme'));
    });
    // Menjalankan observasi pada atribut elemen root HTML
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    // Membersihkan observer saat komponen di-unmount
    return () => observer.disconnect();
  }, []);

  // Inisialisasi ref chartRef untuk mereferensikan elemen HTML5 canvas grafik pendapatan
  const chartRef = useRef(null);
  // Inisialisasi ref chartInstanceRef untuk menyimpan instance aktif objek grafik Chart.js agar dapat dihancurkan saat update
  const chartInstanceRef = useRef(null);

  // Deklarasi fungsi fetchDashboardData untuk mengambil data analitik dan mengukur latensi round-trip jaringan ke backend
  const fetchDashboardData = () => {
    // Catat stempel waktu presisi tinggi saat request dimulai menggunakan performance.now()
    const startTime = performance.now();
    // Melakukan panggilan HTTP GET ke endpoint analitik dashboard backend
    fetch('http://localhost:8081/api/analitik/dashboard')
      // Tangani respon awal dari server backend
      .then(res => {
        // Hitung selisih waktu penyelesaian request dalam milidetik dan bulatkan nilainya
        const ping = Math.round(performance.now() - startTime);
        // Simpan nilai latensi ping jaringan ke state networkPing
        setNetworkPing(ping);
        // Parsing badan respon HTTP menjadi format JSON
        return res.json();
      })
      // Tangani data JSON yang telah berhasil di-parsing
      .then(res => {
        // Simpan payload data analitik ke dalam state data
        setData(res);
        // Nonaktifkan indikator loading utama karena data analitik telah siap
        setIsLoading(false);
      })
      // Tangani kegagalan koneksi atau error selama proses fetch berlangsung
      .catch(err => {
        // Cetak pesan kegagalan ke konsol peramban untuk keperluan debugging
        console.error("Gagal mengambil data analitik:", err);
        // Set nilai ping 999 ms sebagai penanda kondisi timeout jaringan atau server offline
        setNetworkPing(999);
        // Matikan indikator loading agar antarmuka fallback dapat dirender
        setIsLoading(false);
      });
  };

  // Hook useEffect untuk menjalankan pengambilan data analitik pertama kali dan menjadwalkan interval polling real-time
  useEffect(() => {
    // Memanggil fungsi fetchDashboardData saat komponen pertama kali dimuat ke DOM
    fetchDashboardData();
    // Mengatur interval polling pembaruan data analitik setiap 2 detik (2000 ms) agar sinkron secara real-time
    const interval = setInterval(fetchDashboardData, 2000);
    // Mengembalikan fungsi pembersih untuk menghentikan timer interval saat komponen di-unmount dari DOM
    return () => clearInterval(interval);
  }, []); // Array dependensi kosong menandakan efek samping hanya diinisialisasi sekali pada fase mounting

  // Deklarasi fungsi pembantu extractSlotId untuk mengekstrak kode identifikasi slot dari objek log telemetri
  const extractSlotId = (log) => {
    // Jika objek log memiliki relasi slotTerkait dan idSlot, kembalikan idSlot asli
    if (log.slotTerkait && log.slotTerkait.idSlot) return log.slotTerkait.idSlot;
    // Jika terdapat teks pada field catatanDetail, lakukan pencarian pola kode slot menggunakan ekspresi reguler (regex)
    if (log.catatanDetail) {
      // Cari kemunculan pola Slot B1-xx atau M1-xx pada teks catatan detail
      const match = log.catatanDetail.match(/Slot\s+([BM]1-\d{2})/i);
      // Jika pola ditemukan, kembalikan kode slot dalam format huruf kapital
      if (match) return match[1].toUpperCase();
    }
    // Jika unitId mencerminkan kode sensor slot seperti SNS-B1-xx atau SNS-M1-xx
    if (log.unitId && log.unitId.startsWith('SNS-')) {
      return log.unitId.replace('SNS-', '');
    }
    // Kembalikan null jika kode slot tidak dapat diekstraksi dari objek log
    return null;
  };

  // Deklarasi fungsi getLogVehicleType untuk mengklasifikasikan rekaman log berdasarkan kategori kendaraan
  const getLogVehicleType = (log) => {
    // Ekstrak kode slot terkait atau id unit hardware
    const rawSlot = (log.slotTerkait?.idSlot || extractSlotId(log) || '').toUpperCase();
    // Ekstrak teks deskripsi insiden dalam huruf kecil
    const detail = (log.catatanDetail || '').toLowerCase();
    // Ekstrak pengenal perangkat keras
    const unit = (log.unitId || '').toUpperCase();
    // Jika mengandung awalan M atau kata kunci motor, kategorikan sebagai MOTOR
    if (rawSlot.startsWith('M') || detail.includes('motor') || unit.includes('MOT') || unit.startsWith('SNS-M')) {
      return 'MOTOR';
    }
    // Jika mengandung awalan B atau kata kunci mobil, kategorikan sebagai MOBIL
    if (rawSlot.startsWith('B') || detail.includes('mobil') || unit.includes('MOB') || unit.startsWith('SNS-B')) {
      return 'MOBIL';
    }
    // Kategori default hardware umum
    return 'GENERAL';
  };

  // Deklarasi fungsi openAnomaliListModal untuk memicu pemuatan data dan membuka modal daftar 10 riwayat anomali
  const openAnomaliListModal = () => {
    // Buka tampilan dialog modal riwayat anomali
    setIsListModalOpen(true);
    // Aktifkan indikator pemuatan log anomali
    setIsLoadingAnomali(true);
    // Melakukan panggilan HTTP GET ke endpoint riwayat log operasional IoT
    fetch('http://localhost:8081/api/monitoring/log-iot')
      // Konversi respon HTTP menjadi objek array JSON
      .then(res => res.json())
      // Tangani array log yang berhasil diterima dari server
      .then(logs => {
        // Ambil 10 data log paling awal/terbaru menggunakan metode slice(0, 10) dan simpan ke state
        setAnomaliList(logs.slice(0, 10));
        // Matikan indikator pemuatan log anomali
        setIsLoadingAnomali(false);
      })
      // Tangani potensi kesalahan request jaringan
      .catch(err => {
        // Cetak pesan error ke konsol peramban
        console.error("Gagal mengambil log anomali:", err);
        // Matikan indikator pemuatan log anomali
        setIsLoadingAnomali(false);
      });
  };

  // Deklarasi fungsi asinkron openNodeMapModal untuk memuat denah visual dan pemetaan insiden spasial lantai 1
  const openNodeMapModal = async () => {
    // Buka tampilan modal peta denah spasial node
    setIsNodeMapModalOpen(true);
    // Aktifkan indikator pemuatan data peta denah
    setIsLoadingNodeMap(true);
    // Reset slot yang sedang terpilih menjadi null
    setSelectedSlotNode(null);

    // Blok try-catch-finally untuk menangani pemuatan data paralel secara aman
    try {
      // Melakukan request paralel secara simultan ke endpoint monitoring slots dan log IoT via Promise.all
      const [slotsRes, logsRes] = await Promise.all([
        fetch('http://localhost:8081/api/monitoring/slots'),
        fetch('http://localhost:8081/api/monitoring/log-iot')
      ]);

      // Parsing respon daftar slot jika HTTP status OK, fallback ke array kosong jika gagal
      const slots = slotsRes.ok ? await slotsRes.json() : [];
      // Parsing respon daftar log jika HTTP status OK, fallback ke array kosong jika gagal
      const logs = logsRes.ok ? await logsRes.json() : [];

      // Perbarui state slotsList dengan data server jika ada, atau fallback ke 16 slot standar
      setSlotsList(slots.length > 0 ? slots : DEFAULT_SLOTS.map(id => ({ idSlot: id })));

      // Ambil 10 rekaman log operasional IoT paling mutakhir
      const latest10 = logs.slice(0, 10);
      // Inisialisasi objek pengelompokan anomali berdasarkan ID slot
      const anomaliGroup = {};
      // Inisialisasi variabel penampung kode slot anomali pertama yang ditemukan untuk auto-fokus
      let firstErrorSlot = null;

      // Iterasi setiap objek log untuk mengidentifikasi keberadaan insiden anomali
      latest10.forEach(log => {
        // Ekstrak kode slot dari rekaman log
        const slotId = extractSlotId(log);
        // Evaluasi apakah log tersebut berkategori anomali atau berstatus keparahan CRITICAL
        const isAnomaly = log.tingkatKeparahan === 'CRITICAL' || log.jenisKejadian?.includes('ANOMALI');

        // Jika kode slot valid dan rekaman merupakan anomali, masukkan ke dalam kelompok anomali slot
        if (slotId && isAnomaly) {
          // Jika entri slot belum ada pada objek grup, buat array penampung baru
          if (!anomaliGroup[slotId]) {
            anomaliGroup[slotId] = [];
            // Simpan slot anomali pertama yang ditemukan sebagai default pilihan
            if (!firstErrorSlot) firstErrorSlot = slotId;
          }
          // Tambahkan rekaman log ke daftar insiden slot tersebut
          anomaliGroup[slotId].push(log);
        }
      });

      // Simpan pemetaan anomali slot ke dalam state nodeAnomaliMap
      setNodeAnomaliMap(anomaliGroup);
      // Jika ditemukan slot dengan anomali, jadikan slot tersebut terpilih secara otomatis
      if (firstErrorSlot) {
        setSelectedSlotNode(firstErrorSlot);
        // Sesuaikan kategori denah dengan slot anomali pertama jika diawali M
        if (firstErrorSlot.startsWith('M')) {
          setNodeMapCategory('MOTOR');
        } else {
          setNodeMapCategory('MOBIL');
        }
      } else {
        // Jika tidak ada anomali, pilih slot standar pertama sesuai tab aktif
        setSelectedSlotNode(nodeMapCategory === 'MOTOR' ? 'M1-01' : 'B1-01');
      }
    } catch (e) {
      // Cetak pesan kesalahan ke konsol jika pemuatan data denah spasial gagal
      console.error("Gagal memuat denah node log:", e);
    } finally {
      // Matikan indikator pemuatan denah spasial baik proses berhasil maupun gagal
      setIsLoadingNodeMap(false);
    }
  };

  // Hook useEffect untuk memastikan penghancuran instance grafik Chart.js saat komponen dilepas dari DOM (unmount)
  useEffect(() => {
    return () => {
      // Periksa apakah instance chart masih aktif sebelum memanggil destroy saat komponen ditutup
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, []); // Array dependensi kosong agar pembersihan hanya terjadi saat unmount

  // Hook useEffect untuk merender atau memperbarui visualisasi grafik garis Chart.js saat data analitik, tema, atau periode filter berubah
  useEffect(() => {
    // Batalkan eksekusi jika data analitik belum siap atau elemen canvas grafik belum terpasang di DOM
    if (!data || !chartRef.current) return;

    // Inisialisasi daftar nama 12 bulan kalender standar untuk periode Tahunan (Jan s.d. Des)
    const DEFAULT_BULAN_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    // Menentukan array titik data aktif berdasarkan filter periode
    let activeChartData = [];
    // Label dataset untuk tooltip Chart.js
    let activeDatasetLabel = 'Pendapatan Harian (Rp)';

    // Pemilihan dataset berdasarkan pilihan filter periode pendapatan
    if (revenuePeriod === 'TAHUNAN') {
      // Periode Tahunan: Mengambil data rekapitulasi 12 bulan (Jan - Des) dari backend
      const rawData = data.grafikPendapatanBulanan;
      if (Array.isArray(rawData) && rawData.length > 0) {
        activeChartData = rawData;
      } else {
        // Fallback: Bentuk 12 titik data bulan secara lengkap agar grafik pertumbuhan tetap tampil persis seperti bulanan
        activeChartData = DEFAULT_BULAN_NAMES.map((bln, idx) => ({
          hari: idx + 1,
          labelTanggal: bln,
          nominal: 0
        }));
      }
      activeDatasetLabel = 'Pendapatan Bulanan (Rp)';
    } else if (revenuePeriod === 'SEMUA') {
      // Periode Semua: Mengambil data histori kumulatif database all-time dari backend
      const rawData = data.grafikPendapatanSemua;
      if (Array.isArray(rawData) && rawData.length > 0) {
        activeChartData = rawData;
      } else {
        // Fallback: Bentuk titik data historis multi-periode agar grafik pertumbuhan tetap tampil rapi
        const defaultPeriods = ['Jun 26', 'Jul 26', 'Agu 26', 'Sep 26', 'Okt 26', 'Nov 26'];
        activeChartData = defaultPeriods.map((prd, idx) => ({
          hari: idx + 1,
          labelTanggal: prd,
          nominal: 0
        }));
      }
      activeDatasetLabel = 'Pendapatan Historis (Rp)';
    } else {
      // Periode Bulanan (default): Mengambil data harian tanggal 1 s.d. hari ini dari backend
      const rawData = data.grafikPendapatanHarian;
      if (Array.isArray(rawData) && rawData.length > 0) {
        activeChartData = rawData;
      } else {
        // Fallback harian bulan berjalan (minimal 10 hari)
        const todayDate = new Date().getDate();
        activeChartData = Array.from({ length: Math.max(todayDate, 10) }, (_, i) => ({
          hari: i + 1,
          labelTanggal: `Tgl ${i + 1}`,
          nominal: 0
        }));
      }
      activeDatasetLabel = 'Pertumbuhan Akumulatif (Rp)';
    }

    // Petakan label sumbu X berdasarkan properti labelTanggal atau nomor hari
    const labels = activeChartData.map(item => {
      // Jika periode bulanan, tampilkan format 'Tgl X'
      if (revenuePeriod === 'BULANAN') {
        return item.labelTanggal && item.labelTanggal.startsWith('Tgl') ? item.labelTanggal : `Tgl ${item.hari}`;
      }
      // Jika periode tahunan atau semua, gunakan labelTanggal (misal: "Jan", "Feb" atau "Okt 26")
      return item.labelTanggal || `P-${item.hari}`;
    });

    // Petakan nilai numerik nominal pendapatan dasar dari dataset aktif
    const rawValues = activeChartData.map(item => Number(item.nominal) || 0);

    // Untuk periode BULANAN atau SEMUA, pastikan nilai membentuk kurva pertumbuhan akumulatif kontinu (running total)
    // agar visualisasi selalu stabil menanjak atau mendatar, tidak naik-turun tajam atau anjlok ke nol
    let values = rawValues;
    if (revenuePeriod === 'BULANAN' || revenuePeriod === 'SEMUA') {
      let isStrictlyNonDecreasing = true;
      for (let i = 1; i < rawValues.length; i++) {
        if (rawValues[i] < rawValues[i - 1]) {
          isStrictlyNonDecreasing = false;
          break;
        }
      }
      // Jika nilai belum berformat akumulasi berjalan, konversi deretan nilai ke running total
      if (!isStrictlyNonDecreasing) {
        let runningAccumulator = 0;
        values = rawValues.map(nominal => {
          runningAccumulator += nominal;
          return runningAccumulator;
        });
      }
    }

    // Deteksi apakah tema aktif saat ini adalah tema cerah (light mode) dengan memeriksa kelas dokumen
    const isLightChart = isLight;
    // Tentukan warna garis grid grafik yang adaptif terhadap tema aktif
    const gridColor = isLightChart ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.05)';
    // Tentukan warna batas lingkaran titik grafik (point border) adaptif tema
    const pointBorder = isLightChart ? '#ffffff' : '#050B14';
    // Tentukan warna teks label penanda (tick) sumbu adaptif tema
    const tickColor = isLightChart ? '#64748b' : '#94A3B8';

    // Dapatkan konteks 2 dimensi (2D context) dari elemen canvas HTML5
    const ctx = chartRef.current.getContext('2d');
    // Buat gradien linear vertikal untuk efek visual area bawah kurva grafik
    const gradient = ctx.createLinearGradient(0, 0, 0, 150);
    // Beri warna awal hijau translusen di bagian atas kurva
    gradient.addColorStop(0, 'rgba(46, 139, 87, 0.45)');
    // Beri warna transparan penuh di bagian bawah kurva
    gradient.addColorStop(1, 'rgba(46, 139, 87, 0.0)');

    // Jika objek grafik Chart.js sudah terbentuk sebelumnya, perbarui data secara in-place tanpa animasi dan tanpa recreasi objek
    if (chartInstanceRef.current) {
      const chart = chartInstanceRef.current;
      // Perbarui label sumbu X
      chart.data.labels = labels;
      // Perbarui judul keterangan dataset
      chart.data.datasets[0].label = activeDatasetLabel;
      // Perbarui array data nominal pendapatan
      chart.data.datasets[0].data = values;
      // Perbarui gradien latar belakang kurva
      chart.data.datasets[0].backgroundColor = gradient;
      // Perbarui border titik data sesuai tema
      chart.data.datasets[0].pointBorderColor = pointBorder;

      // Perbarui warna sumbu X dan Y sesuai tema
      chart.options.scales.x.grid.color = gridColor;
      chart.options.scales.x.ticks.color = tickColor;
      chart.options.scales.y.grid.color = gridColor;
      chart.options.scales.y.ticks.color = tickColor;

      // Perbarui warna tooltip sesuai tema
      chart.options.plugins.tooltip.backgroundColor = isLightChart ? '#ffffff' : '#0F172A';
      chart.options.plugins.tooltip.borderColor = isLightChart ? '#cbd5e1' : '#334155';
      chart.options.plugins.tooltip.titleColor = isLightChart ? '#0f172a' : '#ffffff';
      chart.options.plugins.tooltip.bodyColor = isLightChart ? '#0f172a' : '#ffffff';

      // Eksekusi pembaruan grafik instan tanpa animasi ('none') untuk mencegah visualisasi berkedip / memantul berkala
      chart.update('none');
      return;
    }

    // Inisialisasi awal objek instance grafik Chart.js tipe line dengan animasi dinonaktifkan
    chartInstanceRef.current = new Chart(ctx, {
      type: 'line', // Menentukan jenis visualisasi berupa diagram garis kontinu
      data: {
        labels: labels, // Label sumbu horizontal berupa deretan label tanggal/bulan
        datasets: [{
          label: activeDatasetLabel, // Label dataset untuk keterangan tooltip
          data: values, // Deretan data nominal pendapatan akumulatif
          borderColor: '#10b981', // Warna garis kurva hijau emerald
          borderWidth: 2.5, // Ketebalan garis kurva 2.5 piksel
          backgroundColor: gradient, // Latar belakang arsiran bawah kurva berupa gradien
          fill: true, // Aktifkan pengisian warna di bawah garis kurva
          tension: 0.25, // Kelengkungan kurva spline stabil
          cubicInterpolationMode: 'monotone', // Mencegah osilasi dan overshoot agar kurva tidak naik-turun anjlok
          pointBackgroundColor: '#10b981', // Warna isi lingkaran titik data
          pointBorderColor: pointBorder, // Warna bingkai titik data adaptif tema
          pointHoverRadius: 6, // Ukuran radius titik saat kursor mouse melayang di atasnya
          pointRadius: 4, // Ukuran radius titik data normal
        }]
      },
      options: {
        animation: false, // Matikan animasi entrance agar kurva langsung tampil stabil tanpa memantul naik-turun tiap polling
        responsive: true, // Grafik menyesuaikan lebar kontainer secara responsif
        maintainAspectRatio: false, // Memungkinkan canvas mengisi tinggi kontainer fleksibel
        plugins: {
          legend: { display: false }, // Sembunyikan legenda default untuk tampilan yang lebih bersih
          tooltip: {
            backgroundColor: isLightChart ? '#ffffff' : '#0F172A', // Warna latar kotak tooltip adaptif tema
            borderColor: isLightChart ? '#cbd5e1' : '#334155', // Warna border tooltip
            borderWidth: 1, // Ketebalan border tooltip
            titleColor: isLightChart ? '#0f172a' : '#ffffff', // Warna teks judul tooltip
            bodyColor: isLightChart ? '#0f172a' : '#ffffff', // Warna teks isi tooltip
            titleFont: { family: 'Space Grotesk', size: 12 }, // Konfigurasi font judul tooltip
            bodyFont: { family: 'Space Grotesk', size: 13, weight: 'bold' }, // Konfigurasi font isi tooltip
            callbacks: {
              // Format angka nominal ke standar mata uang Rupiah Indonesia
              label: (context) => `Rp ${Number(context.raw).toLocaleString('id-ID')}`
            }
          }
        },
        scales: {
          x: {
            grid: { color: gridColor }, // Terapkan warna garis panduan vertikal adaptif tema
            ticks: {
              color: tickColor, // Warna teks penanda sumbu X
              font: { family: 'Space Grotesk', size: 11 } // Gaya font penanda sumbu X
            }
          },
          y: {
            beginAtZero: true, // Sumbu vertikal selalu dimulai dari angka 0
            grid: { color: gridColor }, // Terapkan warna garis panduan horizontal adaptif tema
            ticks: {
              color: tickColor, // Warna teks penanda sumbu Y
              font: { family: 'Space Grotesk', size: 10 }, // Gaya font penanda sumbu Y
              // Format nominal ribuan dengan akhiran 'k' untuk keterbacaan yang ringkas
              callback: (val) => val >= 1000 ? `${val / 1000}k` : val
            }
          }
        }
      }
    });
  }, [data, isLight, revenuePeriod]); // Efek samping dieksekusi saat data analitik, tema, atau filter periode berubah

  // Jika aplikasi masih dalam fase pemuatan awal data analitik, tampilkan indikator loading
  if (isLoading) {
    return (
      // Membungkus antarmuka pemuatan dengan komponen AppLayout berstatus 'Loading...'
      <AppLayout breadcrumb="Management Oversight" status="Loading...">
        {/* Kontainer flexbox di tengah layar untuk indikator animasi loading */}
        <div className="flex h-full items-center justify-center">
          {/* Teks animasi berdenyut penanda pemuatan data analitik */}
          <div className="text-xl text-primary font-mono animate-pulse">Memuat Data Analitik...</div>
        </div>
      </AppLayout>
    );
  }

  // Objek fallback data analitik aman dengan nilai default nol untuk mencegah runtime exception jika koneksi backend bermasalah
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
    totalSensor: 16,
    totalSensorAktif: 16,
    totalTransaksiLunas: 0,
    rataRataTarifTransaksi: 0,
    revenuePerSlot: 0,
    occupancyRateSaatIni: 0,
    totalKendaraanHariIni: 0,
    grafikOkupansiPerJam: [],
    grafikPendapatanHarian: [],
    pendapatanTahunan: 0,
    totalTransaksiLunasTahunan: 0,
    totalTransaksiLunasSemua: 0,
    grafikPendapatanBulanan: [],
    grafikPendapatanSemua: []
  };

  // Nilai pendapatan harian dengan fallback ke pendapatan total atau nol
  const pendapatanHariIniVal = safeData.pendapatanHariIni ?? safeData.pendapatanTotal ?? 0;
  // Nilai pendapatan bulanan dengan fallback ke pendapatan total atau nol
  const pendapatanBulananVal = safeData.pendapatanBulanan ?? safeData.pendapatanTotal ?? 0;
  // Nilai pendapatan tahunan dengan fallback ke pendapatan total atau nol
  const pendapatanTahunanVal = safeData.pendapatanTahunan ?? safeData.pendapatanTotal ?? 0;
  // Nilai pendapatan all-time sepanjang masa dengan fallback ke nol
  const pendapatanTotalVal = safeData.pendapatanTotal ?? 0;

  // Nilai nominal pendapatan aktif yang ditampilkan pada kartu utama sesuai filter periode aktif
  const activeRevenueDisplayVal = revenuePeriod === 'BULANAN'
    ? pendapatanBulananVal
    : revenuePeriod === 'TAHUNAN'
    ? pendapatanTahunanVal
    : pendapatanTotalVal;

  // Kuantitas transaksi lunas yang mendasari periode aktif
  const activeTrxLunasCount = revenuePeriod === 'BULANAN'
    ? (safeData.totalTransaksiLunas || 0)
    : revenuePeriod === 'TAHUNAN'
    ? (safeData.totalTransaksiLunasTahunan ?? safeData.totalTransaksiLunas ?? 0)
    : (safeData.totalTransaksiLunasSemua ?? safeData.totalTransaksiLunas ?? 0);

  // Perhitungan tarif rata-rata per kendaraan sesuai transaksi lunas periode aktif
  const activeAvgFeeVal = activeTrxLunasCount > 0
    ? Math.round(Number(activeRevenueDisplayVal) / activeTrxLunasCount)
    : 0;

  // Menghitung kapasitas total slot mobil di Basement Lantai 1
  const mobilTotal = safeData.slotMobilTotal || 16;
  // Menghitung jumlah slot mobil yang sedang terisi saat ini
  const mobilTerisi = safeData.slotMobilTerisi != null ? safeData.slotMobilTerisi : (safeData.slotTerisiSaatIni != null ? Math.min(safeData.slotTerisiSaatIni, mobilTotal) : 1);
  // Menghitung persentase okupansi zona mobil dibatasi maksimal 100%
  const pctMobil = Math.min(100, Math.round((mobilTerisi / mobilTotal) * 100));
  // Menentukan status kepadatan zona mobil berdasarkan ambang batas persentase
  const statusMobil = pctMobil > 80 ? (lang === 'en' ? 'Crowded' : 'Padat') : (pctMobil >= 50 ? (lang === 'en' ? 'Moderate' : 'Sedang') : 'Normal');
  // Menentukan kelas warna teks Tailwind berdasarkan tingkat kepadatan zona mobil
  const colorMobil = pctMobil > 80 ? 'text-alert-anomaly' : (pctMobil >= 50 ? 'text-warning-reserved' : 'text-eco-success');
  // Menentukan kelas warna border kontainer berdasarkan tingkat kepadatan zona mobil
  const borderColorMobil = pctMobil > 80 ? 'border-alert-anomaly' : (pctMobil >= 50 ? 'border-warning-reserved' : 'border-eco-success');
  // Menentukan kelas warna latar progress bar berdasarkan tingkat kepadatan zona mobil
  const barBgMobil = pctMobil > 80 ? 'bg-alert-anomaly' : (pctMobil >= 50 ? 'bg-warning-reserved' : 'bg-eco-success');

  // Menghitung kapasitas total slot motor di Basement Lantai 1 (kalkulasi dinamis dari database)
  const motorTotal = safeData.slotMotorTotal || 16;
  // Menghitung jumlah slot motor yang sedang terisi saat ini dari telemetri sensor
  const motorTerisi = safeData.slotMotorTerisi != null ? safeData.slotMotorTerisi : 2;
  // Menghitung persentase okupansi zona motor dibatasi maksimal 100%
  const pctMotor = Math.min(100, Math.round((motorTerisi / motorTotal) * 100));
  // Menentukan status kepadatan zona motor berdasarkan ambang batas persentase
  const statusMotor = pctMotor > 80 ? (lang === 'en' ? 'Crowded' : 'Padat') : (pctMotor >= 50 ? (lang === 'en' ? 'Moderate' : 'Sedang') : 'Normal');
  // Menentukan kelas warna teks Tailwind berdasarkan tingkat kepadatan zona motor
  const colorMotor = pctMotor > 80 ? 'text-alert-anomaly' : (pctMotor >= 50 ? 'text-warning-reserved' : 'text-eco-success');
  // Menentukan kelas warna border kontainer berdasarkan tingkat kepadatan zona motor
  const borderColorMotor = pctMotor > 80 ? 'border-alert-anomaly' : (pctMotor >= 50 ? 'border-warning-reserved' : 'border-eco-success');
  // Menentukan kelas warna latar progress bar berdasarkan tingkat kepadatan zona motor
  const barBgMotor = pctMotor > 80 ? 'bg-alert-anomaly' : (pctMotor >= 50 ? 'bg-warning-reserved' : 'bg-eco-success');

  // Menentukan total transaksi lunas yang tercatat di database
  const totalTransaksiLunasVal = safeData.totalTransaksiLunas ?? 0;
  // Menghitung tarif rata-rata per transaksi lunas (Average Fee per Vehicle)
  const avgFeeVal = safeData.rataRataTarifTransaksi ?? (totalTransaksiLunasVal > 0 ? Math.round(pendapatanBulananVal / totalTransaksiLunasVal) : 0);
  // Menghitung imbal hasil pendapatan per kapasitas slot fisik (Revenue per Available Slot - RevPAS)
  const revenuePerSlotVal = safeData.revenuePerSlot ?? (mobilTotal > 0 ? Math.round(pendapatanBulananVal / mobilTotal) : 0);

  // Deklarasi array konfigurasi kartu informasi kepadatan zona parkir (Zona Mobil dan Zona Motor)
  const ZONES = [
    { 
      name: lang === 'en' ? 'Car Zone' : 'Zona Mobil', 
      desc: `Basement Lantai 1 (${mobilTerisi} dari ${mobilTotal} Slot)`, 
      pct: pctMobil, 
      colorClass: colorMobil, 
      status: statusMobil, 
      borderColor: borderColorMobil,
      barBg: barBgMobil
    },
    { 
      name: lang === 'en' ? 'Motorcycle Zone' : 'Zona Motor', 
      desc: `Basement Lantai 1 (${motorTerisi} dari ${motorTotal} Slot)`, 
      pct: pctMotor, 
      colorClass: colorMotor, 
      status: statusMotor, 
      borderColor: borderColorMotor,
      barBg: barBgMotor
    },
  ];

  // Deklarasi array 4 metrik kinerja utama (KPI) eksekutif manajemen
  const KPI_DATA = [
    { 
      label: t('mgmt.totalRevenue', 'Pendapatan Hari Ini'), 
      value: `Rp ${Number(pendapatanHariIniVal).toLocaleString('id-ID')}`, 
      sub: `${safeData.persentasePendapatan >= 0 ? '+' : ''}${safeData.persentasePendapatan}% vs ${lang === 'en' ? 'Yesterday' : 'Kemarin'}`, 
      icon: 'payments', 
      color: 'text-eco-success' 
    },
    { 
      label: t('mgmt.totalTransactions', 'Total Kendaraan'), 
      value: (safeData.totalKendaraan ?? 0).toLocaleString('id-ID'), 
      sub: `${safeData.totalKendaraanHariIni || 0} ${lang === 'en' ? 'Vehicles Today' : 'Masuk Hari Ini'}`, 
      icon: 'directions_car', 
      color: 'text-primary' 
    },
    { 
      label: t('mgmt.co2Reduction', 'CO2 Dicegah'), 
      value: `${safeData.reduksiCo2Kg} kg`, 
      sub: `${safeData.persentaseCo2}% vs Target ${systemSettings?.targetReduksiPersen || 65}%`, 
      icon: 'eco', 
      color: 'text-secondary' 
    },
    { 
      label: 'Avg Fee / Kendaraan', 
      value: `Rp ${Number(avgFeeVal).toLocaleString('id-ID')}`, 
      sub: `${totalTransaksiLunasVal} ${lang === 'en' ? 'Paid Transactions' : 'Transaksi Lunas Bulan Ini'}`, 
      icon: 'receipt_long', 
      color: 'text-tertiary' 
    },
  ];

  // Menentukan jumlah sensor ultrasonik aktif saat ini (default 16 unit)
  const sensorAktif = safeData.totalSensorAktif ?? 16;
  // Menentukan kapasitas total unit sensor ultrasonik yang terpasang di fasilitas
  const totalSensor = safeData.totalSensor ?? 16;
  // Menghitung persentase keaktifan sensor (health percentage)
  const sensorPct = totalSensor > 0 ? Math.round((sensorAktif / totalSensor) * 100) : 100;

  // Menentukan daftar slot denah aktif berdasarkan tab kategori kendaraan yang dipilih
  const activeGridSlots = nodeMapCategory === 'MOTOR' ? DEFAULT_MOTOR_SLOTS : DEFAULT_MOBIL_SLOTS;
  // Membagi slot denah aktif menjadi 2 baris (Baris 1: 8 slot pertama)
  const row1Slots = activeGridSlots.slice(0, 8);
  // Baris 2 denah (8 slot berikutnya)
  const row2Slots = activeGridSlots.slice(8, 16);

  // Mengembalikan elemen antarmuka JSX halaman pengawasan manajemen eksekutif
  return (
    // Membungkus seluruh antarmuka dengan komponen AppLayout
    <AppLayout breadcrumb={t('topbar.mgmtOversight', 'Management Oversight')} status={t('topbar.systemHealthy', 'System Optimal')}>
      {/* Definisi styling animasi CSS inline untuk efek denyut merah peringatan anomali (pulse-anomaly) */}
      <style>{`
        .pulse-anomaly { animation: pulse-red 2s infinite; }
        @keyframes pulse-red {
          0%   { box-shadow: 0 0 0 0 rgba(255,69,0,0.7); border-color: #FF4500; }
          70%  { box-shadow: 0 0 0 10px rgba(255,69,0,0); border-color: transparent; }
          100% { box-shadow: 0 0 0 0 rgba(255,69,0,0); border-color: #FF4500; }
        }
      `}</style>

      {/* Kontainer utama halaman dengan padding dan jarak vertikal antar-seksi */}
      <div className="p-6 bg-background min-h-full flex flex-col gap-6">

        {/* Seksi Header Halaman (Judul Utama & Status Pembaruan) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            {/* Judul Halaman Pengawasan Manajemen */}
            <h1 className="text-4xl md:text-5xl font-bold text-on-surface tracking-tight font-['Space_Grotesk']">
              {t('mgmt.title', 'Management Oversight')}
            </h1>
            {/* Subjudul penjelasan ringkas halaman eksekutif */}
            <p className="text-on-surface-variant text-sm md:text-base mt-2">
              {t('mgmt.subtitle', 'Ringkasan eksekutif metrik keuangan, operasional, dan reduksi emisi CO2.')}
            </p>
          </div>
          {/* Lencana status stempel waktu pembaruan data */}
          <span className="px-4 py-2 rounded-xl bg-surface-container-high border border-outline-variant font-mono text-xs md:text-sm text-on-surface shadow-sm">
            {lang === 'en' ? 'Last updated: Just now' : 'Pembaruan: Baru saja'}
          </span>
        </div>

        {/* Baris Grid 4 Kartu Indikator Kinerja Utama (KPI Cards Row) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Looping untuk merender masing-masing kartu KPI dari array KPI_DATA */}
          {KPI_DATA.map(kpi => (
            <div key={kpi.label} className="bg-bg-surface rounded-xl p-5 border border-outline-variant/30 flex flex-col gap-3 group hover:shadow-md hover:border-primary/40 transition-all duration-200">
              {/* Ikon material dan label metrik */}
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined ${kpi.color}`}>{kpi.icon}</span>
                <span className="text-on-surface-variant text-sm font-mono">{kpi.label}</span>
              </div>
              {/* Nilai numerik utama metrik yang diformat */}
              <div className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</div>
              {/* Keterangan perbandingan tren terhadap periode sebelumnya */}
              <div className="text-xs text-text-muted font-mono">{kpi.sub}</div>
            </div>
          ))}
        </div>

        {/* Grid Grafik Pendapatan Harian dan Analisis Dampak Finansial (Financial Impact) */}
        <div className="grid grid-cols-12 gap-4">
          {/* Kolom Kiri: Kartu Grafik Analitik Pendapatan dengan Filter Periode */}
          <div className="col-span-12 md:col-span-8 bg-bg-surface rounded-xl p-5 border border-outline-variant/30 flex flex-col justify-between">
            <div>
              {/* Header kartu analitik pendapatan dan kontrol filter periode */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
                {/* Judul dinamis kartu dan ikon pembayaran */}
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-eco-success">payments</span>
                  <h2 className="text-xl font-semibold text-on-surface">
                    {revenuePeriod === 'BULANAN' && 'Pendapatan Bulanan'}
                    {revenuePeriod === 'TAHUNAN' && 'Pendapatan Tahunan'}
                    {revenuePeriod === 'SEMUA' && 'Pendapatan Sepanjang Waktu'}
                  </h2>
                </div>

                {/* Kontrol Tombol Pil Filter Periode: Bulanan | Tahunan | Semua */}
                <div className="flex items-center gap-1 bg-surface-container-highest/60 p-1 rounded-lg border border-outline-variant/30">
                  <button
                    type="button"
                    onClick={() => setRevenuePeriod('BULANAN')}
                    className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
                      revenuePeriod === 'BULANAN'
                        ? 'bg-eco-success text-bg-base shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    Bulanan
                  </button>
                  <button
                    type="button"
                    onClick={() => setRevenuePeriod('TAHUNAN')}
                    className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
                      revenuePeriod === 'TAHUNAN'
                        ? 'bg-eco-success text-bg-base shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    Tahunan
                  </button>
                  <button
                    type="button"
                    onClick={() => setRevenuePeriod('SEMUA')}
                    className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
                      revenuePeriod === 'SEMUA'
                        ? 'bg-eco-success text-bg-base shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    Semua
                  </button>
                </div>
              </div>

              {/* Sub-header: Keterangan konteks rentang dan lencana penanda aktif */}
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-text-muted font-mono">
                  {revenuePeriod === 'BULANAN' && 'Rekapitulasi transaksi lunas bulan kalender berjalan'}
                  {revenuePeriod === 'TAHUNAN' && `Rekapitulasi riil 12 bulan kalender tahun ${CURRENT_CALENDAR_YEAR}`}
                  {revenuePeriod === 'SEMUA' && 'Rekapitulasi seluruh riwayat transaksi lunas sejak sistem beroperasi'}
                </span>
                {/* Lencana penanda periode aktif */}
                <span className="px-2.5 py-1 bg-eco-success/20 text-eco-success rounded text-xs font-mono font-bold border border-eco-success/30">
                  {revenuePeriod === 'BULANAN' && `Bulan Berjalan (${safeData.grafikPendapatanHarian?.length || 1} Hari)`}
                  {revenuePeriod === 'TAHUNAN' && `Tahun ${CURRENT_CALENDAR_YEAR} (12 Bulan)`}
                  {revenuePeriod === 'SEMUA' && `Histori Database (${activeTrxLunasCount} Trx)`}
                </span>
              </div>

              {/* Teks angka besar akumulasi pendapatan kotor sesuai periode aktif */}
              <div className="text-[44px] font-bold text-eco-success tracking-tighter leading-none mb-4 font-mono">
                Rp {Number(activeRevenueDisplayVal).toLocaleString('id-ID')}
              </div>
            </div>

            {/* Kontainer Kanvas HTML5 untuk Rendering Grafik Chart.js */}
            <div className="w-full h-44 relative mt-2">
              {/* Elemen canvas yang direferensikan ke chartRef */}
              <canvas ref={chartRef}></canvas>
            </div>
            {/* Catatan kaki metodologi perhitungan pendapatan sesuai filter aktif */}
            <div className="text-right text-[11px] text-text-muted font-mono mt-2">
              {revenuePeriod === 'BULANAN' && '*Pertumbuhan pendapatan akumulatif harian dari tanggal 1 s.d. hari ini'}
              {revenuePeriod === 'TAHUNAN' && `*Rekapitulasi pendapatan riil per bulan pada tahun berjalan ${CURRENT_CALENDAR_YEAR}`}
              {revenuePeriod === 'SEMUA' && '*Akumulasi pendapatan riil seluruh transaksi lunas sejak sistem beroperasi'}
            </div>
          </div>

          {/* Kolom Kanan: Kartu Analisis Dampak Finansial & Efisiensi Okupansi */}
          <div className="col-span-12 md:col-span-4 bg-bg-surface rounded-xl p-5 border border-outline-variant/30 flex flex-col gap-5">
            {/* Header seksi Financial Impact */}
            <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-4">
              <span className="material-symbols-outlined text-primary">insert_chart</span>
              <h2 className="text-xl font-semibold text-on-surface">Financial Impact</h2>
            </div>
            {/* Kotak Metrik Tarif Rata-rata per Kendaraan (Avg Fee per Vehicle) */}
            <div className="bg-surface-container p-4 rounded-lg border border-outline-variant/20">
              <span className="font-mono text-sm text-on-surface-variant block mb-1">Avg Fee per Vehicle</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl text-primary font-bold">
                  Rp {Number(activeAvgFeeVal).toLocaleString('id-ID')}
                </span>
                {/* Indikator transaksi lunas yang mendasari perhitungan rata-rata */}
                <span className="text-eco-success font-mono text-xs flex items-center gap-1" title="Rata-rata pembayaran per transaksi lunas pada periode aktif">
                  <span className="material-symbols-outlined text-[16px]">info</span>{activeTrxLunasCount} Transaksi Lunas
                </span>
              </div>
            </div>
            {/* Kotak Metrik Imbal Hasil Okupansi & Pendapatan per Kapasitas Slot (RevPAS) */}
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
                  Okupansi Fisik Saat Ini ({safeData.slotTerisiSaatIni || 0}/{mobilTotal} Slot)
                </span>
              </div>
              {/* Batang kemajuan (progress bar) persentase okupansi zona parkir */}
              <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${barBgMobil}`} 
                  style={{ width: `${Math.max(pctMobil, 4)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Grid Reduksi Emisi Karbon (CO2 Savings) dan Kesehatan Sistem Perangkat Keras (System Health) */}
        <div className="grid grid-cols-12 gap-4">
          {/* Kolom Kiri: Kartu Penghematan Emisi Gas Buang CO2 (Diagram Donat SVG) */}
          <div className="col-span-12 md:col-span-5 bg-bg-surface rounded-xl p-5 border border-outline-variant/30 flex flex-col items-center justify-center">
            {/* Header kartu penghematan CO2 */}
            <div className="flex items-center gap-2 mb-4 self-start">
              <span className="material-symbols-outlined text-eco-success">eco</span>
              <h2 className="text-lg font-semibold text-on-surface">CO2 Savings</h2>
            </div>
            {/* Visualisasi diagram lingkaran donat SVG untuk pencapaian reduksi emisi */}
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Lingkaran latar belakang abu-abu transparan */}
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#30363a" strokeWidth="12" className="co2-track transition-colors duration-200" />
                {/* Lingkaran hijau progres dengan panjang dasharray terhitung secara matematis */}
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#2E8B57" strokeWidth="12"
                  strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * safeData.persentaseCo2 / 100)} strokeLinecap="round"
                  className="drop-shadow-[0_0_6px_rgba(46,139,87,0.6)]" />
              </svg>
              {/* Teks persentase pencapaian target emisi di pusat diagram donat */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl text-eco-success font-bold tracking-tighter">{safeData.persentaseCo2}%</span>
                <span className="font-mono text-xs text-text-muted uppercase tracking-wider">Tercapai</span>
              </div>
            </div>
            {/* Keterangan total berat emisi CO2 yang berhasil dicegah dalam kilogram */}
            <div className="mt-4 text-center">
              <div className="font-mono text-2xl text-on-surface font-bold">{safeData.reduksiCo2Kg} kg</div>
              <div className="text-sm text-on-surface-variant">Emisi dicegah total berdasarkan sensor IoT</div>
            </div>
          </div>

          {/* Kolom Kanan: Kartu Kesehatan Sistem Operasional & Latensi Jaringan */}
          <div className="col-span-12 md:col-span-7 bg-bg-surface rounded-xl p-5 border border-outline-variant/30 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-system-info">memory</span>
                <h2 className="text-xl font-semibold text-on-surface">System Health</h2>
              </div>
              
              {/* Tombol aksi 'View Node Logs' untuk membuka modal denah spasial visual Lantai 1 */}
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
              {/* Kotak Informasi Sensor Aktif Real-Time */}
              <div className="bg-surface-container p-4 rounded-lg border border-outline-variant/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">sensors</span>
                  <span className="font-mono text-sm text-on-surface-variant">Active Sensors</span>
                </div>
                <div className="text-4xl text-on-surface font-bold leading-none font-mono">
                  {sensorAktif} <span className="text-sm text-text-muted font-normal font-sans">/ {totalSensor} Unit</span>
                </div>
                <div className="text-eco-success font-mono text-sm mt-1">{sensorPct}% Up</div>
                {/* Batang indikator rasio keaktifan sensor fisik */}
                <div className="w-full bg-surface-container-highest rounded-full h-1 mt-3">
                  <div className="bg-eco-success h-full rounded-full" style={{ width: `${sensorPct}%` }}></div>
                </div>
              </div>

              {/* Kotak Informasi Latensi Respon Jaringan (Network Ping) */}
              <div className="bg-surface-container p-4 rounded-lg border border-outline-variant/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">wifi</span>
                  <span className="font-mono text-sm text-on-surface-variant">Network Status</span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  {/* Animasi spinner lingkaran status latensi jaringan */}
                  <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <div className="absolute inset-0 rounded-full border-2 border-system-info/30"></div>
                    <div className="absolute inset-0 rounded-full border-t-2 border-system-info animate-spin"></div>
                    <span className="material-symbols-outlined text-system-info text-[24px]">router</span>
                  </div>
                  <div>
                    {/* Status stabilitas jaringan berdasarkan ambang batas ping 100ms */}
                    <span className={`font-mono text-lg font-bold ${networkPing && networkPing < 100 ? 'text-system-info' : 'text-warning-reserved'}`}>
                      {networkPing === null ? 'Checking...' : (networkPing < 100 ? 'Stable' : 'Slow')}
                    </span>
                    <p className="text-xs text-text-muted font-mono">
                      Ping: {networkPing !== null ? `${networkPing}ms` : '--'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Banner Peringatan Anomali Aktif (Interaktif: Klik untuk membuka modal 10 riwayat log) */}
              <div 
                onClick={openAnomaliListModal}
                className="col-span-2 bg-error-container/10 p-4 rounded-lg border border-alert-anomaly/30 flex items-center justify-between group cursor-pointer hover:bg-error-container/20 transition-all shadow-sm"
              >
                <div className="flex items-center gap-3">
                  {/* Ikon peringatan segitiga bahaya dengan animasi denyut jika ada anomali */}
                  <div className="w-10 h-10 rounded-full bg-alert-anomaly/20 flex items-center justify-center border border-alert-anomaly/50 relative">
                    {safeData.totalAnomali > 0 && (
                      <div className="absolute inset-0 rounded-full bg-alert-anomaly animate-ping opacity-20"></div>
                    )}
                    <span className="material-symbols-outlined text-alert-anomaly">warning</span>
                  </div>
                  <div>
                    {/* Judul status anomali sistem */}
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
                {/* Ikon panah penunjuk interaktivitas tombol */}
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-on-surface transition-colors">chevron_right</span>
              </div>
            </div>
          </div>
        </div>

        {/* Seksi Visualisasi Tingkat Kepadatan per Zona Parkir (Zone Occupancy) */}
        <div className="bg-bg-surface rounded-xl p-5 border border-outline-variant/30">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface">map</span>
              <h2 className="text-xl font-semibold text-on-surface">Tingkat Kepadatan per Zona</h2>
            </div>
            {/* Legenda visual kategori kepadatan: Normal, Sedang, dan Padat */}
            <div className="flex gap-4 text-sm">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-eco-success inline-block"></span><span className="text-text-muted font-mono">Normal (&lt;50%)</span></span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-warning-reserved inline-block"></span><span className="text-text-muted font-mono">Sedang (50-80%)</span></span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-alert-anomaly inline-block"></span><span className="text-text-muted font-mono">Padat (&gt;80%)</span></span>
            </div>
          </div>
          {/* Grid kartu sektor zona parkir */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Looping untuk merender kartu status masing-masing zona parkir dari array ZONES */}
            {ZONES.map(sector => (
              <div key={sector.name} className={`bg-surface-container rounded-lg p-4 ${sector.borderColor} border-l-4 hover:bg-surface-bright transition-colors relative overflow-hidden`}>
                <h3 className="font-mono text-base text-on-surface font-bold mb-1">{sector.name}</h3>
                <p className="text-xs text-on-surface-variant mb-4">{sector.desc}</p>
                <div className="flex items-end justify-between">
                  <span className="text-3xl text-on-surface font-bold font-mono">{sector.pct}%</span>
                  <span className={`font-mono text-xs mb-1 ${sector.colorClass}`}>{sector.status}</span>
                </div>
                {/* Batang indikator kemajuan kepadatan zona */}
                <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-2">
                  <div className={`${sector.barBg} h-full rounded-full transition-all duration-500`} style={{ width: `${sector.pct}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal 1: Dialog Pop-up Tabel Kronologis 10 Log Anomali Terakhir */}
        {isListModalOpen && (
          // Lapisan latar belakang transparan gelap dengan efek blur
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
            {/* Kontainer kartu dialog modal dengan warna adaptif tema aktif */}
            <div className={`${isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0B1526] border-slate-700/80 text-white'} border rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl transition-colors`}>
              
              {/* Header Modal Daftar Log Anomali */}
              <div className={`flex items-center justify-between p-6 border-b ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#08101E] border-slate-700/60'}`}>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-alert-anomaly text-2xl">warning</span>
                  <div>
                    <h2 className={`text-xl font-bold font-['Space_Grotesk'] ${isLight ? 'text-slate-900' : 'text-white'}`}>10 Log Anomali & Operasional IoT Terakhir</h2>
                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Data riil kronologis langsung dari tabel <code className={isLight ? 'text-sky-600 font-semibold' : 'text-sky-300'}>log_operasional_iot</code> database.</p>
                  </div>
                </div>
                {/* Tombol silang untuk menutup modal */}
                <button 
                  onClick={() => setIsListModalOpen(false)}
                  className={`p-2 rounded-lg transition-colors cursor-pointer ${isLight ? 'text-slate-500 hover:text-slate-900 bg-slate-200/70 hover:bg-slate-300' : 'text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700'}`}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Badan Konten Modal (Daftar Log Anomali Kronologis) */}
              <div className={`p-6 overflow-y-auto flex-1 flex flex-col gap-3 ${isLight ? 'bg-white' : ''}`}>
                
                {/* Bilah Tombol Filter Kategori Kendaraan: Semua, Mobil, dan Motor */}
                <div className={`flex items-center gap-2 p-2.5 rounded-xl border mb-1 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#08101E] border-slate-700/60'}`}>
                  <span className={`text-xs font-mono font-semibold ml-1 mr-1 flex items-center gap-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    <span className="material-symbols-outlined text-[15px]">filter_alt</span>
                    Filter:
                  </span>
                  <button 
                    type="button"
                    onClick={() => setAnomaliFilter('ALL')}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      anomaliFilter === 'ALL'
                        ? (isLight ? 'bg-sky-600 text-white shadow-sm' : 'bg-primary text-on-primary shadow-sm')
                        : (isLight ? 'bg-slate-200/80 text-slate-700 hover:bg-slate-300' : 'bg-slate-800 text-slate-300 hover:bg-slate-700')
                    }`}
                  >
                    Semua ({anomaliList.length})
                  </button>
                  <button 
                    type="button"
                    onClick={() => setAnomaliFilter('MOBIL')}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      anomaliFilter === 'MOBIL'
                        ? (isLight ? 'bg-sky-600 text-white shadow-sm' : 'bg-primary text-on-primary shadow-sm')
                        : (isLight ? 'bg-slate-200/80 text-slate-700 hover:bg-slate-300' : 'bg-slate-800 text-slate-300 hover:bg-slate-700')
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">directions_car</span>
                    Mobil ({anomaliList.filter(l => getLogVehicleType(l) !== 'MOTOR').length})
                  </button>
                  <button 
                    type="button"
                    onClick={() => setAnomaliFilter('MOTOR')}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      anomaliFilter === 'MOTOR'
                        ? (isLight ? 'bg-sky-600 text-white shadow-sm' : 'bg-primary text-on-primary shadow-sm')
                        : (isLight ? 'bg-slate-200/80 text-slate-700 hover:bg-slate-300' : 'bg-slate-800 text-slate-300 hover:bg-slate-700')
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">two_wheeler</span>
                    Motor ({anomaliList.filter(l => getLogVehicleType(l) === 'MOTOR').length})
                  </button>
                </div>

                {/* Kondisi jika data log masih dalam proses pengambilan */}
                {isLoadingAnomali ? (
                  <div className={`flex items-center justify-center py-12 font-mono animate-pulse ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Mengambil data log anomali dari server...
                  </div>
                ) : anomaliList.length === 0 ? (
                  // Tampilan jika tidak ditemukan rekaman log anomali di database
                  <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-2">
                    <span className="material-symbols-outlined text-4xl">check_circle</span>
                    <span>Tidak ada catatan anomali di database.</span>
                  </div>
                ) : (
                  // Daftar kartu log anomali hasil pemfilteran kategori kendaraan
                  <div className="flex flex-col gap-3">
                    {anomaliList
                      .filter(log => {
                        if (anomaliFilter === 'ALL') return true;
                        const type = getLogVehicleType(log);
                        if (anomaliFilter === 'MOBIL') return type === 'MOBIL' || type === 'GENERAL';
                        if (anomaliFilter === 'MOTOR') return type === 'MOTOR';
                        return true;
                      })
                      .map((log) => {
                        // Evaluasi status kegawatan insiden log
                        const isCritical = log.tingkatKeparahan === 'CRITICAL' || log.jenisKejadian?.includes('ANOMALI');
                        // Format stempel waktu kejadian ke format tanggal dan jam lokal Indonesia
                        const tanggal = log.waktuKejadian ? new Date(log.waktuKejadian).toLocaleString('id-ID', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit', second: '2-digit'
                        }) : '-';
                        // Ekstrak kode slot terkait insiden
                        const slotId = extractSlotId(log);
                        // Ekstrak jenis kendaraan dari log
                        const vehicleType = getLogVehicleType(log);

                        return (
                          <div 
                            key={log.idLog} 
                            className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                              isCritical 
                                ? (isLight ? 'bg-red-50/80 border-red-200' : 'bg-red-950/20 border-red-500/40') 
                                : (isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-700/50')
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <span className={`material-symbols-outlined text-xl mt-0.5 ${isCritical ? 'text-red-500' : (isLight ? 'text-sky-600' : 'text-sky-400')}`}>
                                {isCritical ? 'report' : 'info'}
                              </span>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`font-mono font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                    {slotId ? `Slot ${slotId.replace(/^M(\d+)/, 'B$1')}` : 'Hardware Node'}
                                  </span>
                                  {/* Lencana kategori zona kendaraan */}
                                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold flex items-center gap-1 ${
                                    vehicleType === 'MOTOR'
                                      ? (isLight ? 'bg-purple-100 text-purple-700 border border-purple-300' : 'bg-purple-950/60 text-purple-300 border border-purple-700/50')
                                      : (isLight ? 'bg-sky-100 text-sky-700 border border-sky-300' : 'bg-sky-950/60 text-sky-300 border border-sky-700/50')
                                  }`}>
                                    <span className="material-symbols-outlined text-[13px]">
                                      {vehicleType === 'MOTOR' ? 'two_wheeler' : 'directions_car'}
                                    </span>
                                    {vehicleType === 'MOTOR' ? 'ZONA MOTOR' : 'ZONA MOBIL'}
                                  </span>
                                  {/* Lencana jenis kejadian anomali */}
                                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                                    isCritical 
                                      ? (isLight ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-red-900/40 text-red-300 border border-red-700/40')
                                      : (isLight ? 'bg-slate-200 text-slate-700 border border-slate-300' : 'bg-slate-800 text-slate-300')
                                  }`}>
                                    {log.jenisKejadian}
                                  </span>
                                </div>
                                {/* Rincian catatan insiden operasional */}
                                <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                                  {log.catatanDetail || 'Tidak ada catatan tambahan.'}
                                </p>
                              </div>
                            </div>

                            {/* Bagian status resolusi dan stempel waktu */}
                            <div className="flex md:flex-col items-end justify-between md:justify-center gap-1 shrink-0 text-right">
                              <span className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                                {tanggal}
                              </span>
                              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                                log.statusResolusi === 'SELESAI_DIVALIDASI' 
                                  ? (isLight ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-emerald-900/30 text-emerald-300 border border-emerald-700/40')
                                  : (isLight ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-amber-900/30 text-amber-300 border border-amber-700/40')
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

              {/* Footer Modal 1 dengan tombol tutup */}
              <div className={`p-4 border-t flex justify-end ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#08101E] border-slate-700/60'}`}>
                <button
                  onClick={() => setIsListModalOpen(false)}
                  className={`px-5 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                    isLight 
                      ? 'bg-slate-200 hover:bg-slate-300 text-slate-800' 
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  Tutup
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Modal 2: Dialog Pop-up Visual Denah Spasial Lantai 1 & Pemetaan Node Anomali */}
        {isNodeMapModalOpen && (
          // Lapisan latar belakang gelap dengan efek blur
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
            {/* Kontainer modal denah spasial */}
            <div className={`${isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0B1526] border-slate-700/80 text-white'} border rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl transition-colors`}>
              
              {/* Header Modal Denah Spasial */}
              <div className={`flex items-center justify-between p-6 border-b ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#08101E] border-slate-700/60'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg flex items-center justify-center ${isLight ? 'bg-sky-100 border border-sky-300 text-sky-700' : 'bg-sky-950/80 border border-sky-500/40 text-sky-400'}`}>
                    <span className="material-symbols-outlined text-2xl">grid_view</span>
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold font-['Space_Grotesk'] flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      Peta Denah Spasial Node Sensor & Kesalahan Parkir
                    </h2>
                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Visualisasi indikasi slot yang teridentifikasi mengalami anomali atau salah parkir dari 10 log IoT terbaru.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Tombol Tab Filter Kategori Denah: Mobil vs Motor */}
                  <div className={`flex items-center p-1 rounded-xl border ${isLight ? 'bg-slate-100 border-slate-300' : 'bg-[#050B14] border-slate-700'}`}>
                    <button
                      type="button"
                      onClick={() => {
                        setNodeMapCategory('MOBIL');
                        setSelectedSlotNode('B1-01');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        nodeMapCategory === 'MOBIL'
                          ? (isLight ? 'bg-white text-sky-700 shadow-sm border border-slate-200' : 'bg-primary text-on-primary shadow-sm')
                          : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">directions_car</span>
                      Zona Mobil
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNodeMapCategory('MOTOR');
                        setSelectedSlotNode('M1-01');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        nodeMapCategory === 'MOTOR'
                          ? (isLight ? 'bg-white text-sky-700 shadow-sm border border-slate-200' : 'bg-primary text-on-primary shadow-sm')
                          : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">two_wheeler</span>
                      Zona Motor
                    </button>
                  </div>

                  {/* Legenda visual status node pada denah */}
                  <div className="hidden lg:flex items-center gap-3 text-xs font-mono">
                    <div className="flex items-center gap-1.5 text-red-500">
                      <div className="w-3 h-3 bg-red-600/30 border border-red-500 rounded-sm animate-pulse"></div>
                      <span>Anomali Terindikasi</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      <div className={`w-3 h-3 border border-dashed rounded-sm ${isLight ? 'border-slate-400' : 'border-slate-600'}`}></div>
                      <span>Node Normal</span>
                    </div>
                  </div>

                  {/* Tombol silang untuk menutup modal */}
                  <button 
                    onClick={() => setIsNodeMapModalOpen(false)}
                    className={`p-2 rounded-lg transition-colors cursor-pointer ${isLight ? 'text-slate-500 hover:text-slate-900 bg-slate-200/70 hover:bg-slate-300' : 'text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700'}`}
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              </div>

              {/* Badan Modal: Visual Grid Denah 16 Slot Parkir Basement Lantai 1 */}
              <div className={`p-6 overflow-y-auto flex-1 flex flex-col gap-6 ${isLight ? 'bg-white' : ''}`}>
                
                {/* Kondisi saat peta denah sedang dimuat */}
                {isLoadingNodeMap ? (
                  <div className={`flex items-center justify-center py-20 font-mono animate-pulse ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Memuat pemetaan denah node sensor...
                  </div>
                ) : (
                  <>
                    {/* Kotak Denah Grid Spasial Basement Lantai 1 */}
                    <div className={`rounded-xl border p-6 relative overflow-hidden shadow-inner transition-colors ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#050B14] border-slate-800'}`}>
                      
                      {/* Latar belakang grid aksen blueprint */}
                      <div className={`absolute inset-0 pointer-events-none opacity-40 bg-[size:24px_24px] ${isLight ? 'bg-[linear-gradient(rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.04)_1px,transparent_1px)]' : 'bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]'}`}></div>

                      {/* Header teks denah: LANTAI 1 dan Kategori Zona */}
                      <div className={`text-xs font-mono text-center border-y py-1.5 mb-6 uppercase tracking-widest relative z-10 font-semibold flex items-center justify-center gap-2 ${isLight ? 'text-slate-700 border-slate-300 bg-slate-200/50' : 'text-slate-300 border-slate-800 bg-slate-900/60'}`}>
                        <span className="material-symbols-outlined text-[16px] text-sky-500">
                          {nodeMapCategory === 'MOTOR' ? 'two_wheeler' : 'directions_car'}
                        </span>
                        <span>BASEMENT LANTAI 1 — {nodeMapCategory === 'MOTOR' ? 'ZONA PARKIR MOTOR (16 SLOT)' : 'ZONA PARKIR MOBIL (16 SLOT)'}</span>
                      </div>

                      {/* Baris 1: 8 Slot Parkir (B1-01 sampai B1-08) */}
                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 relative z-10 mb-3">
                        {row1Slots.map(slotId => {
                          // Evaluasi apakah slot ini tercatat memiliki anomali
                          const hasAnomaly = !!nodeAnomaliMap[slotId];
                          // Evaluasi apakah slot ini sedang dipilih oleh pengguna
                          const isSelected = selectedSlotNode === slotId;
                          // Hitung jumlah insiden anomali pada slot
                          const anomalyCount = hasAnomaly ? nodeAnomaliMap[slotId].length : 0;

                          return (
                            <div
                              key={slotId}
                              onClick={() => setSelectedSlotNode(slotId)}
                              className={`h-14 rounded-lg flex flex-col items-center justify-center font-mono text-xs cursor-pointer transition-all relative ${
                                hasAnomaly
                                  ? 'bg-alert-anomaly/20 border-2 border-alert-anomaly text-alert-anomaly pulse-anomaly hover:bg-alert-anomaly/30 shadow-[0_0_15px_rgba(255,69,0,0.4)]'
                                  : isLight 
                                    ? 'border border-slate-300 border-dashed text-slate-600 hover:border-sky-500 hover:text-slate-900 bg-white shadow-sm'
                                    : 'border border-slate-700/80 border-dashed text-slate-400 hover:border-sky-400 hover:text-slate-200 bg-[#08101E]/40'
                              } ${isSelected ? 'ring-2 ring-sky-500 scale-105 z-20' : ''}`}
                            >
                              <span className="font-bold tracking-wider">{slotId.replace(/^M(\d+)/, "B$1")}</span>
                              {/* Lencana angka jumlah anomali aktif jika ada */}
                              {hasAnomaly && (
                                <span className="text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.2 rounded-full absolute -top-2 -right-2 shadow-md">
                                  {anomalyCount}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Baris 2: 8 Slot Parkir (B1-09 sampai B1-16) */}
                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 relative z-10">
                        {row2Slots.map(slotId => {
                          // Evaluasi apakah slot ini tercatat memiliki anomali
                          const hasAnomaly = !!nodeAnomaliMap[slotId];
                          // Evaluasi apakah slot ini sedang dipilih oleh pengguna
                          const isSelected = selectedSlotNode === slotId;
                          // Hitung jumlah insiden anomali pada slot
                          const anomalyCount = hasAnomaly ? nodeAnomaliMap[slotId].length : 0;

                          return (
                            <div
                              key={slotId}
                              onClick={() => setSelectedSlotNode(slotId)}
                              className={`h-14 rounded-lg flex flex-col items-center justify-center font-mono text-xs cursor-pointer transition-all relative ${
                                hasAnomaly
                                  ? 'bg-alert-anomaly/20 border-2 border-alert-anomaly text-alert-anomaly pulse-anomaly hover:bg-alert-anomaly/30 shadow-[0_0_15px_rgba(255,69,0,0.4)]'
                                  : isLight 
                                    ? 'border border-slate-300 border-dashed text-slate-600 hover:border-sky-500 hover:text-slate-900 bg-white shadow-sm'
                                    : 'border border-slate-700/80 border-dashed text-slate-400 hover:border-sky-400 hover:text-slate-200 bg-[#08101E]/40'
                              } ${isSelected ? 'ring-2 ring-sky-500 scale-105 z-20' : ''}`}
                            >
                              <span className="font-bold tracking-wider">{slotId.replace(/^M(\d+)/, "B$1")}</span>
                              {/* Lencana angka jumlah anomali aktif jika ada */}
                              {hasAnomaly && (
                                <span className="text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.2 rounded-full absolute -top-2 -right-2 shadow-md">
                                  {anomalyCount}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                    </div>

                    {/* Panel Rincian Detail Insiden untuk Slot yang Sedang Terpilih */}
                    <div className={`border rounded-xl p-5 transition-colors ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#08101E] border-slate-800'}`}>
                      <div className={`flex items-center justify-between border-b pb-3 mb-4 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                        <div className="flex items-center gap-2">
                          <span className={`material-symbols-outlined ${isLight ? 'text-sky-600' : 'text-sky-400'}`}>info</span>
                          <h3 className={`font-mono text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            Detail Insiden Node: <span className={isLight ? 'text-sky-600' : 'text-sky-300'}>{(selectedSlotNode || 'Pilih Slot').replace(/^M(\d+)/, 'B$1')}</span>
                            <span className="text-xs font-normal text-text-muted ml-2">({nodeMapCategory === 'MOTOR' ? 'Zona Motor' : 'Zona Mobil'})</span>
                          </h3>
                        </div>
                        {/* Lencana status anomali slot terpilih */}
                        {selectedSlotNode && (
                          <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full ${
                            nodeAnomaliMap[selectedSlotNode]
                              ? (isLight ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-red-950/50 text-red-300 border border-red-700/50')
                              : (isLight ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-emerald-950/50 text-emerald-300 border border-emerald-700/50')
                          }`}>
                            {nodeAnomaliMap[selectedSlotNode] 
                              ? `${nodeAnomaliMap[selectedSlotNode].length} Insiden Anomali Terdeteksi` 
                              : 'Status Normal'}
                          </span>
                        )}
                      </div>

                      {/* Tampilan daftar rincian insiden jika terdapat anomali pada slot */}
                      {selectedSlotNode && nodeAnomaliMap[selectedSlotNode] ? (
                        <div className="flex flex-col gap-3">
                          {nodeAnomaliMap[selectedSlotNode].map((item, idx) => (
                            <div key={idx} className={`border rounded-lg p-3.5 flex flex-col gap-1 ${isLight ? 'bg-red-50/80 border-red-200' : 'bg-red-950/20 border-red-800/40'}`}>
                              <div className="flex items-center justify-between text-xs font-mono">
                                <span className={`font-bold ${isLight ? 'text-red-600' : 'text-red-400'}`}>{item.jenisKejadian}</span>
                                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>
                                  {item.waktuKejadian ? new Date(item.waktuKejadian).toLocaleString('id-ID') : '-'}
                                </span>
                              </div>
                              <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                                {item.catatanDetail}
                              </p>
                              <div className={`mt-2 flex items-center gap-2 text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                                <span>Resolusi: <strong className={isLight ? 'text-amber-700' : 'text-amber-300'}>{item.statusResolusi || 'BELUM_DITANGANI'}</strong></span>
                                <span>•</span>
                                <span>Keparahan: <strong className={isLight ? 'text-red-600' : 'text-red-400'}>{item.tingkatKeparahan}</strong></span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        // Tampilan status normal jika tidak terdapat catatan anomali pada slot
                        <div className={`text-xs py-4 text-center font-mono flex items-center justify-center gap-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          <span className={`material-symbols-outlined text-lg ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`}>verified</span>
                          <span>Slot {(selectedSlotNode || '').replace(/^M(\d+)/, 'B$1')} ({nodeMapCategory === 'MOTOR' ? 'Zona Motor' : 'Zona Mobil'}) tidak memiliki catatan kesalahan atau anomali pada 10 log IoT terbaru.</span>
                        </div>
                      )}
                    </div>

                  </>
                )}

              </div>

              {/* Footer Modal 2 dengan petunjuk klik dan tombol tutup */}
              <div className={`p-4 border-t flex justify-between items-center ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#08101E] border-slate-700/60'}`}>
                <span className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                  *Klik pada kotak slot mana saja di peta untuk melihat riwayat insiden node terkait.
                </span>
                <button
                  onClick={() => setIsNodeMapModalOpen(false)}
                  className={`px-5 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                    isLight 
                      ? 'bg-slate-200 hover:bg-slate-300 text-slate-800' 
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
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
