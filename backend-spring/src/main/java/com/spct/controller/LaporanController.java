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

    @Autowired
    private com.spct.service.LaporanPdfService laporanPdfService;

    @Autowired
    private com.spct.service.LaporanExcelService laporanExcelService;

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

    /**
     * Endpoint GET: Unduh Dokumen Resmi PDF/XLSX
     * Sesuai alur PK-UC010 (Step 9-10 & Sequence Diagram langkah 15-18).
     * Mengirimkan file dokumen resmi langsung ke peramban (browser) untuk disimpan ke perangkat lokal.
     *
     * Contoh:
     * GET /api/laporan/unduh?format=pdf&jenis=finansial&dari=2026-10-01&sampai=2026-10-15
     * GET /api/laporan/unduh?format=xlsx&jenis=finansial&dari=2026-10-01&sampai=2026-10-15
     */
    @GetMapping("/unduh")
    public ResponseEntity<byte[]> unduhDokumenLaporan(
        @RequestParam(defaultValue = "pdf") String format,
        @RequestParam(defaultValue = "finansial") String jenis,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dari,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate sampai)
    {
        LaporanResponseDto dto = laporanService.ambilPratinjauLaporan(jenis, dari, sampai);

        if ("pdf".equalsIgnoreCase(format))
        {
            byte[] pdfBytes = laporanPdfService.generatePdf(dto);
            String namaFile = String.format("Laporan_%s_%s_sd_%s.pdf",
                jenis.substring(0, 1).toUpperCase() + jenis.substring(1), dari, sampai);

            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_PDF);
            headers.setContentDisposition(org.springframework.http.ContentDisposition.attachment()
                .filename(namaFile).build());

            // Catat log aktivitas unduhan (Audit Trail sesuai sequence diagram langkah 19-20)
            System.out.println(String.format("[AUDIT LOG] Pengguna Manajemen RS mengunduh '%s' (Format: PDF, Ukuran: %d bytes)",
                namaFile, pdfBytes.length));

            return ResponseEntity.ok()
                .headers(headers)
                .contentLength(pdfBytes.length)
                .body(pdfBytes);
        }
        else if ("xlsx".equalsIgnoreCase(format))
        {
            byte[] xlsxBytes = laporanExcelService.generateExcel(dto);
            String namaFile = String.format("Laporan_%s_%s_sd_%s.xlsx",
                jenis.substring(0, 1).toUpperCase() + jenis.substring(1), dari, sampai);

            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDisposition(org.springframework.http.ContentDisposition.attachment()
                .filename(namaFile).build());

            // Catat log aktivitas unduhan (Audit Trail sesuai sequence diagram langkah 19-20)
            System.out.println(String.format("[AUDIT LOG] Pengguna Manajemen RS mengunduh '%s' (Format: XLSX, Ukuran: %d bytes)",
                namaFile, xlsxBytes.length));

            return ResponseEntity.ok()
                .headers(headers)
                .contentLength(xlsxBytes.length)
                .body(xlsxBytes);
        }

        // Format selain PDF atau XLSX
        return ResponseEntity.badRequest().body(null);
    }
}
