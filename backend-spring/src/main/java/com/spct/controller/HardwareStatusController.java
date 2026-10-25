package com.spct.controller; // Nama package controller

import com.spct.model.KameraAnpr; // Mengimpor model KameraAnpr
import com.spct.model.SensorIoT; // Mengimpor model SensorIoT
import com.spct.repository.KameraAnprRepository; // Mengimpor repository kamera_anpr
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
        String statusBaru = body.get("statusKamera");

        // Jika statusBaru bernilai null atau bukan "ON" dan bukan "OFF", maka:
        if (statusBaru == null || (!statusBaru.equals("ON") && !statusBaru.equals("OFF")))
        {
            // Mengembalikan respons HTTP 400 Bad Request dengan pesan error
            return ResponseEntity.badRequest().body(Map.of("pesan", "Status harus 'ON' atau 'OFF'."));
        }

        // Mencari objek kamera berdasarkan idKamera di database
        Optional<KameraAnpr> kameraOpt = this.kameraRepo.findById(idKamera);

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
            "pesan", "Status kamera " + idKamera + " berhasil diubah ke " + statusBaru,
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
        String statusBaru = body.get("statusSensor");

        // Jika statusBaru bernilai null atau bukan "ON" dan bukan "OFF", maka:
        if (statusBaru == null || (!statusBaru.equals("ON") && !statusBaru.equals("OFF")))
        {
            // Mengembalikan respons HTTP 400 Bad Request dengan pesan error
            return ResponseEntity.badRequest().body(Map.of("pesan", "Status harus 'ON' atau 'OFF'."));
        }

        // Mencari objek sensor berdasarkan idSensor di database
        Optional<SensorIoT> sensorOpt = this.sensorRepo.findById(idSensor);

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

        // Mengembalikan respons HTTP 200 OK beserta data konfirmasi perubahan status
        return ResponseEntity.ok(Map.of(
            "pesan", "Status sensor " + idSensor + " berhasil diubah ke " + statusBaru,
            "idSensor", sensor.getIdSensor(),
            "statusSensor", sensor.getStatusSensor()
        ));
    }
}
