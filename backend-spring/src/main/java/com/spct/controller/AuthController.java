package com.spct.controller; // Nama package dari modul pengontrol REST API sistem

// Import entitas User dari package model
import com.spct.model.User;
// Import repositori UserRepository dari package repository
import com.spct.repository.UserRepository;
// Import anotasi Autowired dari Spring Framework
import org.springframework.beans.factory.annotation.Autowired;
// Import kelas ResponseEntity dari Spring HTTP
import org.springframework.http.ResponseEntity;
// Import anotasi-anotasi Spring Web REST Controller
import org.springframework.web.bind.annotation.*;

// Import antarmuka Map dari java util untuk struktur payload request/response JSON
import java.util.Map;
// Import kelas utilitas Optional dari java util
import java.util.Optional;

// Kelas pengontrol publik java AuthController untuk menangani otentikasi login, reset kata sandi, dan registrasi akun
@RestController // Menandai kelas sebagai pengendali REST API
@RequestMapping("/api/auth") // Menetapkan path rute dasar endpoint /api/auth
@CrossOrigin(origins = "*") // Mengizinkan permintaan lintas domain dari Web Dashboard
public class AuthController
{
    // Injeksi otomatis dependensi repositori UserRepository oleh Spring
    @Autowired
    private UserRepository userRepository; // Deklarasi atribut userRepository bertipe UserRepository

    // =====================================================================
    // Endpoint POST: Reset Kata Sandi Pengguna Berdasarkan NIP/Username
    // =====================================================================

