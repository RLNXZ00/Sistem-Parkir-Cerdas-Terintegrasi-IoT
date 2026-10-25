package com.spct.service; // Nama package dari modul layanan logika bisnis sistem

// Import entitas dan enum dari package model
import com.spct.model.*;
// Import repositori LogOperasionalIoTRepository dari package repository
import com.spct.repository.LogOperasionalIoTRepository;
// Import repositori SlotParkirRepository dari package repository
import com.spct.repository.SlotParkirRepository;
// Import repositori TransaksiParkirRepository dari package repository
import com.spct.repository.TransaksiParkirRepository;
// Import anotasi Autowired dari Spring Framework
import org.springframework.beans.factory.annotation.Autowired;
// Import kelas SimpMessagingTemplate untuk pengiriman pesan WebSocket STOMP
import org.springframework.messaging.simp.SimpMessagingTemplate;
// Import anotasi Service dari Spring Framework
import org.springframework.stereotype.Service;
// Import anotasi Transactional dari Spring Framework
import org.springframework.transaction.annotation.Transactional;

// Import tipe data waktu LocalDateTime java
import java.time.LocalDateTime;
// Import unit waktu ChronoUnit untuk selisih detik
import java.time.temporal.ChronoUnit;
// Import struktur data HashMap dari java util
import java.util.HashMap;
// Import antarmuka Map dari java util
import java.util.Map;

// Kelas layanan publik java MonitoringFisikService untuk memproses telemetri sensor IoT, verifikasi keterisian, dan siaran WebSocket
@Service // Menandai kelas ini sebagai Spring Service Bean
public class MonitoringFisikService
{
    // Injeksi otomatis dependensi SlotParkirRepository
    @Autowired
    private SlotParkirRepository slotParkirRepository; // Deklarasi atribut slotParkirRepository

    // Injeksi otomatis dependensi LogOperasionalIoTRepository
    @Autowired
    private LogOperasionalIoTRepository logOperasionalIoTRepository; // Deklarasi atribut logOperasionalIoTRepository

    // Injeksi otomatis dependensi TransaksiParkirRepository
    @Autowired
    private TransaksiParkirRepository transaksiParkirRepository; // Deklarasi atribut transaksiParkirRepository

    // Injeksi otomatis komponen SimpMessagingTemplate untuk penyiaran pesan real-time WebSocket
    @Autowired
    private SimpMessagingTemplate messagingTemplate; // Deklarasi atribut messagingTemplate

    // =====================================================================
    // Method Utama: Memproses setiap perubahan status yang dikirim sensor IoT
    // =====================================================================

    // Method prosesTelemetriSensor untuk memproses sinyal deteksi dari sensor ultrasonik slot parkir
    @Transactional
    public void prosesTelemetriSensor(String idSlot, String statusSensorHardware)
    {
        // Mengambil entitas slot parkir dari basis data berdasarkan idSlot
        SlotParkir slotDiDatabase = slotParkirRepository.findById(idSlot).orElse(null);

        // Jika slot tidak terdaftar di database, maka:
        if (slotDiDatabase == null)
        {
            // Hentikan proses eksekusi
            return;
        }

        // Mengambil status keterisian slot saat ini dari database
        StatusSlot statusDiDatabase = slotDiDatabase.getStatusSlot();

        // KONDISI 1: Jika slot berstatus DIPESAN dan sensor fisik mendeteksi TERISI, maka:
        if (statusDiDatabase == StatusSlot.DIPESAN && "TERISI".equalsIgnoreCase(statusSensorHardware))
        {
            // Jalankan penanganan kondisi normal parkir
            prosesKondisiNormalParkir(slotDiDatabase);
        }
        // KONDISI 2: Jika slot berstatus TERISI dan sensor melaporkan KOSONG, maka:
        else if (statusDiDatabase == StatusSlot.TERISI && "KOSONG".equalsIgnoreCase(statusSensorHardware))
        {
            // Jalankan penanganan kondisi normal kendaraan keluar
            prosesKondisiNormalKeluar(slotDiDatabase);
        }
        // KONDISI 3: Jika slot berstatus KOSONG namun sensor mendeteksi TERISI (Penyerobotan), maka:
        else if (statusDiDatabase == StatusSlot.KOSONG && "TERISI".equalsIgnoreCase(statusSensorHardware))
        {
            // Jalankan penanganan insiden anomali penyerobotan slot
            prosesKondisiAnomali(slotDiDatabase);
        }
    }

