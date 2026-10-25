package com.spct.controller;

import com.spct.dto.HasilDeteksiMasukDto;
import com.spct.model.JenisKendaraan;
import com.spct.repository.LogDeteksiPlatRepository;
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
 * Endpoint Base URL: /api/gate, /api/deteksi
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

    @Autowired
    private LogDeteksiPlatRepository logDeteksiPlatRepository; // Repository untuk mengambil riwayat log deteksi


    // =====================================================================
    // Endpoint POST: Menerima data deteksi plat dari ALPR Python Microservice
    // =====================================================================

    // Endpoint utama yang dipanggil oleh Kiosk (Simulasi) dan ALPR (Python/YOLOv11)
    // Mendukung dua cara pengiriman:
    // 1. JSON Body (dari Kiosk React): { "platNomor": "D 1234 SPCT", "jenisKendaraan": "MOBIL" }
    // 2. Query Param (dari ALPR Python): POST /api/gate/masuk?platNomor=D1234XY&jenisKendaraan=MOBIL
    @PostMapping("/masuk")
    public ResponseEntity<HasilDeteksiMasukDto> prosesKendaraanMasuk(
        @RequestBody(required = false) java.util.Map<String, String> body,
        @RequestParam(required = false) String platNomor,
        @RequestParam(name = "jenisKendaraan", required = false) String jenisKendaraanParam,
        @RequestParam(defaultValue = "1.0") double confidence)
    {
        // Ambil platNomor dan jenisKendaraan dari body JSON (kiosk) atau query param (ALPR)
        String platFinal = (body != null && body.containsKey("platNomor"))
            ? body.get("platNomor") : platNomor;

        String jeniStr = (body != null && body.containsKey("jenisKendaraan"))
            ? body.get("jenisKendaraan") : jenisKendaraanParam;

        // Default ke MOBIL jika tidak dikirim (simulasi kiosk sederhana)
        JenisKendaraan jenis;
        try 
        {
            jenis = (jeniStr != null) ? JenisKendaraan.valueOf(jeniStr.toUpperCase()) : JenisKendaraan.MOBIL;
        } catch (IllegalArgumentException e) {
            jenis = JenisKendaraan.MOBIL;
        }

        // Validasi: platNomor wajib ada
        if (platFinal == null || platFinal.isBlank()) {
            HasilDeteksiMasukDto err = new HasilDeteksiMasukDto();
            err.setStatus("ERROR");
            err.setPesanKeterangan("Parameter platNomor wajib diisi.");
            return ResponseEntity.badRequest().body(err);
        }

        // Mendelegasikan seluruh pemrosesan ke DeteksiPlatService
        HasilDeteksiMasukDto hasil = deteksiPlatService.prosesKendaraanMasuk(platFinal, jenis, confidence);

        // Branching berdasarkan status hasil yang dikembalikan oleh service
        if ("CONFIDENCE_RENDAH".equals(hasil.getStatus()))
        {
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(hasil);
        }

        if ("BASEMENT_PENUH".equals(hasil.getStatus()))
        {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(hasil);
        }

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

    // =====================================================================
    // Endpoint GET: Mengambil riwayat log deteksi plat (untuk GateLivePage)
    // URL: GET /api/gate/log (di bawah base /api/gate yang sudah ada)
    // =====================================================================
    @GetMapping("/log")
    public ResponseEntity<?> getAllLogDeteksi()
    {
        // Mengambil semua log deteksi plat, diurutkan terbaru di atas
        return ResponseEntity.ok(
            logDeteksiPlatRepository.findAll()
                .stream()
                .sorted(java.util.Comparator.comparing(
                    com.spct.model.LogDeteksiPlat::getWaktuDeteksi,
                    java.util.Comparator.reverseOrder()
                ))
                .collect(java.util.stream.Collectors.toList())
        );
    }

    // =====================================================================
    // Endpoint POST: Menerima data kendaraan KELUAR
    // =====================================================================
    @PostMapping("/keluar")
    public ResponseEntity<com.spct.dto.HasilDeteksiKeluarDto> prosesKendaraanKeluar(
        @RequestBody(required = false) java.util.Map<String, Object> body,
        @RequestParam(required = false) String platNomor,
        @RequestParam(required = false) java.math.BigDecimal saldoEwallet,
        @RequestParam(name = "jenisKendaraan", required = false) String jenisKendaraanParam) 
    {
        String platFinal = (body != null && body.containsKey("platNomor") && body.get("platNomor") != null) 
            ? String.valueOf(body.get("platNomor")) 
            : platNomor;
        
        java.math.BigDecimal saldoFinal = saldoEwallet;
        if (body != null && body.containsKey("saldoEwallet") && body.get("saldoEwallet") != null) {
            try {
                saldoFinal = new java.math.BigDecimal(body.get("saldoEwallet").toString());
            } catch (Exception ex) {
                System.err.println("[GATE KELUAR] Format saldoEwallet di body tidak valid: " + ex.getMessage());
            }
        }
        if (saldoFinal == null) {
            saldoFinal = new java.math.BigDecimal("50000.00");
        }
        
        // Jika platFinal kosong atau tidak dikirim, otomatis diarahkan ke mode antrean "QUEUE" (FIFO)
        if (platFinal == null || platFinal.isBlank()) {
            platFinal = "QUEUE";
        }

        Integer durasiMenitFinal = null;
        if (body != null && body.containsKey("durasiMenit") && body.get("durasiMenit") != null) {
            try {
                durasiMenitFinal = Integer.valueOf(body.get("durasiMenit").toString());
            } catch (Exception ex) {
                System.err.println("[GATE KELUAR] Format durasiMenit di body tidak valid: " + ex.getMessage());
            }
        }

        // Jenis kendaraan gerbang keluar (MOBIL/MOTOR) - menentukan antrean FIFO yang diproses
        JenisKendaraan jenisKeluar = null;
        Object jenisRaw = (body != null) ? body.get("jenisKendaraan") : null;
        String jenisKeluarStr = (jenisRaw != null) ? String.valueOf(jenisRaw) : jenisKendaraanParam;
        if (jenisKeluarStr != null && !jenisKeluarStr.isBlank()) {
            try {
                jenisKeluar = JenisKendaraan.valueOf(jenisKeluarStr.trim().toUpperCase());
            } catch (IllegalArgumentException ex) {
                System.err.println("[GATE KELUAR] jenisKendaraan tidak valid: " + jenisKeluarStr);
            }
        }

        com.spct.dto.HasilDeteksiKeluarDto hasil = deteksiPlatService.prosesKendaraanKeluar(platFinal, saldoFinal, durasiMenitFinal, jenisKeluar);
        
        if ("KENDARAAN_TIDAK_DITEMUKAN".equals(hasil.getStatus())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(hasil);
        }
        
        if ("SALDO_KURANG".equals(hasil.getStatus())) {
            // Mengembalikan status Payment Required
            return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).body(hasil);
        }

        return ResponseEntity.ok(hasil);
    }

    // =====================================================================
    // Endpoint GET: Mengambil antrean kendaraan yang sedang parkir (FIFO)
    // URL: GET /api/gate/antrean-keluar
    // =====================================================================
    @GetMapping("/antrean-keluar")
    public ResponseEntity<?> getAntreanKeluar(
        @RequestParam(name = "jenisKendaraan", required = false) String jenisKendaraanParam)
    {
        // Filter opsional per jenis kendaraan (gerbang keluar mobil / motor punya antrean sendiri)
        JenisKendaraan jenisFilter = null;
        if (jenisKendaraanParam != null && !jenisKendaraanParam.isBlank()) {
            try {
                jenisFilter = JenisKendaraan.valueOf(jenisKendaraanParam.trim().toUpperCase());
            } catch (IllegalArgumentException ex) {
                jenisFilter = null;
            }
        }

        return ResponseEntity.ok(
            deteksiPlatService.ambilAntreanKendaraanKeluar(jenisFilter)
                .stream()
                .map(t -> java.util.Map.of(
                    "idTransaksi", t.getIdTransaksi(),
                    "platNomor", t.getKendaraan().getPlatNomor(),
                    "jenisKendaraan", t.getKendaraan().getJenisKendaraan().name(),
                    "idSlot", t.getSlotDipilih() != null ? t.getSlotDipilih().getIdSlot() : "-",
                    "waktuMasuk", t.getWaktuMasuk().toString()
                ))
                .collect(java.util.stream.Collectors.toList())
        );
    }
}
