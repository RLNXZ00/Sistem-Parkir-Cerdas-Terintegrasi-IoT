package com.spct.controller; // Nama package dari modul pengontrol REST API sistem

// Import DTO HasilDeteksiKeluarDto dari package dto
import com.spct.dto.HasilDeteksiKeluarDto;
// Import DTO HasilDeteksiMasukDto dari package dto
import com.spct.dto.HasilDeteksiMasukDto;
// Import enum JenisKendaraan dari package model
import com.spct.model.JenisKendaraan;
// Import entitas LogDeteksiPlat dari package model
import com.spct.model.LogDeteksiPlat;
// Import repositori LogDeteksiPlatRepository dari package repository
import com.spct.repository.LogDeteksiPlatRepository;
// Import service DeteksiPlatService dari package service
import com.spct.service.DeteksiPlatService;
// Import anotasi Autowired dari Spring Framework
import org.springframework.beans.factory.annotation.Autowired;
// Import enum HttpStatus dari Spring HTTP
import org.springframework.http.HttpStatus;
// Import kelas ResponseEntity dari Spring HTTP
import org.springframework.http.ResponseEntity;
// Import anotasi-anotasi Spring Web REST Controller
import org.springframework.web.bind.annotation.*;

// Import tipe data BigDecimal untuk nominal saldo
import java.math.BigDecimal;
// Import pembanding Comparator dari java util
import java.util.Comparator;
// Import antarmuka Map dari java util
import java.util.Map;
// Import kolektor Collectors dari java util stream
import java.util.stream.Collectors;

// Kelas pengontrol publik java DeteksiPlatController untuk mengelola alur deteksi plat nomor gerbang masuk dan gerbang keluar
@RestController // Menandai kelas sebagai pengendali REST API
@RequestMapping("/api/gate") // Menetapkan path rute dasar endpoint /api/gate
@CrossOrigin(origins = "*") // Mengizinkan permintaan lintas domain dari Kamera ALPR dan Terminal Kiosk
public class DeteksiPlatController
{
    // Injeksi otomatis layanan DeteksiPlatService oleh Spring
    @Autowired
    private DeteksiPlatService deteksiPlatService; // Deklarasi atribut deteksiPlatService bertipe DeteksiPlatService

    // Injeksi otomatis repositori LogDeteksiPlatRepository oleh Spring
    @Autowired
    private LogDeteksiPlatRepository logDeteksiPlatRepository; // Deklarasi atribut logDeteksiPlatRepository

    // =====================================================================
    // Endpoint POST: Menerima data deteksi plat gerbang MASUK
    // =====================================================================

    // Method POST prosesKendaraanMasuk untuk memproses kendaraan yang tiba di gerbang masuk
    @PostMapping("/masuk")
    public ResponseEntity<HasilDeteksiMasukDto> prosesKendaraanMasuk(
        @RequestBody(required = false) Map<String, String> body, // Payload body JSON dari simulasi antarmuka Kiosk
        @RequestParam(required = false) String platNomor, // Parameter query platNomor dari kamera ALPR Python
        @RequestParam(name = "jenisKendaraan", required = false) String jenisKendaraanParam, // Parameter query tipe kendaraan
        @RequestParam(defaultValue = "1.0") double confidence) // Parameter query confidence score akurasi model OCR
    {
        // Mengambil plat nomor dari body JSON jika tersedia, atau dari query param
        String platFinal = (body != null && body.containsKey("platNomor")) ? body.get("platNomor") : platNomor;

        // Mengambil tipe jenis kendaraan dari body JSON jika tersedia, atau dari query param
        String jeniStr = (body != null && body.containsKey("jenisKendaraan")) ? body.get("jenisKendaraan") : jenisKendaraanParam;

        // Deklarasi variabel jenis bertipe enum JenisKendaraan
        JenisKendaraan jenis;

        // Blok try-catch untuk parsing string enum jenis kendaraan
        try 
        {
            // Jika string jenis ada, ubah ke enum JenisKendaraan; jika tidak, gunakan MOBIL secara default
            jenis = (jeniStr != null) ? JenisKendaraan.valueOf(jeniStr.toUpperCase()) : JenisKendaraan.MOBIL;
        } 
        catch (IllegalArgumentException e) 
        {
            // Jika nilai string tidak valid, fallback ke tipe MOBIL
            jenis = JenisKendaraan.MOBIL;
        }

        // Jika nomor plat kosong atau hanya spasi, maka:
        if (platFinal == null || platFinal.isBlank()) 
        {
            // Instansiasi objek HasilDeteksiMasukDto untuk informasi error
            HasilDeteksiMasukDto err = new HasilDeteksiMasukDto();
            // Inisialisasi status respon dengan nilai ERROR
            err.setStatus("ERROR");
            // Inisialisasi pesan keterangan kesalahan
            err.setPesanKeterangan("Parameter platNomor wajib diisi.");
            // Kembalikan respons entitas HTTP 400 Bad Request
            return ResponseEntity.badRequest().body(err);
        }

        // Memanggil service untuk memproses registrasi, alokasi slot, dan pencarian rute A*
        HasilDeteksiMasukDto hasil = deteksiPlatService.prosesKendaraanMasuk(platFinal, jenis, confidence);

        // Jika tingkat keyakinan OCR rendah di bawah ambang batas, maka:
        if ("CONFIDENCE_RENDAH".equals(hasil.getStatus()))
        {
            // Kembalikan status HTTP 422 Unprocessable Entity agar petugas memvalidasi secara manual
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(hasil);
        }

        // Jika kapasitas seluruh slot parkir penuh, maka:
        if ("BASEMENT_PENUH".equals(hasil.getStatus()))
        {
            // Kembalikan status HTTP 409 Conflict
            return ResponseEntity.status(HttpStatus.CONFLICT).body(hasil);
        }

        // Pemrosesan berhasil: kembalikan status HTTP 200 OK dengan membawa data alokasi rute
        return ResponseEntity.ok(hasil);
    }

