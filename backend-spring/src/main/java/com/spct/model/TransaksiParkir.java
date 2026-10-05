package com.spct.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;



// Deklarasi Entity: merepresentasikan tabel 'transaksi_parkir' di Database Relasional
// Tabel ini bersifat Transaksional: bertambah terus setiap ada kendaraan masuk/keluar
@Entity
@Table(name = "transaksi_parkir")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class TransaksiParkir
{
    // =====================================================================
    // Deklarasi Atribut: Kolom-kolom tabel 'transaksi_parkir'
    // =====================================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment oleh database
    @Column(name = "id_transaksi")
    private Long idTransaksi; // ID unik transaksi sebagai primary key

    @Column(name = "waktu_masuk", nullable = false)
    private LocalDateTime waktuMasuk; // Timestamp saat kendaraan melewati gerbang masuk (dicatat oleh DeteksiPlatController)

    @Column(name = "waktu_keluar")
    private LocalDateTime waktuKeluar; // Timestamp saat kendaraan melewati gerbang keluar (NULL jika masih di dalam)

    @Column(name = "waktu_tiba_slot")
    private LocalDateTime waktuTibaSlot; // Timestamp saat sensor konfirmasi kendaraan tiba di slot (dikirim via webhook IoT)

    @Column(name = "menit_dihemat")
    private Double menitDihemat; // Waktu tempuh nyata dari gerbang ke slot (menit) = basis kalkulasi CO2 real-time

    @Column(name = "durasi_total_menit")
    private Integer durasiTotalMenit; // Selisih waktu masuk dan keluar dalam satuan menit (dihitung saat keluar)

    @Column(name = "nominal_tagihan", precision = 10, scale = 2)
    private BigDecimal nominalTagihan; // Jumlah uang yang harus dibayar (0 jika Grace Period < 10 menit)

    @Enumerated(EnumType.STRING) // Menyimpan nama Enum sebagai String di database
    @Column(name = "status_pembayaran", nullable = false)
    private StatusPembayaran statusPembayaran; // State pembayaran saat ini (BELUM_LUNAS, LUNAS, dll)

    @Enumerated(EnumType.STRING) // Menyimpan nama Enum sebagai String di database
    @Column(name = "metode_pembayaran")
    private MetodePembayaran metodePembayaran; // Metode yang digunakan saat membayar (bisa NULL sebelum bayar)

    // Relasi Foreign Key ke DataKendaraan
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_kendaraan", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private DataKendaraan kendaraan;

    // Relasi Foreign Key ke SlotParkir
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_slot_dipilih")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "kendaraanAktif"})
    private SlotParkir slotDipilih;


    // =====================================================================
    // Konstruktor LENGKAP untuk CRUD/Database (gaya penulisan Anda)
    // =====================================================================
    public TransaksiParkir(DataKendaraan kendaraan, SlotParkir slotDipilih)
    {
        this.kendaraan = kendaraan;                        // Menginisialisasi relasi ke kendaraan
        this.slotDipilih = slotDipilih;                    // Menginisialisasi relasi ke slot yang dialokasikan
        this.waktuMasuk = LocalDateTime.now();             // Mencatat waktu masuk otomatis saat objek dibuat
        this.statusPembayaran = StatusPembayaran.BELUM_LUNAS; // Default status awal adalah BELUM_LUNAS
        this.nominalTagihan = BigDecimal.ZERO;             // Nominal tagihan dimulai dari 0 sebelum dihitung saat keluar
    }

    // Konstruktor kosong (wajib ada untuk JPA/Hibernate)
    public TransaksiParkir() {}


    // =====================================================================
    // Getter & Setter (gaya penulisan Anda)
    // =====================================================================

    public void setIdTransaksi(Long idTransaksi) // Deklarasi method setter untuk idTransaksi
    {
        this.idTransaksi = idTransaksi; // Mengubah nilai atribut idTransaksi
    }

    public Long getIdTransaksi() // Deklarasi method getter untuk idTransaksi
    {
        return idTransaksi; // Mengembalikan nilai atribut idTransaksi
    }

    public void setWaktuMasuk(LocalDateTime waktuMasuk) // Deklarasi method setter untuk waktuMasuk
    {
        this.waktuMasuk = waktuMasuk; // Mengubah nilai atribut waktuMasuk
    }

    public LocalDateTime getWaktuMasuk() // Deklarasi method getter untuk waktuMasuk
    {
        return waktuMasuk; // Mengembalikan nilai atribut waktuMasuk
    }

    public void setWaktuKeluar(LocalDateTime waktuKeluar) // Deklarasi method setter untuk waktuKeluar
    {
        this.waktuKeluar = waktuKeluar; // Mengubah nilai atribut waktuKeluar
    }

    public LocalDateTime getWaktuKeluar() // Deklarasi method getter untuk waktuKeluar
    {
        return waktuKeluar; // Mengembalikan nilai atribut waktuKeluar
    }

    public void setWaktuTibaSlot(LocalDateTime waktuTibaSlot) // Deklarasi method setter untuk waktuTibaSlot
    {
        this.waktuTibaSlot = waktuTibaSlot; // Mencatat kapan kendaraan fisik tiba di slot (konfirmasi sensor)
    }

    public LocalDateTime getWaktuTibaSlot() // Deklarasi method getter untuk waktuTibaSlot
    {
        return waktuTibaSlot; // Mengembalikan timestamp kedatangan fisik di slot
    }

    public void setMenitDihemat(Double menitDihemat) // Deklarasi method setter untuk menitDihemat
    {
        this.menitDihemat = menitDihemat; // Menyimpan hasil kalkulasi penghematan waktu navigasi
    }

    public Double getMenitDihemat() // Deklarasi method getter untuk menitDihemat
    {
        return menitDihemat; // Mengembalikan durasi penghematan dalam menit untuk kalkulasi CO2
    }

    public void setDurasiTotalMenit(Integer durasiTotalMenit) // Deklarasi method setter untuk durasiTotalMenit
    {
        this.durasiTotalMenit = durasiTotalMenit; // Mengubah nilai atribut durasiTotalMenit
    }

    public Integer getDurasiTotalMenit() // Deklarasi method getter untuk durasiTotalMenit
    {
        return durasiTotalMenit; // Mengembalikan nilai atribut durasiTotalMenit
    }

    public void setNominalTagihan(BigDecimal nominalTagihan) // Deklarasi method setter untuk nominalTagihan
    {
        this.nominalTagihan = nominalTagihan; // Mengubah nilai atribut nominalTagihan
    }

    public BigDecimal getNominalTagihan() // Deklarasi method getter untuk nominalTagihan
    {
        return nominalTagihan; // Mengembalikan nilai atribut nominalTagihan
    }

    public void setStatusPembayaran(StatusPembayaran statusPembayaran) // Deklarasi method setter untuk statusPembayaran
    {
        this.statusPembayaran = statusPembayaran; // Mengubah nilai atribut statusPembayaran
    }

    public StatusPembayaran getStatusPembayaran() // Deklarasi method getter untuk statusPembayaran
    {
        return statusPembayaran; // Mengembalikan nilai atribut statusPembayaran
    }

    public void setMetodePembayaran(MetodePembayaran metodePembayaran) // Deklarasi method setter untuk metodePembayaran
    {
        this.metodePembayaran = metodePembayaran; // Mengubah nilai atribut metodePembayaran
    }

    public MetodePembayaran getMetodePembayaran() // Deklarasi method getter untuk metodePembayaran
    {
        return metodePembayaran; // Mengembalikan nilai atribut metodePembayaran
    }

    public void setKendaraan(DataKendaraan kendaraan) // Deklarasi method setter untuk kendaraan
    {
        this.kendaraan = kendaraan; // Mengubah objek DataKendaraan yang terkait dengan transaksi ini
    }

    public DataKendaraan getKendaraan() // Deklarasi method getter untuk kendaraan
    {
        return kendaraan; // Mengembalikan objek DataKendaraan yang terkait dengan transaksi ini
    }

    public void setSlotDipilih(SlotParkir slotDipilih) // Deklarasi method setter untuk slotDipilih
    {
        this.slotDipilih = slotDipilih; // Mengubah objek SlotParkir yang ditempati pada transaksi ini
    }

    public SlotParkir getSlotDipilih() // Deklarasi method getter untuk slotDipilih
    {
        return slotDipilih; // Mengembalikan objek SlotParkir yang ditempati pada transaksi ini
    }
}