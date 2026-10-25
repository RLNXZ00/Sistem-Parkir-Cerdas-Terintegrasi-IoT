package com.spct.model; // Nama package dari modul model entitas sistem

// Import penanganan anotasi properti serialisasi JSON Jackson
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
// Import pustaka persistensi database Jakarta JPA
import jakarta.persistence.*;
// Import tipe data waktu LocalDateTime java
import java.time.LocalDateTime;

// Kelas entitas publik java SlotParkir untuk memetakan tabel slot_parkir di database relasional
// Kelas ini merepresentasikan data denah slot fisik parkir beserta status ketersediaan terkininya
@Entity // Menandai kelas ini sebagai entitas JPA yang dipetakan ke tabel basis data
@Table(name = "slot_parkir") // Mendefinisikan nama tabel basis data yaitu slot_parkir
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"}) // Mengabaikan atribut lazy loading proxy Hibernate
public class SlotParkir
{
    // =====================================================================
    // Deklarasi Atribut Kolom Tabel slot_parkir
    // =====================================================================

    @Id // Menandai atribut idSlot sebagai Primary Key entitas
    @Column(name = "id_slot", nullable = false, unique = true) // Kode unik slot parkir (misal: "B1-12")
    private String idSlot; // Deklarasi atribut idSlot bertipe String untuk identitas slot parkir

    @Column(name = "lantai", nullable = false) // Pemetaan kolom nomor lantai parkir
    private Integer lantai; // Deklarasi atribut lantai bertipe Integer (lantai 1, 2, atau 3)

    @Column(name = "node_id", nullable = false) // Pemetaan kolom node graf pencarian rute A*
    private String nodeId; // Deklarasi atribut nodeId bertipe String untuk simpul node pada peta graf

    @Enumerated(EnumType.STRING) // Menyimpan nilai enum StatusSlot sebagai string teks
    @Column(name = "status_slot", nullable = false) // Pemetaan kolom status ketersediaan slot
    private StatusSlot statusSlot; // Deklarasi atribut statusSlot bertipe enum StatusSlot (KOSONG, DIPESAN, TERISI, MAINTENANCE)

    @Column(name = "koordinat_x") // Pemetaan kolom koordinat X untuk rendering visualisasi frontend
    private Double koordinatX; // Deklarasi atribut koordinatX bertipe Double

    @Column(name = "koordinat_y") // Pemetaan kolom koordinat Y untuk rendering visualisasi frontend
    private Double koordinatY; // Deklarasi atribut koordinatY bertipe Double

    @Column(name = "waktu_dipesan") // Pemetaan kolom waktu mulai pemesanan alokasi slot
    private LocalDateTime waktuDipesan; // Deklarasi atribut waktuDipesan bertipe LocalDateTime

    @Enumerated(EnumType.STRING) // Menyimpan nilai enum JenisKendaraan sebagai string teks
    @Column(name = "jenis_kendaraan") // Pemetaan kolom peruntukan tipe kendaraan slot
    private JenisKendaraan jenisKendaraan; // Deklarasi atribut jenisKendaraan bertipe enum JenisKendaraan (MOBIL/MOTOR)

    @ManyToOne(fetch = FetchType.EAGER) // Relasi banyak-ke-satu ke data kendaraan secara eager
    @JoinColumn(name = "kendaraan_aktif_id", referencedColumnName = "id_kendaraan") // Foreign key ke id_kendaraan
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"}) // Menghindari sirkular referensi JSON
    private DataKendaraan kendaraanAktif; // Deklarasi atribut kendaraanAktif bertipe objek DataKendaraan

    // =====================================================================
    // Konstruktor Kelas SlotParkir
    // =====================================================================

    // Konstruktor berparameter untuk registrasi slot parkir baru
    public SlotParkir(String idSlot, Integer lantai, String nodeId,
                      Double koordinatX, Double koordinatY)
    {
        this.idSlot = idSlot; // Inisialisasi atribut idSlot dengan parameter idSlot
        this.lantai = lantai; // Inisialisasi atribut lantai dengan parameter lantai
        this.nodeId = nodeId; // Inisialisasi atribut nodeId dengan parameter nodeId
        this.koordinatX = koordinatX; // Inisialisasi atribut koordinatX dengan parameter koordinatX
        this.koordinatY = koordinatY; // Inisialisasi atribut koordinatY dengan parameter koordinatY
        this.statusSlot = StatusSlot.KOSONG; // Inisialisasi status awal slot bernilai KOSONG
    }

