# 01. Panduan Presentasi Mahasiswa 1: Gerbang Masuk & Alokasi Slot Otomatis

## Profil Pembicara & Ruang Lingkup
- **Nama Peran**: Ingress Gate & Smart Allocation Specialist (sekaligus Moderator/Pembuka Tim)
- **Use Case yang Dijelaskan**:
  1. **PK-UC001: Mendeteksi Plat & Klasifikasi Kendaraan** (ANPR YOLOv11 + OCR)
  2. **PK-UC002: Mencari & Mengalokasikan Slot Parkir Cerdas** (Algoritma Pencarian Graf & Reservasi Slot)
- **Topik GitHub**: Struktur Repositori, Arsitektur Monorepo, Strategi Branching Berjenjang, dan Konvensi Komit.
- **Estimasi Waktu**: 4.5 Menit (termasuk 1.5 menit pembukaan tim).

---

## 1. Pemetaan Narasi Use Case ke Source Code Nyata Backend & Frontend

### A. PK-UC001: Deteksi Plat & Klasifikasi Kendaraan
* **Narasi**: Pengendara tiba di garis henti gerbang masuk, menekan tombol hijau/pilih jenis kendaraan pada kios. Kamera ANPR mengambil gambar, AI mengekstrak plat nomor (`B 1234 SPCT`), dan backend memverifikasi jenis kendaraan (Mobil/Motor).
* **Implementasi Kode**:
  - **View (Kiosk)**: [`frontend-kiosk/src/pages/ScanPage.jsx`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-kiosk/src/pages/ScanPage.jsx)
    Komponen menangkap input simulasi plat nomor dan jenis kendaraan (`MOBIL` atau `MOTOR`), lalu mengirim payload JSON ke endpoint gerbang masuk.
  - **Controller**: [`DeteksiPlatController.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/DeteksiPlatController.java)
    Method `prosesKendaraanMasuk(@RequestBody Map<String, String> body, ...)` pada path `@PostMapping("/masuk")` di rute `@RequestMapping("/api/gate")` menerima nomor plat dan jenis kendaraan.
  - **Service**: [`DeteksiPlatService.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/DeteksiPlatService.java)
    Memvalidasi string plat nomor, menyimpan/meregister identitas kendaraan baru ke entitas [`DataKendaraan.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/model/DataKendaraan.java) via [`DataKendaraanRepository.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/repository/DataKendaraanRepository.java), dan mencatat log pada `LogDeteksiPlat.java`.

### B. PK-UC002: Mencari & Mengalokasikan Slot Parkir Cerdas
* **Narasi**: Sistem mencari slot kosong terdekat di Basement B1 (dari 16 slot: `B1-01` s.d. `B1-16`). Slot yang dipilih langsung diubah statusnya menjadi `DIPESAN` (*RESERVED*) agar tidak dialokasikan ke pengendara lain, lalu mencatat waktu masuk transaksi.
* **Implementasi Kode**:
  - **Model**: [`SlotParkir.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/model/SlotParkir.java)
    Memiliki atribut `statusSlot` bertipe enum [`StatusSlot.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/model/StatusSlot.java) (`KOSONG`, `DIPESAN`, `TERISI`, `RUSAK`).
  - **Controller**: [`AlokasiRuteController.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/AlokasiRuteController.java)
    Method `prosesAlokasiMasuk(@RequestParam String platNomor, @RequestParam JenisKendaraan jenisKendaraan)` pada path `@PostMapping("/proses")` di rute dasar `@RequestMapping("/api/alokasi-rute")`.
  - **Service**: [`AlokasiRuteService.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/AlokasiRuteService.java)
    Mencari slot kosong prioritas terdekat dari pintu masuk basement menggunakan [`SlotParkirRepository.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/repository/SlotParkirRepository.java). Mengubah status slot terpilih menjadi `StatusSlot.DIPESAN`.
  - **Model Transaksi**: [`TransaksiParkir.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/model/TransaksiParkir.java)
    Membuat record baru dengan `waktuMasuk = LocalDateTime.now()` dan status pembayaran `StatusPembayaran.BELUM_LUNAS` via [`TransaksiParkirRepository.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/repository/TransaksiParkirRepository.java).
  - **DTO Respons**: [`HasilDeteksiMasukDto.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/dto/HasilDeteksiMasukDto.java) & [`HasilAlokasiRuteDto.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/dto/HasilAlokasiRuteDto.java)
    Membungkus kode slot alokasi (`idSlot`), data lintasan node koordinat, dan status palang gerbang (`bukaPalang: true`).

---

## 2. Bedah Arsitektur MVC (Model - Controller - View)

### 1. Model (Data & Relasi Bisnis)
- Tunjukkan kelas [`DataKendaraan.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/model/DataKendaraan.java):
  ```java
  @Entity
  @Table(name = "data_kendaraan")
  public class DataKendaraan {
      @Id
      @GeneratedValue(strategy = GenerationType.IDENTITY)
      @Column(name = "id_kendaraan")
      private Long idKendaraan;

      @Column(name = "plat_nomor", nullable = false, unique = true, length = 15)
      private String platNomor;

      @Enumerated(EnumType.STRING)
      @Column(name = "jenis_kendaraan", nullable = false)
      private JenisKendaraan jenisKendaraan; // MOBIL atau MOTOR
  }
  ```
