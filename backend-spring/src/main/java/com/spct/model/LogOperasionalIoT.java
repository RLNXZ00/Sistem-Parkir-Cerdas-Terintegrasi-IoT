package com.spct.model; // Nama package dari modul model entitas sistem

// Import anotasi Jackson untuk serialisasi JSON
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
// Import pustaka persistensi database Jakarta JPA
import jakarta.persistence.*;
// Import pustaka tipe data waktu LocalDateTime java
import java.time.LocalDateTime;

// Kelas entitas publik java LogOperasionalIoT untuk memetakan tabel log_operasional_iot di database relasional
// Kelas ini merepresentasikan log aktivitas deteksi sensor IoT dan pencatatan anomali parkir
@Entity // Menandai kelas ini sebagai entitas JPA
@Table(name = "log_operasional_iot") // Memetakan kelas ke tabel log_operasional_iot
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"}) // Mengabaikan atribut lazy proxy Hibernate pada serialisasi JSON
public class LogOperasionalIoT
{
    // =====================================================================
    // Deklarasi Atribut Kolom Tabel log_operasional_iot
    // =====================================================================

    @Id // Menandai atribut idLog sebagai Primary Key entitas
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Strategi auto-increment nomor urut log
    @Column(name = "id_log") // Pemetaan nama kolom id_log di tabel
    private Long idLog; // Deklarasi atribut idLog bertipe Long untuk identitas unik riwayat log

    @Column(name = "waktu_kejadian", nullable = false) // Pemetaan kolom waktu_kejadian dengan batasan not-null
    private LocalDateTime waktuKejadian; // Deklarasi atribut waktuKejadian bertipe LocalDateTime untuk mencatat waktu persis kejadian

    @Enumerated(EnumType.STRING) // Menyimpan nilai enum JenisKejadian sebagai string teks
    @Column(name = "jenis_kejadian", nullable = false) // Pemetaan kolom jenis_kejadian dengan batasan not-null
    private JenisKejadian jenisKejadian; // Deklarasi atribut jenisKejadian bertipe enum JenisKejadian

    @Enumerated(EnumType.STRING) // Menyimpan nilai enum TingkatKeparahan sebagai string teks
    @Column(name = "tingkat_keparahan", nullable = false) // Pemetaan kolom tingkat_keparahan dengan batasan not-null
    private TingkatKeparahan tingkatKeparahan; // Deklarasi atribut tingkatKeparahan bertipe enum TingkatKeparahan

    @Enumerated(EnumType.STRING) // Menyimpan nilai enum StatusResolusi sebagai string teks
    @Column(name = "status_resolusi", nullable = false) // Pemetaan kolom status_resolusi dengan batasan not-null
    private StatusResolusi statusResolusi; // Deklarasi atribut statusResolusi bertipe enum StatusResolusi

    @Column(name = "jenis_anomali", length = 100) // Pemetaan kolom jenis_anomali klasifikasi petugas
    private String jenisAnomali; // Deklarasi atribut jenisAnomali bertipe String untuk kategori detail anomali

    @Column(name = "catatan_detail", length = 500) // Pemetaan kolom catatan_detail keterangan kejadian
    private String catatanDetail; // Deklarasi atribut catatanDetail bertipe String untuk catatan teknis kejadian

