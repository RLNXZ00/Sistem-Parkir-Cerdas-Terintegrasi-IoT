# Modul 05: Panduan Presentasi, Skenario Demonstrasi Kiosk, dan Tanya Jawab
**Sistem Parkir Cerdas Terintegrasi IoT (SPCT IoT) — Frontend-Kiosk**

Modul ini disusun khusus sebagai panduan taktis bagi tim pengembang dalam mempresentasikan aplikasi **Frontend-Kiosk** (*Terminal Layar Sentuh Drive-Thru*) di hadapan dosen penguji, pemangku kepentingan (*stakeholders*), maupun manajemen rumah sakit.

---

## 1. Narasi Utama Presentasi Terminal Kiosk

Saat mendemonstrasikan terminal kios, bangun narasi yang menekankan aspek **efisiensi alur fisik kendaraan di gerbang rumah sakit**:

1. **Permasalahan Gerbang Masuk Tradisional**:
   - Pengemudi harus menekan tombol karcis manual, mengambil kertas tiket yang mudah hilang, dan bingung mencari lantai mana yang masih menyediakan slot kosong.
   - Terjadi antrean panjang mobil yang mengular hingga ke jalan protokol rumah sakit dan menghambat laju ambulans gawat darurat.
2. **Solusi Cerdas Terminal Kiosk SPCT IoT**:
   - **Otomasi Penuh**: Kamera ANPR memindai plat nomor dalam hitungan milidetik tanpa pengemudi perlu membuka kaca mobil lebar-lebar.
   - **Pemanduan Spasial Vektor**: Pengemudi langsung disajikan peta rute belok terdekat (algoritma A*) menuju slot spesifik yang telah dipesan khusus untuknya.
   - **Pembayaran Elektronik Terintegrasi**: Di gerbang keluar, sistem secara otomatis membaca antrean kendaraan, memotong saldo e-wallet secara akurat sesuai durasi, dan membuka palang secara instan.

---

## 2. Skenario Demonstrasi Live Kiosk (4 Langkah Walkthrough)

Ikuti urutan langkah demonstrasi berikut untuk menampilkan siklus lengkap alur operasional gerbang di hadapan penguji:

---

### Skenario 1: Siklus Masuk Kendaraan & Pemanduan Rute Cerdas (PK-UC001 & PK-UC002)

1. **Buka Layar Standby Gerbang Masuk Mobil** di `http://localhost:5174/` (atau port Vite kiosk aktif).
2. **Tunjukkan Elemen Antarmuka**:
   - Perlihatkan status indikator hardware: `System Ready` dan `GATE_IN_01_LIVE`.
   - Tunjukkan kotak reticle kamera pemindai dengan sudut biru bercahaya dan garis pemindai laser horizontal.
   - Tunjukkan nomor plat terdeteksi otomatis (contoh: `B 2841 SPCT`).
3. **Picu Kedatangan Mobil**:
   - Klik tombol **"🚗 Simulasikan Mobil Tiba di Gerbang"**.
   - Amati transisi cepat ke layar `AllocatingSlotPage` (animasi radar scanning komputasi rute A*).
   - Layar otomatis berpindah ke `NavigationPage`.
4. **Jelaskan Peta Panduan Navigasi**:
   - Tunjukkan **Stopwatch Waktu Tempuh** yang mulai menghitung detik berjalan sejak mobil melintasi gerbang.
   - Tunjukkan **Garis Polyline Vektor** yang menghubungkan gerbang masuk dengan kotak slot tujuan (contoh: `B1-01`).
   - Tunjukkan kotak slot tujuan yang berkedip cyan terang dengan status `DIPESAN`.
5. **Simulasikan Mobil Tiba di Slot (Sensor Fisik)**:
   - Tekan tombol **"Simulasikan Tembakan Webhook Sensor (TERISI)"**.
   - Tunjukkan bahwa stopwatch seketika berhenti, kotak slot berubah menjadi centang hijau, dan sistem mencatat waktu tempuh aktual kendaraan.

> **Poin Bicara Penguji**: *"Sistem kami tidak sekadar membuka palang gerbang, melainkan mengalokasikan slot spesifik di basement rumah sakit dan memandu pengemudi secara visual sehingga tidak ada lagi kendaraan yang berputar-putar menghasilkan emisi gas buang berlebih."*

---

### Skenario 2: Siklus Keluar & Pembayaran Lunas (PK-UC006 & PK-UC007)

1. **Beralih ke Terminal Keluar**:
   - Klik tombol **"Switch to Exit"** di header kios (rute `/exit`).
2. **Tunjukkan Antrean Kendaraan Aktif**:
   - Perlihatkan kartu identitas mobil yang sedang parkir di basement (diambil otomatis dari endpoint FIFO antrean keluar `/api/gate/antrean-keluar`).
3. **Konfigurasi Panel Pengujian**:
   - Buka panel simulasi di bagian bawah:
     - Set Saldo: `Rp 50.000 (Cukup)`.
     - Set Durasi: `60 Mnt (Tarif Flat Rp 5.000)`.
