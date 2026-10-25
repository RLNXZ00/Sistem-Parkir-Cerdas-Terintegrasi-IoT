package com.spct.dto; // Nama package DTO

import java.math.BigDecimal; // Mengimpor BigDecimal untuk operasi nominal uang tagihan
import java.time.LocalDateTime; // Mengimpor LocalDateTime untuk pencatatan timestamp waktu masuk dan keluar

// Kelas publik HasilDeteksiKeluarDto untuk mengembalikan respons saat kendaraan diproses di gerbang keluar Kiosk
public class HasilDeteksiKeluarDto 
{
    // Deklarasi atribut status bertipe String ("SUKSES", "SALDO_KURANG", "KENDARAAN_TIDAK_DITEMUKAN")
    private String status;

    // Deklarasi atribut platNomor bertipe String untuk menyimpan nomor plat kendaraan
    private String platNomor;

    // Deklarasi atribut waktuMasuk bertipe LocalDateTime untuk mencatat waktu saat kendaraan pertama kali masuk
    private LocalDateTime waktuMasuk;

    // Deklarasi atribut waktuKeluar bertipe LocalDateTime untuk mencatat waktu saat kendaraan meninggalkan gerbang
    private LocalDateTime waktuKeluar;

    // Deklarasi atribut durasiJam bertipe long untuk menyimpan total durasi parkir dalam satuan jam
    private long durasiJam;

    // Deklarasi atribut totalBiaya bertipe BigDecimal untuk menyimpan nominal rupiah biaya parkir
    private BigDecimal totalBiaya;

    // Deklarasi atribut pesan bertipe String untuk menampilkan keterangan atau instruksi kepada pengemudi
    private String pesan;

    // Constructor dengan parameter untuk inisialisasi data luaran gerbang keluar
    public HasilDeteksiKeluarDto(String status, String platNomor, LocalDateTime waktuMasuk, 
                                 LocalDateTime waktuKeluar, long durasiJam, BigDecimal totalBiaya, String pesan) 
    {
        // Inisialisasi atribut status dengan parameter status
        this.status = status;

        // Inisialisasi atribut platNomor dengan parameter platNomor
        this.platNomor = platNomor;

        // Inisialisasi atribut waktuMasuk dengan parameter waktuMasuk
        this.waktuMasuk = waktuMasuk;

        // Inisialisasi atribut waktuKeluar dengan parameter waktuKeluar
        this.waktuKeluar = waktuKeluar;

        // Inisialisasi atribut durasiJam dengan parameter durasiJam
        this.durasiJam = durasiJam;

        // Inisialisasi atribut totalBiaya dengan parameter totalBiaya
        this.totalBiaya = totalBiaya;

        // Inisialisasi atribut pesan dengan parameter pesan
        this.pesan = pesan;
    }

    // Constructor default tanpa parameter (diperlukan untuk serialisasi JSON)
    public HasilDeteksiKeluarDto() 
    {
    }

    // Method getter getStatus() untuk mengambil nilai status
    public String getStatus() 
    { 
        // Mengembalikan nilai atribut status
        return this.status; 
    }

    // Method setter setStatus(String) untuk mengubah nilai status
    public void setStatus(String status) 
    { 
        // Mengubah nilai atribut status dengan parameter status
        this.status = status; 
    }

    // Method getter getPlatNomor() untuk mengambil nilai nomor plat kendaraan
    public String getPlatNomor() 
    { 
        // Mengembalikan nilai atribut platNomor
        return this.platNomor; 
    }

    // Method setter setPlatNomor(String) untuk mengubah nilai nomor plat kendaraan
    public void setPlatNomor(String platNomor) 
    { 
        // Mengubah nilai atribut platNomor dengan parameter platNomor
        this.platNomor = platNomor; 
    }

    // Method getter getWaktuMasuk() untuk mengambil nilai waktu masuk kendaraan
    public LocalDateTime getWaktuMasuk() 
    { 
        // Mengembalikan nilai atribut waktuMasuk
        return this.waktuMasuk; 
    }

    // Method setter setWaktuMasuk(LocalDateTime) untuk mengubah nilai waktu masuk kendaraan
    public void setWaktuMasuk(LocalDateTime waktuMasuk) 
    { 
        // Mengubah nilai atribut waktuMasuk dengan parameter waktuMasuk
        this.waktuMasuk = waktuMasuk; 
    }

    // Method getter getWaktuKeluar() untuk mengambil nilai waktu keluar kendaraan
    public LocalDateTime getWaktuKeluar() 
    { 
        // Mengembalikan nilai atribut waktuKeluar
        return this.waktuKeluar; 
    }

    // Method setter setWaktuKeluar(LocalDateTime) untuk mengubah nilai waktu keluar kendaraan
    public void setWaktuKeluar(LocalDateTime waktuKeluar) 
    { 
        // Mengubah nilai atribut waktuKeluar dengan parameter waktuKeluar
        this.waktuKeluar = waktuKeluar; 
    }

    // Method getter getDurasiJam() untuk mengambil total jam parkir
    public long getDurasiJam() 
    { 
        // Mengembalikan nilai atribut durasiJam
        return this.durasiJam; 
    }

    // Method setter setDurasiJam(long) untuk mengubah total jam parkir
    public void setDurasiJam(long durasiJam) 
    { 
        // Mengubah nilai atribut durasiJam dengan parameter durasiJam
        this.durasiJam = durasiJam; 
    }

    // Method getter getTotalBiaya() untuk mengambil nominal rupiah biaya parkir
    public BigDecimal getTotalBiaya() 
    { 
        // Mengembalikan nilai atribut totalBiaya
        return this.totalBiaya; 
    }

    // Method setter setTotalBiaya(BigDecimal) untuk mengubah nominal rupiah biaya parkir
    public void setTotalBiaya(BigDecimal totalBiaya) 
    { 
        // Mengubah nilai atribut totalBiaya dengan parameter totalBiaya
        this.totalBiaya = totalBiaya; 
    }

    // Method getter getPesan() untuk mengambil pesan instruksi
    public String getPesan() 
    { 
        // Mengembalikan nilai atribut pesan
        return this.pesan; 
    }

    // Method setter setPesan(String) untuk mengubah pesan instruksi
    public void setPesan(String pesan) 
    { 
        // Mengubah nilai atribut pesan dengan parameter pesan
        this.pesan = pesan; 
    }
}
