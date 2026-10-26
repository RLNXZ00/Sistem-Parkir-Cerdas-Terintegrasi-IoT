# 00. Panduan Umum dan Matriks Pembagian Tugas Tim Presentasi (4 Mahasiswa)

Dokumen ini merupakan panduan strategis operasional untuk presentasi tim proyek **Sistem Parkir Cerdas Terintegrasi IoT (SPCT IoT)**. Panduan ini dirancang khusus guna menjawab 3 target evaluasi utama dosen penguji:
1. **Pembuatan program (*coding*) sesuai Use Case Diagram.**
2. **Implementasi arsitektur Model, Controller, dan View (MVC) yang 100% sinkron dengan source code backend dan frontend.**
3. **Pengaturan *version control* proyek melalui GitHub (branching, commits, pull requests, dan merge graph).**

---

## 1. Rubrik Evaluasi Dosen & Strategi Jawaban Tim

| Kriteria Evaluasi Dosen | Target Bukti yang Harus Ditunjukkan | Pembagian Tanggung Jawab Tim |
| :--- | :--- | :--- |
| **1. Coding Sesuai Use Case Diagram** | Mahasiswa mampu menghubungkan diagram use case resmi (PK-UC001 s.d. PK-UC010) dengan method Java dan komponen React nyata di kode program. | Setiap mahasiswa menjelaskan **1 hingga 2 use case** secara mendalam dari awal input sampai database. |
| **2. Implementasi Model, Controller, View (MVC)** | Mahasiswa mendemonstrasikan pemisahan tanggung jawab: Entitas Model (`@Entity`), REST Controller (`@RestController`), dan Antarmuka View (React SPA Kiosk & Web). | Setiap mahasiswa membedah berkas nyata di `com.spct.model`, `com.spct.controller`, `com.spct.service`, dan View antarmuka. |
| **3. Version Control GitHub** | Mahasiswa membuktikan kerja kolaboratif dengan struktur branch yang rapi, komit konvensional, pull request, dan riwayat merge non-fast-forward (`--no-ff`). | Setiap mahasiswa menjelaskan 1 pilar Git workflow: Setup Branching, Feature Merging, Code Review PR, dan Main Protection. |

---

## 2. Matriks Pembagian Tugas 4 Mahasiswa (100% Sinkron Source Code Backend)

```
+----------------------------------------------------------------------------------------------------+
|                               SISTEM PARKIR CERDAS TERINTEGRASI IoT                                |
+---------------------------------+---------------------------------+--------------------------------+
| MAHASISWA 1: Gate Ingress &     | MAHASISWA 2: Navigation &       | MAHASISWA 3: Field Ops &       |
| Smart Slot Allocation           | IoT Telemetry Specialist        | Anomaly Intelligence           |
| • PK-UC001: ANPR Gate Camera    | • PK-UC003: Visual Route Kiosk  | • PK-UC005: Anomaly Engine     |
| • PK-UC002: Smart Slot Search   | • PK-UC004: Ultrasonic Sensor   | • PK-UC009: 4 Gate Live Feed   |
| • Model: DataKendaraan, Slot    | • Model: SensorIoT, SlotParkir  | • Model: LogOperasionalIoT     |
| • Ctrl: DeteksiPlatController   | • Ctrl: MonitoringFisikCtrl     | • Ctrl: MonitoringFisikCtrl    |
| • View: ScanPage, Allocating    | • View: NavigationPage, Dash    | • View: AnomalyLogs, GateLive  |
| • Git: Repo Setup & Branching   | • Git: UI Sync & Conflict Res   | • Git: PR & Code Review Flow   |
+---------------------------------+---------------------------------+--------------------------------+
                                  | MAHASISWA 4: Exit, Cashless &   |
                                  | Executive Management Analytics  |
                                  | • PK-UC006/007/008: Exit & QRIS |
                                  | • PK-UC010: Executive Analytics |
                                  | • Model: TransaksiParkir, Audit |
                                  | • Ctrl: TransaksiPembayaranCtrl |
                                  | • View: ExitScan, MgmtPage, Rep |
                                  | • Git: Release & --no-ff Merge  |
                                  +---------------------------------+
```

### Rincian Penugasan Individu & Pemetaan Berkas Nyata

