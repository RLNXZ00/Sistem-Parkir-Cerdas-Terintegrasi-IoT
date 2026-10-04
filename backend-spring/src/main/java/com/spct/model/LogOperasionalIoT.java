package com.spct.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;



// Deklarasi Entity: merepresentasikan tabel 'log_operasional_iot' di Database Relasional
// Tabel ini bersifat Log/History: sangat besar, mencatat setiap perubahan sensor secara real-time
@Entity
@Table(name = "log_operasional_iot")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class LogOperasionalIoT
{
    // =====================================================================
    // Deklarasi Atribut: Kolom-kolom tabel 'log_operasional_iot'
    // =====================================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment oleh database
    @Column(name = "id_log")
    private Long idLog; // ID unik log sebagai primary key (auto-increment)

    @Column(name = "waktu_kejadian", nullable = false)
    private LocalDateTime waktuKejadian; // Timestamp presisi saat sensor mengirim perubahan status

    @Enumerated(EnumType.STRING) // Menyimpan nama Enum sebagai String di database
    @Column(name = "jenis_kejadian", nullable = false)
    private JenisKejadian jenisKejadian; // Kategori kejadian: normal atau anomali

    @Enumerated(EnumType.STRING) // Menyimpan nama Enum sebagai String di database
    @Column(name = "tingkat_keparahan", nullable = false)
    private TingkatKeparahan tingkatKeparahan; // Level keparahan: INFO, WARNING, atau CRITICAL

    @Enumerated(EnumType.STRING) // Menyimpan nama Enum sebagai String di database
    @Column(name = "status_resolusi", nullable = false)
    private StatusResolusi statusResolusi; // Status penanganan: belum ditangani atau sudah divalidasi petugas

    @Column(name = "catatan_detail", length = 500)
    private String catatanDetail; // Penjelasan detail kejadian (misal: "Slot B1-12: status DB=KOSONG, sensor=TERISI")

    // Relasi Foreign Key ke SlotParkir (Many-to-One)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_slot", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "kendaraanAktif"})
    private SlotParkir slotTerkait;


    // =====================================================================
    // Konstruktor LENGKAP untuk CRUD/Database (gaya penulisan Anda)
    // =====================================================================
    public LogOperasionalIoT(SlotParkir slotTerkait, JenisKejadian jenisKejadian,
                              TingkatKeparahan tingkatKeparahan, String catatanDetail)
    {
        this.slotTerkait = slotTerkait;             // Menginisialisasi relasi ke slot terkait
        this.jenisKejadian = jenisKejadian;         // Menginisialisasi atribut jenisKejadian
        this.tingkatKeparahan = tingkatKeparahan;   // Menginisialisasi atribut tingkatKeparahan
        this.catatanDetail = catatanDetail;         // Menginisialisasi atribut catatanDetail
        this.waktuKejadian = LocalDateTime.now();   // Mencatat waktu kejadian otomatis saat log dibuat
        this.statusResolusi = StatusResolusi.BELUM_DITANGANI; // Default: semua log baru belum ditangani
    }

    // Konstruktor kosong (wajib ada untuk JPA/Hibernate)
    public LogOperasionalIoT() {}


    // =====================================================================
    // Getter & Setter (gaya penulisan Anda)
    // =====================================================================

    public void setIdLog(Long idLog) // Deklarasi method setter untuk idLog
    {
        this.idLog = idLog; // Mengubah nilai atribut idLog
    }

    public Long getIdLog() // Deklarasi method getter untuk idLog
    {
        return idLog; // Mengembalikan nilai atribut idLog
    }

    public void setWaktuKejadian(LocalDateTime waktuKejadian) // Deklarasi method setter untuk waktuKejadian
    {
        this.waktuKejadian = waktuKejadian; // Mengubah nilai atribut waktuKejadian
    }

    public LocalDateTime getWaktuKejadian() // Deklarasi method getter untuk waktuKejadian
    {
        return waktuKejadian; // Mengembalikan nilai atribut waktuKejadian
    }

    public void setJenisKejadian(JenisKejadian jenisKejadian) // Deklarasi method setter untuk jenisKejadian
    {
        this.jenisKejadian = jenisKejadian; // Mengubah nilai atribut jenisKejadian
    }

    public JenisKejadian getJenisKejadian() // Deklarasi method getter untuk jenisKejadian
    {
        return jenisKejadian; // Mengembalikan nilai atribut jenisKejadian
    }

    public void setTingkatKeparahan(TingkatKeparahan tingkatKeparahan) // Deklarasi method setter untuk tingkatKeparahan
    {
        this.tingkatKeparahan = tingkatKeparahan; // Mengubah nilai atribut tingkatKeparahan
    }

    public TingkatKeparahan getTingkatKeparahan() // Deklarasi method getter untuk tingkatKeparahan
    {
        return tingkatKeparahan; // Mengembalikan nilai atribut tingkatKeparahan
    }

    public void setStatusResolusi(StatusResolusi statusResolusi) // Deklarasi method setter untuk statusResolusi
    {
        this.statusResolusi = statusResolusi; // Mengubah status resolusi
    }

    public StatusResolusi getStatusResolusi() // Deklarasi method getter untuk statusResolusi
    {
        return statusResolusi; // Mengembalikan nilai atribut statusResolusi
    }

    public void setCatatanDetail(String catatanDetail) // Deklarasi method setter untuk catatanDetail
    {
        this.catatanDetail = catatanDetail; // Mengubah nilai atribut catatanDetail
    }

    public String getCatatanDetail() // Deklarasi method getter untuk catatanDetail
    {
        return catatanDetail; // Mengembalikan nilai atribut catatanDetail
    }

    public void setSlotTerkait(SlotParkir slotTerkait) // Deklarasi method setter untuk slotTerkait
    {
        this.slotTerkait = slotTerkait; // Mengubah relasi objek SlotParkir
    }

    public SlotParkir getSlotTerkait() // Deklarasi method getter untuk slotTerkait
    {
        return slotTerkait; // Mengembalikan objek SlotParkir yang terkait dengan log ini
    }
}