    // =====================================================================
    // Method Pendukung Handler Kondisi Operasional
    // =====================================================================

    // Method prosesKondisiNormalParkir saat kendaraan yang dialokasikan tiba di slot
    private void prosesKondisiNormalParkir(SlotParkir slot)
    {
        // Mencatat waktu kedatangan fisik kendaraan saat ini
        LocalDateTime waktuTibaSekarang = LocalDateTime.now();

        // Mengambil objek kendaraan aktif yang menempati slot
        DataKendaraan kendaraanAktif = slot.getKendaraanAktif();
        // Jika kendaraan aktif terasosiasi pada slot, maka:
        if (kendaraanAktif != null)
        {
            // Mencari transaksi aktif kendaraan yang belum lunas
            transaksiParkirRepository
                .findFirstByKendaraan_PlatNomorAndStatusPembayaranOrderByWaktuMasukDesc(
                    kendaraanAktif.getPlatNomor(), StatusPembayaran.BELUM_LUNAS
                )
                .ifPresent(transaksiAktif ->
                {
                    // Mengubah atribut waktuTibaSlot dengan waktu fisik tiba
                    transaksiAktif.setWaktuTibaSlot(waktuTibaSekarang);

                    // Menghitung selisih detik tempuh dari gerbang masuk ke slot parkir
                    long detikTempuh = ChronoUnit.SECONDS.between(transaksiAktif.getWaktuMasuk(), waktuTibaSekarang);
                    // Menghitung menit yang dihemat (detik dibagi 60.0)
                    double menitDihemat = detikTempuh / 60.0;
                    // Mengubah atribut menitDihemat pada transaksi
                    transaksiAktif.setMenitDihemat(menitDihemat);

                    // Menyimpan pembaruan data transaksi ke database
                    transaksiParkirRepository.save(transaksiAktif);
                    // Menampilkan log kalkulasi reduksi emisi di konsol
                    System.out.println("[CO2] Slot " + slot.getIdSlot() + ": menitDihemat=" + String.format("%.2f", menitDihemat) + " menit (" + detikTempuh + " detik)");
                });
        }

        // Mengubah status slot di database menjadi TERISI
        slot.setStatusSlot(StatusSlot.TERISI);
        // Menyimpan perubahan entitas slot ke database
        slotParkirRepository.save(slot);

        // Membuat rekaman entitas log operasional kejadian normal masuk
        LogOperasionalIoT log = new LogOperasionalIoT(
            slot, // Objek slot terkait
            JenisKejadian.SENSOR_MENDETEKSI_MOBIL_MASUK, // Jenis kejadian
            TingkatKeparahan.INFO, // Tingkat keparahan INFO
            "Slot " + slot.getIdSlot() + ": kendaraan yang dialokasikan telah tiba. Status diubah menjadi TERISI."
        );
        // Mengubah status resolusi menjadi SELESAI_DIVALIDASI karena bukan anomali
        log.setStatusResolusi(StatusResolusi.SELESAI_DIVALIDASI);
        // Menyimpan entitas log ke database
        logOperasionalIoTRepository.save(log);

        // Mengirim pembaruan denah real-time ke Dashboard Admin via WebSocket
        kirimPembaruanDenah(slot.getIdSlot(), "TERISI", TingkatKeparahan.INFO.name());
    }