    // Konstruktor default tanpa parameter untuk JPA Hibernate
    public SlotParkir() 
    {
        // Konstruktor kosong untuk instansiasi JPA Hibernate
    }

    // =====================================================================
    // Method Setter & Getter Atribut
    // =====================================================================

    // Method setter setIdSlot untuk mengubah nilai atribut idSlot
    public void setIdSlot(String idSlot)
    {
        this.idSlot = idSlot; // Inisialisasi atribut idSlot dengan parameter
    }

    // Method getter getIdSlot untuk mengambil nilai atribut idSlot
    public String getIdSlot()
    {
        return idSlot; // Mengembalikan nilai dari atribut idSlot
    }

    // Method setter setLantai untuk mengubah nomor lantai slot
    public void setLantai(Integer lantai)
    {
        this.lantai = lantai; // Inisialisasi atribut lantai dengan parameter
    }

    // Method getter getLantai untuk mengambil nomor lantai slot
    public Integer getLantai()
    {
        return lantai; // Mengembalikan nilai dari atribut lantai
    }

    // Method setter setNodeId untuk mengubah identitas node simpul graf
    public void setNodeId(String nodeId)
    {
        this.nodeId = nodeId; // Inisialisasi atribut nodeId dengan parameter
    }

    // Method getter getNodeId untuk mengambil identitas node simpul graf
    public String getNodeId()
    {
        return nodeId; // Mengembalikan nilai dari atribut nodeId
    }

    // Method setter setStatusSlot untuk mengubah status keterisian slot
    public void setStatusSlot(StatusSlot statusSlot)
    {
        this.statusSlot = statusSlot; // Inisialisasi atribut statusSlot dengan parameter
    }

    // Method getter getStatusSlot untuk mengambil status keterisian slot
    public StatusSlot getStatusSlot()
    {
        return statusSlot; // Mengembalikan nilai dari atribut statusSlot
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

    // Method setter setWaktuDipesan untuk mengubah timestamp waktu pemesanan slot
    public void setWaktuDipesan(LocalDateTime waktuDipesan)
    {
        this.waktuDipesan = waktuDipesan; // Inisialisasi atribut waktuDipesan dengan parameter
    }

    // Method getter getWaktuDipesan untuk mengambil timestamp waktu pemesanan slot
    public LocalDateTime getWaktuDipesan()
    {
        return waktuDipesan; // Mengembalikan nilai dari atribut waktuDipesan
    }

    // Method setter setJenisKendaraan untuk mengubah tipe kendaraan peruntukan slot
    public void setJenisKendaraan(JenisKendaraan jenisKendaraan)
    {
        this.jenisKendaraan = jenisKendaraan; // Inisialisasi atribut jenisKendaraan dengan parameter
    }

    // Method getter getJenisKendaraan untuk mengambil tipe kendaraan peruntukan slot
    public JenisKendaraan getJenisKendaraan()
    {
        // Jika atribut bernilai selain null, kembalikan atribut tersebut, jika null kembalikan nilai default MOBIL
        return (jenisKendaraan != null) ? jenisKendaraan : JenisKendaraan.MOBIL;
    }

    // Method setter setKendaraanAktif untuk mengubah objek kendaraan yang menempati slot
    public void setKendaraanAktif(DataKendaraan kendaraanAktif)
    {
        this.kendaraanAktif = kendaraanAktif; // Inisialisasi atribut kendaraanAktif dengan parameter
    }

    // Method getter getKendaraanAktif untuk mengambil objek kendaraan yang menempati slot
    public DataKendaraan getKendaraanAktif()
    {
        return kendaraanAktif; // Mengembalikan nilai dari atribut kendaraanAktif
    }
}