package com.spct.model;

import jakarta.persistence.*;
import java.time.LocalDateTime; // Mengimpor LocalDateTime untuk menyimpan waktu kejadian sensor yang presisi

// Deklarasi Enum JenisKejadian: merepresentasikan semua kategori kejadian yang bisa dicatat sensor IoT
// Dibagi dua kategori: Normal (INFO) dan Kritis (WARNING/CRITICAL) sesuai pseudocode
enum JenisKejadian
{
    // --- Kategori Normal ---
    SENSOR_MENDETEKSI_MOBIL_MASUK,  // Slot berstatus DIPESAN -> sensor mendeteksi kendaraan masuk (normal)
    SENSOR_MENDETEKSI_MOBIL_KELUAR, // Slot berstatus TERISI  -> sensor mendeteksi kendaraan keluar (normal)

    // --- Kategori Kritis (Anomali) ---
    ANOMALI_PENYEROBOTAN_SLOT,      // Slot KOSONG di database tapi sensor mendeteksi kendaraan (peringatan!)
    SENSOR_OFFLINE_TIMEOUT,         // Sensor tidak mengirim data dalam waktu yang ditentukan (perangkat mati)
    KENDARAAN_BEDA_DIMENSI          // Sensor mendeteksi dimensi kendaraan tidak sesuai jenis yang terdaftar
}

// Deklarasi Enum TingkatKeparahan: menentukan warna indikator di Dashboard Frontend Petugas
enum TingkatKeparahan
{
    INFO,     // Hijau: kejadian normal, tidak perlu tindakan khusus
    WARNING,  // Kuning: perlu perhatian petugas
    CRITICAL  // Merah: butuh tindakan segera dari petugas lapangan
}

// Deklarasi Enum StatusResolusi: memastikan petugas tidak melewatkan anomali yang terjadi
enum StatusResolusi
{
    BELUM_DITANGANI,    // Anomali baru masuk, petugas belum mengkonfirmasi
    SELESAI_DIVALIDASI  // Petugas sudah mengecek lapangan dan mengkonfirmasi penanganan selesai
}

// Deklarasi Entity: merepresentasikan tabel 'log_operasional_iot' di Database Relasional
// Tabel ini bersifat Log/History: sangat besar, mencatat setiap perubahan sensor secara real-time
@Entity
@Table(name = "log_operasional_iot") // Mendefinisikan nama tabel di database
public class LogOperasionalIoT // Kelas model untuk mencatat semua pergerakan dan kejadian sensor IoT
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

    // Relasi Foreign Key ke SlotParkir (Many-to-One: banyak log bisa terjadi di satu slot)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_slot", nullable = false) // Kolom FK di tabel log_operasional_iot
    private SlotParkir slotTerkait; // Slot parkir mana yang terkait dengan kejadian ini


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

    public Long getIdLog() // Deklarasi method getter untuk idLog
    {
        return idLog; // Mengembalikan nilai atribut idLog
    }

    public LocalDateTime getWaktuKejadian() // Deklarasi method getter untuk waktuKejadian
    {
        return waktuKejadian; // Mengembalikan nilai atribut waktuKejadian
    }

    public JenisKejadian getJenisKejadian() // Deklarasi method getter untuk jenisKejadian
    {
        return jenisKejadian; // Mengembalikan nilai atribut jenisKejadian
    }

    public TingkatKeparahan getTingkatKeparahan() // Deklarasi method getter untuk tingkatKeparahan
    {
        return tingkatKeparahan; // Mengembalikan nilai atribut tingkatKeparahan
    }

    public StatusResolusi getStatusResolusi() // Deklarasi method getter untuk statusResolusi
    {
        return statusResolusi; // Mengembalikan nilai atribut statusResolusi
    }

    public void setStatusResolusi(StatusResolusi statusResolusi) // Deklarasi method setter untuk statusResolusi
    {
        this.statusResolusi = statusResolusi; // Mengubah status resolusi (dipanggil saat petugas mengkonfirmasi penanganan)
    }

    public String getCatatanDetail() // Deklarasi method getter untuk catatanDetail
    {
        return catatanDetail; // Mengembalikan nilai atribut catatanDetail
    }

    public SlotParkir getSlotTerkait() // Deklarasi method getter untuk slotTerkait
    {
        return slotTerkait; // Mengembalikan objek SlotParkir yang terkait dengan log ini
    }
}