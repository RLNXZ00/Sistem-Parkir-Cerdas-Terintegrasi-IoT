# 02. Panduan Presentasi Mahasiswa 2: Navigasi Kiosk & Telemetri Sensor IoT

## Profil Pembicara & Ruang Lingkup
- **Nama Peran**: Navigation Specialist & Physical IoT Telemetry Engineer
- **Use Case yang Dijelaskan**:
  1. **PK-UC003: Menampilkan Panduan Rute Denah Visual** (Kiosk Interactive Route Guidance)
  2. **PK-UC004: Pemantauan Okupansi Slot Fisik via IoT** (Telemetri Ultrasonik & Kalkulasi Emisi CO₂)
- **Topik GitHub**: Manajemen Branch Frontend, Sinkronisasi Komponen Reusable, dan Pengelolaan Aset SVG/Canvas.
- **Estimasi Waktu**: 4.5 Menit.

---

## 1. Pemetaan Narasi Use Case ke Source Code Nyata Backend & Frontend

### A. PK-UC003: Menampilkan Panduan Rute Denah Visual
* **Narasi**: Begitu slot dialokasikan (misalnya `B1-05`), terminal Kiosk menampilkan denah interaktif Basement B1. Garis hijau beranimasi menunjukkan jalur navigasi dari pintu masuk gerbang menuju slot target, menggantikan karcis kertas 100% (*paperless*).
* **Implementasi Kode**:
  - **View (Kiosk)**: [`frontend-kiosk/src/pages/NavigationPage.jsx`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-kiosk/src/pages/NavigationPage.jsx)
    Komponen membaca parameter query `slot` dari URL, lalu merender denah berbasis grid 16 slot (Baris 1: `B1-01` s.d. `B1-08`, Baris 2: `B1-09` s.d. `B1-16`). Slot target diberikan animasi denyut (*pulse animation*) dan garis rute hijau berbelok digambar secara dinamis via SVG path.
  - **Controller**: [`AlokasiRuteController.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/AlokasiRuteController.java)
    Menyediakan titik-titik koordinat belokan rute berbasis algoritma A* melalui DTO [`TitikRuteDto.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/dto/TitikRuteDto.java).
  - **Countdown Timer**: [`NavigationPage.jsx`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-kiosk/src/pages/NavigationPage.jsx)
    Timer hitung mundur 15 detik untuk mengembalikan layar Kiosk ke halaman awal pemindaian agar siap melayani pengendara berikutnya.

### B. PK-UC004: Pemantauan Okupansi Slot Fisik via IoT & Reduksi Emisi CO₂
* **Narasi**: 16 unit sensor ultrasonik mendeteksi keberadaan kendaraan fisik pada slot. Sinyal dikirim via webhook IoT. Jika mobil terdeteksi, status slot berubah dari `DIPESAN` menjadi `TERISI`. Waktu tiba dicatat untuk menghitung penghematan menit dan reduksi emisi CO₂.
* **Implementasi Kode**:
  - **Model**: [`SensorIoT.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/model/SensorIoT.java) & [`SlotParkir.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/model/SlotParkir.java)
    Setiap sensor `SensorIoT` memiliki `idSensor` (misal: `SNS-B1-01`), status operasional `statusSensor` (`ON`/`OFF`), dan terhubung secara One-to-One dengan `SlotParkir`.
  - **Controller**: [`MonitoringFisikController.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/MonitoringFisikController.java)
    * `GET /api/monitoring/slots` $\rightarrow$ Mengembalikan daftar seluruh 16 slot beserta statusnya (`KOSONG`, `DIPESAN`, `TERISI`, `RUSAK`).
    * `POST /api/monitoring/webhook` $\rightarrow$ Menerima payload telemetri perubahan fisik dari IoT Gateway.
  - **Service**: [`MonitoringFisikService.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/MonitoringFisikService.java)
    Memvalidasi sinyal sensor, memperbarui status slot di database via [`SlotParkirRepository.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/repository/SlotParkirRepository.java), dan memicu broadcast WebSocket ke Web Admin.
  - **Kalkulasi Emisi CO₂**: [`AnalitikLaporanService.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/AnalitikLaporanService.java)
    $$\text{Reduksi CO}_2 (\text{kg}) = (\text{Baseline Waktu} - \text{Waktu Tiba Nyata}) \times \text{Faktor Emisi}$$
    * Baseline pencarian konvensional: 12 menit (720 detik).
    * Emisi mobil rata-rata: 2.3 gram CO₂ / detik.

