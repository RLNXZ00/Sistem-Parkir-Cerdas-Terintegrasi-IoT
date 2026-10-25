package com.spct.dto; // Nama package dari modul data transfer object (DTO)

// Import koleksi List dari java util
import java.util.List;

// Kelas publik java HasilAlokasiRuteDto untuk membungkus data respon alokasi slot dan rute A* ke terminal Kiosk
public class HasilAlokasiRuteDto
{
    // =====================================================================
    // Deklarasi Atribut Hasil Alokasi Rute
    // =====================================================================

    // Deklarasi atribut idSlotDialokasikan bertipe String untuk nomor identitas slot terpilih
    private String idSlotDialokasikan;

    // Deklarasi atribut lantaiSlot bertipe Integer untuk nomor lantai slot parkir
    private Integer lantaiSlot;

    // Deklarasi atribut koordinatX bertipe Double untuk koordinat X slot pada peta denah
    private Double koordinatX;

    // Deklarasi atribut koordinatY bertipe Double untuk koordinat Y slot pada peta denah
    private Double koordinatY;

    // Deklarasi atribut urutan bertipe List<TitikRuteDto> untuk daftar titik koordinat rute navigasi
    private List<TitikRuteDto> urutan;

    // Deklarasi atribut idTransaksi bertipe Long untuk nomor tiket transaksi yang baru dibuat
    private Long idTransaksi;

    // Deklarasi atribut pesanStatus bertipe String untuk pesan deskripsi status operasi
    private String pesanStatus;

    // =====================================================================
    // Konstruktor Kelas HasilAlokasiRuteDto
    // =====================================================================

    // Konstruktor dengan parameter lengkap
    public HasilAlokasiRuteDto(String idSlotDialokasikan, Integer lantaiSlot,
                                Double koordinatX, Double koordinatY,
                                List<TitikRuteDto> urutan, Long idTransaksi, String pesanStatus)
    {
        this.idSlotDialokasikan = idSlotDialokasikan; // Inisialisasi atribut idSlotDialokasikan dengan parameter
        this.lantaiSlot = lantaiSlot; // Inisialisasi atribut lantaiSlot dengan parameter
        this.koordinatX = koordinatX; // Inisialisasi atribut koordinatX dengan parameter
        this.koordinatY = koordinatY; // Inisialisasi atribut koordinatY dengan parameter
        this.urutan = urutan; // Inisialisasi atribut urutan dengan parameter
        this.idTransaksi = idTransaksi; // Inisialisasi atribut idTransaksi dengan parameter
        this.pesanStatus = pesanStatus; // Inisialisasi atribut pesanStatus dengan parameter
    }

    // Konstruktor default tanpa parameter untuk serialisasi JSON
    public HasilAlokasiRuteDto() 
    {
        // Konstruktor kosong untuk kebutuhan Jackson JSON serializer
    }

    // =====================================================================
    // Method Setter & Getter Atribut
    // =====================================================================

    // Method setter setIdSlotDialokasikan untuk mengubah id slot dialokasikan
    public void setIdSlotDialokasikan(String idSlotDialokasikan)
    {
        this.idSlotDialokasikan = idSlotDialokasikan; // Inisialisasi atribut idSlotDialokasikan dengan parameter
    }

    // Method getter getIdSlotDialokasikan untuk mengambil id slot dialokasikan
    public String getIdSlotDialokasikan()
    {
        return idSlotDialokasikan; // Mengembalikan nilai dari atribut idSlotDialokasikan
    }

    // Method setter setLantaiSlot untuk mengubah nomor lantai slot
    public void setLantaiSlot(Integer lantaiSlot)
    {
        this.lantaiSlot = lantaiSlot; // Inisialisasi atribut lantaiSlot dengan parameter
    }

    // Method getter getLantaiSlot untuk mengambil nomor lantai slot
    public Integer getLantaiSlot()
    {
        return lantaiSlot; // Mengembalikan nilai dari atribut lantaiSlot
    }

    // Method setter setKoordinatX untuk mengubah titik koordinat X
    public void setKoordinatX(Double koordinatX)
    {
        this.koordinatX = koordinatX; // Inisialisasi atribut koordinatX dengan parameter
    }

    // Method getter getKoordinatX untuk mengambil titik koordinat X
    public Double getKoordinatX()
    {
        return koordinatX; // Mengembalikan nilai dari atribut koordinatX
    }

    // Method setter setKoordinatY untuk mengubah titik koordinat Y
    public void setKoordinatY(Double koordinatY)
    {
        this.koordinatY = koordinatY; // Inisialisasi atribut koordinatY dengan parameter
    }

    // Method getter getKoordinatY untuk mengambil titik koordinat Y
    public Double getKoordinatY()
    {
        return koordinatY; // Mengembalikan nilai dari atribut koordinatY
    }

    // Method setter setUrutan untuk mengubah daftar titik rute navigasi
    public void setUrutan(List<TitikRuteDto> urutan)
    {
        this.urutan = urutan; // Inisialisasi atribut urutan dengan parameter
    }

    // Method getter getUrutan untuk mengambil daftar titik rute navigasi
    public List<TitikRuteDto> getUrutan()
    {
        return urutan; // Mengembalikan daftar titik dari atribut urutan
    }

    // Method setter setIdTransaksi untuk mengubah id transaksi parkir
    public void setIdTransaksi(Long idTransaksi)
    {
        this.idTransaksi = idTransaksi; // Inisialisasi atribut idTransaksi dengan parameter
    }

    // Method getter getIdTransaksi untuk mengambil id transaksi parkir
    public Long getIdTransaksi()
    {
        return idTransaksi; // Mengembalikan nilai dari atribut idTransaksi
    }

    // Method setter setPesanStatus untuk mengubah pesan keterangan status
    public void setPesanStatus(String pesanStatus)
    {
        this.pesanStatus = pesanStatus; // Inisialisasi atribut pesanStatus dengan parameter
    }

    // Method getter getPesanStatus untuk mengambil pesan keterangan status
    public String getPesanStatus()
    {
        return pesanStatus; // Mengembalikan nilai dari atribut pesanStatus
    }
}
