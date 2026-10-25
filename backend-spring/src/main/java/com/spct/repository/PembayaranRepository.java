package com.spct.repository; // Nama package dari modul repositori akses data sistem

// Import entitas Pembayaran dari package model
import com.spct.model.Pembayaran;
// Import enum StatusPembayaran dari package model
import com.spct.model.StatusPembayaran;
// Import antarmuka JpaRepository dari Spring Data JPA
import org.springframework.data.jpa.repository.JpaRepository;
// Import anotasi Repository dari komponen Spring Framework
import org.springframework.stereotype.Repository;
// Import kelas utilitas Optional dari java util
import java.util.Optional;
// Import koleksi List dari java util
import java.util.List;

// Interface publik java PembayaranRepository untuk operasi akses basis data tabel pembayaran
// Menyediakan operasi kueri status pembayaran finansial transaksi parkir
@Repository // Menandai interface ini sebagai komponen Spring Repository
public interface PembayaranRepository extends JpaRepository<Pembayaran, Long>
{
    // Method findByTransaksiParkir_IdTransaksi untuk mencari data pembayaran berdasarkan ID tiket transaksi
    Optional<Pembayaran> findByTransaksiParkir_IdTransaksi(Long idTransaksi); // Mengembalikan objek Optional pembungkus entitas Pembayaran

    // Method findByStatusPembayaran untuk mencari seluruh catatan pembayaran dengan status tertentu
    List<Pembayaran> findByStatusPembayaran(StatusPembayaran statusPembayaran); // Mengembalikan daftar List objek Pembayaran
}
