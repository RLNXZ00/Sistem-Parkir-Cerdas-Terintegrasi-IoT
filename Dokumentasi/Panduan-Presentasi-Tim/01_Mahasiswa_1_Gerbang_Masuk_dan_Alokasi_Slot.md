# 01. Panduan Presentasi Mahasiswa 1: Gerbang Masuk & Alokasi Slot Otomatis

## Profil Pembicara & Ruang Lingkup
- **Nama Peran**: Ingress Gate & Smart Allocation Specialist (sekaligus Moderator/Pembuka Tim)
- **Use Case yang Dijelaskan**:
  1. **PK-UC001: Mendeteksi Plat & Klasifikasi Kendaraan** (ANPR YOLOv11 + OCR)
  2. **PK-UC002: Mencari & Mengalokasikan Slot Parkir Cerdas** (Algoritma Pencarian Graf & Reservasi Slot)
- **Topik GitHub**: Struktur Repositori, Arsitektur Monorepo, Strategi Branching Berjenjang, dan Konvensi Komit.
- **Estimasi Waktu**: 4.5 Menit (termasuk 1.5 menit pembukaan tim).

---

## 1. Pemetaan Narasi Use Case ke Source Code (Coding Implementation)

### A. PK-UC001: Deteksi Plat & Klasifikasi Kendaraan
* **Narasi**: Pengendara tiba di garis henti gerbang masuk, menekan tombol hijau/pilih jenis kendaraan pada kios. Kamera ANPR mengambil gambar, AI mengekstrak plat nomor (`B 1234 SPCT`), dan backend memverifikasi jenis kendaraan (Mobil/Motor).
* **Implementasi Kode**:
  - **View (Kiosk)**: [`frontend-kiosk/src/pages/ScanPage.jsx`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-kiosk/src/pages/ScanPage.jsx#L34-L50)
    Komponen menangkap input simulasi plat nomor dan jenis kendaraan (`MOBIL` atau `MOTOR`), lalu mengirim payload JSON ke endpoint gerbang masuk.
  - **Controller**: [`KioskController.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/KioskController.java#L45-L80)
    Method `prosesMasukKendaraan(@RequestBody PermintaanMasukDto req)` menerima plat nomor dan jenis kendaraan.
  - **Service**: `AnprService.java` / `ParkirService.java`
    Memvalidasi string plat nomor, memastikan tidak ada duplikasi transaksi aktif untuk plat yang sama.

### B. PK-UC002: Mencari & Mengalokasikan Slot Parkir Cerdas
* **Narasi**: Sistem mencari slot kosong terdekat di Basement B1 (dari 16 slot: `B1-01` s.d. `B1-16`). Slot yang dipilih langsung diubah statusnya menjadi `DIPESAN` (*RESERVED*) agar tidak dialokasikan ke pengendara lain, lalu mencatat waktu masuk transaksi.
* **Implementasi Kode**:
  - **Model**: [`SlotParkir.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/model/SlotParkir.java#L25-L50)
    Memiliki atribut `statusSlot` bertipe enum [`StatusSlot.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/model/StatusSlot.java) (`KOSONG`, `DIPESAN`, `TERISI`, `RUSAK`).
  - **Controller / Service**: [`AlokasiSlotService.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/AlokasiSlotService.java)
    Menggunakan query `findFirstByStatusSlotAndJenisKendaraanOrderByIdSlotAsc(StatusSlot.KOSONG, jenis)` untuk memilih slot prioritas terdekat dari pintu masuk basement. Mengubah statusnya menjadi `StatusSlot.DIPESAN`.
  - **Model Transaksi**: [`TransaksiParkir.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/model/TransaksiParkir.java#L40-L75)
    Membuat record baru dengan `waktuMasuk = LocalDateTime.now()` dan status pembayaran `StatusPembayaran.BELUM_LUNAS`.

---

## 2. Bedah Arsitektur MVC (Model - Controller - View)

### 1. Model (Data & Relasi Bisnis)
- Tunjukkan kelas [`Kendaraan.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/model/Kendaraan.java):
  ```java
  @Entity
  @Table(name = "kendaraan")
  public class Kendaraan {
      @Id
      private String nomorPlat; // Primary Key plat nomor unik
      @Enumerated(EnumType.STRING)
      private JenisKendaraan jenisKendaraan; // MOBIL atau MOTOR
  }
  ```
- Jelaskan relasinya dengan [`SlotParkir.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/model/SlotParkir.java) yang memiliki kolom `status_slot` sebagai *state machine* okupansi.

### 2. Controller (REST API Handler)
- Tunjukkan kelas [`KioskController.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/KioskController.java):
  ```java
  @RestController
  @RequestMapping("/api/kiosk")
  public class KioskController {
      @PostMapping("/masuk")
      public ResponseEntity<?> gerbangMasuk(@RequestBody PermintaanMasukDto dto) {
          // 1. Ekstraksi plat & jenis
          // 2. Alokasikan slot terdekat berstatus KOSONG -> DIPESAN
          // 3. Simpan TransaksiParkir
          // 4. Return slotId dan status sukses 200 OK
      }
  }
  ```

### 3. View (Antarmuka Pengguna Kiosk)
- Tunjukkan berkas [`frontend-kiosk/src/pages/ScanPage.jsx`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-kiosk/src/pages/ScanPage.jsx) dan [`AllocatingSlotPage.jsx`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-kiosk/src/pages/AllocatingSlotPage.jsx):
  - Menggunakan React Router untuk mengarahkan pengguna secara otomatis dari pemindaian plat ke animasi pencarian slot, lalu ke halaman navigasi.

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
     `feat(kiosk): integrasikan tombol trigger anpr dan alokasi slot`
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
> *"Bisa kita perhatikan pada layar di sisi kiri Use Case Diagram kami: saat kendaraan memasuki gerbang masuk, Use Case PK-UC001 aktif. Pengendara berinteraksi dengan View kami di `frontend-kiosk/src/pages/ScanPage.jsx`. Ketika tombol konfirmasi ditekan, komponen View mengirimkan payload JSON ke Controller backend `KioskController.java` pada endpoint `POST /api/kiosk/masuk`.
>
> Di sinilah arsitektur MVC bekerja dengan rapi. Controller tidak mengeksekusi logika bisnis secara langsung, melainkan mendelegasikannya ke `AlokasiSlotService.java`. Layanan ini menjalankan PK-UC002: mencari entitas Model `SlotParkir` di Basement Lantai 1 yang statusnya masih `KOSONG`.
>
> Begitu slot ditemukan—misalnya slot B1-03—sistem kami mengunci statusnya menjadi `DIPESAN` atau RESERVED, serta membuat rekaman baru pada entitas Model `TransaksiParkir` dengan stempel waktu masuk. Hal ini mencegah terjadinya *race condition* di mana dua kendaraan mendapatkan alokasi slot yang sama."*

### [Menit 03:30 - 04:30] Git Workflow & Transisi ke Mahasiswa 2
> *"Untuk menjaga kualitas kode, seluruh fitur gerbang masuk ini kami kembangkan pada cabang fitur mandiri dengan konvensi komit standar. Kami juga menerapkan layer branch `front-end-kiosk` dan `back-end` agar pekerjaan antarmuka dan REST API tidak saling menimpa.
>
> Pertanyaan krusial berikutnya: Setelah slot berhasil dialokasikan, bagaimana pengendara mengetahui jalan menuju slot tersebut tanpa karcis kertas, dan bagaimana sensor IoT mendeteksi kehadiran kendaraan secara fisik? Rekan saya, [Nama Mahasiswa 2], akan membedah Use Case PK-UC003 dan PK-UC004. Kepada [Nama Mahasiswa 2], waktu dan tempat saya persilakan."*

---

## 5. Prediksi Pertanyaan Dosen & Kunci Jawaban

### Pertanyaan 1: "Bagaimana jika semua 16 slot parkir di Basement Lantai 1 sudah penuh saat ada mobil masuk?"
**Kunci Jawaban Mahasiswa 1**:
> *"Query pada `AlokasiSlotService.java` mencari slot pertama berstatus `KOSONG`. Jika query mengembalikan nilai kosong (`null`), sistem mendeteksi kondisi parkir penuh (*capacity exhausted*). Controller kami langsung merespons dengan HTTP status 400 Bad Request dan payload pesan `Parkir Penuh`. Pada View Kiosk, antarmuka otomatis dialihkan ke `FailedPage.jsx` dengan notifikasi merah yang menginstruksikan pengendara untuk menunggu atau mencari area lain, dan palang gerbang tetap tertutup rapat."*

### Pertanyaan 2: "Mengapa Anda menggunakan Model terpisah antara `Kendaraan` dan `TransaksiParkir`?"
**Kunci Jawaban Mahasiswa 1**:
> *"Kami menerapkan prinsip normalisasi database Relasional (3NF). Satu kendaraan fisik (`Kendaraan`) dapat melakukan transaksi parkir berkali-kali di waktu yang berbeda (*one-to-many relationship*). Dengan memisahkan entitas, atribut statis kendaraan seperti jenis mobil/motor tidak terduplikasi secara berulang di setiap baris transaksi pada tabel `transaksi_parkir`."*
