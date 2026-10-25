package com.spct.model; // Nama package dari modul model entitas sistem

// Import pustaka persistensi database Jakarta JPA
import jakarta.persistence.*;
// Import tipe data BigDecimal untuk ketepatan perhitungan mata uang rupiah
import java.math.BigDecimal;
// Import tipe data tanggal dan waktu LocalDateTime java
import java.time.LocalDateTime;

// Kelas entitas publik java Pembayaran untuk memetakan tabel pembayaran di database relasional
// Kelas ini merepresentasikan rekonsiliasi data finansial transaksi parkir
@Entity // Menandai kelas ini sebagai entitas JPA
@Table(name = "pembayaran") // Memetakan kelas ke tabel basis data pembayaran
public class Pembayaran
{
    // =====================================================================
    // Deklarasi Atribut Kolom Tabel pembayaran
    // =====================================================================

    @Id // Menandai atribut idPembayaran sebagai Primary Key entitas
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Menggunakan strategi auto-increment penomoran id
    @Column(name = "id_pembayaran") // Pemetaan nama kolom id_pembayaran
    private Long idPembayaran; // Deklarasi atribut idPembayaran bertipe Long untuk identitas unik pembayaran

    @Column(name = "total_pembayaran", nullable = false, precision = 10, scale = 2) // Kolom nominal uang dengan 2 angka di belakang koma
    private BigDecimal totalPembayaran; // Deklarasi atribut totalPembayaran bertipe BigDecimal untuk jumlah rupiah bayar

    @Enumerated(EnumType.STRING) // Menyimpan nilai enum MetodePembayaran sebagai string teks
    @Column(name = "metode_pembayaran", nullable = false) // Pemetaan kolom opsi metode bayar
    private MetodePembayaran metodePembayaran; // Deklarasi atribut metodePembayaran bertipe enum MetodePembayaran

    @Enumerated(EnumType.STRING) // Menyimpan nilai enum StatusPembayaran sebagai string teks
    @Column(name = "status_pembayaran", nullable = false) // Pemetaan kolom status pelunasan tagihan
    private StatusPembayaran statusPembayaran; // Deklarasi atribut statusPembayaran bertipe enum StatusPembayaran

    @Column(name = "waktu_pembayaran") // Pemetaan kolom waktu keberhasilan transaksi bayar
    private LocalDateTime waktuPembayaran; // Deklarasi atribut waktuPembayaran bertipe LocalDateTime

    @Column(name = "referensi_gateway", length = 100) // Pemetaan kolom kode referensi transaksi gateway eksternal
    private String referensiGateway; // Deklarasi atribut referensiGateway bertipe String untuk nomor seri settlement

    @OneToOne(fetch = FetchType.LAZY) // Relasi satu-ke-satu dengan entitas TransaksiParkir
    @JoinColumn(name = "id_transaksi", nullable = false, unique = true) // Foreign key unik ke id_transaksi
    private TransaksiParkir transaksiParkir; // Deklarasi atribut transaksiParkir bertipe objek TransaksiParkir

    // =====================================================================
    // Konstruktor Kelas Pembayaran
    // =====================================================================

    // Konstruktor berparameter untuk registrasi pembayaran baru
    public Pembayaran(TransaksiParkir transaksiParkir, BigDecimal totalPembayaran,
                      MetodePembayaran metodePembayaran)
    {
        this.transaksiParkir = transaksiParkir; // Inisialisasi atribut transaksiParkir dengan parameter transaksiParkir
        this.totalPembayaran = totalPembayaran; // Inisialisasi atribut totalPembayaran dengan parameter totalPembayaran
        this.metodePembayaran = metodePembayaran; // Inisialisasi atribut metodePembayaran dengan parameter metodePembayaran
        this.statusPembayaran = StatusPembayaran.BELUM_LUNAS; // Inisialisasi status pembayaran awal bernilai BELUM_LUNAS
        this.waktuPembayaran = null; // Inisialisasi waktu bayar bernilai null sebelum dilunasi
    }

    // Konstruktor default tanpa parameter untuk JPA Hibernate
    public Pembayaran() 
    {
        // Konstruktor kosong untuk instansiasi JPA Hibernate
    }

    // =====================================================================
    // Method Setter & Getter Atribut
    // =====================================================================

    // Method setter setIdPembayaran untuk mengubah nilai atribut idPembayaran
    public void setIdPembayaran(Long idPembayaran)
    {
        this.idPembayaran = idPembayaran; // Inisialisasi atribut idPembayaran dengan parameter
    }

    // Method getter getIdPembayaran untuk mengambil nilai atribut idPembayaran
    public Long getIdPembayaran()
    {
        return idPembayaran; // Mengembalikan nilai dari atribut idPembayaran
    }

    // Method setter setTotalPembayaran untuk mengubah nominal pembayaran
    public void setTotalPembayaran(BigDecimal totalPembayaran)
    {
        this.totalPembayaran = totalPembayaran; // Inisialisasi atribut totalPembayaran dengan parameter
    }

    // Method getter getTotalPembayaran untuk mengambil nominal pembayaran
    public BigDecimal getTotalPembayaran()
    {
        return totalPembayaran; // Mengembalikan nilai dari atribut totalPembayaran
    }

    // Method setter setMetodePembayaran untuk mengubah opsi kanal pembayaran
    public void setMetodePembayaran(MetodePembayaran metodePembayaran)
    {
        this.metodePembayaran = metodePembayaran; // Inisialisasi atribut metodePembayaran dengan parameter
    }

    // Method getter getMetodePembayaran untuk mengambil opsi kanal pembayaran
    public MetodePembayaran getMetodePembayaran()
    {
        return metodePembayaran; // Mengembalikan nilai dari atribut metodePembayaran
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

    // Method setter setWaktuPembayaran untuk mengubah waktu timestamp pembayaran berhasil
    public void setWaktuPembayaran(LocalDateTime waktuPembayaran)
    {
        this.waktuPembayaran = waktuPembayaran; // Inisialisasi atribut waktuPembayaran dengan parameter
    }

    // Method getter getWaktuPembayaran untuk mengambil waktu timestamp pembayaran berhasil
    public LocalDateTime getWaktuPembayaran()
    {
        return waktuPembayaran; // Mengembalikan nilai dari atribut waktuPembayaran
    }

    // Method setter setReferensiGateway untuk mengubah nomor referensi payment gateway
    public void setReferensiGateway(String referensiGateway)
    {
        this.referensiGateway = referensiGateway; // Inisialisasi atribut referensiGateway dengan parameter
    }

    // Method getter getReferensiGateway untuk mengambil nomor referensi payment gateway
    public String getReferensiGateway()
    {
        return referensiGateway; // Mengembalikan nilai dari atribut referensiGateway
    }

    // Method setter setTransaksiParkir untuk menghubungkan entitas transaksi parkir
    public void setTransaksiParkir(TransaksiParkir transaksiParkir)
    {
        this.transaksiParkir = transaksiParkir; // Inisialisasi atribut transaksiParkir dengan parameter
    }

    // Method getter getTransaksiParkir untuk mengambil entitas transaksi parkir
    public TransaksiParkir getTransaksiParkir()
    {
        return transaksiParkir; // Mengembalikan objek transaksi parkir dari atribut transaksiParkir
    }
}
