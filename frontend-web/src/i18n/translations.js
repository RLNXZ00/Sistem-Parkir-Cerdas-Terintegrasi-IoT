// Kamus Terjemahan Global SPCT IoT (Indonesian & English)
// Digunakan secara terpusat oleh LanguageContext untuk mendukung internasionalisasi antarmuka multi-bahasa
export const translations = {
  // Objek kumpulan frasa dan terjemahan dalam Bahasa Indonesia (id)
  id: {
    // Frasa navigasi bilah samping (Sidebar)
    'nav.systemTitle': 'SPCT IoT', // Judul merek sistem
    'nav.systemSubtitle': 'Sistem Parkir Cerdas', // Sub-judul sistem
    'nav.fieldDashboard': 'Live Dashboard', // Label menu dashboard lapangan
    'nav.managementDashboard': 'Dashboard Manajemen', // Label menu dashboard manajemen
    'nav.gateLive': 'Operasional Gerbang', // Label menu kamera gerbang
    'nav.anomalyLogs': 'Log Anomali', // Label menu log insiden anomali
    'nav.reports': 'Laporan Analitik', // Label menu laporan
    'nav.settings': 'Pengaturan', // Label menu pengaturan
    'nav.systemGuide': 'Panduan Sistem', // Label menu panduan SOP
    'nav.logout': 'Keluar Akun', // Label tombol logout
    'nav.roleOfficer': 'Petugas Lapangan', // Label peran petugas lapangan
    'nav.roleManager': 'Manajer Operasional', // Label peran manajer
    'nav.roleAdmin': 'Administrator', // Label peran admin sistem
    'nav.activeStatus': 'Sistem Aktif', // Status aktif koneksi

    // Frasa bilah atas (TopBar)
    'topbar.fieldOps': 'Operasional Lapangan', // Judul halaman dashboard lapangan
    'topbar.mgmtOversight': 'Pengawasan Manajemen', // Judul halaman manajemen
    'topbar.gateOps': 'Operasional Gerbang', // Judul halaman gerbang
    'topbar.anomalyLogs': 'Log Anomali & Insiden', // Judul halaman log anomali
    'topbar.reports': 'Laporan & Dokumen', // Judul halaman laporan
    'topbar.settings': 'Pengaturan Sistem', // Judul halaman pengaturan
    'topbar.systemGuide': 'Pusat Bantuan & SOP', // Judul halaman pusat bantuan & SOP
    'topbar.live': 'LIVE', // Indikator siaran langsung
    'topbar.systemHealthy': 'Sistem Normal', // Indikator status kesehatan sistem
    'topbar.notifTooltip': 'Notifikasi Sistem', // Tooltip tombol lonceng notifikasi
    'topbar.wifiTooltip': 'Status Jaringan IoT', // Tooltip tombol status jaringan
    'topbar.ecoTooltip': 'Indikator Efisiensi Eco', // Tooltip tombol indikator ramah lingkungan

    // Frasa panel popover notifikasi
    'notification.title': 'Notifikasi Sistem', // Judul popover notifikasi
    'notification.new': 'Baru', // Label item baru
    'notification.markAll': 'Tandai Dibaca', // Tombol tandai sudah dibaca
    'notification.markAllRead': 'Tandai semua telah dibaca', // Keterangan tombol tandai dibaca
    'notification.all': 'Semua', // Tab filter semua notifikasi
    'notification.entry': 'Kendaraan Masuk', // Tab filter notifikasi kendaraan masuk
    'notification.anomaly': 'Anomali', // Tab filter notifikasi anomali
    'notification.empty': 'Tidak ada notifikasi', // Pesan saat notifikasi kosong
    'notification.anomalyLogs': 'Log Anomali', // Pintasan navigasi footer ke halaman log anomali
    'notification.gateLive': 'Gate Live OCR', // Pintasan navigasi footer ke monitoring kamera gerbang
    'notification.reports': 'Laporan Analitik', // Pintasan navigasi footer ke laporan analitik untuk manajer
    'notification.unreadTooltip': 'Belum dibaca', // Tooltip titik penanda notifikasi belum dibaca

    // Frasa halaman Dashboard Petugas Lapangan (DashboardPage)
    'dash.totalSlots': 'Total Slot', // Metrik total kapasitas slot parkir
    'dash.occupied': 'Terisi', // Metrik jumlah slot terisi
    'dash.vacant': 'Kosong', // Metrik jumlah slot kosong
    'dash.cameraOnline': 'Kamera Online', // Metrik jumlah kamera aktif
    'dash.sensorOnline': 'Sensor Online', // Metrik jumlah sensor ultrasonik aktif
    'dash.activeAlerts': 'Alert Aktif', // Metrik jumlah peringatan aktif
    'dash.slotMapTitle': 'Peta Slot Parkir — Real-time', // Judul denah slot parkir
    'dash.floor': 'Lantai', // Label lantai gedung parkir
    'dash.car': 'Mobil', // Label kategori mobil
    'dash.motorcycle': 'Motor', // Label kategori motor
    'dash.hardwareStatus': 'Status Perangkat Keras Lapangan', // Judul status perangkat keras
    'dash.cameras': 'Kamera ANPR', // Label kelompok kamera ANPR
    'dash.sensors': 'Sensor Ultrasonik', // Label kelompok sensor ultrasonik
    'dash.recentEvents': 'Log Aktivitas Lapangan Terkini', // Judul tabel aktivitas lapangan
    'dash.noEvents': 'Belum ada kejadian tercatat di sistem.', // Pesan jika log aktivitas kosong
    'dash.legendOccupied': 'Terisi', // Legenda status slot terisi
    'dash.legendReserved': 'Dipesan', // Legenda status slot dipesan
    'dash.legendVacant': 'Kosong', // Legenda status slot kosong
    'dash.legendAnomaly': 'Anomali / Periksa', // Legenda status slot anomali
    'dash.sensorIotStatus': 'Status Sensor IoT', // Judul kartu status sensor IoT
    'dash.loading': 'Memuat data slot dari server...', // Pesan loading data slot
    'dash.noSlots': 'Tidak ada data slot parkir.', // Pesan jika slot tidak ditemukan
    'dash.noVehicleSlot': 'Belum ada slot {jenis} di {lantai}.', // Pesan jika tidak ada slot per jenis di lantai tertentu
    'dash.anprStatus': 'Status Kamera ANPR', // Judul kartu status kamera ANPR
    'dash.loadingCamera': 'Memuat data kamera...', // Pesan loading status kamera
    'dash.loadingSensor': 'Memuat data sensor...', // Pesan loading status sensor
    'dash.handleAnomaly': 'Tangani', // Tombol penanganan anomali cepat
    'dash.vacantSuffix': 'kosong', // Akhiran hitung slot kosong pada tab kendaraan
    'dash.unitSuffix': 'Unit', // Satuan jumlah perangkat kamera/sensor
    'dash.clickCardSim': 'Klik kartu untuk uji simulasi', // Lencana petunjuk klik kartu kamera
    'dash.clickNodeSim': 'Klik node untuk uji simulasi', // Lencana petunjuk klik node sensor
    'dash.activeAlertsTitle': 'Peringatan Aktif', // Judul panel kartu Active Alerts
    'dash.alertsCount': 'Peringatan', // Label hitungan jumlah peringatan
    'dash.loadingLogs': 'Memuat log...', // Pesan loading panel Active Alerts
    'dash.noActiveAnomaly': 'Tidak ada anomali aktif.', // Pesan saat tidak ada anomali aktif
    'dash.liveGateMonitor': 'Monitor Gerbang Langsung', // Judul panel mini Live Gate Monitor
    'dash.sensorOfflineTitle': '⚠️ SENSOR IOT OFFLINE', // Judul tooltip saat sensor offline
    'dash.slotAnomalyTitle': 'ANOMALI SLOT', // Judul tooltip saat slot anomali
    'dash.sensorOfflineDesc': 'Sensor mati. Sistem otomatis melewati slot ini dari alokasi kendaraan.', // Deskripsi tooltip sensor offline
    'dash.plateLabel': 'Plat', // Label plat nomor pada tooltip slot

    // Frasa halaman Dashboard Manajemen Eksekutif (DashboardManagementPage)
    'mgmt.title': 'Ringkasan Eksekutif & Manajemen', // Judul utama panel manajemen
    'mgmt.subtitle': 'Metrik kinerja operasional, efisiensi lingkungan, dan pemantauan anomali real-time.', // Subjudul manajemen
    'mgmt.totalRevenue': 'Pendapatan Hari Ini', // Metrik pendapatan hari ini
    'mgmt.totalTransactions': 'Total Kendaraan', // Metrik jumlah kendaraan
    'mgmt.co2Reduction': 'CO2 Dicegah', // Metrik akumulasi pengurangan emisi karbon
    'mgmt.timeSaved': 'Total Waktu Dihemat', // Metrik akumulasi efisiensi waktu pencarian slot
    'mgmt.avgOccupancy': 'Rata-rata Okupansi', // Metrik persentase keterisian parkir rata-rata
    'mgmt.avgFeeLabel': 'Rata-rata Tarif / Kendaraan', // Label kartu KPI tarif rata-rata
    'mgmt.revenueTrend': 'Tren Pendapatan & Transaksi', // Judul grafik tren pendapatan
    'mgmt.vehicleRatio': 'Rasio Kendaraan Masuk', // Judul grafik perbandingan jenis kendaraan
    'mgmt.btnAnomalyList': '10 Log Anomali Terakhir', // Tombol pembuka modal 10 log anomali
    'mgmt.btnSpatialMap': 'Denah Spasial Node Logs', // Tombol pembuka modal denah spasial anomali
    'mgmt.modalAnomalyTitle': '10 Log Anomali & Operasional IoT Terakhir', // Judul modal riwayat anomali
    'mgmt.modalAnomalySubtitle': 'Data riil kronologis langsung dari tabel log_operasional_iot database.', // Keterangan sumber modal riwayat
    'mgmt.modalSpatialTitle': 'Peta Denah Spasial Node Sensor & Kesalahan Parkir', // Judul modal denah spasial
    'mgmt.modalSpatialSubtitle': 'Visualisasi indikasi slot yang teridentifikasi mengalami anomali atau salah parkir dari 10 log IoT terbaru.', // Keterangan modal denah spasial
    'mgmt.loadingAnalytics': 'Memuat Data Analitik...', // Pesan loading halaman manajemen
    'mgmt.revMonthly': 'Pendapatan Bulanan', // Judul kartu pendapatan bulanan
    'mgmt.revYearly': 'Pendapatan Tahunan', // Judul kartu pendapatan tahunan
    'mgmt.revAll': 'Pendapatan Sepanjang Waktu', // Judul kartu pendapatan sepanjang waktu
    'mgmt.filterMonthly': 'Bulanan', // Tombol filter bulanan
    'mgmt.filterYearly': 'Tahunan', // Tombol filter tahunan
    'mgmt.filterAll': 'Semua', // Tombol filter semua periode
    'mgmt.revSubMonthly': 'Rekapitulasi transaksi lunas bulan kalender berjalan', // Subjudul periode bulanan
    'mgmt.revSubYearly': 'Rekapitulasi riil 12 bulan kalender tahun', // Subjudul periode tahunan
    'mgmt.revSubAll': 'Rekapitulasi seluruh riwayat transaksi lunas sejak sistem beroperasi', // Subjudul periode sepanjang waktu
    'mgmt.revBadgeMonthly': 'Bulan Berjalan', // Lencana periode bulanan
    'mgmt.revBadgeYearly': 'Tahun', // Lencana periode tahunan
    'mgmt.revBadgeAll': 'Histori Database', // Lencana periode semua
    'mgmt.daysLabel': 'Hari', // Satuan hari pada lencana periode
    'mgmt.monthsLabel': 'Bulan', // Satuan bulan pada lencana periode
    'mgmt.revFootMonthly': '*Rincian pendapatan riil per hari dari tanggal 1 s.d. hari ini', // Catatan kaki grafik bulanan
    'mgmt.revFootYearly': '*Rincian pendapatan riil per bulan pada tahun berjalan', // Catatan kaki grafik tahunan
    'mgmt.revFootAll': '*Rincian pendapatan riil per bulan sepanjang waktu operasional sistem', // Catatan kaki grafik semua
    'mgmt.financialImpact': 'Dampak Finansial', // Judul kartu dampak finansial
    'mgmt.avgFeeVehicle': 'Rata-rata Tarif per Kendaraan', // Label sub-kartu tarif rata-rata
    'mgmt.paidTransactions': 'Transaksi Lunas', // Label jumlah transaksi lunas
    'mgmt.occRevenueYield': 'Okupansi & Hasil Pendapatan', // Label sub-kartu okupansi dan RevPAS
    'mgmt.currentPhysOcc': 'Okupansi Fisik Saat Ini', // Keterangan okupansi fisik
    'mgmt.co2SavingsTitle': 'Penghematan Emisi CO2', // Judul kartu penghematan CO2
    'mgmt.achieved': 'Tercapai', // Label persentase tercapai donat CO2
    'mgmt.co2SavedDesc': 'Emisi dicegah total berdasarkan sensor IoT', // Deskripsi kartu CO2
    'mgmt.systemHealth': 'Kesehatan Sistem', // Judul kartu kesehatan sistem
    'mgmt.viewNodeLogs': 'Lihat Denah Node', // Tombol buka modal denah node
    'mgmt.activeSensors': 'Sensor Aktif', // Judul sub-kartu sensor aktif
    'mgmt.anprCameras': 'Kamera ANPR', // Judul sub-kartu kamera ANPR
    'mgmt.networkStatus': 'Status Jaringan', // Judul sub-kartu status jaringan
    'mgmt.pingChecking': 'Memeriksa...', // Status jaringan sedang memeriksa
    'mgmt.pingStable': 'Stabil', // Status jaringan stabil
    'mgmt.pingSlow': 'Lambat', // Status jaringan lambat
    'mgmt.anomalyActiveMsg': 'Anomali Aktif Membutuhkan Validasi', // Pesan banner anomali aktif
    'mgmt.systemNormalMsg': 'Sistem Normal — Tidak Ada Anomali Aktif', // Pesan banner tidak ada anomali
    'mgmt.anomalyBannerHint': 'Klik untuk melihat daftar 10 riwayat kronologis anomali & operasional sensor terbaru dari database.', // Petunjuk klik banner
    'mgmt.zoneDensityTitle': 'Tingkat Kepadatan per Zona', // Judul seksi tingkat kepadatan zona
    'mgmt.zoneNormal': 'Normal (<50%)', // Legenda zona normal
    'mgmt.zoneModerate': 'Sedang (50-80%)', // Legenda zona sedang
    'mgmt.zoneCrowded': 'Padat (>80%)', // Legenda zona padat
    'mgmt.carZone': 'Zona Mobil', // Nama zona mobil
    'mgmt.motorZone': 'Zona Motor', // Nama zona motor
    'mgmt.loadingAnomalies': 'Mengambil data log anomali dari server...', // Loading modal log anomali
    'mgmt.noAnomalyDb': 'Tidak ada catatan anomali di database.', // Kosong modal log anomali
    'mgmt.zoneCarBadge': 'ZONA MOBIL', // Lencana zona mobil di modal
    'mgmt.zoneMotorBadge': 'ZONA MOTOR', // Lencana zona motor di modal
    'mgmt.nodeNormalLegend': 'Node Normal', // Legenda node normal modal 2
    'mgmt.nodeAnomalyLegend': 'Anomali Terindikasi', // Legenda node anomali modal 2
    'mgmt.loadingNodeMap': 'Memuat pemetaan denah node sensor...', // Loading modal 2
    'mgmt.nodeDetailTitle': 'Detail Insiden Node', // Judul panel detail node modal 2
    'mgmt.selectSlot': 'Pilih Slot', // Placeholder slot belum dipilih
    'mgmt.incidentDetected': 'Insiden Anomali Terdeteksi', // Lencana jumlah insiden pada node
    'mgmt.statusNormal': 'Status Normal', // Lencana node normal
    'mgmt.noNodeIncidents': 'tidak memiliki catatan kesalahan atau anomali pada 10 log IoT terbaru.', // Pesan node normal
    'mgmt.nodeMapFooterHint': '*Klik pada kotak slot mana saja di peta untuk melihat riwayat insiden node terkait.', // Petunjuk footer modal 2
    'mgmt.resolutionLabel': 'Resolusi', // Label resolusi di kartu insiden modal 2
    'mgmt.severityLabel': 'Keparahan', // Label keparahan di kartu insiden modal 2

    // Frasa halaman Operasional Gerbang (GateLivePage)
    'gate.title': 'Monitoring Gerbang Masuk & Keluar', // Judul pemantauan gerbang
    'gate.subtitle': 'Pusat pantauan kamera pengenal plat nomor (ANPR) dan status barrier gate otomatis.', // Keterangan pemantauan gerbang
    'gate.entry': 'Gerbang Masuk', // Label gerbang masuk
    'gate.exit': 'Gerbang Keluar', // Label gerbang keluar
    'gate.barrierStatus': 'Status Palang', // Label status barrier gate
    'gate.barrierOpen': 'TERBUKA', // Status palang terbuka
    'gate.barrierClosed': 'TERTUTUP', // Status palang tertutup
    'gate.lastPlate': 'Plat Terdeteksi Terakhir', // Label plat nomor terdeteksi terakhir
    'gate.detectedAt': 'Waktu Deteksi', // Label stempel waktu deteksi OCR
    'gate.simulationControl': 'Panel Kontrol Simulasi Deteksi', // Judul panel pengujian simulasi gerbang
    'gate.openManual': 'Buka Palang Manual', // Tombol pembukaan barrier gate manual
    'gate.closeManual': 'Tutup Palang Manual', // Tombol penutupan barrier gate manual
    'gate.vehicleId': 'ID Kendaraan', // Label ID kendaraan terdeteksi
    'gate.confidence': 'Tingkat Keyakinan', // Label skor kepercayaan OCR
    'gate.statusReadable': 'TERBACA', // Status badge plat berhasil terbaca
    'gate.statusBalanceLow': 'SALDO KURANG', // Status badge gagal/anomali
    'gate.cameraOfflineMsg': 'KAMERA OFFLINE — PERLU PERAWATAN', // Pesan HUD kamera offline
    'gate.waitingVehicle': 'MENUNGGU KENDARAAN...', // Pesan HUD kamera siaga
    'gate.lastUpdate': 'Pembaruan terakhir', // Label waktu pembaruan terakhir
    'gate.refreshFeed': 'SEGARKAN FEED', // Tombol refresh data feed kamera
    'gate.activityStreamTitle': 'Aliran Aktivitas — Log Deteksi Plat', // Judul kartu log deteksi plat
    'gate.recordsSuffix': 'REKAMAN', // Akhiran jumlah rekaman deteksi
    'gate.noPlateLogs': 'Belum ada log deteksi plat. Simulasi ALPR akan mengisi tabel ini.', // Pesan kosong tabel log deteksi
    'gate.unreadable': 'TIDAK TERBACA', // Label jika plat tidak terbaca

    // Frasa halaman Log Anomali (AnomalyLogsPage)
    'anomaly.title': 'Daftar Insiden & Log Anomali IoT', // Judul halaman penanganan anomali
    'anomaly.subtitle': 'Investigasi telemetri sensor, penyerobotan slot parkir, dan verifikasi lapangan.', // Subjudul anomali
    'anomaly.tabUnresolved': 'Belum Ditangani', // Tab anomali berstatus aktif
    'anomaly.tabResolved': 'Selesai Divalidasi', // Tab anomali yang telah diselesaikan
    'anomaly.resolveBtn': 'Validasi Selesai', // Tombol penyelesaian investigasi
    'anomaly.filterSeverity': 'Filter Keparahan', // Label penyaring tingkat urgensi
    'anomaly.severityCritical': 'Kritis', // Tingkat keparahan kritis
    'anomaly.severityWarning': 'Peringatan', // Tingkat keparahan peringatan
    'anomaly.severityInfo': 'Informasi', // Tingkat keparahan info
    'anomaly.criticalActive': 'Critical Aktif', // Label lencana anomali kritis aktif
    'anomaly.noAnomaly': 'Tidak ada anomali ditemukan.', // Pesan jika tidak ada anomali
    'anomaly.plate': 'Plat', // Kolom nomor plat
    'anomaly.time': 'Waktu', // Kolom waktu kejadian
    'anomaly.category': 'Kategori', // Kolom kategori anomali
    'anomaly.resolved': '✓ Selesai Divalidasi', // Status validasi selesai
    'anomaly.pending': '⚠ Belum Ditangani', // Status validasi tertunda
    'anomaly.handle': 'Tangani', // Tombol aksi penanganan
    'anomaly.falsePositive': 'False Positive', // Opsi klasifikasi anomali semu (false positive)
    'anomaly.dispatchType': 'Jenis Anomali', // Label tipe anomali investigasi
    'anomaly.dispatchNote': 'Lain-lain:', // Catatan petugas dispatch
    'anomaly.dispatchPlaceholder': 'Detail kasus...', // Tempat placeholder catatan
    'anomaly.dispatchBtn': 'Kirim Dispatch', // Tombol pengiriman laporan dispatch
    'anomaly.cancel': 'Batal', // Tombol batal aksi
    'anomaly.modalTitle': 'Konfirmasi Penanganan Anomali', // Judul modal penerimaan anomali
    'anomaly.targetSlot': 'Slot Target', // Label slot target di modal anomali
    'anomaly.detectedAt': 'Terdeteksi Pada', // Label waktu deteksi di modal anomali
    'anomaly.optWrongPark': 'Salah Parkir', // Opsi salah parkir
    'anomaly.optForeignObj': 'Benda Asing', // Opsi benda asing
    'anomaly.optHuman': 'Keberadaan Manusia', // Opsi keberadaan manusia

    // Frasa halaman Laporan Analitik (ReportsPage)
    'reports.title': 'Laporan Operasional & Analitik', // Judul modul pelaporan
    'reports.subtitle': 'Penyusunan laporan berkala, pratinjau data, serta ekspor PDF resmi dan Excel.', // Subjudul modul pelaporan
    'reports.type': 'Jenis Laporan', // Label seleksi kategori laporan
    'reports.typeFinancial': 'Laporan Finansial', // Tipe laporan keuangan dan transaksi
    'reports.typeOperational': 'Laporan Operasional & Okupansi', // Tipe laporan performa operasional
    'reports.typeEnvironmental': 'Laporan Lingkungan (Eco-Metric)', // Tipe laporan dampak lingkungan hidup
    'reports.typeComprehensive': 'Laporan Komprehensif (Master)', // Tipe laporan rekapitulasi menyeluruh
    'reports.startDate': 'Dari Tanggal', // Label batas tanggal awal
    'reports.endDate': 'Sampai Tanggal', // Label batas tanggal akhir
    'reports.btnPreview': 'Tampilkan Pratinjau', // Tombol pratinjau data laporan
    'reports.btnPdf': 'Ekspor PDF', // Tombol ekspor berkas PDF
    'reports.btnExcel': 'Ekspor XLSX', // Tombol ekspor berkas format Excel (.xlsx)
    'reports.generatingPdf': 'Membuat PDF...', // Status sedang mengunduh PDF
    'reports.generatingXlsx': 'Membuat XLSX...', // Status sedang mengunduh Excel
    'reports.liveSync': 'Sinkronisasi Database Langsung', // Status sinkronisasi database live
    'reports.reportGenerator': 'Pembuat Laporan', // Judul kartu generator laporan
    'reports.validationFailed': 'Validasi Parameter Gagal', // Pesan galat validasi parameter
    'reports.loading': 'Menarik Data dari Database...', // Pesan status pengambilan data
    'reports.simMode': 'MODE SIMULASI', // Lencana mode simulasi
    'reports.emptyTitle': 'Data Kosong Pada Periode Ini', // Judul kartu data kosong
    'reports.emptyHint': 'Saran: Ubah rentang tanggal mulai/akhir ke periode yang memiliki riwayat aktivitas kendaraan.', // Saran rentang tanggal kosong
    'reports.historicalDetails': 'Rincian Data Historis', // Judul kartu tabel rincian data
    'reports.pillar1Title': 'Pilar 1: Finansial', // Judul pilar 1 komprehensif
    'reports.pillar1Desc': 'Rekap Transaksi & Omset Parkir', // Deskripsi pilar 1
    'reports.pillar2Title': 'Pilar 2: IoT & Okupansi', // Judul pilar 2 komprehensif
    'reports.pillar2Desc': 'Log Node & Resolusi Anomali', // Deskripsi pilar 2
    'reports.pillar3Title': 'Pilar 3: Eco-Metric', // Judul pilar 3 komprehensif
    'reports.pillar3Desc': 'Reduksi Karbon & Waktu Efisien', // Deskripsi pilar 3
    'reports.tabFinancial': 'Finansial', // Sub-tab tabel finansial
    'reports.tabOperational': 'Operasional', // Sub-tab tabel operasional
    'reports.tabEnvironmental': 'Lingkungan', // Sub-tab tabel lingkungan
    'reports.auditTitle': 'Riwayat Unduhan Dokumen (Audit Trail)', // Judul kartu audit trail
    'reports.auditSubtitle': 'LOG KEAMANAN // REKAM JEJAK PENARIKAN DOKUMEN RESMI (PK-UC010 LANGKAH 19–20)', // Subjudul kartu audit trail
    'reports.refreshAudit': 'Segarkan Audit', // Tombol segarkan audit
    'reports.loadingAudit': 'Memuat log audit unduhan...', // Loading audit trail
    'reports.noAudit': 'Belum ada riwayat dokumen yang diunduh pada sistem ini.', // Kosong audit trail
    'reports.secUnit': 'dtk', // Singkatan detik
    'reports.minUnit': 'mnt', // Singkatan menit

    // Frasa halaman Pengaturan Sistem (SettingsPage)
    'settings.title': 'Pengaturan Sistem & Preferensi', // Judul halaman konfigurasi sistem
    'settings.subtitle': 'Konfigurasi akun, bahasa antarmuka, tema visual, serta preferensi operasional.', // Subjudul konfigurasi
    'settings.tabAccount': 'Akun & Keamanan', // Tab navigasi pengaturan akun
    'settings.tabLanguage': 'Bahasa / Language', // Tab navigasi preferensi bahasa
    'settings.tabTheme': 'Tema Tampilan', // Tab navigasi preferensi tema
    'settings.tabOperations': 'Parameter Operasional', // Tab navigasi variabel tarif dan toleransi waktu
    'settings.tabSystemGuide': 'Panduan Sistem', // Tab tautan panduan sistem
    'settings.langId': 'Bahasa Indonesia (Default)', // Pilihan opsi Bahasa Indonesia
    'settings.langEn': 'English (United States)', // Pilihan opsi Bahasa Inggris
    'settings.themeDark': 'Tema Gelap (Dark Mode)', // Pilihan tema gelap
    'settings.themeLight': 'Tema Cerah (Light Mode)', // Pilihan tema cerah
    'settings.saveSuccess': 'Pengaturan berhasil disimpan!', // Notifikasi sukses simpan preferensi

    // Frasa halaman Panduan Sistem & SOP (PanduanPage)
    'guide.title': 'Panduan Pengoperasian Sistem (SOP)', // Judul utama halaman panduan
    'guide.subtitle': 'Dokumentasi resmi alur operasional Sistem Parkir Cerdas Terintegrasi IoT berdasarkan Narasi Use Case PK-UC001 s.d. PK-UC010.', // Subjudul dokumentasi SOP
    'guide.docStdLabel': 'Standar Dokumen', // Label standar dokumen
    'guide.docStdValue': 'RPL Tahap V (BluePrint)', // Nilai versi standar dokumen
    'guide.catAll': 'Semua Use Case (10)', // Tab filter seluruh use case
    'guide.catEntry': 'Gerbang Masuk', // Tab filter gerbang masuk
    'guide.catExit': 'Gerbang Keluar', // Tab filter gerbang keluar
    'guide.catOps': 'Operasional Lapangan & IoT', // Tab filter operasional IoT
    'guide.catMgmt': 'Manajemen & Analitik', // Tab filter manajemen & analitik
    'guide.searchPlaceholder': 'Cari use case atau kata kunci...', // Placeholder input pencarian SOP
    'guide.actorsLabel': 'Aktor yang Terlibat:', // Label aktor terlibat
    'guide.stepsLabel': 'Alur Langkah Standar (Typical Course of Events):', // Label langkah standar
    'guide.troubleshootingLabel': 'Solusi Kendala & Alur Alternatif:', // Label troubleshooting
    'guide.businessRulesLabel': 'Aturan Bisnis & Kepatuhan:', // Label aturan bisnis
    'guide.emptySearch': 'Tidak ada use case yang cocok dengan kata kunci "{query}".', // Pesan hasil pencarian kosong

    // Frasa Umum Global (Common)
    'common.close': 'Tutup', // Tombol penutup dialog modal
    'common.save': 'Simpan Perubahan', // Tombol penyimpanan perubahan
    'common.cancel': 'Batal', // Tombol pembatalan aksi
    'common.loading': 'Memuat data...', // Teks pemuatan data umum
    'common.success': 'Berhasil', // Label status sukses
    'common.error': 'Terjadi kesalahan', // Label status kegagalan
    'common.search': 'Cari...', // Placeholder input pencarian data
    'common.all': 'Semua', // Opsi seleksi semua data
    'common.status': 'Status', // Label judul kolom status
    'common.action': 'Aksi', // Label judul kolom aksi
  },

  // Objek kumpulan frasa dan terjemahan dalam Bahasa Inggris (en)
  en: {
    // Navigation & Sidebar labels
    'nav.systemTitle': 'SPCT IoT', // System brand title
    'nav.systemSubtitle': 'Smart Parking System', // System brand subtitle
    'nav.fieldDashboard': 'Live Dashboard', // Field dashboard navigation label
    'nav.managementDashboard': 'Management Dashboard', // Executive management navigation label
    'nav.gateLive': 'Gate Operations', // Gate operations navigation label
    'nav.anomalyLogs': 'Anomaly Logs', // Anomaly log navigation label
    'nav.reports': 'Analytics Reports', // Reports navigation label
    'nav.settings': 'Settings', // Settings navigation label
    'nav.systemGuide': 'System Manual', // System manual SOP navigation label
    'nav.logout': 'Sign Out', // Sign out button label
    'nav.roleOfficer': 'Field Officer', // Field officer role label
    'nav.roleManager': 'Operations Manager', // Operations manager role label
    'nav.roleAdmin': 'Administrator', // System admin role label
    'nav.activeStatus': 'System Live', // System live indicator

    // TopBar header labels
    'topbar.fieldOps': 'Field Operations', // Field operations title
    'topbar.mgmtOversight': 'Management Oversight', // Management oversight title
    'topbar.gateOps': 'Gate Operations', // Gate operations title
    'topbar.anomalyLogs': 'Anomaly & Incident Logs', // Anomaly logs title
    'topbar.reports': 'Reports & Documents', // Reports title
    'topbar.settings': 'System Settings', // System settings title
    'topbar.systemGuide': 'Help Center & SOP', // Help center & SOP title
    'topbar.live': 'LIVE', // Live tag indicator
    'topbar.systemHealthy': 'System Healthy', // System healthy status indicator
    'topbar.notifTooltip': 'System Notifications', // Notification bell button tooltip
    'topbar.wifiTooltip': 'IoT Network Status', // Network status button tooltip
    'topbar.ecoTooltip': 'Eco Efficiency Indicator', // Eco efficiency button tooltip

    // Notification Popover labels
    'notification.title': 'System Notifications', // Notification title
    'notification.new': 'New', // New notification badge
    'notification.markAll': 'Mark All Read', // Mark all read action button
    'notification.markAllRead': 'Mark all as read', // Mark all as read tooltip
    'notification.all': 'All', // Filter all notifications
    'notification.entry': 'Vehicle Entry', // Filter vehicle entry notifications
    'notification.anomaly': 'Anomalies', // Filter anomaly notifications
    'notification.empty': 'No notifications', // Empty notification state
    'notification.anomalyLogs': 'Anomaly Logs', // Shortcut footer navigation to anomaly logs
    'notification.gateLive': 'Gate Live OCR', // Shortcut footer navigation to live gate camera feed
    'notification.reports': 'Analytics Reports', // Shortcut footer navigation to analytics reports for manager
    'notification.unreadTooltip': 'Unread', // Unread indicator tooltip

    // Field Dashboard (DashboardPage) labels
    'dash.totalSlots': 'Total Slots', // Metric total parking slots
    'dash.occupied': 'Occupied', // Metric occupied parking slots
    'dash.vacant': 'Vacant', // Metric vacant parking slots
    'dash.cameraOnline': 'Cameras Online', // Metric online ANPR cameras
    'dash.sensorOnline': 'Sensors Online', // Metric online ultrasonic sensors
    'dash.activeAlerts': 'Active Alerts', // Metric active operational alerts
    'dash.slotMapTitle': 'Parking Slot Map — Real-time', // Slot map title
    'dash.floor': 'Floor', // Floor label
    'dash.car': 'Car', // Car category label
    'dash.motorcycle': 'Motorcycle', // Motorcycle category label
    'dash.hardwareStatus': 'Field Hardware Status', // Hardware telemetry title
    'dash.cameras': 'ANPR Cameras', // ANPR cameras group label
    'dash.sensors': 'Ultrasonic Sensors', // Ultrasonic sensors group label
    'dash.recentEvents': 'Recent Field Activity Logs', // Activity log title
    'dash.noEvents': 'No events recorded in the system yet.', // Empty event state message
    'dash.legendOccupied': 'Occupied', // Occupied status legend
    'dash.legendReserved': 'Reserved', // Reserved status legend
    'dash.legendVacant': 'Vacant', // Vacant status legend
    'dash.legendAnomaly': 'Anomaly / Inspect', // Anomaly status legend
    'dash.sensorIotStatus': 'IoT Sensor Status', // IoT sensor card title
    'dash.loading': 'Loading slot data from server...', // Slot loading message
    'dash.noSlots': 'No parking slot data available.', // Empty slot data message
    'dash.noVehicleSlot': 'No {jenis} slots on {lantai}.', // Empty slot category message
    'dash.anprStatus': 'ANPR Camera Status', // ANPR camera status title
    'dash.loadingCamera': 'Loading camera data...', // Camera loading message
    'dash.loadingSensor': 'Loading sensor data...', // Sensor loading message
    'dash.handleAnomaly': 'Handle', // Quick handle anomaly action
    'dash.vacantSuffix': 'vacant', // Vacant count suffix on vehicle tabs
    'dash.unitSuffix': 'Units', // Hardware unit suffix
    'dash.clickCardSim': 'Click card to test simulation', // Hint badge for interactive camera cards
    'dash.clickNodeSim': 'Click node to test simulation', // Hint badge for interactive sensor nodes
    'dash.activeAlertsTitle': 'Active Alerts', // Active Alerts panel title
    'dash.alertsCount': 'Alerts', // Alert count suffix
    'dash.loadingLogs': 'Loading logs...', // Loading logs text
    'dash.noActiveAnomaly': 'No active anomalies.', // Empty alerts text
    'dash.liveGateMonitor': 'Live Gate Monitor', // Live Gate Monitor panel title
    'dash.sensorOfflineTitle': '⚠️ IOT SENSOR OFFLINE', // Tooltip title for offline sensor
    'dash.slotAnomalyTitle': 'SLOT ANOMALY', // Tooltip title for slot anomaly
    'dash.sensorOfflineDesc': 'Sensor offline. System automatically excludes this slot from vehicle allocation.', // Tooltip description for offline sensor
    'dash.plateLabel': 'Plate', // Plate label on slot tooltip

    // Management Dashboard (DashboardManagementPage) labels
    'mgmt.title': 'Executive & Management Summary', // Management dashboard title
    'mgmt.subtitle': 'Operational performance metrics, eco-efficiency stats, and real-time anomaly oversight.', // Management dashboard subtitle
    'mgmt.totalRevenue': "Today's Revenue", // Today's revenue metric
    'mgmt.totalTransactions': 'Total Vehicles', // Total vehicle metric
    'mgmt.co2Reduction': 'CO2 Prevented', // CO2 emission reduction metric
    'mgmt.timeSaved': 'Total Time Saved', // Total time saved metric
    'mgmt.avgOccupancy': 'Average Occupancy', // Average occupancy rate metric
    'mgmt.avgFeeLabel': 'Avg Fee / Vehicle', // Average fee KPI label
    'mgmt.revenueTrend': 'Revenue & Transaction Trends', // Revenue trend chart title
    'mgmt.vehicleRatio': 'Inbound Vehicle Ratio', // Vehicle ratio chart title
    'mgmt.btnAnomalyList': 'Last 10 Anomaly Logs', // Open anomaly modal button
    'mgmt.btnSpatialMap': 'Spatial Node Logs Map', // Open spatial map modal button
    'mgmt.modalAnomalyTitle': 'Last 10 Anomaly & IoT Operational Logs', // Anomaly modal title
    'mgmt.modalAnomalySubtitle': 'Real chronological data queried directly from database log_operasional_iot.', // Anomaly modal subtitle
    'mgmt.modalSpatialTitle': 'Spatial Map of Sensor Nodes & Misplacements', // Spatial modal title
    'mgmt.modalSpatialSubtitle': 'Visual representation of slots flagged with anomalies or misplacements from the latest 10 IoT logs.', // Spatial modal subtitle
    'mgmt.loadingAnalytics': 'Loading Analytics Data...', // Analytics loading state
    'mgmt.revMonthly': 'Monthly Revenue', // Monthly revenue card title
    'mgmt.revYearly': 'Yearly Revenue', // Yearly revenue card title
    'mgmt.revAll': 'All-Time Revenue', // All-time revenue card title
    'mgmt.filterMonthly': 'Monthly', // Monthly period pill
    'mgmt.filterYearly': 'Yearly', // Yearly period pill
    'mgmt.filterAll': 'All', // All-time period pill
    'mgmt.revSubMonthly': 'Recap of paid transactions in current calendar month', // Monthly period subtitle
    'mgmt.revSubYearly': 'Real 12-month calendar recap for year', // Yearly period subtitle
    'mgmt.revSubAll': 'Complete paid transaction history since system launch', // All-time period subtitle
    'mgmt.revBadgeMonthly': 'Current Month', // Monthly period badge
    'mgmt.revBadgeYearly': 'Year', // Yearly period badge
    'mgmt.revBadgeAll': 'Database History', // All-time period badge
    'mgmt.daysLabel': 'Days', // Days label
    'mgmt.monthsLabel': 'Months', // Months label
    'mgmt.revFootMonthly': '*Real daily revenue breakdown from day 1 through today', // Monthly chart footnote
    'mgmt.revFootYearly': '*Real monthly revenue breakdown in current year', // Yearly chart footnote
    'mgmt.revFootAll': '*Real monthly revenue breakdown across all system operations', // All-time chart footnote
    'mgmt.financialImpact': 'Financial Impact', // Financial impact card title
    'mgmt.avgFeeVehicle': 'Avg Fee per Vehicle', // Avg fee sub-card title
    'mgmt.paidTransactions': 'Paid Transactions', // Paid transactions count label
    'mgmt.occRevenueYield': 'Occupancy & Revenue Yield', // Occupancy & yield sub-card title
    'mgmt.currentPhysOcc': 'Current Physical Occupancy', // Current physical occupancy text
    'mgmt.co2SavingsTitle': 'CO2 Savings', // CO2 savings card title
    'mgmt.achieved': 'Achieved', // Donut progress achieved label
    'mgmt.co2SavedDesc': 'Total CO2 emissions prevented based on IoT sensors', // CO2 savings description
    'mgmt.systemHealth': 'System Health', // System health card title
    'mgmt.viewNodeLogs': 'View Node Logs', // View node logs button
    'mgmt.activeSensors': 'Active Sensors', // Active sensors sub-card
    'mgmt.anprCameras': 'ANPR Cameras', // ANPR cameras sub-card
    'mgmt.networkStatus': 'Network Status', // Network status sub-card
    'mgmt.pingChecking': 'Checking...', // Network status checking
    'mgmt.pingStable': 'Stable', // Network status stable
    'mgmt.pingSlow': 'Slow', // Network status slow
    'mgmt.anomalyActiveMsg': 'Active Anomalies Requiring Validation', // Active anomaly banner heading
    'mgmt.systemNormalMsg': 'System Normal — No Active Anomalies', // Normal anomaly banner heading
    'mgmt.anomalyBannerHint': 'Click to inspect the latest 10 chronological anomaly & IoT sensor logs from database.', // Banner click hint
    'mgmt.zoneDensityTitle': 'Occupancy Density by Zone', // Zone occupancy section title
    'mgmt.zoneNormal': 'Normal (<50%)', // Zone normal legend
    'mgmt.zoneModerate': 'Moderate (50-80%)', // Zone moderate legend
    'mgmt.zoneCrowded': 'Crowded (>80%)', // Zone crowded legend
    'mgmt.carZone': 'Car Zone', // Car zone title
    'mgmt.motorZone': 'Motorcycle Zone', // Motorcycle zone title
    'mgmt.loadingAnomalies': 'Fetching anomaly logs from server...', // Modal 1 loading text
    'mgmt.noAnomalyDb': 'No anomaly records found in database.', // Modal 1 empty text
    'mgmt.zoneCarBadge': 'CAR ZONE', // Modal 1 car zone badge
    'mgmt.zoneMotorBadge': 'MOTORCYCLE ZONE', // Modal 1 motorcycle zone badge
    'mgmt.nodeNormalLegend': 'Normal Node', // Modal 2 normal legend
    'mgmt.nodeAnomalyLegend': 'Anomaly Indicated', // Modal 2 anomaly legend
    'mgmt.loadingNodeMap': 'Loading sensor node map layout...', // Modal 2 loading text
    'mgmt.nodeDetailTitle': 'Node Incident Details', // Modal 2 detail panel title
    'mgmt.selectSlot': 'Select Slot', // Select slot placeholder
    'mgmt.incidentDetected': 'Anomaly Incidents Detected', // Node incident badge suffix
    'mgmt.statusNormal': 'Normal Status', // Node normal badge
    'mgmt.noNodeIncidents': 'has no error or anomaly records in the latest 10 IoT logs.', // Empty node incident description
    'mgmt.nodeMapFooterHint': '*Click any slot box on the map to inspect its related node incident history.', // Modal 2 footer hint
    'mgmt.resolutionLabel': 'Resolution', // Resolution label in modal 2
    'mgmt.severityLabel': 'Severity', // Severity label in modal 2

    // Gate Operations (GateLivePage) labels
    'gate.title': 'Inbound & Outbound Gate Monitoring', // Gate live monitoring title
    'gate.subtitle': 'Live feed from license plate recognition cameras (ANPR) and automated barrier status.', // Gate live subtitle
    'gate.entry': 'Entry Gate', // Inbound gate label
    'gate.exit': 'Exit Gate', // Outbound gate label
    'gate.barrierStatus': 'Barrier Status', // Barrier gate state label
    'gate.barrierOpen': 'OPEN', // Barrier gate open state
    'gate.barrierClosed': 'CLOSED', // Barrier gate closed state
    'gate.lastPlate': 'Last Detected Plate', // Last recognized plate label
    'gate.detectedAt': 'Detection Time', // Detection timestamp label
    'gate.simulationControl': 'Detection Simulation Control Panel', // Gate simulation panel title
    'gate.openManual': 'Manual Barrier Open', // Manual open barrier action
    'gate.closeManual': 'Manual Barrier Close', // Manual close barrier action
    'gate.vehicleId': 'Vehicle ID', // Detected vehicle ID label
    'gate.confidence': 'Confidence', // OCR confidence score label
    'gate.statusReadable': 'READABLE', // Plate successfully read badge
    'gate.statusBalanceLow': 'LOW BALANCE', // Insufficient balance / anomaly badge
    'gate.cameraOfflineMsg': 'CAMERA OFFLINE — MAINTENANCE REQUIRED', // Offline camera HUD banner
    'gate.waitingVehicle': 'WAITING FOR VEHICLE...', // Idle camera HUD banner
    'gate.lastUpdate': 'Last update', // Last update timestamp label
    'gate.refreshFeed': 'REFRESH FEED', // Refresh feed button
    'gate.activityStreamTitle': 'Activity Stream — Plate Detection Log', // Plate log card title
    'gate.recordsSuffix': 'RECORDS', // Record count suffix
    'gate.noPlateLogs': 'No plate detection logs yet. ALPR simulation will populate this table.', // Empty plate logs state
    'gate.unreadable': 'UNREADABLE', // Unreadable plate badge

    // Anomaly Logs (AnomalyLogsPage) labels
    'anomaly.title': 'Incident List & IoT Anomaly Logs', // Incident log title
    'anomaly.subtitle': 'Sensor telemetry investigation, parking spot poaching, and field verification.', // Incident log subtitle
    'anomaly.tabUnresolved': 'Unresolved', // Unresolved anomalies tab
    'anomaly.tabResolved': 'Resolved & Validated', // Resolved anomalies tab
    'anomaly.resolveBtn': 'Complete Validation', // Complete validation button
    'anomaly.filterSeverity': 'Filter Severity', // Filter severity label
    'anomaly.severityCritical': 'Critical', // Critical severity label
    'anomaly.severityWarning': 'Warning', // Warning severity label
    'anomaly.severityInfo': 'Information', // Information severity label
    'anomaly.criticalActive': 'Critical Active', // Active critical badge label
    'anomaly.noAnomaly': 'No anomalies found.', // Empty anomaly message
    'anomaly.plate': 'Plate', // License plate column
    'anomaly.time': 'Time', // Incident time column
    'anomaly.category': 'Category', // Anomaly category column
    'anomaly.resolved': '✓ Resolved & Validated', // Resolved state label
    'anomaly.pending': '⚠ Unresolved', // Pending state label
    'anomaly.handle': 'Handle', // Handle action button
    'anomaly.falsePositive': 'False Positive', // False positive option
    'anomaly.dispatchType': 'Anomaly Type', // Anomaly type selection
    'anomaly.dispatchNote': 'Other notes:', // Other notes label
    'anomaly.dispatchPlaceholder': 'Case details...', // Dispatch notes placeholder
    'anomaly.dispatchBtn': 'Send Dispatch', // Send dispatch button
    'anomaly.cancel': 'Cancel', // Cancel action button
    'anomaly.modalTitle': 'Acknowledge Anomaly', // Acknowledge anomaly modal title
    'anomaly.targetSlot': 'Target Slot', // Target slot label
    'anomaly.detectedAt': 'Detected At', // Detected at label
    'anomaly.optWrongPark': 'Misplaced Vehicle', // Option misplaced vehicle
    'anomaly.optForeignObj': 'Foreign Object', // Option foreign object
    'anomaly.optHuman': 'Pedestrian / Human Presence', // Option human presence

    // Analytics Reports (ReportsPage) labels
    'reports.title': 'Operational & Analytics Reports', // Reports page title
    'reports.subtitle': 'Periodic report generation, data preview, official PDF printouts, and Excel exports.', // Reports page subtitle
    'reports.type': 'Report Type', // Report type label
    'reports.typeFinancial': 'Financial Report', // Financial report option
    'reports.typeOperational': 'Operational & Occupancy Report', // Operational report option
    'reports.typeEnvironmental': 'Environmental Report (Eco-Metric)', // Environmental report option
    'reports.typeComprehensive': 'Comprehensive Report (Master)', // Comprehensive master report option
    'reports.startDate': 'Start Date', // Range start date
    'reports.endDate': 'End Date', // Range end date
    'reports.btnPreview': 'Generate Preview', // Generate preview button
    'reports.btnPdf': 'Export PDF', // Export PDF button
    'reports.btnExcel': 'Export XLSX', // Export Excel spreadsheet button
    'reports.generatingPdf': 'Generating PDF...', // Downloading PDF indicator
    'reports.generatingXlsx': 'Generating XLSX...', // Downloading Excel indicator
    'reports.liveSync': 'Live Database Sync', // Live database sync badge
    'reports.reportGenerator': 'Report Generator', // Report generator card title
    'reports.validationFailed': 'Parameter Validation Failed', // Validation failed error message
    'reports.loading': 'Fetching Data from Database...', // Database fetching message
    'reports.simMode': 'SIMULATION MODE', // Simulation mode badge
    'reports.emptyTitle': 'No Data in Selected Period', // Empty period title
    'reports.emptyHint': 'Tip: Adjust the start/end date range to a period with recorded vehicle activity.', // Empty period hint
    'reports.historicalDetails': 'Historical Data Details', // Historical table card title
    'reports.pillar1Title': 'Pillar 1: Financial', // Comprehensive pillar 1 title
    'reports.pillar1Desc': 'Transaction Recap & Parking Revenue', // Comprehensive pillar 1 desc
    'reports.pillar2Title': 'Pillar 2: IoT & Occupancy', // Comprehensive pillar 2 title
    'reports.pillar2Desc': 'Node Logs & Anomaly Resolution', // Comprehensive pillar 2 desc
    'reports.pillar3Title': 'Pillar 3: Eco-Metric', // Comprehensive pillar 3 title
    'reports.pillar3Desc': 'Carbon Reduction & Time Saved', // Comprehensive pillar 3 desc
    'reports.tabFinancial': 'Financial', // Sub-tab financial
    'reports.tabOperational': 'Operational', // Sub-tab operational
    'reports.tabEnvironmental': 'Environmental', // Sub-tab environmental
    'reports.auditTitle': 'Document Download History (Audit Trail)', // Audit trail card title
    'reports.auditSubtitle': 'SECURITY LOG // OFFICIAL DOCUMENT EXPORT TRAIL (PK-UC010 STEP 19–20)', // Audit trail subtitle
    'reports.refreshAudit': 'Refresh Audit', // Refresh audit button
    'reports.loadingAudit': 'Loading download audit logs...', // Audit loading state
    'reports.noAudit': 'No document download history recorded yet.', // Empty audit state
    'reports.secUnit': 's', // Seconds unit abbreviation
    'reports.minUnit': 'min', // Minutes unit abbreviation

    // System Settings (SettingsPage) labels
    'settings.title': 'System Settings & Preferences', // Settings page title
    'settings.subtitle': 'Account security, interface language, visual theme, and operational preferences.', // Settings page subtitle
    'settings.tabAccount': 'Account & Security', // Account settings tab
    'settings.tabLanguage': 'Language / Bahasa', // Language preferences tab
    'settings.tabTheme': 'Appearance Theme', // Theme preferences tab
    'settings.tabOperations': 'Operational Parameters', // Operational parameters tab
    'settings.tabSystemGuide': 'System Manual', // System manual SOP tab
    'settings.langId': 'Indonesian (Default)', // Indonesian language selection
    'settings.langEn': 'English (United States)', // English language selection
    'settings.themeDark': 'Dark Theme (Dark Mode)', // Dark mode selection
    'settings.themeLight': 'Light Theme (Light Mode)', // Light mode selection
    'settings.saveSuccess': 'Settings saved successfully!', // Settings saved notification

    // System Guide & SOP (PanduanPage) labels
    'guide.title': 'System Operating Guide (SOP)', // Main guide page title
    'guide.subtitle': 'Official operational workflow documentation for the IoT Integrated Smart Parking System based on Use Cases PK-UC001 through PK-UC010.', // Guide subtitle
    'guide.docStdLabel': 'Document Standard', // Document standard badge label
    'guide.docStdValue': 'SDLC Phase V (BluePrint)', // Document standard badge value
    'guide.catAll': 'All Use Cases (10)', // All use cases filter tab
    'guide.catEntry': 'Entry Gate', // Entry gate filter tab
    'guide.catExit': 'Exit Gate', // Exit gate filter tab
    'guide.catOps': 'Field Ops & IoT', // Field operations filter tab
    'guide.catMgmt': 'Management & Analytics', // Management filter tab
    'guide.searchPlaceholder': 'Search use case or keyword...', // Search placeholder
    'guide.actorsLabel': 'Actors Involved:', // Actors label
    'guide.stepsLabel': 'Standard Workflow Steps (Typical Course of Events):', // Steps section header
    'guide.troubleshootingLabel': 'Troubleshooting & Alternative Flows:', // Troubleshooting header
    'guide.businessRulesLabel': 'Business Rules & Compliance:', // Business rules header
    'guide.emptySearch': 'No use cases match the keyword "{query}".', // Empty search state

    // Global Common labels
    'common.close': 'Close', // Close dialog button
    'common.save': 'Save Changes', // Save changes button
    'common.cancel': 'Cancel', // Cancel button
    'common.loading': 'Loading data...', // Generic loading state
    'common.success': 'Success', // Generic success label
    'common.error': 'An error occurred', // Generic error label
    'common.search': 'Search...', // Search input placeholder
    'common.all': 'All', // Select all option
    'common.status': 'Status', // Status table header
    'common.action': 'Action', // Action table header
  }
};
