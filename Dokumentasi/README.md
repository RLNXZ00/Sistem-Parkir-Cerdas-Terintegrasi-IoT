# Dokumentasi Sistem Parkir Cerdas Terintegrasi IoT (SPCT IoT)

Selamat datang di repositori dokumentasi resmi proyek **Sistem Parkir Cerdas Terintegrasi IoT (SPCT IoT)**. Direktori ini memuat seluruh panduan arsitektur perangkat lunak, rancangan basis data, implementasi kode MVC (Spring Boot & React), alur operasional IoT, serta panduan presentasi tim akademik.

---

## 1. Peta Indeks Dokumentasi

```
Dokumentasi/
├── Panduan-Presentasi-Tim/  # Panduan Presentasi Dosen (Matriks 4 Mahasiswa, Use Case & Git)
│   ├── 00_Panduan_Umum_dan_Matriks_Tugas_4_Mahasiswa.md
│   ├── 01_Mahasiswa_1_Gerbang_Masuk_dan_Alokasi_Slot.md
│   ├── 02_Mahasiswa_2_Navigasi_Kiosk_dan_Telemetri_Sensor_IoT.md
│   ├── 03_Mahasiswa_3_Deteksi_Anomali_dan_Command_Center_Petugas.md
│   ├── 04_Mahasiswa_4_Gerbang_Keluar_Cashless_dan_Laporan_Eksekutif.md
│   └── README.md
│
├── Backend/                 # Dokumentasi Komprehensif Backend Spring Boot
│   ├── 01_Arsitektur_dan_Konfigurasi_Sistem.md
│   ├── 02_Rancangan_Basis_Data_dan_Entitas_JPA.md
│   ├── 03_Logika_Bisnis_dan_Implementasi_Service.md
│   ├── 04_Spesifikasi_REST_API_dan_Integrasi_IoT.md
│   ├── 05_Panduan_Pengujian_Deployment_dan_Keamanan.md
│   └── README.md
│
├── Frontend-Web/            # Dokumentasi Komprehensif Web Admin & Command Center
│   ├── 01_Mekanisme_Bootstrapping_dan_Arsitektur_Aplikasi.md
│   ├── 02_Sistem_Desain_Tema_dan_Komponen_Global.md
│   ├── 03_Bedah_Halaman_dan_Alur_Navigasi.md
│   ├── 04_Manajemen_State_dan_Integrasi_REST_API.md
│   ├── 05_Panduan_Presentasi_dan_Demonstrasi_Sistem.md
│   └── README.md
│
├── Frontend-Kiosk/          # Dokumentasi Komprehensif Kiosk Layar Sentuh Gerbang
│   ├── 01_Mekanisme_Bootstrapping_dan_Arsitektur_Kiosk.md
│   ├── 02_Komponen_Antarmuka_dan_State_Management.md
│   ├── 03_Bedah_Alur_Gerbang_Masuk_dan_Keluar.md
│   ├── 04_Integrasi_Hardware_IoT_dan_Backend_API.md
│   ├── 05_Panduan_Presentasi_dan_Demonstrasi_Kiosk.md
│   └── README.md
│
└── ANPR/                    # Dokumentasi Computer Vision YOLOv11 & OCR Plat Nomor
    └── README.md
```

---

## 2. Navigasi Cepat Modul Utama

1. **[Panduan Presentasi Tim 4 Mahasiswa](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/Dokumentasi/Panduan-Presentasi-Tim/README.md)**:
   Panduan lengkap pembagian materi untuk 4 mahasiswa mencakup korelasi Use Case (PK-UC001 s.d. PK-UC010), bedah kode Model-Controller-View (MVC), dan pembuktian disiplin version control GitHub.
2. **[Dokumentasi Backend Spring Boot](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/Dokumentasi/Backend/README.md)**:
   Penjelasan arsitektur enterprise Java 23, Spring Data JPA, Spring Security, dan WebSocket/MQTT broker.
3. **[Dokumentasi Frontend Web Command Center](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/Dokumentasi/Frontend-Web/README.md)**:
   Penjelasan antarmuka monitoring 16 slot real-time, 4 kamera gerbang live, log anomali IoT, dan ekspor laporan resmi.
4. **[Dokumentasi Frontend Kiosk](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/Dokumentasi/Frontend-Kiosk/README.md)**:
   Penjelasan antarmuka layar sentuh terminal gerbang masuk dan gerbang keluar, rute navigasi interaktif visual, dan simulator pembayaran QRIS nirkontak.
