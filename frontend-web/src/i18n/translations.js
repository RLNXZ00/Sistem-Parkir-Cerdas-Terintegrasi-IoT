// Kamus Terjemahan Global SPCT IoT (Indonesian & English)
// Digunakan secara terpusat oleh LanguageContext untuk mendukung internasionalisasi antarmuka multi-bahasa
export const translations = {
  // Objek kumpulan frasa dan terjemahan dalam Bahasa Indonesia (id)
  id: {
    // Frasa navigasi bilah samping (Sidebar)
    'nav.systemTitle': 'SPCT IoT', // Judul merek sistem
    'nav.systemSubtitle': 'Sistem Parkir Cerdas', // Sub-judul sistem
    'nav.fieldDashboard': 'Live Dashboard', // Label menu dashboard lapangan
    'nav.managementDashboard': 'Management Oversight', // Label menu dashboard manajemen
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
    'topbar.live': 'LIVE', // Indikator siaran langsung
    'topbar.systemHealthy': 'Sistem Normal', // Indikator status kesehatan sistem

    // Frasa panel popover notifikasi
    'notification.title': 'Notifikasi Sistem', // Judul popover notifikasi
    'notification.new': 'Baru', // Label item baru
    'notification.markAll': 'Tandai Dibaca', // Tombol tandai sudah dibaca
    'notification.markAllRead': 'Tandai semua telah dibaca', // Keterangan tombol tandai dibaca
    'notification.all': 'Semua', // Tab filter semua notifikasi
    'notification.entry': 'Kendaraan Masuk', // Tab filter notifikasi kendaraan masuk
    'notification.anomaly': 'Anomali', // Tab filter notifikasi anomali
    'notification.empty': 'Tidak ada notifikasi', // Pesan saat notifikasi kosong

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

    // Frasa halaman Dashboard Manajemen Eksekutif (DashboardManagementPage)
    'mgmt.title': 'Ringkasan Eksekutif & Manajemen', // Judul utama panel manajemen
    'mgmt.subtitle': 'Metrik kinerja operasional, efisiensi lingkungan, dan pemantauan anomali real-time.', // Subjudul manajemen
    'mgmt.totalRevenue': 'Total Pendapatan', // Metrik akumulasi pendapatan parkir
    'mgmt.totalTransactions': 'Total Transaksi', // Metrik jumlah transaksi parkir
    'mgmt.co2Reduction': 'Reduksi Emisi CO2', // Metrik akumulasi pengurangan emisi karbon
    'mgmt.timeSaved': 'Total Waktu Dihemat', // Metrik akumulasi efisiensi waktu pencarian slot
    'mgmt.avgOccupancy': 'Rata-rata Okupansi', // Metrik persentase keterisian parkir rata-rata
    'mgmt.revenueTrend': 'Tren Pendapatan & Transaksi', // Judul grafik tren pendapatan
    'mgmt.vehicleRatio': 'Rasio Kendaraan Masuk', // Judul grafik perbandingan jenis kendaraan
    'mgmt.btnAnomalyList': '10 Log Anomali Terakhir', // Tombol pembuka modal 10 log anomali
    'mgmt.btnSpatialMap': 'Denah Spasial Node Logs', // Tombol pembuka modal denah spasial anomali
    'mgmt.modalAnomalyTitle': '10 Log Anomali & Operasional IoT Terakhir', // Judul modal riwayat anomali
    'mgmt.modalAnomalySubtitle': 'Data riil kronologis langsung dari tabel log_operasional_iot database.', // Keterangan sumber modal riwayat
    'mgmt.modalSpatialTitle': 'Peta Denah Spasial Node Sensor & Kesalahan Parkir', // Judul modal denah spasial
    'mgmt.modalSpatialSubtitle': 'Visualisasi indikasi slot yang teridentifikasi mengalami anomali atau salah parkir.', // Keterangan modal denah spasial

    // Frasa halaman Operasional Gerbang (GateLivePage)
    'gate.title': 'Monitoring Gerbang Masuk & Keluar', // Judul pemantauan gerbang
    'gate.subtitle': 'Pusat pantauan kamera pengenal plat nomor (ANPR) dan status barrier gate otomatis.', // Keterangan pemantauan gerbang
    'gate.entry': 'Gerbang Masuk', // Label gerbang masuk
    'gate.exit': 'Gerbang Keluar', // Label gerbang keluar
    'gate.barrierStatus': 'Status Palang', // Label status barrier gate
    'gate.barrierOpen': 'TERBUKA', // Status palang terbuka
    'gate.barrierClosed': 'TERTUTUP', // Status palang tertutup
    'gate.lastPlate': 'Plat Terakhir', // Label plat nomor terdeteksi terakhir
    'gate.detectedAt': 'Waktu Deteksi', // Label stempel waktu deteksi OCR
    'gate.simulationControl': 'Panel Kontrol Simulasi Deteksi', // Judul panel pengujian simulasi gerbang
    'gate.openManual': 'Buka Palang Manual', // Tombol pembukaan barrier gate manual
    'gate.closeManual': 'Tutup Palang Manual', // Tombol penutupan barrier gate manual

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
    'anomaly.modalTitle': 'Acknowledge Anomaly', // Judul modal penerimaan anomali

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
    'reports.btnPdf': 'Unduh Dokumen PDF', // Tombol ekspor berkas PDF
    'reports.btnExcel': 'Unduh Lembar Kerja Excel', // Tombol ekspor berkas format Excel (.xlsx)
    'reports.liveSync': 'Live Database Sync', // Status sinkronisasi database live
    'reports.reportGenerator': 'Report Generator', // Judul kartu generator laporan
    'reports.validationFailed': 'Validasi Parameter Gagal', // Pesan galat validasi parameter
    'reports.loading': 'Menarik Data dari Database...', // Pesan status pengambilan data

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
    'nav.managementDashboard': 'Management Oversight', // Executive management navigation label
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
    'topbar.live': 'LIVE', // Live tag indicator
    'topbar.systemHealthy': 'System Healthy', // System healthy status indicator

    // Notification Popover labels
    'notification.title': 'System Notifications', // Notification title
    'notification.new': 'New', // New notification badge
    'notification.markAll': 'Mark All Read', // Mark all read action button
    'notification.markAllRead': 'Mark all as read', // Mark all as read tooltip
    'notification.all': 'All', // Filter all notifications
    'notification.entry': 'Vehicle Entry', // Filter vehicle entry notifications
    'notification.anomaly': 'Anomalies', // Filter anomaly notifications
    'notification.empty': 'No notifications', // Empty notification state

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

    // Management Dashboard (DashboardManagementPage) labels
    'mgmt.title': 'Executive & Management Summary', // Management dashboard title
    'mgmt.subtitle': 'Operational performance metrics, eco-efficiency stats, and real-time anomaly oversight.', // Management dashboard subtitle
    'mgmt.totalRevenue': 'Total Revenue', // Accumulated revenue metric
    'mgmt.totalTransactions': 'Total Transactions', // Total transaction metric
    'mgmt.co2Reduction': 'CO2 Emission Reduction', // CO2 emission reduction metric
    'mgmt.timeSaved': 'Total Time Saved', // Total time saved metric
    'mgmt.avgOccupancy': 'Average Occupancy', // Average occupancy rate metric
    'mgmt.revenueTrend': 'Revenue & Transaction Trends', // Revenue trend chart title
    'mgmt.vehicleRatio': 'Inbound Vehicle Ratio', // Vehicle ratio chart title
    'mgmt.btnAnomalyList': 'Last 10 Anomaly Logs', // Open anomaly modal button
    'mgmt.btnSpatialMap': 'Spatial Node Logs Map', // Open spatial map modal button
    'mgmt.modalAnomalyTitle': 'Last 10 Anomaly & IoT Operational Logs', // Anomaly modal title
    'mgmt.modalAnomalySubtitle': 'Real chronological data queried directly from database log_operasional_iot.', // Anomaly modal subtitle
    'mgmt.modalSpatialTitle': 'Spatial Map of Sensor Nodes & Misplacements', // Spatial modal title
    'mgmt.modalSpatialSubtitle': 'Visual representation of parking slots flagged with anomalies or misplacements.', // Spatial modal subtitle

    // Gate Operations (GateLivePage) labels
    'gate.title': 'Inbound & Outbound Gate Monitoring', // Gate live monitoring title
    'gate.subtitle': 'Live feed from license plate recognition cameras (ANPR) and automated barrier status.', // Gate live subtitle
    'gate.entry': 'Entry Gate', // Inbound gate label
    'gate.exit': 'Exit Gate', // Outbound gate label
    'gate.barrierStatus': 'Barrier Status', // Barrier gate state label
    'gate.barrierOpen': 'OPEN', // Barrier gate open state
    'gate.barrierClosed': 'CLOSED', // Barrier gate closed state
    'gate.lastPlate': 'Last Plate', // Last recognized plate label
    'gate.detectedAt': 'Detection Time', // Detection timestamp label
    'gate.simulationControl': 'Detection Simulation Control Panel', // Gate simulation panel title
    'gate.openManual': 'Manual Barrier Open', // Manual open barrier action
    'gate.closeManual': 'Manual Barrier Close', // Manual close barrier action

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
    'reports.btnPdf': 'Download PDF Document', // Download PDF button
    'reports.btnExcel': 'Download Excel Sheet', // Download Excel spreadsheet button
    'reports.liveSync': 'Live Database Sync', // Live database sync badge
    'reports.reportGenerator': 'Report Generator', // Report generator card title
    'reports.validationFailed': 'Parameter Validation Failed', // Validation failed error message
    'reports.loading': 'Fetching Data from Database...', // Database fetching message

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
