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


    // ─── POST /api/auth/register ─────────────────────────────────────────────
    // Endpoint pendaftaran akun pengguna baru (Operator / Petugas / Manajemen)
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body)
    {
        String username = body.get("username");
        String password = body.get("password");
        String namaLengkap = body.get("namaLengkap");
        if (namaLengkap == null || namaLengkap.trim().isEmpty()) {
            namaLengkap = body.get("fullName");
        }
        String roleInput = body.get("role");

        // 1. Validasi field wajib
        if (username == null || username.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("pesan", "Username wajib diisi."));
        }
        if (password == null || password.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("pesan", "Kata sandi wajib diisi."));
        }
        if (password.length() < 8) {
            return ResponseEntity.badRequest().body(Map.of("pesan", "Kata sandi minimal 8 karakter."));
        }
        if (!password.matches(".*\\d.*")) {
            return ResponseEntity.badRequest().body(Map.of("pesan", "Kata sandi harus mengandung angka."));
        }
        if (!password.matches(".*[^A-Za-z0-9].*")) {
            return ResponseEntity.badRequest().body(Map.of("pesan", "Kata sandi harus mengandung karakter spesial."));
        }


        if (namaLengkap == null || namaLengkap.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("pesan", "Nama lengkap wajib diisi."));
        }

        // 2. Cek apakah username sudah terdaftar
        if (userRepository.existsByUsername(username.trim())) {
            return ResponseEntity.badRequest().body(Map.of("pesan", "Username '" + username.trim() + "' sudah terdaftar. Silakan pilih username lain."));
        }

        // 3. Normalisasi Role sesuai nilai standar sistem
        String roleFinal = "PETUGAS_LAPANGAN";
        if (roleInput != null && !roleInput.trim().isEmpty()) {
            String r = roleInput.trim().toLowerCase();
            if (r.equals("rs") || r.contains("manajemen")) {
                roleFinal = "Manajemen RS";
            } else if (r.equals("admin")) {
                roleFinal = "ADMIN";
            } else if (r.equals("field") || r.contains("petugas") || r.equals("technician") || r.contains("teknisi")) {
                roleFinal = "PETUGAS_LAPANGAN";
            } else {
                roleFinal = roleInput.trim();
            }
        }

        // 4. Buat objek User baru dan simpan ke database
        User newUser = new User(username.trim(), password, namaLengkap.trim(), roleFinal);
        User savedUser = userRepository.save(newUser);

        return ResponseEntity.ok(Map.of(
            "status",      "SUKSES",
            "pesan",       "Registrasi akun berhasil. Silakan login.",
            "idUser",      savedUser.getIdUser(),
            "username",    savedUser.getUsername(),
            "namaLengkap", savedUser.getNamaLengkap(),
            "role",        savedUser.getRole()
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