    // Method prosesKondisiNormalKeluar saat kendaraan telah meninggalkan slot
    private void prosesKondisiNormalKeluar(SlotParkir slot)
    {
        // Mengubah status slot di database menjadi KOSONG
        slot.setStatusSlot(StatusSlot.KOSONG);
        // Menghapus referensi kendaraan aktif
        slot.setKendaraanAktif(null);
        // Menghapus timestamp pemesanan slot
        slot.setWaktuDipesan(null);
        // Menyimpan perubahan status slot ke database
        slotParkirRepository.save(slot);

        // Membuat rekaman entitas log operasional kejadian keluar
        LogOperasionalIoT log = new LogOperasionalIoT(
            slot, // Objek slot terkait
            JenisKejadian.SENSOR_MENDETEKSI_MOBIL_KELUAR, // Jenis kejadian
            TingkatKeparahan.INFO, // Tingkat keparahan INFO
            "Slot " + slot.getIdSlot() + ": kendaraan telah keluar. Status diubah menjadi KOSONG."
        );
        // Mengubah status resolusi menjadi SELESAI_DIVALIDASI
        log.setStatusResolusi(StatusResolusi.SELESAI_DIVALIDASI);
        // Menyimpan entitas log ke database
        logOperasionalIoTRepository.save(log);

        // Mengirim pembaruan denah real-time ke Dashboard Admin via WebSocket
        kirimPembaruanDenah(slot.getIdSlot(), "KOSONG", TingkatKeparahan.INFO.name());
    }

    // Method prosesKondisiAnomali saat terjadi indikasi penyerobotan slot parkir
    private void prosesKondisiAnomali(SlotParkir slot)
    {
        // Membuat rekaman log kejadian anomali berderajat CRITICAL
        LogOperasionalIoT log = new LogOperasionalIoT(
            slot, // Objek slot terkait
            JenisKejadian.ANOMALI_PENYEROBOTAN_SLOT, // Kategori kejadian anomali penyerobotan
            TingkatKeparahan.CRITICAL, // Tingkat keparahan CRITICAL
            "ANOMALI! Slot " + slot.getIdSlot() + ": status DB=KOSONG tetapi sensor mendeteksi kendaraan. Kemungkinan penyerobotan atau salah parkir."
        );
        // Menyimpan log anomali ke database
        logOperasionalIoTRepository.save(log);

        // Mengirim notifikasi darurat alert anomali ke dashboard petugas melalui WebSocket
        kirimAlertAnomalii(slot.getIdSlot(), log.getCatatanDetail());

        // Memperbarui visualisasi status denah menjadi warna anomali kritis
        kirimPembaruanDenah(slot.getIdSlot(), "ANOMALI", TingkatKeparahan.CRITICAL.name());
    }

    // =====================================================================
    // Method WebSocket: Mengirim pesan push ke Frontend Dashboard
    // =====================================================================

    // Method kirimPembaruanDenah untuk broadcast pesan ke topik /topic/monitoring
    private void kirimPembaruanDenah(String idSlot, String statusBaru, String tingkatKeparahan)
    {
        // Instansiasi objek HashMap untuk payload pesan WebSocket
        Map<String, String> payload = new HashMap<>();
        // Memasukkan id slot ke payload
        payload.put("idSlot", idSlot);
        // Memasukkan status baru slot ke payload
        payload.put("statusBaru", statusBaru);
        // Memasukkan tingkat keparahan ke payload
        payload.put("tingkatKeparahan", tingkatKeparahan);

        // Mengirimkan payload pesan ke topik WebSocket /topic/monitoring
        messagingTemplate.convertAndSend("/topic/monitoring", payload);
    }

    // Method kirimAlertAnomalii untuk broadcast pesan darurat ke topik /topic/anomali
    private void kirimAlertAnomalii(String idSlot, String pesanAnomali)
    {
        // Instansiasi objek HashMap untuk payload peringatan darurat
        Map<String, String> payloadAlert = new HashMap<>();
        // Memasukkan id slot anomali
        payloadAlert.put("idSlot", idSlot);
        // Memasukkan teks pesan detail anomali
        payloadAlert.put("pesan", pesanAnomali);
        // Memasukkan jenis anomali penyerobotan
        payloadAlert.put("jenis", "ANOMALI_PENYEROBOTAN");

        // Mengirimkan sinyal darurat anomali ke topik WebSocket /topic/anomali
        messagingTemplate.convertAndSend("/topic/anomali", payloadAlert);
    }
}
