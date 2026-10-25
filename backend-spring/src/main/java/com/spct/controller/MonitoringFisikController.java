package com.spct.controller; // Nama package dari modul pengontrol REST API sistem

// Import DTO ResolusiAnomaliRequestDto dari package dto
import com.spct.dto.ResolusiAnomaliRequestDto;
// Import entitas LogOperasionalIoT dari package model
import com.spct.model.LogOperasionalIoT;
// Import enum StatusResolusi dari package model
import com.spct.model.StatusResolusi;
// Import repositori LogOperasionalIoTRepository dari package repository
import com.spct.repository.LogOperasionalIoTRepository;
// Import repositori SlotParkirRepository dari package repository
import com.spct.repository.SlotParkirRepository;
// Import service MonitoringFisikService dari package service
import com.spct.service.MonitoringFisikService;
// Import anotasi Autowired dari Spring Framework
import org.springframework.beans.factory.annotation.Autowired;
// Import kelas ResponseEntity dari Spring HTTP
import org.springframework.http.ResponseEntity;
// Import anotasi-anotasi Spring Web REST Controller
import org.springframework.web.bind.annotation.*;

// Import pembanding Comparator dari java util
import java.util.Comparator;
// Import kolektor Collectors dari java util stream
import java.util.stream.Collectors;

// Kelas pengontrol publik java MonitoringFisikController untuk menangani webhook sensor IoT, konfirmasi anomali, dan status slot
@RestController // Menandai kelas sebagai pengendali REST API
@RequestMapping("/api/monitoring") // Menetapkan path rute dasar endpoint /api/monitoring
@CrossOrigin(origins = "*") // Mengizinkan permintaan lintas domain dari IoT Gateway dan Web Dashboard
public class MonitoringFisikController
{
    // Injeksi otomatis dependensi layanan MonitoringFisikService oleh Spring
    @Autowired
    private MonitoringFisikService monitoringFisikService; // Deklarasi atribut monitoringFisikService

    // Injeksi otomatis dependensi repositori LogOperasionalIoTRepository
    @Autowired
    private LogOperasionalIoTRepository logOperasionalIoTRepository; // Deklarasi atribut logOperasionalIoTRepository

    // Injeksi otomatis dependensi repositori SlotParkirRepository
    @Autowired
    private SlotParkirRepository slotParkirRepository; // Deklarasi atribut slotParkirRepository

    // =====================================================================
    // Endpoint POST: Menerima telemetri perubahan status dari IoT Gateway
    // =====================================================================

    // Method POST terimaTelemetriSensor untuk memproses webhook deteksi sensor ultrasonik
    @PostMapping("/webhook")
    public ResponseEntity<String> terimaTelemetriSensor(
        @RequestParam String idSlot, // Parameter nomor slot parkir
        @RequestParam String statusSensor) // Parameter status deteksi sensor (TERISI/KOSONG)
    {
        // Memanggil service untuk memverifikasi kesesuaian status slot, mendeteksi penyerobotan, dan broadcast WebSocket
        monitoringFisikService.prosesTelemetriSensor(idSlot, statusSensor);

        // Mengembalikan respons HTTP 200 OK beserta pesan konfirmasi pemrosesan
        return ResponseEntity.ok("Telemetri sensor untuk slot [" + idSlot + "] diterima dan sedang diproses.");
    }

    // =====================================================================
    // Endpoint GET: Mengambil daftar log anomali yang belum ditangani
    // =====================================================================

    // Method GET getDaftarAnomaliAktif untuk menyajikan daftar anomali yang memerlukan penanganan petugas
    @GetMapping("/anomali/belum-ditangani")
    public ResponseEntity<?> getDaftarAnomaliAktif()
    {
        // Mengambil daftar anomali berstatus BELUM_DITANGANI dari database terurut waktu menurun
        return ResponseEntity.ok(
            logOperasionalIoTRepository.findByStatusResolusiOrderByWaktuKejadianDesc(StatusResolusi.BELUM_DITANGANI)
        );
    }

    // =====================================================================
    // Endpoint GET: Menghitung kuantitas anomali aktif
    // =====================================================================

