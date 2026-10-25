package com.spct.controller; // Nama package dari modul pengontrol REST API sistem

// Import DTO DataDashboardDto dari package dto
import com.spct.dto.DataDashboardDto;
// Import service AnalitikLaporanService dari package service
import com.spct.service.AnalitikLaporanService;
// Import anotasi Autowired dari Spring Framework
import org.springframework.beans.factory.annotation.Autowired;
// Import anotasi format tanggal dari Spring Framework
import org.springframework.format.annotation.DateTimeFormat;
// Import kelas ResponseEntity dari Spring HTTP
import org.springframework.http.ResponseEntity;
// Import anotasi-anotasi Spring Web REST Controller
import org.springframework.web.bind.annotation.*;
// Import tipe data tanggal lokal java
import java.time.LocalDate;

// Kelas pengontrol publik java AnalitikLaporanController untuk menyajikan metrik analitik dan laporan statistik ke Dashboard Admin
@RestController // Menandai kelas sebagai pengendali REST API
@RequestMapping("/api/analitik") // Menetapkan path rute dasar endpoint /api/analitik
@CrossOrigin(origins = "*") // Mengizinkan permintaan lintas domain dari Web Dashboard
public class AnalitikLaporanController
{
    // =====================================================================
    // Deklarasi Atribut Service Analitik
    // =====================================================================

    // Injeksi otomatis dependensi layanan AnalitikLaporanService
    @Autowired
    private AnalitikLaporanService analitikLaporanService; // Deklarasi atribut analitikLaporanService bertipe AnalitikLaporanService

    // =====================================================================
    // Endpoint GET: Mengambil snapshot lengkap data Dashboard (Laporan Harian)
    // =====================================================================

    // Method GET getDashboardHariIni untuk mengambil metrik analitik terkini hari ini
    @GetMapping("/dashboard")
    public ResponseEntity<DataDashboardDto> getDashboardHariIni()
    {
        // Mendapatkan tanggal hari ini dari kalender sistem lokal
        LocalDate hariIni = LocalDate.now();

        // Memanggil service untuk mengambil agregasi data dashboard pada rentang hari ini
        DataDashboardDto dataDashboard = analitikLaporanService.ambilDataDashboard(hariIni, hariIni);

        // Mengembalikan respons entitas HTTP 200 OK beserta data snapshot dashboard
        return ResponseEntity.ok(dataDashboard);
    }

    // =====================================================================
    // Endpoint GET: Laporan dengan Rentang Tanggal Kustom (Date Range)
    // =====================================================================

    // Method GET getLaporanRentangWaktu untuk mengambil laporan berdasarkan rentang tanggal tertentu
    @GetMapping("/laporan")
    public ResponseEntity<DataDashboardDto> getLaporanRentangWaktu(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dari, // Parameter tanggal awal berformat ISO
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate sampai) // Parameter tanggal akhir berformat ISO
    {
        // Jika tanggal awal bernilai lebih akhir dibanding tanggal akhir, maka:
        if (dari.isAfter(sampai))
        {
            // Kembalikan respons entitas HTTP 400 Bad Request karena rentang tanggal tidak valid
            return ResponseEntity.badRequest().build();
        }

        // Memanggil service untuk menghitung metrik laporan dalam rentang tanggal yang diminta
        DataDashboardDto dataLaporan = analitikLaporanService.ambilDataDashboard(dari, sampai);

        // Mengembalikan respons entitas HTTP 200 OK dengan membawa data laporan
        return ResponseEntity.ok(dataLaporan);
    }

    // =====================================================================
    // Endpoint GET: Laporan Bulanan (Shortcut untuk Dashboard)
    // =====================================================================

    // Method GET getLaporanBulanan untuk mengambil laporan dalam satu bulan kalender penuh
    @GetMapping("/laporan/bulanan")
    public ResponseEntity<DataDashboardDto> getLaporanBulanan(
        @RequestParam int tahun, // Parameter tahun laporan (misal: 2026)
        @RequestParam int bulan) // Parameter bulan laporan (1 s.d. 12)
    {
        // Menentukan tanggal 1 sebagai awal bulan dari tahun dan bulan yang dipilih
        LocalDate awalBulan = LocalDate.of(tahun, bulan, 1);

        // Menentukan tanggal terakhir dari bulan yang bersangkutan
        LocalDate akhirBulan = awalBulan.withDayOfMonth(awalBulan.lengthOfMonth());

        // Memanggil service untuk mengambil data analitik satu bulan penuh
        DataDashboardDto dataLaporan = analitikLaporanService.ambilDataDashboard(awalBulan, akhirBulan);

        // Mengembalikan respons entitas HTTP 200 OK beserta data laporan bulanan
        return ResponseEntity.ok(dataLaporan);
    }
}