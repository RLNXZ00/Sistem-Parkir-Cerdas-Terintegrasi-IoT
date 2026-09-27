# Spesifikasi Desain UI/UX

Desain antarmuka SPCT IoT bertujuan untuk memberikan kesan "Premium, Cerdas, dan Ramah Lingkungan", dengan mengedepankan fungsionalitas kepadatan data (*Data Density*) ala *Command Center*.

## 1. Tema dan Estetika Utama
- **Dark Mode & Glassmorphism:** Sistem sepenuhnya menggunakan latar belakang gelap (Dark Mode) untuk mengurangi silau mata pada kondisi *basement* dan memberi kontras maksimal pada elemen teks. Elemen semi-transparan (*glassmorphism*) memberikan kesan teknologi tinggi.
- **Palet Warna Semantik:**
  - *Nature Green* (`#2E8B57`): Untuk status positif, lunas, slot tersedia, dan penunjuk rute navigasi. Representasi elemen *Green Building*.
  - *Warning Yellow* (`#FFD700`): Untuk status transisi (sedang dipesan/Reserved).
  - *Alert Red* (`#FF4500`): Untuk error sensor, saldo kurang, dan anomali pelanggaran parkir.
  - *Electric Blue* (`#00BFFF`): Untuk notifikasi sistem.

## 2. Implementasi Berbasis Peran (RBAC Visual)
- **Live Dashboard Manajemen (Strategic View):** Menampilkan metrik tinggi seperti estimasi pendapatan finansial (*Revenue Tracker*) dan perhitungan penghematan karbon (*CO2 Savings Tracker*).
- **Dashboard Petugas Lapangan (Tactical View):** Menyembunyikan widget finansial untuk fokus penuh pada Peta Interaktif Denah Parkir, Live Video OCR (*Gate Feed*), dan notifikasi Alarm Anomali untuk penanganan cepat.
- **Terminal Publik / Pengunjung (Kiosk):** Font dibuat raksasa agar terbaca dari kabin mobil. UI bersifat pasif dan otomatis (minimal klik) dengan menampilkan peta panduan 2D statis sesaat setelah tiket digital terbentuk.

Desain ini memastikan informasi yang disajikan sangat padat namun mudah dipindai mata (*scannable*), memaksimalkan efisiensi waktu, sesuai dengan tuntutan respons layanan fasilitas kesehatan atau publik.
