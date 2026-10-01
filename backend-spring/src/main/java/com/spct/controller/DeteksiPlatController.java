package com.spct.controller;

import com.spct.dto.HasilDeteksiMasukDto;
import com.spct.model.JenisKendaraan;
import com.spct.service.DeteksiPlatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller: DeteksiPlatController
 * Sesuai Diagram Sequence (Masuk Parkir) dan Use-Case UC001.
 *
 * ALUR EKSEKUSI (sesuai pseudocode yang disepakati):
 * 1. Menerima HTTP POST dari kamera gerbang (YOLOv11/OCR Python Microservice).
 * 2. Validasi confidence score. Jika rendah, kirim peringatan validasi manual.
 * 3. Mendelegasikan seluruh logika (registrasi, alokasi, transaksi) ke DeteksiPlatService.
 * 4. Mengembalikan HasilDeteksiMasukDto ke Frontend Kiosk Terminal.
 *
 * Endpoint Base URL: /api/gate
 */

// Deklarasi Controller: kelas penerima request HTTP dari kamera gerbang masuk (Python ALPR)
// Ini adalah PINTU MASUK UTAMA dari seluruh sistem SPCT
@RestController
@RequestMapping("/api/gate") // Base URL: http://localhost:8080/api/gate
@CrossOrigin(origins = "*")  // Mengizinkan request dari origin manapun (ALPR Python, Frontend Kiosk)
public class DeteksiPlatController // Kelas controller untuk mengelola seluruh alur kendaraan masuk gerbang
{
    // =====================================================================
    // Deklarasi Atribut Service (diinject otomatis oleh Spring)
    // =====================================================================

    @Autowired
    private DeteksiPlatService deteksiPlatService; // Service yang berisi semua logika bisnis deteksi plat


    // =====================================================================
    // Endpoint POST: Menerima data deteksi plat dari ALPR Python Microservice
    // =====================================================================

    // Endpoint utama yang dipanggil oleh ALPR (Python/YOLOv11) setiap ada kendaraan di gerbang masuk
    // Payload JSON: { "platNomor": "AB1234XY", "jenisKendaraan": "MOBIL", "confidence": 0.95 }
    @PostMapping("/masuk") // URL lengkap: POST /api/gate/masuk
    public ResponseEntity<HasilDeteksiMasukDto> prosesKendaraanMasuk(
        @RequestParam String platNomor,                     // Plat nomor hasil baca OCR dari Python
        @RequestParam JenisKendaraan jenisKendaraan,        // Jenis kendaraan: MOBIL atau MOTOR
        @RequestParam(defaultValue = "1.0") double confidence) // Confidence score hasil YOLO (default 1.0 jika tidak dikirim)
    {
        // Mendelegasikan seluruh pemrosesan ke DeteksiPlatService
        HasilDeteksiMasukDto hasil = deteksiPlatService.prosesKendaraanMasuk(platNomor, jenisKendaraan, confidence);

        // Branching berdasarkan status hasil yang dikembalikan oleh service
        if ("CONFIDENCE_RENDAH".equals(hasil.getStatus()))
        {
            // Confidence OCR terlalu rendah -> HTTP 422 Unprocessable Entity: butuh validasi manual petugas
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(hasil);
        }

        if ("BASEMENT_PENUH".equals(hasil.getStatus()))
        {
            // Tidak ada slot tersedia -> HTTP 409 Conflict: kendaraan tidak bisa masuk
            return ResponseEntity.status(HttpStatus.CONFLICT).body(hasil);
        }

        // Proses berhasil -> HTTP 200 OK dengan semua data yang dibutuhkan Kiosk (slot, rute, transaksi)
        return ResponseEntity.ok(hasil);
    }


    // =====================================================================
    // Endpoint POST: Override manual oleh petugas (saat confidence rendah)
    // =====================================================================

    // Endpoint yang digunakan petugas untuk mengoverride hasil deteksi yang confidence-nya rendah
    // Petugas mengetik manual plat nomor yang sebenarnya melalui Dashboard Admin
    @PostMapping("/masuk/override-manual") // URL lengkap: POST /api/gate/masuk/override-manual
    public ResponseEntity<HasilDeteksiMasukDto> overridePlatManual(
        @RequestParam String platNomor,               // Plat nomor yang dikoreksi manual oleh petugas
        @RequestParam JenisKendaraan jenisKendaraan)  // Jenis kendaraan yang dikonfirmasi petugas
    {
        // Langsung proses dengan confidence 1.0 (dipercaya penuh karena sudah divalidasi manusia)
        HasilDeteksiMasukDto hasil = deteksiPlatService.prosesKendaraanMasuk(platNomor, jenisKendaraan, 1.0);

        // Jika basement penuh meski sudah override, tetap kembalikan error
        if ("BASEMENT_PENUH".equals(hasil.getStatus()))
        {
            // Panggil HTTP 409 Conflict: kendaraan tidak bisa masuk
            return ResponseEntity.status(HttpStatus.CONFLICT).body(hasil);
        }

        // Override berhasil -> kembalikan HTTP 200 OK
        return ResponseEntity.ok(hasil);
    }
}
