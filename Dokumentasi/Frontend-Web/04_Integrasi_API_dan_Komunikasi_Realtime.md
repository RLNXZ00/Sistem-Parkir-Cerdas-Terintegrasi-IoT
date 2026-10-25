# Modul 04: Integrasi API, Komunikasi Real-Time, dan Penanganan Data
**Sistem Parkir Cerdas Terintegrasi IoT (SPCT IoT) — Frontend-Web**

Modul ini mendokumentasikan arsitektur komunikasi jaringan antara aplikasi antarmuka klien (*React SPA*) dan server backend (*Spring Boot*), katalog endpoint REST API yang dikonsumsi, strategi *polling* data real-time, pengukuran latensi jaringan (*Network Ping*), serta teknik penanganan pengunduhan berkas biner (*Blob Streaming*).

---

## 1. Arsitektur Komunikasi Jaringan

Frontend-Web berkomunikasi secara langsung dengan backend Spring Boot yang beroperasi pada alamat `http://localhost:8081`:

```
┌─────────────────────────────────┐                 ┌─────────────────────────────────┐
│     FRONTEND-WEB (Port 5173)    │                 │   BACKEND SPRING (Port 8081)    │
│                                 │                 │                                 │
│  1. Polling Denah Slot (1.5s)   │─── HTTP GET ───▶│  /api/monitoring/slots          │
│  2. Polling Log IoT (1.5s)      │─── HTTP GET ───▶│  /api/monitoring/log-iot        │
│  3. Polling Status Kamera (1.5s)│─── HTTP GET ───▶│  /api/hardware/kamera           │
│  4. Polling Status Sensor (1.5s)│─── HTTP GET ───▶│  /api/hardware/sensor           │
│  5. Polling Analitik RS (2.0s)  │─── HTTP GET ───▶│  /api/analitik/dashboard        │
│                                 │                 │                                 │
│  6. Resolusi Anomali Lapangan   │─── HTTP PUT ───▶│  /api/monitoring/log-iot/{id}/..│
│  7. Simulasi OCR Deteksi Plat   │─── HTTP POST ──▶│  /api/deteksi/masuk | /keluar   │
│  8. Ekspor Berkas Sah (Blob)    │─── HTTP GET ───▶│  /api/laporan/excel | /pdf      │
└─────────────────────────────────┘                 └─────────────────────────────────┘
```

---

## 2. Katalog Endpoint REST API yang Digunakan Frontend-Web

Berikut adalah pemetaan lengkap endpoint backend yang diintegrasikan pada antarmuka *frontend-web*:

| No | Modul / Halaman | HTTP Method & Endpoint URL | Tipe Data Payload / Respon | Fungsi Integrasi Antarmuka |
| :---: | :--- | :--- | :--- | :--- |
| **1** | Autentikasi | `POST /api/auth/login` | Body: `{ username, password }`<br>Respon: `{ role, token, nama }` | Validasi login petugas lapangan & manajer RS |
| **2** | Autentikasi | `POST /api/auth/register` | Body: `UserDto`<br>Respon: User terdaftar | Registrasi akun baru petugas operasional |
| **3** | Autentikasi | `POST /api/auth/reset-password` | Body: `{ username, newPassword }` | Pemulihan kata sandi pengguna |
| **4** | Dashboard Lapangan | `GET /api/monitoring/slots` | Respon: `List<SlotParkir>` | Mengambil status fisik terkini 96 slot parkir |
| **5** | Dashboard Lapangan | `GET /api/hardware/kamera` | Respon: `List<KameraAnpr>` | Mengambil status online/offline 4 kamera ANPR |
| **6** | Dashboard Lapangan | `GET /api/hardware/sensor` | Respon: `List<SensorIoT>` | Mengambil status online/offline 96 sensor ultrasonik |
| **7** | Dashboard & Anomali | `GET /api/monitoring/log-iot` | Respon: `List<LogOperasionalIoT>` | Mengambil feed riwayat log anomali IoT real-time |
| **8** | Anomaly Logs | `PUT /api/monitoring/log-iot/{id}/resolusi` | Body: `ResolusiAnomaliRequestDto`<br>`{ jenisAnomali, catatanTambahan }` | Mengirim validasi jenis anomali dan penutupan insiden |
| **9** | Gate Live Feed | `POST /api/deteksi/masuk` | Body: FormData `{ platNomor, jenis }`<br>Respon: `HasilDeteksiMasukDto` | Menjalankan OCR masuk dan rute slot A* terdekat |
| **10** | Gate Live Feed | `POST /api/deteksi/keluar` | Body: FormData `{ platNomor }`<br>Respon: `HasilDeteksiKeluarDto` | Menghitung tarif parkir dan validasi pembayaran |
| **11** | Dashboard Manajemen | `GET /api/analitik/dashboard` | Respon: `DataDashboardDto` | Mengambil metrik KPI pendapatan, kendaraan, & CO2 |
| **12** | Pusat Laporan | `GET /api/laporan/excel` | Query: `?jenis=...&tglMulai=...&tglAkhir=...`<br>Respon: Binary Stream (`.xlsx`) | Mengunduh berkas laporan spreadsheet Excel resmi |
| **13** | Pusat Laporan | `GET /api/laporan/pdf` | Query: `?jenis=...&tglMulai=...&tglAkhir=...`<br>Respon: Binary Stream (`.pdf`) | Mengunduh berkas dokumen laporan resmi bertanda tangan |
| **14** | Pusat Laporan | `GET /api/laporan/audit` | Respon: `List<LogAuditLaporan>` | Menampilkan rekam jejak audit ekspor laporan |

