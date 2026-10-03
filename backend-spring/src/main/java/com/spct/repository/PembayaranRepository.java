package com.spct.repository;

import com.spct.model.Pembayaran;
import com.spct.model.StatusPembayaran;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

// Repository untuk entitas Pembayaran
// Menyediakan operasi CRUD ke tabel 'pembayaran' di database
@Repository
public interface PembayaranRepository extends JpaRepository<Pembayaran, Long>
{
    // Mencari record pembayaran berdasarkan ID transaksi parkir (untuk proses checkout keluar)
    Optional<Pembayaran> findByTransaksiParkir_IdTransaksi(Long idTransaksi);

    // Mencari semua pembayaran dengan status tertentu (untuk laporan keuangan harian)
    java.util.List<Pembayaran> findByStatusPembayaran(StatusPembayaran statusPembayaran);
}
