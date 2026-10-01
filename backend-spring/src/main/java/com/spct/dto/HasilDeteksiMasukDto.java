package com.spct.dto;

import java.time.LocalDateTime; // Mengimpor LocalDateTime untuk menyimpan waktu masuk di respons
import java.util.List;          // Mengimpor List untuk menyimpan urutan node rute hasil A*

// DTO (Data Transfer Object): Objek respons JSON yang dikirim ke Frontend Kiosk Terminal Masuk
// Menggabungkan semua informasi yang dibutuhkan Kiosk dalam SATU respons setelah plat terdeteksi
// (plat, slot, rute, waktu, ID transaksi) sehingga Kiosk tidak perlu request tambahan
public class HasilDeteksiMasukDto // Kelas DTO untuk membungkus seluruh hasil pemrosesan kendaraan masuk
{
    // =====================================================================
    // Deklarasi Atribut: Data yang akan dikirim ke Frontend Kiosk Masuk
    // =====================================================================

    private String status;                  // Status operasi: "SUKSES", "CONFIDENCE_RENDAH", "BASEMENT_PENUH"
    private String platNomor;               // Plat nomor yang berhasil dibaca oleh OCR (konfirmasi ke pengguna Kiosk)
    private LocalDateTime waktuMasuk;       // Timestamp waktu kendaraan masuk (untuk ditampilkan di layar Kiosk)
    private Long idTransaksi;               // ID transaksi yang baru dibuat (disimpan Kiosk untuk referensi keluar)
    private String slotDialokasikan;        // Nomor slot yang diberikan (misal: "B1-12") untuk ditampilkan di Kiosk
    private Integer lantaiSlot;             // Lantai dari slot (untuk konteks navigasi)
    private List<String> jalurRuteGraf;     // Array urutan node rute dari Algoritma A* (untuk rendering animasi 2D)
    private String pesanKeterangan;         // Keterangan tambahan (misal: pesan error atau instruksi ke pengguna)


    // =====================================================================
    // Konstruktor LENGKAP (gaya penulisan Anda)
    // =====================================================================
    public HasilDeteksiMasukDto(String status, String platNomor, LocalDateTime waktuMasuk,
                                 Long idTransaksi, String slotDialokasikan, Integer lantaiSlot,
                                 List<String> jalurRuteGraf, String pesanKeterangan)
    {
        this.status = status;                         // Menginisialisasi atribut status
        this.platNomor = platNomor;                   // Menginisialisasi atribut platNomor
        this.waktuMasuk = waktuMasuk;                 // Menginisialisasi atribut waktuMasuk
        this.idTransaksi = idTransaksi;               // Menginisialisasi atribut idTransaksi
        this.slotDialokasikan = slotDialokasikan;     // Menginisialisasi atribut slotDialokasikan
        this.lantaiSlot = lantaiSlot;                 // Menginisialisasi atribut lantaiSlot
        this.jalurRuteGraf = jalurRuteGraf;           // Menginisialisasi atribut jalurRuteGraf
        this.pesanKeterangan = pesanKeterangan;       // Menginisialisasi atribut pesanKeterangan
    }

    // Konstruktor kosong (diperlukan oleh Jackson untuk serialisasi/deserialisasi JSON)
    public HasilDeteksiMasukDto() {}


    // =====================================================================
    // Getter & Setter (gaya penulisan Anda)
    // =====================================================================

    public void setStatus(String status) // Deklarasi method setter untuk status
    {
        this.status = status; // Mengubah nilai atribut status
    }

    public String getStatus() // Deklarasi method getter untuk status
    {
        return status; // Mengembalikan nilai atribut status
    }

    public void setPlatNomor(String platNomor) // Deklarasi method setter untuk platNomor
    {
        this.platNomor = platNomor;
    }

    public String getPlatNomor() // Deklarasi method getter untuk platNomor
    {
        return platNomor; // Mengembalikan nilai atribut platNomor
    }

    public void setWaktuMasuk(LocalDateTime waktuMasuk) // Deklarasi method setter untuk waktuMasuk
    {
        this.waktuMasuk = waktuMasuk;
    }

    public LocalDateTime getWaktuMasuk() // Deklarasi method getter untuk waktuMasuk
    {
        return waktuMasuk; // Mengembalikan nilai atribut waktuMasuk
    }

    public void setIdTransaksi(Long idTransaksi) // Deklarasi method setter untuk idTransaksi
    {
        this.idTransaksi = idTransaksi;
    }

    public Long getIdTransaksi() // Deklarasi method getter untuk idTransaksi
    {
        return idTransaksi; // Mengembalikan nilai atribut idTransaksi
    }

    public void setSlotDialokasikan(String slotDialokasikan) // Deklarasi method setter untuk slotDialokasikan
    {
        this.slotDialokasikan = slotDialokasikan;
    }

    public String getSlotDialokasikan() // Deklarasi method getter untuk slotDialokasikan
    {
        return slotDialokasikan; // Mengembalikan nilai atribut slotDialokasikan
    }

    public void setLantaiSlot(Integer lantaiSlot) // Deklarasi method setter untuk lantaiSlot
    {
        this.lantaiSlot = lantaiSlot;
    }

    public Integer getLantaiSlot() // Deklarasi method getter untuk lantaiSlot
    {
        return lantaiSlot; // Mengembalikan nilai atribut lantaiSlot
    }

    public void setJalurRuteGraf(List<String> jalurRuteGraf) // Deklarasi method setter untuk jalurRuteGraf
    {
        this.jalurRuteGraf = jalurRuteGraf;
    }

    public List<String> getJalurRuteGraf() // Deklarasi method getter untuk jalurRuteGraf
    {
        return jalurRuteGraf; // Mengembalikan nilai atribut jalurRuteGraf (array rute A*)
    }

    public void setPesanKeterangan(String pesanKeterangan) // Deklarasi method setter untuk pesanKeterangan
    {
        this.pesanKeterangan = pesanKeterangan; // Mengubah nilai atribut pesanKeterangan
    }

    public String getPesanKeterangan() // Deklarasi method getter untuk pesanKeterangan
    {
        return pesanKeterangan; // Mengembalikan nilai atribut pesanKeterangan
    }
}
