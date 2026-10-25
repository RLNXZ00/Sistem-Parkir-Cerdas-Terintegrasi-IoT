# Modul 02: Arsitektur Direktori, Komponen Reusable, dan Desain Visual
**Sistem Parkir Cerdas Terintegrasi IoT (SPCT IoT) — Frontend-Web**

Modul ini mendokumentasikan tata letak arsitektur direktori `frontend-web/src/`, komponen antarmuka yang dapat digunakan kembali (*reusable UI components*), mekanisme pemisahan menu dinamis berbasis hak akses (*Role-Based Access Control*), serta sistem desain palet warna ramah lingkungan.

---

## 1. Arsitektur Struktur Direktori `src/`

Pemisahan modul pada *frontend-web* menerapkan prinsip **Separation of Concerns (SoC)** dengan memisahkan komponen presentasi, manajemen state konteks, kamus bahasa, dan halaman fitur:

```
frontend-web/src/
├── assets/                  # Aset statis grafis (hero image, logo React & Vite)
│   ├── hero.png             # Ilustrasi basement parkir modern
│   ├── react.svg
│   └── vite.svg
├── components/              # Komponen antarmuka modular yang dapat digunakan ulang
│   ├── AppLayout.jsx        # Shell tata letak utama (pembungkus Sidebar + TopBar)
│   ├── Sidebar.jsx          # Navigasi samping dengan pemfilteran menu dinamis berbasis RBAC
│   ├── TopBar.jsx           # Header atas (breadcrumb, switcher bahasa, status IoT, notifikasi)
│   ├── NotificationPopover.jsx # Menu dropdown popover riwayat anomali sensor
│   ├── AuthBrand.jsx        # Komponen logo & identitas institusi pada halaman auth
│   ├── AuthFooter.jsx       # Footer hak cipta & lisensi ramah lingkungan pada halaman auth
│   └── AuthThemeToggle.jsx  # Tombol pengalih tema (Dark/Light) khusus layar otentikasi
├── context/                 # State management terpusat (React Context API)
│   ├── LanguageContext.jsx  # Penyedia konteks multi-bahasa global (ID / EN)
│   └── NotificationContext.jsx # Penyedia konteks feed insiden anomali & status dibaca
├── i18n/                    # Kamus pelokalan bahasa
│   └── translations.js      # Definisi pasangan string terjemahan Indonesia & English
├── pages/                   # 10 Halaman antarmuka pengguna utama
│   ├── LoginPage.jsx
│   ├── RegistrasiPage.jsx
│   ├── ResetPasswordPage.jsx
│   ├── DashboardPage.jsx
│   ├── DashboardManagementPage.jsx
│   ├── GateLivePage.jsx
│   ├── AnomalyLogsPage.jsx
│   ├── ReportsPage.jsx
│   ├── SettingsPage.jsx
│   └── PanduanPage.jsx
├── App.css                  # Gaya CSS khusus komponen aplikasi
├── App.jsx                  # Konfigurasi router deklaratif & injeksi context
├── index.css                # Utilitas CSS global, animasi anomali, & token tema
└── main.jsx                 # Entry point inisialisasi tema instan & React render
```

---

## 2. Bedah Komponen Navigasi Utama

### A. Sidebar Dinamis Berbasis Peran: [Sidebar.jsx](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/src/components/Sidebar.jsx)

Komponen Sidebar mengimplementasikan **Role-Based Access Control (RBAC)** secara adaptif untuk memisahkan menu yang dilihat oleh personil lapangan dan pejabat manajemen:

```javascript
// Cuplikan Logika Deteksi Peran pada Sidebar.jsx:
const userData = JSON.parse(sessionStorage.getItem('spct_user') || '{}');

const isManagementRoute = location.pathname.startsWith('/dashboard-management') 
                       || location.pathname.startsWith('/reports');

const isManager = userData.role === 'ADMIN' 
               || userData.role === 'Manajemen RS' 
               || isManagementRoute;

// Menu STRICT terpisah sesuai RBAC:
const navItems = isManager 
  ? [
      { to: '/dashboard-management', icon: 'dashboard', label: t('nav.fieldDashboard', 'Live Dashboard') },
      { to: '/reports', icon: 'bar_chart', label: t('nav.reports', 'Reports') }
    ]
  : [
      { to: '/dashboard', icon: 'dashboard', label: t('nav.fieldDashboard', 'Live Dashboard') },
      { to: '/gate-live', icon: 'videocam', label: t('nav.gateLive', 'Gate OCR Feed') },
      { to: '/anomaly-logs', icon: 'report_problem', label: t('nav.anomalyLogs', 'Anomaly Logs') }
    ];
```

