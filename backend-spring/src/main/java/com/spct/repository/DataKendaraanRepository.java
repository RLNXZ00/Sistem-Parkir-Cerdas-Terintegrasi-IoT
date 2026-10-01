package com.spct.repository;

import com.spct.model.DataKendaraan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

// Deklarasi Repository: pengganti PreparedStatement manual untuk tabel data_kendaraan
// JpaRepository<DataKendaraan, Long> otomatis menyediakan CRUD dasar
@Repository
public interface DataKendaraanRepository extends JpaRepository<DataKendaraan, Long>
{
    // =====================================================================
    // Method Kueri Kustom untuk DataKendaraan
    // =====================================================================

    // Mencari kendaraan berdasarkan plat nomor (digunakan saat OCR mendeteksi plat di gerbang)
    // Setara: SELECT * FROM data_kendaraan WHERE plat_nomor = ?
    // Mengembalikan Optional untuk menangani kemungkinan plat tidak ditemukan (kendaraan baru)
    Optional<DataKendaraan> findByPlatNomor(String platNomor);

    // Mengecek apakah suatu plat nomor sudah terdaftar di database
    // Setara: SELECT COUNT(*) > 0 FROM data_kendaraan WHERE plat_nomor = ?
    boolean existsByPlatNomor(String platNomor);
}
