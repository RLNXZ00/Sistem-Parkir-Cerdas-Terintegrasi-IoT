package com.spct.controller; // Nama package controller

import com.spct.model.JenisKejadian; // Mengimpor enum JenisKejadian
import com.spct.model.KameraAnpr; // Mengimpor model KameraAnpr
import com.spct.model.LogOperasionalIoT; // Mengimpor model LogOperasionalIoT
import com.spct.model.SensorIoT; // Mengimpor model SensorIoT
import com.spct.model.StatusResolusi; // Mengimpor enum StatusResolusi
import com.spct.model.TingkatKeparahan; // Mengimpor enum TingkatKeparahan
import com.spct.repository.KameraAnprRepository; // Mengimpor repository kamera_anpr
import com.spct.repository.LogOperasionalIoTRepository; // Mengimpor repository log_operasional_iot
import com.spct.repository.SensorIoTRepository; // Mengimpor repository sensor_iot
import org.springframework.beans.factory.annotation.Autowired; // Mengimpor anotasi Autowired untuk injeksi dependensi
import org.springframework.http.ResponseEntity; // Mengimpor ResponseEntity untuk pembungkus respons HTTP
import org.springframework.web.bind.annotation.*; // Mengimpor anotasi REST Controller Spring Web

import java.util.List; // Mengimpor interface List
import java.util.Map; // Mengimpor interface Map untuk payload JSON
import java.util.Optional; // Mengimpor kelas Optional untuk penanganan objek null-safe

// Anotasi RestController: mendeklarasikan kelas sebagai controller REST API
@RestController
// Anotasi RequestMapping: menentukan base URL endpoint "/api/hardware"
@RequestMapping("/api/hardware")
// Anotasi CrossOrigin: mengizinkan akses dari semua domain frontend
@CrossOrigin(origins = "*")
// Kelas publik HardwareStatusController untuk mengelola status operasional perangkat keras IoT
public class HardwareStatusController
{
    // Deklarasi atribut kameraRepo bertipe KameraAnprRepository dengan injeksi otomatis Spring
    @Autowired
    private KameraAnprRepository kameraRepo;

    // Deklarasi atribut sensorRepo bertipe SensorIoTRepository dengan injeksi otomatis Spring
    @Autowired
    private SensorIoTRepository sensorRepo;

    // Deklarasi atribut logRepo bertipe LogOperasionalIoTRepository dengan injeksi otomatis Spring
    @Autowired
    private LogOperasionalIoTRepository logRepo;


    // =====================================================================
    // Method GET: Mengambil status semua kamera ANPR
    // =====================================================================
    @GetMapping("/kamera")
    public ResponseEntity<List<KameraAnpr>> getAllKamera()
    {
        // Memanggil method findAll() pada kameraRepo dan mengembalikan respons HTTP 200 OK
        return ResponseEntity.ok(this.kameraRepo.findAll());
    }


    // =====================================================================
    // Method PATCH: Mengubah status operasional kamera ANPR (ON/OFF)
    // =====================================================================
    @PatchMapping("/kamera/{idKamera}/status")
    public ResponseEntity<?> updateStatusKamera(
        @PathVariable String idKamera, // Parameter ID kamera dari URL path
        @RequestBody Map<String, String> body) // Payload request JSON dari body
    {
        // Mengambil nilai atribut statusBaru dari request body map
        String statusBaru = body != null ? body.get("statusKamera") : null;

        // Jika statusBaru bernilai null atau bukan "ON" dan bukan "OFF", maka:
        if (statusBaru == null || (!statusBaru.equalsIgnoreCase("ON") && !statusBaru.equalsIgnoreCase("OFF")))
        {
            // Mengembalikan respons HTTP 400 Bad Request dengan pesan error
            return ResponseEntity.badRequest().body(Map.of("pesan", "Status harus 'ON' atau 'OFF'."));
        }

        // Normalisasi status ke format huruf kapital
        statusBaru = statusBaru.toUpperCase();

        // Mencari objek kamera berdasarkan idKamera di database (dukung pencarian tepat atau case-insensitive)
        Optional<KameraAnpr> kameraOpt = this.kameraRepo.findById(idKamera);
        if (kameraOpt.isEmpty())
        {
            kameraOpt = this.kameraRepo.findAll().stream()
                .filter(k -> k.getIdKamera().equalsIgnoreCase(idKamera))
                .findFirst();
        }

        // Jika data kamera tidak ditemukan dalam database, maka:
        if (kameraOpt.isEmpty())
        {
            // Mengembalikan respons HTTP 404 Not Found
            return ResponseEntity.notFound().build();
        }

        // Mengambil entitas objek KameraAnpr dari container Optional
        KameraAnpr kamera = kameraOpt.get();

        // Mengubah atribut status operasional kamera dengan statusBaru
        kamera.setStatusKamera(statusBaru);

        // Menyimpan perubahan status kamera ke database melalui kameraRepo
        this.kameraRepo.save(kamera);

        // Mengembalikan respons HTTP 200 OK beserta data konfirmasi perubahan status
        return ResponseEntity.ok(Map.of(
            "pesan", "Status kamera " + kamera.getIdKamera() + " berhasil diubah ke " + statusBaru,
            "idKamera", kamera.getIdKamera(),
            "statusKamera", kamera.getStatusKamera()
        ));
    }


