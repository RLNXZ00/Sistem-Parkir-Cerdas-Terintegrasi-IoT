package com.spct.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// DTO untuk mengembalikan respon saat kendaraan keluar
public class HasilDeteksiKeluarDto 
{
    private String status;           // "SUKSES", "SALDO_KURANG", "KENDARAAN_TIDAK_DITEMUKAN"
    private String platNomor;
    private LocalDateTime waktuMasuk;
    private LocalDateTime waktuKeluar;
    private long durasiJam;
    private BigDecimal totalBiaya;
    private String pesan;

    public HasilDeteksiKeluarDto(String status, String platNomor, LocalDateTime waktuMasuk, 
                                 LocalDateTime waktuKeluar, long durasiJam, BigDecimal totalBiaya, String pesan) {
        this.status = status;
        this.platNomor = platNomor;
        this.waktuMasuk = waktuMasuk;
        this.waktuKeluar = waktuKeluar;
        this.durasiJam = durasiJam;
        this.totalBiaya = totalBiaya;
        this.pesan = pesan;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPlatNomor() { return platNomor; }
    public void setPlatNomor(String platNomor) { this.platNomor = platNomor; }

    public LocalDateTime getWaktuMasuk() { return waktuMasuk; }
    public void setWaktuMasuk(LocalDateTime waktuMasuk) { this.waktuMasuk = waktuMasuk; }

    public LocalDateTime getWaktuKeluar() { return waktuKeluar; }
    public void setWaktuKeluar(LocalDateTime waktuKeluar) { this.waktuKeluar = waktuKeluar; }

    public long getDurasiJam() { return durasiJam; }
    public void setDurasiJam(long durasiJam) { this.durasiJam = durasiJam; }

    public BigDecimal getTotalBiaya() { return totalBiaya; }
    public void setTotalBiaya(BigDecimal totalBiaya) { this.totalBiaya = totalBiaya; }

    public String getPesan() { return pesan; }
    public void setPesan(String pesan) { this.pesan = pesan; }
}
