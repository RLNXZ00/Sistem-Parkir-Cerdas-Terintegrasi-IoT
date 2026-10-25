# Modul 05: Panduan Presentasi, Skenario Demonstrasi Live, dan Tanya Jawab
**Sistem Parkir Cerdas Terintegrasi IoT (SPCT IoT) — Frontend-Web**

Modul ini disusun khusus sebagai panduan taktis bagi tim pengembang dalam mempresentasikan aplikasi **Frontend-Web** di hadapan dosen penguji, pemangku kepentingan (*stakeholders*), maupun manajemen rumah sakit.

---

## 1. Narasi Utama Presentasi (*Presentation Narrative Arc*)

Saat memulai presentasi, bangun narasi yang menghubungkan permasalahan nyata rumah sakit dengan solusi teknologi SPCT IoT:

1. **Latar Belakang Masalah (The Pain Points)**:
   - Basement rumah sakit sering mengalami kemacetan akibat pengemudi berputar-putar mencari slot parkir kosong.
   - Gas buang karbon monoksida (CO2) terakumulasi di basement tertutup dan berisiko naik ke ruang rawat inap atau instalasi gawat darurat (IGD).
   - Petugas parkir kesulitan memvalidasi anomali lapangan (seperti mobil parkir di area motor atau kendaraan memblokir jalur evakuasi).
   - Pengelolaan pendapatan parkir masih rawan kebocoran atau kehilangan bukti audit.
2. **Solusi Terpadu SPCT IoT (The Value Proposition)**:
   - **Pemanduan Cerdas**: Rute terdekat dialokasikan secara instan via algoritma A* saat mobil masuk gerbang.
   - **Ramah Lingkungan (*Eco-Hospital*)**: Menghemat rata-rata 3-5 menit per pencarian slot, mereduksi puluhan kilogram emisi gas buang per hari.
   - **Pemisahan Peran Tegas (RBAC)**: Antarmuka yang disesuaikan secara khusus untuk *Petugas Lapangan* (fokus kendali fisik) dan *Manajemen RS* (fokus analitik & audit).
   - **Kepatuhan Audit Sah (PK-UC010)**: Dokumen laporan resmi berformat PDF dan Excel diterbitkan otomatis lengkap dengan kop surat dan kolom pengesahan NIP.

---

## 2. Skenario Demonstrasi Live (4 Langkah Walkthrough)

Ikuti urutan langkah demonstrasi berikut untuk menampilkan kemampuan sistem secara terstruktur dan meyakinkan:

---

### Skenario 1: Otentikasi & Pemisahan Menu Antarmuka (RBAC)

1. **Langkah 1**: Buka halaman login di `http://localhost:5173/`.
2. **Langkah 2**: Masuk dengan akun **Petugas Lapangan** (NIP / Username petugas).
   - Tunjukkan kepada penguji bahwa menu di [Sidebar.jsx](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/src/components/Sidebar.jsx) **hanya berisi 3 menu operasional**:
     - `Live Dashboard` (Denah fisik)
     - `Gate OCR Feed` (Palang gerbang)
     - `Anomaly Logs` (Insiden sensor)
3. **Langkah 3**: Beralih (Logout) lalu masuk dengan akun **Manajemen RS / Admin**.
   - Tunjukkan bahwa menu sidebar secara otomatis berganti menjadi **hanya 2 menu eksekutif**:
     - `Live Dashboard` (Analitik & KPI)
     - `Reports` (Pusat laporan sah)

> **Poin Bicara Penguji**: *"Sistem kami menerapkan prinsip least-privilege pada antarmuka pengguna agar personil operasional tidak terdistraksi dokumen manajerial, dan pihak direksi langsung disajikan metrik kinerja strategis."*

---

### Skenario 2: Pemantauan Denah Spasial Multi-Lantai & Multi-Jenis

1. **Buka Menu Live Dashboard Petugas** (`/dashboard`).
2. **Tunjukkan Fitur Denah Multi-Lantai**:
   - Klik tab **Mobil** ➔ Pilih Lantai 1, Lantai 2, atau Lantai 3.
   - Klik tab **Motor** ➔ Tunjukkan pemisahan kapasitas motor di Lantai 1 dan 2.
   - Tunjukkan bahwa sistem mengingat lantai terakhir yang dibuka di masing-masing jenis kendaraan tanpa saling menimpa (*session memory*).
3. **Jelaskan 4 Status Visual Slot**:
   - `KOSONG` (Garis abu-abu putus-putus)
   - `TERISI` (Kotak hijau transparan)
   - `DIPESAN` (Kotak kuning amber - kendaraan sedang dalam perjalanan menuju slot)
   - `ANOMALI` (Kotak merah berkedip *pulse-anomaly*)

---

### Skenario 3: Penanganan Insiden Anomali Lapangan (PK-UC004 & PK-UC005)

1. **Tunjukkan Munculnya Peringatan**:
   - Pada denah dashboard, perlihatkan slot yang berkedip merah (misal: `B1-04`).
   - Tunjukkan badge angka oranye pada ikon lonceng di [TopBar.jsx](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/src/components/TopBar.jsx) yang menyala.
2. **Eksekusi Penanganan**:
   - Klik langsung kotak slot merah tersebut di denah, atau buka menu `Anomaly Logs` (`/anomaly-logs`).
   - Klik tombol **"Tindak Lanjut / Resolusi"**.
   - Pada modal formulir:
     - Pilih **Jenis Anomali**: `Salah Parkir` / `Benda Asing` / `Keberadaan Manusia`.
     - Masukkan **Catatan Petugas**: *"Kendaraan telah diarahkan petugas ke slot semestinya."*
     - Klik **Simpan & Selesaikan**.