- Jelaskan relasinya dengan [`SlotParkir.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/model/SlotParkir.java) yang memiliki kolom `status_slot` bertipe enum [`StatusSlot.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/model/StatusSlot.java).

### 2. Controller (REST API Handler)
- Tunjukkan kelas [`DeteksiPlatController.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/DeteksiPlatController.java):
  ```java
  @RestController
  @RequestMapping("/api/gate")
  @CrossOrigin(origins = "*")
  public class DeteksiPlatController {
      @Autowired
      private DeteksiPlatService deteksiPlatService;

      @PostMapping("/masuk")
      public ResponseEntity<HasilDeteksiMasukDto> prosesKendaraanMasuk(
              @RequestBody(required = false) Map<String, String> body,
              @RequestParam(required = false) String platNomor,
              @RequestParam(name = "jenisKendaraan", required = false) String jenisKendaraanParam,
              @RequestParam(defaultValue = "1.0") double confidence) {
          // 1. Ekstraksi plat & jenis
          // 2. Alokasikan slot terdekat berstatus KOSONG -> DIPESAN
          // 3. Simpan TransaksiParkir
          // 4. Return DTO HasilDeteksiMasukDto dengan status 200 OK
      }
  }
  ```

### 3. View (Antarmuka Pengguna Kiosk)
- Tunjukkan berkas [`frontend-kiosk/src/pages/ScanPage.jsx`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-kiosk/src/pages/ScanPage.jsx) dan [`AllocatingSlotPage.jsx`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-kiosk/src/pages/AllocatingSlotPage.jsx):
  - Menggunakan React Router untuk mengarahkan pengguna secara otomatis dari pemindaian plat ke animasi pencarian slot, lalu ke halaman navigasi denah.

---

## 3. Porsi Penjelasan GitHub & Version Control

Jelaskan kepada dosen bagaimana tim Anda menyusun fondasi kolaborasi di GitHub:
1. **Arsitektur Repositori Bersama (Monorepo Berstruktur)**:
   - Direktori `backend-spring/` untuk REST API Spring Boot.
   - Direktori `frontend-web/` untuk Command Center Web Admin.
   - Direktori `frontend-kiosk/` untuk Terminal Layar Sentuh Gerbang.
2. **Strategi Layer Branching**:
   - Branch `main`: Branch rilis produksi stabil yang **dilindungi** (*protected*).
   - Branch layer permanen: `back-end`, `front-end`, `front-end-kiosk`.
   - Feature branches: `feat/anpr-entry-gate`, `feat/slot-allocation-engine`.
3. **Commit Message Hygiene**:
   - Menegakkan format *Conventional Commits*:
     `feat(gate): integrasikan endpoint deteksi plat nomor dan alokasi slot`
     `fix(backend): cegah duplikasi reservasi slot bersamaan`

---

## 4. Skrip Presentasi (Verbatim Script)

### [Menit 00:00 - 01:30] Pembukaan & Perkenalan Tim
> *"Selamat pagi/siang Bapak/Ibu dosen penguji dan rekan-rekan sekalian. Kami dari Tim Pengembang Sistem Parkir Cerdas Terintegrasi IoT (SPCT IoT). Sistem yang kami bangun bertujuan menyelesaikan masalah krusial di fasilitas publik seperti rumah sakit: hilangnya waktu mencari parkir yang memicu stres dan peningkatan emisi gas buang karbon CO2.*
>
> *Pada kesempatan kali ini, kami berempat membagi tugas secara profesional untuk membedah: (1) Implementasi fitur sesuai Use Case Diagram, (2) Struktur arsitektur MVC dari database hingga antarmuka, dan (3) Tata kelola Version Control GitHub yang kami terapkan secara ketat.*
>
> *Saya [Nama Mahasiswa 1], akan mengawali presentasi dengan membedah pintu masuk sistem kami: Use Case PK-UC001 untuk Deteksi Plat Nomor via ANPR dan PK-UC002 untuk Algoritma Alokasi Slot Parkir Cerdas."*

### [Menit 01:30 - 03:30] Bedah Kode & Arsitektur MVC
> *"Bisa kita perhatikan pada layar di sisi kiri Use Case Diagram kami: saat kendaraan memasuki gerbang masuk, Use Case PK-UC001 aktif. Pengendara berinteraksi dengan View kami di `frontend-kiosk/src/pages/ScanPage.jsx`. Ketika tombol konfirmasi ditekan, komponen View mengirimkan payload JSON ke Controller backend `DeteksiPlatController.java` pada endpoint `POST /api/gate/masuk`.
>
> Di sinilah arsitektur MVC bekerja dengan rapi. Controller tidak mengeksekusi logika bisnis secara langsung, melainkan mendelegasikannya ke `DeteksiPlatService.java` dan `AlokasiRuteService.java`. Layanan ini menjalankan PK-UC002: mencari entitas Model `SlotParkir` di Basement Lantai 1 yang statusnya masih `KOSONG` melalui `SlotParkirRepository.java`.
>
> Begitu slot ditemukan—misalnya slot B1-03—sistem kami mengunci statusnya menjadi `DIPESAN` atau RESERVED, mendaftarkan identitas kendaraan pada entitas Model `DataKendaraan.java`, serta membuat rekaman baru pada entitas Model `TransaksiParkir` dengan stempel waktu masuk. Hal ini mencegah terjadinya race condition di mana dua kendaraan mendapatkan alokasi slot yang sama."*

### [Menit 03:30 - 04:30] Git Workflow & Transisi ke Mahasiswa 2
> *"Untuk menjaga kualitas kode, seluruh fitur gerbang masuk ini kami kembangkan pada cabang fitur mandiri dengan konvensi komit standar. Kami juga menerapkan layer branch `front-end-kiosk` dan `back-end` agar pekerjaan antarmuka dan REST API tidak saling menimpa.
>
> Pertanyaan krusial berikutnya: Setelah slot berhasil dialokasikan, bagaimana pengendara mengetahui jalan menuju slot tersebut tanpa karcis kertas, dan bagaimana sensor IoT mendeteksi kehadiran kendaraan secara fisik? Rekan saya, [Nama Mahasiswa 2], akan membedah Use Case PK-UC003 dan PK-UC004. Kepada [Nama Mahasiswa 2], waktu dan tempat saya persilakan."*

---

## 5. Prediksi Pertanyaan Dosen & Kunci Jawaban

### Pertanyaan 1: "Bagaimana jika semua 16 slot parkir di Basement Lantai 1 sudah penuh saat ada mobil masuk?"
**Kunci Jawaban Mahasiswa 1**:
> *"Query pada `AlokasiRuteService.java` mencari slot pertama berstatus `KOSONG`. Jika query mengembalikan nilai kosong (`null`), sistem mendeteksi kondisi parkir penuh (*capacity exhausted*). Controller `DeteksiPlatController.java` langsung merespons dengan HTTP status 409 Conflict dan payload DTO berstatus `BASEMENT_PENUH`. Pada View Kiosk, antarmuka otomatis dialihkan ke `FailedPage.jsx` dengan notifikasi merah yang menginstruksikan pengendara untuk menunggu atau mencari area lain, dan palang gerbang tetap tertutup rapat."*

### Pertanyaan 2: "Mengapa Anda menggunakan Model terpisah antara `DataKendaraan` dan `TransaksiParkir`?"
**Kunci Jawaban Mahasiswa 1**:
> *"Kami menerapkan prinsip normalisasi database Relasional (3NF). Satu kendaraan fisik (`DataKendaraan`) dapat melakukan transaksi parkir berkali-kali di waktu yang berbeda (*one-to-many relationship*). Dengan memisahkan entitas, atribut statis kendaraan seperti jenis mobil/motor tidak terduplikasi secara berulang di setiap baris transaksi pada tabel `transaksi_parkir`."*