```mermaid
gantt
    title Alokasi Waktu Presentasi (Total 20 Menit)
    dateFormat  m:s
    axisFormat  %M:%S
    section Pembukaan
    Salam & Overview Proyek (Mahasiswa 1)      :00:00, 02:00
    section Mahasiswa 1
    ANPR & Alokasi Slot (PK-UC001/002)         :02:00, 04:30
    section Mahasiswa 2
    Navigasi Kiosk & Sensor IoT (PK-UC003/004) :06:30, 04:30
    section Mahasiswa 3
    Anomali & Command Center (PK-UC005/009)    :11:00, 04:30
    section Mahasiswa 4
    Exit Gate, Cashless & Reports (PK-UC006/10):15:30, 04:30
    section Penutup
    Kesimpulan & Q&A Dosen                     :20:00, 05:00
```

| Mahasiswa | Fokus Peran & Fitur Use Case | Berkas Model & Service (M) | Berkas Controller & Endpoint (C) | Berkas View (V) | Porsi Materi GitHub |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Mahasiswa 1** *(Presenter 1 / Moderator)* | **Gerbang Masuk & Alokasi Slot**<br>• [PK-UC001](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/Dokumentasi/Panduan-Presentasi-Tim/01_Mahasiswa_1_Gerbang_Masuk_dan_Alokasi_Slot.md): Deteksi Plat & Klasifikasi<br>• [PK-UC002](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/Dokumentasi/Panduan-Presentasi-Tim/01_Mahasiswa_1_Gerbang_Masuk_dan_Alokasi_Slot.md): Alokasi Slot Otomatis | **Model**:<br>• [`DataKendaraan.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/model/DataKendaraan.java)<br>• [`SlotParkir.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/model/SlotParkir.java)<br>• [`JenisKendaraan.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/model/JenisKendaraan.java)<br>**Service**:<br>• [`DeteksiPlatService.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/DeteksiPlatService.java)<br>• [`AlokasiRuteService.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/AlokasiRuteService.java) | **Controller**:<br>• [`DeteksiPlatController.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/DeteksiPlatController.java)<br>`POST /api/gate/masuk`<br>• [`AlokasiRuteController.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/AlokasiRuteController.java)<br>`POST /api/alokasi-rute/proses` | [`ScanPage.jsx`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-kiosk/src/pages/ScanPage.jsx)<br>[`AllocatingSlotPage.jsx`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-kiosk/src/pages/AllocatingSlotPage.jsx) | Struktur Multi-Repository/Monorepo, pembagian layer branch (`main`, `back-end`, `front-end`, `front-end-kiosk`). |
| **Mahasiswa 2** | **Navigasi Kiosk & Sensor IoT**<br>• [PK-UC003](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/Dokumentasi/Panduan-Presentasi-Tim/02_Mahasiswa_2_Navigasi_Kiosk_dan_Telemetri_Sensor_IoT.md): Panduan Rute Visual Kiosk<br>• [PK-UC004](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/Dokumentasi/Panduan-Presentasi-Tim/02_Mahasiswa_2_Navigasi_Kiosk_dan_Telemetri_Sensor_IoT.md): Telemetri Ultrasonik & Emisi CO2 | **Model**:<br>• [`SensorIoT.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/model/SensorIoT.java)<br>• [`SlotParkir.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/model/SlotParkir.java)<br>• [`StatusSlot.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/model/StatusSlot.java)<br>**Service**:<br>• [`MonitoringFisikService.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/MonitoringFisikService.java)<br>• [`AnalitikLaporanService.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/AnalitikLaporanService.java) | **Controller**:<br>• [`MonitoringFisikController.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/MonitoringFisikController.java)<br>`GET /api/monitoring/slots`<br>`POST /api/monitoring/webhook`<br>• [`AlokasiRuteController.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/AlokasiRuteController.java)<br>`GET /api/alokasi-rute/status/{platNomor}` | [`NavigationPage.jsx`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-kiosk/src/pages/NavigationPage.jsx)<br>[`DashboardPage.jsx`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/src/pages/DashboardPage.jsx) | Pola Git Branching fitur frontend (`feat/kiosk-navigation`), sinkronisasi asset visual SVG, dan resolusi konflik UI. |
| **Mahasiswa 3** | **Anomali & Command Center Lapangan**<br>• [PK-UC005](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/Dokumentasi/Panduan-Presentasi-Tim/03_Mahasiswa_3_Deteksi_Anomali_dan_Command_Center_Petugas.md): Deteksi Anomali Parkir<br>• [PK-UC009](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/Dokumentasi/Panduan-Presentasi-Tim/03_Mahasiswa_3_Deteksi_Anomali_dan_Command_Center_Petugas.md): Command Center & Live Feed | **Model**:<br>• [`LogOperasionalIoT.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/model/LogOperasionalIoT.java)<br>• [`TingkatKeparahan.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/model/TingkatKeparahan.java)<br>• [`StatusResolusi.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/model/StatusResolusi.java)<br>• [`KameraAnpr.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/model/KameraAnpr.java)<br>**Service**:<br>• [`MonitoringFisikService.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/MonitoringFisikService.java) | **Controller**:<br>• [`MonitoringFisikController.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/MonitoringFisikController.java)<br>`GET /api/monitoring/log-iot`<br>`GET /api/monitoring/anomali/belum-ditangani`<br>`PUT /api/monitoring/anomali/{idLog}/selesai`<br>• [`HardwareStatusController.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/HardwareStatusController.java)<br>`GET /api/hardware/status` | [`AnomalyLogsPage.jsx`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/src/pages/AnomalyLogsPage.jsx)<br>[`GateLivePage.jsx`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/src/pages/GateLivePage.jsx) | Kolaborasi Pull Request (PR), Code Review antarmahasiswa, pengujian linter, dan issue tracking di GitHub. |
| **Mahasiswa 4** | **Gerbang Keluar & Laporan Eksekutif**<br>• [PK-UC006/007/008](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/Dokumentasi/Panduan-Presentasi-Tim/04_Mahasiswa_4_Gerbang_Keluar_Cashless_dan_Laporan_Eksekutif.md): Tarif, Cashless QRIS & Barrier<br>• [PK-UC010](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/Dokumentasi/Panduan-Presentasi-Tim/04_Mahasiswa_4_Gerbang_Keluar_Cashless_dan_Laporan_Eksekutif.md): Analitik Finansial & PDF/Excel | **Model**:<br>• [`TransaksiParkir.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/model/TransaksiParkir.java)<br>• [`Pembayaran.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/model/Pembayaran.java)<br>• [`StatusPembayaran.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/model/StatusPembayaran.java)<br>• [`LogAuditLaporan.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/model/LogAuditLaporan.java)<br>**Service**:<br>• [`TransaksiPembayaranService.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/TransaksiPembayaranService.java)<br>• [`AnalitikLaporanService.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/AnalitikLaporanService.java)<br>• [`LaporanService.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/LaporanService.java)<br>• [`LaporanPdfService.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/LaporanPdfService.java)<br>• [`LaporanExcelService.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/LaporanExcelService.java) | **Controller**:<br>• [`DeteksiPlatController.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/DeteksiPlatController.java)<br>`POST /api/gate/keluar`<br>• [`TransaksiPembayaranController.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/TransaksiPembayaranController.java)<br>`GET /api/pembayaran/tagihan`<br>`POST /api/pembayaran/konfirmasi`<br>• [`AnalitikLaporanController.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/AnalitikLaporanController.java)<br>`GET /api/analitik/dashboard`<br>• [`LaporanController.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/LaporanController.java)<br>`GET /api/laporan/ekspor/pdf`<br>`GET /api/laporan/ekspor/excel` | [`ExitScanPage.jsx`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-kiosk/src/pages/ExitScanPage.jsx)<br>[`DashboardManagementPage.jsx`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/src/pages/DashboardManagementPage.jsx)<br>[`ReportsPage.jsx`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/src/pages/ReportsPage.jsx) | Kebijakan Branch Protection `main`, implementasi merge non-fast-forward (`--no-ff`), dan visualisasi GitHub Network Graph. |

