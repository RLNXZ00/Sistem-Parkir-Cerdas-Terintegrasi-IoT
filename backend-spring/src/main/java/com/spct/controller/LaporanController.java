package com.spct.controller; // Nama package dari modul pengontrol REST API sistem

// Import DTO LaporanResponseDto dari package dto
import com.spct.dto.LaporanResponseDto;
// Import entitas LogAuditLaporan dari package model
import com.spct.model.LogAuditLaporan;
// Import repositori LogAuditLaporanRepository dari package repository
import com.spct.repository.LogAuditLaporanRepository;
// Import service DataRetentionService dari package service
import com.spct.service.DataRetentionService;
// Import service LaporanExcelService dari package service
import com.spct.service.LaporanExcelService;
// Import service LaporanPdfService dari package service
import com.spct.service.LaporanPdfService;
// Import service LaporanService dari package service
import com.spct.service.LaporanService;
// Import anotasi Autowired dari Spring Framework
import org.springframework.beans.factory.annotation.Autowired;
// Import anotasi format tanggal dari Spring Framework
import org.springframework.format.annotation.DateTimeFormat;
// Import kelas HttpHeaders dari Spring HTTP
import org.springframework.http.HttpHeaders;
// Import kelas MediaType dari Spring HTTP
import org.springframework.http.MediaType;
// Import kelas ContentDisposition dari Spring HTTP
import org.springframework.http.ContentDisposition;
// Import kelas ResponseEntity dari Spring HTTP
import org.springframework.http.ResponseEntity;
// Import anotasi-anotasi Spring Web REST Controller
import org.springframework.web.bind.annotation.*;
// Import antarmuka HttpServletRequest dari servlet API
import jakarta.servlet.http.HttpServletRequest;

// Import tipe data tanggal lokal java
import java.time.LocalDate;
// Import koleksi List dari java util
import java.util.List;
// Import antarmuka Map dari java util
import java.util.Map;

// Kelas pengontrol publik java LaporanController untuk menyajikan pratinjau, pengunduhan berkas PDF/XLSX, dan audit trail laporan
@RestController // Menandai kelas sebagai pengendali REST API
@RequestMapping("/api/laporan") // Menetapkan path rute dasar endpoint /api/laporan
@CrossOrigin(origins = "*") // Mengizinkan permintaan lintas domain dari Web Dashboard
public class LaporanController
{
    // Injeksi otomatis layanan LaporanService oleh Spring
    @Autowired
    private LaporanService laporanService; // Deklarasi atribut laporanService bertipe LaporanService

    // Injeksi otomatis layanan LaporanPdfService untuk pembuatan berkas PDF
    @Autowired
    private LaporanPdfService laporanPdfService; // Deklarasi atribut laporanPdfService bertipe LaporanPdfService

    // Injeksi otomatis layanan LaporanExcelService untuk pembuatan berkas spreadsheet XLSX
    @Autowired
    private LaporanExcelService laporanExcelService; // Deklarasi atribut laporanExcelService bertipe LaporanExcelService

    // Injeksi otomatis repositori LogAuditLaporanRepository untuk pencatatan audit trail
    @Autowired
    private LogAuditLaporanRepository logAuditLaporanRepository; // Deklarasi atribut logAuditLaporanRepository

    // Injeksi otomatis layanan DataRetentionService untuk kebijakan retensi data
    @Autowired
    private DataRetentionService dataRetentionService; // Deklarasi atribut dataRetentionService

    // =====================================================================
    // Endpoint GET: Pratinjau Laporan (Preview)
    // =====================================================================

    // Method GET getPratinjauLaporan untuk menyajikan pratinjau data laporan historis
    @GetMapping("/preview")
    public ResponseEntity<LaporanResponseDto> getPratinjauLaporan(
        @RequestParam(defaultValue = "finansial") String jenis, // Parameter jenis laporan (finansial/operasional/lingkungan/komprehensif)
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dari, // Parameter tanggal awal
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate sampai) // Parameter tanggal akhir
    {
        // Memanggil service untuk mengambil data pratinjau laporan sesuai kriteria
        LaporanResponseDto hasil = laporanService.ambilPratinjauLaporan(jenis, dari, sampai);

        // Mengembalikan respons entitas HTTP 200 OK beserta data laporan
        return ResponseEntity.ok(hasil);
    }

