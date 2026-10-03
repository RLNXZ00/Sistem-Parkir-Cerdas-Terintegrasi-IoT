package com.spct.repository;

import com.spct.model.KameraAnpr;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

// Repository untuk entitas KameraAnpr
// Menyediakan operasi CRUD ke tabel 'kamera_anpr' di database
@Repository
public interface KameraAnprRepository extends JpaRepository<KameraAnpr, String>
{
    // Mencari semua kamera berdasarkan posisi gerbang (MASUK / KELUAR)
    List<KameraAnpr> findByPosisiGerbang(String posisiGerbang);

    // Mencari semua kamera yang sedang aktif (status ON) untuk monitoring Dashboard
    List<KameraAnpr> findByStatusKamera(String statusKamera);
}
