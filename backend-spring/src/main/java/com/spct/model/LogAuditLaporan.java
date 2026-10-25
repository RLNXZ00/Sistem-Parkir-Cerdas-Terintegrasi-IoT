package com.spct.model; // Nama package dari modul model entitas sistem

// Import pustaka Jackson untuk mengabaikan properti Hibernate proxy pada JSON
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
// Import pustaka persistensi database Jakarta JPA
import jakarta.persistence.*;
// Import tipe data tanggal lokal java
import java.time.LocalDate;
// Import tipe data tanggal dan waktu lokal java
import java.time.LocalDateTime;

// Kelas entitas publik java LogAuditLaporan untuk memetakan tabel log_audit_laporan di database relasional
// Kelas ini mencatat jejak audit (audit trail) pengunduhan berkas laporan (PDF/XLSX) oleh aktor sistem
@Entity // Menandai kelas ini sebagai entitas JPA
@Table(name = "log_audit_laporan") // Menentukan pemetaan nama tabel database yaitu log_audit_laporan
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"}) // Mengabaikan atribut lazy loading proxy Hibernate
public class LogAuditLaporan
{
    // =====================================================================
    // Deklarasi Atribut Kolom Tabel log_audit_laporan
    // =====================================================================

    @Id // Menandai atribut idAudit sebagai Primary Key entitas
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Mengonfigurasi strategi penomoran otomatis auto-increment
    @Column(name = "id_audit") // Pemetaan kolom id_audit pada tabel database
    private Long idAudit; // Deklarasi atribut idAudit bertipe Long untuk primary key riwayat audit

    @Column(name = "waktu_unduh", nullable = false) // Pemetaan kolom waktu_unduh dengan batasan not-null
    private LocalDateTime waktuUnduh; // Deklarasi atribut waktuUnduh bertipe LocalDateTime untuk timestamp waktu unduh

    @Column(name = "pengguna", nullable = false, length = 100) // Pemetaan kolom pengguna dengan batasan not-null
    private String pengguna; // Deklarasi atribut pengguna bertipe String untuk mencatat identitas aktor pengunduh

    @Column(name = "jenis_laporan", nullable = false, length = 50) // Pemetaan kolom jenis_laporan dengan batasan not-null
    private String jenisLaporan; // Deklarasi atribut jenisLaporan bertipe String (FINANSIAL/OPERASIONAL/KOMPREHENSIF)

    @Column(name = "format_berkas", nullable = false, length = 10) // Pemetaan kolom format_berkas dengan batasan not-null
    private String formatBerkas; // Deklarasi atribut formatBerkas bertipe String untuk ekstensi berkas (PDF/XLSX)

    @Column(name = "periode_awal", nullable = false) // Pemetaan kolom periode_awal dengan batasan not-null
    private LocalDate periodeAwal; // Deklarasi atribut periodeAwal bertipe LocalDate untuk tanggal awal filter data

    @Column(name = "periode_akhir", nullable = false) // Pemetaan kolom periode_akhir dengan batasan not-null
    private LocalDate periodeAkhir; // Deklarasi atribut periodeAkhir bertipe LocalDate untuk tanggal akhir filter data

    @Column(name = "nama_berkas", nullable = false, length = 200) // Pemetaan kolom nama_berkas dengan batasan not-null
    private String namaBerkas; // Deklarasi atribut namaBerkas bertipe String untuk nama fisik file dokumen yang diunduh

    @Column(name = "ukuran_byte", nullable = false) // Pemetaan kolom ukuran_byte dengan batasan not-null
    private Long ukuranByte; // Deklarasi atribut ukuranByte bertipe Long untuk mencatat ukuran berkas dalam byte

    @Column(name = "status_keberhasilan", nullable = false, length = 20) // Pemetaan kolom status_keberhasilan not-null
    private String statusKeberhasilan; // Deklarasi atribut statusKeberhasilan bertipe String (SUKSES/GAGAL)