    // Method GET hitungAnomaliAktif untuk menghitung jumlah anomali yang belum divalidasi
    @GetMapping("/anomali/hitung")
    public ResponseEntity<Long> hitungAnomaliAktif()
    {
        // Menghitung jumlah log dengan status resolusi BELUM_DITANGANI
        Long jumlah = logOperasionalIoTRepository.countByStatusResolusi(StatusResolusi.BELUM_DITANGANI);

        // Mengembalikan kuantitas total anomali bertipe Long
        return ResponseEntity.ok(jumlah);
    }

    // =====================================================================
    // Endpoint PUT: Menandai anomali telah selesai divalidasi oleh petugas
    // =====================================================================

    // Method PUT tandaiAnomalySelesai untuk mengonfirmasi penanganan anomali lapangan
    @PutMapping("/anomali/{idLog}/selesai")
    public ResponseEntity<String> tandaiAnomalySelesai(
        @PathVariable Long idLog, // Parameter path ID log kejadian yang ditangani
        @RequestBody(required = false) ResolusiAnomaliRequestDto request) // Payload body konfirmasi penanganan
    {
        // Mencari entitas log di basis data berdasarkan nilai idLog
        return logOperasionalIoTRepository.findById(idLog)
            .map(log ->
            {
                // Mengubah status resolusi entitas menjadi SELESAI_DIVALIDASI
                log.setStatusResolusi(StatusResolusi.SELESAI_DIVALIDASI);

                // Jika objek request dikirim dan atribut jenisAnomali tidak kosong, maka:
                if (request != null && request.getJenisAnomali() != null && !request.getJenisAnomali().trim().isEmpty())
                {
                    // Inisialisasi atribut jenisAnomali pada entity log sesuai opsi pilihan dari modal
                    log.setJenisAnomali(request.getJenisAnomali().trim());
                }
                else // Jika tidak ada input jenis anomali dalam request body, maka:
                {
                    // Jika atribut jenisAnomali sebelumnya masih kosong atau tanda strip, maka:
                    if (log.getJenisAnomali() == null || "-".equals(log.getJenisAnomali()))
                    {
                        // Inisialisasi jenis anomali default bernilai "Salah Parkir"
                        log.setJenisAnomali("Salah Parkir");
                    }
                }

                // Jika request menyertakan catatan tambahan keterangan, maka:
                if (request != null && request.getCatatanTambahan() != null && !request.getCatatanTambahan().trim().isEmpty())
                {
                    // Mengambil catatan detail lama jika ada
                    String catatanLama = (log.getCatatanDetail() != null) ? log.getCatatanDetail() : "";
                    // Menggabungkan catatan lama dengan catatan tambahan dari petugas lapangan
                    log.setCatatanDetail(catatanLama + " [Petugas: " + request.getCatatanTambahan().trim() + "]");
                }

                // Menyimpan pembaruan entitas log operasional ke database
                logOperasionalIoTRepository.save(log);

                // Mengembalikan pesan konfirmasi keberhasilan penanganan anomali
                return ResponseEntity.ok("Log anomali [" + idLog + "] berhasil ditandai selesai divalidasi dengan jenis: " + log.getJenisAnomali());
            })
            // Jika ID log tidak ditemukan di database, kembalikan HTTP 404 Not Found
            .orElse(ResponseEntity.notFound().build());
    }

    // =====================================================================
    // Endpoint GET: Data real-time untuk Dashboard Frontend
    // =====================================================================

    // Method GET getAllSlots untuk menyajikan daftar seluruh unit denah slot parkir
    @GetMapping("/slots")
    public ResponseEntity<?> getAllSlots()
    {
        // Mengembalikan seluruh slot parkir beserta status ketersediaannya
        return ResponseEntity.ok(slotParkirRepository.findAll());
    }

    // Method GET getAllLogIoT untuk menyajikan riwayat seluruh pembacaan sensor IoT
    @GetMapping("/log-iot")
    public ResponseEntity<?> getAllLogIoT()
    {
        // Mengambil semua log kejadian sensor terurut dari waktu terbaru
        return ResponseEntity.ok(
            logOperasionalIoTRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(
                    LogOperasionalIoT::getWaktuKejadian,
                    Comparator.reverseOrder()
                ))
                .collect(Collectors.toList())
        );
    }
}