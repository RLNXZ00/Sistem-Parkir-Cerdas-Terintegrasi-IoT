# Modul 03: Bedah Halaman, Logika Bisnis, dan State Management
**Sistem Parkir Cerdas Terintegrasi IoT (SPCT IoT) — Frontend-Web**

Modul ini membedah secara mendalam seluruh 10 halaman aplikasi web, logika interaksi pengguna, arsitektur manajemen state lokal (*hooks* `useState`, `useEffect`, `useCallback`, `useRef`), serta keterkaitannya dengan kasus penggunaan (*Use Cases*) sistem.

---

## 1. Halaman Operasional Petugas: [DashboardPage.jsx](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/src/pages/DashboardPage.jsx)

Halaman ini merupakan instrumen utama petugas lapangan untuk memantau status fisik 96 slot parkir di seluruh basement rumah sakit secara real-time.

```
┌────────────────────────────────────────────────────────────────────────┐
│ TOP STATS: Total Slot • Slot Terisi • Slot Kosong • Anomali Aktif      │
├────────────────────────────────────────────────────────────────────────┤
│ TAB JENIS KENDARAAN: [ Mobil (L1-3) ]   [ Motor (L1-2) ]               │
│ TAB LANTAI:          [ Lantai 1 ]       [ Lantai 2 ]   [ Lantai 3 ]    │
├────────────────────────────────────────────────────────────────────────┤
│ GRID DENAH SPASIAL SLOT PARKIR (Auto-Refresh 1.5s):                    │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌───────────────────────────────────┐ │
│ │ B1-01  │ │ B1-02  │ │ B1-03  │ │ B1-04 (ANOMALI - PULSE RED)       │ │
│ │ TERISI │ │ KOSONG │ │ DIPESAN│ │ [Klik -> Buka Modal Resolusi]     │ │
│ └────────┘ └────────┘ └────────┘ └───────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

### Logika Bisnis & Fitur Unggulan:
1. **Memori Spasial per Jenis Kendaraan**:
   - Status tab jenis kendaraan dan lantai aktif disimpan ke `sessionStorage` (`spct_peta_slot`).
   - Sistem mengingat lantai terakhir yang dibuka secara terpisah untuk mobil dan motor (misal: saat memilih tab Mobil di Lantai 3, lalu beralih ke Motor di Lantai 1, saat kembali ke Mobil tetap berada di Lantai 3).
2. **Polling Data Cepat (Interval 1.5 Detik)**:
   - Mengambil serentak data slot (`/api/monitoring/slots`), kamera (`/api/hardware/kamera`), sensor (`/api/hardware/sensor`), dan log anomali (`/api/monitoring/log-iot`) menggunakan `Promise.all` dengan header `{ cache: 'no-store' }`.
3. **Pewarnaan Semantik 4 Status Slot**:
   - `KOSONG`: Garis batas abu-abu putus-putus (`border-dashed`).
   - `TERISI`: Latar hijau emerald transparan dengan teks hijau (`bg-eco-success/20`).
   - `DIPESAN`: Latar kuning amber (`bg-warning-reserved/20`) saat kendaraan dialokasikan rute oleh algoritma A*.
   - `ANOMALI`: Border merah berkedip (`pulse-anomaly`) yang terjadi apabila sensor terdeteksi `OFF` atau terdapat insiden aktif berstatus `CRITICAL`.
4. **Modal Resolusi Cepat Langsung di Denah**:
   - Petugas dapat langsung mengklik kotak slot yang berkedip merah untuk membuka dialog penanganan anomali tanpa harus berpindah ke menu log.

---

## 2. Halaman Eksekutif: [DashboardManagementPage.jsx](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/src/pages/DashboardManagementPage.jsx)

Halaman khusus bagi Direksi dan Manajer Operasional RS untuk meninjau efisiensi fasilitas, pendapatan, dan kepatuhan lingkungan.

```
┌────────────────────────────────────────────────────────────────────────┐
│ EXECUTIVE KPI CARDS:                                                   │
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌───────────┐ │
│ │ Total Revenue  │ │ Total Vehicles │ │ CO2 Reduction  │ │ Occupancy │ │
│ │ Rp 4.250.000   │ │ 342 Unit       │ │ 48.60 kg CO2   │ │ 72%       │ │
│ └────────────────┘ └────────────────┘ └────────────────┘ └───────────┘ │
├────────────────────────────────────────────────────────────────────────┤
│ ANALYTICS CHART (Chart.js): Distribusi Pendapatan / Jam Sibuk          │
├────────────────────────────────────────────────────────────────────────┤
│ HARDWARE LATENCY PING: Real-Time Ping Meter (38ms - Excellent)         │
├────────────────────────────────────────────────────────────────────────┤
│ DUA MODAL KHUSUS:                                                      │
│ 1. [Buka Tabel 10 Anomali Terbaru]   2. [Buka Peta Node Spasial Lantai 1]│
└────────────────────────────────────────────────────────────────────────┘
```

### Fitur Kunci:
1. **Pengukuran Latensi Jaringan Nyata (*Real Network Ping*)**:
   - Menggunakan API peramban `performance.now()` saat memanggil endpoint analitik untuk mengukur kecepatan komunikasi bolak-balik (*round-trip latency*) ke backend secara riil.
2. **Visualisasi Grafik Tren Dinamis**:
   - Memanfaatkan pustaka `Chart.js` untuk merender histogram interaktif yang mengelompokkan frekuensi kendaraan masuk dan pendapatan per jam transaksi.
3. **Modal Spasial Node Map**:
   - Menampilkan denah 16 titik sensor ultrasonik Lantai 1 dengan pemetaan warna status node hijau/merah interaktif.

---

## 3. Monitor Palang Gerbang: [GateLivePage.jsx](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/src/pages/GateLivePage.jsx)

Halaman untuk memantau operasi fisik di titik masuk (*Gate In*) dan titik keluar (*Gate Out*):

- **Simulasi Kamera ANPR**: Menampilkan visualisasi feed CCTV gerbang dengan overlay deteksi kotak pembatas plat nomor (*bounding box*).
- **Animasi Palang Gerbang (*Barrier Gate Animation*)**: Status palang terbuka/tertutup divisualisasikan dengan rotasi grafik batang palang bersudut 90 derajat disertai lampu indikator merah/hijau.
- **Formulir Pengujian OCR Interaktif**:
  - Petugas dapat mengetikkan plat nomor dan jenis kendaraan untuk menguji respon endpoint backend `/api/deteksi/masuk` dan `/api/deteksi/keluar`.
  - Menampilkan hasil respon JSON secara instan termasuk kalkulasi tarif dan alokasi slot rute terdekat.

---

## 4. Pusat Audit Insiden: [AnomalyLogsPage.jsx](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/src/pages/AnomalyLogsPage.jsx)

Halaman pencatatan kronologis seluruh kejadian abnormal sensor dan pelanggaran aturan parkir:

### Alur Kerja Penanganan Anomali (PK-UC004 & PK-UC005):
```
1. Sensor ultrasonik mendeteksi kendaraan tanpa alokasi rute
   (Status Slot -> ANOMALI, Log tersimpan -> BELUM_DITANGANI)
                          │
                          ▼
