# 04. Katalog API REST, WebSocket STOMP, dan DTO Backend SPCT

Dokumentasi ini menyajikan katalog lengkap seluruh antarmuka pemrograman aplikasi (**REST API**), protokol komunikasi real-time (**WebSocket STOMP**), serta spesifikasi objek transfer data (**Data Transfer Object / DTO**) pada sistem backend SPCT.

---

## 1. Konfigurasi Jaringan & Base URL

- **Port Default Server**: `8080` (Dapat diatur melalui `application.properties`).
- **HTTP Base URL**: `http://localhost:8080`
- **WebSocket Handshake Endpoint**: `ws://localhost:8080/ws-spct` (atau fallback HTTP SockJS: `http://localhost:8080/ws-spct`).
- **CORS Policy**: `@CrossOrigin(origins = "*")` diterapkan pada seluruh controller untuk mendukung komunikasi lintas-port dari Frontend Dashboard (Vite port 5173/5174), Kiosk Terminal (port 5175), Python OCR microservice, dan IoT Hardware Gateways.

---

## 2. Katalog Endpoint REST API

### 2.1. Deteksi Plat & Operasional Gerbang (`/api/gate`)
Controller: [`DeteksiPlatController.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/DeteksiPlatController.java)

| No | Method | Endpoint URL | Parameter / Request Body | Response DTO / Entity | Kode HTTP | Keterangan & Referensi Baris |
| :---: | :---: | :--- | :--- | :--- | :---: | :--- |
| 1 | `POST` | `/api/gate/masuk` | **Body (JSON)**: `{"platNomor": "D 1234 SPCT", "jenisKendaraan": "MOBIL"}`<br>atau **Query**: `?platNomor=...&jenisKendaraan=...&confidence=1.0` | [`HasilDeteksiMasukDto`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/dto/HasilDeteksiMasukDto.java) | `200 OK`<br>`422 Unprocessable`<br>`409 Conflict`<br>`400 Bad Request` | Memproses deteksi masuk, mencari slot BFS, kunci slot, dan mencatat transaksi masuk.<br>[L51-L97](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/DeteksiPlatController.java#L51-L97) |
| 2 | `POST` | `/api/gate/masuk/override-manual` | **Query**: `?platNomor=...&jenisKendaraan=...` | [`HasilDeteksiMasukDto`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/dto/HasilDeteksiMasukDto.java) | `200 OK`<br>`409 Conflict` | Validasi manual oleh petugas saat confidence OCR di bawah 70% (dieksekusi dengan confidence 1.0).<br>[L106-L123](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/DeteksiPlatController.java#L106-L123) |
| 3 | `POST` | `/api/gate/keluar` | **Body (JSON)**: `{"platNomor": "...", "saldoEwallet": 50000, "durasiMenit": 65, "jenisKendaraan": "MOBIL"}` | [`HasilDeteksiKeluarDto`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/dto/HasilDeteksiKeluarDto.java) | `200 OK`<br>`404 Not Found`<br>`402 Payment Req` | Memproses transaksi keluar, kalkulasi tarif resmi, pemotongan saldo simulasi, dan pengosongan slot.<br>[L147-L208](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/DeteksiPlatController.java#L147-L208) |
| 4 | `GET` | `/api/gate/antrean-keluar` | **Query (Opsional)**: `?jenisKendaraan=MOBIL` | `List<Map<String, Object>>` (Antrean FIFO) | `200 OK` | Mengambil daftar mobil/motor yang sedang parkir untuk antrean gerbang keluar.<br>[L214-L240](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/DeteksiPlatController.java#L214-L240) |
| 5 | `GET` | `/api/gate/log` | *None* | `List<LogDeteksiPlat>` | `200 OK` | Mengambil seluruh riwayat log deteksi plat OCR untuk halaman Gate Live.<br>[L129-L142](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/DeteksiPlatController.java#L129-L142) |

---

### 2.2. Alokasi Slot & Rute Visual (`/api/alokasi-rute`)
Controller: [`AlokasiRuteController.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/AlokasiRuteController.java)

