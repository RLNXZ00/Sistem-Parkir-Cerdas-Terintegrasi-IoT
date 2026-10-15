package com.spct.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entity: LogAuditLaporan
 * Merepresentasikan tabel 'log_audit_laporan' di Database Relasional PostgreSQL.
 * Mencatat setiap aktivitas pengunduhan dokumen resmi (PDF / XLSX) oleh pihak manajemen
 * sesuai diagram urutan dan narasi spesifikasi PK-UC010 (Langkah 19-20: Audit Trail Keamanan).
 */
@Entity
@Table(name = "log_audit_laporan")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class LogAuditLaporan
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_audit")
    private Long idAudit; // Primary Key auto-increment

    @Column(name = "waktu_unduh", nullable = false)
    private LocalDateTime waktuUnduh; // Timestamp presisi waktu file diunduh

    @Column(name = "pengguna", nullable = false, length = 100)
    private String pengguna; // Aktor yang meminta unduhan (misal: "Manajemen RS (Admin)")

    @Column(name = "jenis_laporan", nullable = false, length = 50)
    private String jenisLaporan; // "FINANSIAL", "OPERASIONAL", "LINGKUNGAN", "KOMPREHENSIF"

    @Column(name = "format_berkas", nullable = false, length = 10)
    private String formatBerkas; // "PDF" atau "XLSX"

    @Column(name = "periode_awal", nullable = false)
    private LocalDate periodeAwal; // Batas awal rentang data yang diekspor

    @Column(name = "periode_akhir", nullable = false)
    private LocalDate periodeAkhir; // Batas akhir rentang data yang diekspor

    @Column(name = "nama_berkas", nullable = false, length = 200)
    private String namaBerkas; // Nama file fisik yang dikirim ke browser

    @Column(name = "ukuran_byte", nullable = false)
    private Long ukuranByte; // Ukuran dokumen dalam satuan byte

    @Column(name = "status_keberhasilan", nullable = false, length = 20)
    private String statusKeberhasilan; // "SUKSES" atau "GAGAL"

    @Column(name = "ip_address", length = 50)
    private String ipAddress; // Alamat IP pemohon (opsional)

    // Konstruktor Default
    public LogAuditLaporan()
    {
        this.waktuUnduh = LocalDateTime.now();
        this.statusKeberhasilan = "SUKSES";
    }

    // Konstruktor Lengkap
    public LogAuditLaporan(String pengguna, String jenisLaporan, String formatBerkas,
                           LocalDate periodeAwal, LocalDate periodeAkhir,
                           String namaBerkas, Long ukuranByte, String ipAddress)
    {
        this.waktuUnduh = LocalDateTime.now();
        this.pengguna = pengguna;
        this.jenisLaporan = jenisLaporan;
        this.formatBerkas = formatBerkas;
        this.periodeAwal = periodeAwal;
        this.periodeAkhir = periodeAkhir;
        this.namaBerkas = namaBerkas;
        this.ukuranByte = ukuranByte;
        this.statusKeberhasilan = "SUKSES";
        this.ipAddress = ipAddress;
    }

    // Getter dan Setter
    public Long getIdAudit() { return idAudit; }
    public void setIdAudit(Long idAudit) { this.idAudit = idAudit; }

    public LocalDateTime getWaktuUnduh() { return waktuUnduh; }
    public void setWaktuUnduh(LocalDateTime waktuUnduh) { this.waktuUnduh = waktuUnduh; }

    public String getPengguna() { return pengguna; }
    public void setPengguna(String pengguna) { this.pengguna = pengguna; }

    public String getJenisLaporan() { return jenisLaporan; }
    public void setJenisLaporan(String jenisLaporan) { this.jenisLaporan = jenisLaporan; }

    public String getFormatBerkas() { return formatBerkas; }
    public void setFormatBerkas(String formatBerkas) { this.formatBerkas = formatBerkas; }

    public LocalDate getPeriodeAwal() { return periodeAwal; }
    public void setPeriodeAwal(LocalDate periodeAwal) { this.periodeAwal = periodeAwal; }

    public LocalDate getPeriodeAkhir() { return periodeAkhir; }
    public void setPeriodeAkhir(LocalDate periodeAkhir) { this.periodeAkhir = periodeAkhir; }

    public String getNamaBerkas() { return namaBerkas; }
    public void setNamaBerkas(String namaBerkas) { this.namaBerkas = namaBerkas; }

    public Long getUkuranByte() { return ukuranByte; }
    public void setUkuranByte(Long ukuranByte) { this.ukuranByte = ukuranByte; }

    public String getStatusKeberhasilan() { return statusKeberhasilan; }
    public void setStatusKeberhasilan(String statusKeberhasilan) { this.statusKeberhasilan = statusKeberhasilan; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
}
