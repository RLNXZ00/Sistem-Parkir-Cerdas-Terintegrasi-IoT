---
name: Smart Parking & Green Earth System Design System
colors:
  surface: '#0e1418'
  surface-dim: '#0e1418'
  surface-bright: '#343a3e'
  surface-container-lowest: '#090f13'
  surface-container-low: '#161c20'
  surface-container: '#1a2024'
  surface-container-high: '#252b2f'
  surface-container-highest: '#30363a'
  on-surface: '#dee3e8'
  on-surface-variant: '#bcc8d1'
  inverse-surface: '#dee3e8'
  inverse-on-surface: '#2b3135'
  outline: '#87929b'
  outline-variant: '#3d4850'
  surface-tint: '#7ad0ff'
  primary: '#8fd6ff'
  on-primary: '#003549'
  primary-container: '#00bfff'
  on-primary-container: '#004a65'
  inverse-primary: '#00668a'
  secondary: '#7ed99e'
  on-secondary: '#00391d'
  secondary-container: '#00703f'
  on-secondary-container: '#94f0b2'
  tertiary: '#ffc184'
  on-tertiary: '#492900'
  tertiary-container: '#fb9c24'
  on-tertiary-container: '#653a00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c3e8ff'
  primary-fixed-dim: '#7ad0ff'
  on-primary-fixed: '#001e2c'
  on-primary-fixed-variant: '#004c69'
  secondary-fixed: '#9af6b8'
  secondary-fixed-dim: '#7ed99e'
  on-secondary-fixed: '#00210f'
  on-secondary-fixed-variant: '#00522d'
  tertiary-fixed: '#ffdcbd'
  tertiary-fixed-dim: '#ffb86e'
  on-tertiary-fixed: '#2c1600'
  on-tertiary-fixed-variant: '#693c00'
  background: '#0e1418'
  on-background: '#dee3e8'
  surface-variant: '#30363a'
  bg-primary: '#121212'
  bg-surface: '#1E1E1E'
  eco-success: '#2E8B57'
  alert-anomaly: '#FF4500'
  warning-reserved: '#FFD700'
  system-info: '#00BFFF'
  slot-empty: '#333333'
  text-high-contrast: '#FFFFFF'
  text-muted: '#9E9E9E'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-base:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  tech-mono:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  terminal-status:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '800'
    lineHeight: '1.1'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-margin: 24px
  gutter: 16px
  card-padding: 20px
---

