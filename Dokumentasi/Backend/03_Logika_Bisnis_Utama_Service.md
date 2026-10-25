# 03. Bedah Logika Bisnis Utama Layer Service (Source Code & Algoritma)

Dokumentasi ini merupakan panduan teknis mendalam mengenai implementasi logika bisnis, algoritma heuristik, kalkulasi tarif, telemetri IoT, dan pengolahan laporan pada layer **Service** (`com.spct.service`). Setiap logika dilengkapi penjelasan alur, potongan baris kode (*code snippet*), dan referensi nomor baris pada berkas sumber Java aslinya.

---

## Daftar Isi Service
1. [AlokasiRuteService.java — Algoritma Penentuan Slot & Pencarian Rute](#1-alokasiruteservicejava--algoritma-penentuan-slot--pencarian-rute)
2. [DeteksiPlatService.java — Orkestrasi Gerbang Masuk & Keluar](#2-deteksiplatservicejava--orkestrasi-gerbang-masuk--keluar)
3. [TransaksiPembayaranService.java — Single Source of Truth Tarif & Pelepasan Slot](#3-transaksipembayaranservicejava--single-source-of-truth-tarif--pelepasan-slot)
4. [AnalitikLaporanService.java — Agregasi Metrik & Eco-Metrics CO2 Empiris](#4-analitiklaporanservicejava--agregasi-metrik--eco-metrics-co2-empiris)
5. [MonitoringFisikService.java — Telemetri Sensor IoT & Deteksi Anomali](#5-monitoringfisikservicejava--telemetri-sensor-iot--deteksi-anomali)
6. [DataRetentionService.java — Kebijakan Retensi Data 3-Tier & Cron Purge](#6-dataretentionservicejava--kebijakan-retensi-data-3-tier--cron-purge)
7. [LaporanService.java — Orkestrasi Laporan 4-Kategori & Validasi Parameter](#7-laporanservicejava--orkestrasi-laporan-4-kategori--validasi-parameter)
8. [LaporanExcelService.java — Pembangkit Spreadsheet Resmi Apache POI](#8-laporanexcelservicejava--pembangkit-spreadsheet-resmi-apache-poi)
9. [LaporanPdfService.java — Pembangkit Dokumen Resmi PDF iText 7](#9-laporanpdfservicejava--pembangkit-dokumen-resmi-pdf-itext-7)

---

## 1. AlokasiRuteService.java — Algoritma Penentuan Slot & Pencarian Rute

Berkas: [`backend-spring/src/main/java/com/spct/service/AlokasiRuteService.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/AlokasiRuteService.java)

### 1.1. Inisialisasi Topologi Denah Graf Siku-Siku
Denah parkir SPCT dimodelkan sebagai graf matematika statis berbobot seragam. Koridor jalan utama berada pada sumbu horizontal `Y = 50.0`, sedangkan kantong slot parkir tersusun di sisi utara (`Y = 30.0`) dan sisi selatan (`Y = 70.0`).

Referensi: [AlokasiRuteService.java:L55-L93](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/AlokasiRuteService.java#L55-L93)
```java
static {
    // 1. Inisialisasi Node Jalan (Koridor Utama di Y = 50)
    GRAPH_NODES.put("Gate-A", new GraphNodeData("Gate-A", 0, 50, false));
    for (int i = 1; i <= 8; i++) {
        GRAPH_NODES.put("N-" + i, new GraphNodeData("N-" + i, 20.0 * i, 50, false));
    }

    // 2. Inisialisasi Node Slot untuk setiap zona (Mobil: B1..B3, Motor: M1..M3)
    for (int lantai = 1; lantai <= JUMLAH_LANTAI; lantai++) {
        for (String prefix : new String[] {"B", "M"}) {
            String zona = prefix + lantai;
            for (int i = 1; i <= 16; i++) {
                int col = (i + 1) / 2; // Menentukan kolom jalan di depannya
                double x = 20.0 * col;
                double y = (i % 2 != 0) ? 30.0 : 70.0;
                String slotNodeId = "NODE_" + zona + "_" + i;
                GRAPH_NODES.put(slotNodeId, new GraphNodeData(slotNodeId, x, y, true));

                // Hubungkan Slot ke Node Jalan di depannya secara langsung
                String pathNodeId = "N-" + col;
                tambahEdge(pathNodeId, slotNodeId);
            }
        }
    }

    // 3. Hubungkan antar Node Jalan secara berurutan (Gate -> N1 -> N2 dst)
    tambahEdge("Gate-A", "N-1");
    for (int i = 1; i < 8; i++) {
        tambahEdge("N-" + i, "N-" + (i + 1));
    }
}
```

### 1.2. Logika Pemilihan Slot Multi-Lantai Terurut
Sistem mencari slot parkir kosong yang sesuai dengan jenis kendaraan (`MOBIL` atau `MOTOR`), dimulai dari lantai paling bawah (Lantai 1) hingga Lantai 3:

Referensi: [AlokasiRuteService.java:L103-L114](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/AlokasiRuteService.java#L103-L114)
```java
Set<String> setNodeSlotKosong = new HashSet<>();
Map<String, SlotParkir> mapSlotKosong = new HashMap<>();
for (int lantai = 1; lantai <= JUMLAH_LANTAI && setNodeSlotKosong.isEmpty(); lantai++) {
    List<SlotParkir> slotKosongList = slotParkirRepository
        .findByStatusSlotAndLantaiAndJenisKendaraanOrderByKoordinatXAsc(StatusSlot.KOSONG, lantai, jenisKendaraan);
    for (SlotParkir slot : slotKosongList) {
        setNodeSlotKosong.add(slot.getNodeId());
        mapSlotKosong.put(slot.getNodeId(), slot);
    }
}
```

### 1.3. Penelusuran Jalur Terpendek (BFS Traversal)
Karena bobot jarak antar-grid seragam, algoritma penelusuran melebar (*Breadth-First Search* / BFS) menjamin ditemukannya slot kosong terdekat dari gerbang masuk `Gate-A` dengan kompleksitas waktu `O(V + E)`:

Referensi: [AlokasiRuteService.java:L118-L147](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/AlokasiRuteService.java#L118-L147)
```java
String startNode = "Gate-A";
Queue<String> queue = new LinkedList<>();
Map<String, String> peta_asal = new HashMap<>(); // Melacak jejak rute balik
Set<String> dikunjungi = new HashSet<>();

queue.add(startNode);
dikunjungi.add(startNode);
String nodeSlotTerpilih = null;

while (!queue.isEmpty()) {
    String nodeSaatIni = queue.poll();
    
    // Evaluasi: Apakah simpul ini adalah slot kosong di database?
    if (GRAPH_NODES.get(nodeSaatIni).isSlot && setNodeSlotKosong.contains(nodeSaatIni)) {
        nodeSlotTerpilih = nodeSaatIni; // DITEMUKAN SLOT TERDEKAT
        break; // Penjamin keoptimalan BFS
    }
    
    List<String> tetangga = GRAPH_EDGES.getOrDefault(nodeSaatIni, Collections.emptyList());
    for (String t : tetangga) {
        if (!dikunjungi.contains(t)) {
            dikunjungi.add(t);
            peta_asal.put(t, nodeSaatIni); // Catat simpul asal untuk rekonstruksi rute
            queue.add(t);
        }
    }
}
```

### 1.4. Penguncian Slot (*Race Condition Prevention*)
Untuk mencegah dua mobil berebut satu slot secara bersamaan (*race condition*), status slot langsung diubah menjadi `DIPESAN` dalam transaksi atomik database (`@Transactional`):

Referensi: [AlokasiRuteService.java:L187-L193](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/AlokasiRuteService.java#L187-L193)
```java
private void kunciSlotSebagaiDipesan(SlotParkir slot, DataKendaraan kendaraan) {
    slot.setStatusSlot(StatusSlot.DIPESAN);
    slot.setKendaraanAktif(kendaraan);
    slot.setWaktuDipesan(LocalDateTime.now());
    slotParkirRepository.save(slot);
}
```

---

## 2. DeteksiPlatService.java — Orkestrasi Gerbang Masuk & Keluar

Berkas: [`backend-spring/src/main/java/com/spct/service/DeteksiPlatService.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/DeteksiPlatService.java)

### 2.1. Validasi Skor Keyakinan (Confidence Score) OCR Gerbang Masuk
Setiap pembacaan plat oleh microservice Python YOLOv11/PaddleOCR wajib menyertakan nilai confidence. Ambang batas minimum ditetapkan sebesar 70% (`0.70`):

Referensi: [DeteksiPlatService.java:L28, L64-L77](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/DeteksiPlatService.java#L28-L77)
```java
private static final double CONFIDENCE_THRESHOLD = 0.70;

if (confidenceScore < CONFIDENCE_THRESHOLD) {
    return new HasilDeteksiMasukDto(
        "CONFIDENCE_RENDAH",
        platNomor,
        null, null, null, null, null,
        "Confidence OCR terlalu rendah (" + String.format("%.0f", confidenceScore * 100) + "%). Mohon validasi manual oleh petugas."
    );
}
```

### 2.2. Pembuatan Transaksi Masuk Baru
Setelah slot berhasil dialokasikan oleh `AlokasiRuteService`, transaksi baru disimpan dengan status pembayaran `BELUM_LUNAS`:

Referensi: [DeteksiPlatService.java:L100-L105](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/DeteksiPlatService.java#L100-L105)
```java
SlotParkir slotYangDipilih = slotParkirRepository
    .findById(hasilAlokasi.getIdSlotDialokasikan())
    .orElseThrow();

TransaksiParkir transaksiParkir = new TransaksiParkir(kendaraan, slotYangDipilih);
TransaksiParkir transaksiTersimpan = transaksiParkirRepository.save(transaksiParkir);
```

### 2.3. Pemrosesan Gerbang Keluar & Simulasi Durasi Mundur (*Backdated Entry*)
Saat kendaraan berada di gerbang keluar, sistem mencatat waktu keluar riil `LocalDateTime.now()`. Apabila penguji memilih durasi simulasi (misal 65 menit) dari panel Kiosk, waktu masuk transaksi dimundurkan ke masa lalu secara transparan sehingga transaksi keluar tetap tercatat pada waktu saat ini:

Referensi: [DeteksiPlatService.java:L188-L206](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/DeteksiPlatService.java#L188-L206)
```java
LocalDateTime waktuKeluar = LocalDateTime.now(); // Waktu keluar riil adalah saat ini
LocalDateTime waktuMasuk = transaksi.getWaktuMasuk();

long minutes;
if (durasiMenitSimulasi != null && durasiMenitSimulasi > 0) {
    minutes = durasiMenitSimulasi;
    // Memundurkan waktu masuk ke belakang agar transaksi keluar tetap terjadi saat ini (real-time)
    waktuMasuk = waktuKeluar.minusMinutes(minutes);
    transaksi.setWaktuMasuk(waktuMasuk);
} else {
    java.time.Duration duration = java.time.Duration.between(waktuMasuk, waktuKeluar);
    minutes = duration.toMinutes();
}
```

### 2.4. Penanganan Antrean Keluar FIFO
Jika plat nomor tidak terbaca atau pengguna memilih mode antrean otomatis (`"QUEUE"`), gerbang keluar secara otomatis memproses kendaraan terdepan (*First In First Out*) berdasarkan waktu masuk:

Referensi: [DeteksiPlatService.java:L174-L179](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/DeteksiPlatService.java#L174-L179)
```java
if (transaksi == null) {
    transaksi = (jenisKendaraan == null)
        ? transaksiParkirRepository.findFirstByStatusPembayaranOrderByWaktuMasukAsc(StatusPembayaran.BELUM_LUNAS).orElse(null)
        : transaksiParkirRepository.findFirstByStatusPembayaranAndKendaraan_JenisKendaraanOrderByWaktuMasukAsc(
                StatusPembayaran.BELUM_LUNAS, jenisKendaraan).orElse(null);
}
```

---

## 3. TransaksiPembayaranService.java — Single Source of Truth Tarif & Pelepasan Slot

Berkas: [`backend-spring/src/main/java/com/spct/service/TransaksiPembayaranService.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/TransaksiPembayaranService.java)

### 3.1. Mesin Kalkulasi Tarif Parkir Resmi (*Tariff Engine*)
Seluruh perhitungan tarif di backend SPCT dipusatkan pada method `public BigDecimal hitungTarif(int durasiMenit)`. Tidak ada komponen lain yang boleh menulis ulang rumus tarif agar konsistensi laporan finansial terjamin 100%:

Referensi: [TransaksiPembayaranService.java:L133-L162](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/TransaksiPembayaranService.java#L133-L162)
```java
public BigDecimal hitungTarif(int durasiMenit) {
    // Aturan 1: Grace Period (<= 10 Menit) = Rp 0
    if (durasiMenit <= 10) {
        return BigDecimal.ZERO;
    }

    // Konversi menit ke jam (pembulatan ke atas: misal 65 menit = 2 jam)
    int durasiJam = (int) Math.ceil(durasiMenit / 60.0);

    // Aturan 2: Rawat inap (di atas 12 jam) = Rp 10.000 flat
    if (durasiJam > 12) {
        return new BigDecimal("10000");
    }

    // Aturan 3: 8 jam pertama flat Rp 5.000, jam berikutnya Rp 2.000 per jam
    if (durasiJam <= 8) {
        return new BigDecimal("5000");
    } else {
        int sisaJam = durasiJam - 8;
        int totalTarif = 5000 + (sisaJam * 2000);
        return new BigDecimal(String.valueOf(totalTarif));
    }
}
```

### 3.2. Pembebasan Slot Menyeluruh (*Complete Slot Release*)
Ketika transaksi dinyatakan lunas atau bebas biaya (Grace Period), method `bebaskanSlotParkir` membersihkan status, referensi kendaraan aktif, dan timestamp pemesanan secara tuntas:

Referensi: [TransaksiPembayaranService.java:L166-L175](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/TransaksiPembayaranService.java#L166-L175)
```java
public void bebaskanSlotParkir(TransaksiParkir transaksi) {
    SlotParkir slotTerkait = transaksi.getSlotDipilih();
    if (slotTerkait != null) {
        slotTerkait.setStatusSlot(StatusSlot.KOSONG); // Kembalikan status menjadi kosong
        slotTerkait.setKendaraanAktif(null);          // Putuskan relasi kendaraan
        slotTerkait.setWaktuDipesan(null);            // Bersihkan timestamp
        slotParkirRepository.save(slotTerkait);
    }
}
```

---

## 4. AnalitikLaporanService.java — Agregasi Metrik & Eco-Metrics CO2 Empiris

Berkas: [`backend-spring/src/main/java/com/spct/service/AnalitikLaporanService.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/AnalitikLaporanService.java)

### 4.1. Eco-Metrics CO2 Berbasis Data Sensor Empiris
SPCT mengimplementasikan paradigma Green-IoT. Pengurangan emisi CO2 tidak lagi didasarkan pada asumsi statis 5 menit, melainkan dihitung dari total menit riil yang berhasil dihemat oleh pengemudi saat sensor ultrasonik slot mendeteksi kedatangan kendaraan:

Referensi: [AnalitikLaporanService.java:L33, L113-L119](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/AnalitikLaporanService.java#L33-L119)
```java
private static final double EMISI_CO2_GRAM_PER_MENIT = 175.0; // Standar emisi idle kendaraan

// Agregasi jumlah menit dihemat dari kueri SUM(menit_dihemat) di database
Double totalMenitDihemat = transaksiParkirRepository.hitungTotalMenitDihematDariSensor();
if (totalMenitDihemat == null) { totalMenitDihemat = 0.0; }

// Konversi gram ke kilogram: (menit * 175) / 1000
double totalReduksiCo2Kg = Math.round((totalMenitDihemat * EMISI_CO2_GRAM_PER_MENIT / 1000.0) * 100.0) / 100.0;
double persentaseCo2 = Math.min((totalReduksiCo2Kg / 2000.0) * 100.0, 100.0);
```

### 4.2. Penyusunan Data Grafik Okupansi Per Jam
Method `susunGrafikOkupansiPerJam` membagi hari aktif menjadi interval 1 jam (misal 08:00 s.d. 08:59) dan menghitung jumlah kendaraan masuk untuk setiap interval menggunakan kueri SQL indeks:

Referensi: [AnalitikLaporanService.java:L188-L217](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/AnalitikLaporanService.java#L188-L217)
```java
private List<DataOkupansiJamDto> susunGrafikOkupansiPerJam(LocalDateTime awal, LocalDateTime akhir) {
    List<DataOkupansiJamDto> hasilGrafik = new ArrayList<>();
    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:00");

    LocalDateTime jamSaatIni = awal;
    while (!jamSaatIni.isAfter(akhir)) {
        LocalDateTime akhirJamIni = jamSaatIni.plusHours(1).minusSeconds(1);

        Long jumlahMasukJamIni = transaksiParkirRepository
            .countByWaktuMasukBetween(jamSaatIni, akhirJamIni);

        hasilGrafik.add(new DataOkupansiJamDto(
            jamSaatIni.format(formatter),
            jumlahMasukJamIni
        ));

        jamSaatIni = jamSaatIni.plusHours(1);
    }
    return hasilGrafik;
}
```

---

## 5. MonitoringFisikService.java — Telemetri Sensor IoT & Deteksi Anomali

Berkas: [`backend-spring/src/main/java/com/spct/service/MonitoringFisikService.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/MonitoringFisikService.java)

### 5.1. Logika Pemrosesan Percabangan 3 Kondisi
IoT Gateway mengirim status fisik sensor ultrasonik (`TERISI` / `KOSONG`). Service membandingkan status hardware tersebut dengan status yang tercatat di database:

Referensi: [MonitoringFisikService.java:L69-L93](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/MonitoringFisikService.java#L69-L93)
```java
// KONDISI 1: Normal Parkir (Kendaraan yang dipesan tiba)
if (statusDiDatabase == StatusSlot.DIPESAN && "TERISI".equalsIgnoreCase(statusSensorHardware)) {
    prosesKondisiNormalParkir(slotDiDatabase);
}
// KONDISI 2: Normal Keluar (Kendaraan meninggalkan area)
else if (statusDiDatabase == StatusSlot.TERISI && "KOSONG".equalsIgnoreCase(statusSensorHardware)) {
    prosesKondisiNormalKeluar(slotDiDatabase);
}
// KONDISI 3: Anomali Penyerobotan (Slot kosong tiba-tiba terisi tanpa alokasi)
else if (statusDiDatabase == StatusSlot.KOSONG && "TERISI".equalsIgnoreCase(statusSensorHardware)) {
    prosesKondisiAnomali(slotDiDatabase);
}
```

### 5.2. Pencatatan Waktu Tiba Fisik & Kalkulasi Waktu Tempuh Riil
Pada Kondisi 1, sistem mengukur interval detik dari saat kendaraan melewati gerbang masuk hingga roda mobil menyentuh slot parkir:

Referensi: [MonitoringFisikService.java:L120-L131](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/MonitoringFisikService.java#L120-L131)
```java
transaksiAktif.setWaktuTibaSlot(waktuTibaSekarang);

// Hitung selisih waktu tempuh aktual (presisi desimal menit)
long detikTempuh = ChronoUnit.SECONDS.between(transaksiAktif.getWaktuMasuk(), waktuTibaSekarang);
double menitDihemat = detikTempuh / 60.0;
transaksiAktif.setMenitDihemat(menitDihemat);

transaksiParkirRepository.save(transaksiAktif);
```

### 5.3. Penanganan Anomali & Push WebSocket Real-time
Pada Kondisi 3, database sengaja **TIDAK DIUBAH** menjadi TERISI untuk mempertahankan integritas data. Sistem mencatat log berkategori `CRITICAL` dan memancarkan notifikasi darurat ke topik WebSocket `/topic/anomali`:

Referensi: [MonitoringFisikService.java:L176-L194](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/MonitoringFisikService.java#L176-L194)
```java
LogOperasionalIoT log = new LogOperasionalIoT(
    slot,
    JenisKejadian.ANOMALI_PENYEROBOTAN_SLOT,
    TingkatKeparahan.CRITICAL,
    "ANOMALI! Slot " + slot.getIdSlot() + ": status DB=KOSONG tetapi sensor mendeteksi kendaraan. Kemungkinan penyerobotan atau salah parkir."
);
logOperasionalIoTRepository.save(log);

// PUSH WebSocket Darurat ke Dashboard Petugas
kirimAlertAnomalii(slot.getIdSlot(), log.getCatatanDetail());
kirimPembaruanDenah(slot.getIdSlot(), "ANOMALI", TingkatKeparahan.CRITICAL.name());
```

---

## 6. DataRetentionService.java — Kebijakan Retensi Data 3-Tier & Cron Purge

Berkas: [`backend-spring/src/main/java/com/spct/service/DataRetentionService.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/DataRetentionService.java)

### 6.1. Strategi Retensi 3-Tingkat (*3-Tier Retention Strategy*)
1. **Tier 1 (Log IoT Rutin/Normal)**: Disimpan selama 90 hari. Dihapus secara otomatis untuk menjaga performa kueri PostgreSQL.
2. **Tier 2 (Log Anomali & Keamanan)**: Disimpan minimal 365 hari (1 tahun) untuk kebutuhan audit investigasi penyerobotan.
3. **Tier 3 (Transaksi Finansial & Audit Trail)**: Dilindungi secara permanen (*Immutable*) demi kepatuhan regulasi akuntansi keuangan RS.

### 6.2. Eksekusi Scheduled Job Pembersihan Otomatis
Dijalankan setiap hari pukul 02:00 dini hari menggunakan ekspresi cron Spring:

Referensi: [DataRetentionService.java:L50-L76](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/DataRetentionService.java#L50-L76)
```java
@Scheduled(cron = "${spct.retensi.purge-cron:0 0 2 * * ?}")
@Transactional
public void jalankanPembersihanOtomatis() {
    if (!purgeEnabled) return;

    LocalDateTime cutoff = LocalDateTime.now().minusDays(retensiHari); // 90 hari ke belakang
    Long kandidat = logOperasionalIoTRepository.countByWaktuKejadianBeforeAndTingkatKeparahan(cutoff, TingkatKeparahan.INFO);
    
    if (kandidat != null && kandidat > 0) {
        // HANYA menghapus log dengan keparahan INFO (log rutin)
        long terhapus = logOperasionalIoTRepository.deleteByWaktuKejadianBeforeAndTingkatKeparahan(cutoff, TingkatKeparahan.INFO);
        System.out.println("[DATA RETENTION PURGE] SUKSES: Berhasil membersihkan " + terhapus + " log sensor normal.");
    }
}
```

---

## 7. LaporanService.java — Orkestrasi Laporan 4-Kategori & Validasi Parameter

Berkas: [`backend-spring/src/main/java/com/spct/service/LaporanService.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/LaporanService.java)

### 7.1. Validasi Input Batas Rentang Waktu
Sesuai Use Case PK-UC010, tanggal awal tidak boleh melebihi tanggal akhir, tidak boleh berada di masa depan, dan rentang maksimal dibatasi 366 hari:

Referensi: [LaporanService.java:L82-L108](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/LaporanService.java#L82-L108)
```java
private void validasiParameter(LocalDate dari, LocalDate sampai) {
    if (dari == null || sampai == null) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tanggal mulai dan tanggal akhir wajib diisi.");
    }
    if (dari.isAfter(sampai)) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tanggal mulai tidak boleh lebih besar dari tanggal akhir.");
    }
    if (dari.isAfter(LocalDate.now())) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tanggal mulai tidak boleh berada di masa depan.");
    }
    long selisihHari = ChronoUnit.DAYS.between(dari, sampai);
    if (selisihHari > 366) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rentang tanggal maksimal 366 hari (1 tahun).");
    }
}
```

### 7.2. Empat Jenis Modul Laporan
1. **Finansial** ([L113-L185](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/LaporanService.java#L113-L185)): Total omset pendapatan, transaksi lunas, rata-rata durasi, rata-rata tarif, dan tabel rincian transaksi dengan nomor tiket `TKT-xxxxx`.
2. **Operasional & Okupansi** ([L190-L263](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/LaporanService.java#L190-L263)): Volume kendaraan masuk, total log, anomali kritis, kategori validasi anomali, dan status resolusi petugas.
3. **Lingkungan (Eco-Metric)** ([L268-L340](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/LaporanService.java#L268-L340)): Total reduksi emisi CO2 (kg), total menit hemat panduan A*, rata-rata hemat per mobil, dan perbandingan waktu tempuh riil vs estimasi standar 300 detik.
4. **Komprehensif (Master)** ([L345-L385](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/LaporanService.java#L345-L385)): Menggabungkan seluruh data ketiga modul di atas menjadi laporan terpadu multi-sheet (Excel) atau multi-halaman (PDF).

---

## 8. LaporanExcelService.java — Pembangkit Spreadsheet Resmi Apache POI

Berkas: [`backend-spring/src/main/java/com/spct/service/LaporanExcelService.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/LaporanExcelService.java)

- **Library**: `org.apache.poi:poi-ooxml:5.2.5`.
- **Fitur Unggulan**:
  1. *Palette Styling*: Menggunakan palet Slate Navy (`#1E293B`) dan Eco Green (`#16A34A`) ([L34-L39](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/LaporanExcelService.java#L34-L39)).
  2. *Kop Surat Resmi*: Menggabungkan cell header (*merged regions*) berisi identitas instansi rumah sakit dan metadata periode.
  3. *Kartu KPI*: Menghasilkan kotak metrik eksekutif di atas tabel data.
  4. *Zebra-Row Formatting*: Warna baris belang-belang untuk meningkatkan keterbacaan data historis.
  5. *Multi-Tab Comprehensive*: Untuk jenis laporan `komprehensif`, berkas otomatis memuat 3 lembar kerja terpisah (*Sheet* Finansial, Operasional, dan Lingkungan) ([L57-L70](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/LaporanExcelService.java#L57-L70)).

---

## 9. LaporanPdfService.java — Pembangkit Dokumen Resmi PDF iText 7

Berkas: [`backend-spring/src/main/java/com/spct/service/LaporanPdfService.java`](file:///d:/Proyek%20Perangkat%20Lunak/Aplikasi/Desktop/Sistem%20Parkir%20Cerdas%20Terintegrasi%20IoT/backend-spring/src/main/java/com/spct/service/LaporanPdfService.java)

- **Library**: `com.github.librepdf:openpdf:1.3.39` (iText 7 compatible) & `org.jfree:jfreechart:1.5.4`.
- **Fitur Unggulan**:
  1. *Embedded Charts*: Merender grafik distribusi batang JFreeChart secara dinamis ke dalam memori (*BufferedImage*) lalu menyematkannya ke dalam dokumen PDF sebelum tabel rincian.
  2. *Tipografi Hierarki*: Mengatur ukuran font terstruktur (Kop 14pt Bold, Sub 10pt Eco-Green, Tabel 7.5pt-8pt).
  3. *Lembar Pengesahan Resmi*: Memuat blok tanda tangan resmi Manajer Fasilitas & Operasional dan Direktur Keuangan RS di bagian akhir dokumen.
