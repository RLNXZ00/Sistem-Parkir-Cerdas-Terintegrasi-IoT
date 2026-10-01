package com.spct.dto;

import com.spct.model.StatusPembayaran;
import java.math.BigDecimal;
import java.time.LocalDateTime;

// DTO (Data Transfer Object): Objek respons JSON yang dikirim ke Frontend Kiosk Terminal Keluar
// Berisi detail tagihan saat kendaraan terdeteksi di gerbang keluar
public class HasilTagihanDto 
{
    // =====================================================================
    // Deklarasi Atribut
    // =====================================================================

    private String status;                  // Status operasi: "SUKSES", "TRANSAKSI_TIDAK_DITEMUKAN"
    private Long idTransaksi;               // ID transaksi aktif
    private String platNomor;               // Plat nomor kendaraan
    private LocalDateTime waktuMasuk;       // Timestamp kendaraan masuk
    private LocalDateTime waktuKeluar;      // Timestamp kendaraan keluar (saat ini)
    private Integer durasiTotalMenit;       // Total durasi parkir dalam menit
    private BigDecimal nominalTagihan;      // Jumlah tagihan yang harus dibayar
    private StatusPembayaran statusPembayaran; // Status saat ini (BELUM_LUNAS, GRACE_PERIOD_FREE, LUNAS)
    private String pesanKeterangan;         // Pesan instruksi ke pengguna kios (misal: "Silakan tempelkan kartu E-Toll")


    // =====================================================================
    // Konstruktor
    // =====================================================================
    public HasilTagihanDto(String status, Long idTransaksi, String platNomor, 
                           LocalDateTime waktuMasuk, LocalDateTime waktuKeluar, 
                           Integer durasiTotalMenit, BigDecimal nominalTagihan, 
                           StatusPembayaran statusPembayaran, String pesanKeterangan)
    {
        this.status = status;
        this.idTransaksi = idTransaksi;
        this.platNomor = platNomor;
        this.waktuMasuk = waktuMasuk;
        this.waktuKeluar = waktuKeluar;
        this.durasiTotalMenit = durasiTotalMenit;
        this.nominalTagihan = nominalTagihan;
        this.statusPembayaran = statusPembayaran;
        this.pesanKeterangan = pesanKeterangan;
    }

    public HasilTagihanDto() {}


    // =====================================================================
    // Getter & Setter (gaya penulisan Anda)
    // =====================================================================

    public void setStatus(String status) // Setter status
    {
        this.status = status;
    }

    public String getStatus() // Getter status
    {
        return status;
    }

    public void setIdTransaksi(Long idTransaksi) // Setter idTransaksi
    {
        this.idTransaksi = idTransaksi;
    }

    public Long getIdTransaksi() // Getter idTransaksi
    {
        return idTransaksi;
    }

    public void setPlatNomor(String platNomor) // Setter platNomor
    {
        this.platNomor = platNomor;
    }

    public String getPlatNomor() // Getter platNomor
    {
        return platNomor;
    }

    public void setWaktuMasuk(LocalDateTime waktuMasuk) // Setter waktuMasuk
    {
        this.waktuMasuk = waktuMasuk;
    }

    public LocalDateTime getWaktuMasuk() // Getter waktuMasuk
    {
        return waktuMasuk;
    }

    public void setWaktuKeluar(LocalDateTime waktuKeluar) // Setter waktuKeluar
    {
        this.waktuKeluar = waktuKeluar;
    }

    public LocalDateTime getWaktuKeluar() // Getter waktuKeluar
    {
        return waktuKeluar;
    }

    public void setDurasiTotalMenit(Integer durasiTotalMenit) // Setter durasiTotalMenit
    {
        this.durasiTotalMenit = durasiTotalMenit;
    }

    public Integer getDurasiTotalMenit() // Getter durasiTotalMenit
    {
        return durasiTotalMenit;
    }

    public void setNominalTagihan(BigDecimal nominalTagihan) // Setter nominalTagihan
    {
        this.nominalTagihan = nominalTagihan;
    }

    public BigDecimal getNominalTagihan() // Getter nominalTagihan
    {
        return nominalTagihan;
    }

    public void setStatusPembayaran(StatusPembayaran statusPembayaran) // Setter statusPembayaran
    {
        this.statusPembayaran = statusPembayaran;
    }

    public StatusPembayaran getStatusPembayaran() // Getter statusPembayaran
    {
        return statusPembayaran;
    }

    public void setPesanKeterangan(String pesanKeterangan) // Setter pesanKeterangan
    {
        this.pesanKeterangan = pesanKeterangan;
    }

    public String getPesanKeterangan() // Getter pesanKeterangan
    {
        return pesanKeterangan;
    }
}