3. **Tunjukkan Hasil Akhir**:
   - Status log berubah seketika menjadi `SELESAI`.
   - Kotak slot pada denah berhenti berkedip dan kembali normal.
   - Badge lonceng di TopBar berkurang secara otomatis.

> **Poin Bicara Penguji**: *"Seluruh tindakan petugas lapangan tercatat secara akuntabel di basis data, menghubungkan ID personel, kronologi insiden, dan klasifikasi anomali untuk keperluan evaluasi keselamatan fasilitas."*

---

### Skenario 4: Evaluasi Eksekutif & Penerbitan Dokumen Sah (PK-UC010)

1. **Buka Menu Live Dashboard Manajemen** (`/dashboard-management`).
   - Jelaskan 4 Kartu KPI Utama:
     - **Total Pendapatan**: Akumulasi tarif riil dari transaksi lunas.
     - **Reduksi Emisi CO2**: Estimasi emisi gas buang yang berhasil dihemat (dalam kilogram) berkat panduan rute cepat.
     - **Okupansi Basement**: Persentase slot terpakai terhadap total kapasitas.
     - **Network Ping**: Pengukuran kecepatan koneksi hardware ke server (contoh: 38 ms - status *Excellent*).
   - Tunjukkan diagram batang distribusi jam transaksi sibuk berbasis `Chart.js`.
2. **Buka Menu Reports** (`/reports`).
   - Pilih Jenis Laporan: `Komprehensif` (Master Laporan 3-in-1: Finansial, Operasional, Lingkungan).
   - Tentukan rentang tanggal evaluasi.
   - Klik tombol **"Ekspor Excel (.xlsx)"**: Buka berkas unduhan dan perlihatkan tab sheet terpisah, formula akumulasi total pendapatan, baris zebra striping, dan kolom tanda tangan pengesahan.
   - Klik tombol **"Ekspor PDF (.pdf)"**: Buka berkas PDF resmi berukuran A4 Landscape, tunjukkan kop surat resmi rumah sakit, metadata audit, diagram grafik JFreeChart, dan lembar legalitas tanda tangan NIP pejabat RS.

---

## 3. Matriks Antisipasi Pertanyaan Penguji (*Q&A Defense Matrix*)

Berikut adalah kompilasi pertanyaan yang sering diajukan dosen penguji beserta panduan jawaban berbasis kode:

| No | Potensi Pertanyaan Penguji | Strategi Jawaban Teknis & Berbasis Kode |
| :---: | :--- | :--- |
| **Q1** | *"Mengapa sistem menggunakan teknik polling interval 1.5–2 detik alih-alih WebSocket murni di seluruh halaman?"* | **Jawaban**: *"Aplikasi kami sebenarnya mendukung WebSocket STOMP (`/ws-spct`), namun untuk halaman dashboard operasional web, polling HTTP REST stateless dengan interval 1.5 detik memberikan keandalan transmisi yang lebih stabil di jaringan rumah sakit yang terproteksi firewall ketat, mencegah terputusnya socket akibat timeout proxy, serta menghemat alokasi memori server."* |
| **Q2** | *"Bagaimana jika server backend tiba-tiba mati atau jaringan lokal terputus saat aplikasi web sedang berjalan?"* | **Jawaban**: *"Pada [DashboardPage.jsx](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/src/pages/DashboardPage.jsx#L64-L68), seluruh pemanggilan data dibungkus dalam blok `try-catch` dengan penanganan silent failure. Layar tidak akan mengalami crash (*white screen*). Metrik ping akan otomatis menunjukkan nilai 999ms (offline), dan aplikasi akan otomatis pulih (*auto-reconnect*) begitu server backend menyala kembali tanpa perlu me-reload peramban."* |
| **Q3** | *"Bagaimana sistem menjamin bahwa dokumen PDF dan Excel yang diunduh manajemen tidak dapat dipalsukan atau dimanipulasi petugas?"* | **Jawaban**: *"Dokumen laporan diterbitkan langsung secara server-side oleh backend Java (Apache POI dan iText) menggunakan status Read-Only dari basis data PostgreSQL. Setiap penekanan tombol ekspor di frontend otomatis memicu pencatatan audit trail ke tabel `log_audit_laporan` yang merekam username pengunduh, IP address, waktu cetak, dan parameter filter."* |
| **Q4** | *"Bagaimana Anda menangani perbedaan tema (Dark/Light) agar tidak terjadi kedipan visual saat aplikasi pertama kali dimuat?"* | **Jawaban**: *"Kami menerapkan inisialisasi tema pra-rendering pada [main.jsx](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/src/main.jsx#L7-L12). Sebelum fungsi `createRoot().render()` dieksekusi, nilai tema dari `localStorage` langsung dievaluasi dan diinjeksikan sebagai kelas CSS pada elemen akar `<html>` sehingga bebas dari fenomena FOUC (*Flash of Unstyled Content*)."* |
| **Q5** | *"Apakah fitur dwibahasa (ID/EN) memerlukan panggilan API ke server?"* | **Jawaban**: *"Tidak. Konteks bahasa dikelola secara *client-side* melalui [LanguageContext.jsx](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/src/context/LanguageContext.jsx) yang memetakan kamus terpusat di [translations.js](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/src/i18n/translations.js). Perpindahan bahasa berlangsung instan (< 1 milidetik) tanpa latensi jaringan."* |