---

## 2. Bedah Arsitektur MVC (Model - Controller - View)

### 1. Model (Data Telemetri Hardware)
- Tunjukkan kelas [`SensorIoT.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/model/SensorIoT.java):
  ```java
  @Entity
  @Table(name = "sensor_iot")
  public class SensorIoT {
      @Id
      @Column(name = "id_sensor", length = 20)
      private String idSensor; // Misal: SNS-B1-01 s.d. SNS-B1-16

      @Column(name = "status_sensor", nullable = false, length = 3)
      private String statusSensor; // "ON" atau "OFF"

      @OneToOne(fetch = FetchType.EAGER)
      @JoinColumn(name = "id_slot", nullable = false, unique = true)
      private SlotParkir slotDipantau;
  }
  ```

### 2. Controller (Monitoring & Polling Endpoint)
- Tunjukkan method pada [`MonitoringFisikController.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/MonitoringFisikController.java):
  ```java
  @RestController
  @RequestMapping("/api/monitoring")
  @CrossOrigin(origins = "*")
  public class MonitoringFisikController {
      @Autowired
      private SlotParkirRepository slotParkirRepository;

      @GetMapping("/slots")
      public ResponseEntity<?> getAllSlots() {
          // Mengembalikan seluruh slot parkir beserta status ketersediaannya
          // Dipanggil secara polling berkala oleh frontend setiap 1-2 detik
          return ResponseEntity.ok(slotParkirRepository.findAll());
      }
  }
  ```

### 3. View (Visualisasi Denah & Dashboard)
- Tunjukkan antarmuka [`frontend-kiosk/src/pages/NavigationPage.jsx`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-kiosk/src/pages/NavigationPage.jsx):
  - Menggunakan CSS dynamic rendering untuk menyorot koordinat slot yang dialokasikan.
- Tunjukkan keterkaitannya dengan [`frontend-web/src/pages/DashboardPage.jsx`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/src/pages/DashboardPage.jsx):
  - Grid 16 kotak slot yang otomatis berubah warna: Hijau (`KOSONG`), Kuning (`DIPESAN`), Merah (`TERISI`).

---

## 3. Porsi Penjelasan GitHub & Version Control

Jelaskan bagaimana tim mengelola kolaborasi kode antarmuka dan sensor:
1. **Pemisahan Branch Fitur Kiosk (`feat/kiosk-navigation-route`)**:
   - Pengembangan denah visual dikerjakan di cabang terpisah dari branch utama untuk mencegah interferensi dengan modul pembayaran.
2. **Pengelolaan Aset Statis & Konstanta Bersama**:
   - Daftar 16 slot standar disimpan dalam konstanta `DEFAULT_SLOTS` agar sinkron antara Kiosk dan Web Dashboard.
3. **Penyelesaian Konflik CSS/Tailwind**:
   - Menggunakan prefix dan *design tokens* yang konsisten di `index.css` sehingga *styling dark-mode* Kiosk tidak menimpa palet Web Command Center.

---

## 4. Skrip Presentasi (Verbatim Script)

### [Menit 00:00 - 01:30] Transisi & Masuk ke Use Case PK-UC003
> *"Terima kasih rekan saya [Nama Mahasiswa 1]. Melanjutkan alur sistem kita: begitu gerbang masuk terbuka, pengendara tidak dibekali karcis kertas konvensional yang mencemari lingkungan. Di sinilah Use Case PK-UC003 mengambil peran utama.*
>
> *Pada layar Kiosk di depan pengendara, komponen View kami di `frontend-kiosk/src/pages/NavigationPage.jsx` langsung menampilkan denah visual interaktif Basement B1. Jika sistem mengalokasikan slot B1-05, sistem secara matematis menggambar garis rute hijau beranimasi dari titik 'GATE IN' membelok tepat menuju kotak slot B1-05 yang berkedip dengan animasi pulse.*
>
> *Pengendara cukup mengingat atau memotret nomor slot tersebut, dan layar Kiosk akan otomatis melakukan countdown 15 detik sebelum kembali ke mode siaga."*