---

## 3. Skrip Transisi Antar-Pembicara (Operan Mic Mulus)

Agar presentasi terdengar kompak seperti tim pengembang profesional (bukan individualis), gunakan kalimat transisi standar berikut:

### Transisi dari Mahasiswa 1 ke Mahasiswa 2:
> *"Setelah kendaraan berhasil dideteksi dan sistem kami memesan slot di database, tantangan berikutnya adalah: bagaimana pengendara tahu rute menuju slot tersebut tanpa karcis kertas, dan bagaimana perangkat keras IoT mendeteksi kehadiran mobil secara fisik? Rekan saya [Nama Mahasiswa 2] akan mendemonstrasikan implementasi Use Case PK-UC003 dan PK-UC004 pada layar Kiosk dan sensor basement. Silakan [Nama Mahasiswa 2]."*

### Transisi dari Mahasiswa 2 ke Mahasiswa 3:
> *"Telemetri sensor ultrasonik telah berhasil kita pantau secara real-time. Namun, bagaimana jika pengendara parkir di slot yang salah, atau ada sensor fisik yang offline mendadak? Rekan saya [Nama Mahasiswa 3] akan menjelaskan arsitektur deteksi anomali pada PK-UC005 dan pengawasan pusat kontrol PK-UC009 beserta implementasi Pull Request GitHub kami. Silakan [Nama Mahasiswa 3]."*

