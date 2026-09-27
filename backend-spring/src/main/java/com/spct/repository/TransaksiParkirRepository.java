// Kelas ini berhubungan langsung dengan Database untuk tabel TransaksiParkir
// Berperan mencari atau menyimpan riwayat transaksi kendaraan.

// Pseudocode:
// 1. Fungsi cariTransaksiBelumLunas(platNomor):
//    - Lakukan query: "SELECT * FROM TransaksiParkir WHERE plat_nomor=? AND status='Belum Lunas'"
//    - Digunakan saat mobil berada di gerbang keluar untuk mengecek tagihan.
//
// 2. Fungsi hitungTotalPendapatanBulanIni():
//    - Lakukan query agregasi: "SUM(total_bayar) WHERE bulan=?"
//    - Digunakan oleh AnalitikLaporanService untuk dashboard manajemen.