    // =====================================================================
    // Endpoint GET: Unduh Dokumen Resmi PDF / XLSX
    // =====================================================================

    // Method GET unduhDokumenLaporan untuk mengunduh berkas laporan dalam format PDF atau XLSX
    @GetMapping("/unduh")
    public ResponseEntity<byte[]> unduhDokumenLaporan(
        @RequestParam(defaultValue = "pdf") String format, // Parameter format berkas (pdf atau xlsx)
        @RequestParam(defaultValue = "finansial") String jenis, // Parameter jenis laporan
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dari, // Parameter tanggal awal
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate sampai, // Parameter tanggal akhir
        HttpServletRequest request) // Objek request servlet untuk mencatat alamat IP klien
    {
        // Mengambil data laporan pratinjau yang akan diekspor menjadi berkas fisik
        LaporanResponseDto dto = laporanService.ambilPratinjauLaporan(jenis, dari, sampai);

        // Jika parameter format adalah PDF, maka:
        if ("pdf".equalsIgnoreCase(format))
        {
            // Memanggil method generatePdf untuk menghasilkan array byte dokumen PDF
            byte[] pdfBytes = laporanPdfService.generatePdf(dto);

            // Membuat format string nama berkas laporan yang diunduh
            String namaFile = String.format("Laporan_%s_%s_sd_%s.pdf",
                jenis.substring(0, 1).toUpperCase() + jenis.substring(1), dari, sampai);

            // Instansiasi objek HttpHeaders untuk header respon HTTP
            HttpHeaders headers = new HttpHeaders();
            // Menentukan tipe media konten sebagai application/pdf
            headers.setContentType(MediaType.APPLICATION_PDF);
            // Menetapkan header Content-Disposition sebagai lampiran berkas (attachment)
            headers.setContentDisposition(ContentDisposition.attachment().filename(namaFile).build());

            // Blok try-catch untuk mencatat aktivitas pengunduhan ke log audit database
            try
            {
                // Instansiasi entitas log audit laporan
                LogAuditLaporan audit = new LogAuditLaporan(
                    "Manajemen RS (Admin)", // Identitas nama pengguna pengunduh
                    jenis.toUpperCase(), // Kategori jenis laporan
                    "PDF", // Format berkas unduhan
                    dari, // Tanggal awal rentang data
                    sampai, // Tanggal akhir rentang data
                    namaFile, // Nama berkas dokumen
                    (long) pdfBytes.length, // Ukuran kapasitas berkas dalam byte
                    request != null ? request.getRemoteAddr() : "127.0.0.1" // Alamat IP klien
                );

                // Menyimpan rekaman audit ke database melalui repository
                logAuditLaporanRepository.save(audit);

                // Menampilkan log konfirmasi penyimpanan audit di konsol server
                System.out.println(String.format("[AUDIT LOG TERSIMPAN] Dokumen '%s' (Format: PDF, Ukuran: %d bytes)",
                    namaFile, pdfBytes.length));
            }
            catch (Exception ex)
            {
                // Menampilkan pesan kesalahan jika pencatatan audit log gagal
                System.err.println("[AUDIT LOG ERROR] Gagal menyimpan log unduhan PDF: " + ex.getMessage());
            }

            // Mengembalikan respons entitas HTTP 200 OK dengan header dan byte dokumen PDF
            return ResponseEntity.ok()
                .headers(headers)
                .contentLength(pdfBytes.length)
                .body(pdfBytes);
        }
        // Jika parameter format adalah spreadsheet XLSX / Excel, maka:
        else if ("xlsx".equalsIgnoreCase(format) || "excel".equalsIgnoreCase(format))
        {
            // Memanggil method generateExcel untuk membuat file spreadsheet dalam format array byte
            byte[] xlsxBytes = laporanExcelService.generateExcel(dto);

            // Membuat format string nama berkas dokumen XLSX
            String namaFile = String.format("Laporan_%s_%s_sd_%s.xlsx",
                jenis.substring(0, 1).toUpperCase() + jenis.substring(1), dari, sampai);

            // Instansiasi header HTTP respon
            HttpHeaders headers = new HttpHeaders();
            // Menetapkan tipe konten media spreadsheet openxmlformats
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            // Menetapkan lampiran berkas berkas unduhan spreadsheet
            headers.setContentDisposition(ContentDisposition.attachment().filename(namaFile).build());

            // Blok try-catch untuk mencatat aktivitas pengunduhan berkas Excel ke database
            try
            {
                // Instansiasi entitas riwayat audit pengunduhan
                LogAuditLaporan audit = new LogAuditLaporan(
                    "Manajemen RS (Admin)", // Pengguna pengunduh
                    jenis.toUpperCase(), // Jenis laporan
                    "XLSX", // Format ekstensi berkas
                    dari, // Periode awal
                    sampai, // Periode akhir
                    namaFile, // Nama berkas
                    (long) xlsxBytes.length, // Ukuran berkas dalam byte
                    request != null ? request.getRemoteAddr() : "127.0.0.1" // Alamat IP remote
                );

                // Menyimpan catatan audit trail ke database
                logAuditLaporanRepository.save(audit);

                // Menampilkan pemberitahuan log audit berhasil disimpan
                System.out.println(String.format("[AUDIT LOG TERSIMPAN] Dokumen '%s' (Format: XLSX, Ukuran: %d bytes)",
                    namaFile, xlsxBytes.length));
            }
            catch (Exception ex)
            {
                // Menampilkan log galat audit ke konsol error
                System.err.println("[AUDIT LOG ERROR] Gagal menyimpan log unduhan XLSX: " + ex.getMessage());
            }

            // Mengembalikan respons entitas HTTP 200 OK dengan membawa data biner spreadsheet
            return ResponseEntity.ok()
                .headers(headers)
                .contentLength(xlsxBytes.length)
                .body(xlsxBytes);
        }

        // Jika format yang diminta bukan PDF atau XLSX, kembalikan HTTP 400 Bad Request
        return ResponseEntity.badRequest().body(null);
    }

