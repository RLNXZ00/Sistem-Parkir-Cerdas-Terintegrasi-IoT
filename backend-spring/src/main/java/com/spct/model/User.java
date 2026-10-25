package com.spct.model; // Nama package dari modul model entitas sistem

// Import pustaka persistensi database Jakarta JPA
import jakarta.persistence.*;

// Kelas entitas publik java User untuk memetakan tabel users di database relasional
// Kelas ini merepresentasikan akun otentikasi petugas dan administrator sistem
@Entity // Menandai kelas ini sebagai entitas JPA
@Table(name = "users") // Memetakan kelas ke tabel users di basis data
public class User
{
    // =====================================================================
    // Deklarasi Atribut Kolom Tabel users
    // =====================================================================

    @Id // Menandai atribut idUser sebagai Primary Key tabel
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Menggunakan strategi penomoran otomatis auto-increment
    @Column(name = "id_user") // Pemetaan nama kolom id_user
    private Long idUser; // Deklarasi atribut idUser bertipe Long untuk identitas unik akun pengguna

    @Column(name = "username", nullable = false, unique = true, length = 50) // Kolom nama pengguna unik
    private String username; // Deklarasi atribut username bertipe String untuk nama login sistem

    @Column(name = "password", nullable = false, length = 255) // Kolom kata sandi terenkripsi
    private String password; // Deklarasi atribut password bertipe String untuk kata sandi akun

    @Column(name = "nama_lengkap", nullable = false, length = 100) // Kolom nama lengkap akun
    private String namaLengkap; // Deklarasi atribut namaLengkap bertipe String untuk nama resmi pengguna

    @Column(name = "role", nullable = false, length = 30) // Kolom peran pengguna dalam sistem
    private String role; // Deklarasi atribut role bertipe String (ADMIN atau PETUGAS_LAPANGAN)

    @Column(name = "nip", length = 8, unique = true) // Kolom Nomor Induk Pegawai unik 8 digit
    private String nip; // Deklarasi atribut nip bertipe String untuk NIP resmi staf

    @Column(name = "aktif", nullable = false) // Kolom status keaktifan akun pengguna
    private Boolean aktif = true; // Deklarasi atribut aktif bertipe Boolean dengan inisialisasi default true

    // =====================================================================
    // Konstruktor Kelas User
    // =====================================================================

    // Konstruktor berparameter tanpa NIP
    public User(String username, String password, String namaLengkap, String role)
    {
        this.username = username; // Inisialisasi atribut username dengan parameter username
        this.password = password; // Inisialisasi atribut password dengan parameter password
        this.namaLengkap = namaLengkap; // Inisialisasi atribut namaLengkap dengan parameter namaLengkap
        this.role = role; // Inisialisasi atribut role dengan parameter role
        this.aktif = true; // Inisialisasi status akun bernilai aktif secara default
    }

    // Konstruktor berparameter lengkap termasuk NIP
    public User(String username, String password, String namaLengkap, String role, String nip)
    {
        this.username = username; // Inisialisasi atribut username dengan parameter username
        this.password = password; // Inisialisasi atribut password dengan parameter password
        this.namaLengkap = namaLengkap; // Inisialisasi atribut namaLengkap dengan parameter namaLengkap
        this.role = role; // Inisialisasi atribut role dengan parameter role
        this.nip = nip; // Inisialisasi atribut nip dengan parameter nip
        this.aktif = true; // Inisialisasi status akun bernilai aktif secara default
    }

    // Konstruktor default tanpa parameter untuk JPA Hibernate
    public User() 
    {
        // Konstruktor kosong untuk instansiasi JPA Hibernate
    }

    // =====================================================================
    // Method Setter & Getter Atribut
    // =====================================================================

    // Method setter setIdUser untuk mengubah nilai atribut idUser
    public void setIdUser(Long idUser)
    {
        this.idUser = idUser; // Inisialisasi atribut idUser dengan parameter
    }

    // Method getter getIdUser untuk mengambil nilai atribut idUser
    public Long getIdUser()
    {
        return idUser; // Mengembalikan nilai dari atribut idUser
    }

    // Method setter setUsername untuk mengubah nama login akun
    public void setUsername(String username)
    {
        this.username = username; // Inisialisasi atribut username dengan parameter
    }

    // Method getter getUsername untuk mengambil nama login akun
    public String getUsername()
    {
        return username; // Mengembalikan nilai dari atribut username
    }

    // Method setter setPassword untuk mengubah kata sandi akun
    public void setPassword(String password)
    {
        this.password = password; // Inisialisasi atribut password dengan parameter
    }

    // Method getter getPassword untuk mengambil kata sandi akun
    public String getPassword()
    {
        return password; // Mengembalikan nilai dari atribut password
    }

    // Method setter setNamaLengkap untuk mengubah nama lengkap pengguna
    public void setNamaLengkap(String namaLengkap)
    {
        this.namaLengkap = namaLengkap; // Inisialisasi atribut namaLengkap dengan parameter
    }

    // Method getter getNamaLengkap untuk mengambil nama lengkap pengguna
    public String getNamaLengkap()
    {
        return namaLengkap; // Mengembalikan nilai dari atribut namaLengkap
    }

    // Method setter setRole untuk mengubah hak akses peran pengguna
    public void setRole(String role)
    {
        this.role = role; // Inisialisasi atribut role dengan parameter
    }

    // Method getter getRole untuk mengambil hak akses peran pengguna
    public String getRole()
    {
        return role; // Mengembalikan nilai dari atribut role
    }

    // Method setter setAktif untuk mengubah status keaktifan akun
    public void setAktif(Boolean aktif)
    {
        this.aktif = aktif; // Inisialisasi atribut aktif dengan parameter
    }

    // Method getter getAktif untuk mengambil status keaktifan akun
    public Boolean getAktif()
    {
        return aktif; // Mengembalikan nilai dari atribut aktif
    }

    // Method setter setNip untuk mengubah Nomor Induk Pegawai
    public void setNip(String nip)
    {
        this.nip = nip; // Inisialisasi atribut nip dengan parameter
    }

    // Method getter getNip untuk mengambil Nomor Induk Pegawai
    public String getNip()
    {
        return nip; // Mengembalikan nilai dari atribut nip
    }
}
