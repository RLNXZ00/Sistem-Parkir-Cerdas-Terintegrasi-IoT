package com.spct.model;

import jakarta.persistence.*;
import java.math.BigDecimal;   // Mengimpor BigDecimal untuk menyimpan nominal uang agar presisi
import java.time.LocalDateTime; // Mengimpor LocalDateTime untuk menyimpan waktu masuk dan keluar

// Deklarasi Enum StatusPembayaran: merepresentasikan semua kemungkinan state pembayaran sebuah transaksi
enum StatusPembayaran
{
    BELUM_LUNAS,        // Kendaraan sudah masuk, belum ada aksi pembayaran di gerbang keluar
    PROSES_GATEWAY,     // Sedang dalam proses verifikasi di Payment Gateway (e-Toll / QRIS)
    LUNAS,              // Pembayaran berhasil dikonfirmasi, palang keluar terbuka
    GRACE_PERIOD_FREE   // Durasi parkir < 10 menit, dibebaskan dari tagihan
}

// Deklarasi Enum MetodePembayaran: merepresentasikan pilihan metode pembayaran yang didukung
enum MetodePembayaran
{
    QRIS,           // Pembayaran via QR Code
    ETOLL_MANDIRI,  // Kartu e-Toll Bank Mandiri
    ETOLL_BRI,      // Kartu e-Toll Bank BRI
    CASH            // Tunai (dibantu petugas)
}

// Deklarasi Entity: merepresentasikan tabel 'transaksi_parkir' di Database Relasional
// Tabel ini bersifat Transaksional: bertambah terus setiap ada kendaraan masuk/keluar
@Entity
@Table(name = "transaksi_parkir") // Mendefinisikan nama tabel di database
public class TransaksiParkir // Kelas model untuk mencatat riwayat lengkap setiap sesi parkir
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

    // Relasi Foreign Key ke DataKendaraan (Many-to-One: banyak transaksi bisa dimiliki satu kendaraan)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_kendaraan", nullable = false) // Kolom FK di tabel transaksi_parkir
    private DataKendaraan kendaraan; // Kendaraan pemilik transaksi ini (wajib ada, tidak boleh NULL)

    // Relasi Foreign Key ke SlotParkir (Many-to-One: banyak transaksi historis bisa terjadi di satu slot)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_slot_dipilih") // Menyimpan histori slot mana yang ditempati
    private SlotParkir slotDipilih; // Slot yang dialokasikan pada transaksi ini (berguna untuk laporan)


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

    public Long getIdTransaksi() // Deklarasi method getter untuk idTransaksi
    {
        return idTransaksi; // Mengembalikan nilai atribut idTransaksi
    }

    public LocalDateTime getWaktuMasuk() // Deklarasi method getter untuk waktuMasuk
    {
        return waktuMasuk; // Mengembalikan nilai atribut waktuMasuk
    }

    public LocalDateTime getWaktuKeluar() // Deklarasi method getter untuk waktuKeluar
    {
        return waktuKeluar; // Mengembalikan nilai atribut waktuKeluar
    }

    public void setWaktuKeluar(LocalDateTime waktuKeluar) // Deklarasi method setter untuk waktuKeluar
    {
        this.waktuKeluar = waktuKeluar; // Mengubah nilai atribut waktuKeluar (dipanggil saat proses keluar)
    }

    public Integer getDurasiTotalMenit() // Deklarasi method getter untuk durasiTotalMenit
    {
        return durasiTotalMenit; // Mengembalikan nilai atribut durasiTotalMenit
    }

    public void setDurasiTotalMenit(Integer durasiTotalMenit) // Deklarasi method setter untuk durasiTotalMenit
    {
        this.durasiTotalMenit = durasiTotalMenit; // Mengubah nilai atribut durasiTotalMenit
    }

    public BigDecimal getNominalTagihan() // Deklarasi method getter untuk nominalTagihan
    {
        return nominalTagihan; // Mengembalikan nilai atribut nominalTagihan
    }

    public void setNominalTagihan(BigDecimal nominalTagihan) // Deklarasi method setter untuk nominalTagihan
    {
        this.nominalTagihan = nominalTagihan; // Mengubah nilai atribut nominalTagihan (dihitung saat proses keluar)
    }

    public StatusPembayaran getStatusPembayaran() // Deklarasi method getter untuk statusPembayaran
    {
        return statusPembayaran; // Mengembalikan nilai atribut statusPembayaran
    }

    public void setStatusPembayaran(StatusPembayaran statusPembayaran) // Deklarasi method setter untuk statusPembayaran
    {
        this.statusPembayaran = statusPembayaran; // Mengubah nilai atribut statusPembayaran
    }

    public MetodePembayaran getMetodePembayaran() // Deklarasi method getter untuk metodePembayaran
    {
        return metodePembayaran; // Mengembalikan nilai atribut metodePembayaran
    }

    public void setMetodePembayaran(MetodePembayaran metodePembayaran) // Deklarasi method setter untuk metodePembayaran
    {
        this.metodePembayaran = metodePembayaran; // Mengubah nilai atribut metodePembayaran
    }

    public DataKendaraan getKendaraan() // Deklarasi method getter untuk kendaraan
    {
        return kendaraan; // Mengembalikan objek DataKendaraan yang terkait dengan transaksi ini
    }

    public SlotParkir getSlotDipilih() // Deklarasi method getter untuk slotDipilih
    {
        return slotDipilih; // Mengembalikan objek SlotParkir yang ditempati pada transaksi ini
    }
}