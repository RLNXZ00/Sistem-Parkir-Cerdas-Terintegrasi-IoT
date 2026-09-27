package com.spct.model;

/**
 * ENTITAS: TransaksiParkir
 * Merepresentasikan tabel 'transaksi_parkir' di Database.
 * Bertanggung jawab dalam seluruh pencatatan waktu dan uang.
 * 
 * PSEUDOCODE / STRUKTUR ATRIBUT:
 * 
 * Tipe Tabel: Transaksional (Bertambah terus setiap hari)
 * 
 * 1. id_transaksi (Primary Key)
 *    - Tipe: UUID (Agar tidak mudah ditebak untuk keamanan transaksi API Payment Gateway)
 * 
 * 2. id_kendaraan (Foreign Key)
 *    - Relasi ke DataKendaraan.
 * 
 * 3. id_slot_dipilih (Foreign Key)
 *    - Menyimpan histori slot mana yang dulu ia tempati (Berguna untuk Laporan).
 * 
 * 4. waktu_masuk
 *    - Tipe: Timestamp. Dicatat otomatis oleh DeteksiPlatController.
 * 
 * 5. waktu_keluar
 *    - Tipe: Timestamp (Bisa NULL). Diperbarui otomatis oleh TransaksiPembayaranController saat di gerbang keluar.
 * 
 * 6. durasi_total_menit
 *    - Tipe: Integer. Hasil kalkulasi pengurangan waktu.
 * 
 * 7. nominal_tagihan
 *    - Tipe: Double/BigDecimal. Uang yang harus dibayar. Bernilai 0 jika masuk masa Grace Period (< 10 mnt).
 * 
 * 8. status_pembayaran
 *    - Tipe: Enum (BELUM_LUNAS, PROSES_GATEWAY, LUNAS, GRACE_PERIOD_FREE).
 * 
 * 9. metode_pembayaran
 *    - Tipe: Enum (QRIS, ETOLL_MANDIRI, ETOLL_BRI, CASH).
 */
public class TransaksiParkir {
    // Akan diisi anotas @Entity, @Id, @Column dari JPA
}