4. **Picu Transaksi Keluar**:
   - Klik tombol **"💳 Simulasikan Mobil Tiba di Gerbang Keluar"**.
   - Amati transisi instan ke layar [ExitSuccessPage.jsx](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-kiosk/src/pages/ExitSuccessPage.jsx).
   - Tunjukkan teks raksasa hijau `LUNAS - SILAKAN JALAN`, nomor plat pengemudi, nominal biaya yang dipotong (Rp 5.000), serta jam transaksi presisi.
   - Tunjukkan bahwa palang gerbang terbuka dan slot parkir fisik yang ditinggalkan mobil otomatis dibebaskan kembali menjadi `KOSONG` di dasbor web.
   - Tunjukkan timer hitung mundur 10 detik yang mengembalikan kios ke posisi *standby*.

---

### Skenario 3: Pengujian Kasus Khusus Grace Period Bebas Biaya (Rp 0)

1. Pada terminal keluar `/exit`, buka panel simulasi.
2. Pilih durasi **"≤ 10 Mnt (Gratis)"**.
3. Lakukan tap transaksi keluar:
   - Tunjukkan kepada penguji bahwa layar sukses keluar menampilkan keterangan khusus:  
     `Bebas Biaya (Grace Period ≤ 10 Menit)` dengan total tagihan **Rp 0**.
   - Palang barrier tetap terbuka otomatis tanpa memotong saldo pengemudi.

> **Poin Bicara Penguji**: *"Hal ini sesuai dengan kebijakan rumah sakit untuk membebaskan biaya bagi pengantar pasien gawat darurat (drop-off) yang keluar dalam waktu kurang dari 10 menit."*

---

### Skenario 4: Pengujian Kasus Kegagalan Saldo Kurang (HTTP 402)

1. Pada terminal keluar `/exit`, buka panel simulasi.
2. Set durasi parkir `60 Mnt` (Tagihan Rp 5.000) namun pilih opsi saldo **"Rp 0 (Habis)"**.
3. Lakukan transaksi keluar:
   - Amati layar seketika beralih ke [ExitFailedPage.jsx](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-kiosk/src/pages/ExitFailedPage.jsx) berlatar belakang merah kontras tinggi.
   - Tunjukkan judul `PEMBAYARAN GAGAL / SALDO TIDAK CUKUP`.
   - Tunjukkan rincian kekurangan dana dan instruksi bagi pengemudi untuk melakukan pembayaran tunai pada petugas pos keluar atau menekan tombol interkom bantuan. Palang barrier tetap tertutup demi keamanan.

---

## 3. Matriks Antisipasi Pertanyaan Penguji (*Q&A Defense Matrix*)

| No | Potensi Pertanyaan Penguji | Strategi Jawaban Teknis & Berbasis Kode |
| :---: | :--- | :--- |
| **Q1** | *"Bagaimana jika kamera OCR ANPR gagal mengenali plat nomor pengemudi karena plat kotor atau rusak?"* | **Jawaban**: *"Pada [ScanPage.jsx](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-kiosk/src/pages/ScanPage.jsx#L13), sistem menyediakan masukan plat manual darurat. Selain itu, pada sistem produksi fisik, jika confidence score kamera ANPR di bawah 0.7, kios akan otomatis mencetak karcis barcode sementara (fallback) dan membunyikan alarm interkom ke pos petugas."* |
| **Q2** | *"Apa yang terjadi jika pengemudi tersesat atau dengan sengaja memarkir kendaraannya di slot yang salah?"* | **Jawaban**: *"Sensor ultrasonik di slot yang salah tersebut akan mendeteksi kendaraan tanpa alokasi rute yang sah. Status slot tersebut di backend seketika bertransisi menjadi `ANOMALI` (berkedip merah pada dashboard petugas lapangan), menerbitkan tiket insiden di `AnomalyLogsPage`, dan mengarahkan petugas pos basement untuk mendatangi kendaraan tersebut."* |
| **Q3** | *"Mengapa kios terminal ini tidak memiliki basis data SQLite lokal sendiri?"* | **Jawaban**: *"Untuk menjamin integritas data alokasi slot tunggal (*Single Source of Truth*). Jika setiap kios memiliki database lokal, akan timbul risiko race condition di mana dua gerbang masuk mengalokasikan slot yang sama secara bersamaan. Dengan arsitektur terpusat melalui REST API Spring Boot beranotasi `@Transactional`, status slot terisolasi dengan aman secara ACID."* |
| **Q4** | *"Bagaimana sistem membedakan alokasi lantai untuk mobil dan motor?"* | **Jawaban**: *"Melalui komponen [JenisKendaraanToggle.jsx](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-kiosk/src/components/JenisKendaraanToggle.jsx) dan parameter `jenisKendaraan=MOBIL/MOTOR`. Algoritma A* di backend memfilter slot parkir yang memiliki tipe kendaraan yang cocok (zona B1-B3 untuk mobil, zona M1-M2 untuk motor) mulai dari lantai paling bawah sebelum naik ke lantai berikutnya."* |
