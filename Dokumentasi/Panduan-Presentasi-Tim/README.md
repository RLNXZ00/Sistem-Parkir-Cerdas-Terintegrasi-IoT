# Panduan Strategis Presentasi Tim (4 Mahasiswa) — Sistem Parkir Cerdas Terintegrasi IoT (SPCT IoT)

Selamat datang di direktori dokumentasi panduan presentasi tim proyek **Sistem Parkir Cerdas Terintegrasi IoT (SPCT IoT)**. Berkas-berkas di dalam folder ini disusun secara khusus untuk membantu 4 mahasiswa dalam tim membagi peran, membedah kode program Model-Controller-View (MVC), menjelaskan Use Case nyata yang sudah terimplementasi, dan mendemonstrasikan kepatuhan version control GitHub saat presentasi di hadapan dosen penguji.

---

## 1. Daftar Dokumen Panduan Presentasi

| Berkas Panduan | Mahasiswa & Peran | Fokus Use Case & Materi Utama |
| :--- | :--- | :--- |
| **[`00_Panduan_Umum_dan_Matriks_Tugas_4_Mahasiswa.md`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/Dokumentasi/Panduan-Presentasi-Tim/00_Panduan_Umum_dan_Matriks_Tugas_4_Mahasiswa.md)** | **Seluruh Tim (4 Orang)** | Matriks tanggung jawab, alokasi waktu presentasi (20 menit), skrip transisi operan mic antar-pembicara, dan checklist pra-presentasi. |
| **[`01_Mahasiswa_1_Gerbang_Masuk_dan_Alokasi_Slot.md`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/Dokumentasi/Panduan-Presentasi-Tim/01_Mahasiswa_1_Gerbang_Masuk_dan_Alokasi_Slot.md)** | **Mahasiswa 1** *(Moderator)* | • **PK-UC001**: Deteksi Plat ANPR & Klasifikasi<br>• **PK-UC002**: Pencarian & Alokasi Slot Otomatis<br>• **Git**: Struktur Monorepo & Branching Berjenjang |
| **[`02_Mahasiswa_2_Navigasi_Kiosk_dan_Telemetri_Sensor_IoT.md`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/Dokumentasi/Panduan-Presentasi-Tim/02_Mahasiswa_2_Navigasi_Kiosk_dan_Telemetri_Sensor_IoT.md)** | **Mahasiswa 2** | • **PK-UC003**: Panduan Rute Denah Visual Kiosk<br>• **PK-UC004**: Telemetri Sensor Ultrasonik & Emisi CO₂<br>• **Git**: Branching Frontend & Resolusi Konflik UI |
| **[`03_Mahasiswa_3_Deteksi_Anomali_dan_Command_Center_Petugas.md`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/Dokumentasi/Panduan-Presentasi-Tim/03_Mahasiswa_3_Deteksi_Anomali_dan_Command_Center_Petugas.md)** | **Mahasiswa 3** | • **PK-UC005**: Deteksi Anomali & Peringatan Salah Parkir<br>• **PK-UC009**: Command Center & 4 Kamera Live Gerbang<br>• **Git**: Pull Request (PR), Code Review & Issue Tracker |
| **[`04_Mahasiswa_4_Gerbang_Keluar_Cashless_dan_Laporan_Eksekutif.md`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/Dokumentasi/Panduan-Presentasi-Tim/04_Mahasiswa_4_Gerbang_Keluar_Cashless_dan_Laporan_Eksekutif.md)** | **Mahasiswa 4** | • **PK-UC006/007/008**: Tarif, QRIS Cashless & Barrier<br>• **PK-UC010**: Analitik Bisnis & Ekspor PDF/Excel<br>• **Git**: Main Protection, `--no-ff` Merge & Network Graph |

---

## 2. Kartu Saku Cepat Pembicara (Cheat Cards Hari-H)

Gunakan ringkasan poin ini sebagai pegangan cepat saat berdiri di depan kelas:

