# 04. Panduan Presentasi Mahasiswa 4: Gerbang Keluar, Pembayaran Nirkontak & Analitik Eksekutif

## Profil Pembicara & Ruang Lingkup
- **Nama Peran**: Exit Settlement Specialist & Executive Management Analyst
- **Use Case yang Dijelaskan**:
  1. **PK-UC006: Menghitung Durasi & Tarif Gerbang Keluar** (Grace Period Drop-Off & Billing Engine)
  2. **PK-UC007 / PK-UC008: Pembayaran Nirkontak (Cashless) & Pembukaan Palang Otomatis**
  3. **PK-UC010: Analitik Bisnis & Ekspor Laporan Resmi (PDF/Excel)** (Executive Reporting & Audit Log)
- **Topik GitHub**: Kebijakan Perlindungan Branch `main`, Implementasi Merge Non-Fast-Forward (`--no-ff`), dan Analisis Visual GitHub Network Graph.
- **Estimasi Waktu**: 5.5 Menit (termasuk kesimpulan akhir tim).

---

## 1. Pemetaan Narasi Use Case ke Source Code (Coding Implementation)

### A. PK-UC006, PK-UC007, PK-UC008: Alur Lengkap Gerbang Keluar & Pembayaran
* **Narasi**: Pengendara tiba di gerbang keluar. Kamera membaca plat nomor. Sistem mencocokkan transaksi aktif, menghitung durasi total menit. Jika durasi < 10 menit (Drop-Off Grace Period), tagihan Rp 0 (Lunas). Jika > 10 menit, sistem menampilkan nominal tarif dan barcode QRIS dinamis di layar Kiosk. Setelah dibayar, status menjadi `LUNAS`, slot asal dikembalikan menjadi `KOSONG`, dan motor servo palang gerbang keluar terangkat otomatis.
* **Implementasi Kode**:
  - **Controller Gerbang Keluar**: [`KioskController.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/KioskController.java#L85-L135)
    Method `prosesKeluarKendaraan()` menghitung durasi dengan `ChronoUnit.MINUTES.between(waktuMasuk, waktuKeluar)`.
  - **Aturan Grace Period & Tarif**: [`TarifParkirService.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/TarifParkirService.java)
    Jika `durasiMenit <= 10`, tarif = Rp 0 dan status otomatis `LUNAS`. Jika lebih, tarif mobil Rp 4.000 (jam pertama) + Rp 2.000/jam berikutnya (pembulatan ke atas).
  - **Controller Pelunasan & Pembebasan Slot**: [`KioskController.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/KioskController.java#L140-L180)
    Method `prosesPembayaran()` mengubah status `TransaksiParkir` menjadi `LUNAS`, membebaskan status `SlotParkir` menjadi `KOSONG`, dan mengembalikan sinyal trigger `bukaPalang: true`.
  - **View (Kiosk)**: [`frontend-kiosk/src/pages/ExitScanPage.jsx`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-kiosk/src/pages/ExitScanPage.jsx#L45-L110)
    Menampilkan rincian stempel waktu masuk/keluar, total durasi, QRIS dinamis, dan simulator kartu E-Toll.

### B. PK-UC010: Analitik Bisnis & Ekspor Laporan Resmi (PDF/Excel)
* **Narasi**: Manajemen RS / Direksi memantau pendapatan bulanan, tren okupansi, reduksi emisi karbon, dan mengekspor dokumen laporan bersertifikat (PDF bergrafik JFreeChart atau Excel XLSX) dengan pencatatan otomatis ke `log_audit_laporan`.
* **Implementasi Kode**:
  - **Model Audit**: [`LogAuditLaporan.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/model/LogAuditLaporan.java#L20-L45)
    Mencatat siapa yang mengunduh laporan, jenis format (PDF/EXCEL), rentang tanggal, dan stempel waktu ekspor.
  - **Controller Ekspor**: [`LaporanController.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/LaporanController.java#L40-L90)
    Endpoint `GET /api/laporan/ekspor/pdf` dan `GET /api/laporan/ekspor/excel`.
  - **View Analitik**: [`frontend-web/src/pages/DashboardManagementPage.jsx`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/src/pages/DashboardManagementPage.jsx#L160-L225)
    Visualisasi grafik garis Chart.js untuk pendapatan harian dan metrik imbal hasil okupansi (RevPAS).
  - **View Laporan**: [`frontend-web/src/pages/ReportsPage.jsx`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/src/pages/ReportsPage.jsx#L80-L150)
    Formulir pemilihan filter rentang tanggal, ringkasan metrik, dan tombol unduh instan berkas PDF/Excel.

---

## 2. Bedah Arsitektur MVC (Model - Controller - View)

### 1. Model (Entitas Transaksi & Finansial)
- Tunjukkan kelas [`TransaksiParkir.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/model/TransaksiParkir.java):
  ```java
  @Entity
  @Table(name = "transaksi_parkir")
  public class TransaksiParkir {
      @Id
      @GeneratedValue(strategy = GenerationType.IDENTITY)
      private Long idTransaksi;
      private String nomorPlat;
      private LocalDateTime waktuMasuk;
      private LocalDateTime waktuKeluar;
      private Long durasiMenit;
      private Double biayaParkir;
      @Enumerated(EnumType.STRING)
      private StatusPembayaran statusPembayaran; // BELUM_LUNAS, LUNAS, GRACE_PERIOD
      private String metodePembayaran; // QRIS, E_TOLL
  }
  ```

### 2. Controller (Billing & Report Streaming)
- Tunjukkan method ekspor pada [`LaporanController.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/controller/LaporanController.java):
  ```java
  @GetMapping("/ekspor/pdf")
  public ResponseEntity<byte[]> eksporLaporanPdf(
          @RequestParam String tanggalMulai, 
          @RequestParam String tanggalSelesai) {
      byte[] pdfBytes = laporanService.generatePdfReport(tanggalMulai, tanggalSelesai);
      return ResponseEntity.ok()
              .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=laporan-spct.pdf")
              .contentType(MediaType.APPLICATION_PDF)
              .body(pdfBytes);
  }
  ```

### 3. View (Kiosk Settlement & Management Chart)
- Tunjukkan antarmuka [`frontend-kiosk/src/pages/ExitScanPage.jsx`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-kiosk/src/pages/ExitScanPage.jsx) dan grafik di [`frontend-web/src/pages/DashboardManagementPage.jsx`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/src/pages/DashboardManagementPage.jsx).

---

## 3. Porsi Penjelasan GitHub & Version Control

Jelaskan strategi integrasi dan tata kelola Git tingkat lanjut yang diterapkan oleh tim:
1. **Aturan Tegas: Dilarang Keras Push Langsung ke `main` (Branch Protection)**:
   - Branch `main` murni bertindak sebagai cabang rilis yang stabil.
   - Semua pekerjaan anggota tim wajib melalui branch dokumentasi/fitur khusus (seperti `docs/...` atau `feat/...`).
2. **Penggabungan Non-Fast-Forward (`--no-ff`) Merge Commits**:
   - Tim tidak menggunakan *fast-forward merge* biasa agar tidak melenyapkan jejak historis cabang fitur.
   - Dengan flag `--no-ff`, Git secara eksplisit membuat satu commit penggabungan khusus (misalnya `merge: integrasikan ... ke main`).
3. **Bukti Visual pada GitHub Network Graph**:
   - Tunjukkan grafik pohon (*Network Graph*) di GitHub: terlihat percabangan garis yang membelah dari `main`, berisi komit-komit fitur mandiri, lalu melengkung kembali bergabung ke `main`. Bukti nyata bahwa proyek dikerjakan secara kolaboratif multi-developer, bukan proyek *one-man-show*.

---

## 4. Skrip Presentasi (Verbatim Script)

### [Menit 00:00 - 02:00] Transisi & Masuk ke Use Case PK-UC006, 007, 008
> *"Terima kasih rekan saya [Nama Mahasiswa 3]. Sekarang kita tiba di fase pamungkas siklus perparkiran: Gerbang Keluar dan Pelaporan Eksekutif.
>
> Pengendara yang telah selesai melakukan aktivitasnya melajukan kendaraan menuju gerbang keluar. Pada Use Case PK-UC006, kamera ANPR keluar membaca plat nomor dan mengirimkan request ke `KioskController.java`. Backend secara cerdas menghitung selisih waktu masuk dan keluar.
>
> Di sini kami menerapkan aturan bisnis yang sangat manusiawi: **Grace Period Drop-Off 10 Menit**. Jika pengemudi hanya mengantar pasien lalu langsung keluar dalam tempo di bawah 10 menit, sistem menetapkan tagihan Rp 0 dengan status `GRACE_PERIOD / LUNAS`, dan palang gerbang langsung terbuka tanpa meminta uang sepeser pun.
>
> Namun, jika durasi melebihi 10 menit, Use Case PK-UC007 aktif pada layar Kiosk `ExitScanPage.jsx`. Sistem menyajikan barcode QRIS dinamis dan simulator E-Toll. Begitu pengendara memindai dan melunasi tagihan, sistem mengeksekusi dua hal krusial secara atomik: (1) Mengubah status transaksi menjadi `LUNAS`, dan (2) Membebaskan slot parkir yang ditinggalkan di database kembali berstatus `KOSONG` sehingga pengendara baru di gerbang masuk dapat langsung menempatinya. Palang pintu keluar kemudian terangkat otomatis via PK-UC008."*

### [Menit 02:00 - 03:45] Masuk ke PK-UC010 & Analitik Manajemen
> *"Bagi jajaran direksi dan manajemen rumah sakit, data adalah aset yang paling berharga. Melalui Use Case PK-UC010, kami menghadirkan Dashboard Manajemen Eksekutif di `DashboardManagementPage.jsx`.
>
> Menggunakan pustaka visualisasi Chart.js, manajemen dapat memantau grafik akumulasi pendapatan harian, rasio okupansi slot fisik, dan metrik RevPAS (*Revenue per Available Slot*). Ketika masa audit tiba, manajemen cukup menuju halaman `ReportsPage.jsx` untuk mengekspor laporan resmi berformat PDF bertanda tangan digital atau spreadsheet Excel XLSX. Setiap aksi unduhan ini dicatat ke dalam entitas Model `LogAuditLaporan.java` demi memenuhi standar kepatuhan tata kelola teknologi informasi."*

### [Menit 03:45 - 05:00] Penjelasan Git Network Graph & Penutupan Tim
> *"Bapak dan Ibu dosen penguji yang kami hormati, keberhasilan implementasi seluruh Use Case dari hulu ke hilir ini tidak lepas dari disiplin version control yang kami terapkan di GitHub.
>
> *(Arahkan kursor atau proyektor ke tab GitHub Network Graph)*
>
> Bisa kita saksikan bersama pada diagram GitHub Network Graph kami: **kami mematuhi aturan baku industri dengan tidak pernah melakukan push langsung ke branch `main`**. Setiap fitur kami kerjakan pada cabang mandiri, diuji dan ditinjau melalui Pull Request, lalu digabungkan ke `main` murni menggunakan teknik **non-fast-forward merge (`--no-ff`)**. Struktur garis cabang yang memisah dan menyatu kembali pada diagram ini menjadi bukti otentik bahwa sistem ini merupakan hasil sinergi dan rekayasa kolaboratif tim kami berempat.
>
> Demikian presentasi dari Tim Sistem Parkir Cerdas Terintegrasi IoT. Kami membuka sesi tanya jawab dan siap mendemonstrasikan kode program secara langsung. Terima kasih."*

---

## 5. Prediksi Pertanyaan Dosen & Kunci Jawaban

### Pertanyaan 1: "Mengapa Anda mewajibkan penggunaan `--no-ff` saat melakukan merge ke `main` di Git?"
**Kunci Jawaban Mahasiswa 4**:
> *"Dalam git standar, penggabungan branch secara default menggunakan metode fast-forward jika tidak ada komit baru di `main`. Hal itu akan meluruskan riwayat komit seolah-olah semua perubahan dikerjakan langsung di branch `main`. Dengan opsi `--no-ff` (*non-fast-forward*), Git dipaksa untuk menciptakan satu commit merge khusus. Hal ini mempertahankan dokumentasi historis keberadaan cabang fitur tersebut secara permanen, memudahkan tim melakukan audit perubahan, dan membuat lalu lintas branch terlihat jelas pada GitHub Network Graph."*

### Pertanyaan 2: "Bagaimana sistem menjamin keamanan saat ekspor file PDF/Excel jika diakses secara bersamaan oleh banyak user?"
**Kunci Jawaban Mahasiswa 4**:
> *"Pembuatan berkas laporan pada `LaporanService.java` diolah secara murni di dalam memori (*in-memory streaming*) menggunakan byte array buffer tanpa menulis berkas sementara (*temporary file*) ke penyimpanan fisik hard drive server. Pendekatan ini membuat proses pembuatan dokumen bersifat *stateless* dan *thread-safe*, sehingga tidak terjadi konflik tumpang tindih nama berkas antar-permintaan pengguna yang bersamaan."*
