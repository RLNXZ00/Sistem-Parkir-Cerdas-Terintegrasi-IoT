// KELAS SERVICE ADALAH "OTAK" DARI APLIKASI. 
// Kelas ini berisi rumus, algoritma, dan aturan bisnis. (Bukan untuk menerima HTTP, bukan untuk query langsung)

// Pseudocode Logika Algoritma A* & Alokasi:
// Saat Controller menerima Plat Nomor dari gerbang masuk, Controller akan memanggil Service ini.

// Fungsi hitungDanAlokasikanRute(PlatNomor, JenisKendaraan):
// 1. Validasi: Panggil DataKendaraanRepository untuk mengecek apakah plat ini sudah terdaftar.
// 2. Pencarian Slot: 
//    - Panggil SlotParkirRepository.cariSlotKosongTerdekat(Lantai 1)
//    - Jika penuh, panggil lantai 2. Jika penuh, lantai 3.
//    - Jika semua penuh, kembalikan pesan "Parkir Penuh".
// 3. Algoritma A* (Mencari Rute Terpendek):
//    - Titik Awal = Node Gerbang Masuk
//    - Titik Akhir = Node dari Slot Parkir yang terpilih di atas
//    - Hitung jarak antar Node menggunakan rumus Heuristik (A*)
//    - Simpan urutan jalur (Misal: Gerbang -> Lorong A -> Lorong B -> B1-12)
// 4. Update Database:
//    - Panggil SlotParkirRepository untuk mengubah status slot menjadi "Dipesan".
// 5. Kembalikan data rute dan nama slot tersebut kembali ke Controller agar diteruskan ke Layar Kios.
