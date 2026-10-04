package com.spct.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

// Deklarasi Entity: merepresentasikan tabel 'log_deteksi_plat' di Database Relasional
//
// ARSITEKTUR MICROSERVICE (Keputusan final):
// Python ALPR TIDAK menulis ke file log lokal.
// Setiap kali kamera mendeteksi plat (per frame penting), Python langsung
// menembak HTTP POST ke endpoint /api/deteksi/log di Spring Boot.
// Spring Boot-lah yang menyimpan record ini ke tabel 'log_deteksi_plat'.
//
// Ini memungkinkan:
// 1. Analitik historis (berapa kali plat X terdeteksi hari ini?)
// 2. Debugging akurasi ALPR (membandingkan hasil_deteksi vs plat sebenarnya)
// 3. Audit trail lengkap untuk keamanan parkir
//
// NORMALISASI 3NF (sesuai Halaman 52 Dokumen Konseptual):
// Tabel ini TIDAK menyimpan kolom 'plat_nomor' secara langsung (menghindari redundansi data
// karena plat_nomor sudah ada di tabel 'data_kendaraan').
// Sebagai gantinya, hanya menyimpan Foreign Key 'id_kendaraan'.
@Entity
@Table(name = "log_deteksi_plat")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class LogDeteksiPlat
{
    // =====================================================================
    // Deklarasi Atribut: Kolom-kolom tabel 'log_deteksi_plat'
    // =====================================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment oleh database
    @Column(name = "id_log_deteksi")
    private Long idLogDeteksi; // ID unik log deteksi sebagai primary key

    @Column(name = "waktu_deteksi", nullable = false)
    private LocalDateTime waktuDeteksi; // Timestamp presisi kapan frame ini dideteksi oleh ALPR

    // Sesuai ERD: arah (masuk/keluar) - dari kamera mana sinyal datang
    @Column(name = "arah", nullable = false, length = 6)
    private String arah; // "MASUK" atau "KELUAR" - ditentukan dari posisi_gerbang kamera pengirim

    // Sesuai ERD: hasil_deteksi (berhasil/gagal) - apakah ALPR berhasil baca plat?
    @Column(name = "hasil_deteksi", nullable = false, length = 7)
    private String hasilDeteksi; // "BERHASIL" atau "GAGAL"

    // Confidence score hasil model YOLOv11 + OCR (0.0 - 1.0)
    // Berguna untuk analitik: seberapa akurat model kita?
    @Column(name = "confidence_score", precision = 5, scale = 4)
    private BigDecimal confidenceScore; // Contoh: 0.9523 = 95.23% yakin

    // Relasi FK ke KameraAnpr: log ini berasal dari kamera mana?
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_kamera", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private KameraAnpr kameraAsal;

    // Relasi FK ke DataKendaraan (NULLABLE)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_kendaraan")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private DataKendaraan kendaraanTerdeteksi;


    // =====================================================================
    // Konstruktor LENGKAP (gaya penulisan Anda)
    // =====================================================================
    public LogDeteksiPlat(KameraAnpr kameraAsal, String arah, String hasilDeteksi,
                          BigDecimal confidenceScore, DataKendaraan kendaraanTerdeteksi)
    {
        this.kameraAsal = kameraAsal;                         // Menginisialisasi kamera asal
        this.arah = arah;                                     // Menginisialisasi arah deteksi
        this.hasilDeteksi = hasilDeteksi;                     // Menginisialisasi hasil deteksi
        this.confidenceScore = confidenceScore;               // Menginisialisasi confidence score
        this.kendaraanTerdeteksi = kendaraanTerdeteksi;       // Menginisialisasi kendaraan (bisa null)
        this.waktuDeteksi = LocalDateTime.now();              // Timestamp otomatis saat log dibuat
    }

    // Konstruktor kosong (wajib ada untuk JPA/Hibernate)
    public LogDeteksiPlat() {}


    // =====================================================================
    // Getter & Setter (gaya penulisan Anda)
    // =====================================================================

    public void setIdLogDeteksi(Long idLogDeteksi)
    {
        this.idLogDeteksi = idLogDeteksi;
    }

    public Long getIdLogDeteksi()
    {
        return idLogDeteksi;
    }

    public void setWaktuDeteksi(LocalDateTime waktuDeteksi)
    {
        this.waktuDeteksi = waktuDeteksi;
    }

    public LocalDateTime getWaktuDeteksi()
    {
        return waktuDeteksi;
    }

    public void setArah(String arah)
    {
        this.arah = arah;
    }

    public String getArah()
    {
        return arah;
    }

    public void setHasilDeteksi(String hasilDeteksi)
    {
        this.hasilDeteksi = hasilDeteksi;
    }

    public String getHasilDeteksi()
    {
        return hasilDeteksi;
    }

    public void setConfidenceScore(BigDecimal confidenceScore)
    {
        this.confidenceScore = confidenceScore;
    }

    public BigDecimal getConfidenceScore()
    {
        return confidenceScore;
    }

    public void setKameraAsal(KameraAnpr kameraAsal)
    {
        this.kameraAsal = kameraAsal;
    }

    public KameraAnpr getKameraAsal()
    {
        return kameraAsal;
    }

    public void setKendaraanTerdeteksi(DataKendaraan kendaraanTerdeteksi)
    {
        this.kendaraanTerdeteksi = kendaraanTerdeteksi;
    }

    public DataKendaraan getKendaraanTerdeteksi()
    {
        return kendaraanTerdeteksi;
    }
}