2. Petugas melihat badge lonceng / denah berkedip merah
                          │
                          ▼
3. Petugas membuka AnomalyLogsPage atau klik slot di denah
                          │
                          ▼
4. Muncul Modal Tindakan:
   - Pilih Jenis Anomali: [Salah Parkir] / [Benda Asing] / [Keberadaan Manusia]
   - Isi Catatan Petugas Lapangan: "Mobil B 1234 CD menempati slot motor"
                          │
                          ▼
5. Kirim PUT ke /api/monitoring/log-iot/{idLog}/resolusi
   (Status berubah menjadi SELESAI, slot kembali normal)
```

- **Filter Fleksibel**: Pengguna dapat menyaring data berdasarkan tingkat keparahan (`ALL`, `INFO`, `WARNING`, `CRITICAL`) dan status penyelesaian (`BELUM_DITANGANI`, `SEDANG_DITANGANI`, `SELESAI`).

---

## 5. Generator Laporan Audit Sah: [ReportsPage.jsx](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/src/pages/ReportsPage.jsx)

Pusat penerbitan laporan resmi rumah sakit sesuai use-case **PK-UC010 (Mengelola Laporan Operasional)**:

1. **Parameter Fleksibel**:
   - Pemilihan Modul: `Finansial`, `Operasional`, `Lingkungan`, atau `Komprehensif` (Master).
   - Pemilihan Rentang Tanggal: `tanggalMulai` dan `tanggalAkhir`.
2. **Dua Format Berkas Resmi**:
   - **Tombol Excel (.xlsx)**: Mengunduh buku kerja spreadsheet Apache POI multi-sheet yang dilengkapi kartu ringkasan KPI, baris zebra striping, rumus total, dan kolom tanda tangan.
   - **Tombol PDF (.pdf)**: Mengunduh dokumen resmi iText format A4 Landscape ber-kop surat resmi rumah sakit, banner status audit, dan diagram batang JFreeChart.
3. **Penanganan Aliran Data Biner (*Blob Handling*)**:
   - Merespon stream byte array dari backend, mengonversinya menjadi URL objek virtual (`window.URL.createObjectURL(blob)`), dan memicu pengunduhan otomatis di peramban.
4. **Audit Trail Otomatis**: Setiap kali berkas diunduh, backend otomatis mencatatkan identitas pengunduh, IP address, dan timestamp ke tabel `log_audit_laporan`.

---

## 6. Halaman Pengaturan Sistem: [SettingsPage.jsx](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/src/pages/SettingsPage.jsx)

Halaman konfigurasi parameter teknis dan utilitas:
- **Pemeriksaan Kesehatan Hardware (*Hardware Checklist*)**: Memeriksa status operasional 4 Kamera ANPR (CCTV Gerbang) dan 96 Sensor Ultrasonik basement.
- **Tampilan Skema Tarif Parkir Resmi**: Menampilkan transparansi aturan tarif (Grace period ≤ 10 menit bebas biaya, flat normal Rp 5.000, per jam tambahan Rp 2.000, maksimal rawat inap Rp 10.000).
- **Preferensi Personalisasi**: Pengaturan tema gelap/terang dan preferensi bahasa Indonesia/Inggris.

---

## 7. SOP Digital: [PanduanPage.jsx](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/src/pages/PanduanPage.jsx)

Panduan interaktif yang dapat diakses oleh seluruh staf medis dan operator:
- Standar Operasional Prosedur penanganan kendaraan darurat (Ambulans).
- Panduan tindakan saat palang gerbang macet atau sistem jaringan terputus.
- Glosarium istilah status slot, kode node sensor, dan arti tingkat keparahan anomali.

---

## 8. Modul Autentikasi Pengguna: `LoginPage`, `RegistrasiPage`, `ResetPasswordPage`

Menangani alur masuk dan keamanan sesi:
- **Formulir Validasi**: Validasi kelengkapan username/NIP, format email, dan kecocokan konfirmasi password.
- **Penyimpanan Sesi Klien**: Informasi sesi pengguna disimpan di `sessionStorage.setItem('spct_user', ...)` sehingga sesi otomatis berakhir saat tab peramban ditutup (*secure session lifespan*).
