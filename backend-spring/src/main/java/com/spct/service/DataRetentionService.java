package com.spct.service; // Nama package dari modul layanan logika bisnis sistem

// Import enum TingkatKeparahan dari package model
import com.spct.model.TingkatKeparahan;
// Import repositori LogAuditLaporanRepository dari package repository
import com.spct.repository.LogAuditLaporanRepository;
// Import repositori LogOperasionalIoTRepository dari package repository
import com.spct.repository.LogOperasionalIoTRepository;
// Import repositori TransaksiParkirRepository dari package repository
import com.spct.repository.TransaksiParkirRepository;
// Import anotasi Autowired dari Spring Framework
import org.springframework.beans.factory.annotation.Autowired;
// Import anotasi Value dari Spring Framework untuk membaca konfigurasi application.properties
import org.springframework.beans.factory.annotation.Value;
// Import anotasi Scheduled untuk penjadwalan otomatis berkala
import org.springframework.scheduling.annotation.Scheduled;
// Import anotasi Service dari Spring Framework
import org.springframework.stereotype.Service;
// Import anotasi Transactional untuk memastikan integritas transaksi basis data
import org.springframework.transaction.annotation.Transactional;

// Import tipe data waktu LocalDateTime java
import java.time.LocalDateTime;
// Import struktur data HashMap dari java util
import java.util.HashMap;
// Import antarmuka Map dari java util
import java.util.Map;

// Kelas layanan publik java DataRetentionService untuk mengelola kebijakan retensi dan pembersihan otomatis log rutin lama
@Service // Menandai kelas ini sebagai Spring Service Bean
public class DataRetentionService
{
    // Injeksi otomatis dependensi LogOperasionalIoTRepository
    @Autowired
    private LogOperasionalIoTRepository logOperasionalIoTRepository; // Deklarasi atribut logOperasionalIoTRepository

    // Injeksi otomatis dependensi TransaksiParkirRepository
    @Autowired
    private TransaksiParkirRepository transaksiParkirRepository; // Deklarasi atribut transaksiParkirRepository

    // Injeksi otomatis dependensi LogAuditLaporanRepository
    @Autowired
    private LogAuditLaporanRepository logAuditLaporanRepository; // Deklarasi atribut logAuditLaporanRepository

    // Injeksi nilai retensi hari dari konfigurasi dengan nilai default 90 hari
    @Value("${spct.retensi.log-iot-hari:90}")
    private int retensiHari; // Deklarasi atribut retensiHari bertipe int

    // Injeksi status keaktifan fitur pembersihan otomatis dengan nilai default true
    @Value("${spct.retensi.purge-enabled:true}")
    private boolean purgeEnabled; // Deklarasi atribut purgeEnabled bertipe boolean

    // =====================================================================
    // Job Otomatis Terjadwal (Scheduled Purge)
    // =====================================================================

    // Method jalankanPembersihanOtomatis dijadwalkan secara otomatis setiap pukul 02:00 dini hari
    @Scheduled(cron = "${spct.retensi.purge-cron:0 0 2 * * ?}")
    @Transactional
    public void jalankanPembersihanOtomatis()
    {
        // Jika fitur pembersihan otomatis dinonaktifkan pada konfigurasi, maka:
        if (!purgeEnabled)
        {
            // Tampilkan pesan pemberitahuan di konsol dan hentikan method
            System.out.println("[DATA RETENTION PURGE] Fitur pembersihan otomatis dinonaktifkan di konfigurasi.");
            return;
        }

        // Menghitung batas waktu cutoff (waktu sekarang dikurangi retensiHari)
        LocalDateTime cutoff = LocalDateTime.now().minusDays(retensiHari);
        // Menampilkan pesan awal proses pembersihan log
        System.out.println(String.format("[DATA RETENTION PURGE] Memulai pembersihan berkala log IoT normal sebelum %s (Retensi: %d hari)...",
            cutoff, retensiHari));

        // Blok penanganan eksepsi pembersihan
        try
        {
            // Menghitung jumlah log rutin dengan tingkat INFO sebelum batas waktu cutoff
            Long kandidat = logOperasionalIoTRepository.countByWaktuKejadianBeforeAndTingkatKeparahan(cutoff, TingkatKeparahan.INFO);

            // Jika terdapat data kandidat yang melebihi batas retensi, maka:
            if (kandidat != null && kandidat > 0)
            {
                // Menghapus rekaman data log rutin lama yang kadaluarsa
                long terhapus = logOperasionalIoTRepository.deleteByWaktuKejadianBeforeAndTingkatKeparahan(cutoff, TingkatKeparahan.INFO);
                // Menampilkan log informasi kuantitas baris data yang berhasil dibersihkan
                System.out.println(String.format("[DATA RETENTION PURGE] SUKSES: Berhasil membersihkan %d log sensor normal. Data finansial tetap aman.", terhapus));
            }
            else // Jika tidak ada data yang kadaluarsa, maka:
            {
                // Menampilkan pesan bahwa seluruh data log masih berada dalam masa retensi aman
                System.out.println(String.format("[DATA RETENTION PURGE] SELESAI: Tidak ada log sensor normal yang melebihi batas retensi %d hari.", retensiHari));
            }
        }
        catch (Exception ex)
        {
            // Menampilkan pesan kesalahan jika terjadi galat saat eksekusi query hapus
            System.err.println("[DATA RETENTION PURGE ERROR] Terjadi kegagalan saat menjalankan pembersihan log: " + ex.getMessage());
        }
    }

