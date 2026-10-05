package com.spct.service;

import com.spct.model.*;
import com.spct.repository.LogOperasionalIoTRepository;
import com.spct.repository.SlotParkirRepository;
import com.spct.repository.TransaksiParkirRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;  // Mengimpor HashMap untuk menyusun payload notifikasi WebSocket
import java.util.Map;      // Mengimpor Map untuk tipe data payload notifikasi WebSocket

// Deklarasi Service: kelas yang berisi logika verifikasi sensor IoT dan deteksi anomali
// Sesuai pseudocode: membandingkan status sensor hardware dengan status database, lalu bertindak
@Service
public class MonitoringFisikService // Kelas service yang mengorkestrasi semua logika pemrosesan data sensor IoT
{
    // =====================================================================
    // Deklarasi Atribut (diinject otomatis oleh Spring)
    // =====================================================================

    @Autowired
    private SlotParkirRepository slotParkirRepository; // Repository untuk membaca dan mengubah status slot di database

    @Autowired
    private LogOperasionalIoTRepository logOperasionalIoTRepository; // Repository untuk menyimpan setiap kejadian ke tabel log

    @Autowired
    private TransaksiParkirRepository transaksiParkirRepository; // Repository untuk menemukan transaksi aktif saat sensor mendeteksi kendaraan tiba

    // SimpMessagingTemplate: komponen Spring untuk mengirim pesan ke klien WebSocket yang sudah subscribe
    // Setara dengan memanggil sebuah method yang langsung "muncul" di layar Dashboard Admin tanpa refresh
    @Autowired
    private SimpMessagingTemplate messagingTemplate; // Komponen pengirim pesan WebSocket ke Frontend Dashboard


    // =====================================================================
    // Method Utama: Memproses setiap perubahan status yang dikirim sensor IoT
    // =====================================================================

    // Dipanggil oleh MonitoringFisikController setiap ada laporan masuk dari IoT Gateway
    // @Transactional memastikan operasi baca-tulis database dan pengiriman log berjalan atomik
    @Transactional
    public void prosesTelemetriSensor(String idSlot, String statusSensorHardware)
    {
        // Ambil data slot dari database berdasarkan id_slot yang dilaporkan sensor
        SlotParkir slotDiDatabase = slotParkirRepository.findById(idSlot)
            .orElse(null); // Jika slot tidak ditemukan di database, kembalikan null

        // Validasi: jika slot tidak dikenali oleh database, log sebagai anomali sensor tidak terdaftar
        if (slotDiDatabase == null)
        {
            // TODO: Kirim notifikasi WebSocket "Sensor tidak dikenal" di iterasi selanjutnya
            return; // Hentikan proses jika slot tidak terdaftar
        }

        // Ambil status slot saat ini dari database untuk dibandingkan dengan status dari sensor hardware
        StatusSlot statusDiDatabase = slotDiDatabase.getStatusSlot();

        // =====================================================================
        // BRANCHING: Bandingkan status sensor hardware dengan status di database
        // Sesuai pseudocode 3 kondisi yang disepakati
        // =====================================================================

        // --- KONDISI 1: Normal Parkir ---
        // Status database = DIPESAN (sudah dialokasikan) DAN sensor mendeteksi kendaraan masuk (TERISI)
        // Artinya: Kendaraan yang seharusnya menempati slot ini sudah tiba di tempatnya
        if (statusDiDatabase == StatusSlot.DIPESAN && "TERISI".equalsIgnoreCase(statusSensorHardware))
        {
            prosesKondisiNormalParkir(slotDiDatabase); // Panggil method handler Kondisi 1
        }

        // --- KONDISI 2: Normal Keluar ---
        // Status database = TERISI DAN sensor melaporkan slot sudah kosong kembali
        // Artinya: Kendaraan sudah meninggalkan slot (sudah melewati gerbang keluar)
        else if (statusDiDatabase == StatusSlot.TERISI && "KOSONG".equalsIgnoreCase(statusSensorHardware))
        {
            prosesKondisiNormalKeluar(slotDiDatabase); // Panggil method handler Kondisi 2
        }

        // --- KONDISI 3: Anomali / Penyerobotan ---
        // Status database = KOSONG (tidak ada alokasi) TETAPI sensor mendeteksi ada kendaraan
        // Artinya: Ada kendaraan masuk tanpa melalui proses alokasi sistem (penyerobotan / salah parkir)
        else if (statusDiDatabase == StatusSlot.KOSONG && "TERISI".equalsIgnoreCase(statusSensorHardware))
        {
            prosesKondisiAnomali(slotDiDatabase); // Panggil method handler Kondisi 3
        }
        // Kondisi lain (misal: status tidak berubah) diabaikan untuk menghindari log yang berlebihan
    }


