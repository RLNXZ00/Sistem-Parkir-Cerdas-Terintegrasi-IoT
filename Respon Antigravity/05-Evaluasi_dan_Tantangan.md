# Evaluasi dan Tantangan Khusus ("Open Issues")

Dokumen `Evaluasi SPCT IoT.txt` memuat temuan-temuan mendalam pasca perancangan yang memerlukan *problem solving* yang matang saat pengembangan arsitektur dan penulisan kode (*coding*).

## 1. Pencegahan "Efek Domino" Salah Parkir
- **Masalah:** Jika kendaraan A salah parkir di slot milik kendaraan B, saat A keluar dari fasilitas, gerbang keluar akan gagal melepaskan status transaksi karena id parkirnya terkait dengan slot yang masih terdeteksi "Terisi".
- **Solusi Back-End:** Harus ada sistem validasi anomali yang melepaskan ikatan (*binding*) antara plat nomor dan ID slot ketika kendaraan pelanggar meninggalkan lokasi fisik. *Controller* harus merekonsiliasi keadaan dengan mendaftar kendaraan B yang kehilangan haknya ke slot kosong terdekat lainnya melalui mekanisme notifikasi pembaruan rute, atau membebaskan tagihan jika *logic* anomali berlaku.

## 2. Formula Reduksi Emisi CO2
- Algoritma analitik untuk *Eco-Metrics* harus merujuk pada standar baku (Misalnya X gram CO2 per detik untuk mobil rata-rata).
- Rumus: `(Waktu Tiba di Slot - Waktu Masuk Gerbang) * Nilai Standar Emisi/detik`. Kalkulasi ini menghitung jumlah CO2 aktual yang digunakan; sedangkan "Emisi Dihemat" dapat dicari dari perbandingan antara durasi rata-rata konvensional dengan durasi aktual dengan bantuan SPCT IoT.

## 3. Resiliensi Gateway Pembayaran (Offline Fallback)
- **Tantangan:** Downtime pada jaringan fasilitas utama (Mall/RS).
- **Solusi:** Modul sistem *gate* keluar wajib dibekali cadangan jaringan mandiri (seperti MiFi-GSM/seluler tertanam). Opsi *Fallback*: jika koneksi perbankan mutlak mati, SOP harus memicu fungsi gerbang *"Free/Open Policy"* untuk menghindari kemacetan fatal di pintu keluar.

## 4. Akurasi Deteksi Objek oleh Sensor IoT
- **Masalah:** Sensor ultrasonik dapat tertipu oleh manusia/penumpang yang berdiri lama di slot kosong, sehingga mengira slot telah "Terisi mobil".
- **Solusi IoT:** Memberlakukan variabel *delay validation* pada *script* sensor IoT (misalnya menunggu 5-10 detik kondisi statis sebelum memicu *event message* `Occupied` ke MQTT), atau menggunakan pendekatan *hybrid* verifikasi kamera CCTV secara silang di area khusus.

## 5. Sinkronisasi Diagram MVC dan Skema Basis Data
- Arsitektur Database (ERD) dan GUI yang ada di laporan belum sepenuhnya kohesif 1:1, *mapping* atribut antara DTO (*Data Transfer Object*) dari Controller Java ke JSON untuk Front-End, lalu relasi tabel PostgreSQL perlu diperkuat kembali saat penulisan *Entity Models*.
- Jadwal reset *history* parkir secara bulanan perlu dikelola menggunakan skrip *Cron Job* di server atau prosedur terjadwal dalam *database*.
