package com.spct.repository; // Nama package dari modul repositori akses data sistem

// Import entitas LogOperasionalIoT dari package model
import com.spct.model.LogOperasionalIoT;
// Import enum StatusResolusi dari package model
import com.spct.model.StatusResolusi;
// Import enum TingkatKeparahan dari package model
import com.spct.model.TingkatKeparahan;
// Import antarmuka JpaRepository dari Spring Data JPA
import org.springframework.data.jpa.repository.JpaRepository;
// Import anotasi Repository dari komponen Spring Framework
import org.springframework.stereotype.Repository;
// Import tipe data LocalDateTime java untuk filter kueri rentang waktu
import java.time.LocalDateTime;
// Import koleksi List dari java util
import java.util.List;

// Interface publik java LogOperasionalIoTRepository untuk operasi akses basis data tabel log_operasional_iot
// Mengelola pencatatan kejadian sensor IoT, status anomali penyerobotan, dan kebijakan retensi data
@Repository // Menandai interface ini sebagai komponen Spring Repository
public interface LogOperasionalIoTRepository extends JpaRepository<LogOperasionalIoT, Long>
{
    // =====================================================================
    // Method Kueri Kustom untuk LogOperasionalIoT
    // =====================================================================

    // Method findByStatusResolusiAndTingkatKeparahanOrderByWaktuKejadianDesc untuk mencari log berdasarkan status resolusi dan tingkat keparahan
    List<LogOperasionalIoT> findByStatusResolusiAndTingkatKeparahanOrderByWaktuKejadianDesc(
        StatusResolusi statusResolusi, TingkatKeparahan tingkatKeparahan); // Mengembalikan daftar List log yang sesuai kriteria

    // Method findByStatusResolusiOrderByWaktuKejadianDesc untuk mencari semua log anomali berdasarkan status resolusi
    List<LogOperasionalIoT> findByStatusResolusiOrderByWaktuKejadianDesc(StatusResolusi statusResolusi); // Mengembalikan daftar List log anomali

    // Method findBySlotTerkait_IdSlotOrderByWaktuKejadianDesc untuk mencari riwayat log kejadian pada satu slot spesifik
    List<LogOperasionalIoT> findBySlotTerkait_IdSlotOrderByWaktuKejadianDesc(String idSlot); // Mengembalikan daftar List riwayat kejadian slot

    // Method findByWaktuKejadianBetweenOrderByWaktuKejadianDesc untuk mencari log operasional dalam rentang waktu tertentu
    List<LogOperasionalIoT> findByWaktuKejadianBetweenOrderByWaktuKejadianDesc(
        LocalDateTime awal, LocalDateTime akhir); // Mengembalikan daftar List kejadian terurut waktu menurun

    // Method countByStatusResolusi untuk menghitung jumlah anomali berdasarkan status resolusinya
    Long countByStatusResolusi(StatusResolusi statusResolusi); // Mengembalikan jumlah total data anomali bertipe Long

    // Method countByWaktuKejadianBetween untuk menghitung total kuantitas log dalam rentang waktu tertentu
    Long countByWaktuKejadianBetween(LocalDateTime awal, LocalDateTime akhir); // Mengembalikan total jumlah baris kejadian

    // =====================================================================
    // Kueri Kebijakan Retensi Data Pembersihan Log Rutin
    // =====================================================================

    // Method countByWaktuKejadianBeforeAndTingkatKeparahan untuk menghitung data log rutin lama sebelum waktu batas cutoff
    Long countByWaktuKejadianBeforeAndTingkatKeparahan(LocalDateTime cutoff, TingkatKeparahan tingkatKeparahan); // Mengembalikan jumlah data kadaluarsa

    // Method deleteByWaktuKejadianBeforeAndTingkatKeparahan untuk menghapus log rutin lama demi efisiensi kapasitas basis data
    @org.springframework.data.jpa.repository.Modifying // Menandai kueri sebagai operasi modifikasi data DML
    @org.springframework.transaction.annotation.Transactional // Memastikan eksekusi berjalan dalam konteks transaksi database
    long deleteByWaktuKejadianBeforeAndTingkatKeparahan(LocalDateTime cutoff, TingkatKeparahan tingkatKeparahan); // Mengembalikan jumlah baris yang berhasil dihapus
}
