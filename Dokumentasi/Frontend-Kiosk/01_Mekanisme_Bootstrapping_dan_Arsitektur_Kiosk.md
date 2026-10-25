# Modul 01: Mekanisme Bootstrapping, Arsitektur Kiosk, dan Routing Client-Side
**Sistem Parkir Cerdas Terintegrasi IoT (SPCT IoT) — Frontend-Kiosk**

Modul ini mendokumentasikan mekanisme *bootstrapping* aplikasi terminal layar sentuh (*touchscreen kiosk*), konfigurasi *reverse proxy* perantara hardware, arsitektur *client-side routing* dua arah (Masuk & Keluar), serta teknik transfer data sekuensial (*state machine*) antar layar.

---

## 1. Titik Awal Pemuatan (*Entry Point*): `index.html` & `main.jsx`

Aplikasi kios didesain mandiri dari aplikasi web admin agar dapat dijalankan secara terpisah pada perangkat mini-PC di gardu gerbang luar ruangan.

### Struktur Berkas [index.html](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-kiosk/index.html)
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SPCT - Terminal Kiosk</title>
    <!-- Import Google Fonts: Space Grotesk & Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
    <!-- Import Material Symbols Outlined -->
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
  </head>
  <body class="bg-[#050B14] select-none">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### Karakteristik Kunci:
1. **Kelas `select-none`**: Mencegah teks ter-blok/ter-seleksi secara tidak sengaja saat pengguna menyentuh layar kios (*kiosk touch protection*).
2. **Tipografi Industri**: Memuat font `Space Grotesk` untuk indikator status hardware terminal dan `Inter` untuk angka plat serta nominal biaya.

### Inisialisasi React: [src/main.jsx](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-kiosk/src/main.jsx)
```javascript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

---

## 2. Konfigurasi Reverse Proxy Vite: `vite.config.js`

Pada mesin kios gerbang, seluruh permintaan HTTP ke backend Spring Boot diarahkan melalui proxy lokal bawaan Vite di [vite.config.js](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-kiosk/vite.config.js):

```javascript
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      }
    }
  }
})
```

### Mengapa Konfigurasi Proxy Ini Krusial?
1. **Eliminasi Masalah CORS (*Cross-Origin Resource Sharing*)**: Panggilan API dari kios dilakukan secara relatif (`fetch('/api/gate/masuk')`), sehingga peramban menganggap request berada pada domain/origin yang sama.
2. **Abstraksi Alamat Jaringan**: Memudahkan perpindahan target backend dari server lokal pengembang (`localhost:8081`) ke alamat IP gerbang produksi fisik tanpa mengubah kode komponen antarmuka.

---

## 3. Arsitektur Client-Side Routing: `App.jsx`

Arsitektur rute pada [App.jsx](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-kiosk/src/App.jsx) membagi alur kios menjadi dua siklus hidup mesin status terpisah (*Two Dedicated State Machine Flows*):

```
                                  [ START KIOSK ]
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
       [ 1. ENTRY GATE FLOW ]                         [ 2. EXIT GATE FLOW ]
       Gerbang Masuk Kendaraan                        Gerbang Keluar & Bayar
                 │                                               │
    ┌────────────┴────────────┐                     ┌────────────┴────────────┐
    ▼                         ▼                     ▼                         ▼
  Scan Mobil (/)         Scan Motor (/motor)      Exit Mobil (/exit)     Exit Motor (/exit/motor)
    │                         │                     │                         │
    └────────────┬────────────┘                     └────────────┬────────────┘
                 ▼                                               ▼
      AllocatingSlotPage (/allocating)                   Kalkulasi Tarif Resmi
                 │                                               │
                 ▼                                  ┌────────────┴────────────┐
       NavigationPage (/navigation)                 ▼                         ▼
         (Peta Rute A* & Sensor)              ExitSuccessPage           ExitFailedPage
                                               (/exit/success)           (/exit/failed)
```

### Deklarasi Rute pada [App.jsx](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-kiosk/src/App.jsx#L16-L35):

```jsx
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* === 1. Alur Gerbang Masuk (Entry Flow) === */}
        <Route path="/" element={<ScanPage key="masuk-mobil" jenis="MOBIL" />} />
        <Route path="/motor" element={<ScanPage key="masuk-motor" jenis="MOTOR" />} />
        <Route path="/allocating" element={<AllocatingSlotPage />} />
        <Route path="/navigation" element={<NavigationPage />} />
        
        {/* === 2. Alur Gerbang Keluar (Exit Gate Flow) === */}
        <Route path="/exit" element={<ExitScanPage key="keluar-mobil" jenis="MOBIL" />} />
        <Route path="/exit/motor" element={<ExitScanPage key="keluar-motor" jenis="MOTOR" />} />
        <Route path="/exit/success" element={<ExitSuccessPage />} />
        <Route path="/exit/failed" element={<ExitFailedPage />} />

        {/* Fallback Otomatis ke Halaman Standby Masuk */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### Analisis Kritis Properti `key` pada Rute:
Perhatikan bahwa komponen `ScanPage` dan `ExitScanPage` dipasangi properti unik `key="masuk-mobil"`, `key="masuk-motor"`, `key="keluar-mobil"`, dan `key="keluar-motor"`.  
Dalam React, pemberian `key` yang berbeda memaksa React untuk melakukan **re-mounting penuh** saat pengguna beralih antar jenis kendaraan. Hal ini memastikan state internal (seperti nomor plat acak simulasi dan antrean kendaraan) di-reset bersih seketika tanpa meninggalkan artefak data sebelumnya.

---

## 4. Pola Transfer Data Sekuensial (*State Passing via React Router*)

Berbeda dengan aplikasi *dashboard* yang memerlukan global state manajemen yang kompleks, alur kios terminal bersifat **linear terarah** (*Sequential State Machine*). Oleh karena itu, data dilewatkan antar layar menggunakan `location.state`:

### A. Pengiriman Data dari `ScanPage` ke `AllocatingSlotPage`:
```javascript
// ScanPage.jsx: Meneruskan data deteksi kamera ke layar alokasi
navigate('/allocating', { 
  state: { 
    platNomor: activePlate,
    jenisKendaraan: jenis,
    slotDialokasikan: data.slotDialokasikan,
    slotData: {
      idSlotDialokasikan: data.slotDialokasikan,
      urutan: data.jalurRuteGraf // Koordinat titik belok A*
    }
  } 
});
```

### B. Penerimaan Data di `NavigationPage`:
```javascript
// NavigationPage.jsx: Membaca parameter alokasi untuk menggambar peta
const location = useLocation();
const { slotData, platNomor, jenisKendaraan = 'MOBIL' } = location.state || {};
const targetSlot = slotData?.idSlotDialokasikan || "B1-01";
const ruteKoordinat = slotData?.urutan || [];
```

### Keuntungan Pola Arsitektur Ini:
1. **Ringan & Cepat**: Tidak membebani memori mesin kios mini-PC dengan pustaka eksternal seperti Redux atau Zustand.
2. **Isolasi Alur**: Data sesi kendaraan otomatis hilang dari memori saat siklus parkir selesai dan halaman kembali ke posisi *standby*, menjaga privasi data plat nomor kendaraan berikutnya.
