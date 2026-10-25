# Modul 04: Integrasi Hardware Kiosk, Kamera CCTV ANPR, dan Sensor Ultrasonik
**Sistem Parkir Cerdas Terintegrasi IoT (SPCT IoT) — Frontend-Kiosk**

Modul ini mendokumentasikan pemetaan integrasi antara komponen antarmuka kios dengan perangkat keras fisik di lapangan: 4 kamera CCTV ANPR, palang otomatis *barrier gate*, 96 sensor ultrasonik *overhead*, serta gateway kalkulasi tarif resmi.

---

## 1. Arsitektur Fisik Gerbang & Sensor IoT

Terminal Kiosk bertindak sebagai antarmuka komputasi tepi (*Edge Terminal Interface*) yang berinteraksi langsung dengan sensor dan aktuator gerbang:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        INFRASTRUKTUR FISIK GERBANG                     │
├────────────────────────────────────────────────────────────────────────┤
│ 1. GERBANG MASUK (ENTRY GATE):                                         │
│    ├── Kamera ANPR: GATE_IN_01 (Mobil) & GATE_IN_02 (Motor)            │
│    ├── Terminal Kiosk Touchscreen (Aplikasi Frontend-Kiosk)            │
│    └── Palang Barrier Masuk (Membuka setelah slot rute dialokasikan)   │
├────────────────────────────────────────────────────────────────────────┤
│ 2. AREA BASEMENT (PARKING BAYS):                                       │
│    ├── 96 Node Sensor Ultrasonik Overhead (Lantai 1-3)                 │
│    └── Lampu Indikator RGB (Hijau = Kosong, Merah = Terisi/Anomali)    │
├────────────────────────────────────────────────────────────────────────┤
│ 3. GERBANG KELUAR (EXIT GATE & PAYMENT):                               │
│    ├── Kamera ANPR: PG_EXIT_01 (Mobil) & PG_EXIT_02 (Motor)            │
│    ├── Terminal Kiosk Keluar (Reader Tap e-Toll / QRIS)                │
│    └── Palang Barrier Keluar (Membuka setelah transaksi berstatus LUNAS│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Pemetaan Endpoint Khusus Terminal Kiosk

Seluruh komunikasi terminal kios diarahkan melalui reverse proxy Vite `/api/*` menuju backend Spring Boot:

| HTTP Method & Endpoint | File Pemuat di Kiosk | Parameter / Body Payload | Respon Data Backend & Aksi Hardware |
| :--- | :--- | :--- | :--- |
| `POST /api/gate/masuk` | [ScanPage.jsx](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-kiosk/src/pages/ScanPage.jsx) | `?platNomor=...`<br>`&jenisKendaraan=...`<br>`&confidence=1.0` | Menghasilkan `HasilDeteksiMasukDto` (tiket parkir, slot tujuan, & rute A*). Palang masuk terangkat. |
| `GET /api/gate/antrean-keluar` | [ExitScanPage.jsx](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-kiosk/src/pages/ExitScanPage.jsx) | `?jenisKendaraan=MOBIL/MOTOR` | Menampilkan antrean kendaraan aktif yang sedang terparkir di basement (FIFO Queue). |
| `POST /api/gate/keluar` | [ExitScanPage.jsx](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-kiosk/src/pages/ExitScanPage.jsx) | Body JSON:<br>`{ platNomor, jenisKendaraan, saldoEwallet, durasiMenit }` | Menghitung tarif resmi, memotong saldo, menerbitkan status `LUNAS`, dan membebaskan slot kembali ke `KOSONG`. Palang keluar terangkat. |
| `GET /api/monitoring/slots` | [NavigationPage.jsx](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-kiosk/src/pages/NavigationPage.jsx) | Tanpa parameter | Polling real-time 1.5s untuk mendeteksi kapan mobil telah tiba di slot target (`statusSlot === 'TERISI'`). |
| `POST /api/monitoring/webhook` | [NavigationPage.jsx](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-kiosk/src/pages/NavigationPage.jsx) | `?idSlot=B1-04`<br>`&statusSensor=TERISI` | Endpoint simulasi webhook hardware untuk memicu kedatangan kendaraan tanpa perangkat fisik. |

---

## 3. Penegakan Logika Bisnis Tarif di Gerbang Keluar

> [!IMPORTANT]
> **Prinsip Single Source of Truth**:  
> Terminal kios **dilarang keras menghitung nominal tarif secara hardcode di antarmuka klien**. Seluruh perhitungan biaya parkir diserahkan mutlak kepada backend Java pada kelas `TransaksiPembayaranService`.

### Alur Eksekusi Perhitungan Tarif:
1. Terminal Kios mengirimkan data identitas kendaraan beserta durasi waktu tinggal pengemudi (atau durasi simulasi pengujian).
2. Backend mengevaluasi aturan tarif resmi Surat Keputusan (SK) Rumah Sakit:
   - **Tingkat 1 (Grace Period)**: Durasi ≤ 10 menit ➔ Biaya **Rp 0** (Bebas Biaya / *Free Drop-Off*).
   - **Tingkat 2 (Tarif Flat Normal)**: Durasi 11 menit s.d. 8 jam ➔ Biaya flat **Rp 5.000**.
   - **Tingkat 3 (Jam Tambahan)**: Jam ke-9 s.d. jam ke-12 ➔ Biaya flat Rp 5.000 + **Rp 2.000 per jam tambahan**.
   - **Tingkat 4 (Tarif Rawat Inap)**: Durasi > 12 jam (maksimal 24 jam) ➔ Dibatasi biaya maksimal **Rp 10.000**.
3. Jika saldo e-wallet yang dikirimkan mencukupi:
   - Backend merespon status HTTP 200 dengan status `LUNAS`.
   - Palang barrier terbuka dan slot parkir fisik otomatis dibebaskan kembali menjadi `KOSONG`.
4. Jika saldo e-wallet kurang dari total tagihan:
   - Backend merespon status **HTTP 402 (Payment Required)** dengan status `SALDO_KURANG`.
   - Kios beralih ke layar [ExitFailedPage.jsx](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-kiosk/src/pages/ExitFailedPage.jsx), palang barrier tetap tertutup demi keamanan, dan pengemudi diarahkan melakukan pembayaran tunai pada petugas pos keluar.

---

## 4. Simulasi Telemetri Sensor Ultrasonik Fisik (*Webhook Trigger*)

Pada [NavigationPage.jsx](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-kiosk/src/pages/NavigationPage.jsx#L67-L76), disediakan tombol interaktif untuk menguji integrasi sensor IoT:

```javascript
const triggerWebhookDirectly = async () => {
  try {
    await fetch(`/api/monitoring/webhook?idSlot=${encodeURIComponent(targetSlot)}&statusSensor=TERISI`, {
      method: 'POST'
    });
    setIsParked(true); // Memperbarui state UI secara instan
  } catch (e) {
    console.error("Gagal trigger webhook langsung:", e);
  }
};
```

Saat tombol ini ditekan, server Spring Boot akan:
1. Memperbarui status slot dari `DIPESAN` menjadi `TERISI` di basis data PostgreSQL.
2. Mencatat waktu tiba aktual kendaraan (`waktuTiba`).
3. Menghitung durasi tempuh nyata pengemudi dibandingkan waktu standar normal tanpa navigasi.
4. Menghitung selisih waktu dihemat (menit) dan estimasi reduksi emisi gas buang CO2 (gram) yang langsung tersaji di dasbor manajemen web.