    // =====================================================================
    // Endpoint POST: Override manual oleh petugas (saat confidence rendah)
    // =====================================================================

    // Method POST overridePlatManual untuk input koreksi manual plat nomor oleh petugas
    @PostMapping("/masuk/override-manual")
    public ResponseEntity<HasilDeteksiMasukDto> overridePlatManual(
        @RequestParam String platNomor, // Parameter nomor plat hasil koreksi petugas
        @RequestParam JenisKendaraan jenisKendaraan) // Parameter jenis kendaraan yang divalidasi
    {
        // Menjalankan alur alokasi dengan tingkat keyakinan penuh 1.0 karena telah dikoreksi manusia
        HasilDeteksiMasukDto hasil = deteksiPlatService.prosesKendaraanMasuk(platNomor, jenisKendaraan, 1.0);

        // Jika basement penuh, kembalikan HTTP 409 Conflict
        if ("BASEMENT_PENUH".equals(hasil.getStatus()))
        {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(hasil);
        }

        // Kembalikan status HTTP 200 OK
        return ResponseEntity.ok(hasil);
    }

    // =====================================================================
    // Endpoint GET: Mengambil riwayat log deteksi plat
    // =====================================================================

    // Method GET getAllLogDeteksi untuk menyajikan daftar seluruh pembacaan plat nomor
    @GetMapping("/log")
    public ResponseEntity<?> getAllLogDeteksi()
    {
        // Mengambil seluruh log deteksi dari basis data dan mengurutkannya dari waktu terbaru
        return ResponseEntity.ok(
            logDeteksiPlatRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(
                    LogDeteksiPlat::getWaktuDeteksi,
                    Comparator.reverseOrder()
                ))
                .collect(Collectors.toList())
        );
    }

    // =====================================================================
    // Endpoint POST: Menerima data kendaraan KELUAR
    // =====================================================================

    // Method POST prosesKendaraanKeluar untuk memproses transaksi keluar dan checkout saldo pembayaran
    @PostMapping("/keluar")
    public ResponseEntity<HasilDeteksiKeluarDto> prosesKendaraanKeluar(
        @RequestBody(required = false) Map<String, Object> body, // Payload request body JSON
        @RequestParam(required = false) String platNomor, // Parameter plat nomor
        @RequestParam(required = false) BigDecimal saldoEwallet, // Parameter saldo dompet digital
        @RequestParam(name = "jenisKendaraan", required = false) String jenisKendaraanParam) // Parameter jenis kendaraan
    {
        // Menentukan nomor plat akhir dari body JSON atau query param
        String platFinal = (body != null && body.containsKey("platNomor") && body.get("platNomor") != null) 
            ? String.valueOf(body.get("platNomor")) 
            : platNomor;
        
        // Inisialisasi variabel saldoFinal
        BigDecimal saldoFinal = saldoEwallet;

        // Memeriksa keberadaan saldo di dalam payload body
        if (body != null && body.containsKey("saldoEwallet") && body.get("saldoEwallet") != null) 
        {
            try 
            {
                // Konversi nilai saldo menjadi objek BigDecimal
                saldoFinal = new BigDecimal(body.get("saldoEwallet").toString());
            } 
            catch (Exception ex) 
            {
                // Menampilkan log galat parsing saldo
                System.err.println("[GATE KELUAR] Format saldoEwallet di body tidak valid: " + ex.getMessage());
            }
        }

        // Jika nilai saldo null, berikan saldo simulasi sebesar 50.000 rupiah
        if (saldoFinal == null) 
        {
            saldoFinal = new BigDecimal("50000.00");
        }
        
        // Jika plat tidak dikirim, otomatis alihkan ke antrean FIFO terlama
        if (platFinal == null || platFinal.isBlank()) 
        {
            platFinal = "QUEUE";
        }

        // Inisialisasi variabel durasi menit simulasi
        Integer durasiMenitFinal = null;

        // Memeriksa apakah parameter durasiMenit dikirim di dalam body
        if (body != null && body.containsKey("durasiMenit") && body.get("durasiMenit") != null) 
        {
            try 
            {
                // Parsing nilai durasi menit menjadi Integer
                durasiMenitFinal = Integer.valueOf(body.get("durasiMenit").toString());
            } 
            catch (Exception ex) 
            {
                // Menampilkan log galat format durasi
                System.err.println("[GATE KELUAR] Format durasiMenit di body tidak valid: " + ex.getMessage());
            }
        }

        // Inisialisasi tipe jenis kendaraan gerbang keluar
        JenisKendaraan jenisKeluar = null;

        // Mengambil data jenis kendaraan dari body JSON jika tersedia
        Object jenisRaw = (body != null) ? body.get("jenisKendaraan") : null;
        String jenisKeluarStr = (jenisRaw != null) ? String.valueOf(jenisRaw) : jenisKendaraanParam;

        // Jika string jenis kendaraan terisi, ubah menjadi enum JenisKendaraan
        if (jenisKeluarStr != null && !jenisKeluarStr.isBlank()) 
        {
            try 
            {
                jenisKeluar = JenisKendaraan.valueOf(jenisKeluarStr.trim().toUpperCase());
            } 
            catch (IllegalArgumentException ex) 
            {
                System.err.println("[GATE KELUAR] jenisKendaraan tidak valid: " + jenisKeluarStr);
            }
        }

        // Memanggil service untuk menghitung tagihan, memotong saldo, dan melepaskan slot parkir
        HasilDeteksiKeluarDto hasil = deteksiPlatService.prosesKendaraanKeluar(platFinal, saldoFinal, durasiMenitFinal, jenisKeluar);
        
        // Jika tiket transaksi tidak ditemukan di database, maka:
        if ("KENDARAAN_TIDAK_DITEMUKAN".equals(hasil.getStatus())) 
        {
            // Kembalikan status HTTP 404 Not Found
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(hasil);
        }
        
        // Jika saldo tidak mencukupi untuk pembayaran tagihan, maka:
        if ("SALDO_KURANG".equals(hasil.getStatus())) 
        {
            // Kembalikan status HTTP 402 Payment Required
            return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).body(hasil);
        }

        // Transaksi keluar dan pembayaran lunas: kembalikan respons HTTP 200 OK
        return ResponseEntity.ok(hasil);
    }

    // =====================================================================
    // Endpoint GET: Mengambil antrean kendaraan yang sedang parkir (FIFO)
    // =====================================================================

    // Method GET getAntreanKeluar untuk menyajikan daftar kendaraan yang sedang aktif parkir
    @GetMapping("/antrean-keluar")
    public ResponseEntity<?> getAntreanKeluar(
        @RequestParam(name = "jenisKendaraan", required = false) String jenisKendaraanParam)
    {
        // Inisialisasi filter jenis kendaraan
        JenisKendaraan jenisFilter = null;

        // Jika parameter jenis kendaraan terisi, lakukan parsing enum
        if (jenisKendaraanParam != null && !jenisKendaraanParam.isBlank()) 
        {
            try 
            {
                jenisFilter = JenisKendaraan.valueOf(jenisKendaraanParam.trim().toUpperCase());
            } 
            catch (IllegalArgumentException ex) 
            {
                jenisFilter = null;
            }
        }

        // Mengambil daftar antrean transaksi aktif dan memetakannya ke bentuk Map ringkas
        return ResponseEntity.ok(
            deteksiPlatService.ambilAntreanKendaraanKeluar(jenisFilter)
                .stream()
                .map(t -> Map.of(
                    "idTransaksi", t.getIdTransaksi(), // ID transaksi tiket
                    "platNomor", t.getKendaraan().getPlatNomor(), // Nomor plat kendaraan
                    "jenisKendaraan", t.getKendaraan().getJenisKendaraan().name(), // Tipe kendaraan
                    "idSlot", t.getSlotDipilih() != null ? t.getSlotDipilih().getIdSlot() : "-", // Nomor slot
                    "waktuMasuk", t.getWaktuMasuk().toString() // Waktu masuk sistem
                ))
                .collect(Collectors.toList())
        );
    }
}