### 🎙️ Mahasiswa 1 (Pintu Masuk & Reservasi Awal)
* **Kata Kunci**: *"Kamera ANPR, Deteksi Plat, Status Slot KOSONG menjadi DIPESAN, Transaksi Masuk."*
* **File yang Ditunjuk**:
  - Model: [`Kendaraan.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/model/Kendaraan.java), [`SlotParkir.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/model/SlotParkir.java)
  - Controller: [`KioskController.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/KioskController.java) (`/api/kiosk/masuk`)
  - View: [`ScanPage.jsx`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-kiosk/src/pages/ScanPage.jsx)
* **GitHub**: Monorepo berstruktur dan layer branch `back-end`, `front-end`, `front-end-kiosk`.

### 🎙️ Mahasiswa 2 (Navigasi Paperless & Telemetri Hijau)
* **Kata Kunci**: *"Denah Visual Kiosk, Garis Hijau Berbelok Dinamis, Sensor Ultrasonik Jarak < 50cm, Debounce 4 Detik, DIPESAN menjadi TERISI, Rumus Reduksi CO2."*
* **File yang Ditunjuk**:
  - Model: [`SensorIot.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/model/SensorIot.java)
  - Controller: [`MonitoringController.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/MonitoringController.java) (`/api/monitoring/slots`)
  - View: [`NavigationPage.jsx`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-kiosk/src/pages/NavigationPage.jsx), [`DashboardPage.jsx`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/src/pages/DashboardPage.jsx)
* **GitHub**: Fitur branch frontend `feat/kiosk-navigation-map` dan sinkronisasi design token CSS.

### 🎙️ Mahasiswa 3 (Pengawasan Lapangan & Penanganan Insiden)
* **Kata Kunci**: *"Salah Parkir, Insiden CRITICAL, Buzzer Alert, Active Alerts Card Berkedip Merah, Validasi Petugas di Pos, Status SELESAI_DIVALIDASI, 4 Kamera Gerbang."*
* **File yang Ditunjuk**:
  - Model: [`LogOperasionalIot.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/model/LogOperasionalIot.java)
  - Controller: [`MonitoringController.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/MonitoringController.java) (`/api/monitoring/log-iot`)
  - View: [`AnomalyLogsPage.jsx`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/src/pages/AnomalyLogsPage.jsx), [`GateLivePage.jsx`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/src/pages/GateLivePage.jsx)
* **GitHub**: Penerapan Pull Request (PR) review antarmahasiswa dan GitHub Issues.

### 🎙️ Mahasiswa 4 (Penyelesaian Finansial, Audit & Git Governance)
* **Kata Kunci**: *"Grace Period 10 Menit Rp 0, Pembayaran Nirkontak QRIS Dinamis, Transaksi LUNAS, Slot Bebas Menjadi KOSONG, Palang Otomatis, Grafik Chart.js, Ekspor PDF/Excel, Branch Protection & Merge --no-ff."*
* **File yang Ditunjuk**:
  - Model: [`TransaksiParkir.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/model/TransaksiParkir.java), [`LogAuditLaporan.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/model/LogAuditLaporan.java)
  - Controller: [`KioskController.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/KioskController.java), [`LaporanController.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/LaporanController.java)
  - View: [`ExitScanPage.jsx`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-kiosk/src/pages/ExitScanPage.jsx), [`DashboardManagementPage.jsx`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/src/pages/DashboardManagementPage.jsx)
* **GitHub**: Bukti visual pada tab **GitHub Network Graph** yang menunjukkan traffic percabangan branch yang di-merge ke `main` via `--no-ff`.

---

## 3. Skenario Demo Live (5 Menit End-to-End)

Jika dosen meminta demonstrasi program secara langsung, jalankan alur berkesinambungan ini:

```
[LANGKAH 1 - Mahasiswa 1]
Buka Kiosk (http://localhost:5174/) -> Pilih MOBIL -> Masukkan 'B 1001 SPCT' -> Klik 'Cari Slot'
-> Sistem menampilkan animasi pencarian dan mengalokasikan slot 'B1-01'.

[LANGKAH 2 - Mahasiswa 2]
Layar Kiosk berpindah ke NavigationPage -> Tunjukkan garis hijau berbelok menuju kotak 'B1-01'
-> Buka tab Web Dashboard (http://localhost:5173/) -> Tunjukkan slot 'B1-01' berubah warna Kuning (DIPESAN).

[LANGKAH 3 - Mahasiswa 3]
Buka menu 'Anomaly Logs' di Web Dashboard -> Tunjukkan 10 log insiden kronologis
-> Klik 'Validasi' pada salah satu insiden -> Status berubah hijau 'SELESAI_DIVALIDASI'
-> Buka menu 'Gate Live' -> Tunjukkan 4 stream kamera gerbang aktif.

[LANGKAH 4 - Mahasiswa 4]
Buka Kiosk Keluar (http://localhost:5174/exit-scan) -> Masukkan plat 'B 1001 SPCT'
-> Sistem menampilkan rincian durasi & barcode QRIS -> Klik simulasi 'Bayar QRIS Lunas'
-> Palang keluar terbuka -> Di Web Dashboard slot 'B1-01' kembali Hijau (KOSONG).
-> Buka menu 'Laporan' di Web Admin -> Klik tombol 'Ekspor PDF' -> File terunduh langsung dan audit log tercatat.
-> Buka tab GitHub Network Graph -> Tunjukkan pohon merge commit '--no-ff' yang rapi.
```
