package com.spct.controller; // Nama package dari modul pengontrol REST API sistem

// Import DTO HasilAlokasiRuteDto dari package dto
import com.spct.dto.HasilAlokasiRuteDto;
// Import enum JenisKendaraan dari package model
import com.spct.model.JenisKendaraan;
// Import service AlokasiRuteService dari package service
import com.spct.service.AlokasiRuteService;
// Import anotasi Autowired dari Spring Framework untuk injeksi dependensi
import org.springframework.beans.factory.annotation.Autowired;
// Import enum HttpStatus dari Spring HTTP
import org.springframework.http.HttpStatus;
// Import kelas ResponseEntity dari Spring HTTP
import org.springframework.http.ResponseEntity;
// Import anotasi-anotasi Spring Web REST Controller
import org.springframework.web.bind.annotation.*;

// Kelas pengontrol publik java AlokasiRuteController untuk menangani permintaan HTTP alokasi slot dan rute navigasi A*
@RestController // Menandai kelas sebagai pengendali REST API yang menghasilkan respons JSON
@RequestMapping("/api/alokasi-rute") // Menetapkan path rute dasar endpoint /api/alokasi-rute
@CrossOrigin(origins = "*") // Mengizinkan permintaan lintas domain dari antarmuka Web Kiosk
public class AlokasiRuteController
{
    // =====================================================================
    // Deklarasi Atribut Service Alokasi dan Rute
    // =====================================================================

    // Injeksi otomatis dependensi layanan AlokasiRuteService oleh Spring IoC Container
    @Autowired
    private AlokasiRuteService alokasiRuteService; // Deklarasi atribut alokasiRuteService bertipe AlokasiRuteService

    // =====================================================================
    // Endpoint POST: Memproses alokasi slot dan rute untuk kendaraan masuk
    // =====================================================================

    // Method POST prosesAlokasiMasuk untuk memproses alokasi slot dan lintasan rute optimal
    @PostMapping("/proses")
    public ResponseEntity<HasilAlokasiRuteDto> prosesAlokasiMasuk(
        @RequestParam String platNomor, // Parameter request platNomor dari kamera atau antarmuka
        @RequestParam JenisKendaraan jenisKendaraan) // Parameter request jenisKendaraan (MOBIL/MOTOR)
    {
        // Memanggil method prosesAlokasiDanRute pada service untuk menjalankan alur penentuan slot dan pencarian rute A*
        HasilAlokasiRuteDto hasilAlokasi = alokasiRuteService.prosesAlokasiDanRute(platNomor, jenisKendaraan);

        // Jika status pesan menunjukkan kondisi basement telah penuh, maka:
        if ("BASEMENT_PENUH".equals(hasilAlokasi.getPesanStatus()))
        {
            // Kembalikan respons entitas HTTP dengan status 409 CONFLICT beserta data DTO hasil
            return ResponseEntity.status(HttpStatus.CONFLICT).body(hasilAlokasi);
        }

        // Jika tidak penuh, kembalikan respons entitas HTTP 200 OK dengan membawa data alokasi rute
        return ResponseEntity.ok(hasilAlokasi);
    }

    // =====================================================================
    // Endpoint GET: Mengambil status alokasi berdasarkan plat nomor
    // =====================================================================

    // Method GET cekStatusAlokasi untuk memeriksa status alokasi transaksi kendaraan
    @GetMapping("/status/{platNomor}")
    public ResponseEntity<String> cekStatusAlokasi(
        @PathVariable String platNomor) // Variabel path platNomor dari segmen URL
    {
        // Mengembalikan pesan teks status pengecekan alokasi kendaraan
        return ResponseEntity.ok("Cek status untuk plat: " + platNomor + " - (akan diimplementasikan bersama TransaksiService)");
    }
}