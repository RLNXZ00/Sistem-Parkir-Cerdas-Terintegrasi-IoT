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

    public String getStatus() { return status; }
    public Long getIdTransaksi() { return idTransaksi; }
    public String getPlatNomor() { return platNomor; }
    public LocalDateTime getWaktuMasuk() { return waktuMasuk; }
    public LocalDateTime getWaktuKeluar() { return waktuKeluar; }
    public Integer getDurasiTotalMenit() { return durasiTotalMenit; }
    public BigDecimal getNominalTagihan() { return nominalTagihan; }
    public StatusPembayaran getStatusPembayaran() { return statusPembayaran; }
    public String getPesanKeterangan() { return pesanKeterangan; }
}
