package com.spct.service;

import com.spct.dto.HasilAlokasiRuteDto;
import com.spct.dto.HasilDeteksiMasukDto;
import com.spct.dto.HasilDeteksiKeluarDto;
import com.spct.model.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.spct.repository.DataKendaraanRepository;
import com.spct.repository.SlotParkirRepository;
import com.spct.repository.TransaksiParkirRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Deklarasi Service: kelas yang berisi logika bisnis untuk mengorkestrasi seluruh proses deteksi plat masuk
// Menjadi penghubung antara DeteksiPlatController dan service-service lain (AlokasiRuteService)
@Service
public class DeteksiPlatService // Kelas service yang mengelola alur lengkap saat kendaraan masuk gerbang
{
    // =====================================================================
    // Nilai Konstanta Konfigurasi Sistem (setara konstanta final di Java SE Anda)
    // =====================================================================

    // Batas minimum confidence score dari OCR/YOLO agar plat dianggap valid secara otomatis
    // Jika di bawah threshold, sistem akan meminta validasi manual oleh petugas
    private static final double CONFIDENCE_THRESHOLD = 0.70; // Nilai 70% sesuai pseudocode UML


    // =====================================================================
    // Deklarasi Atribut Repository dan Service (diinject otomatis oleh Spring)
    // =====================================================================

    @Autowired
    private DataKendaraanRepository dataKendaraanRepository; // Repository untuk akses tabel data_kendaraan

    @Autowired
    private SlotParkirRepository slotParkirRepository; // Repository untuk akses tabel slot_parkir

    @Autowired
    private TransaksiParkirRepository transaksiParkirRepository; // Repository untuk akses tabel transaksi_parkir

    @Autowired
    private AlokasiRuteService alokasiRuteService; // Service alokasi slot dan Algoritma A*

    @Autowired
    private com.spct.repository.PembayaranRepository pembayaranRepository;


    // =====================================================================
    // Method Utama: Mengorkestrasi seluruh alur pemrosesan kendaraan masuk
    // =====================================================================

    // @Transactional memastikan semua operasi database (cek, insert, update) berhasil semua atau gagal semua
    @Transactional
    public HasilDeteksiMasukDto prosesKendaraanMasuk(String platNomor, JenisKendaraan jenisKendaraan, double confidenceScore)
    {
        // --- Langkah 1: Validasi Confidence Score dari OCR/YOLO ---
        // Sesuai pseudocode: IF confidence < Threshold -> minta validasi manual
        if (confidenceScore < CONFIDENCE_THRESHOLD)
        {
            // Jika confidence rendah, kembalikan DTO dengan status peringatan tanpa memproses lebih lanjut
            return new HasilDeteksiMasukDto(
                "CONFIDENCE_RENDAH",    // Status: minta validasi manual petugas
                platNomor,              // Plat yang terbaca (mungkin tidak akurat)
                null,                   // Waktu masuk belum dicatat
                null,                   // ID transaksi belum dibuat
                null,                   // Slot belum dialokasikan
                null,                   // Lantai belum diketahui
                null,                   // Rute belum dihitung
                "Confidence OCR terlalu rendah (" + String.format("%.0f", confidenceScore * 100) + "%). Mohon validasi manual oleh petugas."
            );
        }

        // --- Langkah 2: Registrasi Kendaraan (cari atau daftarkan baru) ---
        // Sesuai pseudocode: panggil DataKendaraanService, cek plat di database
        DataKendaraan kendaraan = cariAtauDaftarkanKendaraan(platNomor, jenisKendaraan);

        // --- Langkah 3: Delegasikan ke AlokasiRuteService (cari slot + jalankan A*) ---
        // Sesuai pseudocode: teruskan id_kendaraan ke AlokasiRuteService
        HasilAlokasiRuteDto hasilAlokasi = alokasiRuteService.prosesAlokasiDanRute(platNomor, jenisKendaraan);

        // Jika tidak ada slot kosong di semua lantai, kembalikan respons basement penuh
        if ("BASEMENT_PENUH".equals(hasilAlokasi.getPesanStatus()))
        {
            return new HasilDeteksiMasukDto(
                "BASEMENT_PENUH",   // Status: tidak bisa masuk
                platNomor,          // Plat yang terdeteksi
                null, null, null, null, null,
                "Maaf, semua slot parkir penuh. Silakan coba lagi nanti."
            );
        }

        // --- Langkah 4: Catat Transaksi Baru (Waktu Masuk) ---
        // Sesuai pseudocode: teruskan id_kendaraan ke TransaksiParkirService untuk catat WAKTU_MASUK
        SlotParkir slotYangDipilih = slotParkirRepository
            .findById(hasilAlokasi.getIdSlotDialokasikan()) // Ambil objek SlotParkir berdasarkan ID yang sudah dialokasikan
            .orElseThrow(); // Jika slot tidak ditemukan (seharusnya tidak terjadi), lempar exception

        TransaksiParkir transaksiParkir = new TransaksiParkir(kendaraan, slotYangDipilih); // Membuat objek transaksi baru
        TransaksiParkir transaksiTersimpan = transaksiParkirRepository.save(transaksiParkir); // Simpan transaksi ke database (INSERT)

        // --- Langkah 5: Susun dan kembalikan respons lengkap ke Controller ---
        // Sesuai pseudocode: kembalikan JSON dengan semua data yang dibutuhkan Kiosk
        return new HasilDeteksiMasukDto(
            "SUKSES",                                   // Status: proses berhasil
            platNomor,                                  // Plat nomor yang terdeteksi (konfirmasi ke pengguna)
            transaksiTersimpan.getWaktuMasuk(),         // Waktu masuk yang sudah tercatat di database
            transaksiTersimpan.getIdTransaksi(),        // ID transaksi untuk referensi pembayaran saat keluar
            hasilAlokasi.getIdSlotDialokasikan(),       // Nomor slot yang dialokasikan (misal: "B1-12")
            hasilAlokasi.getLantaiSlot(),               // Lantai slot untuk konteks navigasi Kiosk
            hasilAlokasi.getUrutan(),                   // Array rute A* untuk rendering animasi 2D di Kiosk
            "Selamat datang! Silakan menuju slot parkir Anda."
        );
    }


