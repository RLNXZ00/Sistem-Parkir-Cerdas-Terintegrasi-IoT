# Dokumentasi Arsitektur & Source Code Frontend-Web SPCT IoT
**Sistem Parkir Cerdas Terintegrasi IoT (SPCT IoT) — Rumah Sakit Panti Rapih**

Dokumentasi ini disusun secara komprehensif sebagai panduan presentasi teknis, penelaahan arsitektur antarmuka, dan referensi implementasi *source code* React modern pada aplikasi **Frontend-Web**.

---

## 1. Peta Navigasi Dokumen Presentasi

Dokumentasi *Frontend-Web* dipecah ke dalam modul-modul tematik yang saling terhubung agar memudahkan peninjauan, presentasi slide demi slide, maupun pengujian kode secara langsung:

| No | Modul Dokumentasi | Topik Pembahasan Utama |
| :---: | :--- | :--- |
| **01** | [01_Mekanisme_Bootstrapping_dan_Routing.md](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/Dokumentasi/Frontend-Web/01_Mekanisme_Bootstrapping_dan_Routing.md) | Siklus *entry point* (`main.jsx`, `index.html`), inisialisasi tema instan, arsitektur *Client-Side Routing* (`App.jsx` via React Router v7), dan pembungkusan Context Provider global. |
| **02** | [02_Arsitektur_Folder_dan_Komponen_UI.md](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/Dokumentasi/Frontend-Web/02_Arsitektur_Folder_dan_Komponen_UI.md) | Bedah struktur direktori `src/`, tata letak terpadu (`AppLayout.jsx`), navigasi pintar berbasis peran (*Role-Based Access Control* di `Sidebar.jsx`), header adaptif (`TopBar.jsx`), dan popover notifikasi anomali terpusat. |
| **03** | [03_Bedah_Halaman_dan_Manajemen_State.md](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/Dokumentasi/Frontend-Web/03_Bedah_Halaman_dan_Manajemen_State.md) | Analisis mendalam seluruh 10 halaman aplikasi: Dashboard Lapangan Spasial Multi-Lantai, Dashboard Eksekutif Manajemen RS, Gate OCR Live Feed, Audit Log Anomali IoT, Pelaporan Dokumen Sah (PDF/Excel), Pengaturan Sistem, Panduan SOP, dan Alur Otentikasi. |
| **04** | [04_Integrasi_API_dan_Komunikasi_Realtime.md](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/Dokumentasi/Frontend-Web/04_Integrasi_API_dan_Komunikasi_Realtime.md) | Katalog integrasi ke Spring Boot (`http://localhost:8081`), mekanisme polling adaptif 1.5s & 2s, kalkulasi *Network Latency Ping*, penanganan *blob stream* berkas ekspor, dan strategi ketahanan error (*fault tolerance*). |
| **05** | [05_Panduan_Presentasi_dan_Demonstrasi_Fitur.md](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/Dokumentasi/Frontend-Web/05_Panduan_Presentasi_dan_Demonstrasi_Fitur.md) | Panduan narasi presentasi di hadapan penguji/dosen, alur demonstrasi live 4 skenario inti, pembagian peran operator vs manajer, serta bank tanya-jawab (*Q&A defense strategy*). |

---

## 2. Ringkasan Arsitektur Teknologi Frontend-Web