    // =====================================================================
    // Method Pendukung: Handler untuk setiap kondisi yang mungkin terjadi
    // =====================================================================

    // Handler Kondisi 1: kendaraan yang benar sudah tiba di slot yang dialokasikan
    private void prosesKondisiNormalParkir(SlotParkir slot)
    {
        LocalDateTime waktuTibaSekarang = LocalDateTime.now(); // Catat timestamp tepat saat sensor mendeteksi kendaraan tiba

        // =====================================================================
        // Kalkulasi Eco-Metrics CO2 Real-Time:
        // Cari transaksi aktif milik kendaraan di slot ini, lalu hitung berapa menit dari
        // waktu masuk gerbang (waktuMasuk) hingga tiba di slot (sekarang)
        // Waktu tempuh inilah yang RIIL dihemat kendaraan berkat navigasi A*
        // =====================================================================
        DataKendaraan kendaraanAktif = slot.getKendaraanAktif();
        if (kendaraanAktif != null) // Pastikan slot punya kendaraan yang terasosiasi
        {
            transaksiParkirRepository
                .findFirstByKendaraan_PlatNomorAndStatusPembayaranOrderByWaktuMasukDesc(
                    kendaraanAktif.getPlatNomor(), StatusPembayaran.BELUM_LUNAS
                )
                .ifPresent(transaksiAktif ->
                {
                    // Rekam timestamp fisik kendaraan tiba di slot
                    transaksiAktif.setWaktuTibaSlot(waktuTibaSekarang);

                    // Hitung menit dihemat: selisih dari gerbang masuk ke slot (dalam menit desimal)
                    // Contoh: masuk 10:00:00, tiba slot 10:00:30 → menitDihemat = 0.5
                    long detikTempuh = ChronoUnit.SECONDS.between(transaksiAktif.getWaktuMasuk(), waktuTibaSekarang);
                    double menitDihemat = detikTempuh / 60.0; // Konversi detik ke menit (presisi desimal)
                    transaksiAktif.setMenitDihemat(menitDihemat);

                    transaksiParkirRepository.save(transaksiAktif); // Simpan kedua atribut baru ke database
                    System.out.println("[CO2] Slot " + slot.getIdSlot() + ": menitDihemat=" + String.format("%.2f", menitDihemat) + " menit (" + detikTempuh + " detik)");
                });
        }

        // UPDATE: Ubah status slot di database menjadi TERISI (konfirmasi fisik dari sensor)
        slot.setStatusSlot(StatusSlot.TERISI); // Mengubah status slot menjadi TERISI
        slotParkirRepository.save(slot);        // Simpan perubahan ke database

        // INSERT: Catat kejadian normal ke tabel log
        LogOperasionalIoT log = new LogOperasionalIoT(
            slot,                                              // Slot yang terkait
            JenisKejadian.SENSOR_MENDETEKSI_MOBIL_MASUK,     // Jenis kejadian: normal masuk
            TingkatKeparahan.INFO,                            // Level: informasi biasa (hijau di Dashboard)
            "Slot " + slot.getIdSlot() + ": kendaraan yang dialokasikan telah tiba. Status diubah menjadi TERISI."
        );
        log.setStatusResolusi(StatusResolusi.SELESAI_DIVALIDASI); // Laporannya sudah valid/bukan anomali
        logOperasionalIoTRepository.save(log); // Simpan log ke database

        // PUSH WebSocket: Kirim pembaruan status denah ke Dashboard Admin (Redraw peta)
        kirimPembaruanDenah(slot.getIdSlot(), "TERISI", TingkatKeparahan.INFO.name());
    }

