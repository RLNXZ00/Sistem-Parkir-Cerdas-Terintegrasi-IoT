package com.spct.repository; // Nama package dari modul repositori akses data sistem

// Import entitas KameraAnpr dari package model
import com.spct.model.KameraAnpr;
// Import antarmuka JpaRepository dari Spring Data JPA
import org.springframework.data.jpa.repository.JpaRepository;
// Import anotasi Repository dari komponen Spring Framework
import org.springframework.stereotype.Repository;
// Import koleksi List dari java util
import java.util.List;

// Interface publik java KameraAnprRepository untuk operasi akses basis data tabel kamera_anpr
// Menyediakan operasi query dan manipulasi data perangkat keras kamera ALPR/ANPR
@Repository // Menandai interface ini sebagai komponen Spring Repository
public interface KameraAnprRepository extends JpaRepository<KameraAnpr, String>
{
    // Method findByPosisiGerbang untuk mengambil daftar kamera berdasarkan lokasi gerbang (MASUK/KELUAR)
    List<KameraAnpr> findByPosisiGerbang(String posisiGerbang); // Mengembalikan daftar List objek KameraAnpr

    // Method findByStatusKamera untuk mengambil daftar kamera berdasarkan status keaktifan (ON/OFF)
    List<KameraAnpr> findByStatusKamera(String statusKamera); // Mengembalikan daftar List objek KameraAnpr
}