    @Column(name = "ip_address", length = 50) // Pemetaan kolom ip_address dengan panjang maksimal 50 karakter
    private String ipAddress; // Deklarasi atribut ipAddress bertipe String untuk mencatat alamat IP klien pengunduh

    // =====================================================================
    // Konstruktor Kelas LogAuditLaporan
    // =====================================================================

    // Konstruktor default tanpa parameter untuk instansiasi awal entitas
    public LogAuditLaporan()
    {
        this.waktuUnduh = LocalDateTime.now(); // Inisialisasi atribut waktuUnduh dengan waktu lokal saat ini
        this.statusKeberhasilan = "SUKSES"; // Inisialisasi atribut statusKeberhasilan dengan nilai default SUKSES
    }

    // Konstruktor dengan parameter lengkap untuk pencatatan log audit unduhan
    public LogAuditLaporan(String pengguna, String jenisLaporan, String formatBerkas,
                           LocalDate periodeAwal, LocalDate periodeAkhir,
                           String namaBerkas, Long ukuranByte, String ipAddress)
    {
        this.waktuUnduh = LocalDateTime.now(); // Inisialisasi atribut waktuUnduh dengan waktu lokal saat ini
        this.pengguna = pengguna; // Inisialisasi atribut pengguna dengan parameter pengguna
        this.jenisLaporan = jenisLaporan; // Inisialisasi atribut jenisLaporan dengan parameter jenisLaporan
        this.formatBerkas = formatBerkas; // Inisialisasi atribut formatBerkas dengan parameter formatBerkas
        this.periodeAwal = periodeAwal; // Inisialisasi atribut periodeAwal dengan parameter periodeAwal
        this.periodeAkhir = periodeAkhir; // Inisialisasi atribut periodeAkhir dengan parameter periodeAkhir
        this.namaBerkas = namaBerkas; // Inisialisasi atribut namaBerkas dengan parameter namaBerkas
        this.ukuranByte = ukuranByte; // Inisialisasi atribut ukuranByte dengan parameter ukuranByte
        this.statusKeberhasilan = "SUKSES"; // Inisialisasi atribut statusKeberhasilan dengan nilai SUKSES
        this.ipAddress = ipAddress; // Inisialisasi atribut ipAddress dengan parameter ipAddress
    }

    // =====================================================================
    // Method Setter & Getter Atribut
    // =====================================================================

    // Method getter getIdAudit untuk mengambil nilai atribut idAudit
    public Long getIdAudit() 
    { 
        return idAudit; // Mengembalikan nilai dari atribut idAudit
    }

    // Method setter setIdAudit untuk mengubah nilai atribut idAudit
    public void setIdAudit(Long idAudit) 
    { 
        this.idAudit = idAudit; // Inisialisasi atribut idAudit dengan parameter
    }

    // Method getter getWaktuUnduh untuk mengambil nilai atribut waktuUnduh
    public LocalDateTime getWaktuUnduh() 
    { 
        return waktuUnduh; // Mengembalikan nilai dari atribut waktuUnduh
    }

    // Method setter setWaktuUnduh untuk mengubah nilai atribut waktuUnduh
    public void setWaktuUnduh(LocalDateTime waktuUnduh) 
    { 
        this.waktuUnduh = waktuUnduh; // Inisialisasi atribut waktuUnduh dengan parameter
    }

    // Method getter getPengguna untuk mengambil nilai atribut pengguna
    public String getPengguna() 
    { 
        return pengguna; // Mengembalikan nilai dari atribut pengguna
    }

    // Method setter setPengguna untuk mengubah nilai atribut pengguna
    public void setPengguna(String pengguna) 
    { 
        this.pengguna = pengguna; // Inisialisasi atribut pengguna dengan parameter
    }

    // Method getter getJenisLaporan untuk mengambil nilai atribut jenisLaporan
    public String getJenisLaporan() 
    { 
        return jenisLaporan; // Mengembalikan nilai dari atribut jenisLaporan
    }

