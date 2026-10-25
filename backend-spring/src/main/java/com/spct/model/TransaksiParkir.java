package com.spct.model; // Nama package dari modul model entitas sistem

// Import pustaka penanganan properti serialisasi JSON Jackson
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
// Import pustaka persistensi database Jakarta JPA
import jakarta.persistence.*;
// Import tipe data BigDecimal untuk ketelitian perhitungan nominal rupiah
import java.math.BigDecimal;
// Import tipe data tanggal dan waktu LocalDateTime java
import java.time.LocalDateTime;

// Kelas entitas publik java TransaksiParkir untuk memetakan tabel transaksi_parkir di database relasional
// Kelas ini merepresentasikan siklus penuh aktivitas parkir mulai dari gerbang masuk hingga gerbang keluar
@Entity // Menandai kelas ini sebagai entitas JPA
@Table(name = "transaksi_parkir") // Memetakan kelas ke tabel basis data transaksi_parkir
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"}) // Mengabaikan atribut lazy loading proxy Hibernate
public class TransaksiParkir
{
    // =====================================================================
    // Deklarasi Atribut Kolom Tabel transaksi_parkir
    // =====================================================================

    @Id // Menandai atribut idTransaksi sebagai Primary Key entitas
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Menggunakan strategi penomoran otomatis auto-increment
    @Column(name = "id_transaksi") // Pemetaan nama kolom id_transaksi
    private Long idTransaksi; // Deklarasi atribut idTransaksi bertipe Long untuk identitas unik tiket parkir

    @Column(name = "waktu_masuk", nullable = false) // Pemetaan kolom waktu_masuk dengan batasan not-null
    private LocalDateTime waktuMasuk; // Deklarasi atribut waktuMasuk bertipe LocalDateTime saat kendaraan masuk gerbang

    @Column(name = "waktu_keluar") // Pemetaan kolom waktu_keluar kendaraan saat meninggalkan sistem
    private LocalDateTime waktuKeluar; // Deklarasi atribut waktuKeluar bertipe LocalDateTime

    @Column(name = "waktu_tiba_slot") // Pemetaan kolom waktu konfirmasi sensor ketika kendaraan tiba di slot
    private LocalDateTime waktuTibaSlot; // Deklarasi atribut waktuTibaSlot bertipe LocalDateTime

    @Column(name = "menit_dihemat") // Pemetaan kolom durasi waktu navigasi yang dihemat oleh rute optimal
    private Double menitDihemat; // Deklarasi atribut menitDihemat bertipe Double untuk kalkulasi reduksi emisi CO2

    @Column(name = "durasi_total_menit") // Pemetaan kolom total durasi parkir dalam satuan menit
    private Integer durasiTotalMenit; // Deklarasi atribut durasiTotalMenit bertipe Integer

    @Column(name = "nominal_tagihan", precision = 10, scale = 2) // Pemetaan nominal total tagihan parkir
    private BigDecimal nominalTagihan; // Deklarasi atribut nominalTagihan bertipe BigDecimal

    @Enumerated(EnumType.STRING) // Menyimpan nilai enum StatusPembayaran sebagai string teks
    @Column(name = "status_pembayaran", nullable = false) // Pemetaan kolom status pembayaran tiket
    private StatusPembayaran statusPembayaran; // Deklarasi atribut statusPembayaran bertipe enum StatusPembayaran

    @Enumerated(EnumType.STRING) // Menyimpan nilai enum MetodePembayaran sebagai string teks
    @Column(name = "metode_pembayaran") // Pemetaan kolom metode kanal pembayaran tiket
    private MetodePembayaran metodePembayaran; // Deklarasi atribut metodePembayaran bertipe enum MetodePembayaran

    @ManyToOne(fetch = FetchType.EAGER) // Relasi banyak-ke-satu ke entitas DataKendaraan secara eager
    @JoinColumn(name = "id_kendaraan", nullable = false) // Foreign key mengarah ke id_kendaraan
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"}) // Mencegah siklus serialisasi JSON
    private DataKendaraan kendaraan; // Deklarasi atribut kendaraan bertipe objek DataKendaraan

