package com.spct.repository;

import com.spct.model.LogAuditLaporan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository: LogAuditLaporanRepository
 * Mengelola operasi basis data untuk riwayat audit pengunduhan laporan (PK-UC010).
 */
@Repository
public interface LogAuditLaporanRepository extends JpaRepository<LogAuditLaporan, Long>
{
    /**
     * Mengambil 15 catatan riwayat unduhan terbaru diurutkan dari yang paling baru
     */
    List<LogAuditLaporan> findTop15ByOrderByWaktuUnduhDesc();

    /**
     * Mengambil seluruh catatan riwayat unduhan diurutkan dari yang paling baru
     */
    List<LogAuditLaporan> findAllByOrderByWaktuUnduhDesc();

    /**
     * Menghitung total unduhan berdasarkan format berkas (PDF / XLSX)
     */
    long countByFormatBerkas(String formatBerkas);
}
