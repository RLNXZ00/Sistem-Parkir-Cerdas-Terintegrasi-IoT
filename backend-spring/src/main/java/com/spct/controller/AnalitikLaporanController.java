package com.spct.controller;

import com.spct.dto.DataDashboardDto;
import com.spct.service.AnalitikLaporanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate; // Mengimpor LocalDate untuk menerima parameter tanggal dari request URL

/**
 * Controller: AnalitikLaporanController
 * Sesuai Diagram Sequence (Manajemen Laporan) dan Konsep Green-IoT.
 *
 * ALUR EKSEKUSI (sesuai pseudocode yang disepakati):
 * 1. Menerima request dari Web Dashboard Admin dengan parameter rentang tanggal.
 * 2. Mendelegasikan agregasi data ke AnalitikLaporanService.
 * 3. Mengembalikan DataDashboardDto (JSON) yang siap digambar oleh Chart.js.
 *
 * Endpoint Base URL: /api/analitik
 */

// Deklarasi Controller: kelas penerima request laporan dari Frontend Dashboard Manajemen
// Berbeda dari controller lain, ini melayani kebutuhan ADMIN bukan kendaraan/sensor
@RestController
@RequestMapping("/api/analitik") // Base URL: http://localhost:8080/api/analitik
@CrossOrigin(origins = "*")      // Mengizinkan request dari Frontend Dashboard Admin
public class AnalitikLaporanController // Kelas controller untuk menyajikan data laporan dan analitik ke Dashboard
{
    // =====================================================================
    // Deklarasi Atribut Service (diinject otomatis oleh Spring)
    // =====================================================================

    @Autowired
    private AnalitikLaporanService analitikLaporanService; // Service yang berisi logika agregasi data


    // =====================================================================
    // Endpoint GET: Mengambil snapshot lengkap data Dashboard (Laporan Harian)
    // =====================================================================

    // Endpoint utama: mengambil semua data metrik untuk hari ini secara default
    // Frontend Dashboard memanggil ini saat pertama kali dibuka
    @GetMapping("/dashboard") // URL lengkap: GET /api/analitik/dashboard
    public ResponseEntity<DataDashboardDto> getDashboardHariIni()
    {
        // Default: menampilkan data hari ini dari pukul 00:00 s.d. 23:59
        LocalDate hariIni = LocalDate.now(); // Mendapatkan tanggal hari ini dari sistem

        // Mendelegasikan ke service dengan periode = hari ini saja
        DataDashboardDto dataDashboard = analitikLaporanService.ambilDataDashboard(hariIni, hariIni);

        // Mengembalikan HTTP 200 OK dengan seluruh data metrik Dashboard
        return ResponseEntity.ok(dataDashboard);
    }


    // =====================================================================
    // Endpoint GET: Laporan dengan Rentang Tanggal Kustom (Date Range)
    // =====================================================================

    // Endpoint untuk filter laporan berdasarkan rentang tanggal yang dipilih Admin
    // Digunakan saat Admin ingin melihat laporan mingguan, bulanan, dll dari Dashboard
    // Format tanggal: ISO (YYYY-MM-DD), misal: ?dari=2026-10-01&sampai=2026-10-31
    @GetMapping("/laporan") // URL lengkap: GET /api/analitik/laporan?dari=2026-10-01&sampai=2026-10-31
    public ResponseEntity<DataDashboardDto> getLaporanRentangWaktu(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dari,   // Tanggal awal periode laporan
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate sampai) // Tanggal akhir periode laporan
    {
        // Validasi: tanggal awal tidak boleh setelah tanggal akhir
        if (dari.isAfter(sampai))
        {
            // Kembalikan HTTP 400 Bad Request jika rentang tanggal tidak valid
            return ResponseEntity.badRequest().build();
        }

        // Mendelegasikan ke service dengan rentang waktu yang diberikan Admin
        DataDashboardDto dataLaporan = analitikLaporanService.ambilDataDashboard(dari, sampai);

        // Mengembalikan HTTP 200 OK dengan data laporan sesuai rentang waktu
        return ResponseEntity.ok(dataLaporan);
    }


    // =====================================================================
    // Endpoint GET: Laporan Bulanan (Shortcut untuk Dashboard)
    // =====================================================================

    // Endpoint shortcut untuk mengambil laporan bulan tertentu
    // Digunakan Dashboard untuk tombol "Laporan Oktober 2026" dll
    @GetMapping("/laporan/bulanan") // URL: GET /api/analitik/laporan/bulanan?tahun=2026&bulan=10
    public ResponseEntity<DataDashboardDto> getLaporanBulanan(
        @RequestParam int tahun,  // Tahun laporan (misal: 2026)
        @RequestParam int bulan)  // Bulan laporan (misal: 10 untuk Oktober)
    {
        // Menentukan tanggal pertama dan terakhir bulan yang diminta
        LocalDate awalBulan = LocalDate.of(tahun, bulan, 1);          // Tanggal 1 bulan tersebut
        LocalDate akhirBulan = awalBulan.withDayOfMonth(              // Tanggal terakhir bulan tersebut
                                    awalBulan.lengthOfMonth());        // Menggunakan method bawaan Java

        // Mendelegasikan ke service dengan rentang satu bulan penuh
        DataDashboardDto dataLaporan = analitikLaporanService.ambilDataDashboard(awalBulan, akhirBulan);

        // Mengembalikan HTTP 200 OK dengan data laporan satu bulan
        return ResponseEntity.ok(dataLaporan);
    }
}