# Modul 03: Bedah Alur Kerja Gerbang Masuk dan Gerbang Keluar
**Sistem Parkir Cerdas Terintegrasi IoT (SPCT IoT) — Frontend-Kiosk**

Modul ini membedah secara mendalam siklus hidup dua alur operasional utama terminal kios: **Alur Gerbang Masuk (*Entry Gate Flow*)** yang memandu pengemudi menuju slot menggunakan algoritma A*, dan **Alur Gerbang Keluar (*Exit Gate Flow*)** yang memproses antrean kendaraan dan transaksi pembayaran elektronik otomatis.

---

## 1. Alur Gerbang Masuk (*Entry Gate Flow*)

Alur gerbang masuk dirancang untuk memberikan pengalaman tanpa hambatan (*frictionless drive-thru*) dalam waktu kurang dari 3 detik:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ALUR GERBANG MASUK (ENTRY)                      │
├────────────────────────────────────────────────────────────────────────┤
│ 1. [ ScanPage ]                                                        │
│    - Kamera ANPR menangkap plat nomor pengemudi                        │
│    - Pengemudi menekan tombol simulasi / sistem otomatis trigger       │
│    - Panggil POST /api/gate/masuk                                      │
│                           │                                            │
│                           ▼                                            │
│ 2. [ AllocatingSlotPage ]                                              │
│    - Animasi radar pencarian rute terdekat                             │
│    - Algoritma A* menghitung slot kosong optimal & titik belok rute    │
│                           │                                            │
│                           ▼                                            │
│ 3. [ NavigationPage ]                                                  │
│    - Peta vektor basement menampilkan garis polyline rute A*           │
│    - Slot target berkedip cyan (Status: DIPESAN)                       │
│    - Stopwatch waktu tempuh berjalan (MM:SS)                           │
│    - Polling sensor ultrasonik: saat mobil tiba, status -> TERISI      │
└────────────────────────────────────────────────────────────────────────┘
```

---

### A. Layar Pemindaian Kamera: [ScanPage.jsx](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-kiosk/src/pages/ScanPage.jsx)

- **Identifikasi Kamera Aktif**:
  - Untuk Mobil: Terhubung dengan kamera `GATE_IN_01_LIVE` (Gerbang Barat).
  - Untuk Motor: Terhubung dengan kamera `GATE_IN_02_LIVE` (Gerbang Timur).
- **Generator Plat Acak & Kustom**:
  - Menyediakan plat simulasi acak berformat `B [1000-9999] SPCT` atau input plat kustom untuk pengujian skenario khusus.
- **Panggilan API Backend**:
  ```javascript
  const response = await fetch(`/api/gate/masuk?platNomor=${encodeURIComponent(activePlate)}&jenisKendaraan=${jenis}&confidence=1.0`, {
    method: 'POST',
  });
  const data = await response.json();
  ```
- **Penerusan Parameter**:
  - Mengirimkan `slotDialokasikan` (misal: `B1-04`) dan `jalurRuteGraf` (kumpulan titik koordinat jalur rute dari algoritma A*) ke halaman alokasi rute.

---

### B. Layar Animasi Komputasi: [AllocatingSlotPage.jsx](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-kiosk/src/pages/AllocatingSlotPage.jsx)

- **Fungsi Visual**: Memberikan umpan balik visual animasi radar pemindai berputar (*spinning radar sweep*) selama backend memproses kalkulasi rute terdekat.
- **Transisi Cepat**: Dikonfigurasi dengan timer transisi 1.2 detik sebelum mengarahkan pengemudi ke layar navigasi interaktif.

---

### C. Peta Panduan Spasial Interaktif: [NavigationPage.jsx](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-kiosk/src/pages/NavigationPage.jsx)

Merupakan puncak fitur inovasi pemanduan rute cerdas pada SPCT IoT:

1. **Stopwatch Waktu Tempuh Riil (*Real-Time Trip Timer*)**:
   - Menghitung durasi detik perjalanan pengemudi sejak melewati gerbang hingga tiba di slot. Nilai ini menjadi data dasar kalkulasi reduksi emisi CO2 di modul analitik rumah sakit.
2. **Visualisasi Vektor Jalur Rute A***:
   - Mengambil array titik rute `TitikRuteDto {id, x, y}` dari backend dan menggambarnya sebagai garis panduan tebal (*vector polyline path*) di atas denah basement.
3. **Deteksi Kedatangan Otomatis via Polling Sensor**:
   ```javascript
   // NavigationPage.jsx: Polling status slot setiap 1.5 detik
   const checkSlotStatus = async () => {
     const res = await fetch('/api/monitoring/slots');
     if (res.ok) {
       const slots = await res.json();
       const target = slots.find(s => s.idSlot === targetSlot);
       if (target && target.statusSlot === 'TERISI') {
         setIsParked(true); // Sensor ultrasonik mendeteksi mobil terparkir
       }
     }
   };
   ```
4. **Alat Pengujian Simulasi Webhook Hardware**:
   - Menyediakan tombol *"Simulasikan Tembakan Webhook Sensor (TERISI)"* yang memicu endpoint `/api/monitoring/webhook?idSlot=...&statusSensor=TERISI` sehingga dosen/penguji dapat menguji transisi sensor fisik secara langsung tanpa alat fisik.

---

## 2. Alur Gerbang Keluar & Pembayaran (*Exit Gate Flow*)

Alur gerbang keluar bertindak sebagai mesin kasir elektronik otomatis yang memvalidasi masa parkir, menghitung tarif sesuai SK resmi, dan membuka palang gerbang secara instan:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ALUR GERBANG KELUAR (EXIT)                      │
├────────────────────────────────────────────────────────────────────────┤
│ 1. [ ExitScanPage ]                                                    │
│    - Polling antrean kendaraan parkir di basement (FIFO Queue)         │
│    - Panel simulasi saldo e-wallet & durasi parkir                     │
│    - Panggil POST /api/gate/keluar                                     │
│                           │                                            │
│            ┌──────────────┴──────────────┐                             │
│            ▼ (Jika Saldo Cukup / Gratis) ▼ (Jika Saldo Kurang)         │
│ 2A. [ ExitSuccessPage ]                  2B. [ ExitFailedPage ]        │
│    - Status LUNAS (Hijau)                - Status GAGAL BAYAR (Merah)  │
│    - Palang Barrier Terbuka              - Palang Tetap Tertutup       │
│    - Slot di Backend Otomatis KOSONG     - Opsi Bantuan Pos Keluar     │
│    - Auto-Redirect Standby 10 Detik                                    │
└────────────────────────────────────────────────────────────────────────┘
```

