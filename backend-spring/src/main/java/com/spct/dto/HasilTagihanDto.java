package com.spct.dto; // Nama package dari modul data transfer object (DTO)

// Import enum StatusPembayaran dari package model
import com.spct.model.StatusPembayaran;
// Import tipe data BigDecimal untuk ketelitian nominal tagihan
import java.math.BigDecimal;
// Import tipe data LocalDateTime java untuk pencatatan waktu
import java.time.LocalDateTime;

// Kelas publik java HasilTagihanDto untuk membungkus data respon tagihan parkir ke terminal Kiosk Keluar
public class HasilTagihanDto 
{
    // =====================================================================
    // Deklarasi Atribut Hasil Tagihan
    // =====================================================================

    // Deklarasi atribut status bertipe String untuk status keberhasilan pengecekan tiket
    private String status;

    // Deklarasi atribut idTransaksi bertipe Long untuk nomor tiket transaksi
    private Long idTransaksi;

    // Deklarasi atribut platNomor bertipe String untuk nomor plat kendaraan
    private String platNomor;

    // Deklarasi atribut waktuMasuk bertipe LocalDateTime untuk waktu awal masuk
    private LocalDateTime waktuMasuk;

    // Deklarasi atribut waktuKeluar bertipe LocalDateTime untuk waktu keluar gerbang
    private LocalDateTime waktuKeluar;

    // Deklarasi atribut durasiTotalMenit bertipe Integer untuk total durasi parkir dalam menit
    private Integer durasiTotalMenit;

    // Deklarasi atribut nominalTagihan bertipe BigDecimal untuk jumlah rupiah yang harus dibayar
    private BigDecimal nominalTagihan;

    // Deklarasi atribut statusPembayaran bertipe enum StatusPembayaran untuk status tagihan
    private StatusPembayaran statusPembayaran;

    // Deklarasi atribut pesanKeterangan bertipe String untuk pesan instruksi pembayaran
    private String pesanKeterangan;

    // =====================================================================
    // Konstruktor Kelas HasilTagihanDto
    // =====================================================================

    // Konstruktor dengan parameter lengkap
    public HasilTagihanDto(String status, Long idTransaksi, String platNomor, 
                           LocalDateTime waktuMasuk, LocalDateTime waktuKeluar, 
                           Integer durasiTotalMenit, BigDecimal nominalTagihan, 
                           StatusPembayaran statusPembayaran, String pesanKeterangan)
    {
        this.status = status; // Inisialisasi atribut status dengan parameter status
        this.idTransaksi = idTransaksi; // Inisialisasi atribut idTransaksi dengan parameter idTransaksi
        this.platNomor = platNomor; // Inisialisasi atribut platNomor dengan parameter platNomor
        this.waktuMasuk = waktuMasuk; // Inisialisasi atribut waktuMasuk dengan parameter waktuMasuk
        this.waktuKeluar = waktuKeluar; // Inisialisasi atribut waktuKeluar dengan parameter waktuKeluar
        this.durasiTotalMenit = durasiTotalMenit; // Inisialisasi atribut durasiTotalMenit dengan parameter durasiTotalMenit
        this.nominalTagihan = nominalTagihan; // Inisialisasi atribut nominalTagihan dengan parameter nominalTagihan
        this.statusPembayaran = statusPembayaran; // Inisialisasi atribut statusPembayaran dengan parameter statusPembayaran
        this.pesanKeterangan = pesanKeterangan; // Inisialisasi atribut pesanKeterangan dengan parameter pesanKeterangan
    }

    // Konstruktor default tanpa parameter untuk Jackson
    public HasilTagihanDto() 
    {
        // Konstruktor kosong untuk kebutuhan Jackson JSON serializer
    }

    // =====================================================================
    // Method Setter & Getter Atribut
    // =====================================================================

    // Method setter setStatus untuk mengubah status respon
    public void setStatus(String status)
    {
        this.status = status; // Inisialisasi atribut status dengan parameter
    }

