package com.spct.model;

import jakarta.persistence.*;

// Deklarasi Entity: merepresentasikan tabel 'users' di Database Relasional
// Tabel ini menyimpan akun petugas dan admin yang dapat login ke Dashboard Web
// Sesuai ERD: Role TIDAK dijadikan tabel terpisah, melainkan ATRIBUT string di dalam tabel ini
@Entity
@Table(name = "users")
public class User
{
    // =====================================================================
    // Deklarasi Atribut: Kolom-kolom tabel 'users'
    // =====================================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment oleh database
    @Column(name = "id_user")
    private Long idUser; // ID unik user sebagai primary key

    @Column(name = "username", nullable = false, unique = true, length = 50)
    private String username; // Username unik untuk login ke Dashboard

    @Column(name = "password", nullable = false, length = 255)
    private String password; // Password (disimpan sebagai hash BCrypt di produksi)

    @Column(name = "nama_lengkap", nullable = false, length = 100)
    private String namaLengkap; // Nama lengkap pengguna untuk ditampilkan di UI Dashboard

    // Sesuai keputusan arsitektur: Role sebagai atribut VARCHAR, bukan tabel terpisah
    // Nilai: "ADMIN" atau "PETUGAS_LAPANGAN"
    @Column(name = "role", nullable = false, length = 30)
    private String role; // Peran pengguna dalam sistem

    @Column(name = "aktif", nullable = false)
    private Boolean aktif = true; // Status akun: true = aktif, false = dinonaktifkan


    // =====================================================================
    // Konstruktor LENGKAP (gaya penulisan Anda)
    // =====================================================================
    public User(String username, String password, String namaLengkap, String role)
    {
        this.username = username;       // Menginisialisasi atribut username
        this.password = password;       // Menginisialisasi atribut password
        this.namaLengkap = namaLengkap; // Menginisialisasi atribut namaLengkap
        this.role = role;               // Menginisialisasi atribut role
        this.aktif = true;              // Akun baru selalu aktif secara default
    }

    // Konstruktor kosong (wajib ada untuk JPA/Hibernate)
    public User() {}


    // =====================================================================
    // Getter & Setter (gaya penulisan Anda)
    // =====================================================================

    public void setIdUser(Long idUser)
    {
        this.idUser = idUser;
    }

    public Long getIdUser()
    {
        return idUser;
    }

    public void setUsername(String username)
    {
        this.username = username;
    }

    public String getUsername()
    {
        return username;
    }

    public void setPassword(String password)
    {
        this.password = password;
    }

    public String getPassword()
    {
        return password;
    }

    public void setNamaLengkap(String namaLengkap)
    {
        this.namaLengkap = namaLengkap;
    }

    public String getNamaLengkap()
    {
        return namaLengkap;
    }

    public void setRole(String role)
    {
        this.role = role;
    }

    public String getRole()
    {
        return role;
    }

    public void setAktif(Boolean aktif)
    {
        this.aktif = aktif;
    }

    public Boolean getAktif()
    {
        return aktif;
    }
}
