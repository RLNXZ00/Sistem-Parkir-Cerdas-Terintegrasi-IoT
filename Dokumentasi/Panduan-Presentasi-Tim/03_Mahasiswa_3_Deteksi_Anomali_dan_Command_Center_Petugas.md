# 03. Panduan Presentasi Mahasiswa 3: Deteksi Anomali & Command Center Lapangan

## Profil Pembicara & Ruang Lingkup
- **Nama Peran**: Field Operations & IoT Anomaly Intelligence Operator
- **Use Case yang Dijelaskan**:
  1. **PK-UC005: Deteksi Anomali & Peringatan Salah Parkir** (Parking Anomaly & Misplacement Alert)
  2. **PK-UC009: Pemantauan Kondisi Real-Time Command Center** (Field Operations Live Surveillance)
- **Topik GitHub**: Kolaborasi Pull Request (PR), Peer Code Review, Issue Tracking, dan Branch Quality Assurance.
- **Estimasi Waktu**: 4.5 Menit.

---

## 1. Pemetaan Narasi Use Case ke Source Code (Coding Implementation)

### A. PK-UC005: Deteksi Anomali & Peringatan Salah Parkir
* **Narasi**: Jika sensor mendeteksi mobil terisi di slot yang bukan alokasinya (misal dialokasikan ke `B1-02` tapi parkir di `B1-07`), atau ada sensor yang offline mendadak, sistem membuat tiket insiden berkategori `CRITICAL`. Notifikasi kartu merah berkedip muncul pada Web Dashboard, dan petugas lapangan melakukan verifikasi serta menutup status insiden menjadi `SELESAI_DIVALIDASI`.
* **Implementasi Kode**:
  - **Model**: [`LogOperasionalIot.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/model/LogOperasionalIot.java#L25-L60)
    Menyimpan atribut kejadian: `jenisKejadian` (`ANOMALI_PARKIR_TIDAK_SESUAI`), `tingkatKeparahan` (`CRITICAL`), `statusResolusi` (`BELUM_DITANGANI` vs `SELESAI_DIVALIDASI`), dan `catatanDetail`.
  - **Controller**: [`MonitoringController.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/MonitoringController.java#L60-L90)
    Endpoint `GET /api/monitoring/log-iot` untuk mengambil daftar log kronologis, dan `PUT /api/monitoring/log-iot/{id}/resolusi` untuk memperbarui status penanganan oleh petugas.
  - **View (Web)**: [`frontend-web/src/pages/AnomalyLogsPage.jsx`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/src/pages/AnomalyLogsPage.jsx#L45-L120)
    Menampilkan tabel data riil dengan lencana warna keparahan (Merah: `CRITICAL`, Oranye: `WARNING`, Biru: `INFO`) serta modal penyelesaian tiket anomali.

### B. PK-UC009: Pemantauan Kondisi Real-Time (Command Center)
* **Narasi**: Petugas lapangan login dengan peran `PETUGAS_LAPANGAN`. Dashboard menampilkan peta denah 16 slot real-time, status strip 16 sensor perangkat keras, serta pemantauan langsung video 4 kamera gerbang masuk/keluar secara simultan (*Gate Live Feed*).
* **Implementasi Kode**:
  - **View Dashboard Taktis**: [`frontend-web/src/pages/DashboardPage.jsx`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/src/pages/DashboardPage.jsx#L80-L160)
    Merender grid 16 slot dengan pewarnaan dinamis, kartu Active Alerts berdenyut merah saat ada insiden, dan strip status sensor aktif.
  - **View Gate Live Monitoring**: [`frontend-web/src/pages/GateLivePage.jsx`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/src/pages/GateLivePage.jsx#L30-L90)
    Grid 4 panel kamera video real-time (Entry Car, Entry Motorcycle, Exit Car, Exit Motorcycle) dengan deteksi kotak pembatas plat nomor (bounding box).

---

## 2. Bedah Arsitektur MVC (Model - Controller - View)

### 1. Model (Entitas Insiden Operasional)
- Tunjukkan kelas [`LogOperasionalIot.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/model/LogOperasionalIot.java):
  ```java
  @Entity
  @Table(name = "log_operasional_iot")
  public class LogOperasionalIot {
      @Id
      @GeneratedValue(strategy = GenerationType.IDENTITY)
      private Long idLog;
      private String jenisKejadian; // ANOMALI_SLOT, SENSOR_OFFLINE
      @Enumerated(EnumType.STRING)
      private TingkatKeparahan tingkatKeparahan; // INFO, WARNING, CRITICAL
      private String statusResolusi; // BELUM_DITANGANI, SELESAI_DIVALIDASI
      private String catatanDetail;
      private LocalDateTime waktuKejadian;
  }
  ```

### 2. Controller (Incident Resolution Endpoint)
- Tunjukkan method update resolusi pada [`MonitoringController.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/MonitoringController.java):
  ```java
  @PutMapping("/log-iot/{id}/resolusi")
  public ResponseEntity<?> updateResolusiAnomali(
          @PathVariable Long id, 
          @RequestBody ResolusiDto dto) {
      logService.selesaikanAnomali(id, dto.getCatatanPetugas());
      return ResponseEntity.ok(Map.of("status", "BERHASIL_DIVALIDASI"));
  }
  ```

### 3. View (Command Center & Log Viewer)
- Tunjukkan antarmuka [`frontend-web/src/pages/AnomalyLogsPage.jsx`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/src/pages/AnomalyLogsPage.jsx) dan [`NotificationPopover.jsx`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/src/components/NotificationPopover.jsx):
  - Popover lonceng notifikasi di TopBar yang secara reaktif menghitung jumlah tiket anomali aktif yang belum terselesaikan.

---

## 3. Porsi Penjelasan GitHub & Version Control

Jelaskan praktik rekayasa perangkat lunak tim dalam menjaga kualitas kode melalui GitHub:
1. **Penerapan Alur Pull Request (PR) & Peer Review**:
   - Tidak ada anggota tim yang boleh langsung menggabungkan kode fitur ke branch utama tanpa persetujuan rekan kerja.
   - Setiap fitur (misalnya `feat/anomaly-detection`) diajukan melalui PR di GitHub, ditinjau minimal oleh 1 reviewer, dan dipastikan lolos kompilasi sebelum di-merge.
2. **Penggunaan GitHub Issues untuk Pelacakan Masalah**:
   - Permasalahan bug seperti ambang batas keparahan anomali didokumentasikan di tab **Issues** GitHub dengan label `bug`, `enhancement`, dan `documentation`.
3. **Penyelarasan State Global Komponen**:
   - Menggunakan React Context `NotificationContext.jsx` yang dipisah secara modular agar tidak memicu konflik merge saat integrasi branch frontend.

---

## 4. Skrip Presentasi (Verbatim Script)

### [Menit 00:00 - 01:30] Transisi & Pengenalan Use Case PK-UC005
> *"Terima kasih rekan saya [Nama Mahasiswa 2]. Dalam skenario dunia nyata, sistem parkir tidak selalu berjalan mulus. Pengendara mungkin salah melihat papan penunjuk arah dan memarkir kendaraannya di slot B1-07 padahal sistem mengalokasikan slot B1-02. Di sinilah Use Case PK-UC005 dan kecerdasan sistem SPCT IoT kami bekerja.*
>
> *Ketika sensor slot B1-07 mendeteksi keberadaan kendaraan tanpa adanya data alokasi aktif, backend kami langsung memicu tiket insiden pada entitas Model `LogOperasionalIot.java`. Insiden ini diberi label `ANOMALI_PARKIR_TIDAK_SESUAI` dengan tingkat keparahan `CRITICAL`.
>
> Di saat yang bersamaan, notifikasi audio buzzer berbunyi di pos jaga dan kartu peringatan pada panel Active Alerts Dashboard berkedip dengan animasi merah menyala (*pulse anomaly*)."*

### [Menit 01:30 - 03:30] Masuk ke PK-UC009 & Penanganan Lapangan
> *"Sekarang mari kita lihat perspektif petugas pos jaga melalui Use Case PK-UC009: Pemantauan Real-Time Command Center. Petugas yang bertugas cukup membuka antarmuka View kami di `frontend-web/src/pages/DashboardPage.jsx` dan `GateLivePage.jsx`.
>
> Melalui halaman Anomaly Logs, petugas melihat rincian slot yang bermasalah. Petugas lapangan dapat memverifikasi visual gerbang melalui 4 kamera stream langsung (Gate Live Feed), atau mendatangi slot fisik di basement untuk mengarahkan pengemudi secara persuasif.
>
> Begitu masalah teratasi, petugas menekan tombol 'Validasi Insiden' pada antarmuka View. Aksi ini memanggil Controller `MonitoringController.java` melalui HTTP PUT `api/monitoring/log-iot/{id}/resolusi`, mengubah status tiket menjadi `SELESAI_DIVALIDASI`. Kartu peringatan merah di dashboard seketika padam, dan status slot kembali tersinkronisasi secara akurat."*

### [Menit 03:30 - 04:30] Git Workflow & Transisi ke Mahasiswa 4
> *"Dari sisi kolaborasi GitHub, fitur deteksi anomali dan modul Command Center ini menjadi contoh penerapan Pull Request (PR) terbaik di tim kami. Ketika branch fitur ini diajukan, rekan saya [Nama Mahasiswa 4] melakukan code review untuk memastikan penanganan exception di Spring Boot tidak menyebabkan server crash saat database log bertambah ribuan baris.
>
> Sekarang, seluruh alur masuk, navigasi, dan pengawasan telah berjalan sempurna. Namun, bagaimana proses kendaraan keluar dari fasilitas? Bagaimana perhitungan tagihan parkir tanpa tiket kertas, sistem pembayaran nirkontak QRIS, dan ekspor laporan eksekutif resmi? Rekan saya, [Nama Mahasiswa 4], akan menutup presentasi tim kami dengan membedah Use Case PK-UC006, PK-UC007, PK-UC008, PK-UC010, serta pengelolaan Git Network Graph kami. Silakan [Nama Mahasiswa 4]."*

---

## 5. Prediksi Pertanyaan Dosen & Kunci Jawaban

### Pertanyaan 1: "Bagaimana cara sistem membedakan antara 'Anomali Salah Parkir' dengan 'Sensor Rusak'?"
**Kunci Jawaban Mahasiswa 3**:
> *"Kami membedakannya melalui logika kondisi pada telemetri sensor. Jika sensor mendeteksi jarak stabil < 50 cm pada slot yang berstatus `KOSONG` (tidak ada transaksi masuk aktif), itu diklasifikasikan sebagai `ANOMALI_SLOT_TIDAK_SESUAI`. Sedangkan jika sensor tidak mengirimkan sinyal detak (*heartbeat*) MQTT lebih dari 15 detik sesuai batas timeout di pengaturan, sistem mengklasifikasikannya sebagai `HARDWARE_SENSOR_OFFLINE`. Keduanya dicatat pada tabel `log_operasional_iot` dengan jenis kejadian yang berbeda."*

### Pertanyaan 2: "Mengapa petugas lapangan tidak diizinkan melihat metrik pendapatan keuangan di dashboard mereka?"
**Kunci Jawaban Mahasiswa 3**:
> *"Kami menerapkan prinsip keamanan Role-Based Access Control (RBAC) dan pemisahan tugas (*separation of duties*). Petugas lapangan hanya membutuhkan metrik taktis operasional (okupansi slot, kamera gerbang, dan log insiden) untuk kelancaran lalu lintas. Metrik finansial seperti pendapatan akumulatif dan tarif rata-rata hanya dapat diakses oleh peran `Manajemen RS` atau `ADMIN` guna menjaga kerahasiaan data keuangan rumah sakit."*
