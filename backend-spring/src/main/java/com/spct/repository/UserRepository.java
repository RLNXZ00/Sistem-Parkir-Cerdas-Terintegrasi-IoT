package com.spct.repository; // Nama package dari modul repositori akses data sistem

// Import entitas User dari package model
import com.spct.model.User;
// Import antarmuka JpaRepository dari Spring Data JPA
import org.springframework.data.jpa.repository.JpaRepository;
// Import anotasi Repository dari komponen Spring Framework
import org.springframework.stereotype.Repository;
// Import kelas utilitas Optional dari java util
import java.util.Optional;

// Interface publik java UserRepository untuk operasi akses basis data tabel users
// Mengelola proses otentikasi login, pemeriksaan akun terdaftar, dan verifikasi NIP pegawai
@Repository // Menandai interface ini sebagai komponen Spring Repository
public interface UserRepository extends JpaRepository<User, Long>
{
    // Method findByUsername untuk mencari entitas akun pengguna berdasarkan username
    Optional<User> findByUsername(String username); // Mengembalikan objek Optional pembungkus User

    // Method existsByUsername untuk memeriksa keberadaan username di database
    boolean existsByUsername(String username); // Mengembalikan nilai true jika terdaftar, false jika belum

    // Method findByNip untuk mencari entitas akun pengguna berdasarkan NIP pegawai
    Optional<User> findByNip(String nip); // Mengembalikan objek Optional pembungkus User

    // Method existsByNip untuk memeriksa keberadaan NIP di database
    boolean existsByNip(String nip); // Mengembalikan nilai true jika ada, false jika tidak ada

    // Method findByUsernameOrNip untuk fleksibilitas pencarian akun via username atau NIP
    Optional<User> findByUsernameOrNip(String username, String nip); // Mengembalikan objek Optional pembungkus User
}
