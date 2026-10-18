package com.spct.controller;

import com.spct.dto.ResolusiAnomaliRequestDto;
import com.spct.model.StatusResolusi;
import com.spct.repository.LogOperasionalIoTRepository;
import com.spct.repository.SlotParkirRepository;
import com.spct.service.MonitoringFisikService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller: MonitoringFisikController
 * Sesuai Diagram Sequence (IoT Sensor & Log Anomali) dan UC003.
 *
 * ALUR EKSEKUSI (sesuai pseudocode yang disepakati):
 * 1. Menerima telemetri dari IoT Gateway (HTTP Webhook dari Raspberry Pi / MQTT Bridge).
 * 2. Mendelegasikan logika verifikasi & deteksi anomali ke MonitoringFisikService.
 * 3. Service mengirim update real-time ke Dashboard via WebSocket secara otomatis.
 *
 * Endpoint Base URL: /api/iot
 */

// Deklarasi Controller: kelas penerima telemetri dari IoT Gateway (Raspberry Pi / MQTT Bridge)
// Menjadi jembatan antara perangkat keras (sensor ultrasonik/kamera) dan logika bisnis sistem
@RestController
@RequestMapping("/api/monitoring") // Base URL: http://localhost:8081/api/monitoring
@CrossOrigin(origins = "*")  // Mengizinkan request dari IoT Gateway dan Frontend Dashboard
public class MonitoringFisikController // Kelas controller untuk menerima dan memproses data sensor IoT
{
    // =====================================================================
    // Deklarasi Atribut (diinject otomatis oleh Spring)
    // =====================================================================

    @Autowired
    private MonitoringFisikService monitoringFisikService; // Service yang berisi logika verifikasi dan deteksi anomali

    @Autowired
    private LogOperasionalIoTRepository logOperasionalIoTRepository; // Repository untuk endpoint manajemen log anomali

    @Autowired
    private SlotParkirRepository slotParkirRepository; // Repository untuk endpoint data slot real-time


    // =====================================================================
    // Endpoint POST: Menerima telemetri perubahan status dari IoT Gateway
    // =====================================================================

    // Endpoint utama yang dipanggil oleh IoT Gateway (Raspberry Pi) setiap sensor berubah status
    // Payload: { "idSlot": "B1-12", "statusSensor": "TERISI" }
    @PostMapping("/webhook") // URL lengkap: POST /api/iot/webhook
    public ResponseEntity<String> terimaTelemetriSensor(
        @RequestParam String idSlot,          // ID slot yang dilaporkan sensor (misal: "B1-12")
        @RequestParam String statusSensor)    // Status dari sensor hardware: "TERISI" atau "KOSONG"
    {
        // Mendelegasikan seluruh pemrosesan (verifikasi, anomali, WebSocket) ke service
        monitoringFisikService.prosesTelemetriSensor(idSlot, statusSensor);

        // Mengembalikan HTTP 200 OK sebagai konfirmasi bahwa webhook berhasil diterima oleh server
        return ResponseEntity.ok("Telemetri sensor untuk slot [" + idSlot + "] diterima dan sedang diproses.");
    }


    // =====================================================================
    // Endpoint GET: Mengambil daftar log anomali (untuk halaman Anomaly Logs di Dashboard)
    // =====================================================================

    // Endpoint untuk Dashboard Admin mengambil semua log yang belum ditangani
    // Frontend akan memanggil ini saat pertama kali membuka halaman Anomaly Logs
    @GetMapping("/anomali/belum-ditangani") // URL: GET /api/iot/anomali/belum-ditangani
    public ResponseEntity<?> getDaftarAnomaliAktif()
    {
        // Mengambil semua log dengan status BELUM_DITANGANI dari database, diurutkan terbaru di atas
        return ResponseEntity.ok(
            logOperasionalIoTRepository.findByStatusResolusiOrderByWaktuKejadianDesc(StatusResolusi.BELUM_DITANGANI)
        );
    }

