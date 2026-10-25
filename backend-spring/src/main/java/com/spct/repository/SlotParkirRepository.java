package com.spct.repository; // Nama package dari modul repositori akses data sistem

// Import enum JenisKendaraan dari package model
import com.spct.model.JenisKendaraan;
// Import entitas SlotParkir dari package model
import com.spct.model.SlotParkir;
// Import enum StatusSlot dari package model
import com.spct.model.StatusSlot;
// Import antarmuka JpaRepository dari Spring Data JPA
import org.springframework.data.jpa.repository.JpaRepository;
// Import anotasi Repository dari komponen Spring Framework
import org.springframework.stereotype.Repository;
// Import koleksi List dari java util
import java.util.List;
// Import kelas utilitas Optional dari java util
import java.util.Optional;

// Interface publik java SlotParkirRepository untuk operasi akses basis data tabel slot_parkir
// Menyediakan kueri ketersediaan slot kosong, filter lantai, dan pemetaan graf A*
@Repository // Menandai interface ini sebagai komponen Spring Repository
public interface SlotParkirRepository extends JpaRepository<SlotParkir, String>
{
    // =====================================================================
    // Method Kueri Kustom Akses Data Slot Parkir
    // =====================================================================

    // Method findByStatusSlotAndLantaiOrderByKoordinatXAsc untuk mencari slot kosong per lantai terurut koordinat X terdekat
    List<SlotParkir> findByStatusSlotAndLantaiOrderByKoordinatXAsc(StatusSlot statusSlot, Integer lantai); // Mengembalikan daftar List SlotParkir

    // Method findByLantai untuk mencari semua slot pada suatu lantai tertentu
    List<SlotParkir> findByLantai(Integer lantai); // Mengembalikan daftar seluruh slot pada lantai terkait

    // Method findByStatusSlotAndLantaiAndJenisKendaraanOrderByKoordinatXAsc untuk alokasi slot kosong sesuai jenis kendaraan
    List<SlotParkir> findByStatusSlotAndLantaiAndJenisKendaraanOrderByKoordinatXAsc(StatusSlot statusSlot, Integer lantai, JenisKendaraan jenisKendaraan); // Mengembalikan slot sesuai peruntukan

    // Method findByLantaiAndJenisKendaraan untuk mengambil denah slot per lantai dan kategori kendaraan
    List<SlotParkir> findByLantaiAndJenisKendaraan(Integer lantai, JenisKendaraan jenisKendaraan); // Mengembalikan daftar denah visualisasi

    // Method findByNodeId untuk mencari slot berdasarkan kode node graf navigasi A*
    Optional<SlotParkir> findByNodeId(String nodeId); // Mengembalikan objek Optional pembungkus SlotParkir

    // Method findByStatusSlot untuk mengambil slot berdasarkan status ketersediaan (KOSONG, DIPESAN, TERISI, MAINTENANCE)
    List<SlotParkir> findByStatusSlot(StatusSlot statusSlot); // Mengembalikan daftar slot berdasarkan status
}