    // Method getter getStatus untuk mengambil status respon
    public String getStatus()
    {
        return status; // Mengembalikan nilai dari atribut status
    }

    // Method setter setIdTransaksi untuk mengubah id transaksi
    public void setIdTransaksi(Long idTransaksi)
    {
        this.idTransaksi = idTransaksi; // Inisialisasi atribut idTransaksi dengan parameter
    }

    // Method getter getIdTransaksi untuk mengambil id transaksi
    public Long getIdTransaksi()
    {
        return idTransaksi; // Mengembalikan nilai dari atribut idTransaksi
    }

    // Method setter setPlatNomor untuk mengubah nomor plat
    public void setPlatNomor(String platNomor)
    {
        this.platNomor = platNomor; // Inisialisasi atribut platNomor dengan parameter
    }

    // Method getter getPlatNomor untuk mengambil nomor plat
    public String getPlatNomor()
    {
        return platNomor; // Mengembalikan nilai dari atribut platNomor
    }

    // Method setter setWaktuMasuk untuk mengubah waktu masuk
    public void setWaktuMasuk(LocalDateTime waktuMasuk)
    {
        this.waktuMasuk = waktuMasuk; // Inisialisasi atribut waktuMasuk dengan parameter
    }

    // Method getter getWaktuMasuk untuk mengambil waktu masuk
    public LocalDateTime getWaktuMasuk()
    {
        return waktuMasuk; // Mengembalikan nilai dari atribut waktuMasuk
    }

    // Method setter setWaktuKeluar untuk mengubah waktu keluar
    public void setWaktuKeluar(LocalDateTime waktuKeluar)
    {
        this.waktuKeluar = waktuKeluar; // Inisialisasi atribut waktuKeluar dengan parameter
    }

    // Method getter getWaktuKeluar untuk mengambil waktu keluar
    public LocalDateTime getWaktuKeluar()
    {
        return waktuKeluar; // Mengembalikan nilai dari atribut waktuKeluar
    }

    // Method setter setDurasiTotalMenit untuk mengubah durasi parkir dalam menit
    public void setDurasiTotalMenit(Integer durasiTotalMenit)
    {
        this.durasiTotalMenit = durasiTotalMenit; // Inisialisasi atribut durasiTotalMenit dengan parameter
    }

    // Method getter getDurasiTotalMenit untuk mengambil durasi parkir dalam menit
    public Integer getDurasiTotalMenit()
    {
        return durasiTotalMenit; // Mengembalikan nilai dari atribut durasiTotalMenit
    }

    // Method setter setNominalTagihan untuk mengubah jumlah tagihan
    public void setNominalTagihan(BigDecimal nominalTagihan)
    {
        this.nominalTagihan = nominalTagihan; // Inisialisasi atribut nominalTagihan dengan parameter
    }

    // Method getter getNominalTagihan untuk mengambil jumlah tagihan
    public BigDecimal getNominalTagihan()
    {
        return nominalTagihan; // Mengembalikan nilai dari atribut nominalTagihan
    }

    // Method setter setStatusPembayaran untuk mengubah status pembayaran
    public void setStatusPembayaran(StatusPembayaran statusPembayaran)
    {
        this.statusPembayaran = statusPembayaran; // Inisialisasi atribut statusPembayaran dengan parameter
    }

    // Method getter getStatusPembayaran untuk mengambil status pembayaran
    public StatusPembayaran getStatusPembayaran()
    {
        return statusPembayaran; // Mengembalikan nilai dari atribut statusPembayaran
    }

    // Method setter setPesanKeterangan untuk mengubah pesan instruksi
    public void setPesanKeterangan(String pesanKeterangan)
    {
        this.pesanKeterangan = pesanKeterangan; // Inisialisasi atribut pesanKeterangan dengan parameter
    }

    // Method getter getPesanKeterangan untuk mengambil pesan instruksi
    public String getPesanKeterangan()
    {
        return pesanKeterangan; // Mengembalikan nilai dari atribut pesanKeterangan
    }
}
