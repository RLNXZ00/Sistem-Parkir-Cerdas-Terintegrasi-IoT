package com.spct.dto; // Nama package dari modul data transfer object (DTO)

// Import tipe data LocalDateTime java untuk pencatatan waktu masuk
import java.time.LocalDateTime;
// Import koleksi List dari java util
import java.util.List;

// Kelas publik java HasilDeteksiMasukDto untuk membungkus data respon pemrosesan gerbang masuk ke terminal Kiosk
public class HasilDeteksiMasukDto
{
    // =====================================================================
    // Deklarasi Atribut Hasil Deteksi Masuk
    // =====================================================================

    // Deklarasi atribut status bertipe String untuk status keberhasilan deteksi (SUKSES/GAGAL)
    private String status;

    // Deklarasi atribut platNomor bertipe String untuk nomor plat hasil pengenalan citra
    private String platNomor;

    // Deklarasi atribut waktuMasuk bertipe LocalDateTime untuk waktu kendaraan masuk
    private LocalDateTime waktuMasuk;

    // Deklarasi atribut idTransaksi bertipe Long untuk nomor tiket transaksi
    private Long idTransaksi;

    // Deklarasi atribut slotDialokasikan bertipe String untuk nomor slot parkir tujuan
    private String slotDialokasikan;

    // Deklarasi atribut lantaiSlot bertipe Integer untuk nomor lantai slot parkir
    private Integer lantaiSlot;

    // Deklarasi atribut jalurRuteGraf bertipe List<TitikRuteDto> untuk jalur rute graf A*
    private List<TitikRuteDto> jalurRuteGraf;

    // Deklarasi atribut pesanKeterangan bertipe String untuk petunjuk atau pesan informasi
    private String pesanKeterangan;

    // =====================================================================
    // Konstruktor Kelas HasilDeteksiMasukDto
    // =====================================================================

    // Konstruktor dengan parameter lengkap
    public HasilDeteksiMasukDto(String status, String platNomor, LocalDateTime waktuMasuk,
                                 Long idTransaksi, String slotDialokasikan, Integer lantaiSlot,
                                 List<TitikRuteDto> jalurRuteGraf, String pesanKeterangan)
    {
        this.status = status; // Inisialisasi atribut status dengan parameter status
        this.platNomor = platNomor; // Inisialisasi atribut platNomor dengan parameter platNomor
        this.waktuMasuk = waktuMasuk; // Inisialisasi atribut waktuMasuk dengan parameter waktuMasuk
        this.idTransaksi = idTransaksi; // Inisialisasi atribut idTransaksi dengan parameter idTransaksi
        this.slotDialokasikan = slotDialokasikan; // Inisialisasi atribut slotDialokasikan dengan parameter slotDialokasikan
        this.lantaiSlot = lantaiSlot; // Inisialisasi atribut lantaiSlot dengan parameter lantaiSlot
        this.jalurRuteGraf = jalurRuteGraf; // Inisialisasi atribut jalurRuteGraf dengan parameter jalurRuteGraf
        this.pesanKeterangan = pesanKeterangan; // Inisialisasi atribut pesanKeterangan dengan parameter pesanKeterangan
    }

    // Konstruktor default tanpa parameter untuk Jackson
    public HasilDeteksiMasukDto() 
    {
        // Konstruktor kosong untuk kebutuhan Jackson JSON serializer
    }

    // =====================================================================
    // Method Setter & Getter Atribut
    // =====================================================================

    // Method setter setStatus untuk mengubah nilai atribut status
    public void setStatus(String status)
    {
        this.status = status; // Inisialisasi atribut status dengan parameter
    }

    // Method getter getStatus untuk mengambil nilai atribut status
    public String getStatus()
    {
        return status; // Mengembalikan nilai dari atribut status
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

    // Method setter setSlotDialokasikan untuk mengubah kode slot
    public void setSlotDialokasikan(String slotDialokasikan)
    {
        this.slotDialokasikan = slotDialokasikan; // Inisialisasi atribut slotDialokasikan dengan parameter
    }

    // Method getter getSlotDialokasikan untuk mengambil kode slot
    public String getSlotDialokasikan()
    {
        return slotDialokasikan; // Mengembalikan nilai dari atribut slotDialokasikan
    }

    // Method setter setLantaiSlot untuk mengubah nomor lantai
    public void setLantaiSlot(Integer lantaiSlot)
    {
        this.lantaiSlot = lantaiSlot; // Inisialisasi atribut lantaiSlot dengan parameter
    }

    // Method getter getLantaiSlot untuk mengambil nomor lantai
    public Integer getLantaiSlot()
    {
        return lantaiSlot; // Mengembalikan nilai dari atribut lantaiSlot
    }

    // Method setter setJalurRuteGraf untuk mengubah rute graf navigasi
    public void setJalurRuteGraf(List<TitikRuteDto> jalurRuteGraf)
    {
        this.jalurRuteGraf = jalurRuteGraf; // Inisialisasi atribut jalurRuteGraf dengan parameter
    }

    // Method getter getJalurRuteGraf untuk mengambil rute graf navigasi
    public List<TitikRuteDto> getJalurRuteGraf()
    {
        return jalurRuteGraf; // Mengembalikan daftar titik rute dari atribut jalurRuteGraf
    }

    // Method setter setPesanKeterangan untuk mengubah pesan keterangan
    public void setPesanKeterangan(String pesanKeterangan)
    {
        this.pesanKeterangan = pesanKeterangan; // Inisialisasi atribut pesanKeterangan dengan parameter
    }

    // Method getter getPesanKeterangan untuk mengambil pesan keterangan
    public String getPesanKeterangan()
    {
        return pesanKeterangan; // Mengembalikan nilai dari atribut pesanKeterangan
    }
}