### Transisi dari Mahasiswa 3 ke Mahasiswa 4:
> *"Operasional di lapangan telah terawasi dengan aman melalui Command Center. Tahap akhir yang krusial adalah siklus gerbang keluar: perhitungan tarif otomatis, pembayaran QRIS nirkontak, pembukaan palang, serta rekapitulasi data finansial untuk Direksi Manajemen Rumah Sakit. Rekan saya [Nama Mahasiswa 4] akan menjelaskan Use Case PK-UC006, PK-UC007, PK-UC008, PK-UC010, dan bagaimana kami mengelola GitHub Network Graph secara ketat. Silakan [Nama Mahasiswa 4]."*

---

## 4. Checklist Kesiapan Demo Hari-H (Pra-Presentasi)

Sebelum dipanggil dosen ke depan kelas, pastikan seluruh layanan berikut sudah berjalan di latar belakang:
- [ ] **Database MySQL Active**: Skema `spct_db` siap di port `3306`.
- [ ] **Spring Boot Running**: Layanan backend aktif di port `8081` (`http://localhost:8081`).
- [ ] **Kiosk Terminal Ready**: Terminal Vite Kiosk aktif di port `5174` (`http://localhost:5174`).
- [ ] **Web Dashboard Ready**: Web Admin Command Center aktif di port `5173` (`http://localhost:5173`).
- [ ] **Tab GitHub Terbuka**: Buka tab peramban yang menampilkan halaman **Network Graph** repositori GitHub:
  `https://github.com/RLNXZ00/Sistem-Parkir-Cerdas-Terintegrasi-IoT/network`
  sehingga dosen dapat langsung melihat alur merge commit dari branch ke `main` secara visual.

---

## 5. Visualisasi Alur Program: Diagram Sequence (Draw.io Ready)

Untuk mempermudah penjelasan alur logika teknis MVC dan query database dari tiap mahasiswa, tim telah menyediakan **4 Diagram Sequence Lengkap** dalam format Mermaid yang siap di-copy langsung ke Draw.io:

👉 **[Buka Dokumen: `05_Diagram_Sequence_Alur_Program_4_Mahasiswa.md`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/Dokumentasi/Panduan-Presentasi-Tim/05_Diagram_Sequence_Alur_Program_4_Mahasiswa.md)**

*Diagram mencakup:*
1. **Mahasiswa 1**: Alur Gerbang Masuk, ANPR, Registrasi Kendaraan & Alokasi Slot Otomatis (PK-UC001 & PK-UC002)
2. **Mahasiswa 2**: Alur Navigasi Kiosk & Telemetri Sensor Ultrasonik IoT ke WebSocket (PK-UC003 & PK-UC004)
3. **Mahasiswa 3**: Alur Deteksi Anomali Penyerobotan Slot & Command Center Resolusi Insiden (PK-UC005 & PK-UC009)
4. **Mahasiswa 4**: Alur Gerbang Keluar, Hitung Tarif, Pembayaran Cashless QRIS & Ekspor PDF/Excel (PK-UC006, 007, 008, 010)