    @ManyToOne(fetch = FetchType.EAGER) // Relasi banyak-ke-satu dengan entitas SlotParkir secara instan
    @JoinColumn(name = "id_slot", nullable = false) // Foreign key mengarah ke id_slot tabel slot_parkir
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "kendaraanAktif"}) // Mencegah sirkular referensi
    private SlotParkir slotTerkait; // Deklarasi atribut slotTerkait bertipe objek SlotParkir tempat insiden terjadi

    // =====================================================================
    // Konstruktor Kelas LogOperasionalIoT
    // =====================================================================

    // Konstruktor berparameter untuk inisialisasi entitas log operasional baru
    public LogOperasionalIoT(SlotParkir slotTerkait, JenisKejadian jenisKejadian,
                             TingkatKeparahan tingkatKeparahan, String catatanDetail)
    {
        this.slotTerkait = slotTerkait; // Inisialisasi atribut slotTerkait dengan parameter slotTerkait
        this.jenisKejadian = jenisKejadian; // Inisialisasi atribut jenisKejadian dengan parameter jenisKejadian
        this.tingkatKeparahan = tingkatKeparahan; // Inisialisasi atribut tingkatKeparahan dengan parameter tingkatKeparahan
        this.catatanDetail = catatanDetail; // Inisialisasi atribut catatanDetail dengan parameter catatanDetail
        this.jenisAnomali = "-"; // Inisialisasi nilai awal jenis anomali dengan tanda strip default
        this.waktuKejadian = LocalDateTime.now(); // Inisialisasi atribut waktuKejadian dengan waktu sistem saat ini
        this.statusResolusi = StatusResolusi.BELUM_DITANGANI; // Inisialisasi status resolusi awal BELUM_DITANGANI
    }

    // Konstruktor default tanpa parameter untuk JPA Hibernate
    public LogOperasionalIoT() 
    {
        // Konstruktor kosong untuk instansiasi JPA Hibernate
    }

    // =====================================================================
    // Method Setter & Getter Atribut
    // =====================================================================

    // Method setter setIdLog untuk mengubah nilai atribut idLog
    public void setIdLog(Long idLog)
    {
        this.idLog = idLog; // Inisialisasi atribut idLog dengan parameter
    }

    // Method getter getIdLog untuk mengambil nilai atribut idLog
    public Long getIdLog()
    {
        return idLog; // Mengembalikan nilai dari atribut idLog
    }

    // Method setter setWaktuKejadian untuk mengubah nilai atribut waktuKejadian
    public void setWaktuKejadian(LocalDateTime waktuKejadian)
    {
        this.waktuKejadian = waktuKejadian; // Inisialisasi atribut waktuKejadian dengan parameter
    }

    // Method getter getWaktuKejadian untuk mengambil nilai atribut waktuKejadian
    public LocalDateTime getWaktuKejadian()
    {
        return waktuKejadian; // Mengembalikan nilai dari atribut waktuKejadian
    }

    // Method setter setJenisKejadian untuk mengubah nilai atribut jenisKejadian
    public void setJenisKejadian(JenisKejadian jenisKejadian)
    {
        this.jenisKejadian = jenisKejadian; // Inisialisasi atribut jenisKejadian dengan parameter
    }

    // Method getter getJenisKejadian untuk mengambil nilai atribut jenisKejadian
    public JenisKejadian getJenisKejadian()
    {
        return jenisKejadian; // Mengembalikan nilai dari atribut jenisKejadian
    }

    // Method setter setTingkatKeparahan untuk mengubah nilai atribut tingkatKeparahan
    public void setTingkatKeparahan(TingkatKeparahan tingkatKeparahan)
    {
        this.tingkatKeparahan = tingkatKeparahan; // Inisialisasi atribut tingkatKeparahan dengan parameter
    }

    // Method getter getTingkatKeparahan untuk mengambil nilai atribut tingkatKeparahan
    public TingkatKeparahan getTingkatKeparahan()
    {
        return tingkatKeparahan; // Mengembalikan nilai dari atribut tingkatKeparahan
    }

    // Method setter setStatusResolusi untuk mengubah status penanganan resolusi anomali
    public void setStatusResolusi(StatusResolusi statusResolusi)
    {
        this.statusResolusi = statusResolusi; // Inisialisasi atribut statusResolusi dengan parameter
    }

    // Method getter getStatusResolusi untuk mengambil status penanganan resolusi anomali
    public StatusResolusi getStatusResolusi()
    {
        return statusResolusi; // Mengembalikan nilai dari atribut statusResolusi
    }

    // Method setter setCatatanDetail untuk mengubah teks keterangan catatan teknis
    public void setCatatanDetail(String catatanDetail)
    {
        this.catatanDetail = catatanDetail; // Inisialisasi atribut catatanDetail dengan parameter
    }

    // Method getter getCatatanDetail untuk mengambil teks keterangan catatan teknis
    public String getCatatanDetail()
    {
        return catatanDetail; // Mengembalikan nilai dari atribut catatanDetail
    }

    // Method setter setJenisAnomali untuk mengisi atau memperbarui data jenis anomali
    public void setJenisAnomali(String jenisAnomali)
    {
        this.jenisAnomali = jenisAnomali; // Inisialisasi atribut jenisAnomali dengan parameter
    }

    // Method getter getJenisAnomali untuk mengambil data jenis anomali
    public String getJenisAnomali()
    {
        return this.jenisAnomali; // Mengembalikan nilai dari atribut jenisAnomali
    }

    // Method setter setSlotTerkait untuk mengubah objek slot parkir terkait insiden
    public void setSlotTerkait(SlotParkir slotTerkait)
    {
        this.slotTerkait = slotTerkait; // Inisialisasi atribut slotTerkait dengan parameter
    }

    // Method getter getSlotTerkait untuk mengambil objek slot parkir terkait insiden
    public SlotParkir getSlotTerkait()
    {
        return slotTerkait; // Mengembalikan objek slot parkir dari atribut slotTerkait
    }
}