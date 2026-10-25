package com.spct.repository; // Nama package dari modul repositori akses data sistem

// Import entitas LogAuditLaporan dari package model
import com.spct.model.LogAuditLaporan;
// Import antarmuka JpaRepository dari Spring Data JPA
import org.springframework.data.jpa.repository.JpaRepository;
// Import anotasi Repository dari komponen Spring Framework
import org.springframework.stereotype.Repository;
// Import koleksi List dari java util
import java.util.List;

// Interface publik java LogAuditLaporanRepository untuk operasi akses basis data tabel log_audit_laporan
// Menyediakan kueri audit trail riwayat pengunduhan berkas laporan dokumen resmi
@Repository // Menandai interface ini sebagai komponen Spring Repository
public interface LogAuditLaporanRepository extends JpaRepository<LogAuditLaporan, Long>
{
    // Method findTop15ByOrderByWaktuUnduhDesc untuk mengambil 15 rekaman riwayat unduhan paling mutakhir
    List<LogAuditLaporan> findTop15ByOrderByWaktuUnduhDesc(); // Mengembalikan 15 data teratas terurut waktu menurun

    // Method findAllByOrderByWaktuUnduhDesc untuk mengambil seluruh catatan riwayat unduhan terurut waktu terbaru
    List<LogAuditLaporan> findAllByOrderByWaktuUnduhDesc(); // Mengembalikan seluruh data log audit laporan

    // Method countByFormatBerkas untuk menghitung kuantitas berkas yang diunduh berdasarkan format (PDF/XLSX)
    long countByFormatBerkas(String formatBerkas); // Mengembalikan total jumlah baris data bertipe long
}
