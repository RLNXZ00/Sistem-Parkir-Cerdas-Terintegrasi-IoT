package com.spct.model;

import jakarta.persistence.*;
import java.time.LocalDateTime; // Mengimpor kelas LocalDateTime untuk menyimpan waktu pemesanan slot



// Deklarasi Entity: merepresentasikan tabel 'slot_parkir' di Database Relasional
// Setara dengan kelas Proyek.java yang mengimplementasikan Serializable untuk persistensi
@Entity
@Table(name = "slot_parkir") // Mendefinisikan nama tabel di database
public class SlotParkir // Kelas model untuk setiap unit slot parkir dalam gedung
{
    // =====================================================================
    // Deklarasi Atribut: Kolom-kolom tabel 'slot_parkir'
    // =====================================================================

    @Id
    @Column(name = "id_slot", nullable = false, unique = true) // Kode unik slot, bukan auto-increment karena ditentukan sendiri (misal: "B1-12")
    private String idSlot; // Identitas utama slot: "B1-12", "B2-05" (setara kodeEvent di Reminder.java Anda)

    @Column(name = "lantai", nullable = false)
    private Integer lantai; // Lantai tempat slot berada (1, 2, atau 3). Dasar pencarian berjenjang di A*

    @Column(name = "node_id", nullable = false)
    private String nodeId; // ID node pada Graf Peta Basement untuk kalkulasi Algoritma A* (misal: "N-23")

    @Enumerated(EnumType.STRING) // Menyimpan nama Enum sebagai String di database (bukan angka index)
    @Column(name = "status_slot", nullable = false)
    private StatusSlot statusSlot; // State dari sensor IoT: KOSONG, DIPESAN, TERISI, atau MAINTENANCE

    @Column(name = "koordinat_x")
    private Double koordinatX; // Koordinat X untuk merender posisi kotak di Peta Frontend (Dashboard React)

    @Column(name = "koordinat_y")
    private Double koordinatY; // Koordinat Y untuk merender posisi kotak di Peta Frontend (Dashboard React)

    @Column(name = "waktu_dipesan")
    private LocalDateTime waktuDipesan; // Timestamp kapan slot ini mulai berstatus 'DIPESAN' (untuk deteksi timeout)

    // Relasi Foreign Key ke DataKendaraan (bisa NULL jika slot sedang kosong)
    @ManyToOne(fetch = FetchType.LAZY) // Many slots bisa dimiliki oleh satu kendaraan secara historis
    @JoinColumn(name = "kendaraan_aktif_id", referencedColumnName = "id_kendaraan")
    private DataKendaraan kendaraanAktif; // Kendaraan yang saat ini dialokasikan di slot ini (NULL jika KOSONG)


    // =====================================================================
    // Konstruktor LENGKAP untuk CRUD/Database (gaya penulisan Anda)
    // =====================================================================
    public SlotParkir(String idSlot, Integer lantai, String nodeId,
                      Double koordinatX, Double koordinatY)
    {
        this.idSlot = idSlot;               // Menginisialisasi atribut idSlot
        this.lantai = lantai;               // Menginisialisasi atribut lantai
        this.nodeId = nodeId;               // Menginisialisasi atribut nodeId
        this.koordinatX = koordinatX;       // Menginisialisasi atribut koordinatX
        this.koordinatY = koordinatY;       // Menginisialisasi atribut koordinatY
        this.statusSlot = StatusSlot.KOSONG; // Default status saat slot baru dibuat adalah KOSONG
    }

    // Konstruktor kosong (wajib ada untuk JPA/Hibernate agar bisa membuat objek dari data database)
    public SlotParkir() {}


    // =====================================================================
    // Getter & Setter (gaya penulisan Anda)
    // =====================================================================

    public void setIdSlot(String idSlot) // Deklarasi method setter untuk idSlot
    {
        this.idSlot = idSlot; // Mengubah nilai atribut idSlot
    }

    public String getIdSlot() // Deklarasi method getter untuk idSlot
    {
        return idSlot; // Mengembalikan nilai atribut idSlot
    }

    public void setLantai(Integer lantai) // Deklarasi method setter untuk lantai
    {
        this.lantai = lantai; // Mengubah nilai atribut lantai
    }

    public Integer getLantai() // Deklarasi method getter untuk lantai
    {
        return lantai; // Mengembalikan nilai atribut lantai
    }

    public void setNodeId(String nodeId) // Deklarasi method setter untuk nodeId
    {
        this.nodeId = nodeId; // Mengubah nilai atribut nodeId
    }

    public String getNodeId() // Deklarasi method getter untuk nodeId
    {
        return nodeId; // Mengembalikan nilai atribut nodeId
    }

    public void setStatusSlot(StatusSlot statusSlot) // Deklarasi method setter untuk statusSlot
    {
        this.statusSlot = statusSlot; // Mengubah nilai atribut statusSlot
    }

    public StatusSlot getStatusSlot() // Deklarasi method getter untuk statusSlot
    {
        return statusSlot; // Mengembalikan nilai atribut statusSlot
    }

    public void setKoordinatX(Double koordinatX) // Deklarasi method setter untuk koordinatX
    {
        this.koordinatX = koordinatX; // Mengubah nilai atribut koordinatX
    }

    public Double getKoordinatX() // Deklarasi method getter untuk koordinatX
    {
        return koordinatX; // Mengembalikan nilai atribut koordinatX
    }

    public void setKoordinatY(Double koordinatY) // Deklarasi method setter untuk koordinatY
    {
        this.koordinatY = koordinatY; // Mengubah nilai atribut koordinatY
    }

    public Double getKoordinatY() // Deklarasi method getter untuk koordinatY
    {
        return koordinatY; // Mengembalikan nilai atribut koordinatY
    }

    public void setWaktuDipesan(LocalDateTime waktuDipesan) // Deklarasi method setter untuk waktuDipesan
    {
        this.waktuDipesan = waktuDipesan; // Mengubah nilai atribut waktuDipesan
    }

    public LocalDateTime getWaktuDipesan() // Deklarasi method getter untuk waktuDipesan
    {
        return waktuDipesan; // Mengembalikan timestamp kapan slot ini berstatus DIPESAN
    }

    public void setKendaraanAktif(DataKendaraan kendaraanAktif) // Deklarasi method setter untuk kendaraanAktif
    {
        this.kendaraanAktif = kendaraanAktif; // Menghubungkan kendaraan ke slot ini
    }

    public DataKendaraan getKendaraanAktif() // Deklarasi method getter untuk kendaraanAktif
    {
        return kendaraanAktif; // Mengembalikan objek DataKendaraan yang saat ini menempati slot ini
    }
}