#### Keunggulan Arsitektural:
1. **Pencegahan Ambiguitas Operasional**: Petugas lapangan tidak dibebani menu pelaporan manajemen dan sebaliknya jajaran manajer RS disajikan data agregat eksekutif tanpa distraksi teknis palang gerbang.
2. **Indikator Aktif Otomatis**: Memanfaatkan fungsi callback `isActive` dari `<NavLink>` untuk memberikan highlight latar belakang `bg-primary/10`, teks tebal, dan border vertikal kanan `border-r-4 border-primary`.
3. **Desain Lipat Responsif**: Pada viewport kecil (`< lg`), sidebar mengecil menjadi lebar `w-20` (hanya menampilkan ikon Material Symbols), dan melebar menjadi `lg:w-64` dengan label teks lengkap pada layar desktop.

---

### B. Header Interaktif: [TopBar.jsx](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/src/components/TopBar.jsx)

TopBar bertindak sebagai pusat kendali utilitas yang melayang (*sticky*) di bagian atas setiap halaman:

1. **Jejak Navigasi (*Breadcrumb*)**: Menampilkan hierarki halaman aktif secara dinamis (contoh: `SPCT IoT / Operasional`).
2. **Sakelar Bahasa Instan (*Quick Language Switcher Pill*)**:
   - Berupa tombol berbentuk kapsul (*pill*) yang menampilkan `ID | EN`.
   - Mengalihkan kamus antarmuka secara instan dalam 1 kali klik tanpa me-reload peramban.
3. **Indikator Status Jaringan IoT**:
   - Menampilkan titik hijau menyala berdenyut (*pulsing dot*) berlabel `IoT Connected`.
   - Memanfaatkan animasi Tailwind `animate-pulse` dan bayangan glow `shadow-[0_0_8px_rgba(46,139,87,0.8)]`.
4. **Pusat Notifikasi Lonceng (*Notification Center*)**:
   - Terintegrasi langsung dengan `NotificationContext`.
   - Menampilkan badge oranye numerik (`1` s.d. `9+`) saat terdapat log anomali berstatus `CRITICAL` atau `BELUM_DITANGANI`.

---

### C. Dropdown Insiden Real-Time: [NotificationPopover.jsx](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/src/components/NotificationPopover.jsx)

Komponen popover melayang yang terbuka ketika tombol lonceng di TopBar diklik:

- **Deteksi Klik di Luar (*Click Outside Listener*)**: Menggunakan React `useRef` dan event listener DOM `mousedown` untuk otomatis menutup popover ketika pengguna mengklik area lain di luar kotak notifikasi.
- **Daftar Kronologis Terurut**: Mengurutkan notifikasi dari insiden paling baru.
- **Pewarnaan Tingkat Keparahan**:
  - `CRITICAL`: Ikon peringatan merah cerah dengan latar belakang merah transparan.
  - `WARNING`: Ikon peringatan kuning amber.
  - `INFO`: Ikon informasi biru sejuk.
- **Aksi Cepat**: Dilengkapi tombol "Tandai Semua Dibaca" (*Mark all as read*) yang secara instan menyimpan ID notifikasi ke `localStorage` sehingga counter kembali ke angka 0.

---

## 3. Sistem Desain (*Design System*) & Token Visual

Desain antarmuka SPCT IoT dikonfigurasi melalui [tailwind.config.js](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/tailwind.config.js) dengan filosofi **Clean Corporate & Eco-Friendly Healthcare**:

### A. Palet Warna Semantik Utama

| Token Desain | Kode Warna / Nilai | Peruntukan Fungsional |
| :--- | :--- | :--- |
| `primary` | Emerald Green / Cyan Teal | Tombol utama, link aktif, identitas branding institusi |
| `surface` | Slate Dark `#0f172a` (Light: `#ffffff`) | Latar belakang kartu komponen, sidebar, dan modal dialog |
| `background` | Deep Slate `#020617` (Light: `#f8fafc`) | Latar kanvas aplikasi utama |
| `eco-success` | Green `#16a34a` / `#22c55e` | Slot terisi normal, penghematan bahan bakar, status hardware normal |
| `warning-reserved` | Amber `#f59e0b` | Slot yang sedang dalam status alokasi rute pemesanan (*reserved*) |
| `alert-anomaly` | Crimson Red `#ef4444` | Sensor mati/anomali, salah parkir, kasus darurat yang belum ditangani |

### B. Micro-Animations Kustom pada [index.css](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/src/index.css)

Untuk memberikan umpan balik visual yang tegas kepada petugas lapangan saat terjadi anomali parkir, disematkan animasi berkedip (*pulsing alert*) pada elemen denah:

```css
@keyframes pulseAnomaly {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
    border-color: rgba(239, 68, 68, 1);
  }
  50% {
    box-shadow: 0 0 16px 4px rgba(239, 68, 68, 0.4);
    border-color: rgba(254, 202, 202, 1);
  }
}

.pulse-anomaly {
  animation: pulseAnomaly 1.5s infinite ease-in-out;
}
```

Animasi ini langsung aktif pada kotak denah slot parkir ketika status sensor terdeteksi `OFF` atau terdapat log anomali aktif yang belum terselesaikan.
