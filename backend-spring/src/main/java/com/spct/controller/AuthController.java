package com.spct.controller;

import com.spct.model.User;
import com.spct.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

/**
 * Controller: AuthController
 * Menangani autentikasi login untuk Dashboard Web Admin / Petugas.
 * Sesuai Use-Case: Petugas login menggunakan username & password ke Dashboard.
 *
 * Endpoint Base URL: /api/auth
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController
{
    @Autowired
    private UserRepository userRepository; // Repository untuk operasi ke tabel 'users'


    // ─── POST /api/auth/login ────────────────────────────────────────────────
    // Endpoint login Dashboard: menerima username dan password, mengembalikan data user
    // Prototype MVP: perbandingan password dilakukan plain-text (tanpa enkripsi)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body)
    {
        String username = body.get("username");
        String password = body.get("password");

        // Validasi input tidak boleh kosong
        if (username == null || password == null)
        {
            return ResponseEntity.badRequest().body(Map.of("pesan", "Username dan password wajib diisi."));
        }

        // Cari user berdasarkan username di database
        Optional<User> userOpt = userRepository.findByUsername(username);

        // Validasi: username tidak ditemukan
        if (userOpt.isEmpty())
        {
            return ResponseEntity.status(401).body(Map.of("pesan", "Username tidak ditemukan."));
        }

        User user = userOpt.get();

        // Validasi: password tidak cocok
        if (!user.getPassword().equals(password))
        {
            return ResponseEntity.status(401).body(Map.of("pesan", "Password salah."));
        }

        // Validasi: akun dinonaktifkan
        if (!user.getAktif())
        {
            return ResponseEntity.status(403).body(Map.of("pesan", "Akun Anda telah dinonaktifkan."));
        }

        // Login berhasil: kembalikan data user (tanpa password) sebagai respons
        return ResponseEntity.ok(Map.of(
            "idUser",      user.getIdUser(),
            "username",    user.getUsername(),
            "namaLengkap", user.getNamaLengkap(),
            "role",        user.getRole()
        ));
    }


    // ─── GET /api/auth/users ─────────────────────────────────────────────────
    // Mengambil semua daftar akun user (untuk halaman manajemen user di Dashboard Admin)
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers()
    {
        return ResponseEntity.ok(userRepository.findAll());
    }
}
