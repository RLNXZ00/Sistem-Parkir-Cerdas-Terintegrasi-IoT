package com.spct.repository;

import com.spct.model.LogOperasionalIoT;
import com.spct.model.StatusResolusi;
import com.spct.model.TingkatKeparahan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime; // Mengimpor LocalDateTime untuk filter kueri berdasarkan rentang waktu
import java.util.List;

// Deklarasi Repository: pengganti PreparedStatement manual untuk tabel log_operasional_iot
// JpaRepository<LogOperasionalIoT, Long> otomatis menyediakan CRUD dasar
@Repository
public interface LogOperasionalIoTRepository extends JpaRepository<LogOperasionalIoT, Long>
{
    // =====================================================================
    // Method Kueri Kustom untuk LogOperasionalIoT
    // =====================================================================

    // Mencari semua log yang belum ditangani berdasarkan tingkat keparahan
    // Digunakan oleh Dashboard Admin untuk menampilkan daftar anomali yang perlu perhatian petugas
    // Setara: SELECT * FROM log_operasional_iot WHERE status_resolusi = ? AND tingkat_keparahan = ? ORDER BY waktu_kejadian DESC
    List<LogOperasionalIoT> findByStatusRsolusiAndTingkatKeparahanOrderByWaktuKejadianDesc(
        StatusResolusi statusResolusi, TingkatKeparahan tingkatKeparahan);

    // Mencari semua log anomali yang belum ditangani (BELUM_DITANGANI)
    // Digunakan untuk badge notifikasi di Dashboard Admin (misal: "3 anomali belum ditangani")
    // Setara: SELECT * FROM log_operasional_iot WHERE status_resolusi = 'BELUM_DITANGANI'
    List<LogOperasionalIoT> findByStatusRsolusiOrderByWaktuKejadianDesc(StatusResolusi statusResolusi);

    // Mencari semua log berdasarkan slot tertentu (untuk riwayat kejadian di satu slot)
    // Setara: SELECT * FROM log_operasional_iot WHERE id_slot = ? ORDER BY waktu_kejadian DESC
    List<LogOperasionalIoT> findBySlotTerkait_IdSlotOrderByWaktuKejadianDesc(String idSlot);

    // Mencari semua log dalam rentang waktu tertentu (untuk halaman Laporan Log Anomali)
    // Setara: SELECT * FROM log_operasional_iot WHERE waktu_kejadian BETWEEN ? AND ?
    List<LogOperasionalIoT> findByWaktuKejadianBetweenOrderByWaktuKejadianDesc(
        LocalDateTime awal, LocalDateTime akhir);

    // Menghitung jumlah anomali yang belum ditangani (untuk badge notifikasi di header Dashboard)
    // Setara: SELECT COUNT(*) FROM log_operasional_iot WHERE status_resolusi = 'BELUM_DITANGANI'
    Long countByStatusRsolusi(StatusResolusi statusResolusi);
}
