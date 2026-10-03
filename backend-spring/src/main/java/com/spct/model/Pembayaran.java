package com.spct.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

// Deklarasi Entity: merepresentasikan tabel 'pembayaran' di Database Relasional
//
// KEPUTUSAN ARSITEKTUR (Pemisahan dari TransaksiParkir):
// Tabel 'transaksi_parkir' murni mencatat event parkir (jam masuk, jam keluar, slot).
// Tabel 'pembayaran' ini khusus mencatat proses FINANSIAL (nominal, metode, referensi gateway).
// Relasi: One-to-One dengan TransaksiParkir (satu transaksi = satu pembayaran).
//
// Ini menjadi jembatan antara sistem kita dengan Payment Gateway eksternal (e-Toll/QRIS)
// yang disebut 'Payment_Gateway' di ERD. Kolom 'referensi_transaksi' menyimpan ID/kode
// dari sistem gateway pihak ketiga agar bisa direconcile jika ada dispute pembayaran.
@Entity
@Table(name = "pembayaran")
public class Pembayaran
{
    // =====================================================================
    // Deklarasi Atribut: Kolom-kolom tabel 'pembayaran'
    // =====================================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment oleh database
    @Column(name = "id_pembayaran")
    private Long idPembayaran; // ID unik record pembayaran sebagai primary key

    @Column(name = "total_pembayaran", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPembayaran; // Nominal final yang dibayarkan (dalam rupiah)

    // Metode pembayaran yang dipilih pengguna
    // Sesuai ERD: metode_pembayaran (E_TOLL, QRIS, TUNAI)
    @Enumerated(EnumType.STRING)
    @Column(name = "metode_pembayaran", nullable = false)
    private MetodePembayaran metodePembayaran; // Cara bayar: E_TOLL, QRIS, TUNAI

    // Status pembayaran saat ini - sesuai ERD: status_pembayaran
    @Enumerated(EnumType.STRING)
    @Column(name = "status_pembayaran", nullable = false)
    private StatusPembayaran statusPembayaran; // BELUM_LUNAS, LUNAS, GAGAL

    @Column(name = "waktu_pembayaran")
    private LocalDateTime waktuPembayaran; // Timestamp saat pembayaran dikonfirmasi berhasil (NULL jika belum lunas)

    // Kode referensi dari Payment Gateway eksternal (e-Toll/QRIS provider)
    // Sesuai ERD: referensi_transaksi - berguna untuk rekonsiliasi keuangan
    @Column(name = "referensi_gateway", length = 100)
    private String referensiGateway; // Kode unik dari sistem pembayaran pihak ketiga (nullable jika TUNAI)

    // Relasi One-to-One ke TransaksiParkir: satu parkir = satu record pembayaran
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_transaksi", nullable = false, unique = true) // FK unik ke transaksi_parkir
    private TransaksiParkir transaksiParkir; // Transaksi parkir yang dibayar


    // =====================================================================
    // Konstruktor LENGKAP (gaya penulisan Anda)
    // =====================================================================
    public Pembayaran(TransaksiParkir transaksiParkir, BigDecimal totalPembayaran,
                      MetodePembayaran metodePembayaran)
    {
        this.transaksiParkir = transaksiParkir;         // Menginisialisasi relasi ke transaksi parkir
        this.totalPembayaran = totalPembayaran;         // Menginisialisasi total yang harus dibayar
        this.metodePembayaran = metodePembayaran;       // Menginisialisasi metode pembayaran
        this.statusPembayaran = StatusPembayaran.BELUM_LUNAS; // Default: pembayaran dibuat dengan status BELUM_LUNAS
        this.waktuPembayaran = null;                    // Belum ada timestamp bayar karena belum lunas
    }

    // Konstruktor kosong (wajib ada untuk JPA/Hibernate)
    public Pembayaran() {}


    // =====================================================================
    // Getter & Setter (gaya penulisan Anda)
    // =====================================================================

    public void setIdPembayaran(Long idPembayaran)
    {
        this.idPembayaran = idPembayaran;
    }

    public Long getIdPembayaran()
    {
        return idPembayaran;
    }

    public void setTotalPembayaran(BigDecimal totalPembayaran)
    {
        this.totalPembayaran = totalPembayaran;
    }

    public BigDecimal getTotalPembayaran()
    {
        return totalPembayaran;
    }

    public void setMetodePembayaran(MetodePembayaran metodePembayaran)
    {
        this.metodePembayaran = metodePembayaran;
    }

    public MetodePembayaran getMetodePembayaran()
    {
        return metodePembayaran;
    }

    public void setStatusPembayaran(StatusPembayaran statusPembayaran)
    {
        this.statusPembayaran = statusPembayaran;
    }

    public StatusPembayaran getStatusPembayaran()
    {
        return statusPembayaran;
    }

    public void setWaktuPembayaran(LocalDateTime waktuPembayaran)
    {
        this.waktuPembayaran = waktuPembayaran;
    }

    public LocalDateTime getWaktuPembayaran()
    {
        return waktuPembayaran;
    }

    public void setReferensiGateway(String referensiGateway)
    {
        this.referensiGateway = referensiGateway;
    }

    public String getReferensiGateway()
    {
        return referensiGateway;
    }

    public void setTransaksiParkir(TransaksiParkir transaksiParkir)
    {
        this.transaksiParkir = transaksiParkir;
    }

    public TransaksiParkir getTransaksiParkir()
    {
        return transaksiParkir;
    }
}