    // Endpoint untuk menghitung jumlah anomali aktif (untuk badge notifikasi di header Dashboard)
    @GetMapping("/anomali/hitung") // URL: GET /api/iot/anomali/hitung
    public ResponseEntity<Long> hitungAnomaliAktif()
    {
        // Menghitung jumlah log yang masih berstatus BELUM_DITANGANI
        Long jumlah = logOperasionalIoTRepository.countByStatusResolusi(StatusResolusi.BELUM_DITANGANI);
        return ResponseEntity.ok(jumlah); // Mengembalikan angka (misal: 3) ke Frontend untuk badge notifikasi
    }


    // =====================================================================
    // Endpoint PUT: Menandai anomali sudah ditangani oleh petugas lapangan
    // =====================================================================

    // Endpoint yang dipanggil Dashboard Petugas saat mengonfirmasi sudah menangani anomali
    @PutMapping("/anomali/{idLog}/selesai") // URL: PUT /api/monitoring/anomali/{idLog}/selesai
    public ResponseEntity<String> tandaiAnomalySelesai(
        @PathVariable Long idLog, // ID log anomali yang ingin ditandai selesai
        @RequestBody(required = false) ResolusiAnomaliRequestDto request) // Payload request berisi pilihan jenis anomali dan catatan tambahan
    {
        // Mencari objek log operasional IoT berdasarkan idLog dari database
        return logOperasionalIoTRepository.findById(idLog)
            .map(log ->
            {
                // Mengubah status resolusi log menjadi SELESAI_DIVALIDASI
                log.setStatusResolusi(StatusResolusi.SELESAI_DIVALIDASI); // Mengonfirmasi bahwa anomali telah selesai divalidasi petugas

                // Jika objek request dikirim dan atribut jenisAnomali tidak kosong, maka:
                if (request != null && request.getJenisAnomali() != null && !request.getJenisAnomali().trim().isEmpty())
                {
                    // Inisialisasi atribut jenisAnomali pada entity log sesuai pilihan jenis anomali dari modal
                    log.setJenisAnomali(request.getJenisAnomali().trim());
                }
                else // Jika tidak ada input jenis anomali dalam request body, maka:
                {
                    // Jika atribut jenisAnomali sebelumnya masih kosong atau default strip, maka:
                    if (log.getJenisAnomali() == null || "-".equals(log.getJenisAnomali()))
                    {
                        // Set nilai default jenis anomali menjadi "Salah Parkir"
                        log.setJenisAnomali("Salah Parkir");
                    }
                }

                // Jika objek request menyertakan catatan tambahan dari petugas, maka:
                if (request != null && request.getCatatanTambahan() != null && !request.getCatatanTambahan().trim().isEmpty())
                {
                    // Mengambil catatan detail lama jika ada
                    String catatanLama = (log.getCatatanDetail() != null) ? log.getCatatanDetail() : "";
                    // Menggabungkan catatan lama dengan catatan tambahan dari petugas lapangan
                    log.setCatatanDetail(catatanLama + " [Petugas: " + request.getCatatanTambahan().trim() + "]");
                }

                // Menyimpan seluruh pembaruan entitas log operasional IoT ke database
                logOperasionalIoTRepository.save(log);

                // Mengembalikan response entity dengan status HTTP 200 OK beserta pesan sukses
                return ResponseEntity.ok("Log anomali [" + idLog + "] berhasil ditandai selesai divalidasi dengan jenis: " + log.getJenisAnomali());
            })
            .orElse(ResponseEntity.notFound().build()); // Jika ID log tidak ditemukan di database, kembalikan HTTP 404 Not Found
    }


    // =====================================================================
    // Endpoint GET: Data real-time untuk Dashboard Frontend
    // =====================================================================

    // GET /api/monitoring/slots - Semua slot parkir (status real-time untuk Peta Slot di Dashboard)
    @GetMapping("/slots")
    public ResponseEntity<?> getAllSlots()
    {
        return ResponseEntity.ok(slotParkirRepository.findAll());
    }

    // GET /api/monitoring/log-iot - Semua log IoT (untuk Alert Panel di Dashboard)
    @GetMapping("/log-iot")
    public ResponseEntity<?> getAllLogIoT()
    {
        return ResponseEntity.ok(
            logOperasionalIoTRepository.findAll()
                .stream()
                .sorted(java.util.Comparator.comparing(
                    com.spct.model.LogOperasionalIoT::getWaktuKejadian,
                    java.util.Comparator.reverseOrder()
                ))
                .collect(java.util.stream.Collectors.toList())
        );
    }
}