package com.spct.model; // Nama package dari modul model entitas sistem

// Import pustaka persistensi database Jakarta JPA
import jakarta.persistence.*;
// Import tipe data waktu LocalDateTime java untuk mencatat timestamp registrasi
import java.time.LocalDateTime;

// Kelas entitas publik java DataKendaraan untuk memetakan tabel data_kendaraan di database relasional
// Kelas ini menyimpan data master identitas kendaraan (plat nomor dan jenis kendaraan)
@Entity // Menandai kelas ini sebagai entitas JPA
@Table(name = "data_kendaraan") // Memetakan kelas ke tabel data_kendaraan
public class DataKendaraan
{
    // =====================================================================
    // Deklarasi Atribut Kolom Tabel data_kendaraan
    // =====================================================================

    @Id // Menandai atribut idKendaraan sebagai Primary Key tabel
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Menggunakan strategi penomoran otomatis auto-increment database
    @Column(name = "id_kendaraan") // Pemetaan kolom id_kendaraan di tabel
    private Long idKendaraan; // Deklarasi atribut idKendaraan bertipe Long untuk identitas unik kendaraan

    @Column(name = "plat_nomor", nullable = false, unique = true, length = 15) // Kolom nomor plat unik berpanjang 15 karakter
    private String platNomor; // Deklarasi atribut platNomor bertipe String untuk nomor plat kendaraan

    @Enumerated(EnumType.STRING) // Menyimpan nilai enum JenisKendaraan sebagai string teks
    @Column(name = "jenis_kendaraan", nullable = false) // Pemetaan kolom jenis_kendaraan dengan batasan not-null
    private JenisKendaraan jenisKendaraan; // Deklarasi atribut jenisKendaraan bertipe enum JenisKendaraan (MOBIL/MOTOR)

    @Column(name = "waktu_registrasi_pertama", nullable = false) // Pemetaan kolom waktu_registrasi_pertama not-null
    private LocalDateTime waktuRegistrasiPertama; // Deklarasi atribut waktuRegistrasiPertama bertipe LocalDateTime

    // =====================================================================
    // Konstruktor Kelas DataKendaraan
    // =====================================================================

    // Konstruktor dengan parameter platNomor dan jenisKendaraan untuk registrasi kendaraan baru
    public DataKendaraan(String platNomor, JenisKendaraan jenisKendaraan)
    {
        this.platNomor = platNomor; // Inisialisasi atribut platNomor dengan parameter platNomor
        this.jenisKendaraan = jenisKendaraan; // Inisialisasi atribut jenisKendaraan dengan parameter jenisKendaraan
        this.waktuRegistrasiPertama = LocalDateTime.now(); // Inisialisasi atribut waktuRegistrasiPertama dengan waktu sistem saat ini
    }

    // Konstruktor default tanpa parameter untuk JPA Hibernate
    public DataKendaraan() 
    {
        // Konstruktor kosong untuk instansiasi JPA Hibernate
    }

    // =====================================================================
    // Method Setter & Getter Atribut
    // =====================================================================

    // Method setter setIdKendaraan untuk mengubah nilai atribut idKendaraan
    public void setIdKendaraan(Long idKendaraan)
    {
        this.idKendaraan = idKendaraan; // Inisialisasi atribut idKendaraan dengan parameter
    }

    // Method getter getIdKendaraan untuk mengambil nilai atribut idKendaraan
    public Long getIdKendaraan()
    {
        return idKendaraan; // Mengembalikan nilai dari atribut idKendaraan
    }

    // Method setter setPlatNomor untuk mengubah nilai nomor plat kendaraan
    public void setPlatNomor(String platNomor)
    {
        this.platNomor = platNomor; // Inisialisasi atribut platNomor dengan parameter
    }

    // Method getter getPlatNomor untuk mengambil nilai nomor plat kendaraan
    public String getPlatNomor()
    {
        return platNomor; // Mengembalikan nilai dari atribut platNomor
    }

    // Method setter setJenisKendaraan untuk mengubah tipe jenis kendaraan
    public void setJenisKendaraan(JenisKendaraan jenisKendaraan)
    {
        this.jenisKendaraan = jenisKendaraan; // Inisialisasi atribut jenisKendaraan dengan parameter
    }

    // Method getter getJenisKendaraan untuk mengambil tipe jenis kendaraan
    public JenisKendaraan getJenisKendaraan()
    {
        return jenisKendaraan; // Mengembalikan nilai dari atribut jenisKendaraan
    }

    // Method setter setWaktuRegistrasiPertama untuk mengubah timestamp registrasi pertama
    public void setWaktuRegistrasiPertama(LocalDateTime waktuRegistrasiPertama)
    {
        this.waktuRegistrasiPertama = waktuRegistrasiPertama; // Inisialisasi atribut waktuRegistrasiPertama dengan parameter
    }

    // Method getter getWaktuRegistrasiPertama untuk mengambil timestamp registrasi pertama
    public LocalDateTime getWaktuRegistrasiPertama()
    {
        return waktuRegistrasiPertama; // Mengembalikan nilai dari atribut waktuRegistrasiPertama
    }
}