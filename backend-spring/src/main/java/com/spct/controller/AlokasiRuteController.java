package com.spct.controller;

import com.spct.dto.HasilAlokasiRuteDto;
import com.spct.model.JenisKendaraan;
import com.spct.service.AlokasiRuteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller: AlokasiRuteController
 * Sesuai Diagram Sequence (Alokasi Rute) dan Algoritma A* Heuristik.
 *
 * ALUR EKSEKUSI (sesuai pseudocode yang disepakati):
 * 1. Menerima request POST dari DeteksiPlatController (Sistem Internal).
 * 2. Mendelegasikan seluruh logika ke AlokasiRuteService.
 * 3. Meneruskan hasil (slot + rute A*) kembali ke Frontend Kiosk Terminal.
 *
 * Endpoint Base URL: /api/alokasi-rute
 */

// Deklarasi Controller: kelas penerima request HTTP dari Frontend Kiosk Terminal
// Setara dengan ActionListener / tombol-tombol aksi di GUI TableDataGUI.java Anda,
// namun digantikan oleh anotasi @PostMapping yang mendengarkan request dari URL
@RestController
@RequestMapping("/api/alokasi-rute") // Base URL: http://localhost:8080/api/alokasi-rute
@CrossOrigin(origins = "*") // Mengizinkan request dari origin manapun (Frontend Kiosk di port berbeda)
public class AlokasiRuteController // Kelas controller untuk mengorkestrasi alur alokasi slot dan rute parkir
{
    // =====================================================================
    // Deklarasi Atribut Service (diinject otomatis oleh Spring)
    // Pengganti pemanggilan method langsung di kelas GUI Anda
    // =====================================================================

    @Autowired
    private AlokasiRuteService alokasiRuteService; // Service yang berisi semua logika bisnis alokasi dan A*


    // =====================================================================
    // Endpoint POST: Memproses alokasi slot dan rute untuk kendaraan masuk
    // =====================================================================

    // Endpoint utama yang dipanggil saat kendaraan terdeteksi di gerbang masuk
    // Menerima: plat_nomor dan jenis_kendaraan sebagai parameter URL
    // Mengembalikan: HasilAlokasiRuteDto dalam format JSON ke Frontend Kiosk
    @PostMapping("/proses") // URL lengkap: POST /api/alokasi-rute/proses?platNomor=AB1234XY&jenisKendaraan=MOBIL
    public ResponseEntity<HasilAlokasiRuteDto> prosesAlokasiMasuk(
        @RequestParam String platNomor,           // Parameter plat nomor dari OCR YOLO (misal: "AB1234XY")
        @RequestParam JenisKendaraan jenisKendaraan) // Parameter jenis kendaraan: MOBIL atau MOTOR
    {
        // Memanggil service untuk menjalankan seluruh alur alokasi (validasi, cari slot, A*, kunci slot)
        HasilAlokasiRuteDto hasilAlokasi = alokasiRuteService.prosesAlokasiDanRute(platNomor, jenisKendaraan);

        // Branching berdasarkan hasil alokasi yang dikembalikan oleh service
        if ("BASEMENT_PENUH".equals(hasilAlokasi.getPesanStatus()))
        {
            // Jika basement penuh, kembalikan HTTP 409 Conflict dengan pesan status
            return ResponseEntity.status(HttpStatus.CONFLICT).body(hasilAlokasi); // Mengembalikan respons 409 beserta DTO pesan penuh
        }

        // Jika alokasi berhasil, kembalikan HTTP 200 OK dengan data slot dan rute
        return ResponseEntity.ok(hasilAlokasi); // Mengembalikan respons 200 OK beserta DTO hasil alokasi lengkap
    }


    // =====================================================================
    // Endpoint GET: Mengambil status alokasi berdasarkan plat nomor
    // (Untuk keperluan pengecekan ulang oleh Frontend jika koneksi terputus)
    // =====================================================================

    // Endpoint untuk mengecek ulang hasil alokasi yang sudah ada sebelumnya
    // Berguna saat Frontend Kiosk perlu memuat ulang tampilan tanpa proses ulang dari awal
    @GetMapping("/status/{platNomor}") // URL lengkap: GET /api/alokasi-rute/status/AB1234XY
    public ResponseEntity<String> cekStatusAlokasi(
        @PathVariable String platNomor) // ID plat nomor yang ingin dicek statusnya
    {
        // TODO: Implementasi cek status transaksi aktif di iterasi selanjutnya
        // Sementara mengembalikan pesan placeholder agar endpoint sudah terdaftar di API
        return ResponseEntity.ok("Cek status untuk plat: " + platNomor + " - (akan diimplementasikan bersama TransaksiService)");
    }
}