# Dokumentasi Arsitektur & Source Code Backend SPCT IoT
**Sistem Parkir Cerdas Terintegrasi IoT (SPCT IoT) — Rumah Sakit Panti Rapih**

Dokumentasi ini disusun secara komprehensif sebagai panduan presentasi teknis, penelaahan arsitektur, dan referensi implementasi *source code* Java Spring Boot pada sisi *backend*.

---

## 1. Peta Navigasi Dokumen Presentasi

Dokumentasi ini dipecah ke dalam beberapa modul tematik agar mudah dipresentasikan slide demi slide maupun dipelajari secara mendalam:

| No | Modul Dokumentasi | Topik Pembahasan Utama |
| :---: | :--- | :--- |
| **01** | [01_Mekanisme_Bootstrapping_SpctApplication.md](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/Dokumentasi/Backend/01_Mekanisme_Bootstrapping_SpctApplication.md) | Siklus hidup *startup*, anotasi Spring Boot, mekanisme *Auto-Seeder* data master (Akun NIP, 96 Slot Multi-Lantai, 4 Kamera, 96 Sensor). |
| **02** | [02_Arsitektur_Folder_dan_Tanggung_Jawab.md](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/Dokumentasi/Backend/02_Arsitektur_Folder_dan_Tanggung_Jawab.md) | Penjelasan fungsi penanggung jawab dari tiap folder paket Java: `config`, `controller`, `dto`, `model`, `repository`, dan `service`. |
| **03** | [03_Logika_Bisnis_Utama_Service.md](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/Dokumentasi/Backend/03_Logika_Bisnis_Utama_Service.md) | Bedah 9 Service: Algoritma Rute A*, Transaksi Masuk/Keluar Real-Time, Rumus Tarif Resmi, Analitik CO2 & Finansial, Retensi Data 90 Hari, dan Generator PDF/Excel. |
| **04** | [04_Katalog_API_Controller_dan_DTO.md](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/Dokumentasi/Backend/04_Katalog_API_Controller_dan_DTO.md) | Katalog 8 Controller REST API, spesifikasi endpoint URL, integrasi WebSocket STOMP, dan kontrak Data Transfer Object (DTO). |
| **05** | [05_Model_Entity_dan_Repository.md](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/Dokumentasi/Backend/05_Model_Entity_dan_Repository.md) | Struktur tabel database PostgreSQL, 10 Model Entity JPA, 7 Enum status, relasi relasional, dan kueri kustom JPQL pada 10 Repository. |

---

## 2. Ringkasan Arsitektur Teknologi

Backend SPCT IoT dibangun menggunakan pola arsitektur **Layered Architecture (N-Tier)** berbasis Java modern:

```
[ Client: Kiosk Gerbang & Web Dashboard ]
                 │  (HTTP REST / WebSocket STOMP)
                 ▼
┌────────────────────────────────────────────────────────┐
│ 1. CONTROLLER LAYER (com.spct.controller)              │
│    - Menangani HTTP Request / Response                 │
│    - Validasi payload DTO dan parameter URL            │
└────────────────────────┬───────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────┐
│ 2. SERVICE LAYER (com.spct.service)                    │
│    - Jantung logika bisnis dan algoritma sistem        │
│    - Transaksional (@Transactional) ACID               │
│    - Alokasi A*, Tarif Parkir, Telemetri IoT           │
└────────────────────────┬───────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────┐
│ 3. REPOSITORY LAYER (com.spct.repository)              │
│    - Abstraksi akses basis data (Spring Data JPA)      │
│    - Kueri spesifik JPQL dan method derivation         │
└────────────────────────┬───────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────┐
│ 4. MODEL / ENTITY LAYER (com.spct.model)               │
│    - Representasi objek tabel PostgreSQL               │
│    - Relasi @OneToMany, @ManyToOne, @Enumerated        │
└────────────────────────────────────────────────────────┘
```

- **Framework**: Spring Boot 3.x (Java SE 17)
- **Database**: PostgreSQL 16/18 (`db_spct_iot`, port 5432)
- **Komunikasi Real-Time**: WebSocket STOMP (`/ws-spct`, topik `/topic/monitoring` & `/topic/anomali`)
- **Reporting Engine**: Apache POI (Excel multi-sheet) & iText 7 (PDF ber-kop resmi dan tanda tangan digital)
- **Scheduling**: Spring Task Scheduler (`@EnableScheduling`, cron pembersihan jam 02:00)