    // =====================================================================
    // Endpoint GET: Riwayat Audit Unduhan Dokumen
    // =====================================================================

    // Method GET getRiwayatAudit untuk menyajikan 15 catatan riwayat unduhan terbaru
    @GetMapping("/audit")
    public ResponseEntity<List<LogAuditLaporan>> getRiwayatAudit()
    {
        // Mengembalikan daftar 15 rekaman riwayat audit unduhan paling baru
        return ResponseEntity.ok(logAuditLaporanRepository.findTop15ByOrderByWaktuUnduhDesc());
    }

    // =====================================================================
    // Endpoint GET: Status Kebijakan Retensi Data Pembersihan Log
    // =====================================================================

    // Method GET getStatusRetensi untuk memeriksa parameter dan status kebijakan retensi
    @GetMapping("/retensi/status")
    public ResponseEntity<Map<String, Object>> getStatusRetensi()
    {
        // Mengembalikan data peta informasi kebijakan retensi dan kuota log
        return ResponseEntity.ok(dataRetentionService.getStatusKebijakanRetensi());
    }

    // =====================================================================
    // Endpoint POST: Eksekusi Pembersihan Data Manual
    // =====================================================================

    // Method POST triggerPembersihanManual untuk memicu penghapusan log kadaluarsa secara manual
    @PostMapping("/retensi/purge")
    public ResponseEntity<Map<String, Object>> triggerPembersihanManual()
    {
        // Menjalankan pembersihan manual dan mengembalikan hasil rekapitulasi data yang terhapus
        return ResponseEntity.ok(dataRetentionService.eksekusiPembersihanManual());
    }
}
