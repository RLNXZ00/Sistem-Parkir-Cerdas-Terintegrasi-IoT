package com.spct.controller;

import com.spct.dto.LaporanResponseDto;
import com.spct.service.LaporanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

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

    @Autowired
    private com.spct.repository.LogAuditLaporanRepository logAuditLaporanRepository;

    @Autowired
    private com.spct.service.DataRetentionService dataRetentionService;

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
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate sampai,
        jakarta.servlet.http.HttpServletRequest request)
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

            // Catat log aktivitas unduhan ke database (Audit Trail sesuai sequence diagram langkah 19-20)
            try
            {
                com.spct.model.LogAuditLaporan audit = new com.spct.model.LogAuditLaporan(
                    "Manajemen RS (Admin)",
                    jenis.toUpperCase(),
                    "PDF",
                    dari,
                    sampai,
                    namaFile,
                    (long) pdfBytes.length,
                    request != null ? request.getRemoteAddr() : "127.0.0.1"
                );
                logAuditLaporanRepository.save(audit);
                System.out.println(String.format("[AUDIT LOG TERSIMPAN] Dokumen '%s' (Format: PDF, Ukuran: %d bytes)",
                    namaFile, pdfBytes.length));
            }
            catch (Exception ex)
            {
                System.err.println("[AUDIT LOG ERROR] Gagal menyimpan log unduhan PDF: " + ex.getMessage());
            }

            return ResponseEntity.ok()
                .headers(headers)
                .contentLength(pdfBytes.length)
                .body(pdfBytes);
        }
        // Jika parameter format bernilai "xlsx" atau "excel", maka:
        else if ("xlsx".equalsIgnoreCase(format) || "excel".equalsIgnoreCase(format))
        {
            // Memanggil method generateExcel untuk membuat file spreadsheet dalam format byte array
            byte[] xlsxBytes = laporanExcelService.generateExcel(dto);
            String namaFile = String.format("Laporan_%s_%s_sd_%s.xlsx",
                jenis.substring(0, 1).toUpperCase() + jenis.substring(1), dari, sampai);

            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDisposition(org.springframework.http.ContentDisposition.attachment()
                .filename(namaFile).build());

            // Catat log aktivitas unduhan ke database (Audit Trail sesuai sequence diagram langkah 19-20)
            try
            {
                com.spct.model.LogAuditLaporan audit = new com.spct.model.LogAuditLaporan(
                    "Manajemen RS (Admin)",
                    jenis.toUpperCase(),
                    "XLSX",
                    dari,
                    sampai,
                    namaFile,
                    (long) xlsxBytes.length,
                    request != null ? request.getRemoteAddr() : "127.0.0.1"
                );
                logAuditLaporanRepository.save(audit);
                System.out.println(String.format("[AUDIT LOG TERSIMPAN] Dokumen '%s' (Format: XLSX, Ukuran: %d bytes)",
                    namaFile, xlsxBytes.length));
            }
            catch (Exception ex)
            {
                System.err.println("[AUDIT LOG ERROR] Gagal menyimpan log unduhan XLSX: " + ex.getMessage());
            }

            return ResponseEntity.ok()
                .headers(headers)
                .contentLength(xlsxBytes.length)
                .body(xlsxBytes);
        }

        // Format selain PDF atau XLSX
        return ResponseEntity.badRequest().body(null);
    }

    /**
     * Endpoint GET: Riwayat Audit Unduhan Dokumen
     * Menampilkan 15 data riwayat pengunduhan laporan terakhir oleh pihak manajemen (PK-UC010).
     *
     * Contoh:
     * GET /api/laporan/audit
     */
    @GetMapping("/audit")
    public ResponseEntity<List<com.spct.model.LogAuditLaporan>> getRiwayatAudit()
    {
        return ResponseEntity.ok(logAuditLaporanRepository.findTop15ByOrderByWaktuUnduhDesc());
    }

    /**
     * Endpoint GET: Status Kebijakan Retensi Data (Fase 7)
     * Mengembalikan informasi kuota retensi (90 hari untuk log IoT normal) dan jumlah baris data yang terlindungi.
     *
     * Contoh:
     * GET /api/laporan/retensi/status
     */
    @GetMapping("/retensi/status")
    public ResponseEntity<java.util.Map<String, Object>> getStatusRetensi()
    {
        return ResponseEntity.ok(dataRetentionService.getStatusKebijakanRetensi());
    }

    /**
     * Endpoint POST: Eksekusi Pembersihan Data Manual (Fase 7)
     * Memicu pembersihan log sensor normal yang melebihi batas retensi secara manual.
     *
     * Contoh:
     * POST /api/laporan/retensi/purge
     */
    @PostMapping("/retensi/purge")
    public ResponseEntity<java.util.Map<String, Object>> triggerPembersihanManual()
    {
        return ResponseEntity.ok(dataRetentionService.eksekusiPembersihanManual());
    }
}