| No | Method | Endpoint URL | Parameter / Request Body | Response DTO / Entity | Kode HTTP | Keterangan & Referensi Baris |
| :---: | :---: | :--- | :--- | :--- | :---: | :--- |
| 1 | `POST` | `/api/alokasi-rute/proses` | **Query**: `?platNomor=...&jenisKendaraan=...` | [`HasilAlokasiRuteDto`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/dto/HasilAlokasiRuteDto.java) | `200 OK`<br>`409 Conflict` | Mengalokasikan slot kosong terdekat via BFS dan merekonstruksi titik koordinat rute 2D.<br>[L47-L64](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/AlokasiRuteController.java#L47-L64) |
| 2 | `GET` | `/api/alokasi-rute/status/{platNomor}` | **Path**: `{platNomor}` | `String` | `200 OK` | Endpoint pengecekan status alokasi aktif.<br>[L74-L81](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/AlokasiRuteController.java#L74-L81) |

---

### 2.3. Transaksi Pembayaran Kasir / Non-Tunai (`/api/pembayaran`)
Controller: [`TransaksiPembayaranController.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/TransaksiPembayaranController.java)

| No | Method | Endpoint URL | Parameter / Request Body | Response DTO / Entity | Kode HTTP | Keterangan & Referensi Baris |
| :---: | :---: | :--- | :--- | :--- | :---: | :--- |
| 1 | `GET` | `/api/pembayaran/tagihan` | **Query**: `?platNomor=...` | [`HasilTagihanDto`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/dto/HasilTagihanDto.java) | `200 OK`<br>`404 Not Found` | Menghitung durasi riil dan nominal tagihan parkir resmi.<br>[L42-L58](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/TransaksiPembayaranController.java#L42-L58) |
| 2 | `POST` | `/api/pembayaran/konfirmasi` | **Query**: `?idTransaksi=...&metodePembayaran=QRIS` | [`HasilTagihanDto`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/dto/HasilTagihanDto.java) | `200 OK` | Konfirmasi pembayaran lunas, pembebasan slot fisik, dan instruksi buka palang.<br>[L66-L76](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/TransaksiPembayaranController.java#L66-L76) |

---

### 2.4. Telemetri IoT & Manajemen Anomali (`/api/monitoring`)
Controller: [`MonitoringFisikController.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/MonitoringFisikController.java)

| No | Method | Endpoint URL | Parameter / Request Body | Response DTO / Entity | Kode HTTP | Keterangan & Referensi Baris |
| :---: | :---: | :--- | :--- | :--- | :---: | :--- |
| 1 | `POST` | `/api/monitoring/webhook` | **Query**: `?idSlot=B1-01&statusSensor=TERISI` | `String` | `200 OK` | Webhook penerima sinyal ultrasonik Raspberry Pi, eksekusi branching 3 kondisi.<br>[L51-L61](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/MonitoringFisikController.java#L51-L61) |
| 2 | `GET` | `/api/monitoring/anomali/belum-ditangani` | *None* | `List<LogOperasionalIoT>` | `200 OK` | Mengambil seluruh log insiden penyerobotan slot yang masih berstatus `BELUM_DITANGANI`.<br>[L70-L77](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/MonitoringFisikController.java#L70-L77) |
| 3 | `GET` | `/api/monitoring/anomali/hitung` | *None* | `Long` | `200 OK` | Mengembalikan total angka anomali aktif untuk badge lonceng notifikasi header.<br>[L80-L86](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/MonitoringFisikController.java#L80-L86) |
| 4 | `PUT` | `/api/monitoring/anomali/{idLog}/selesai` | **Path**: `{idLog}`<br>**Body**: [`ResolusiAnomaliRequestDto`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/dto/ResolusiAnomaliRequestDto.java) | `String` | `200 OK`<br>`404 Not Found` | Petugas mengonfirmasi penyelesaian anomali (kategori: Salah Parkir, Sensor Rusak, dll).<br>[L94-L130](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/MonitoringFisikController.java#L94-L130) |

---

### 2.5. Analitik & Dashboard Manajemen (`/api/analitik`)
Controller: [`AnalitikLaporanController.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/AnalitikLaporanController.java)

| No | Method | Endpoint URL | Parameter / Request Body | Response DTO / Entity | Kode HTTP | Keterangan & Referensi Baris |
| :---: | :---: | :--- | :--- | :--- | :---: | :--- |
| 1 | `GET` | `/api/analitik/dashboard` | *None* | [`DataDashboardDto`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/dto/DataDashboardDto.java) | `200 OK` | Mengambil snapshot metrik live hari ini (omset, CO2, okupansi, grafik per jam).<br>[L45-L56](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/AnalitikLaporanController.java#L45-L56) |
| 2 | `GET` | `/api/analitik/laporan` | **Query**: `?dari=YYYY-MM-DD&sampai=YYYY-MM-DD` | [`DataDashboardDto`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/dto/DataDashboardDto.java) | `200 OK`<br>`400 Bad Request` | Mengambil data dashboard berdasarkan rentang tanggal kustom.<br>[L66-L83](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/AnalitikLaporanController.java#L66-L83) |
| 3 | `GET` | `/api/analitik/laporan/bulanan` | **Query**: `?tahun=2026&bulan=10` | [`DataDashboardDto`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/dto/DataDashboardDto.java) | `200 OK` | Shortcut data analitik untuk satu bulan kalender penuh.<br>[L92-L108](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/AnalitikLaporanController.java#L92-L108) |

---

### 2.6. Pengelolaan Laporan, Ekspor, & Retensi (`/api/laporan`)
Controller: [`LaporanController.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/LaporanController.java)

| No | Method | Endpoint URL | Parameter / Request Body | Response DTO / Entity | Kode HTTP | Keterangan & Referensi Baris |
| :---: | :---: | :--- | :--- | :--- | :---: | :--- |
| 1 | `GET` | `/api/laporan/preview` | **Query**: `?jenis=finansial&dari=...&sampai=...` | [`LaporanResponseDto`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/dto/LaporanResponseDto.java) | `200 OK`<br>`400 Bad Request` | Pratinjau data laporan operasional (Finansial, Operasional, Lingkungan, Komprehensif).<br>[L47-L55](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/LaporanController.java#L47-L55) |
| 2 | `GET` | `/api/laporan/unduh` | **Query**: `?format=pdf&jenis=finansial&dari=...&sampai=...` | `byte[]` (Binary File Stream) | `200 OK`<br>`400 Bad Request` | Unduh file resmi PDF/XLSX ber-kop surat dan mencatat rekam jejak audit unduhan otomatis.<br>[L66-L157](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/LaporanController.java#L66-L157) |
| 3 | `GET` | `/api/laporan/audit` | *None* | `List<LogAuditLaporan>` | `200 OK` | Riwayat 15 aktivitas pengunduhan laporan terakhir oleh manajemen.<br>[L166-L170](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/LaporanController.java#L166-L170) |
| 4 | `GET` | `/api/laporan/retensi/status` | *None* | `Map<String, Object>` | `200 OK` | Informasi kuota kebijakan retensi data (90 hari normal) dan baris data terlindungi.<br>[L179-L183](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/LaporanController.java#L179-L183) |
| 5 | `POST` | `/api/laporan/retensi/purge` | *None* | `Map<String, Object>` | `200 OK` | Memicu pembersihan log sensor normal yang berusia >90 hari secara manual.<br>[L192-L196](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/LaporanController.java#L192-L196) |

---

### 2.7. Pemantauan & Kontrol Hardware IoT (`/api/hardware`)
Controller: [`HardwareStatusController.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/HardwareStatusController.java)

| No | Method | Endpoint URL | Parameter / Request Body | Response DTO / Entity | Kode HTTP | Keterangan & Referensi Baris |
| :---: | :---: | :--- | :--- | :--- | :---: | :--- |
| 1 | `GET` | `/api/hardware/kamera` | *None* | `List<KameraAnpr>` | `200 OK` | Mengambil status operasional seluruh kamera ANPR gerbang (4 unit).<br>[L36-L40](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/HardwareStatusController.java#L36-L40) |
| 2 | `PATCH` | `/api/hardware/kamera/{idKamera}/status` | **Path**: `{idKamera}`<br>**Body**: `{"statusKamera": "ON"}` | `Map<String, Object>` | `200 OK`<br>`400 Bad Request`<br>`404 Not Found` | Menghidupkan atau mematikan status operasional kamera ANPR.<br>[L45-L71](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/HardwareStatusController.java#L45-L71) |
| 3 | `GET` | `/api/hardware/sensor` | *None* | `List<SensorIoT>` | `200 OK` | Mengambil status operasional seluruh sensor ultrasonik slot.<br>[L76-L80](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/HardwareStatusController.java#L76-L80) |
| 4 | `PATCH` | `/api/hardware/sensor/{idSensor}/status` | **Path**: `{idSensor}`<br>**Body**: `{"statusSensor": "OFF"}` | `Map<String, Object>` | `200 OK`<br>`400 Bad Request`<br>`404 Not Found` | Menandai sensor sedang maintenance / offline.<br>[L85-L111](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/HardwareStatusController.java#L85-L111) |

---

### 2.8. Autentikasi Pengguna & Reset Kredensial (`/api/auth`)
Controller: [`AuthController.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/AuthController.java)

| No | Method | Endpoint URL | Parameter / Request Body | Response DTO / Entity | Kode HTTP | Keterangan & Referensi Baris |
| :---: | :---: | :--- | :--- | :--- | :---: | :--- |
| 1 | `POST` | `/api/auth/login` | **Body**: `{"username": "19850101", "password": "..."}` | `Map<String, Object>` (Data User & Role) | `200 OK`<br>`401 Unauthorized`<br>`400 Bad Request` | Login staf/petugas dengan identifier fleksibel (NIP 8 digit atau username).<br>[L88-L157](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/AuthController.java#L88-L157) |
| 2 | `POST` | `/api/auth/reset-password` | **Body**: `{"nip": "19850101", "newPassword": "..."}` | `Map<String, String>` | `200 OK`<br>`400 Bad Request`<br>`404 Not Found` | Reset kata sandi dengan validasi keamanan (min 8 karakter, ada angka, ada simbol khusus).<br>[L31-L86](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/AuthController.java#L31-L86) |

---

## 3. Protokol & Topik WebSocket STOMP

Konfigurasi: [`WebSocketConfig.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/config/WebSocketConfig.java)

### 3.1. Topik `/topic/monitoring` (Pembaruan Denah Real-Time)
- **Arah**: Server Push -> Frontend Web Dashboard.
- **Pemicu**: Setiap ada perubahan status slot (dari `DIPESAN` ke `TERISI`, atau dari `TERISI` ke `KOSONG`).
- **Contoh Payload JSON**:
  ```json
  {
    "idSlot": "B1-05",
    "statusBaru": "TERISI",
    "tingkatKeparahan": "INFO"
  }
  ```
- **Tindakan Frontend**: Denah visual langsung merender warna slot menjadi merah (terisi) atau hijau (kosong) tanpa perlu me-refresh halaman browser.

### 3.2. Topik `/topic/anomali` (Peringatan Darurat Penyerobotan Slot)
- **Arah**: Server Push -> Frontend Web Dashboard (Khusus Petugas Lapangan).
- **Pemicu**: Sensor ultrasonik mendeteksi mobil parkir di slot yang status database-nya `KOSONG` (tanpa alokasi sistem).
- **Contoh Payload JSON**:
  ```json
  {
    "idSlot": "B1-12",
    "pesan": "ANOMALI! Slot B1-12: status DB=KOSONG tetapi sensor mendeteksi kendaraan. Kemungkinan penyerobotan atau salah parkir.",
    "jenis": "ANOMALI_PENYEROBOTAN"
  }
  ```
- **Tindakan Frontend**: Memunculkan popup modal peringatan merah berkedip dan membunyikan alarm visual pada header dashboard.

---

## 4. Spesifikasi Objek Transfer Data (DTO)

### 4.1. `DataDashboardDto.java`
Objek komposit berisi seluruh indikator kunci manajemen:
- `pendapatanHariIni` (`BigDecimal`), `pendapatanBulanan` (`BigDecimal`), `persentasePendapatan` (`Double`).
- `totalKendaraan` (`Long`), `totalAnomali` (`Long`), `slotKosong` (`Long`), `slotTerisi` (`Long`).
- `totalReduksiCo2Kg` (`Double`), `persentaseCo2` (`Double`).
- `grafikOkupansi` (`List<DataOkupansiJamDto>`): Pasangan label jam `HH:00` dan volume kendaraan masuk.
- `grafikPendapatanHarian` (`List<DataPendapatanHarianDto>`): Tren omset harian dari tanggal 1 s.d. hari ini.

### 4.2. `HasilAlokasiRuteDto.java`
- `idSlotDialokasikan` (`String`): Misal `"B1-03"`.
- `lantaiSlot` (`Integer`): Nomor lantai (1, 2, atau 3).
- `koordinatX` (`Double`), `koordinatY` (`Double`).
- `urutan` (`List<TitikRuteDto>`): Rangkaian simpul koordinat rute dari gerbang `Gate-A` hingga slot tujuan.
- `pesanStatus` (`String`): `"ALOKASI_BERHASIL"` atau `"BASEMENT_PENUH"`.

### 4.3. `HasilDeteksiMasukDto.java`
- `status` (`String`): `"SUKSES"`, `"CONFIDENCE_RENDAH"`, atau `"BASEMENT_PENUH"`.
- `platNomor` (`String`), `waktuMasuk` (`LocalDateTime`), `idTransaksi` (`Long`).
- `idSlotDialokasikan` (`String`), `lantaiSlot` (`Integer`), `urutanRute` (`List<TitikRuteDto>`).
- `pesanKeterangan` (`String`): Teks instruksi untuk layar sentuh Kiosk.

### 4.4. `HasilDeteksiKeluarDto.java`
- `status` (`String`): `"SUKSES"`, `"KENDARAAN_TIDAK_DITEMUKAN"`, atau `"SALDO_KURANG"`.
- `platNomor` (`String`), `waktuMasuk` (`LocalDateTime`), `waktuKeluar` (`LocalDateTime`).
- `durasiJam` (`Long`), `totalBiaya` (`BigDecimal`).
- `pesan` (`String`): Pesan instruksi pembayaran / status palang keluar.

### 4.5. `HasilTagihanDto.java`
- `idTransaksi` (`Long`), `platNomor` (`String`), `waktuMasuk` & `waktuKeluar` (`LocalDateTime`).
- `durasiTotalMenit` (`Integer`), `nominalTagihan` (`BigDecimal`), `statusPembayaran` (`StatusPembayaran`).

### 4.6. `LaporanResponseDto.java`
- `metadata` (`MetadataLaporanDto`): Jenis laporan, rentang tanggal, total baris, mode simulasi flag.
- `ringkasan` (`List<KartuKpiDto>`): 4 kotak kartu metrik ringkasan.
- `tabelFinansial` (`List<BarisFinansialDto>`): Kolom tiket, plat, jenis, masuk, keluar, durasi, tagihan, metode, status.
- `tabelOperasional` (`List<BarisOperasionalDto>`): Kolom log ID, waktu, slot, tipe event, jenis anomali, catatan detail, severity, status resolusi.
- `tabelLingkungan` (`List<BarisLingkunganDto>`): Kolom plat, slot, masuk, tiba slot, durasi tempuh riil (detik), estimasi standar (300 detik), menit hemat, reduksi CO2 (gram).

### 4.7. `ResolusiAnomaliRequestDto.java`
- `jenisAnomali` (`String`): Misal `"Salah Parkir"`, `"Sensor Rusak"`, `"Kendaraan VIP"`.
- `catatanTambahan` (`String`): Catatan lapangan dari petugas saat validasi.

### 4.8. `TitikRuteDto.java`
- `id` (`String`): Nama simpul graf (misal `"Gate-A"`, `"N-1"`, `"NODE_B1_3"`).
- `x` (`double`), `y` (`double`): Titik koordinat kartesius 2D pada denah lantai.