    // Method POST resetPassword untuk memperbarui kata sandi akun pengguna
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) 
    {
        // Mengambil data NIP dari payload request
        String nip = body.get("nip");
        // Mengambil data username dari payload request
        String username = body.get("username");
        // Mengambil data email dari payload request sebagai alternatif
        String email = body.get("email");
        // Mengambil kata sandi baru dari payload request
        String newPassword = body.get("newPassword");

        // Jika atribut newPassword kosong, coba periksa kunci passwordBaru
        if (newPassword == null || newPassword.trim().isEmpty()) 
        {
            newPassword = body.get("passwordBaru");
        }

        // Jika kata sandi baru tetap kosong, maka:
        if (newPassword == null || newPassword.trim().isEmpty()) 
        {
            // Kembalikan status HTTP 400 Bad Request dengan pesan peringatan
            return ResponseEntity.badRequest().body(Map.of("pesan", "Kata sandi baru wajib diisi."));
        }

        // Jika panjang kata sandi kurang dari 8 karakter, maka:
        if (newPassword.length() < 8) 
        {
            // Kembalikan status HTTP 400 Bad Request dengan peringatan panjang minimal
            return ResponseEntity.badRequest().body(Map.of("pesan", "Kata sandi minimal 8 karakter."));
        }

        // Jika kata sandi tidak mengandung angka, maka:
        if (!newPassword.matches(".*\\d.*")) 
        {
            // Kembalikan status HTTP 400 Bad Request dengan peringatan kombinasi angka
            return ResponseEntity.badRequest().body(Map.of("pesan", "Kata sandi harus mengandung kombinasi angka."));
        }

        // Jika kata sandi tidak mengandung karakter khusus, maka:
        if (!newPassword.matches(".*[^A-Za-z0-9].*")) 
        {
            // Kembalikan status HTTP 400 Bad Request dengan peringatan karakter khusus
            return ResponseEntity.badRequest().body(Map.of("pesan", "Kata sandi harus mengandung kombinasi karakter khusus."));
        }

        // Deklarasi wadah Optional untuk menampung objek entitas User yang ditemukan
        Optional<User> userOpt = Optional.empty();

        // Jika parameter NIP diisi oleh pengguna, maka:
        if (nip != null && !nip.trim().isEmpty()) 
        {
            // Menghilangkan spasi pada teks NIP
            String cleanNip = nip.trim();

            // Jika format NIP bukan 8 digit angka, maka:
            if (!cleanNip.matches("^\\d{8}$")) 
            {
                // Kembalikan status HTTP 400 Bad Request format NIP tidak sesuai
                return ResponseEntity.badRequest().body(Map.of("pesan", "NIP harus berupa 8 digit angka."));
            }

            // Mencari user berdasarkan nomor NIP di database
            userOpt = userRepository.findByNip(cleanNip);

            // Jika user tidak ditemukan, maka:
            if (userOpt.isEmpty()) 
            {
                // Kembalikan status HTTP 404 Not Found dengan pesan NIP tidak terdaftar
                return ResponseEntity.status(404).body(Map.of("pesan", "NIP tidak terdaftar dalam sistem."));
            }
        } 
        // Jika NIP kosong namun username ada, maka:
        else if (username != null && !username.trim().isEmpty()) 
        {
            // Mencari user berdasarkan username di database
            userOpt = userRepository.findByUsername(username.trim());

            // Jika username tidak ditemukan, maka:
            if (userOpt.isEmpty()) 
            {
                // Kembalikan status HTTP 404 Not Found
                return ResponseEntity.status(404).body(Map.of("pesan", "Username tidak ditemukan."));
            }
        } 
        // Jika username kosong namun email ada, maka:
        else if (email != null && !email.trim().isEmpty()) 
        {
            // Mencari user berdasarkan identitas email/username
            userOpt = userRepository.findByUsername(email.trim());

            // Jika pengguna tidak ditemukan, maka:
            if (userOpt.isEmpty()) 
            {
                // Kembalikan status HTTP 404 Not Found
                return ResponseEntity.status(404).body(Map.of("pesan", "Pengguna tidak ditemukan."));
            }
        } 
        else // Jika tidak ada parameter identitas yang disertakan, maka:
        {
            // Kembalikan status HTTP 400 Bad Request
            return ResponseEntity.badRequest().body(Map.of("pesan", "NIP wajib diisi."));
        }

        // Mengambil objek User dari Optional yang telah divalidasi keberadaannya
        User user = userOpt.get();

        // Mengubah nilai kata sandi pengguna dengan kata sandi baru
        user.setPassword(newPassword);

        // Menyimpan perubahan data entitas user ke database
        userRepository.save(user);

        // Mengembalikan respons HTTP 200 OK dengan pesan sukses pembaruan
        return ResponseEntity.ok(Map.of("pesan", "Kata sandi berhasil diperbarui. Silakan masuk kembali."));
    }

    // =====================================================================
    // Endpoint POST: Otentikasi Masuk (Login) ke Dashboard
    // =====================================================================

    // Method POST login untuk memverifikasi kredensial akun pengguna
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) 
    {
        // Mengambil username dari payload request
        String identifier = body.get("username");

        // Jika username kosong, periksa apakah NIP dikirim
        if (identifier == null || identifier.trim().isEmpty()) 
        {
            identifier = body.get("nip");
        }

        // Jika masih kosong, periksa parameter identifier umum
        if (identifier == null || identifier.trim().isEmpty()) 
        {
            identifier = body.get("identifier");
        }

        // Mengambil kata sandi dari payload request
        String password = body.get("password");

        // Jika identitas atau kata sandi tidak diisi, maka:
        if (identifier == null || identifier.trim().isEmpty() || password == null || password.trim().isEmpty())
        {
            // Kembalikan respons HTTP 400 Bad Request
            return ResponseEntity.badRequest().body(Map.of("pesan", "Username/NIP dan kata sandi wajib diisi."));
        }

        // Menghilangkan spasi depan dan belakang dari identifier
        String cleanIdentifier = identifier.trim();

        // Mencari akun pengguna di database berdasarkan username atau NIP
        Optional<User> userOpt = userRepository.findByUsernameOrNip(cleanIdentifier, cleanIdentifier);

        // Jika akun tidak ditemukan, maka:
        if (userOpt.isEmpty())
        {
            // Kembalikan status HTTP 401 Unauthorized dengan pesan peringatan
            return ResponseEntity.status(401).body(Map.of("pesan", "Username atau NIP tidak ditemukan."));
        }

        // Mengambil objek entitas User dari Optional
        User user = userOpt.get();

        // Jika kata sandi yang dimasukkan tidak cocok dengan di database, maka:
        if (!user.getPassword().equals(password))
        {
            // Kembalikan status HTTP 401 Unauthorized dengan pesan kata sandi salah
            return ResponseEntity.status(401).body(Map.of("pesan", "Kata sandi salah."));
        }

        // Jika akun berstatus tidak aktif, maka:
        if (!user.getAktif())
        {
            // Kembalikan status HTTP 403 Forbidden dengan pesan akun dinonaktifkan
            return ResponseEntity.status(403).body(Map.of("pesan", "Akun Anda telah dinonaktifkan."));
        }

        // Login berhasil: kembalikan respons HTTP 200 OK dengan membawa data profil pengguna
        return ResponseEntity.ok(Map.of(
            "idUser",      user.getIdUser(), // Mengembalikan nilai idUser
            "username",    user.getUsername(), // Mengembalikan nilai username
            "namaLengkap", user.getNamaLengkap(), // Mengembalikan nilai namaLengkap
            "role",        user.getRole(), // Mengembalikan nilai role hak akses
            "nip",         user.getNip() != null ? user.getNip() : "" // Mengembalikan NIP
        ));
    }

    // =====================================================================
    // Endpoint POST: Registrasi Akun Pengguna Baru
    // =====================================================================

    // Method POST register untuk mendaftarkan akun staf/petugas baru
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body)
    {
        // Mengambil username dari payload request
        String username = body.get("username");
        // Mengambil password dari payload request
        String password = body.get("password");
        // Mengambil NIP dari payload request
        String nip = body.get("nip");
        // Mengambil nama lengkap dari payload request
        String namaLengkap = body.get("namaLengkap");

        // Jika namaLengkap kosong, gunakan kunci fullName
        if (namaLengkap == null || namaLengkap.trim().isEmpty()) 
        {
            namaLengkap = body.get("fullName");
        }

        // Mengambil role input dari payload request
        String roleInput = body.get("role");

        // Validasi: nama lengkap wajib diisi
        if (namaLengkap == null || namaLengkap.trim().isEmpty()) 
        {
            return ResponseEntity.badRequest().body(Map.of("pesan", "Nama lengkap wajib diisi."));
        }

        // Validasi: NIP wajib diisi
        if (nip == null || nip.trim().isEmpty()) 
        {
            return ResponseEntity.badRequest().body(Map.of("pesan", "NIP wajib diisi."));
        }

        // Membersihkan spasi pada NIP
        String cleanNip = nip.trim();

        // Validasi: format NIP harus 8 digit angka
        if (!cleanNip.matches("^\\d{8}$")) 
        {
            return ResponseEntity.badRequest().body(Map.of("pesan", "NIP harus berupa 8 digit angka."));
        }

        // Validasi: periksa apakah NIP sudah pernah terdaftar
        if (userRepository.existsByNip(cleanNip)) 
        {
            return ResponseEntity.badRequest().body(Map.of("pesan", "NIP '" + cleanNip + "' sudah terdaftar. Silakan gunakan NIP lain."));
        }

        // Validasi: username wajib diisi
        if (username == null || username.trim().isEmpty()) 
        {
            return ResponseEntity.badRequest().body(Map.of("pesan", "Username wajib diisi."));
        }

        // Validasi: periksa apakah username sudah terdaftar
        if (userRepository.existsByUsername(username.trim())) 
        {
            return ResponseEntity.badRequest().body(Map.of("pesan", "Username '" + username.trim() + "' sudah terdaftar. Silakan pilih username lain."));
        }

        // Validasi: kata sandi wajib diisi
        if (password == null || password.trim().isEmpty()) 
        {
            return ResponseEntity.badRequest().body(Map.of("pesan", "Kata sandi wajib diisi."));
        }

        // Validasi: panjang minimal kata sandi 8 karakter
        if (password.length() < 8) 
        {
            return ResponseEntity.badRequest().body(Map.of("pesan", "Kata sandi minimal 8 karakter."));
        }

        // Validasi: kata sandi harus mengandung angka
        if (!password.matches(".*\\d.*")) 
        {
            return ResponseEntity.badRequest().body(Map.of("pesan", "Kata sandi harus mengandung kombinasi angka."));
        }

        // Validasi: kata sandi harus mengandung karakter khusus
        if (!password.matches(".*[^A-Za-z0-9].*")) 
        {
            return ResponseEntity.badRequest().body(Map.of("pesan", "Kata sandi harus mengandung kombinasi karakter khusus."));
        }

        // Inisialisasi peran standar default PETUGAS_LAPANGAN
        String roleFinal = "PETUGAS_LAPANGAN";

        // Jika input peran diberikan, tentukan peran yang sesuai
        if (roleInput != null && !roleInput.trim().isEmpty()) 
        {
            String r = roleInput.trim().toLowerCase();
            // Jika role berisi kata manajemen atau rs, ubah menjadi Manajemen RS
            if (r.equals("rs") || r.contains("manajemen")) 
            {
                roleFinal = "Manajemen RS";
            } 
            // Jika role adalah admin, ubah menjadi ADMIN
            else if (r.equals("admin")) 
            {
                roleFinal = "ADMIN";
            } 
            // Jika role adalah teknisi atau petugas lapangan
            else if (r.equals("field") || r.contains("petugas") || r.equals("technician") || r.contains("teknisi")) 
            {
                roleFinal = "PETUGAS_LAPANGAN";
            } 
            else 
            {
                roleFinal = roleInput.trim();
            }
        }

        // Instansiasi objek User baru dengan nilai parameter yang telah divalidasi
        User newUser = new User(username.trim(), password, namaLengkap.trim(), roleFinal, cleanNip);

        // Menyimpan entitas akun user baru ke dalam database melalui repository
        User savedUser = userRepository.save(newUser);

        // Mengembalikan respons HTTP 200 OK dengan informasi konfirmasi registrasi
        return ResponseEntity.ok(Map.of(
            "status",      "SUKSES", // Status operasi
            "pesan",       "Registrasi akun berhasil. Silakan login.", // Pesan sukses
            "idUser",      savedUser.getIdUser(), // ID akun yang terbentuk
            "username",    savedUser.getUsername(), // Username terdaftar
            "namaLengkap", savedUser.getNamaLengkap(), // Nama lengkap terdaftar
            "role",        savedUser.getRole(), // Hak akses role
            "nip",         savedUser.getNip() != null ? savedUser.getNip() : "" // NIP pegawai
        ));
    }

    // =====================================================================
    // Endpoint GET: Mengambil Seluruh Daftar Akun Pengguna
    // =====================================================================

    // Method GET getAllUsers untuk mengambil seluruh daftar pengguna terdaftar
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers()
    {
        // Mengembalikan seluruh daftar data akun pengguna dari basis data
        return ResponseEntity.ok(userRepository.findAll());
    }
}