    // Handler Kondisi 2: slot kembali kosong karena kendaraan sudah keluar
    private void prosesKondisiNormalKeluar(SlotParkir slot)
    {
        // UPDATE: Ubah status slot di database menjadi KOSONG
        slot.setStatusSlot(StatusSlot.KOSONG);    // Mengubah status slot menjadi KOSONG
        slot.setKendaraanAktif(null);              // Putuskan relasi dengan kendaraan yang sebelumnya
        slot.setWaktuDipesan(null);                // Bersihkan timestamp pemesanan
        slotParkirRepository.save(slot);           // Simpan perubahan ke database

        // INSERT: Catat kejadian normal ke tabel log
        LogOperasionalIoT log = new LogOperasionalIoT(
            slot,                                               // Slot yang terkait
            JenisKejadian.SENSOR_MENDETEKSI_MOBIL_KELUAR,     // Jenis kejadian: normal keluar
            TingkatKeparahan.INFO,                             // Level: informasi biasa (hijau di Dashboard)
            "Slot " + slot.getIdSlot() + ": kendaraan telah keluar. Status diubah menjadi KOSONG."
        );
        log.setStatusResolusi(StatusResolusi.SELESAI_DIVALIDASI); // Laporannya sudah valid/bukan anomali
        logOperasionalIoTRepository.save(log); // Simpan log ke database

        // PUSH WebSocket: Kirim pembaruan status denah ke Dashboard Admin (Redraw peta)
        kirimPembaruanDenah(slot.getIdSlot(), "KOSONG", TingkatKeparahan.INFO.name());
    }

    // Handler Kondisi 3: ANOMALI - kendaraan menyerobot slot tanpa alokasi sistem
    private void prosesKondisiAnomali(SlotParkir slot)
    {
        // INSERT: Catat kejadian anomali kritis ke tabel log (TIDAK mengubah status database)
        // Status database SENGAJA tidak diubah agar sistem tetap konsisten dan petugas yang menangani
        LogOperasionalIoT log = new LogOperasionalIoT(
            slot,                                           // Slot yang terkait
            JenisKejadian.ANOMALI_PENYEROBOTAN_SLOT,       // Jenis kejadian: anomali kritis!
            TingkatKeparahan.CRITICAL,                     // Level: kritis (merah di Dashboard)
            "ANOMALI! Slot " + slot.getIdSlot() + ": status DB=KOSONG tetapi sensor mendeteksi kendaraan. Kemungkinan penyerobotan atau salah parkir."
        );
        logOperasionalIoTRepository.save(log); // Simpan log anomali ke database

        // PUSH WebSocket DARURAT: Kirim sinyal peringatan merah ke Dashboard Petugas Lapangan secara instan
        // Topik khusus /topic/anomali agar Dashboard bisa menampilkan popup peringatan
        kirimAlertAnomalii(slot.getIdSlot(), log.getCatatanDetail());

        // Juga perbarui status denah dengan warna peringatan
        kirimPembaruanDenah(slot.getIdSlot(), "ANOMALI", TingkatKeparahan.CRITICAL.name());
    }


    // =====================================================================
    // Method WebSocket: Mengirim pesan push ke Frontend Dashboard
    // =====================================================================

    // Method untuk mengirim pembaruan status slot ke topik denah real-time
    // Frontend Dashboard subscribe ke /topic/monitoring untuk menerima pembaruan ini
    private void kirimPembaruanDenah(String idSlot, String statusBaru, String tingkatKeparahan)
    {
        // Menyusun payload pesan dalam format Map (akan dikonversi JSON otomatis oleh Spring)
        Map<String, String> payload = new HashMap<>(); // Menyimpan data yang akan dikirim sebagai JSON
        payload.put("idSlot", idSlot);                    // Menambahkan ID slot yang berubah
        payload.put("statusBaru", statusBaru);            // Menambahkan status baru slot
        payload.put("tingkatKeparahan", tingkatKeparahan); // Menambahkan level keparahan untuk pewarnaan

        // Mengirim payload ke topik /topic/monitoring: semua Frontend yang subscribe akan menerima ini
        messagingTemplate.convertAndSend("/topic/monitoring", payload); // Kirim pembaruan denah ke semua klien yang subscribe
    }

    // Method untuk mengirim peringatan anomali darurat ke topik khusus anomali
    // Frontend Dashboard subscribe ke /topic/anomali untuk menampilkan popup peringatan merah
    private void kirimAlertAnomalii(String idSlot, String pesanAnomali)
    {
        // Menyusun payload peringatan anomali
        Map<String, String> payloadAlert = new HashMap<>(); // Menyimpan data peringatan yang akan dikirim sebagai JSON
        payloadAlert.put("idSlot", idSlot);                    // Menambahkan ID slot anomali
        payloadAlert.put("pesan", pesanAnomali);               // Menambahkan pesan detail anomali
        payloadAlert.put("jenis", "ANOMALI_PENYEROBOTAN");     // Menambahkan jenis anomali

        // Mengirim peringatan ke topik /topic/anomali: Frontend akan menampilkan popup peringatan
        messagingTemplate.convertAndSend("/topic/anomali", payloadAlert); // Kirim sinyal darurat anomali ke semua klien
    }
}
