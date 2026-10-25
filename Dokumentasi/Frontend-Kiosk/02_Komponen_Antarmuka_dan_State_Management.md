# Modul 02: Komponen Antarmuka Terminal Kiosk, Komponen Pembantu, dan Desain High-Contrast
**Sistem Parkir Cerdas Terintegrasi IoT (SPCT IoT) — Frontend-Kiosk**

Modul ini mendokumentasikan filosofi desain antarmuka luar ruangan (*Outdoor Drive-Thru Terminal*), komponen-komponen pembantu modular, panel simulasi pembayaran e-wallet, serta teknik animasi pemindai laser.

---

## 1. Filosofi Desain Antarmuka *Drive-Thru*

Antarmuka kios dirancang khusus untuk memenuhi standar ergonomi pengemudi yang berinteraksi dari dalam kendaraan (*in-cabin driver experience*):

```
┌────────────────────────────────────────────────────────────────────────┐
│ TOP STATUS BAR:                                                        │
│ [ ● System Ready ]               [ Mobil | Motor ] [ Switch to Exit ]  │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│                    ┌────────────────────────────┐                      │
│                    │ ┌                        ┐ │                      │
│                    │    CAMERA ANPR SCANNER     │                      │
│                    │ ─── LASER SCAN LINE ────── │                      │
│                    │ └                        ┘ │                      │
│                    └────────────────────────────┘                      │
│                                                                        │
│                      NOMOR PLAT TERDETEKSI:                            │
│                 ┌─────────────────────────────────┐                    │
│                 │          B 1234 SPCT            │                    │
│                 └─────────────────────────────────┘                    │
│                                                                        │
│           [ 🚗 SIMULASIKAN KENDARAAN TIBA DI GERBANG ]                 │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### Prinsip Ergonomi Visual yang Diterapkan:
1. **Latar Belakang Gelap Total (*Pure Dark Canvas `#050B14`*)**:
   - Menghilangkan refleksi silau cahaya matahari pada layar sentuh kios di siang hari dan tidak menyilaukan mata pengemudi di malam hari.
2. **Reticle Target Pemindai (*Optical Scanner Reticle*)**:
   - Empat sudut bingkai bercahaya biru elektrik (`border-sky-400`) memberikan indikasi visual area fokus kamera ANPR.
   - Garis laser horizontal beranimasi berdenyut (`animate-[pulse_1s_ease-in-out_infinite]`) mensimulasikan proses optical character recognition aktif.
3. **Penyajian Plat Skala Besar (*Huge Typography Plate Box*)**:
   - Nomor plat ditampilkan di dalam kotak berukuran font `text-3xl` hingga `text-5xl` dengan jarak spasi karakter lebar (`tracking-[0.2em]`) sehingga terbaca jelas dari jarak 2 meter.

---

## 2. Bedah Komponen Modular

### A. Pengalih Jalur Fisik: [JenisKendaraanToggle.jsx](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-kiosk/src/components/JenisKendaraanToggle.jsx)

Komponen kontrol berbentuk pil ganda yang terletak di header terminal kios:

```jsx
export default function JenisKendaraanToggle({ jenis, onChange }) {
  return (
    <div className="flex bg-[#0B1526]/80 p-1 rounded-full border border-slate-700/50 backdrop-blur-md">
      {/* Tombol Pilihan Mobil */}
      <button
        onClick={() => onChange('MOBIL')}
        className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-['Space_Grotesk'] font-bold transition-all ${
          jenis === 'MOBIL'
            ? 'bg-sky-500 text-white shadow-[0_0_12px_rgba(14,165,233,0.5)]'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <span className="material-symbols-outlined text-[16px]">directions_car</span>
        MOBIL
      </button>

      {/* Tombol Pilihan Motor */}
      <button
        onClick={() => onChange('MOTOR')}
        className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-['Space_Grotesk'] font-bold transition-all ${
          jenis === 'MOTOR'
            ? 'bg-sky-500 text-white shadow-[0_0_12px_rgba(14,165,233,0.5)]'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <span className="material-symbols-outlined text-[16px]">two_wheeler</span>
        MOTOR
      </button>
    </div>
  );
}
```

