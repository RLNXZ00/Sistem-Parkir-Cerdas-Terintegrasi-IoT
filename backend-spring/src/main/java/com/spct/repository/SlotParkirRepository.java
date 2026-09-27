// Kelas ini adalah "Tangan Kanan" yang berhubungan langsung dengan Database
// Berperan untuk melakukan pencarian (Query) khusus ke tabel SlotParkir

// Pseudocode:
// 1. Fungsi cariSlotKosongTerdekat(lantai):
//    - Lakukan query ke database: "SELECT * FROM SlotParkir WHERE status='Kosong' AND lantai=?"
//    - Urutkan berdasarkan jarak terdekat dari gerbang masuk.
//
// 2. Fungsi cariSlotBerdasarkanId(idSlot):
//    - Lakukan query untuk mencari data slot spesifik jika ada mobil yang salah parkir.
//
// 3. Fungsi perbaruiStatusSlot(idSlot, statusBaru):
//    - Lakukan update ke database: "UPDATE SlotParkir SET status=? WHERE id=?"

// Cukup dengan mendeklarasikan fungsi-fungsi ini, Spring Boot (JPA) akan 
// otomatis membuatkan perintah SQL-nya secara ajaib di belakang layar.
