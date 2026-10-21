package com.spct.repository;

import com.spct.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

// Repository untuk entitas User
// Menyediakan operasi CRUD ke tabel 'users' di database
@Repository
public interface UserRepository extends JpaRepository<User, Long>
{
    // Mencari user berdasarkan username (untuk proses login Dashboard)
    Optional<User> findByUsername(String username);

    // Cek apakah username sudah terdaftar (untuk validasi registrasi)
    boolean existsByUsername(String username);

    // Mencari user berdasarkan NIP (untuk proses lupa/reset kata sandi)
    Optional<User> findByNip(String nip);

    // Cek apakah NIP sudah terdaftar (untuk validasi registrasi unik)
    boolean existsByNip(String nip);
}