    @ManyToOne(fetch = FetchType.EAGER) // Relasi banyak-ke-satu ke entitas SlotParkir secara eager
    @JoinColumn(name = "id_slot_dipilih") // Foreign key mengarah ke id_slot_dipilih
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "kendaraanAktif"}) // Mencegah siklus serialisasi JSON
    private SlotParkir slotDipilih; // Deklarasi atribut slotDipilih bertipe objek SlotParkir yang dialokasikan

    // =====================================================================
    // Konstruktor Kelas TransaksiParkir
    // =====================================================================

    // Konstruktor dengan parameter kendaraan dan slotDipilih saat kendaraan masuk gerbang
    public TransaksiParkir(DataKendaraan kendaraan, SlotParkir slotDipilih)
    {
        this.kendaraan = kendaraan; // Inisialisasi atribut kendaraan dengan parameter kendaraan
        this.slotDipilih = slotDipilih; // Inisialisasi atribut slotDipilih dengan parameter slotDipilih
        this.waktuMasuk = LocalDateTime.now(); // Inisialisasi waktu masuk dengan waktu sistem saat ini
        this.statusPembayaran = StatusPembayaran.BELUM_LUNAS; // Inisialisasi status pembayaran tiket awal BELUM_LUNAS
        this.nominalTagihan = BigDecimal.ZERO; // Inisialisasi nominal tagihan awal sebesar 0 rupiah
    }

    // Konstruktor default tanpa parameter untuk JPA Hibernate
    public TransaksiParkir() 
    {
        // Konstruktor kosong untuk instansiasi JPA Hibernate
    }

    // =====================================================================
    // Method Setter & Getter Atribut
    // =====================================================================

    // Method setter setIdTransaksi untuk mengubah nilai atribut idTransaksi
    public void setIdTransaksi(Long idTransaksi)
    {
        this.idTransaksi = idTransaksi; // Inisialisasi atribut idTransaksi dengan parameter
    }

    // Method getter getIdTransaksi untuk mengambil nilai atribut idTransaksi
    public Long getIdTransaksi()
    {
        return idTransaksi; // Mengembalikan nilai dari atribut idTransaksi
    }

    // Method setter setWaktuMasuk untuk mengubah waktu masuk kendaraan
    public void setWaktuMasuk(LocalDateTime waktuMasuk)
    {
        this.waktuMasuk = waktuMasuk; // Inisialisasi atribut waktuMasuk dengan parameter
    }

    // Method getter getWaktuMasuk untuk mengambil waktu masuk kendaraan
    public LocalDateTime getWaktuMasuk()
    {
        return waktuMasuk; // Mengembalikan nilai dari atribut waktuMasuk
    }

    // Method setter setWaktuKeluar untuk mengubah waktu keluar kendaraan
    public void setWaktuKeluar(LocalDateTime waktuKeluar)
    {
        this.waktuKeluar = waktuKeluar; // Inisialisasi atribut waktuKeluar dengan parameter
    }

    // Method getter getWaktuKeluar untuk mengambil waktu keluar kendaraan
    public LocalDateTime getWaktuKeluar()
    {
        return waktuKeluar; // Mengembalikan nilai dari atribut waktuKeluar
    }

    // Method setter setWaktuTibaSlot untuk mencatat timestamp kedatangan fisik kendaraan di slot
    public void setWaktuTibaSlot(LocalDateTime waktuTibaSlot)
    {
        this.waktuTibaSlot = waktuTibaSlot; // Inisialisasi atribut waktuTibaSlot dengan parameter
    }

    // Method getter getWaktuTibaSlot untuk mengambil timestamp kedatangan fisik kendaraan di slot
    public LocalDateTime getWaktuTibaSlot()
    {
        return waktuTibaSlot; // Mengembalikan nilai dari atribut waktuTibaSlot
    }

    // Method setter setMenitDihemat untuk menyimpan durasi menit penghematan waktu navigasi
    public void setMenitDihemat(Double menitDihemat)
    {
        this.menitDihemat = menitDihemat; // Inisialisasi atribut menitDihemat dengan parameter
    }

    // Method getter getMenitDihemat untuk mengambil durasi menit penghematan waktu navigasi
    public Double getMenitDihemat()
    {
        return menitDihemat; // Mengembalikan nilai dari atribut menitDihemat
    }

    // Method setter setDurasiTotalMenit untuk mengubah total lama durasi parkir
    public void setDurasiTotalMenit(Integer durasiTotalMenit)
    {
        this.durasiTotalMenit = durasiTotalMenit; // Inisialisasi atribut durasiTotalMenit dengan parameter
    }

    // Method getter getDurasiTotalMenit untuk mengambil total lama durasi parkir
    public Integer getDurasiTotalMenit()
    {
        return durasiTotalMenit; // Mengembalikan nilai dari atribut durasiTotalMenit
    }

    // Method setter setNominalTagihan untuk mengubah jumlah tagihan tarif parkir
    public void setNominalTagihan(BigDecimal nominalTagihan)
    {
        this.nominalTagihan = nominalTagihan; // Inisialisasi atribut nominalTagihan dengan parameter
    }

    // Method getter getNominalTagihan untuk mengambil jumlah tagihan tarif parkir
    public BigDecimal getNominalTagihan()
    {
        return nominalTagihan; // Mengembalikan nilai dari atribut nominalTagihan
    }

    // Method setter setStatusPembayaran untuk mengubah status pelunasan transaksi
    public void setStatusPembayaran(StatusPembayaran statusPembayaran)
    {
        this.statusPembayaran = statusPembayaran; // Inisialisasi atribut statusPembayaran dengan parameter
    }

    // Method getter getStatusPembayaran untuk mengambil status pelunasan transaksi
    public StatusPembayaran getStatusPembayaran()
    {
        return statusPembayaran; // Mengembalikan nilai dari atribut statusPembayaran
    }

    // Method setter setMetodePembayaran untuk mengubah metode bayar yang digunakan
    public void setMetodePembayaran(MetodePembayaran metodePembayaran)
    {
        this.metodePembayaran = metodePembayaran; // Inisialisasi atribut metodePembayaran dengan parameter
    }

    // Method getter getMetodePembayaran untuk mengambil metode bayar yang digunakan
    public MetodePembayaran getMetodePembayaran()
    {
        return metodePembayaran; // Mengembalikan nilai dari atribut metodePembayaran
    }

    // Method setter setKendaraan untuk menghubungkan objek entitas kendaraan
    public void setKendaraan(DataKendaraan kendaraan)
    {
        this.kendaraan = kendaraan; // Inisialisasi atribut kendaraan dengan parameter
    }

    // Method getter getKendaraan untuk mengambil objek entitas kendaraan
    public DataKendaraan getKendaraan()
    {
        return kendaraan; // Mengembalikan nilai dari atribut kendaraan
    }

    // Method setter setSlotDipilih untuk menghubungkan objek entitas slot parkir
    public void setSlotDipilih(SlotParkir slotDipilih)
    {
        this.slotDipilih = slotDipilih; // Inisialisasi atribut slotDipilih dengan parameter
    }

    // Method getter getSlotDipilih untuk mengambil objek entitas slot parkir
    public SlotParkir getSlotDipilih()
    {
        return slotDipilih; // Mengembalikan nilai dari atribut slotDipilih
    }
}