    // Method setter setJenisLaporan untuk mengubah nilai atribut jenisLaporan
    public void setJenisLaporan(String jenisLaporan) 
    { 
        this.jenisLaporan = jenisLaporan; // Inisialisasi atribut jenisLaporan dengan parameter
    }

    // Method getter getFormatBerkas untuk mengambil nilai atribut formatBerkas
    public String getFormatBerkas() 
    { 
        return formatBerkas; // Mengembalikan nilai dari atribut formatBerkas
    }

    // Method setter setFormatBerkas untuk mengubah nilai atribut formatBerkas
    public void setFormatBerkas(String formatBerkas) 
    { 
        this.formatBerkas = formatBerkas; // Inisialisasi atribut formatBerkas dengan parameter
    }

    // Method getter getPeriodeAwal untuk mengambil nilai atribut periodeAwal
    public LocalDate getPeriodeAwal() 
    { 
        return periodeAwal; // Mengembalikan nilai dari atribut periodeAwal
    }

    // Method setter setPeriodeAwal untuk mengubah nilai atribut periodeAwal
    public void setPeriodeAwal(LocalDate periodeAwal) 
    { 
        this.periodeAwal = periodeAwal; // Inisialisasi atribut periodeAwal dengan parameter
    }

    // Method getter getPeriodeAkhir untuk mengambil nilai atribut periodeAkhir
    public LocalDate getPeriodeAkhir() 
    { 
        return periodeAkhir; // Mengembalikan nilai dari atribut periodeAkhir
    }

    // Method setter setPeriodeAkhir untuk mengubah nilai atribut periodeAkhir
    public void setPeriodeAkhir(LocalDate periodeAkhir) 
    { 
        this.periodeAkhir = periodeAkhir; // Inisialisasi atribut periodeAkhir dengan parameter
    }

    // Method getter getNamaBerkas untuk mengambil nilai atribut namaBerkas
    public String getNamaBerkas() 
    { 
        return namaBerkas; // Mengembalikan nilai dari atribut namaBerkas
    }

    // Method setter setNamaBerkas untuk mengubah nilai atribut namaBerkas
    public void setNamaBerkas(String namaBerkas) 
    { 
        this.namaBerkas = namaBerkas; // Inisialisasi atribut namaBerkas dengan parameter
    }

    // Method getter getUkuranByte untuk mengambil nilai atribut ukuranByte
    public Long getUkuranByte() 
    { 
        return ukuranByte; // Mengembalikan nilai dari atribut ukuranByte
    }

    // Method setter setUkuranByte untuk mengubah nilai atribut ukuranByte
    public void setUkuranByte(Long ukuranByte) 
    { 
        this.ukuranByte = ukuranByte; // Inisialisasi atribut ukuranByte dengan parameter
    }

    // Method getter getStatusKeberhasilan untuk mengambil nilai atribut statusKeberhasilan
    public String getStatusKeberhasilan() 
    { 
        return statusKeberhasilan; // Mengembalikan nilai dari atribut statusKeberhasilan
    }

    // Method setter setStatusKeberhasilan untuk mengubah nilai atribut statusKeberhasilan
    public void setStatusKeberhasilan(String statusKeberhasilan) 
    { 
        this.statusKeberhasilan = statusKeberhasilan; // Inisialisasi atribut statusKeberhasilan dengan parameter
    }

    // Method getter getIpAddress untuk mengambil nilai atribut ipAddress
    public String getIpAddress() 
    { 
        return ipAddress; // Mengembalikan nilai dari atribut ipAddress
    }

    // Method setter setIpAddress untuk mengubah nilai atribut ipAddress
    public void setIpAddress(String ipAddress) 
    { 
        this.ipAddress = ipAddress; // Inisialisasi atribut ipAddress dengan parameter
    }
}
