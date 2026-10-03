package com.spct.repository;

import com.spct.model.LogDeteksiPlat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

// Repository untuk entitas LogDeteksiPlat
// Menyediakan operasi CRUD ke tabel 'log_deteksi_plat' di database
@Repository
public interface LogDeteksiPlatRepository extends JpaRepository<LogDeteksiPlat, Long>
{
    // Mengambil semua log deteksi dari satu kamera tertentu (untuk audit per kamera)
    List<LogDeteksiPlat> findByKameraAsal_IdKameraOrderByWaktuDeteksiDesc(String idKamera);

    // Mengambil semua log yang hasilnya GAGAL (untuk analitik akurasi ALPR)
    List<LogDeteksiPlat> findByHasilDeteksiOrderByWaktuDeteksiDesc(String hasilDeteksi);

    // Mengambil semua riwayat deteksi untuk satu kendaraan tertentu (audit trail)
    List<LogDeteksiPlat> findByKendaraanTerdeteksi_IdKendaraanOrderByWaktuDeteksiDesc(Long idKendaraan);
}
