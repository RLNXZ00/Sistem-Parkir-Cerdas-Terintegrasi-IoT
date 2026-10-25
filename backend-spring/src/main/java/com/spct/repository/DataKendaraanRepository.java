package com.spct.repository; // Nama package dari modul repositori akses data sistem

// Import entitas DataKendaraan dari package model
import com.spct.model.DataKendaraan;
// Import antarmuka JpaRepository dari Spring Data JPA
import org.springframework.data.jpa.repository.JpaRepository;
// Import anotasi Repository dari komponen Spring Framework
import org.springframework.stereotype.Repository;
// Import kelas utilitas Optional dari java util untuk membungkus objek null-safe
import java.util.Optional;

// Interface publik java DataKendaraanRepository untuk operasi akses basis data tabel data_kendaraan
// Turunan dari JpaRepository<DataKendaraan, Long> yang menyediakan operasi CRUD bawaan secara otomatis
@Repository // Menandai interface ini sebagai komponen Spring Repository (Data Access Object)
public interface DataKendaraanRepository extends JpaRepository<DataKendaraan, Long>
{
    // =====================================================================
    // Method Kueri Kustom untuk DataKendaraan
    // =====================================================================

    // Method findByPlatNomor untuk mencari data kendaraan berdasarkan string plat nomor
    Optional<DataKendaraan> findByPlatNomor(String platNomor); // Mengembalikan objek Optional pembungkus DataKendaraan

    // Method existsByPlatNomor untuk memeriksa apakah plat nomor telah terdaftar di database
    boolean existsByPlatNomor(String platNomor); // Mengembalikan nilai boolean true jika ada, false jika tidak ada
}