    // =====================================================================
    // Eksekusi Pembersihan Manual (On-Demand Purge)
    // =====================================================================

    // Method eksekusiPembersihanManual untuk memicu proses pembersihan kapan saja melalui REST API
    @Transactional
    public Map<String, Object> eksekusiPembersihanManual()
    {
        // Menentukan waktu batas cutoff pembersihan berdasarkan retensiHari
        LocalDateTime cutoff = LocalDateTime.now().minusDays(retensiHari);
        // Mencatat timestamp presisi waktu eksekusi proses
        LocalDateTime waktuEksekusi = LocalDateTime.now();

        // Menghitung jumlah baris data log sensor normal yang kadaluarsa
        Long kandidat = logOperasionalIoTRepository.countByWaktuKejadianBeforeAndTingkatKeparahan(cutoff, TingkatKeparahan.INFO);
        // Inisialisasi variabel jumlahTerhapus dengan nilai awal 0
        long jumlahTerhapus = 0;

        // Jika terdapat data log yang memenuhi syarat hapus, maka:
        if (kandidat != null && kandidat > 0)
        {
            // Mengeksekusi query penghapusan log kadaluarsa dari tabel
            jumlahTerhapus = logOperasionalIoTRepository.deleteByWaktuKejadianBeforeAndTingkatKeparahan(cutoff, TingkatKeparahan.INFO);
        }

        // Instansiasi objek HashMap untuk menyusun laporan rekap hasil pembersihan
        Map<String, Object> hasil = new HashMap<>();
        // Menyimpan status SUKSES ke dalam map
        hasil.put("status", "SUKSES");
        // Menyimpan string waktu eksekusi
        hasil.put("waktuEksekusi", waktuEksekusi.toString());
        // Menyimpan batas hari retensi
        hasil.put("retensiHari", retensiHari);
        // Menyimpan string cutoff waktu
        hasil.put("cutoffWaktu", cutoff.toString());
        // Menyimpan total jumlah baris log yang terhapus
        hasil.put("jumlahLogDibersihkan", jumlahTerhapus);
        // Menyimpan teks pesan konfirmasi hasil pembersihan
        hasil.put("pesan", String.format("Pembersihan manual selesai. Sebanyak %d log sensor rutin berhasil dibersihkan.", jumlahTerhapus));
        // Menyimpan total transaksi finansial yang terlindungi dari penghapusan
        hasil.put("dataFinansialDilindungi", transaksiParkirRepository.count());
        // Menyimpan total log audit laporan yang terlindungi
        hasil.put("logAuditDilindungi", logAuditLaporanRepository.count());

        // Menampilkan log konfirmasi pada konsol backend
        System.out.println(String.format("[DATA RETENTION MANUAL] Pembersihan manual dieksekusi: %d log terhapus (Cutoff: %s)",
            jumlahTerhapus, cutoff));

        // Mengembalikan objek map rekapitulasi hasil pembersihan
        return hasil;
    }

    // =====================================================================
    // Mengambil Ringkasan Status Kebijakan Retensi Data
    // =====================================================================

    // Method getStatusKebijakanRetensi untuk memantau ringkasan kuota dan statistik retensi
    public Map<String, Object> getStatusKebijakanRetensi()
    {
        // Menentukan batas waktu cutoff retensi
        LocalDateTime cutoff = LocalDateTime.now().minusDays(retensiHari);
        // Menghitung kuantitas log sensor normal yang siap dibersihkan
        Long siapDibersihkan = logOperasionalIoTRepository.countByWaktuKejadianBeforeAndTingkatKeparahan(cutoff, TingkatKeparahan.INFO);

        // Instansiasi map untuk mengumpulkan data status
        Map<String, Object> status = new HashMap<>();
        // Menyimpan parameter konfigurasi retensi hari
        status.put("retensiLogIoTHari", retensiHari);
        // Menyimpan status aktif pembersihan otomatis
        status.put("pembersihanOtomatisAktif", purgeEnabled);
        // Menyimpan string batas waktu kadaluarsa saat ini
        status.put("cutoffKadaluarsaSaatIni", cutoff.toString());
        // Menyimpan jumlah log kadaluarsa yang siap dibersihkan
        status.put("jumlahLogIoTKadaluarsa", siapDibersihkan != null ? siapDibersihkan : 0);
        // Menyimpan total data transaksi finansial yang dilindungi
        status.put("totalTransaksiFinansialDilindungi", transaksiParkirRepository.count());
        // Menyimpan total log audit yang dilindungi
        status.put("totalLogAuditDilindungi", logAuditLaporanRepository.count());

        // Instansiasi map tingkatan tier kebijakan retensi resmi sistem
        Map<String, String> tiers = new HashMap<>();
        // Tier 1: Log IoT operasional rutin
        tiers.put("Tier 1 - Log IoT Normal", "Retensi 90 hari (otomatis dibersihkan untuk efisiensi kueri)");
        // Tier 2: Log anomali penyerobotan dan insiden keamanan
        tiers.put("Tier 2 - Log Anomali & Security", "Retensi 365 hari (1 tahun untuk audit kepatuhan & investigasi)");
        // Tier 3: Transaksi finansial dan audit trail resmi RS
        tiers.put("Tier 3 - Transaksi Finansial & Audit Trail", "Retensi Permanen / 5-10 Tahun (Immutable, tidak tersentuh pembersihan)");
        // Memasukkan detail 3-tier ke dalam map status
        status.put("kebijakanTigaTingkat", tiers);

        // Mengembalikan map status kebijakan retensi
        return status;
    }
}
