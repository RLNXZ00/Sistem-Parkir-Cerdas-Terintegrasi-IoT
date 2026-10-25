package com.spct.repository; // Nama package dari modul repositori akses data sistem

// Import enum JenisKendaraan dari package model
import com.spct.model.JenisKendaraan;
// Import enum StatusPembayaran dari package model
import com.spct.model.StatusPembayaran;
// Import entitas TransaksiParkir dari package model
import com.spct.model.TransaksiParkir;
// Import antarmuka JpaRepository dari Spring Data JPA
import org.springframework.data.jpa.repository.JpaRepository;
// Import anotasi Query dari Spring Data JPA untuk penulisan JPQL
import org.springframework.data.jpa.repository.Query;
// Import anotasi Param untuk pemetaan parameter pada kueri JPQL
import org.springframework.data.repository.query.Param;
// Import anotasi Repository dari komponen Spring Framework
import org.springframework.stereotype.Repository;

// Import tipe data BigDecimal untuk agregasi perhitungan rupiah
import java.math.BigDecimal;
// Import tipe data LocalDateTime java untuk filter waktu kueri
import java.time.LocalDateTime;
// Import koleksi List dari java util
import java.util.List;
// Import kelas utilitas Optional dari java util
import java.util.Optional;

// Interface publik java TransaksiParkirRepository untuk operasi akses basis data tabel transaksi_parkir
// Mengelola data transaksi parkir, kueri analitik finansial, antrean FIFO gerbang, dan laporan lingkungan
@Repository // Menandai interface ini sebagai komponen Spring Repository
public interface TransaksiParkirRepository extends JpaRepository<TransaksiParkir, Long>
{
    // =====================================================================
    // Method Kueri Kustom untuk TransaksiParkir
    // =====================================================================

    // Method findFirstByKendaraan_PlatNomorAndStatusPembayaranOrderByWaktuMasukDesc untuk mencari transaksi aktif kendaraan
    Optional<TransaksiParkir> findFirstByKendaraan_PlatNomorAndStatusPembayaranOrderByWaktuMasukDesc(
        String platNomor, StatusPembayaran statusPembayaran); // Mengembalikan objek Optional pembungkus TransaksiParkir

    // Method findFirstByStatusPembayaranOrderByWaktuMasukAsc untuk mengambil transaksi terlama antrean FIFO umum
    Optional<TransaksiParkir> findFirstByStatusPembayaranOrderByWaktuMasukAsc(
        StatusPembayaran statusPembayaran); // Mengembalikan objek Optional pembungkus transaksi FIFO pertama

    // Method findByStatusPembayaranOrderByWaktuMasukAsc untuk mengambil seluruh daftar antrean keluar FIFO aktif
    List<TransaksiParkir> findByStatusPembayaranOrderByWaktuMasukAsc(
        StatusPembayaran statusPembayaran); // Mengembalikan daftar List transaksi antrean aktif

    // Method findFirstByStatusPembayaranAndKendaraan_JenisKendaraanOrderByWaktuMasukAsc untuk antrean FIFO per jenis kendaraan
    Optional<TransaksiParkir> findFirstByStatusPembayaranAndKendaraan_JenisKendaraanOrderByWaktuMasukAsc(
        StatusPembayaran statusPembayaran, JenisKendaraan jenisKendaraan); // Mengembalikan objek Optional transaksi terdepan

    // Method findByStatusPembayaranAndKendaraan_JenisKendaraanOrderByWaktuMasukAsc untuk daftar antrean FIFO per jenis kendaraan
    List<TransaksiParkir> findByStatusPembayaranAndKendaraan_JenisKendaraanOrderByWaktuMasukAsc(
        StatusPembayaran statusPembayaran, JenisKendaraan jenisKendaraan); // Mengembalikan daftar antrean kendaraan sejenis

    // Method findByWaktuMasukBetween untuk mengambil seluruh transaksi yang masuk dalam periode tertentu
    List<TransaksiParkir> findByWaktuMasukBetween(LocalDateTime awal, LocalDateTime akhir); // Mengembalikan daftar List transaksi