Aplikasi **Frontend-Web** dirancang sebagai *Single Page Application (SPA)* berkinerja tinggi, responsif, dan kaya fitur visual:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        BROWSER CLIENT (REACT 19 SPA)                   │
├────────────────────────────────────────────────────────────────────────┤
│ 1. GLOBAL CONTEXT LAYER                                                │
│    ├── LanguageProvider (i18n ID / EN terpusat via translations.js)    │
│    └── NotificationProvider (Polling log anomali + persistensi lokal)  │
├────────────────────────────────────────────────────────────────────────┤
│ 2. ROUTING & RBAC PROTECTION LAYER (react-router-dom v7)               │
│    ├── Rute Publik: Login (/), Registrasi, Reset Password              │
│    └── Rute Terproteksi Menu: Dibungkus AppLayout (Sidebar + TopBar)   │
│         ├── Petugas Lapangan: /dashboard, /gate-live, /anomaly-logs    │
│         └── Manajemen RS: /dashboard-management, /reports              │
├────────────────────────────────────────────────────────────────────────┤
│ 3. PRESENTATIONAL & INTERACTIVE LAYER                                  │
│    ├── Tailwind CSS (Custom Theme Tokens: eco-success, alert-anomaly)  │
│    ├── Material Symbols & Lucide Icons                                 │
│    └── Chart.js (Grafik Tren Pendapatan & Efisiensi Emisi CO2)         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                        HTTP REST / JSON / BLOB
                         (Polling 1.5s - 2.0s)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   BACKEND SPRING BOOT (PORT 8081)                      │
│        Deteksi Plat • Alokasi Rute A* • Log IoT • Laporan PDF/XLSX     │
└────────────────────────────────────────────────────────────────────────┘
```

### Spesifikasi Teknis:
- **Framework Inti**: [React 19.2](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/package.json#L14) + [React DOM 19.2](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/package.json#L15)
- **Build Tool & Bundler**: [Vite 8.3](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/package.json#L27) (Hot Module Replacement super cepat)
- **Client Routing**: [React Router DOM v7.18](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/package.json#L25)
- **Styling & Design System**: [Tailwind CSS 3.4](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/package.json#L26) dengan konfigurasi palet korporat ramah lingkungan
- **Data Visualizer**: [Chart.js 4.5](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/package.json#L13)
- **Ikonografi**: Material Symbols Outlined & [Lucide React 1.49](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/package.json#L22)

---

## 3. Dua Persona Pengguna Utama (Dual-Persona UI)

Frontend-Web mengimplementasikan pemisahan hak akses menu dan tampilan secara dinamis sesuai tugas lapangan:

1. **Petugas Lapangan (*Field Operator*)**:
   - **Fokus Utama**: Menjaga kelancaran alur fisik kendaraan dan respon cepat terhadap kendala di basement.
   - **Menu Khusus**:
     - `Live Dashboard`: Peta denah slot parkir interaktif per lantai (Lantai 1-3) dan per jenis (Mobil/Motor) dengan status real-time (`TERISI`, `KOSONG`, `DIPESAN`, `ANOMALI`).
     - `Gate OCR Feed`: Monitor status gerbang barrier masuk & keluar serta pengujian simulasi deteksi kamera ANPR.
     - `Anomaly Logs`: Pusat kendali verifikasi insiden sensor IoT dan form resolusi anomali (*Salah Parkir*, *Benda Asing*, *Keberadaan Manusia*).
2. **Manajemen Rumah Sakit (*Hospital Executive / Administrator*)**:
   - **Fokus Utama**: Evaluasi kinerja finansial, kepatuhan audit operasional, dan metrik keberlanjutan lingkungan.
   - **Menu Khusus**:
     - `Live Dashboard`: Indikator KPI pendapatan harian, estimasi reduksi emisi CO2 (kg), okupansi basement, latency hardware, diagram tren jam sibuk, serta peta node spasial anomali.
     - `Reports`: Pusat ekspor laporan resmi (Finansial, Operasional, Lingkungan, Komprehensif) berformat Excel (.xlsx) dan PDF bertanda tangan digital (PK-UC010).

---

## 4. Panduan Menjalankan Aplikasi Secara Lokal

Untuk menjalankan frontend-web pada lingkungan lokal:

```bash
# 1. Pindah ke direktori frontend-web
cd frontend-web

# 2. Pastikan dependensi telah terinstal
npm install

# 3. Jalankan server pengembang lokal (Vite Dev Server)
npm run dev
```

Server lokal akan aktif secara default di `http://localhost:5173`. Pastikan backend Spring Boot telah aktif di port `8081` agar seluruh integrasi API dan polling data real-time berjalan sempurna.
