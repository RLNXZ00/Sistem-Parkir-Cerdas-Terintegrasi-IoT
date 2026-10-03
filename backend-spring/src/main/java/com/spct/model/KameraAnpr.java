package com.spct.model;

import jakarta.persistence.*;

// Deklarasi Entity: merepresentasikan tabel 'kamera_anpr' di Database Relasional
// Tabel ini adalah tabel MASTER HARDWARE yang meregistrasikan ke-4 unit kamera ALPR/ANPR
// yang terpasang di sistem parkir (2 gerbang masuk, 2 gerbang keluar)
// Setiap request dari Python Microservice akan membawa id_kamera untuk identifikasi asal sinyal
@Entity
@Table(name = "kamera_anpr")
public class KameraAnpr
{
    // =====================================================================
    // Deklarasi Atribut: Kolom-kolom tabel 'kamera_anpr'
    // =====================================================================

    @Id
    @Column(name = "id_kamera", length = 20)
    private String idKamera; // ID unik kamera (misal: "PG-IN-MOB", "PG-OUT-MOT") - bukan auto-increment

    // Status operasional kamera saat ini: ON atau OFF
    // Sesuai ERD: status_kamera (on/off)
    @Column(name = "status_kamera", nullable = false, length = 3)
    private String statusKamera; // "ON" atau "OFF" - diupdate oleh health-check sistem

    // Posisi kamera di gerbang: sesuai ERD depan/belakang ~ MASUK/KELUAR
    // Nilai: "MASUK" atau "KELUAR"
    @Column(name = "posisi_gerbang", nullable = false, length = 10)
    private String posisiGerbang; // Gerbang mana kamera ini dipasang

    // Tipe kendaraan yang dipantau kamera ini: MOBIL atau MOTOR
    // Sesuai ERD: tipe (opsional)
    @Enumerated(EnumType.STRING)
    @Column(name = "tipe_kendaraan", length = 10)
    private JenisKendaraan tipeKendaraan; // MOBIL atau MOTOR (opsional, bisa null jika universal)

    @Column(name = "deskripsi", length = 200)
    private String deskripsi; // Keterangan tambahan lokasi pemasangan fisik kamera


    // =====================================================================
    // Konstruktor LENGKAP (gaya penulisan Anda)
    // =====================================================================
    public KameraAnpr(String idKamera, String posisiGerbang, JenisKendaraan tipeKendaraan, String deskripsi)
    {
        this.idKamera = idKamera;                 // Menginisialisasi ID kamera (format: PG-IN-MOB)
        this.posisiGerbang = posisiGerbang;       // Menginisialisasi posisi gerbang (MASUK/KELUAR)
        this.tipeKendaraan = tipeKendaraan;       // Menginisialisasi tipe kendaraan yang dipantau
        this.deskripsi = deskripsi;               // Menginisialisasi deskripsi lokasi fisik
        this.statusKamera = "ON";                 // Default: semua kamera ON saat sistem diinisialisasi
    }

    // Konstruktor kosong (wajib ada untuk JPA/Hibernate)
    public KameraAnpr() {}


    // =====================================================================
    // Getter & Setter (gaya penulisan Anda)
    // =====================================================================

    public void setIdKamera(String idKamera)
    {
        this.idKamera = idKamera;
    }

    public String getIdKamera()
    {
        return idKamera;
    }

    public void setStatusKamera(String statusKamera)
    {
        this.statusKamera = statusKamera;
    }

    public String getStatusKamera()
    {
        return statusKamera;
    }

    public void setPosisiGerbang(String posisiGerbang)
    {
        this.posisiGerbang = posisiGerbang;
    }

    public String getPosisiGerbang()
    {
        return posisiGerbang;
    }

    public void setTipeKendaraan(JenisKendaraan tipeKendaraan)
    {
        this.tipeKendaraan = tipeKendaraan;
    }

    public JenisKendaraan getTipeKendaraan()
    {
        return tipeKendaraan;
    }

    public void setDeskripsi(String deskripsi)
    {
        this.deskripsi = deskripsi;
    }

    public String getDeskripsi()
    {
        return deskripsi;
    }
}
