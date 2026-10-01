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
    Optional<TransaksiParkir> findByKendaraan_PlatNomorAndStatusPembayaran(
        String platNomor, StatusPembayaran statusPembayaran);

    // Mengambil semua transaksi dalam rentang waktu tertentu (digunakan untuk laporan bulanan)
    // Setara: SELECT * FROM transaksi_parkir WHERE waktu_masuk BETWEEN ? AND ?
    List<TransaksiParkir> findByWaktuMasukBetween(LocalDateTime awal, LocalDateTime akhir);

    // Menghitung total pendapatan dalam rentang waktu tertentu (untuk Dashboard Laporan)
    // @Query memungkinkan penulisan JPQL (Java Query Language) kustom yang lebih kompleks
    // Setara: SELECT SUM(nominal_tagihan) FROM transaksi_parkir WHERE waktu_masuk BETWEEN ? AND ? AND status = 'LUNAS'
    @Query("SELECT SUM(t.nominalTagihan) FROM TransaksiParkir t " +
           "WHERE t.waktuMasuk BETWEEN :awal AND :akhir AND t.statusPembayaran = 'LUNAS'")
    BigDecimal hitungTotalPendapatanDalamRentangWaktu(
        @Param("awal") LocalDateTime awal,
        @Param("akhir") LocalDateTime akhir);

    // Menghitung jumlah kendaraan yang masuk dalam rentang waktu tertentu (untuk statistik harian)
    // Setara: SELECT COUNT(*) FROM transaksi_parkir WHERE waktu_masuk BETWEEN ? AND ?
    Long countByWaktuMasukBetween(LocalDateTime awal, LocalDateTime akhir);
}