# Define the structure and content for DESIGN.md
design_md_content = """# Software Design Specification: Sistem Parkir Cerdas (Green-IoT Integrated)

## Document Metadata
* **Project Name:** Sistem Parkir Cerdas Terintegrasi (SPCT)
* **Version:** 1.0.0-STABLE
* **Status:** Design Phase
* **Authors:**
    * Antonius Rimba Adiprihartanto / 245314036
    * Ignatius Farrel Aditya Pratama / 245314037
    * Yohanes Paskalis Rafllyno / 245314038
    * Bintang Adistya Saputra / 245314039
* **Date:** 6 Mei 2026
* **Department:** Program Studi Informatika, Universitas Sanata Dharma

---

## 1. Introduction
### 1.1 Purpose
Dokumen ini merinci spesifikasi perancangan antarmuka dan arsitektur visual untuk sistem manajemen parkir berbasis IoT dan AI (YOLO). Fokus utama adalah menciptakan pengalaman pengguna yang efisien, transparan, dan mendukung kampanye "Green Building" melalui reduksi emisi gas buang. Juga menjadikan proyek ini sebagai alternatif penggunaan karcis dari sistem parkir konvesional 

### 1.2 Design Principles
* **High Contrast & Readability:** Mengingat penggunaan di area basement yang minim cahaya, kontras teks harus tinggi, namun nyaman di mata.
* **Real-Time Responsiveness:** Latensi data antara sensor fisik dan tampilan UI maksimal 3 detik.
* **Data Density:** Menyajikan metrik operasional dan lingkungan secara padat namun informatif dan tidak membingungkan.

---

## 2. Visual Architecture (Design System)
### 2.1 Color Tokens (Semantic Palette)
* **Primary Background:** `#121212` (Soft Dark)
* **Secondary Background (Card/Panel):** `#1E1E1E` (Slate Gray)
* **Eco-Success Accent:** `#2E8B57` (Nature Green) - Untuk slot tersedia & metrik positif.
* **Alert & Anomaly:** `#FF4500` (Electric Orange/Red) - Untuk salah parkir & error sensor.
* **In-Progress/Reserved:** `#FFD700` (Warning Yellow) - Untuk transisi alokasi.
* **System Info:** `#00BFFF` (Electric Blue) - Untuk status koneksi & teknologi.

### 2.2 Typography
* **UI Sans-Serif:** *Inter* atau *Roboto* (Size 14pt - 18pt untuk keterbacaan antarmuka).
* **Tech Monospace:** *Fira Code* atau *JetBrains Mono* (Khusus untuk teks Plat Nomor & Log Sistem).

---

## 3. Layout Architecture
### 3.1 Global Navigation (Sidebar)
* **Icons:** Dashboard (Home), Gate Monitor (Video), Analytics (Bar Chart), Logs (List), Settings (Gear).
* **State:** Aktif (Highlight Blue), Idle (Gray).

### 3.2 System Control Bar (Header)
* **Left Section:** Breadcrumb (Home / Dashboard).
* **Middle Section:** Real-time Clock (Server Sync).
* **Right Section:** IoT Connectivity Badge (Glowing Green/Red), Admin Profile, Notifications.

---

## 4. Feature/Page Specifications

### 4.0 PG-000: Authentication & Secure Login
* **Goal:** Menjamin keamanan akses sistem dan mengidentifikasi hak akses pengguna (Manajemen vs Petugas).
* **Visual Elements:**
    * **Brand Identity:** Logo "Smart Parking" dengan tagline "Green-IoT Integrated".
    * **Credential Fields:** Input username/email dan password dengan fitur *toggle* "Show/Hide Password".
    * **Role Selector:** Dropdown untuk memilih sesi akses (Manajemen RS / Petugas Lapangan).
    * **Security Features:** Link "Forgot Password" dan proteksi reCAPTCHA/MFA (Opsional).
* **Styling:** Menggunakan gaya *Glassmorphism* dengan latar belakang gambar *blur* dari area parkir rumah sakit untuk kesan premium.

### 4.1 PG-001: Live Monitoring Dashboard (Core Feature)
* **Goal:** Memantau kondisi fisik basement secara seketika dan menampilkan metrik manajerial.
* **Visualisasi Peta Parkir & Anomali Real-Time:**
    * **Interactive Floor Plan:** Denah basement yang terbagi per zona (Mobil/Motor) menampilkan grid slot parkir.
    * **Semantic Color-Coded Slots:** * Abu-abu/Garis Putus: Kosong (*Empty*).
        * Kuning: Dipesan (*Reserved* - sedang menuju slot).
        * Hijau: Terisi sah (*Occupied*).
        * Merah Berkedip (*Pulsing*): Anomali / Salah Parkir (Alarm fisik).
    * **Quick Action Tooltip:** Saat slot merah (anomali) diklik, muncul informasi pop-up yang berisi daftar plat nomor rekomendasi dari sistem dan tombol "Acknowledge / Tangani".
* **Metrik Operasional & Lingkungan (Finansial & Eco-Metric):**
    * **Revenue Tracker (Role-Restricted):** Grafik garis (*line chart*) yang menampilkan estimasi pendapatan kotor hari ini (hanya muncul untuk role Manajemen).
    * **CO2 Savings Tracker:** Grafik donat (*circular progress*) yang menunjukkan total emisi gas buang yang berhasil dicegah berkat sistem navigasi otomatis.
    * **Live Occupancy Counter:** Ringkasan sisa kapasitas (Contoh: "Zona Mobil: 15/50 Tersedia", dan "Zona Motor: 12/20 Tersedia").

### 4.2 PG-002: Gate OCR Feed (Live Monitor)
* **Goal:** Berfungsi sebagai "Pusat Kendali Visual" daam menampilkan/memantau aktifitas kendaraan mobil/motor yang sedang berada di gerbang masuk maupun gerbang keluar secara real time.
* **Monitoring Gerbang & Transaksi YOLO:**
    * **Dual Camera Preview:** Dua jendela *stream* kecil menampilkan tangkapan kamera dari Gerbang Masuk dan Keluar.
    * **Camera Preview Divide:** Setiap jendela utama dibagi menjadi dua sub-panel:
        * **Lane A View:** Fokus pada deteksi jalur Mobil (Gerbang Besar).
        * **Lane B View:** Fokus pada deteksi jalur Motor (Gerbang Kecil).
    * **OCR & Payment Overlay:** Teks real-time yang muncul saat YOLO membaca plat, disandingkan dengan status Payment Gateway (contoh: "AB 1234 CD - E-Toll LUNAS").
    * **Activity Stream:** Daftar berjalan (*scrolling list*) berisi 5 kendaraan terakhir yang masuk/keluar beserta *timestamp*-nya.

### 4.3 PG-003: Anomaly Logs (Operational Control)
* **Goal:** Mengelola dan merespons anomali parkir yang terdeteksi oleh sensor IoT.
* **Manajemen Anomali:**
    * **Live Alert List:** Daftar kronologis anomali yang mencakup ID Slot, waktu deteksi, dan tipe anomali (Salah Parkir / Obstruksi Sensor).
    * **Anomaly Classification:** * *Salah Parkir:* Deteksi kendaraan di slot yang berstatus 'Kosong' di database.
        * *Obstruksi Sensor:* Sinyal terisi yang dipicu oleh benda non-kendaraan (troli, barang, dll).
    * **Action Center:** Tombol interaksi untuk petugas seperti "Acknowledge" (untuk menangani pelanggaran) atau "Dismiss/False Positive" (untuk membersihkan status slot dari gangguan benda).

### 4.4 PG-004: Operational Reports (Admin Panel)
* **Goal:** Menampilkan data historis, halaman ini harus menampilkan Laporan Finansial, Laporan Okupansi & Operasional, dan Laporan Lingkungan (Eco-Metric).
* **Manajemen Laporan & Data:**
    * **Report Generator Form:** Antarmuka dengan pemilih tanggal (*date picker*) dan *dropdown* jenis laporan (Finansial/Operasional/Lingkungan) dengan tombol "Generate" yang menonjol.
    * **System Health/Log Anomali:** Tabel ringkasan kerusakan sensor (*timeout*) atau log riwayat pelanggaran untuk keperluan audit operasional.

### 4.5 PG-005: Visitor Terminal Display (Entry Gate)
* **Goal:** Memberikan instruksi visual langsung kepada pengendara saat memasuki area parkir (Mencakup PK-UC001, PK-UC002, dan PK-UC003).
* **Visual Elements:**
    * **Status Header:** Pesan besar seperti "Mendapatkan Slot..." atau "Silakan Masuk".
    * **Slot ID Card:** Kotak besar berwarna Hijau Neon yang menampilkan nomor slot (Contoh: "SLOT: B1-15").
    * **Dynamic Navigation Map:** Visualisasi denah basement minimalis (layaknya GMaps) yang menyoroti rute dari gerbang menuju slot yang dialokasikan.
    * **Plate Confirmation:** Menampilkan plat nomor yang terdeteksi untuk memastikan data benar.

---

## 5. User Workflows (Alur Interaksi Utama)
Bagian ini mendeskripsikan bagaimana pengguna berinteraksi dengan antarmuka dalam skenario operasional tertentu, memastikan konsistensi dengan logika *Sequence Diagram*.

### 5.0 Skenario: Autentikasi & Inisiasi Sesi (Ref: PG-000)
1. **Entry:** Pengguna mengakses URL sistem dan disambut oleh halaman Login.
2. **Input:** Pengguna memasukkan kredensial dan memilih Role (misal: Manajemen RS).
3. **Validation:** Controller melakukan pengecekan ke tabel `Data_Admin`/`Petugas`.
4. **Transition:** 
    * Jika sukses: Sistem menyimpan token sesi dan mengalihkan (*redirect*) pengguna ke Dashboard yang sesuai dengan Role-nya.
    * Jika gagal: Layar bergetar (*shake animation*) dan muncul pesan error merah: "Kredensial Tidak Valid".

### 5.1 Skenario A: Penanganan Anomali (Salah Parkir)

1. **State Awal (Monitoring):** Dashboard menampilkan peta parkir dengan status slot normal (Abu-abu: Kosong, Hijau: Terisi Sah).
2. **Trigger (Sensor IoT):** Sensor mendeteksi kendaraan di slot yang secara logika sistem berstatus 'Kosong'.
3. **Transisi (Alert State):** Slot spesifik di peta (Contoh: B1-11) berubah menjadi Merah Terang dan berkedip (*pulsing*). Notifikasi audio (*buzzer*) aktif pada *browser* petugas.
4. **Interaksi Petugas:** Petugas mengklik slot merah tersebut untuk membuka *Floating Tooltip* berisi informasi detail anomali.
5. **State Akhir (Resolved):** Petugas menekan tombol "Tangani". Warna slot berubah menjadi Kuning (Dalam Penanganan), menandakan petugas lapangan sedang menuju lokasi.

### 5.2 Skenario B: Validasi Pembayaran di Gerbang Keluar

1. **State Awal (Idle):** Panel 'Gate OCR Feed' menampilkan arus lalu lintas gerbang yang kosong.
2. **Trigger (Hardware):** Kendaraan berhenti di garis gerbang keluar, memicu kamera menangkap gambar plat.
3. **Transisi (Processing):** Muncul *overlay* teks plat nomor hasil YOLO (Contoh: "AB 1234 CD") dengan animasi *loading* kecil di sampingnya saat sistem menghubungi *Payment Gateway*.
4. **State Akhir (Success):** Indikator berubah menjadi Hijau dengan label "E-Toll LUNAS". Palang pintu terbuka otomatis, dan data transaksi tersebut langsung berpindah dari panel *live* ke tabel 'Activity Stream' di bagian bawah.

### 5.3 Alur Navigasi Pengendara di Terminal Masuk (Ref: PG-005)
1. **Idle State:** Monitor menampilkan pesan "Silakan Tekan Tombol atau Maju".
2. **Processing:** Pengendara memicu sensor, sistem menampilkan animasi *loading* (YOLO sedang bekerja).
3. **Allocation:** Setelah PK-UC002 selesai, layar berkedip hijau dan menampilkan Nomor Slot dengan font besar.
4. **Navigation Mode:** Layar otomatis beralih menampilkan denah rute (layaknya navigasi GPS) selama 5-10 detik untuk memberi arahan kepada pengendara sebelum palang pintu terbuka sepenuhnya.

---

## 6. Data & Integration Mapping
| UI Component | Controller Source | Entity (Model) Source |
| :--- | :--- | :--- |
| Map Grid Status | MonitoringFisikController | `Slot_Parkir` (status_slot) |
| OCR Plate Display | DeteksiPlatController | `Data_Kendaraan` (plat_nomor) |
| CO2 Saving Counter | AnalitikLaporanController | `Log_Operasional_IoT` (durasi_pencarian) |
| Financial Preview | TransaksiPembayaranController | `Transaksi_Parkir` (total_biaya) |

---

## 7. Implementation Constraints
* **Security:** Password admin harus terenkripsi. Session timeout diatur dalam 30 menit.
* **Reliability:** Jika koneksi IoT terputus, UI wajib menampilkan banner peringatan "Mode Offline Aktif".
"""

---