    // Method hitungTotalPendapatanDalamRentangWaktu untuk menghitung akumulasi rupiah transaksi berstatus lunas
    @Query("SELECT SUM(t.nominalTagihan) FROM TransaksiParkir t " +
           "WHERE COALESCE(t.waktuKeluar, t.waktuMasuk) BETWEEN :awal AND :akhir AND t.statusPembayaran = 'LUNAS'")
    BigDecimal hitungTotalPendapatanDalamRentangWaktu(
        @Param("awal") LocalDateTime awal, // Parameter waktu awal rentang
        @Param("akhir") LocalDateTime akhir); // Parameter waktu akhir rentang

    // Method countTransaksiLunasDalamRentangWaktu untuk menghitung kuantitas transaksi lunas dalam rentang waktu
    @Query("SELECT COUNT(t) FROM TransaksiParkir t " +
           "WHERE COALESCE(t.waktuKeluar, t.waktuMasuk) BETWEEN :awal AND :akhir AND t.statusPembayaran = 'LUNAS'")
    Long countTransaksiLunasDalamRentangWaktu(
        @Param("awal") LocalDateTime awal, // Parameter waktu awal rentang
        @Param("akhir") LocalDateTime akhir); // Parameter waktu akhir rentang

    // Method countByWaktuMasukBetween untuk menghitung kuantitas kendaraan masuk dalam rentang waktu
    Long countByWaktuMasukBetween(LocalDateTime awal, LocalDateTime akhir); // Mengembalikan jumlah total kendaraan masuk

    // Method hitungTotalMenitDihematDariSensor untuk menghitung total penghematan waktu navigasi berbasis sensor
    @Query("SELECT SUM(t.menitDihemat) FROM TransaksiParkir t WHERE t.waktuTibaSlot IS NOT NULL")
    Double hitungTotalMenitDihematDariSensor(); // Mengembalikan jumlah total menit penghematan

    // =====================================================================
    // Kueri Pendukung Modul Laporan Resmi (PK-UC010)
    // =====================================================================

    // Method findTransaksiLunasDalamRentangWaktu untuk mengambil rekaman transaksi lunas laporan finansial
    @Query("SELECT t FROM TransaksiParkir t " +
           "WHERE COALESCE(t.waktuKeluar, t.waktuMasuk) BETWEEN :awal AND :akhir " +
           "AND t.statusPembayaran = 'LUNAS' " +
           "ORDER BY COALESCE(t.waktuKeluar, t.waktuMasuk) DESC")
    List<TransaksiParkir> findTransaksiLunasDalamRentangWaktu(
        @Param("awal") LocalDateTime awal, // Parameter waktu awal rentang
        @Param("akhir") LocalDateTime akhir); // Parameter waktu akhir rentang

    // Method findTransaksiLingkunganDalamRentangWaktu untuk mengambil rekaman transaksi laporan reduksi emisi CO2
    @Query("SELECT t FROM TransaksiParkir t " +
           "WHERE t.waktuMasuk BETWEEN :awal AND :akhir " +
           "AND t.waktuTibaSlot IS NOT NULL " +
           "ORDER BY t.waktuMasuk DESC")
    List<TransaksiParkir> findTransaksiLingkunganDalamRentangWaktu(
        @Param("awal") LocalDateTime awal, // Parameter waktu awal rentang
        @Param("akhir") LocalDateTime akhir); // Parameter waktu akhir rentang

    // Method hitungRataRataDurasiMenit untuk menghitung durasi rata-rata parkir kendaraan dalam menit
    @Query("SELECT AVG(t.durasiTotalMenit) FROM TransaksiParkir t " +
           "WHERE COALESCE(t.waktuKeluar, t.waktuMasuk) BETWEEN :awal AND :akhir " +
           "AND t.durasiTotalMenit IS NOT NULL")
    Double hitungRataRataDurasiMenit(
        @Param("awal") LocalDateTime awal, // Parameter waktu awal rentang
        @Param("akhir") LocalDateTime akhir); // Parameter waktu akhir rentang

    // Method hitungTotalMenitDihematDalamRentangWaktu untuk menghitung menit dihemat dalam periode tertentu
    @Query("SELECT SUM(t.menitDihemat) FROM TransaksiParkir t " +
           "WHERE t.waktuMasuk BETWEEN :awal AND :akhir AND t.waktuTibaSlot IS NOT NULL")
    Double hitungTotalMenitDihematDalamRentangWaktu(
        @Param("awal") LocalDateTime awal, // Parameter waktu awal rentang
        @Param("akhir") LocalDateTime akhir); // Parameter waktu akhir rentang
}
