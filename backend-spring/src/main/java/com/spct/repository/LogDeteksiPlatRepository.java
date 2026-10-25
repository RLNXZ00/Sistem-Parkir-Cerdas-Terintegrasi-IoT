package com.spct.repository; // Nama package dari modul repositori akses data sistem

// Import entitas LogDeteksiPlat dari package model
import com.spct.model.LogDeteksiPlat;
// Import antarmuka JpaRepository dari Spring Data JPA
import org.springframework.data.jpa.repository.JpaRepository;
// Import anotasi Repository dari komponen Spring Framework
import org.springframework.stereotype.Repository;
// Import koleksi List dari java util
import java.util.List;

// Interface publik java LogDeteksiPlatRepository untuk operasi akses basis data tabel log_deteksi_plat
// Menyediakan kueri riwayat pembacaan plat nomor oleh kamera ANPR
@Repository // Menandai interface ini sebagai komponen Spring Repository
public interface LogDeteksiPlatRepository extends JpaRepository<LogDeteksiPlat, Long>
{
    // Method findByKameraAsal_IdKameraOrderByWaktuDeteksiDesc untuk mengambil log berdasarkan id kamera asal
    List<LogDeteksiPlat> findByKameraAsal_IdKameraOrderByWaktuDeteksiDesc(String idKamera); // Mengembalikan daftar List log deteksi

    // Method findByHasilDeteksiOrderByWaktuDeteksiDesc untuk mengambil log berdasarkan status hasil (BERHASIL/GAGAL)
    List<LogDeteksiPlat> findByHasilDeteksiOrderByWaktuDeteksiDesc(String hasilDeteksi); // Mengembalikan daftar List log deteksi

    // Method findByKendaraanTerdeteksi_IdKendaraanOrderByWaktuDeteksiDesc untuk mengambil log berdasarkan id kendaraan
    List<LogDeteksiPlat> findByKendaraanTerdeteksi_IdKendaraanOrderByWaktuDeteksiDesc(Long idKendaraan); // Mengembalikan daftar log kendaraan
}
