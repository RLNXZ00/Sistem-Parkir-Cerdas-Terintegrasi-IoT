# Dokumentasi Arsitektur & Source Code Frontend-Kiosk SPCT IoT
**Sistem Parkir Cerdas Terintegrasi IoT (SPCT IoT) — Rumah Sakit Panti Rapih**

Dokumentasi ini disusun secara komprehensif sebagai panduan presentasi teknis, penelaahan arsitektur antarmuka mesin kios, dan referensi implementasi *source code* React pada aplikasi **Frontend-Kiosk** (*Drive-Thru Touchscreen Terminal*).

---

## 1. Peta Navigasi Dokumen Presentasi Kiosk

Dokumentasi *Frontend-Kiosk* dipecah ke dalam modul-modul tematik yang saling terhubung agar memudahkan peninjauan, presentasi slide demi slide, maupun demonstrasi alur fisik kendaraan secara langsung:

| No | Modul Dokumentasi | Topik Pembahasan Utama |
| :---: | :--- | :--- |
| **01** | [01_Mekanisme_Bootstrapping_dan_Arsitektur_Kiosk.md](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/Dokumentasi/Frontend-Kiosk/01_Mekanisme_Bootstrapping_dan_Arsitektur_Kiosk.md) | Siklus *entry point* (`main.jsx`, `index.html`), konfigurasi reverse proxy Vite (`vite.config.js`), arsitektur *Client-Side Routing* (`App.jsx`), dan pemisahan alur terminal masuk (*Entry Flow*) vs terminal keluar (*Exit Flow*). |
| **02** | [02_Komponen_Antarmuka_dan_State_Management.md](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/Dokumentasi/Frontend-Kiosk/02_Komponen_Antarmuka_dan_State_Management.md) | Desain UI khusus *Drive-Thru Touchscreen* (kontras tinggi, target sentuh besar, font *Space Grotesk*), komponen pemilih kendaraan (`JenisKendaraanToggle.jsx`), dan panel simulasi checkout pembayaran e-wallet (`PanelSimulasiExit.jsx`). |
| **03** | [03_Bedah_Alur_Gerbang_Masuk_dan_Keluar.md](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/Dokumentasi/Frontend-Kiosk/03_Bedah_Alur_Gerbang_Masuk_dan_Keluar.md) | Bedah komparatif dua alur operasional: Alur Masuk (`ScanPage`, `AllocatingSlotPage`, `NavigationPage` dengan visualisasi rute SVG polyline A*) dan Alur Keluar (`ExitScanPage` antrean FIFO, `ExitSuccessPage` struk lunas, `ExitFailedPage` saldo kurang). |
| **04** | [04_Integrasi_Hardware_IoT_dan_Backend_API.md](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/Dokumentasi/Frontend-Kiosk/04_Integrasi_Hardware_IoT_dan_Backend_API.md) | Pemetaan endpoint backend (`/api/gate/*`), integrasi 4 kamera CCTV ANPR (`GATE_IN_01`, `GATE_IN_02`, `PG_EXIT_01`, `PG_EXIT_02`), polling status sensor ultrasonik, dan webhook simulasi kedatangan kendaraan (`/api/monitoring/webhook`). |
| **05** | [05_Panduan_Presentasi_dan_Demonstrasi_Kiosk.md](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/Dokumentasi/Frontend-Kiosk/05_Panduan_Presentasi_dan_Demonstrasi_Kiosk.md) | Panduan langkah-demi-langkah demonstrasi live siklus penuh kendaraan (Masuk ➔ Panduan Rute A* ➔ Parkir di Slot ➔ Keluar Bayar Lunas), pengujian skenario khusus (Grace Period & Saldo Kurang), serta matriks tanya-jawab penguji. |

---

## 2. Ringkasan Arsitektur Teknologi Frontend-Kiosk

Aplikasi **Frontend-Kiosk** didesain khusus untuk berjalan pada layar sentuh kios luar ruangan (*outdoor drive-thru totem terminal*) di gerbang fisik rumah sakit:

```
┌────────────────────────────────────────────────────────────────────────┐
│               KIOSK DRIVE-THRU TOUCHSCREEN (REACT 19 SPA)              │
├────────────────────────────────────────────────────────────────────────┤
│ 1. ENTRY GATE FLOW (Gerbang Masuk)                                     │
│    ├── ScanPage (/ dan /motor)                                         │
│    │    └── Deteksi Kamera ANPR + Tombol Simulasi Kedatangan           │
│    ├── AllocatingSlotPage (/allocating)                                │
│    │    └── Radar Scanning Animasi & Algoritma Rute A*                 │
│    └── NavigationPage (/navigation)                                    │
│         └── Peta Vektor Rute Jalur Koordinat + Polling Sensor Fisik    │
├────────────────────────────────────────────────────────────────────────┤
│ 2. EXIT GATE FLOW (Gerbang Keluar & Pembayaran Kiosk)                  │
│    ├── ExitScanPage (/exit dan /exit/motor)                            │
│    │    └── Antrean FIFO Basement + Panel Simulasi Saldo & Durasi      │
│    ├── ExitSuccessPage (/exit/success)                                 │
│    │    └── Status Lunas, Palang Terbuka, & Pembebasan Slot Otomatis   │
│    └── ExitFailedPage (/exit/failed)                                   │
│         └── Penanganan Saldo Kurang (HTTP 402) / Bantuan Pos           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                       REVERSE PROXY VITE (/api/*)
                         (Target: localhost:8081)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   BACKEND SPRING BOOT (PORT 8081)                      │
│      Kamera ANPR • Algoritma A* • Sensor Ultrasonik • Gateway Tarif    │
└────────────────────────────────────────────────────────────────────────┘
```

### Spesifikasi Teknis:
- **Framework Inti**: [React 19.2](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-kiosk/package.json#L13) + [React DOM 19.2](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-kiosk/package.json#L14)
- **Bundler & Proxy**: [Vite 8.3](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-kiosk/package.json#L25) dengan konfigurasi `server.proxy` ke backend Spring Boot
- **Client Routing**: [React Router DOM v7.18](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-kiosk/package.json#L15)
- **Styling**: [Tailwind CSS 3.4](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-kiosk/package.json#L24)
- **Tipografi Khusus Kiosk**:
  - `Space Grotesk`: Font sans-serif futuristik bergaya terminal industri
  - `Inter`: Font sans-serif dengan keterbacaan tinggi untuk angka plat dan tarif
  - `Material Symbols Outlined`: Ikon visual status gerbang dan arah mata angin

---

## 3. Karakteristik Desain Khusus Terminal Luar Ruangan

Antarmuka kios dirancang dengan mempertimbangkan kondisi pencahayaan dan interaksi fisik pengemudi:
1. **Latar Gelap Kontras Tinggi (*Deep Contrast Dark Mode*)**:
   - Warna latar belakang utama `#050B14` dan kontainer `#0B1526` meminimalkan silau matahari di siang hari dan tidak menyilaukan mata pengemudi di malam hari.
2. **Elemen UI Skala Besar (*Touch-Friendly Targets*)**:
   - Seluruh tombol utama, penampil plat nomor, dan petunjuk arah dirancang dengan padding besar (tinggi minimal 56px) agar mudah ditekan dari dalam mobil tanpa menurunkan kaca secara berlebihan.
3. **Pembedaan Jalur Fisik Berbasis Tab / Rute**:
   - Jalur Mobil (`/` dan `/exit`) dan Jalur Motor (`/motor` dan `/exit/motor`) dipisahkan secara tegas agar kapasitas dan alokasi lantai tidak bercampur.

---

## 4. Panduan Menjalankan Aplikasi Secara Lokal

Untuk menjalankan frontend-kiosk pada lingkungan pengembang lokal:

```bash
# 1. Pindah ke direktori frontend-kiosk
cd frontend-kiosk

# 2. Pastikan dependensi telah terinstal
npm install

# 3. Jalankan server pengembang lokal (Vite Dev Server)
npm run dev
```

Server kios akan aktif secara default di `http://localhost:5174` (atau port berikutnya jika 5173 digunakan oleh frontend-web). Pastikan backend Spring Boot telah aktif di port `8081` agar reverse proxy `/api` dapat meneruskan request secara mulus.
