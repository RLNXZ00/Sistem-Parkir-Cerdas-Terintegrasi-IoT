package com.spct.repository;

import com.spct.model.StatusPembayaran;
import com.spct.model.TransaksiParkir;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal; // Mengimpor BigDecimal untuk hasil query agregasi nominal
import java.time.LocalDateTime; // Mengimpor LocalDateTime untuk filter query berdasarkan rentang waktu
import java.util.List;
import java.util.Optional;

// Deklarasi Repository: pengganti PreparedStatement manual untuk tabel transaksi_parkir
// JpaRepository<TransaksiParkir, Long> otomatis menyediakan CRUD dasar
@Repository
public interface TransaksiParkirRepository extends JpaRepository<TransaksiParkir, Long>
{
    // =====================================================================
    // Method Kueri Kustom untuk TransaksiParkir
    // =====================================================================

    // Mencari transaksi yang masih berjalan (belum lunas) berdasarkan plat nomor kendaraan
    // Digunakan oleh TransaksiPembayaranController saat kendaraan tiba di gerbang keluar
    // Setara: SELECT * FROM transaksi_parkir t JOIN data_kendaraan dk ON ...
    //         WHERE dk.plat_nomor = ? AND t.status_pembayaran = 'BELUM_LUNAS'
    Optional<TransaksiParkir> findFirstByKendaraan_PlatNomorAndStatusPembayaranOrderByWaktuMasukDesc(
        String platNomor, StatusPembayaran statusPembayaran);

    // Mencari transaksi aktif paling awal untuk mekanisme antrean keluar FIFO (First In First Out)
    Optional<TransaksiParkir> findFirstByStatusPembayaranOrderByWaktuMasukAsc(
        StatusPembayaran statusPembayaran);

    // Mengambil semua transaksi aktif yang belum lunas diurutkan dari yang paling lama masuk (FIFO Antrean)
    List<TransaksiParkir> findByStatusPembayaranOrderByWaktuMasukAsc(
        StatusPembayaran statusPembayaran);

    // Mengambil semua transaksi dalam rentang waktu tertentu (digunakan untuk laporan bulanan)
    // Setara: SELECT * FROM transaksi_parkir WHERE waktu_masuk BETWEEN ? AND ?
    List<TransaksiParkir> findByWaktuMasukBetween(LocalDateTime awal, LocalDateTime akhir);

    // Menghitung total pendapatan dalam rentang waktu tertentu (untuk Dashboard Laporan)
    // @Query memungkinkan penulisan JPQL (Java Query Language) kustom yang lebih kompleks
    // Setara: SELECT SUM(nominal_tagihan) FROM transaksi_parkir WHERE waktu_masuk BETWEEN ? AND ? AND status = 'LUNAS'
    @Query("SELECT SUM(t.nominalTagihan) FROM TransaksiParkir t " +
           "WHERE COALESCE(t.waktuKeluar, t.waktuMasuk) BETWEEN :awal AND :akhir AND t.statusPembayaran = 'LUNAS'")
    BigDecimal hitungTotalPendapatanDalamRentangWaktu(
        @Param("awal") LocalDateTime awal,
        @Param("akhir") LocalDateTime akhir);

    // Menghitung jumlah transaksi yang berstatus LUNAS dalam rentang waktu tertentu
    // Digunakan untuk menghitung rata-rata tarif per transaksi lunas (Avg Fee per Vehicle/Transaction)
    @Query("SELECT COUNT(t) FROM TransaksiParkir t " +
           "WHERE COALESCE(t.waktuKeluar, t.waktuMasuk) BETWEEN :awal AND :akhir AND t.statusPembayaran = 'LUNAS'")
    Long countTransaksiLunasDalamRentangWaktu(
        @Param("awal") LocalDateTime awal,
        @Param("akhir") LocalDateTime akhir);

    // Menghitung jumlah kendaraan yang masuk dalam rentang waktu tertentu (untuk statistik harian)
    // Setara: SELECT COUNT(*) FROM transaksi_parkir WHERE waktu_masuk BETWEEN ? AND ?
    Long countByWaktuMasukBetween(LocalDateTime awal, LocalDateTime akhir);

    // Menjumlahkan total menit yang RIIL dihemat oleh semua kendaraan berdasarkan data sensor IoT
    // Hanya menghitung transaksi yang sudah punya waktuTibaSlot (artinya sensor pernah mendeteksi kendaraan tiba)
    // Setara: SELECT SUM(menit_dihemat) FROM transaksi_parkir WHERE waktu_tiba_slot IS NOT NULL
    @Query("SELECT SUM(t.menitDihemat) FROM TransaksiParkir t WHERE t.waktuTibaSlot IS NOT NULL")
    Double hitungTotalMenitDihematDariSensor();

    // =====================================================================
    // Kueri Pendukung Modul Laporan (PK-UC010)
    // =====================================================================

    // Mengambil transaksi lunas untuk Laporan Finansial
    @Query("SELECT t FROM TransaksiParkir t " +
           "WHERE COALESCE(t.waktuKeluar, t.waktuMasuk) BETWEEN :awal AND :akhir " +
           "AND t.statusPembayaran = 'LUNAS' " +
           "ORDER BY COALESCE(t.waktuKeluar, t.waktuMasuk) DESC")
    List<TransaksiParkir> findTransaksiLunasDalamRentangWaktu(
        @Param("awal") LocalDateTime awal,
        @Param("akhir") LocalDateTime akhir);

    // Mengambil transaksi dengan data navigasi sensor untuk Laporan Lingkungan
    @Query("SELECT t FROM TransaksiParkir t " +
           "WHERE t.waktuMasuk BETWEEN :awal AND :akhir " +
           "AND t.waktuTibaSlot IS NOT NULL " +
           "ORDER BY t.waktuMasuk DESC")
    List<TransaksiParkir> findTransaksiLingkunganDalamRentangWaktu(
        @Param("awal") LocalDateTime awal,
        @Param("akhir") LocalDateTime akhir);

    // Menghitung rata-rata durasi parkir (menit) dalam rentang waktu
    @Query("SELECT AVG(t.durasiTotalMenit) FROM TransaksiParkir t " +
           "WHERE COALESCE(t.waktuKeluar, t.waktuMasuk) BETWEEN :awal AND :akhir " +
           "AND t.durasiTotalMenit IS NOT NULL")
    Double hitungRataRataDurasiMenit(
        @Param("awal") LocalDateTime awal,
        @Param("akhir") LocalDateTime akhir);

    // Menghitung total menit dihemat khusus dalam rentang waktu tertentu
    @Query("SELECT SUM(t.menitDihemat) FROM TransaksiParkir t " +
           "WHERE t.waktuMasuk BETWEEN :awal AND :akhir AND t.waktuTibaSlot IS NOT NULL")
    Double hitungTotalMenitDihematDalamRentangWaktu(
        @Param("awal") LocalDateTime awal,
        @Param("akhir") LocalDateTime akhir);
}

