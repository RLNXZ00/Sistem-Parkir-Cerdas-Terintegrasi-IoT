# Alur Kerja dan Use-Case Utama

Secara garis besar, ekosistem SPCT IoT melingkupi siklus penuh perjalanan kendaraan (*End-to-End Workflow*) yang dijabarkan dalam *Use-Case* berikut:

## 1. Proses Kedatangan (Gerbang Masuk)
1. Kendaraan tiba, memicu kamera untuk menangkap gambar (*capture*).
2. **Modul Deteksi Plat (Python/YOLO)** mengekstrak karakter huruf/angka dan mencatat waktu kedatangan.
3. Sistem secara otomatis **Mencari & Mengalokasikan Slot** kosong terdekat berdasarkan zona (Mobil/Motor) dan mencatat plat tersebut sebagai *Reserved* pada slot spesifik.
4. **Layar Terminal** menampilkan nomor slot raksasa beserta rute peta navigasi agar pengendara langsung menuju tujuan tanpa berkeliling.

## 2. Pemantauan Fisik (Dalam Basement)
1. **Sensor IoT** (Ultrasonik/Inframerah) terus menyapu status ada/tidaknya kendaraan di slot.
2. Status fisik (Kosong/Terisi) dikirimkan secara *real-time* ke server.
3. Sistem membandingkan status logika di basis data dengan status fisik:
   - Jika kendaraan yang tepat terparkir, status menjadi *Occupied*.
   - Jika ada ketidaksesuaian (Misal: Slot "Kosong" tiba-tiba diisi), sistem memicu alur **Peringatan Salah Parkir/Anomali**.

## 3. Proses Keluar & Pembayaran
1. Kendaraan mendekati palang keluar, YOLO memindai ulang plat nomor.
2. Sistem mencocokkan rekaman plat dengan data kedatangan (*match*).
3. **Kalkulasi Biaya** dilakukan (termasuk mengakomodasi *Grace Period*/Drop-off 10 menit gratis).
4. Layar LED menampilkan jumlah tagihan, pengendara melakukan *tap* E-Toll/QRIS.
5. **Payment Gateway** memvalidasi saldo, dan jika lunas, palang pintu otomatis terbuka.

## 4. Pelaporan Manajerial & Petugas
- Petugas menggunakan **Dashboard Real-time** untuk memantau lalu lintas video gerbang (*Gate OCR Feed*) dan memantau anomali (*Anomaly Logs*) untuk penertiban area parkir.
- Manajemen menggunakan laporan analitik untuk melihat **Reduksi Emisi CO2** dan total pendapatan operasional harian.