### [Menit 01:30 - 03:30] Masuk ke PK-UC004 & Telemetri Sensor IoT
> *"Sekarang mari kita tinjau apa yang terjadi di lantai basement melalui Use Case PK-UC004. Pada setiap slot parkir, kami memasang satu unit sensor ultrasonik IoT yang diwakili oleh entitas Model `SensorIoT.java` dan `SlotParkir.java`.
>
> Ketika mobil tiba dan menempati slot fisik, sensor mendeteksi objek stabil. Telemetri dikirimkan ke Controller `MonitoringFisikController.java` pada endpoint `POST /api/monitoring/webhook`. Method di `MonitoringFisikService.java` mengeksekusi pembaruan status: mengubah status slot dari `DIPESAN` menjadi `TERISI` pada tabel `slot_parkir` melalui `SlotParkirRepository.java`.
>
> Hal yang paling membanggakan: sistem kami mencatat stempel waktu kedatangan kendaraan. Melalui `AnalitikLaporanService.java`, sistem membandingkan waktu tiba nyata pengendara dengan baseline waktu pencarian konvensional rumah sakit yaitu 12 menit. Selisih menit yang dihemat dikalikan koefisien emisi 2.3 gram CO2 per detik untuk mobil bensin. Hasilnya adalah metrik riil reduksi karbon (kg) yang langsung tersaji di Dashboard Web!"*

### [Menit 03:30 - 04:30] Git Workflow & Transisi ke Mahasiswa 3
> *"Dalam proses pengembangan di GitHub, modul navigasi visual dan telemetri ini kami kerjakan pada branch `feat/kiosk-navigation` dan layer branch `front-end-kiosk`. Kami menjaga agar setiap fungsi komponen memiliki komentar per baris yang komprehensif, sehingga ketika di-merge ke branch `main`, anggota tim lain dapat memahami struktur kodenya tanpa kendala.
>
> Namun, bagaimana jika di lapangan terjadi insiden tidak terduga? Misalnya pengendara salah parkir di slot orang lain, atau ada sensor fisik yang tiba-tiba offline? Rekan saya, [Nama Mahasiswa 3], akan memaparkan bagaimana Use Case PK-UC005 mendeteksi anomali tersebut dan bagaimana PK-UC009 memfasilitasi petugas pos melalui Command Center. Silakan [Nama Mahasiswa 3]."*

---

## 5. Prediksi Pertanyaan Dosen & Kunci Jawaban

### Pertanyaan 1: "Mengapa menggunakan mekanisme Polling interval (1-2 detik) pada `MonitoringFisikController` daripada murni WebSocket?"
**Kunci Jawaban Mahasiswa 2**:
> *"Kami memilih pendekatan Hybrid Polling efisien pada endpoint `GET /api/monitoring/slots` karena sifat data okupansi basement yang diskrit (perubahan status hanya terjadi saat kendaraan masuk atau keluar). Interval 1.5 detik memberikan latensi respons yang hampir mendekati real-time bagi petugas pos, namun jauh lebih andal terhadap fluktuasi koneksi jaringan lokal basement dibandingkan koneksi persistent WebSocket yang rentan terputus saat terjadi hambatan elektromagnetik di area bawah tanah."*

### Pertanyaan 2: "Dari mana angka baseline 12 menit dan koefisien emisi 2.3 g/detik CO2 didapatkan?"
**Kunci Jawaban Mahasiswa 2**:
> *"Angka baseline 12 menit kami adopsi dari studi empiris durasi rata-rata pencarian tempat parkir di area fasilitas rumah sakit umum bertingkat pada jam sibuk. Sedangkan koefisien 2.3 gram CO₂ per detik merupakan standar emisi rata-rata kendaraan berbahan bakar bensin kategori 1500cc dalam kondisi bergerak lambat (*cruising/idling* di area parkir) sesuai standar pengujian emisi lingkungan yang dikonfigurasi di `AnalitikLaporanService.java`."*