#### Keunggulan Fungsional:
- Memudahkan penguji/operator memvalidasi alur kamera gerbang mobil (`GATE_IN_01`) dan gerbang motor (`GATE_IN_02`) secara instan.
- Efek pendaran glow `shadow-[0_0_12px_rgba(14,165,233,0.5)]` mempertegas status jalur fisik yang sedang aktif.

---

### B. Panel Pengujian Tarif & Saldo: [PanelSimulasiExit.jsx](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/frontend-kiosk/src/components/PanelSimulasiExit.jsx)

Panel pengujian interaktif yang disematkan pada terminal keluar (`ExitScanPage`) untuk mendemonstrasikan transparansi kalkulasi tarif parkir dan validasi pembayaran e-wallet:

```jsx
// Cuplikan Logika Opsi pada PanelSimulasiExit.jsx:
const OPSIDURASI = [
  { label: '≤ 10 Mnt (Gratis)', menit: 10, ket: 'Grace Period' },
  { label: '60 Mnt (Flat)', menit: 60, ket: 'Tarif Normal' },
  { label: '10 Jam (+Rp 2rb/jam)', menit: 600, ket: 'Jam 9-12' },
  { label: '15 Jam (Rawat Inap)', menit: 900, ket: 'Maks. Rp 10.000' }
];

const OPSISALDO = [
  { label: 'Rp 0 (Habis)', nilai: 0 },
  { label: 'Rp 5.000 (Pas)', nilai: 5000 },
  { label: 'Rp 50.000 (Cukup)', nilai: 50000 },
  { label: 'Rp 100.000 (Lebih)', nilai: 100000 }
];
```

#### Fitur Utama Panel Ini:
1. **Simulasi Berbagai Kasus Waktu Tinggal**:
   - Memungkinkan penguji menguji skenario **Grace Period** (durasi ≤ 10 menit bebas biaya Rp 0).
   - Memungkinkan pengujian skenario **Rawat Inap** (durasi > 12 jam dikenakan tarif maksimal Rp 10.000).
2. **Simulasi Saldo Kartu Kurang (HTTP 402)**:
   - Penguji dapat menyetel saldo ke `Rp 0` untuk mendemonstrasikan transisi layar gagal bayar (`ExitFailedPage`) dan pengalihan ke bantuan petugas pos keluar.
3. **Penyajian Aturan Tarif Resmi RS Panti Rapih**:
   - Menampilkan ringkasan Surat Keputusan (SK) tarif parkir rumah sakit secara transparan di bawah tombol simulasi.

---

## 3. Efek Visual & Animasi Kustom

Pada antarmuka kios, disematkan efek visual untuk memberikan umpan balik taktil saat layar disentuh:

### A. Garis Laser Pemindai (*Scan Line Animation*)
```html
<div className="absolute top-1/3 left-0 w-full h-[2px] bg-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.9)] animate-[pulse_1s_ease-in-out_infinite]"></div>
```
Garis horizontal cyan tipis yang berdenyut cepat di dalam kotak reticle saat proses pemindaian OCR plat sedang berlangsung.

### B. Status Palang Barrier Bergerak
Pada layar sukses keluar, indikator palang gerbang divisualisasikan dengan teks hijau besar `LUNAS - SILAKAN JALAN` disertai ikon centang terisi (`check_circle`) berskala `80px` dengan bayangan ganda (*double text shadow*):
```css
text-shadow: 0 0 15px rgba(46, 139, 87, 0.4), 0 0 40px rgba(46, 139, 87, 0.4);
```
Efek ini merefleksikan pencahayaan LED palang otomatis yang berubah dari merah menjadi hijau di dunia nyata.