    // =====================================================================
    // Method Pendukung: Cari atau daftarkan kendaraan baru
    // =====================================================================

    // Method untuk mencari kendaraan di database atau mendaftarkan yang baru secara otomatis
    private DataKendaraan cariAtauDaftarkanKendaraan(String platNomor, JenisKendaraan jenisKendaraan)
    {
        // Mencari kendaraan di database berdasarkan plat nomor
        return dataKendaraanRepository.findByPlatNomor(platNomor)
            .orElseGet(() ->
            {
                // Jika kendaraan belum terdaftar, buat objek baru dan simpan ke database
                DataKendaraan kendaraanBaru = new DataKendaraan(platNomor, jenisKendaraan);
                return dataKendaraanRepository.save(kendaraanBaru); // Simpan kendaraan baru dan kembalikan objeknya
            });
    }

    // =====================================================================
    // Method: Mengorkestrasi pemrosesan kendaraan keluar
    // =====================================================================
    @Transactional
    public HasilDeteksiKeluarDto prosesKendaraanKeluar(String platNomor, BigDecimal saldoEwallet)
    {
        // 1. Cari transaksi yang belum lunas
        TransaksiParkir transaksi = transaksiParkirRepository.findByKendaraan_PlatNomorAndStatusPembayaran(
                platNomor, StatusPembayaran.BELUM_LUNAS).orElse(null);

        if (transaksi == null) {
            return new HasilDeteksiKeluarDto("KENDARAAN_TIDAK_DITEMUKAN", platNomor, null, null, 0, BigDecimal.ZERO, "Kendaraan tidak ditemukan atau sudah lunas.");
        }

        LocalDateTime waktuMasuk = transaksi.getWaktuMasuk();
        LocalDateTime waktuKeluar = LocalDateTime.now();
        
        // 2. Hitung durasi (minimal 1 jam)
        java.time.Duration duration = java.time.Duration.between(waktuMasuk, waktuKeluar);
        long minutes = duration.toMinutes();
        long hours = (long) Math.ceil(minutes / 60.0);
        if (hours < 1) hours = 1; 
        
        // 3. Hitung biaya (Rp 5.000 / jam)
        BigDecimal tarifPerJam = new BigDecimal("5000.00");
        BigDecimal totalBiaya = tarifPerJam.multiply(new BigDecimal(hours));

        // 4. Proses Simulasi Pembayaran
        if (saldoEwallet.compareTo(totalBiaya) >= 0) {
            // Lunas
            transaksi.setWaktuKeluar(waktuKeluar);
            transaksi.setDurasiTotalMenit((int) minutes);
            transaksi.setNominalTagihan(totalBiaya);
            transaksi.setStatusPembayaran(StatusPembayaran.LUNAS);
            transaksi.setMetodePembayaran(MetodePembayaran.ETOLL_MANDIRI);
            
            // Kosongkan Slot
            SlotParkir slot = transaksi.getSlotDipilih();
            if (slot != null) {
                slot.setStatusSlot(StatusSlot.KOSONG);
                slotParkirRepository.save(slot);
            }
            
            transaksiParkirRepository.save(transaksi);

            Pembayaran pembayaran = new Pembayaran(transaksi, totalBiaya, MetodePembayaran.ETOLL_MANDIRI);
            pembayaran.setStatusPembayaran(StatusPembayaran.LUNAS);
            pembayaran.setWaktuPembayaran(waktuKeluar);
            pembayaranRepository.save(pembayaran);

            return new HasilDeteksiKeluarDto("SUKSES", platNomor, waktuMasuk, waktuKeluar, hours, totalBiaya, "Pembayaran berhasil. Silakan keluar.");
        } else {
            // Saldo Kurang - Transaksi tetap aktif
            return new HasilDeteksiKeluarDto("SALDO_KURANG", platNomor, waktuMasuk, waktuKeluar, hours, totalBiaya, "Saldo E-Wallet tidak mencukupi.");
        }
    }
}
