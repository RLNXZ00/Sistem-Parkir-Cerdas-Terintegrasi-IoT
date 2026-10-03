package com.spct.service;

import com.spct.dto.HasilTagihanDto;
import com.spct.model.*;
import com.spct.repository.SlotParkirRepository;
import com.spct.repository.TransaksiParkirRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;

// Deklarasi Service: kelas yang berisi logika perhitungan tarif parkir dan pemrosesan pembayaran
@Service
public class TransaksiPembayaranService 
{
    // =====================================================================
    // Deklarasi Atribut Repository
    // =====================================================================

    @Autowired
    private TransaksiParkirRepository transaksiParkirRepository; // Akses ke tabel transaksi_parkir

    @Autowired
    private SlotParkirRepository slotParkirRepository; // Akses ke tabel slot_parkir (untuk mengosongkan slot setelah lunas)


    // =====================================================================
    // Method Utama: Menghitung tagihan saat kendaraan tiba di gerbang keluar
    // =====================================================================

    @Transactional
    public HasilTagihanDto hitungTagihanKeluar(String platNomor)
    {
        // 1. Kueri transaksi aktif berdasarkan plat nomor (Status = BELUM_LUNAS)
        TransaksiParkir transaksiAktif = transaksiParkirRepository
            .findByKendaraan_PlatNomorAndStatusPembayaran(platNomor, StatusPembayaran.BELUM_LUNAS)
            .orElse(null);

        if (transaksiAktif == null)
        {
            // Jika tidak ada transaksi aktif, kembalikan status error
            return new HasilTagihanDto("TRANSAKSI_TIDAK_DITEMUKAN", null, platNomor, 
                                        null, null, null, null, null, 
                                        "Kendaraan tidak ditemukan di sistem atau sudah lunas.");
        }

        // 2. Kalkulasi Durasi
        LocalDateTime waktuKeluar = LocalDateTime.now();
        transaksiAktif.setWaktuKeluar(waktuKeluar); // Set waktu keluar sekarang

        // Hitung selisih waktu dalam menit
        Duration durasi = Duration.between(transaksiAktif.getWaktuMasuk(), waktuKeluar);
        int durasiTotalMenit = (int) durasi.toMinutes();
        transaksiAktif.setDurasiTotalMenit(durasiTotalMenit);

        // 3. Logika Bisnis Tarif (Sesuai pseudocode dan instruksi tarif)
        BigDecimal nominalTagihan = hitungTarif(durasiTotalMenit);
        transaksiAktif.setNominalTagihan(nominalTagihan);

        // Update status pembayaran jika Grace Period (gratis)
        if (nominalTagihan.compareTo(BigDecimal.ZERO) == 0 && durasiTotalMenit <= 10)
        {
            transaksiAktif.setStatusPembayaran(StatusPembayaran.GRACE_PERIOD_FREE);
            // Pengecualian pembebasan slot untuk Grace Period
            bebaskanSlotParkir(transaksiAktif);
        }

        // Simpan pembaruan ke database
        transaksiParkirRepository.save(transaksiAktif);

        // 4. Susun respons untuk Kiosk
        String pesan = (transaksiAktif.getStatusPembayaran() == StatusPembayaran.GRACE_PERIOD_FREE) 
                        ? "Gratis (Grace Period < 10 Menit). Palang terbuka otomatis." 
                        : "Silakan pilih metode pembayaran (QRIS / E-Toll).";

        return new HasilTagihanDto(
            "SUKSES",
            transaksiAktif.getIdTransaksi(),
            platNomor,
            transaksiAktif.getWaktuMasuk(),
            transaksiAktif.getWaktuKeluar(),
            transaksiAktif.getDurasiTotalMenit(),
            transaksiAktif.getNominalTagihan(),
            transaksiAktif.getStatusPembayaran(),
            pesan
        );
    }

    // =====================================================================
    // Method Utama: Mengeksekusi pembayaran dan membebaskan slot
    // =====================================================================

    @Transactional
    public HasilTagihanDto prosesPembayaran(Long idTransaksi, MetodePembayaran metodePembayaran)
    {
        TransaksiParkir transaksi = transaksiParkirRepository.findById(idTransaksi).orElseThrow();

        // 5. Eksekusi Pasca-Pembayaran
        transaksi.setStatusPembayaran(StatusPembayaran.LUNAS); // Tandai lunas
        transaksi.setMetodePembayaran(metodePembayaran);       // Catat metode pembayaran

        // Membebaskan slot parkir yang digunakan
        bebaskanSlotParkir(transaksi);

        transaksiParkirRepository.save(transaksi);

        // TODO: Kirim perintah ke Hardware Palang Keluar (Buka Gate) via IoT

        return new HasilTagihanDto(
            "LUNAS",
            transaksi.getIdTransaksi(),
            transaksi.getKendaraan().getPlatNomor(),
            transaksi.getWaktuMasuk(),
            transaksi.getWaktuKeluar(),
            transaksi.getDurasiTotalMenit(),
            transaksi.getNominalTagihan(),
            transaksi.getStatusPembayaran(),
            "Terima Kasih, Hati-hati di Jalan."
        );
    }


    // =====================================================================
    // Method Pendukung: Logika Kalkulasi Tarif Parkir
    // =====================================================================

    private BigDecimal hitungTarif(int durasiMenit)
    {
        // Aturan 1: Grace Period (<= 10 Menit) = Rp 0
        if (durasiMenit <= 10)
        {
            return BigDecimal.ZERO;
        }

        // Konversi menit ke jam (pembulatan ke atas, misal 65 menit = 2 jam)
        int durasiJam = (int) Math.ceil(durasiMenit / 60.0);

        // Aturan 2: Rawat inap (di atas 12 jam) = Rp 10.000 (flat)
        if (durasiJam > 12)
        {
            return new BigDecimal("10000");
        }

        // Aturan 3: dibawah 5 jam pertama 5000, diatas 3 jam pertama 2000 per jam.
        // Asumsi interpretasi: 3 jam pertama flat Rp 5.000, jam berikutnya Rp 2.000 per jam.
        if (durasiJam <= 3)
        {
            return new BigDecimal("5000");
        }
        else
        {
            int sisaJam = durasiJam - 3;
            int totalTarif = 5000 + (sisaJam * 2000);
            return new BigDecimal(String.valueOf(totalTarif));
        }
    }

    private void bebaskanSlotParkir(TransaksiParkir transaksi) 
    {
        SlotParkir slotTerkait = transaksi.getSlotDipilih();
        if (slotTerkait != null) {
            slotTerkait.setStatusSlot(StatusSlot.KOSONG); // Kembalikan slot menjadi kosong
            slotTerkait.setKendaraanAktif(null);
            slotTerkait.setWaktuDipesan(null);
            slotParkirRepository.save(slotTerkait);
        }
    }
}
