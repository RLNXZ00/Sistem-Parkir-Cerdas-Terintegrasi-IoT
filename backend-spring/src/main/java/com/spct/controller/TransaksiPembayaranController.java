package com.spct.controller;

import com.spct.dto.HasilTagihanDto;
import com.spct.model.MetodePembayaran;
import com.spct.service.TransaksiPembayaranService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller: TransaksiPembayaranController
 * Sesuai Diagram Sequence (Keluar Parkir & Pembayaran).
 *
 * ALUR EKSEKUSI (sesuai pseudocode):
 * 1. Menerima HTTP GET dari kamera gerbang keluar (ALPR) untuk memindai plat dan menghitung tagihan.
 * 2. Menghitung biaya berdasarkan durasi parkir (Service).
 * 3. Jika bayar (QRIS/E-toll via POST), update transaksi jadi LUNAS dan slot jadi KOSONG.
 *
 * Endpoint Base URL: /api/pembayaran
 */

// Deklarasi Controller: kelas penerima request untuk operasional keluar kendaraan
@RestController
@RequestMapping("/api/pembayaran") // Base URL: http://localhost:8080/api/pembayaran
@CrossOrigin(origins = "*")  // Mengizinkan request dari Kiosk Keluar
public class TransaksiPembayaranController 
{
    // =====================================================================
    // Deklarasi Atribut Service (diinject otomatis oleh Spring)
    // =====================================================================

    @Autowired
    private TransaksiPembayaranService transaksiPembayaranService;


    // =====================================================================
    // Endpoint GET: Menghitung tagihan saat kendaraan tiba di gerbang keluar
    // =====================================================================

    // Endpoint yang dipanggil oleh kamera ALPR gerbang keluar atau Kiosk Keluar
    @GetMapping("/tagihan") // URL lengkap: GET /api/pembayaran/tagihan?platNomor=AB1234XY
    public ResponseEntity<HasilTagihanDto> cekTagihan(
        @RequestParam String platNomor) 
    {
        // Mendelegasikan perhitungan ke Service
        HasilTagihanDto hasil = transaksiPembayaranService.hitungTagihanKeluar(platNomor);

        // Jika transaksi tidak ditemukan
        if ("TRANSAKSI_TIDAK_DITEMUKAN".equals(hasil.getStatus()))
        {
            // Panggil HTTP 404 Not Found: transaksi tidak ditemukan
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(hasil);
        }

        // Jika perhitungan sukses, kirim kembali detail tagihan ke Frontend Kiosk Keluar
        return ResponseEntity.ok(hasil);
    }


    // =====================================================================
    // Endpoint POST: Memproses konfirmasi pembayaran dari Payment Gateway
    // =====================================================================

    // Endpoint yang dipanggil saat pembayaran QRIS/E-Toll berhasil
    @PostMapping("/konfirmasi") // URL lengkap: POST /api/pembayaran/konfirmasi
    public ResponseEntity<HasilTagihanDto> konfirmasiPembayaran(
        @RequestParam Long idTransaksi,
        @RequestParam MetodePembayaran metodePembayaran) 
    {
        // Mengeksekusi penutupan transaksi (lunas) dan pelepasan slot parkir
        HasilTagihanDto hasil = transaksiPembayaranService.prosesPembayaran(idTransaksi, metodePembayaran);

        // Mengirim instruksi ke Kiosk untuk menampilkan pesan berhasil dan Buka Palang
        return ResponseEntity.ok(hasil);
    }
}