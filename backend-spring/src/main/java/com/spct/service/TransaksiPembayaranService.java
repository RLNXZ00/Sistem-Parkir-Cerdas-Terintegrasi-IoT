// OTAK LOGIKA PEMBAYARAN & GATE KELUAR

// Pseudocode:
// Saat kamera gerbang keluar mendeteksi plat, Controller memanggil Service ini.

// Fungsi prosesKeluar(PlatNomor):
// 1. Panggil TransaksiParkirRepository.cariTransaksiBelumLunas(PlatNomor)
// 2. Jika tidak ketemu, berarti plat tidak terdaftar (Anomali masuk tanpa scan).
// 3. Jika ketemu, catat Waktu Keluar (waktu saat ini).
// 4. Kalkulasi Durasi: Waktu Keluar dikurangi Waktu Masuk.
// 5. Aturan Grace Period:
//    - Jika durasi < 10 Menit, Tarif = Rp0.
//    - Jika durasi > 10 Menit, Tarif = Durasi * Rp. 5000 (Misal).
// 6. Kembalikan total tarif ke Controller untuk ditampilkan di Layar Kios.
// 
// Fungsi verifikasiLunas(IdTransaksi):
// 1. Jika Payment Gateway (E-Toll/QRIS) merespons berhasil bayar:
// 2. Ubah status di TransaksiParkir menjadi "Lunas".
// 3. Buka Palang Gerbang Keluar.
// 4. Ubah status SlotParkir yang tadinya ditempati menjadi "Kosong" kembali.