---

## 3. Strategi Polling Data & Pengukuran Latensi Jaringan

### A. Pencegahan Cache Usang (*Stale Cache Prevention*)
Pada [DashboardPage.jsx](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/src/pages/DashboardPage.jsx#L54), pemanggilan data slot menggunakan opsi `{ cache: 'no-store' }`:

```javascript
const [slotsRes, kameraRes, sensorRes, logsRes] = await Promise.all([
  fetch(`${API_BASE}/api/monitoring/slots`, { cache: 'no-store' }),
  fetch(`${API_BASE}/api/hardware/kamera`, { cache: 'no-store' }),
  fetch(`${API_BASE}/api/hardware/sensor`, { cache: 'no-store' }),
  fetch(`${API_BASE}/api/monitoring/log-iot`, { cache: 'no-store' }),
]);
```

Hal ini menjamin peramban tidak menyajikan respon dari memory cache lokal ketika sensor IoT di lapangan baru saja mendeteksi mobil yang parkir.

### B. Pengukuran Latensi Jaringan Nyata (*Network Latency Ping*)
Pada [DashboardManagementPage.jsx](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/src/pages/DashboardManagementPage.jsx#L34-L51), antarmuka secara aktif mengukur kecepatan koneksi:

```javascript
const fetchDashboardData = () => {
  const startTime = performance.now();
  fetch('http://localhost:8081/api/analitik/dashboard')
    .then(res => {
      // Menghitung selisih waktu dari sebelum fetch hingga respon tiba
      const ping = Math.round(performance.now() - startTime);
      setNetworkPing(ping);
      return res.json();
    })
    .then(res => {
      setData(res);
      setIsLoading(false);
    })
    .catch(err => {
      setNetworkPing(999); // Indikator koneksi terputus
      setIsLoading(false);
    });
};
```

Nilai ping ini diproyeksikan pada antarmuka manajemen dengan indikator warna:
- `< 100 ms`: Hijau terang (*Excellent / Optimal*)
- `100 - 300 ms`: Kuning amber (*Good / Normal*)
- `> 300 ms`: Merah (*High Latency / Warning*)

---

## 4. Penanganan Aliran Data Biner (*Blob Streaming*) untuk Dokumen Ekspor

Pada saat mengunduh laporan Excel atau PDF di [ReportsPage.jsx](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-web/src/pages/ReportsPage.jsx), respon backend berupa byte array biner. Frontend-Web menanganinya dengan teknik *Synthetic Blob Anchor Download*:

```javascript
const downloadLaporan = async (format) => {
  try {
    setIsDownloading(true);
    const url = `http://localhost:8081/api/laporan/${format}?jenis=${jenisLaporan}&tglMulai=${tglMulai}&tglAkhir=${tglAkhir}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error("Gagal mengunduh dokumen laporan");

    // 1. Baca aliran biner sebagai Blob
    const blob = await response.blob();
    
    // 2. Buat URL objek virtual sementara di memori peramban
    const downloadUrl = window.URL.createObjectURL(blob);
    
    // 3. Buat elemen anchor <a> buatan secara dinamis
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `Laporan_SPCT_${jenisLaporan}_${tglAkhir}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
    document.body.appendChild(link);
    
    // 4. Picu event klik unduh secara programatik
    link.click();
    
    // 5. Bersihkan elemen dan bebaskan memori objek URL
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  } catch (err) {
    console.error(err);
  } finally {
    setIsDownloading(false);
  }
};
```

### Mengapa Pendekatan Ini Digunakan?
- Menghindari pembukaan tab kosong (`window.open`) yang sering diblokir oleh fitur *Pop-up Blocker* bawaan peramban.
- Memungkinkan penambahan header otentikasi Bearer Token (jika diaktifkan) secara aman di masa depan.
- Menjamin pembebasan alokasi memori klien dengan `revokeObjectURL()`.

---

## 5. Ketahanan Sistem & Penanganan Kegagalan (*Fault Tolerance*)

Aplikasi dirancang agar tidak mengalami *crash* (*white screen of death*) ketika backend mengalami kendala:
1. **Fallback Nilai Kosong**: Seluruh rendering daftar array dilengkapi operator fallback (`slots || []`, `kameraList || []`).
2. **Koneksi Terputus Tanpa Macet**: Jika backend sedang di-restart, fungsi `catch` pada interval polling menangkap error dengan senyap (*silent failure*) sehingga antarmuka tetap interaktif dan otomatis pulih segera setelah backend online kembali.
