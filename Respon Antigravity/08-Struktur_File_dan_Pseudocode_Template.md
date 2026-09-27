# Struktur File dan Template Pseudocode SPCT IoT

Gunakan *template* di bawah ini untuk menuliskan draf *pseudocode* atau logika bisnis Anda. Setelah Anda menuliskannya, saya akan bertugas menerjemahkannya ke dalam sintaks Java Spring Boot yang siap pakai dan aman (*production-ready*).

---

## 1. Lapisan Model (Entity / Basis Data)
Lapisan ini merepresentasikan tabel-tabel di *database* PostgreSQL.

### `src/main/java/com/spct/model/DataKendaraan.java`
```text
[TULIS PSEUDOCODE / ATRIBUT DI SINI]
Contoh:
- atribut idKendaraan (Primary Key)
- atribut platNomor
- atribut jenisKendaraan
```

### `src/main/java/com/spct/model/SlotParkir.java`
```text
[TULIS PSEUDOCODE / ATRIBUT DI SINI]

```

### `src/main/java/com/spct/model/TransaksiParkir.java`
```text
[TULIS PSEUDOCODE / ATRIBUT DI SINI]

```

### `src/main/java/com/spct/model/LogOperasionalIoT.java`
```text
[TULIS PSEUDOCODE / ATRIBUT DI SINI]

```

---

## 2. Lapisan Repository (Kueri Database)
Lapisan antarmuka untuk mencari, menyimpan, atau memperbarui data ke *database*.

### `src/main/java/com/spct/repository/SlotParkirRepository.java`
```text
[TULIS PSEUDOCODE FUNGSI PENCARIAN DI SINI]
Contoh:
- fungsi cariSemuaSlotKosongBerdasarkanZona()
```

### `src/main/java/com/spct/repository/TransaksiParkirRepository.java`
```text
[TULIS PSEUDOCODE FUNGSI PENCARIAN DI SINI]

```

---

## 3. Lapisan Service (Logika Bisnis & Algoritma)
Di sinilah otak atau "Control" utama dari aplikasi berjalan.

### `src/main/java/com/spct/service/AlokasiRuteService.java`
*(Diturunkan dari AlokasiRuteController dan DeteksiPlatController pada Diagram)*
```text
[TULIS PSEUDOCODE LOGIKA DI SINI]
Contoh:
FUNGSI cariDanAlokasiSlot(jenisKendaraan, platNomor):
    1. Cari slot = Kueri dari database cari yang "Kosong"
    2. Jika tidak ada, return "Penuh"
    3. Pilih slot pertama
    4. Update status jadi "Dipesan"
    5. Return ID Slot
```

### `src/main/java/com/spct/service/MonitoringFisikService.java`
*(Diturunkan dari MonitoringFisikController pada Diagram)*
```text
[TULIS PSEUDOCODE LOGIKA DI SINI]
Contoh untuk validasi data sensor IoT vs status Database.

```

### `src/main/java/com/spct/service/TransaksiPembayaranService.java`
*(Diturunkan dari TransaksiPembayaranController pada Diagram)*
```text
[TULIS PSEUDOCODE LOGIKA DI SINI]
Contoh untuk kalkulasi durasi dan tagihan saat mobil keluar.

```

### `src/main/java/com/spct/service/AnalitikLaporanService.java`
*(Diturunkan dari AnalitikLaporanController pada Diagram)*
```text
[TULIS PSEUDOCODE LOGIKA DI SINI]
Contoh untuk menghitung Total Pendapatan dan Emisi CO2.

```

---

## 4. Lapisan Controller (API Endpoint / Boundary)
Lapisan ini menerima *request* dari luar (Python YOLO, MQTT, atau Frontend) dan mengembalikannya dalam bentuk JSON.

### `src/main/java/com/spct/controller/TerminalMasukController.java`
```text
[TULIS PSEUDOCODE ENDPOINT DI SINI]
Contoh:
ENDPOINT POST "/api/masuk":
    - Terima JSON {platNomor, jenisKendaraan}
    - Panggil AlokasiRuteService
    - Kembalikan JSON {slotTujuan, rute}
```

### `src/main/java/com/spct/controller/GatewayIoTController.java`
```text
[TULIS PSEUDOCODE ENDPOINT DI SINI]
(Untuk menerima webhook atau koneksi dari sensor MQTT)

```

### `src/main/java/com/spct/controller/TerminalKeluarController.java`
```text
[TULIS PSEUDOCODE ENDPOINT DI SINI]

```

---
*Silakan isi blok `[TULIS PSEUDOCODE ...]` di atas menggunakan bahasa Anda sendiri. Berikan instruksi jika Anda sudah selesai mengisinya, dan saya akan langsung mengubahnya menjadi kode Java siap kompilasi!*
