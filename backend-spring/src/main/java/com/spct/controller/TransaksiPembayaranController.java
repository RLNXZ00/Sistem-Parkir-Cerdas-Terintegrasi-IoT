package com.spct.controller; // Nama package dari modul pengontrol REST API sistem

// Import DTO HasilTagihanDto dari package dto
import com.spct.dto.HasilTagihanDto;
// Import enum MetodePembayaran dari package model
import com.spct.model.MetodePembayaran;
// Import service TransaksiPembayaranService dari package service
import com.spct.service.TransaksiPembayaranService;
// Import anotasi Autowired dari Spring Framework
import org.springframework.beans.factory.annotation.Autowired;
// Import enum HttpStatus dari Spring HTTP
import org.springframework.http.HttpStatus;
// Import kelas ResponseEntity dari Spring HTTP
import org.springframework.http.ResponseEntity;
// Import anotasi-anotasi Spring Web REST Controller
import org.springframework.web.bind.annotation.*;

// Kelas pengontrol publik java TransaksiPembayaranController untuk menangani pengecekan tagihan dan pelunasan pembayaran gerbang keluar
@RestController // Menandai kelas sebagai pengendali REST API
@RequestMapping("/api/pembayaran") // Menetapkan path rute dasar endpoint /api/pembayaran
@CrossOrigin(origins = "*") // Mengizinkan permintaan lintas domain dari antarmuka Kiosk Keluar
public class TransaksiPembayaranController 
{
    // Injeksi otomatis dependensi layanan TransaksiPembayaranService oleh Spring
    @Autowired
    private TransaksiPembayaranService transaksiPembayaranService; // Deklarasi atribut transaksiPembayaranService

    // =====================================================================
    // Endpoint GET: Menghitung tagihan saat kendaraan tiba di gerbang keluar
    // =====================================================================

    // Method GET cekTagihan untuk menghitung biaya parkir berdasarkan durasi waktu
    @GetMapping("/tagihan")
    public ResponseEntity<HasilTagihanDto> cekTagihan(
        @RequestParam String platNomor) // Parameter nomor plat kendaraan yang akan keluar
    {
        // Memanggil service untuk mencari transaksi aktif dan menghitung total tagihan
        HasilTagihanDto hasil = transaksiPembayaranService.hitungTagihanKeluar(platNomor);

        // Jika data tiket transaksi tidak ditemukan di sistem, maka:
        if ("TRANSAKSI_TIDAK_DITEMUKAN".equals(hasil.getStatus()))
        {
            // Kembalikan respons status HTTP 404 Not Found beserta data DTO hasil
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(hasil);
        }

        // Jika transaksi valid, kembalikan respons HTTP 200 OK beserta rincian tarif tagihan
        return ResponseEntity.ok(hasil);
    }

    // =====================================================================
    // Endpoint POST: Memproses konfirmasi pembayaran dari Payment Gateway
    // =====================================================================

    // Method POST konfirmasiPembayaran untuk mengeksekusi pelunasan tagihan parkir
    @PostMapping("/konfirmasi")
    public ResponseEntity<HasilTagihanDto> konfirmasiPembayaran(
        @RequestParam Long idTransaksi, // Parameter ID tiket transaksi parkir
        @RequestParam MetodePembayaran metodePembayaran) // Parameter kanal pembayaran yang dipilih (QRIS/E-TOLL)
    {
        // Memanggil service untuk memperbarui status transaksi menjadi LUNAS dan mengosongkan slot
        HasilTagihanDto hasil = transaksiPembayaranService.prosesPembayaran(idTransaksi, metodePembayaran);

        // Mengembalikan respons HTTP 200 OK dengan instruksi pembukaan palang pintu keluar
        return ResponseEntity.ok(hasil);
    }
}