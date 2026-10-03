package com.spct.controller;

import com.spct.model.KameraAnpr;
import com.spct.model.SensorIoT;
import com.spct.repository.KameraAnprRepository;
import com.spct.repository.SensorIoTRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Controller: HardwareStatusController
 * Mengelola status operasional hardware IoT: Kamera ANPR dan Sensor per-Slot.
 * Dashboard Web menggunakan endpoint ini untuk menampilkan status live hardware.
 *
 * Endpoint Base URL: /api/hardware
 */
@RestController
@RequestMapping("/api/hardware")
@CrossOrigin(origins = "*")
public class HardwareStatusController
{
    @Autowired
    private KameraAnprRepository kameraRepo; // Repository kamera_anpr

    @Autowired
    private SensorIoTRepository sensorRepo; // Repository sensor_iot


    // ─── GET /api/hardware/kamera ────────────────────────────────────────────
    // Mengambil status semua kamera ANPR (4 unit) untuk panel monitoring Dashboard
    @GetMapping("/kamera")
    public ResponseEntity<List<KameraAnpr>> getAllKamera()
    {
        return ResponseEntity.ok(kameraRepo.findAll());
    }


    // ─── PATCH /api/hardware/kamera/{idKamera}/status ────────────────────────
    // Mengubah status kamera (ON/OFF) - digunakan petugas untuk maintenance / restart kamera
    @PatchMapping("/kamera/{idKamera}/status")
    public ResponseEntity<?> updateStatusKamera(
        @PathVariable String idKamera,
        @RequestBody Map<String, String> body)
    {
        String statusBaru = body.get("statusKamera");
        if (statusBaru == null || (!statusBaru.equals("ON") && !statusBaru.equals("OFF")))
        {
            return ResponseEntity.badRequest().body(Map.of("pesan", "Status harus 'ON' atau 'OFF'."));
        }

        Optional<KameraAnpr> kameraOpt = kameraRepo.findById(idKamera);
        if (kameraOpt.isEmpty())
        {
            return ResponseEntity.notFound().build();
        }

        KameraAnpr kamera = kameraOpt.get();
        kamera.setStatusKamera(statusBaru); // Update status operasional kamera
        kameraRepo.save(kamera);

        return ResponseEntity.ok(Map.of(
            "pesan",       "Status kamera " + idKamera + " berhasil diubah ke " + statusBaru,
            "idKamera",    kamera.getIdKamera(),
            "statusKamera", kamera.getStatusKamera()
        ));
    }


    // ─── GET /api/hardware/sensor ────────────────────────────────────────────
    // Mengambil status semua sensor IoT (15 unit) untuk monitoring kelayakan hardware
    @GetMapping("/sensor")
    public ResponseEntity<List<SensorIoT>> getAllSensor()
    {
        return ResponseEntity.ok(sensorRepo.findAll());
    }


    // ─── PATCH /api/hardware/sensor/{idSensor}/status ────────────────────────
    // Mengubah status sensor (ON/OFF) - digunakan saat ada sensor rusak / maintenance
    @PatchMapping("/sensor/{idSensor}/status")
    public ResponseEntity<?> updateStatusSensor(
        @PathVariable String idSensor,
        @RequestBody Map<String, String> body)
    {
        String statusBaru = body.get("statusSensor");
        if (statusBaru == null || (!statusBaru.equals("ON") && !statusBaru.equals("OFF")))
        {
            return ResponseEntity.badRequest().body(Map.of("pesan", "Status harus 'ON' atau 'OFF'."));
        }

        Optional<SensorIoT> sensorOpt = sensorRepo.findById(idSensor);
        if (sensorOpt.isEmpty())
        {
            return ResponseEntity.notFound().build();
        }

        SensorIoT sensor = sensorOpt.get();
        sensor.setStatusSensor(statusBaru); // Update status operasional sensor
        sensorRepo.save(sensor);

        return ResponseEntity.ok(Map.of(
            "pesan",        "Status sensor " + idSensor + " berhasil diubah ke " + statusBaru,
            "idSensor",     sensor.getIdSensor(),
            "statusSensor", sensor.getStatusSensor()
        ));
    }
}
