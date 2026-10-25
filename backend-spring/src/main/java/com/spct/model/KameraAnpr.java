package com.spct.model; // Nama package dari modul model entitas sistem

// Import library persistensi database Jakarta JPA
import jakarta.persistence.*;

// Kelas entitas publik java KameraAnpr untuk memetakan tabel kamera_anpr di database relasional
// Tabel ini mencatat data master perangkat kamera ALPR/ANPR di gerbang masuk dan keluar
@Entity // Menandakan kelas ini sebagai entitas JPA yang dipetakan ke tabel basis data
@Table(name = "kamera_anpr") // Menentukan nama tabel basis data relasional yaitu kamera_anpr
public class KameraAnpr
{
    // =====================================================================
    // Deklarasi Atribut Kolom Tabel kamera_anpr
    // =====================================================================

    @Id // Menandai atribut idKamera sebagai Primary Key entitas
    @Column(name = "id_kamera", length = 20) // Pemetaan kolom id_kamera dengan panjang karakter maksimal 20
    private String idKamera; // Deklarasi atribut idKamera bertipe String untuk identitas unik kamera (misal: PG-IN-MOB)

    @Column(name = "status_kamera", nullable = false, length = 3) // Pemetaan kolom status_kamera dengan batasan not-null
    private String statusKamera; // Deklarasi atribut statusKamera bertipe String untuk status operasional (ON/OFF)

    @Column(name = "posisi_gerbang", nullable = false, length = 10) // Pemetaan kolom posisi_gerbang dengan batasan not-null
    private String posisiGerbang; // Deklarasi atribut posisiGerbang bertipe String untuk lokasi gerbang (MASUK/KELUAR)

    @Enumerated(EnumType.STRING) // Menyimpan representasi enum JenisKendaraan sebagai string teks di database
    @Column(name = "tipe_kendaraan", length = 10) // Pemetaan kolom tipe_kendaraan dengan panjang maksimal 10
    private JenisKendaraan tipeKendaraan; // Deklarasi atribut tipeKendaraan bertipe enum JenisKendaraan (MOBIL/MOTOR)

    @Column(name = "deskripsi", length = 200) // Pemetaan kolom deskripsi lokasi kamera dengan panjang maksimal 200 karakter
    private String deskripsi; // Deklarasi atribut deskripsi bertipe String untuk keterangan detail posisi fisik kamera

    // =====================================================================
    // Konstruktor Kelas KameraAnpr
    // =====================================================================

    // Konstruktor berparameter lengkap untuk inisialisasi master data kamera
    public KameraAnpr(String idKamera, String posisiGerbang, JenisKendaraan tipeKendaraan, String deskripsi)
    {
        this.idKamera = idKamera; // Inisialisasi atribut idKamera dengan nilai parameter idKamera
        this.posisiGerbang = posisiGerbang; // Inisialisasi atribut posisiGerbang dengan nilai parameter posisiGerbang
        this.tipeKendaraan = tipeKendaraan; // Inisialisasi atribut tipeKendaraan dengan nilai parameter tipeKendaraan
        this.deskripsi = deskripsi; // Inisialisasi atribut deskripsi dengan nilai parameter deskripsi
        this.statusKamera = "ON"; // Inisialisasi status default perangkat kamera bernilai ON
    }

    // Konstruktor default tanpa parameter (diperlukan oleh framework Hibernate/JPA)
    public KameraAnpr() 
    {
        // Konstruktor kosong untuk instansiasi reflektif JPA
    }

    // =====================================================================
    // Method Setter & Getter Atribut
    // =====================================================================

    // Method setter untuk mengubah nilai atribut idKamera
    public void setIdKamera(String idKamera)
    {
        this.idKamera = idKamera; // Inisialisasi atribut idKamera dengan nilai dari parameter
    }

    // Method getter untuk mengambil nilai atribut idKamera
    public String getIdKamera()
    {
        return idKamera; // Mengembalikan nilai dari atribut idKamera
    }

    // Method setter untuk mengubah nilai status operasional kamera
    public void setStatusKamera(String statusKamera)
    {
        // Jika parameter tidak null, ubah ke huruf kapital; jika null beri nilai default "OFF"
        this.statusKamera = (statusKamera != null) ? statusKamera.toUpperCase() : "OFF";
    }

    // Method getter untuk mengambil nilai status operasional kamera
    public String getStatusKamera()
    {
        return statusKamera; // Mengembalikan nilai dari atribut statusKamera
    }

    // Method setter untuk mengubah nilai atribut posisiGerbang
    public void setPosisiGerbang(String posisiGerbang)
    {
        this.posisiGerbang = posisiGerbang; // Inisialisasi atribut posisiGerbang dengan nilai dari parameter
    }

    // Method getter untuk mengambil nilai atribut posisiGerbang
    public String getPosisiGerbang()
    {
        return posisiGerbang; // Mengembalikan nilai dari atribut posisiGerbang
    }

    // Method setter untuk mengubah tipe kendaraan pantauan kamera
    public void setTipeKendaraan(JenisKendaraan tipeKendaraan)
    {
        this.tipeKendaraan = tipeKendaraan; // Inisialisasi atribut tipeKendaraan dengan nilai dari parameter
    }

    // Method getter untuk mengambil tipe kendaraan pantauan kamera
    public JenisKendaraan getTipeKendaraan()
    {
        return tipeKendaraan; // Mengembalikan nilai dari atribut tipeKendaraan
    }

    // Method setter untuk mengubah deskripsi keterangan kamera
    public void setDeskripsi(String deskripsi)
    {
        this.deskripsi = deskripsi; // Inisialisasi atribut deskripsi dengan nilai dari parameter
    }

    // Method getter untuk mengambil keterangan deskripsi kamera
    public String getDeskripsi()
    {
        return deskripsi; // Mengembalikan nilai dari atribut deskripsi
    }
}
