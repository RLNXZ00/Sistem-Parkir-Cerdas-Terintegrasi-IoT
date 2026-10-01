package com.spct.dto;

import java.util.List; // Mengimpor List untuk menyimpan urutan node rute hasil Algoritma A*

// DTO (Data Transfer Object): Objek yang dikirim sebagai respons JSON ke Frontend Kiosk Terminal
// Fungsinya: memisahkan data API publik dari data internal Entity JPA (prinsip enkapsulasi)
// Setara dengan memilih kolom apa saja yang ditampilkan di TableModel Anda, bukan seluruh objek
public class HasilAlokasiRuteDto // Kelas DTO untuk membungkus hasil alokasi slot dan rute yang akan dikirim ke Kiosk
{
    // =====================================================================
    // Deklarasi Atribut: Data yang akan dikirim ke Frontend Kiosk Terminal
    // =====================================================================

    private String idSlotDialokasikan; // Nomor slot yang berhasil dialokasikan (misal: "B1-10")
    private Integer lantaiSlot;         // Lantai dari slot yang dialokasikan (misal: 1)
    private Double koordinatX;          // Koordinat X slot untuk rendering peta di Frontend Kiosk
    private Double koordinatY;          // Koordinat Y slot untuk rendering peta di Frontend Kiosk
    private List<String> urutan;        // Array urutan node rute hasil Algoritma A* (misal: ["Gate-A", "N-5", "N-12", "B1-10"])
    private Long idTransaksi;           // ID transaksi parkir yang baru dibuat (untuk referensi pembayaran saat keluar)
    private String pesanStatus;         // Pesan status operasi (misal: "Alokasi berhasil" atau "Basement penuh")


    // =====================================================================
    // Konstruktor LENGKAP (gaya penulisan Anda)
    // =====================================================================
    public HasilAlokasiRuteDto(String idSlotDialokasikan, Integer lantaiSlot,
                                Double koordinatX, Double koordinatY,
                                List<String> urutan, Long idTransaksi, String pesanStatus)
    {
        this.idSlotDialokasikan = idSlotDialokasikan; // Menginisialisasi atribut idSlotDialokasikan
        this.lantaiSlot = lantaiSlot;                 // Menginisialisasi atribut lantaiSlot
        this.koordinatX = koordinatX;                 // Menginisialisasi atribut koordinatX
        this.koordinatY = koordinatY;                 // Menginisialisasi atribut koordinatY
        this.urutan = urutan;                         // Menginisialisasi atribut urutan (array rute A*)
        this.idTransaksi = idTransaksi;               // Menginisialisasi atribut idTransaksi
        this.pesanStatus = pesanStatus;               // Menginisialisasi atribut pesanStatus
    }

    // Konstruktor kosong (diperlukan oleh Jackson untuk serialisasi/deserialisasi JSON)
    public HasilAlokasiRuteDto() {}


    // =====================================================================
    // Getter & Setter (gaya penulisan Anda)
    // =====================================================================

    public void setIdSlotDialokasikan(String idSlotDialokasikan) // Deklarasi method setter untuk idSlotDialokasikan
    {
        this.idSlotDialokasikan = idSlotDialokasikan; // Mengubah nilai atribut idSlotDialokasikan
    }

    public String getIdSlotDialokasikan() // Deklarasi method getter untuk idSlotDialokasikan
    {
        return idSlotDialokasikan; // Mengembalikan nilai atribut idSlotDialokasikan
    }

    public void setLantaiSlot(Integer lantaiSlot) // Deklarasi method setter untuk lantaiSlot
    {
        this.lantaiSlot = lantaiSlot;
    }

    public Integer getLantaiSlot() // Deklarasi method getter untuk lantaiSlot
    {
        return lantaiSlot; // Mengembalikan nilai atribut lantaiSlot
    }

    public void setKoordinatX(Double koordinatX) // Deklarasi method setter untuk koordinatX
    {
        this.koordinatX = koordinatX;
    }

    public Double getKoordinatX() // Deklarasi method getter untuk koordinatX
    {
        return koordinatX; // Mengembalikan nilai atribut koordinatX
    }

    public void setKoordinatY(Double koordinatY) // Deklarasi method setter untuk koordinatY
    {
        this.koordinatY = koordinatY;
    }

    public Double getKoordinatY() // Deklarasi method getter untuk koordinatY
    {
        return koordinatY; // Mengembalikan nilai atribut koordinatY
    }

    public void setUrutan(List<String> urutan) // Deklarasi method setter untuk urutan
    {
        this.urutan = urutan;
    }

    public List<String> getUrutan() // Deklarasi method getter untuk urutan (array rute A*)
    {
        return urutan; // Mengembalikan nilai atribut urutan
    }

    public void setIdTransaksi(Long idTransaksi) // Deklarasi method setter untuk idTransaksi
    {
        this.idTransaksi = idTransaksi;
    }

    public Long getIdTransaksi() // Deklarasi method getter untuk idTransaksi
    {
        return idTransaksi; // Mengembalikan nilai atribut idTransaksi
    }

    public void setPesanStatus(String pesanStatus) // Deklarasi method setter untuk pesanStatus
    {
        this.pesanStatus = pesanStatus; // Mengubah nilai atribut pesanStatus
    }

    public String getPesanStatus() // Deklarasi method getter untuk pesanStatus
    {
        return pesanStatus; // Mengembalikan nilai atribut pesanStatus
    }
}
