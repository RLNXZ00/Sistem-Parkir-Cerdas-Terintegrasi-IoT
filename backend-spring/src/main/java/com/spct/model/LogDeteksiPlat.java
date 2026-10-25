package com.spct.model; // Nama package dari modul model entitas sistem

// Import pustaka penanganan properti serialisasi JSON
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
// Import pustaka persistensi database Jakarta JPA
import jakarta.persistence.*;
// Import tipe data BigDecimal untuk akurasi nilai desimal tinggi
import java.math.BigDecimal;
// Import tipe data tanggal dan waktu lokal java
import java.time.LocalDateTime;

// Kelas entitas publik java LogDeteksiPlat untuk memetakan tabel log_deteksi_plat di database relasional
// Kelas ini mencatat setiap pembacaan plat nomor oleh kamera ANPR YOLOv11 + OCR
@Entity // Menandai kelas ini sebagai entitas JPA
@Table(name = "log_deteksi_plat") // Menentukan nama tabel basis data relasional log_deteksi_plat
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"}) // Mengabaikan atribut lazy loading proxy Hibernate
public class LogDeteksiPlat
{
    // =====================================================================
    // Deklarasi Atribut Kolom Tabel log_deteksi_plat
    // =====================================================================

    @Id // Menandai atribut idLogDeteksi sebagai Primary Key entitas
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Menggunakan strategi penomoran otomatis auto-increment
    @Column(name = "id_log_deteksi") // Pemetaan kolom id_log_deteksi pada tabel
    private Long idLogDeteksi; // Deklarasi atribut idLogDeteksi bertipe Long untuk primary key log

    @Column(name = "waktu_deteksi", nullable = false) // Pemetaan kolom waktu_deteksi dengan batasan not-null
    private LocalDateTime waktuDeteksi; // Deklarasi atribut waktuDeteksi bertipe LocalDateTime untuk waktu pembacaan plat

    @Column(name = "arah", nullable = false, length = 6) // Pemetaan kolom arah deteksi kendaraan (MASUK/KELUAR)
    private String arah; // Deklarasi atribut arah bertipe String untuk mencatat arah laju kendaraan

    @Column(name = "hasil_deteksi", nullable = false, length = 7) // Pemetaan status keberhasilan pembacaan plat
    private String hasilDeteksi; // Deklarasi atribut hasilDeteksi bertipe String (BERHASIL/GAGAL)

    @Column(name = "confidence_score", precision = 5, scale = 4) // Pemetaan nilai confidence model deteksi OCR
    private BigDecimal confidenceScore; // Deklarasi atribut confidenceScore bertipe BigDecimal untuk nilai akurasi (0.0 - 1.0)

    @ManyToOne(fetch = FetchType.EAGER) // Relasi banyak-ke-satu ke data master kamera ANPR
    @JoinColumn(name = "id_kamera", nullable = false) // Foreign key ke tabel kamera_anpr
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"}) // Mencegah error serialisasi objek proxy
    private KameraAnpr kameraAsal; // Deklarasi atribut kameraAsal bertipe objek KameraAnpr asal pengambilan citra

    @ManyToOne(fetch = FetchType.EAGER) // Relasi banyak-ke-satu ke data master kendaraan terdaftar
    @JoinColumn(name = "id_kendaraan") // Foreign key opsional ke tabel data_kendaraan
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"}) // Mencegah error serialisasi objek proxy
    private DataKendaraan kendaraanTerdeteksi; // Deklarasi atribut kendaraanTerdeteksi bertipe objek DataKendaraan

    // =====================================================================
    // Konstruktor Kelas LogDeteksiPlat
    // =====================================================================

    // Konstruktor dengan parameter untuk inisialisasi data log deteksi plat
    public LogDeteksiPlat(KameraAnpr kameraAsal, String arah, String hasilDeteksi,
                          BigDecimal confidenceScore, DataKendaraan kendaraanTerdeteksi)
    {
        this.kameraAsal = kameraAsal; // Inisialisasi atribut kameraAsal dengan parameter kameraAsal
        this.arah = arah; // Inisialisasi atribut arah dengan parameter arah
        this.hasilDeteksi = hasilDeteksi; // Inisialisasi atribut hasilDeteksi dengan parameter hasilDeteksi
        this.confidenceScore = confidenceScore; // Inisialisasi atribut confidenceScore dengan parameter confidenceScore
        this.kendaraanTerdeteksi = kendaraanTerdeteksi; // Inisialisasi atribut kendaraanTerdeteksi dengan parameter kendaraanTerdeteksi
        this.waktuDeteksi = LocalDateTime.now(); // Inisialisasi atribut waktuDeteksi dengan waktu lokal saat ini
    }

