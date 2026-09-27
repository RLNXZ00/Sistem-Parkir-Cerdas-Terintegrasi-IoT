# Konsep dan Masalah Inti: Sistem Parkir Cerdas Terintegrasi IoT (SPCT IoT)

## 1. Latar Belakang
Proyek SPCT IoT dibangun untuk fasilitas publik yang memiliki kepadatan tinggi seperti Rumah Sakit. Fasilitas ini umumnya memiliki area parkir *basement* yang luas di mana manajemen parkirnya masih bersifat konvensional.

## 2. Permasalahan Utama (Analisis PIECES)
- **Kinerja & Ekonomi:** Pengunjung menghabiskan banyak waktu berputar-putar di dalam *basement* hanya untuk mencari slot parkir kosong. Hal ini menyebabkan pemborosan bahan bakar (BBM).
- **Lingkungan & Kesehatan:** Kendaraan yang terus menyala di ruang tertutup (*basement*) secara signifikan meningkatkan polusi (emisi CO2, gas buang, partikulat) yang berbahaya bagi pernapasan pengunjung maupun petugas.
- **Limbah Material:** Penggunaan karcis kertas konvensional menciptakan limbah harian yang menumpuk dan merugikan lingkungan secara jangka panjang.
- **Informasi & Kontrol:** Pengelola gedung tidak memiliki sistem yang secara *real-time* memantau slot mana yang kosong dan terisi, serta ketiadaan panduan rute bagi pengendara.

## 3. Solusi SPCT IoT
Sistem ini hadir sebagai solusi komprehensif (Green-IoT Integrated) yang mengedepankan otomasi dan digitalisasi:
- **Paperless:** Menggantikan karcis kertas dengan pendataan otomatis menggunakan deteksi plat nomor (ALPR).
- **Otomasi Navigasi:** Mengalokasikan slot secara cerdas saat pengendara di gerbang masuk dan memandu mereka dengan layar LED.
- **Integrasi IoT:** Menggunakan sensor fisik (ultrasonik/inframerah) pada tiap slot untuk memonitor ketersediaan secara seketika (*real-time*).
- **Pembayaran Nirkontak:** Memanfaatkan *Payment Gateway* terintegrasi saat keluar untuk mempercepat arus lalu lintas.
- **Reduksi Emisi:** Meminimalkan waktu pencarian parkir, yang secara langsung menekan pengeluaran emisi karbon di ruang tertutup.
