package com.spct.service;

import com.spct.model.TingkatKeparahan;
import com.spct.repository.LogAuditLaporanRepository;
import com.spct.repository.LogOperasionalIoTRepository;
import com.spct.repository.TransaksiParkirRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Service: DataRetentionService
 * Mengelola Kebijakan Retensi Data (Fase 7 - Data Retention Policy).
 *
 * Struktur Kebijakan 3-Tingkat (3-Tier Retention Strategy):
 * - Tier 1 (Log IoT Rutin/Normal): Retensi 90 hari (dapat disesuaikan via application.properties).
 *   Pembersihan otomatis secara terjadwal untuk menjaga performa query database.
 * - Tier 2 (Log Anomali & Keamanan): Retensi minimal 1 tahun (365 hari) untuk audit investigasi.
 * - Tier 3 (Transaksi Finansial & Audit Trail): Dilindungi secara permanen (Immutable/Kepatuhan Akuntansi RS).
 */
@Service
public class DataRetentionService
{
    @Autowired
    private LogOperasionalIoTRepository logOperasionalIoTRepository;

    @Autowired
    private TransaksiParkirRepository transaksiParkirRepository;

    @Autowired
    private LogAuditLaporanRepository logAuditLaporanRepository;

    @Value("${spct.retensi.log-iot-hari:90}")
    private int retensiHari;

    @Value("${spct.retensi.purge-enabled:true}")
    private boolean purgeEnabled;

    /**
     * Job Otomatis Terjadwal (Scheduled Purge)
     * Dijalankan setiap hari pada pukul 02:00 dini hari (atau sesuai ekspresi cron di application.properties).
     * Membersihkan log sensor normal (INFO) yang sudah lebih tua dari 90 hari.
     */
    @Scheduled(cron = "${spct.retensi.purge-cron:0 0 2 * * ?}")
    @Transactional
    public void jalankanPembersihanOtomatis()
    {
        if (!purgeEnabled)
        {
            System.out.println("[DATA RETENTION PURGE] Fitur pembersihan otomatis dinonaktifkan di konfigurasi.");
            return;
        }

        LocalDateTime cutoff = LocalDateTime.now().minusDays(retensiHari);
        System.out.println(String.format("[DATA RETENTION PURGE] Memulai pembersihan berkala log IoT normal sebelum %s (Retensi: %d hari)...",
            cutoff, retensiHari));

        try
        {
            Long kandidat = logOperasionalIoTRepository.countByWaktuKejadianBeforeAndTingkatKeparahan(cutoff, TingkatKeparahan.INFO);
            if (kandidat != null && kandidat > 0)
            {
                long terhapus = logOperasionalIoTRepository.deleteByWaktuKejadianBeforeAndTingkatKeparahan(cutoff, TingkatKeparahan.INFO);
                System.out.println(String.format("[DATA RETENTION PURGE] SUKSES: Berhasil membersihkan %d log sensor normal. Data finansial tetap aman.", terhapus));
            }
            else
            {
                System.out.println(String.format("[DATA RETENTION PURGE] SELESAI: Tidak ada log sensor normal yang melebihi batas retensi %d hari.", retensiHari));
            }
        }
        catch (Exception ex)
        {
            System.err.println("[DATA RETENTION PURGE ERROR] Terjadi kegagalan saat menjalankan pembersihan log: " + ex.getMessage());
        }
    }

    /**
     * Eksekusi Pembersihan Manual (On-Demand Purge)
     * Dapat dipanggil melalui REST API untuk keperluan pengujian, pemeliharaan darurat, atau audit kepatuhan.
     */
    @Transactional
    public Map<String, Object> eksekusiPembersihanManual()
    {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(retensiHari);
        LocalDateTime waktuEksekusi = LocalDateTime.now();

        Long kandidat = logOperasionalIoTRepository.countByWaktuKejadianBeforeAndTingkatKeparahan(cutoff, TingkatKeparahan.INFO);
        long jumlahTerhapus = 0;

        if (kandidat != null && kandidat > 0)
        {
            jumlahTerhapus = logOperasionalIoTRepository.deleteByWaktuKejadianBeforeAndTingkatKeparahan(cutoff, TingkatKeparahan.INFO);
        }

        Map<String, Object> hasil = new HashMap<>();
        hasil.put("status", "SUKSES");
        hasil.put("waktuEksekusi", waktuEksekusi.toString());
        hasil.put("retensiHari", retensiHari);
        hasil.put("cutoffWaktu", cutoff.toString());
        hasil.put("jumlahLogDibersihkan", jumlahTerhapus);
        hasil.put("pesan", String.format("Pembersihan manual selesai. Sebanyak %d log sensor rutin berhasil dibersihkan.", jumlahTerhapus));
        hasil.put("dataFinansialDilindungi", transaksiParkirRepository.count());
        hasil.put("logAuditDilindungi", logAuditLaporanRepository.count());

        System.out.println(String.format("[DATA RETENTION MANUAL] Pembersihan manual dieksekusi: %d log terhapus (Cutoff: %s)",
            jumlahTerhapus, cutoff));

        return hasil;
    }

    /**
     * Mengambil Ringkasan Status Kebijakan Retensi Data
     * Digunakan oleh antarmuka manajemen untuk memantau status penyimpanan dan kepatuhan data.
     */
    public Map<String, Object> getStatusKebijakanRetensi()
    {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(retensiHari);
        Long siapDibersihkan = logOperasionalIoTRepository.countByWaktuKejadianBeforeAndTingkatKeparahan(cutoff, TingkatKeparahan.INFO);

        Map<String, Object> status = new HashMap<>();
        status.put("retensiLogIoTHari", retensiHari);
        status.put("pembersihanOtomatisAktif", purgeEnabled);
        status.put("cutoffKadaluarsaSaatIni", cutoff.toString());
        status.put("jumlahLogIoTKadaluarsa", siapDibersihkan != null ? siapDibersihkan : 0);
        status.put("totalTransaksiFinansialDilindungi", transaksiParkirRepository.count());
        status.put("totalLogAuditDilindungi", logAuditLaporanRepository.count());

        // Kebijakan resmi 3-tier
        Map<String, String> tiers = new HashMap<>();
        tiers.put("Tier 1 - Log IoT Normal", "Retensi 90 hari (otomatis dibersihkan untuk efisiensi kueri)");
        tiers.put("Tier 2 - Log Anomali & Security", "Retensi 365 hari (1 tahun untuk audit kepatuhan & investigasi)");
        tiers.put("Tier 3 - Transaksi Finansial & Audit Trail", "Retensi Permanen / 5-10 Tahun (Immutable, tidak tersentuh pembersihan)");
        status.put("kebijakanTigaTingkat", tiers);

        return status;
    }
}
