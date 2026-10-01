package com.spct.model;

import jakarta.persistence.*;
import java.time.LocalDateTime; // Mengimpor kelas LocalDateTime untuk menyimpan waktu registrasi pertama

// Deklarasi Enum JenisKendaraan: merepresentasikan tipe kendaraan yang masuk ke sistem
enum JenisKendaraan
{
    MOBIL, // Kendaraan roda empat
    MOTOR  // Kendaraan roda dua
}

// Deklarasi Entity: merepresentasikan tabel 'data_kendaraan' di Database Relasional
// Setara dengan kelas Proyek.java / Tugas.java Anda namun terhubung ke database via JPA
@Entity
@Table(name = "data_kendaraan") // Mendefinisikan nama tabel di database
public class DataKendaraan // Kelas model untuk menyimpan data identitas setiap kendaraan yang pernah terdaftar
{
    // =====================================================================
    // Deklarasi Atribut: Kolom-kolom tabel 'data_kendaraan'
    // =====================================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment oleh database
    @Column(name = "id_kendaraan")
    private Long idKendaraan; // ID unik auto-increment sebagai primary key (setara kodeEvent di Reminder.java Anda)

    @Column(name = "plat_nomor", nullable = false, unique = true, length = 15)
    private String platNomor; // Nomor plat kendaraan (misal: "AB1234XY") - harus unik untuk pencocokan OCR YOLO

    @Enumerated(EnumType.STRING) // Menyimpan nama Enum sebagai String di database (bukan angka index)
    @Column(name = "jenis_kendaraan", nullable = false)
    private JenisKendaraan jenisKendaraan; // Tipe kendaraan: MOBIL atau MOTOR (menentukan slot yang dialokasikan)

    @Column(name = "waktu_registrasi_pertama", nullable = false)
    private LocalDateTime waktuRegistrasiPertama; // Timestamp pertama kali kendaraan ini dikenali oleh sistem


    // =====================================================================
    // Konstruktor LENGKAP untuk CRUD/Database (gaya penulisan Anda)
    // =====================================================================
    public DataKendaraan(String platNomor, JenisKendaraan jenisKendaraan)
    {
        this.platNomor = platNomor;                                     // Menginisialisasi atribut platNomor
        this.jenisKendaraan = jenisKendaraan;                           // Menginisialisasi atribut jenisKendaraan
        this.waktuRegistrasiPertama = LocalDateTime.now();              // Inisialisasi waktu registrasi dengan waktu sekarang
    }

    // Konstruktor kosong (wajib ada untuk JPA/Hibernate agar bisa membuat objek dari data database)
    public DataKendaraan() {}


    // =====================================================================
    // Getter & Setter (gaya penulisan Anda)
    // =====================================================================

    public Long getIdKendaraan() // Deklarasi method getter untuk idKendaraan
    {
        return idKendaraan; // Mengembalikan nilai atribut idKendaraan
    }

    public String getPlatNomor() // Deklarasi method getter untuk platNomor
    {
        return platNomor; // Mengembalikan nilai atribut platNomor
    }

    public void setPlatNomor(String platNomor) // Deklarasi method setter untuk platNomor
    {
        this.platNomor = platNomor; // Mengubah nilai atribut platNomor
    }

    public JenisKendaraan getJenisKendaraan() // Deklarasi method getter untuk jenisKendaraan
    {
        return jenisKendaraan; // Mengembalikan nilai atribut jenisKendaraan
    }

    public void setJenisKendaraan(JenisKendaraan jenisKendaraan) // Deklarasi method setter untuk jenisKendaraan
    {
        this.jenisKendaraan = jenisKendaraan; // Mengubah nilai atribut jenisKendaraan
    }

    public LocalDateTime getWaktuRegistrasiPertama() // Deklarasi method getter untuk waktuRegistrasiPertama
    {
        return waktuRegistrasiPertama; // Mengembalikan nilai atribut waktuRegistrasiPertama
    }
}