    // Konstruktor default tanpa parameter untuk JPA
    public LogDeteksiPlat() 
    {
        // Konstruktor kosong untuk instansiasi JPA Hibernate
    }

    // =====================================================================
    // Method Setter & Getter Atribut
    // =====================================================================

    // Method setter setIdLogDeteksi untuk mengubah nilai atribut idLogDeteksi
    public void setIdLogDeteksi(Long idLogDeteksi)
    {
        this.idLogDeteksi = idLogDeteksi; // Inisialisasi atribut idLogDeteksi dengan parameter
    }

    // Method getter getIdLogDeteksi untuk mengambil nilai atribut idLogDeteksi
    public Long getIdLogDeteksi()
    {
        return idLogDeteksi; // Mengembalikan nilai dari atribut idLogDeteksi
    }

    // Method setter setWaktuDeteksi untuk mengubah nilai atribut waktuDeteksi
    public void setWaktuDeteksi(LocalDateTime waktuDeteksi)
    {
        this.waktuDeteksi = waktuDeteksi; // Inisialisasi atribut waktuDeteksi dengan parameter
    }

    // Method getter getWaktuDeteksi untuk mengambil nilai atribut waktuDeteksi
    public LocalDateTime getWaktuDeteksi()
    {
        return waktuDeteksi; // Mengembalikan nilai dari atribut waktuDeteksi
    }

    // Method setter setArah untuk mengubah nilai atribut arah laju kendaraan
    public void setArah(String arah)
    {
        this.arah = arah; // Inisialisasi atribut arah dengan parameter
    }

    // Method getter getArah untuk mengambil nilai atribut arah laju kendaraan
    public String getArah()
    {
        return arah; // Mengembalikan nilai dari atribut arah
    }

    // Method setter setHasilDeteksi untuk mengubah status hasil deteksi plat
    public void setHasilDeteksi(String hasilDeteksi)
    {
        this.hasilDeteksi = hasilDeteksi; // Inisialisasi atribut hasilDeteksi dengan parameter
    }

    // Method getter getHasilDeteksi untuk mengambil status hasil deteksi plat
    public String getHasilDeteksi()
    {
        return hasilDeteksi; // Mengembalikan nilai dari atribut hasilDeteksi
    }

    // Method setter setConfidenceScore untuk mengubah nilai akurasi confidence score
    public void setConfidenceScore(BigDecimal confidenceScore)
    {
        this.confidenceScore = confidenceScore; // Inisialisasi atribut confidenceScore dengan parameter
    }

    // Method getter getConfidenceScore untuk mengambil nilai akurasi confidence score
    public BigDecimal getConfidenceScore()
    {
        return confidenceScore; // Mengembalikan nilai dari atribut confidenceScore
    }

    // Method setter setKameraAsal untuk mengubah objek kamera asal deteksi
    public void setKameraAsal(KameraAnpr kameraAsal)
    {
        this.kameraAsal = kameraAsal; // Inisialisasi atribut kameraAsal dengan parameter
    }

    // Method getter getKameraAsal untuk mengambil objek kamera asal deteksi
    public KameraAnpr getKameraAsal()
    {
        return kameraAsal; // Mengembalikan nilai dari atribut kameraAsal
    }

    // Method setter setKendaraanTerdeteksi untuk mengubah objek kendaraan yang terdeteksi
    public void setKendaraanTerdeteksi(DataKendaraan kendaraanTerdeteksi)
    {
        this.kendaraanTerdeteksi = kendaraanTerdeteksi; // Inisialisasi atribut kendaraanTerdeteksi dengan parameter
    }

    // Method getter getKendaraanTerdeteksi untuk mengambil objek kendaraan yang terdeteksi
    public DataKendaraan getKendaraanTerdeteksi()
    {
        return kendaraanTerdeteksi; // Mengembalikan nilai dari atribut kendaraanTerdeteksi
    }
}
