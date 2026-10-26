# 📊 Diagram Sequence Alur Program Sistem Parkir Cerdas Terintegrasi IoT (SPCT)
## Pemetaan Lengkap Alur MVC & End-to-End untuk 4 Mahasiswa (Siap Pakai di Draw.io)

Dokumen ini berisi **4 Sequence Diagram lengkap** yang memvisualisasikan interaksi nyata antarlayer sistem:
$$\text{Frontend / IoT Hardware} \longrightarrow \text{Controller} \longrightarrow \text{Service} \longrightarrow \text{Repository} \longrightarrow \text{Model / Entity} \longleftrightarrow \text{Database MySQL}$$

Setiap diagram merepresentasikan ruang lingkup tanggung jawab use case dari masing-masing mahasiswa dalam tim.

---

> [!TIP]
> ### 🎨 Cara Memasukkan Kode Ini Langsung ke Draw.io (app.diagrams.net):
> 1. Buka aplikasi **Draw.io** di desktop atau peramban ([app.diagrams.net](https://app.diagrams.net)).
> 2. Pada menu bar atas, klik **Arrange** (*Atur*) $\rightarrow$ **Insert** (*Sisipkan*) $\rightarrow$ **Advanced** (*Tingkat Lanjut*) $\rightarrow$ **Mermaid**.
> 3. Hapus teks contoh bawaan Draw.io, lalu **Copy & Paste salah satu blok kode sequence di bawah** (dari baris `sequenceDiagram` sampai baris terakhir kode diagram).
> 4. Klik tombol **Insert** (*Sisipkan*).
> 5. Diagram interaktif beresolusi tinggi akan langsung terbentuk secara otomatis dan dapat Anda ubah warna tema, font, maupun ukurannya sesuai selera presentasi!

---

## 📑 Daftar Isi Diagram

1. [Mahasiswa 1: Alur Gerbang Masuk, ANPR & Alokasi Slot Otomatis (PK-UC001 & PK-UC002)](#1-mahasiswa-1-alur-gerbang-masuk-anpr--alokasi-slot-otomatis-pk-uc001--pk-uc002)
2. [Mahasiswa 2: Alur Navigasi Kiosk & Telemetri Sensor IoT Real-Time (PK-UC003 & PK-UC004)](#2-mahasiswa-2-alur-navigasi-kiosk--telemetri-sensor-iot-real-time-pk-uc003--pk-uc004)
3. [Mahasiswa 3: Alur Deteksi Anomali Lapangan & Command Center Petugas (PK-UC005 & PK-UC009)](#3-mahasiswa-3-alur-deteksi-anomali-lapangan--command-center-petugas-pk-uc005--pk-uc009)
4. [Mahasiswa 4: Alur Gerbang Keluar, Pembayaran Cashless QRIS & Laporan Eksekutif (PK-UC006, 007, 008, 010)](#4-mahasiswa-4-alur-gerbang-keluar-pembayaran-cashless-qris--laporan-eksekutif-pk-uc006-007-008-010)

---

## 1. Mahasiswa 1: Alur Gerbang Masuk, ANPR & Alokasi Slot Otomatis (PK-UC001 & PK-UC002)

### Fokus Tanggung Jawab:
- **PK-UC001: Deteksi Plat Nomor & Klasifikasi (ANPR OCR)**
- **PK-UC002: Alokasi Slot Otomatis (Algoritma Penelusuran Slot Terdekat)**
- **Berkas Terkait**:
  - View: [`ScanPage.jsx`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-kiosk/src/pages/ScanPage.jsx), [`AllocatingSlotPage.jsx`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-kiosk/src/pages/AllocatingSlotPage.jsx)
  - Controller: [`DeteksiPlatController.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/DeteksiPlatController.java) (`POST /api/gate/masuk`)
  - Service: [`DeteksiPlatService.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/DeteksiPlatService.java), [`AlokasiRuteService.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/AlokasiRuteService.java)
  - Repository: [`DataKendaraanRepository.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/repository/DataKendaraanRepository.java), [`SlotParkirRepository.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/repository/SlotParkirRepository.java), [`TransaksiParkirRepository.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/repository/TransaksiParkirRepository.java)
  - Model: [`DataKendaraan.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/model/DataKendaraan.java), [`SlotParkir.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/model/SlotParkir.java), [`TransaksiParkir.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/model/TransaksiParkir.java)

### 📌 Salin Kode Ini ke Draw.io (Mahasiswa 1):

```mermaid
sequenceDiagram
    autonumber
    actor Pengendara as Terminal Kiosk Masuk (ScanPage.jsx)
    participant C as DeteksiPlatController
    participant S_Plat as DeteksiPlatService
    participant S_Rute as AlokasiRuteService
    participant R_Ken as DataKendaraanRepository
    participant R_Slot as SlotParkirRepository
    participant R_Tx as TransaksiParkirRepository
    participant DB as MySQL Database (spct_db)

    Note over Pengendara,C: Tahap 1: Pengendara Tiba & Kamera ANPR Membaca Plat
    Pengendara->>C: POST /api/gate/masuk {platNomor: "B 1234 SPCT", jenisKendaraan: "MOBIL"}
    Note over C: DeteksiPlatController memvalidasi kelengkapan request body
    C->>S_Plat: prosesKendaraanMasuk("B 1234 SPCT", MOBIL, 0.95)

    Note over S_Plat,R_Ken: Tahap 2: Registrasi / Verifikasi Master Kendaraan
    S_Plat->>R_Ken: findByPlatNomor("B 1234 SPCT")
    R_Ken->>DB: SELECT * FROM data_kendaraan WHERE plat_nomor = 'B 1234 SPCT'
    DB-->>R_Ken: Kembalikan DataKendaraan (atau null jika baru)
    alt Kendaraan Belum Ada di Database
        S_Plat->>R_Ken: save(new DataKendaraan("B 1234 SPCT", MOBIL))
        R_Ken->>DB: INSERT INTO data_kendaraan ...
        DB-->>R_Ken: DataKendaraan tersimpan (id=10)
    end

    Note over S_Plat,S_Rute: Tahap 3: Eksekusi Algoritma Alokasi Slot Terdekat
    S_Plat->>S_Rute: prosesAlokasiDanRute("B 1234 SPCT", MOBIL)
    S_Rute->>R_Slot: findByStatusSlotAndLantaiAndJenisKendaraan(KOSONG, lantai=1, MOBIL)
    R_Slot->>DB: SELECT * FROM slot_parkir WHERE status_slot='KOSONG' AND lantai=1 ...
    DB-->>R_Slot: Daftar Slot Kosong Lantai 1 (contoh: "B1-03")
    R_Slot-->>S_Rute: List<SlotParkir>
    Note over S_Rute: Penelusuran Graf Graf-BFS dari Gate-A menuju node slot "B1-03"
    Note over S_Rute: Mengunci status slot menjadi DIPESAN
    S_Rute->>R_Slot: save(slotTerpilih.setStatus(DIPESAN))
    R_Slot->>DB: UPDATE slot_parkir SET status_slot='DIPESAN', kendaraan_aktif_id=10 WHERE id_slot='B1-03'
    S_Rute-->>S_Plat: Kembalikan HasilAlokasiRuteDto (slotId: "B1-03", urutan waypoint rute)

    Note over S_Plat,R_Tx: Tahap 4: Penerbitan Tiket Masuk & Respon ke Kiosk
    S_Plat->>R_Tx: save(new TransaksiParkir(kendaraan, slotTerpilih))
    R_Tx->>DB: INSERT INTO transaksi_parkir (waktu_masuk, status_pembayaran) VALUES (NOW(), 'BELUM_LUNAS')
    DB-->>R_Tx: TransaksiParkir tersimpan (idTransaksi=1001)
    R_Tx-->>S_Plat: Objek TransaksiParkir
    S_Plat-->>C: HasilDeteksiMasukDto (status="SUKSES", slotId="B1-03", rute, idTransaksi=1001)
    C-->>Pengendara: HTTP 200 OK (JSON HasilDeteksiMasukDto)
    Note over Pengendara: Kiosk menampilkan slot B1-03, memutar audio, dan palang pintu terbuka
```

---

## 2. Mahasiswa 2: Alur Navigasi Kiosk & Telemetri Sensor IoT Real-Time (PK-UC003 & PK-UC004)

### Fokus Tanggung Jawab:
- **PK-UC003: Panduan Rute Visual Kiosk (Denah Interaktif SVG & Waypoint Node)**
- **PK-UC004: Telemetri Ultrasonik & Emisi CO2 (Validasi Fisik Kendaraan Tiba)**
- **Berkas Terkait**:
  - View: [`NavigationPage.jsx`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-kiosk/src/pages/NavigationPage.jsx), [`DashboardPage.jsx`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/src/pages/DashboardPage.jsx)
  - Controller: [`MonitoringFisikController.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/MonitoringFisikController.java) (`GET /api/monitoring/slots`, `POST /api/monitoring/webhook`)
  - Service: [`MonitoringFisikService.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/MonitoringFisikService.java)
  - Repository: [`SlotParkirRepository.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/repository/SlotParkirRepository.java), [`TransaksiParkirRepository.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/repository/TransaksiParkirRepository.java), [`LogOperasionalIoTRepository.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/repository/LogOperasionalIoTRepository.java)
  - Push Protocol: **Spring STOMP WebSocket** (`/topic/slots`)

### 📌 Salin Kode Ini ke Draw.io (Mahasiswa 2):

```mermaid
sequenceDiagram
    autonumber
    actor SensorHardware as Sensor Ultrasonik ESP32 (Hardware IoT)
    participant C as MonitoringFisikController
    participant S as MonitoringFisikService
    participant R_Slot as SlotParkirRepository
    participant R_Tx as TransaksiParkirRepository
    participant R_Log as LogOperasionalIoTRepository
    participant DB as MySQL Database (spct_db)
    participant WS as WebSocket Broker (/topic/slots)
    actor AdminWeb as Web Dashboard Petugas (DashboardPage.jsx)

    Note over SensorHardware,C: Tahap 1: Kendaraan Masuk ke Slot B1-03 & Sensor Deteksi Jarak < 30 cm
    SensorHardware->>C: POST /api/monitoring/webhook {idSlot: "B1-03", statusSensorHardware: "TERISI"}
    C->>S: prosesTelemetriSensor("B1-03", "TERISI")

    Note over S,R_Slot: Tahap 2: Verifikasi Status Slot di Database
    S->>R_Slot: findById("B1-03")
    R_Slot->>DB: SELECT * FROM slot_parkir WHERE id_slot = 'B1-03'
    DB-->>R_Slot: SlotParkir (statusSaatIni: DIPESAN, platAktif: "B 1234 SPCT")
    R_Slot-->>S: Objek SlotParkir

    Note over S,R_Tx: Tahap 3: Kondisi Normal Parkir (DIPESAN -> TERISI)
    Note over S: Hitung selisih waktu tiba vs waktu masuk (ChronoUnit.SECONDS)
    S->>R_Tx: findFirstByKendaraan_PlatNomor...("B 1234 SPCT", BELUM_LUNAS)
    R_Tx->>DB: SELECT * FROM transaksi_parkir WHERE plat='B 1234 SPCT' AND status='BELUM_LUNAS'
    DB-->>R_Tx: TransaksiParkir aktif
    Note over S: Hitung reduksi emisi: menitDihemat = durasiTempuh / 60.0
    S->>R_Tx: save(transaksiAktif.setWaktuTibaSlot(now))
    R_Tx->>DB: UPDATE transaksi_parkir SET waktu_tiba_slot=NOW(), menit_dihemat=1.5 WHERE id=1001

    Note over S,R_Slot: Tahap 4: Update Status Slot & Pencatatan Log IoT
    S->>R_Slot: save(slot.setStatusSlot(TERISI))
    R_Slot->>DB: UPDATE slot_parkir SET status_slot='TERISI' WHERE id_slot='B1-03'
    S->>R_Log: save(new LogOperasionalIoT(slot, SENSOR_MENDETEKSI_MOBIL_MASUK, INFO))
    R_Log->>DB: INSERT INTO log_operasional_iot ...
    
    Note over S,AdminWeb: Tahap 5: Siaran Real-Time WebSocket ke Web Admin
    S->>WS: convertAndSend("/topic/slots", {idSlot: "B1-03", status: "TERISI", keparahan: "INFO"})
    WS-->>AdminWeb: Push Notifikasi WebSocket (Payload Slot B1-03)
    Note over AdminWeb: Denah SVG langsung berubah warna menjadi MERAH/TERISI tanpa refresh browser!
    S-->>C: Selesai
    C-->>SensorHardware: HTTP 200 OK (Telemetri Berhasil Diproses)
```

---

## 3. Mahasiswa 3: Alur Deteksi Anomali Lapangan & Command Center Petugas (PK-UC005 & PK-UC009)

### Fokus Tanggung Jawab:
- **PK-UC005: Deteksi Anomali Parkir (Penyerobotan Slot / Mobil Salah Parkir)**
- **PK-UC009: Command Center Petugas, Live Feed Kamera & Resolusi Insiden**
- **Berkas Terkait**:
  - View: [`AnomalyLogsPage.jsx`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/src/pages/AnomalyLogsPage.jsx), [`GateLivePage.jsx`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/src/pages/GateLivePage.jsx)
  - Controller: [`MonitoringFisikController.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/MonitoringFisikController.java), [`HardwareStatusController.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/HardwareStatusController.java)
  - Service: [`MonitoringFisikService.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/MonitoringFisikService.java)
  - Repository: [`LogOperasionalIoTRepository.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/repository/LogOperasionalIoTRepository.java), [`SlotParkirRepository.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/repository/SlotParkirRepository.java)
  - Model: [`LogOperasionalIoT.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/model/LogOperasionalIoT.java), [`TingkatKeparahan.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/model/TingkatKeparahan.java), [`StatusResolusi.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/model/StatusResolusi.java)

### 📌 Salin Kode Ini ke Draw.io (Mahasiswa 3):

```mermaid
sequenceDiagram
    autonumber
    actor SensorIoT as Sensor Ultrasonik Fisik
    participant C_Mon as MonitoringFisikController
    participant S_Mon as MonitoringFisikService
    participant R_Slot as SlotParkirRepository
    participant R_Log as LogOperasionalIoTRepository
    participant DB as MySQL Database (spct_db)
    participant WS as WebSocket (/topic/anomali & /topic/slots)
    actor Petugas as Petugas Command Center (AnomalyLogsPage.jsx)

    Note over SensorIoT,C_Mon: Skenario Kasus Anomali: Mobil Nyelonong ke Slot KOSONG Tanpa Tiket
    SensorIoT->>C_Mon: POST /api/monitoring/webhook {idSlot: "B1-08", statusSensor: "TERISI"}
    C_Mon->>S_Mon: prosesTelemetriSensor("B1-08", "TERISI")

    Note over S_Mon,R_Slot: Evaluasi Kondisi Inkonsistensi Fisik vs Database
    S_Mon->>R_Slot: findById("B1-08")
    R_Slot->>DB: SELECT * FROM slot_parkir WHERE id_slot = 'B1-08'
    DB-->>R_Slot: Status Database = 'KOSONG' (Tidak ada pemesanan masuk)
    R_Slot-->>S_Mon: SlotParkir(status=KOSONG)

    Note over S_Mon: DETEKSI ANOMALI: DB=KOSONG tetapi Sensor Melaporkan TERISI!
    S_Mon->>R_Log: save(new LogOperasionalIoT(B1-08, ANOMALI_PENYEROBOTAN_SLOT, CRITICAL))
    R_Log->>DB: INSERT INTO log_operasional_iot (id_slot, jenis_kejadian, tingkat_keparahan, status_resolusi) VALUES ('B1-08', 'ANOMALI_PENYEROBOTAN_SLOT', 'CRITICAL', 'BELUM_DITANGANI')
    DB-->>R_Log: Log tersimpan (idLog=55)

    Note over S_Mon,Petugas: Siaran Notifikasi Alarm Darurat ke Web Petugas
    S_Mon->>WS: kirimAlertAnomali("B1-08", "ANOMALI! Kemungkinan penyerobotan slot.")
    S_Mon->>WS: kirimPembaruanDenah("B1-08", "ANOMALI", "CRITICAL")
    WS-->>Petugas: Pop-up Toast Alert Merah & Slot Berkedip di Command Center!

    Note over Petugas,C_Mon: Tindakan Penanganan & Resolusi Insiden oleh Petugas
    Petugas->>Petugas: Meninjau CCTV GateLivePage & menegur pengemudi di basement
    Petugas->>C_Mon: PUT /api/monitoring/anomali/55/selesai
    C_Mon->>R_Log: findById(55)
    R_Log->>DB: SELECT * FROM log_operasional_iot WHERE id_log = 55
    DB-->>R_Log: Data Log id 55
    Note over C_Mon: Update statusResolusi = SELESAI_DIVALIDASI
    C_Mon->>R_Log: save(log)
    R_Log->>DB: UPDATE log_operasional_iot SET status_resolusi='SELESAI_DIVALIDASI' WHERE id_log=55
    C_Mon-->>Petugas: HTTP 200 OK (Status Berhasil Diperbarui, Alarm Padam)
```

---

## 4. Mahasiswa 4: Alur Gerbang Keluar, Pembayaran Cashless QRIS & Laporan Eksekutif (PK-UC006, 007, 008, 010)

### Fokus Tanggung Jawab:
- **PK-UC006: Deteksi Plat Nomor Keluar & Kalkulasi Tarif Otomatis**
- **PK-UC007 & PK-UC008: Pembayaran Digital QRIS Nirkontak & Pembukaan Palang Keluar**
- **PK-UC010: Analitik Finansial & Pembuatan Laporan Resmi PDF/Excel**
- **Berkas Terkait**:
  - View: [`ExitScanPage.jsx`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-kiosk/src/pages/ExitScanPage.jsx), [`ReportsPage.jsx`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/src/pages/ReportsPage.jsx), [`DashboardManagementPage.jsx`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/src/pages/DashboardManagementPage.jsx)
  - Controller: [`TransaksiPembayaranController.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/TransaksiPembayaranController.java), [`LaporanController.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/LaporanController.java)
  - Service: [`TransaksiPembayaranService.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/TransaksiPembayaranService.java), [`LaporanPdfService.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/LaporanPdfService.java)
  - Repository: [`TransaksiParkirRepository.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/repository/TransaksiParkirRepository.java), [`PembayaranRepository.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/repository/PembayaranRepository.java), [`SlotParkirRepository.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/repository/SlotParkirRepository.java), [`LogAuditLaporanRepository.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/repository/LogAuditLaporanRepository.java)

### 📌 Salin Kode Ini ke Draw.io (Mahasiswa 4):

```mermaid
sequenceDiagram
    autonumber
    actor Pengendara as Terminal Kiosk Keluar (ExitScanPage.jsx)
    participant C_Bayar as TransaksiPembayaranController
    participant S_Bayar as TransaksiPembayaranService
    participant R_Tx as TransaksiParkirRepository
    participant R_Pay as PembayaranRepository
    participant R_Slot as SlotParkirRepository
    participant DB as MySQL Database (spct_db)

    Note over Pengendara,C_Bayar: Bagian 1: Deteksi Plat Keluar & Hitung Tagihan
    Pengendara->>C_Bayar: GET /api/pembayaran/tagihan?platNomor=B 1234 SPCT
    C_Bayar->>S_Bayar: hitungTagihanKeluar("B 1234 SPCT")
    S_Bayar->>R_Tx: findFirstByKendaraan_PlatNomor...("B 1234 SPCT", BELUM_LUNAS)
    R_Tx->>DB: SELECT * FROM transaksi_parkir WHERE plat='B 1234 SPCT' AND status='BELUM_LUNAS' ...
    DB-->>R_Tx: TransaksiParkir (waktuMasuk: 2 jam lalu, idTransaksi: 1001, idSlot: "B1-03")
    R_Tx-->>S_Bayar: Objek TransaksiParkir
    Note over S_Bayar: Hitung durasi (120 menit) & kalkulasi rumus tarif resmi: Rp 5.000 (flat <= 8 jam)
    S_Bayar-->>C_Bayar: HasilTagihanDto (idTransaksi: 1001, totalBiaya: 5000, durasi: 120)
    C_Bayar-->>Pengendara: HTTP 200 OK (Kiosk menampilkan Dynamic QRIS Code Rp 5.000)

    Note over Pengendara,C_Bayar: Bagian 2: Scan QRIS Berhasil & Konfirmasi Pelunasan
    Pengendara->>C_Bayar: POST /api/pembayaran/konfirmasi?idTransaksi=1001&metodePembayaran=QRIS
    C_Bayar->>S_Bayar: prosesPembayaran(1001, QRIS)
    
    Note over S_Bayar,R_Pay: Catat Entitas Pembayaran
    S_Bayar->>R_Pay: save(new Pembayaran(transaksi, 5000, QRIS, LUNAS))
    R_Pay->>DB: INSERT INTO pembayaran (id_transaksi, jumlah_bayar, metode, status) VALUES (1001, 5000, 'QRIS', 'LUNAS')
    
    Note over S_Bayar,R_Tx: Update Tiket Transaksi Parkir
    S_Bayar->>R_Tx: save(transaksi.setStatus(LUNAS), setWaktuKeluar(now))
    R_Tx->>DB: UPDATE transaksi_parkir SET status_pembayaran='LUNAS', waktu_keluar=NOW() WHERE id=1001
    
    Note over S_Bayar,R_Slot: Pembebasan Slot Parkir Basement
    S_Bayar->>R_Slot: findById("B1-03")
    R_Slot->>DB: SELECT * FROM slot_parkir WHERE id_slot='B1-03'
    DB-->>R_Slot: SlotParkir
    S_Bayar->>R_Slot: save(slot.setStatus(KOSONG), setKendaraanAktif(null))
    R_Slot->>DB: UPDATE slot_parkir SET status_slot='KOSONG', kendaraan_aktif_id=NULL WHERE id_slot='B1-03'

    S_Bayar-->>C_Bayar: HasilTagihanDto (status: BERHASIL, bukaPalang: true, pesan: "Lunas")
    C_Bayar-->>Pengendara: HTTP 200 OK (JSON HasilTagihanDto)
    Note over Pengendara: Palang Pintu Keluar Terbuka, Struk Digital Ditampilkan!
```

### 📌 Salin Kode Ini ke Draw.io untuk Alur Ekspor Laporan PDF/Excel & Audit Trail (Mahasiswa 4 Bagian Lanjutan):

```mermaid
sequenceDiagram
    autonumber
    actor Direksi as Web Admin / Manajer (ReportsPage.jsx)
    participant C_Lap as LaporanController
    participant S_Pdf as LaporanPdfService
    participant R_Tx as TransaksiParkirRepository
    participant R_Audit as LogAuditLaporanRepository
    participant DB as MySQL Database (spct_db)

    Note over Direksi,C_Lap: Permintaan Unduh Laporan Finansial Resmi Bulanan
    Direksi->>C_Lap: GET /api/laporan/unduh?format=pdf&dari=2026-10-01&sampai=2026-10-31
    C_Lap->>S_Pdf: buatDokumenPdf("finansial", dari, sampai)
    
    Note over S_Pdf,R_Tx: Agregasi Data Transaksi Finansial
    S_Pdf->>R_Tx: findTransaksiLunasPeriode(dari, sampai)
    R_Tx->>DB: SELECT * FROM transaksi_parkir WHERE status_pembayaran='LUNAS' AND waktu_masuk BETWEEN ...
    DB-->>R_Tx: List Transaksi & Agregasi Total Pendapatan Rp 42.500.000
    R_Tx-->>S_Pdf: List<TransaksiParkir>
    
    Note over S_Pdf: Kompilasi Dokumen PDF (iText / OpenPDF Engine)
    Note over S_Pdf: Menghasilkan binary byte[] PDF ber-watermark resmi RS

    Note over C_Lap,R_Audit: Pencatatan Jejak Audit Trail (Compliance & Keamanan)
    C_Lap->>R_Audit: save(new LogAuditLaporan(adminUser, "UNDUH_PDF_FINANSIAL", IPAddress, timestamp))
    R_Audit->>DB: INSERT INTO log_audit_laporan ...

    C_Lap-->>Direksi: HTTP 200 OK (Content-Type: application/pdf, Content-Disposition: attachment; filename="Laporan_SPCT_202610.pdf")
    Note over Direksi: Berkas PDF otomatis terunduh di browser pengguna
```

---

## 5. Ringkasan Prinsip Arsitektur MVC SPCT

Bila dosen bertanya mengenai filosofi pembagian kode MVC di sistem SPCT, jelaskan prinsip 5 poin ini:

```
[ Antarmuka Frontend / Sensor IoT ]
               │
               ▼  (HTTP Request / REST Endpoint)
   [ Controller: com.spct.controller ]
   Tugas: Menerima HTTP, validasi parameter input, routing response
               │
               ▼  (Method Call)
     [ Service: com.spct.service ]
   Tugas: Jantung logika bisnis, algoritma A*, hitung tarif, transaksi DB
          │                        │
          ▼                        ▼
  [ DTO: com.spct.dto ]   [ Repository: com.spct.repository ]
  Tugas: Bungkus payload  Tugas: Query SQL Spring Data JPA
                                   │
                                   ▼
                          [ Model: com.spct.model ]
                          Tugas: Entitas relasional tabel MySQL
                                   │
                                   ▼
                         [ Database: MySQL spct_db ]
```

1. **Frontend / IoT**: Bertindak sebagai pemicu (*Trigger*). Tidak boleh tahu struktur tabel basis data.
2. **Controller**: Gerbang penjaga pintu masuk HTTP (*Gatekeeper*). Bertugas mengolah request dari URL endpoint dan mengembalikan respon JSON/Berkas.
3. **Service**: Pusat komputasi (*Brain*). Seluruh kalkulasi algoritma (A*, BFS, tarif parkir, reduksi emisi CO2, deteksi penyerobotan) berada di layer ini.
4. **Repository**: Jembatan data (*Data Access*). Berisi interface Spring Data JPA yang mengubah instruksi Java menjadi query SQL native MySQL secara otomatis.
5. **Model & DTO**: Struktur data (*Data Contract*). Model mencerminkan tabel fisik database, sedangkan DTO bertugas sebagai wadah pembungkus data kiriman bolak-balik antara frontend dan backend.