---

### A. Layar Identifikasi Kendaraan Keluar: [ExitScanPage.jsx](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-kiosk/src/pages/ExitScanPage.jsx)

- **Manajemen Antrean Kendaraan Riil (*FIFO Queue*)**:
  - Kios memanggil endpoint `/api/gate/antrean-keluar?jenisKendaraan=...` setiap 2 detik.
  - Menampilkan kartu identitas kendaraan yang berada di antrean paling depan yang siap melakukan tap pembayaran keluar.
- **Eksekusi Transaksi Pembayaran**:
  ```javascript
  const response = await fetch('/api/gate/keluar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      platNomor: platKeluar,
      jenisKendaraan: jenis,
      saldoEwallet: Number(saldo),
      durasiMenit: Number(durasiSimulasi)
    })
  });
  ```

---

### B. Layar Pembayaran Lunas: [ExitSuccessPage.jsx](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-kiosk/src/pages/ExitSuccessPage.jsx)

- **Pemberitahuan Kelulusan Transaksi**:
  - Menampilkan judul raksasa hijau `LUNAS - SILAKAN JALAN`.
  - Menampilkan rincian biaya: Jika durasi ≤ 10 menit, menampilkan label transparan *"Bebas Biaya (Grace Period ≤ 10 Menit)"*. Jika berbayar, menampilkan nominal tarif yang terpotong.
- **Otomasi Pembebasan Slot Fisik**:
  - Di backend, saat transaksi ini sukses, slot parkir yang sebelumnya ditempati kendaraan langsung bertransisi kembali ke status `KOSONG` dan kapasitas bertambah seketika di dashboard web.
- **Siklus Reset Otomatis**:
  - Mengatur timer hitung mundur 10 detik yang secara otomatis mengembalikan terminal ke posisi *standby* siap menyambut kendaraan berikutnya.

---

### C. Layar Penanganan Kendala: [ExitFailedPage.jsx](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-kiosk/src/pages/ExitFailedPage.jsx)

- **Respon HTTP 402 (Payment Required)**:
  - Aktif ketika saldo e-wallet yang dikirimkan pengemudi lebih kecil dari tagihan tarif parkir.
- **Panduan Pengemudi**:
  - Menampilkan rincian tagihan vs saldo kartu, serta petunjuk untuk melakukan pembayaran tunai pada pos petugas gerbang keluar atau menekan tombol interkom bantuan.
