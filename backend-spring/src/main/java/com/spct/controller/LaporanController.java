package com.spct.controller;

import com.spct.dto.LaporanResponseDto;
import com.spct.service.LaporanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

/**
 * Controller: LaporanController
 * Menyediakan antarmuka REST API untuk modul Laporan Operasional (PK-UC010).
 *
 * Endpoint:
 * - GET /api/laporan/preview : Menyajikan pratinjau data laporan historis sesuai jenis dan rentang waktu.
 */
@RestController
@RequestMapping("/api/laporan")
@CrossOrigin(origins = "*")
public class LaporanController
{
    @Autowired
    private LaporanService laporanService;

    /**
     * Endpoint GET: Pratinjau Laporan (Preview)
     * Dipanggil oleh tombol "Generate Report" pada web Dashboard Manajemen.
     *
     * Contoh:
     * GET /api/laporan/preview?jenis=finansial&dari=2026-10-01&sampai=2026-10-15
     */
    @GetMapping("/preview")
    public ResponseEntity<LaporanResponseDto> getPratinjauLaporan(
        @RequestParam(defaultValue = "finansial") String jenis,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dari,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate sampai)
    {
        LaporanResponseDto hasil = laporanService.ambilPratinjauLaporan(jenis, dari, sampai);
        return ResponseEntity.ok(hasil);
    }
}