    // =====================================================================
    // Method GET: Mengambil status semua sensor IoT ultrasonik
    // =====================================================================
    @GetMapping("/sensor")
    public ResponseEntity<List<SensorIoT>> getAllSensor()
    {
        // Memanggil method findAll() pada sensorRepo dan mengembalikan respons HTTP 200 OK
        return ResponseEntity.ok(this.sensorRepo.findAll());
    }


    // =====================================================================
    // Method PATCH: Mengubah status operasional sensor IoT (ON/OFF)
    // =====================================================================
    @PatchMapping("/sensor/{idSensor}/status")
    public ResponseEntity<?> updateStatusSensor(
        @PathVariable String idSensor, // Parameter ID sensor dari URL path
        @RequestBody Map<String, String> body) // Payload request JSON dari body
    {
        // Mengambil nilai atribut statusBaru dari request body map
        String statusBaru = body != null ? body.get("statusSensor") : null;

        // Jika statusBaru bernilai null atau bukan "ON" dan bukan "OFF", maka:
        if (statusBaru == null || (!statusBaru.equalsIgnoreCase("ON") && !statusBaru.equalsIgnoreCase("OFF")))
        {
            // Mengembalikan respons HTTP 400 Bad Request dengan pesan error
            return ResponseEntity.badRequest().body(Map.of("pesan", "Status harus 'ON' atau 'OFF'."));
        }

        // Normalisasi status ke format huruf kapital
        statusBaru = statusBaru.toUpperCase();

        // Mencari objek sensor berdasarkan idSensor di database
        Optional<SensorIoT> sensorOpt = this.sensorRepo.findById(idSensor);

        // Jika tidak ditemukan langsung, coba cari berdasarkan ID slot yang dipantau (misal: "B1-01")
        if (sensorOpt.isEmpty())
        {
            sensorOpt = this.sensorRepo.findBySlotDipantau_IdSlot(idSensor);
        }
        // Jika masih belum ditemukan, coba dengan menambahkan prefix SNS- (misal: "SNS-B1-01")
        if (sensorOpt.isEmpty() && !idSensor.startsWith("SNS-"))
        {
            sensorOpt = this.sensorRepo.findById("SNS-" + idSensor);
        }

        // Jika data sensor tidak ditemukan dalam database, maka:
        if (sensorOpt.isEmpty())
        {
            // Mengembalikan respons HTTP 404 Not Found
            return ResponseEntity.notFound().build();
        }

        // Mengambil entitas objek SensorIoT dari container Optional
        SensorIoT sensor = sensorOpt.get();

        // Mengubah atribut status operasional sensor dengan statusBaru
        sensor.setStatusSensor(statusBaru);

        // Menyimpan perubahan status sensor ke database melalui sensorRepo
        this.sensorRepo.save(sensor);

        // Jika status sensor diubah menjadi OFF, buat rekam jejak anomali hardware tingkat CRITICAL
        if ("OFF".equalsIgnoreCase(statusBaru) && sensor.getSlotDipantau() != null)
        {
            LogOperasionalIoT logAnomali = new LogOperasionalIoT(
                sensor.getSlotDipantau(),
                JenisKejadian.SENSOR_OFFLINE_TIMEOUT,
                TingkatKeparahan.CRITICAL,
                "Sensor ultrasonik " + sensor.getIdSensor() + " pada slot " + sensor.getSlotDipantau().getIdSlot() + " terputus/OFFLINE. Slot dilewati dari alokasi kendaraan."
            );
            logAnomali.setJenisAnomali("SENSOR_OFFLINE");
            logAnomali.setStatusResolusi(StatusResolusi.BELUM_DITANGANI);
            this.logRepo.save(logAnomali);
            System.out.println("[HARDWARE] Sensor " + sensor.getIdSensor() + " OFFLINE -> Anomali CRITICAL dicatat.");
        }
        // Jika sensor kembali ON, otomatis selesaikan tiket anomali sensor offline sebelumnya
        else if ("ON".equalsIgnoreCase(statusBaru) && sensor.getSlotDipantau() != null)
        {
            List<LogOperasionalIoT> riwayatLog = this.logRepo.findBySlotTerkait_IdSlotOrderByWaktuKejadianDesc(sensor.getSlotDipantau().getIdSlot());
            for (LogOperasionalIoT a : riwayatLog)
            {
                if (a.getJenisKejadian() == JenisKejadian.SENSOR_OFFLINE_TIMEOUT && a.getStatusResolusi() == StatusResolusi.BELUM_DITANGANI)
                {
                    a.setStatusResolusi(StatusResolusi.SELESAI_DIVALIDASI);
                    a.setCatatanDetail(a.getCatatanDetail() + " [Sensor kembali pulih ON]");
                    this.logRepo.save(a);
                }
            }
            System.out.println("[HARDWARE] Sensor " + sensor.getIdSensor() + " kembali ONLINE -> Anomali diselesaikan.");
        }

        // Mengembalikan respons HTTP 200 OK beserta data konfirmasi perubahan status
        return ResponseEntity.ok(Map.of(
            "pesan", "Status sensor " + sensor.getIdSensor() + " berhasil diubah ke " + statusBaru,
            "idSensor", sensor.getIdSensor(),
            "idSlot", (sensor.getSlotDipantau() != null ? sensor.getSlotDipantau().getIdSlot() : "-"),
            "statusSensor", sensor.getStatusSensor()
        ));
    }
}
