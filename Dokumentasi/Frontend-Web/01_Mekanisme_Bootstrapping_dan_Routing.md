# Modul 01: Mekanisme Bootstrapping, Lifecycle, dan Routing Client-Side
**Sistem Parkir Cerdas Terintegrasi IoT (SPCT IoT) — Frontend-Web**

Modul ini membedah mekanisme inisialisasi aplikasi dari berkas HTML pertama kali dibaca peramban (*browser*), inisialisasi tema instan tanpa kedipan visual (*anti-FOUC*), injeksi *global state context*, hingga deklarasi hierarki rute antarmuka berbasis React Router v7.

---

## 1. Titik Awal Pemuatan (*Entry Point*): `index.html`

Aplikasi web SPCT IoT dikonfigurasi sebagai *Single Page Application* (SPA) modern yang dimotori oleh bundler Vite.

### Struktur Berkas [index.html](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/index.html)
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>frontend-web</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### Analisis Kritis Komponen:
1. **Container Elemen `#root`**: Wadah tunggal penampung seluruh hierarki komponen React yang dirender ke Virtual DOM.
2. **Modul Script `/src/main.jsx`**: Peramban memuat skrip dengan atribut `type="module"` yang memungkinkan eksekusi native ES Modules di peramban tanpa bundling manual pada tahap pengembangan (*Hot Module Replacement* instan).

---

## 2. Bootstrapping & Pencegahan Flash Tema: `src/main.jsx`

Berkas [main.jsx](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/src/main.jsx) bertanggung jawab melakukan inisialisasi awal sebelum pohon komponen React dirender ke peramban.

```javascript
// Baris 1-5: Import pustaka inti dan style dasar
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Baris 6-12: Inisialisasi tema dari preferensi yang tersimpan (Anti-FOUC)
const initialTheme = localStorage.getItem('spct_theme') || 'dark';
if (initialTheme === 'light') {
  document.documentElement.classList.add('light-theme');
} else {
  document.documentElement.classList.remove('light-theme');
}

// Baris 14-18: Render pohon Virtual DOM React 19
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

### Mengapa Inisialisasi Tema Dilakukan di Luar React?
Pada baris 7-12, evaluasi `localStorage.getItem('spct_theme')` dijalankan **sebelum** fungsi `createRoot().render()` dieksekusi. Pola arsitektural ini sangat krusial untuk mencegah terjadinya **FOUC (Flash of Unstyled Content)**:
- Jika pemeriksaan tema ditaruh di dalam komponen React (`useEffect`), layar peramban akan berkedip putih/gelap selama beberapa milidetik sebelum state tema selesai dibaca.
- Dengan menyuntikkan kelas `light-theme` langsung pada `document.documentElement` (`<html>`) di tahap bootstrapping, seluruh variabel CSS Tailwind segera aktif pada paint frame pertama.

---

## 3. Hierarki Global Context Providers: `src/App.jsx`

Pada [App.jsx](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/src/App.jsx), aplikasi membungkus router dengan dua Context Provider global tingkat teratas:

```
┌─────────────────────────────────────────────────────────────────┐
│ <LanguageProvider> (Konteks Bahasa Internasionalisasi ID/EN)    │
│   ┌─────────────────────────────────────────────────────────────┤
│   │ <NotificationProvider> (Konteks Notifikasi Anomali Terpusat)│
│   │   ┌─────────────────────────────────────────────────────────┤
│   │   │ <BrowserRouter> (React Router v7)                       │
│   │   │   └── <Routes> ... </Routes>                            │
│   │   └─────────────────────────────────────────────────────────┘
│   └─────────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────────┘
```

### 1. `LanguageProvider` ([LanguageContext.jsx](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/src/context/LanguageContext.jsx))
- **Fungsi**: Mengelola kamus multi-bahasa terpusat (Bahasa Indonesia & Bahasa Inggris) untuk seluruh halaman dan komponen navigasi.
- **Mekanisme State**:
  - Membaca preferensi dari `localStorage.getItem('spct_lang') || 'id'`.
  - Menyediakan fungsi helper `t(key, fallback)` yang menelusuri kunci kamus hierarkis pada [translations.js](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/src/i18n/translations.js) (contoh: `t('nav.fieldDashboard', 'Live Dashboard')`).
  - Menyediakan mutator `setLanguage(lang)` yang otomatis mensinkronkan preferensi ke `localStorage`.

### 2. `NotificationProvider` ([NotificationContext.jsx](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/src/context/NotificationContext.jsx))
- **Fungsi**: Mengorkestrasi feed notifikasi insiden anomali sensor IoT secara global agar badge counter lonceng di [TopBar.jsx](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/src/components/TopBar.jsx) sinkron secara konsisten di seluruh halaman.
- **Logika Penanganan Status "Dibaca" (*Read State*)**:
  - Setiap kali polling `/api/monitoring/log-iot` mengambil log insiden terbaru dari Spring Boot, ID notifikasi dicocokkan dengan set ID yang tersimpan di `localStorage.getItem('spct_read_notifications')`.
  - Jika seorang petugas menandai notifikasi sebagai "dibaca" di satu halaman, saat petugas berpindah ke halaman lain status notifikasi **tidak kembali menjadi unread**.
  - Menyediakan `unreadCount` instan untuk badge merah lonceng, serta fungsi `markAsRead(id)` dan `markAllRead()`.

---

## 4. Arsitektur Client-Side Routing: `react-router-dom` v7

Seluruh pemetaan URL sistem dikonfigurasi secara deklaratif di dalam [App.jsx](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/src/App.jsx#L24-L54):

```jsx
<BrowserRouter>
  <Routes>
    {/* === 1. Area Autentikasi Publik === */}
    <Route path="/" element={<LoginPage />} />
    <Route path="/registrasi" element={<RegistrasiPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />

    {/* === 2. Area Operasional Petugas Lapangan === */}
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/gate-live" element={<GateLivePage />} />
    <Route path="/anomaly-logs" element={<AnomalyLogsPage />} />

    {/* === 3. Area Evaluasi Manajemen Rumah Sakit === */}
    <Route path="/dashboard-management" element={<DashboardManagementPage />} />
    <Route path="/reports" element={<ReportsPage />} />

    {/* === 4. Area Pengaturan & SOP Bersama === */}
    <Route path="/panduan" element={<PanduanPage />} />
    <Route path="/settings" element={<SettingsPage />} />

    {/* === 5. Fallback Default === */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
</BrowserRouter>
```

### Tabel Rute & Peruntukan Akses:

| URL Path | Komponen Halaman | Peran Target (*Target Persona*) | Deskripsi Fungsional |
| :--- | :--- | :--- | :--- |
| `/` | `LoginPage` | Semua Pengguna | Gerbang autentikasi awal berbasis username/NIP & password |
| `/registrasi` | `RegistrasiPage` | Akun Baru Petugas | Pendaftaran personel lapangan baru dengan validasi format |
| `/reset-password` | `ResetPasswordPage` | Pemulihan Akun | Prosedur pembaruan kata sandi akun |
| `/dashboard` | `DashboardPage` | **Petugas Lapangan** | Visualisasi denah slot multi-lantai real-time & resolusi cepat |
| `/gate-live` | `GateLivePage` | **Petugas Lapangan** | Live monitor CCTV ANPR gerbang masuk/keluar & simulasi palang |
| `/anomaly-logs` | `AnomalyLogsPage` | **Petugas Lapangan** | Log kronologis anomali IoT & validasi form tindakan lapangan |
| `/dashboard-management` | `DashboardManagementPage` | **Manajemen RS** | Indikator KPI finansial, okupansi, reduksi emisi CO2, & node map |
| `/reports` | `ReportsPage` | **Manajemen RS** | Generator dokumen sah audit PK-UC010 (ekspor Excel & PDF) |
| `/panduan` | `PanduanPage` | Semua Pengguna | Standard Operating Procedure (SOP) digital & panduan alat |
| `/settings` | `SettingsPage` | Semua Pengguna | Status hardware sensor/CCTV, simulasi tarif, & profil |
| `*` | `Navigate` | Fallback | Pengalihan otomatis URL tidak valid kembali ke login (`/`) |

---

## 5. Mekanisme Layout Shell Terpadu: `AppLayout.jsx`

Seluruh halaman fitur menu dibungkus oleh layout shell tunggal [AppLayout.jsx](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/src/components/AppLayout.jsx):

```jsx
export default function AppLayout({ children, breadcrumb, status }) {
  return (
    <div className="bg-background text-on-background font-body-base h-screen overflow-hidden flex">
      {/* 1. Sidebar Navigasi Kiri (Fixed Posisi) */}
      <Sidebar />
      
      {/* 2. Area Konten Utama Kanan */}
      <div className="flex-1 ml-20 lg:ml-64 flex flex-col h-screen relative">
        {/* TopBar Header Atas (Fixed Posisi) */}
        <TopBar breadcrumb={breadcrumb} status={status} />
        
        {/* Main Content dengan Scroll Independen */}
        <main className="flex-1 overflow-y-auto mt-16">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### Keunggulan Arsitektur Layout Ini:
1. **Pemisahan Scroll Independen**: Sidebar kiri dan Topbar atas bersifat `fixed` (tetap terkunci pada posisinya), sementara elemen `<main>` diatur dengan `overflow-y-auto`. Hal ini mencegah header bergulir hilang saat pengguna menelusuri tabel data laporan yang panjang.
2. **Kompensasi Grid Responsif**: Kontainer kanan diberi kelas `ml-20 lg:ml-64` (margin-left 80px pada layar tablet/mobile, dan 256px pada layar desktop) yang secara presisi menyesuaikan lebar Sidebar agar konten tidak tertutup.
3. **Penerusan Breadcrumb Dinamis**: Properti `breadcrumb` dan `status` diteruskan dari tiap halaman ke `TopBar` sehingga judul navigasi selalu merefleksikan posisi halaman aktif.
