package com.spct.service; // Nama package dari modul layanan logika bisnis sistem

// Import DTO HasilTagihanDto dari package dto
import com.spct.dto.HasilTagihanDto;
// Import entitas dan enum dari package model
import com.spct.model.*;
// Import repositori SlotParkirRepository dari package repository
import com.spct.repository.SlotParkirRepository;
// Import repositori TransaksiParkirRepository dari package repository
import com.spct.repository.TransaksiParkirRepository;
// Import anotasi Autowired dari Spring Framework
import org.springframework.beans.factory.annotation.Autowired;
// Import anotasi Service dari Spring Framework
import org.springframework.stereotype.Service;
// Import anotasi Transactional dari Spring Framework
import org.springframework.transaction.annotation.Transactional;

// Import tipe data BigDecimal untuk nominal tarif rupiah
import java.math.BigDecimal;
// Import tipe data Duration untuk kalkulasi durasi waktu
import java.time.Duration;
// Import tipe data waktu LocalDateTime java
import java.time.LocalDateTime;

// Kelas layanan publik java TransaksiPembayaranService untuk mengelola perhitungan tarif parkir bertingkat dan pelunasan transaksi
@Service // Menandai kelas ini sebagai Spring Service Bean
public class TransaksiPembayaranService 
{
    // =====================================================================
    // Deklarasi Atribut Repository
    // =====================================================================

    // Injeksi otomatis dependensi TransaksiParkirRepository
    @Autowired
    private TransaksiParkirRepository transaksiParkirRepository; // Deklarasi atribut transaksiParkirRepository

    // Injeksi otomatis dependensi SlotParkirRepository
    @Autowired
    private SlotParkirRepository slotParkirRepository; // Deklarasi atribut slotParkirRepository

    // =====================================================================
    // Method Utama: Menghitung tagihan saat kendaraan tiba di gerbang keluar
    // =====================================================================

    // Method hitungTagihanKeluar untuk menghitung total tagihan berdasarkan waktu kedatangan dan waktu keluar
    @Transactional
    public HasilTagihanDto hitungTagihanKeluar(String platNomor)
    {
        // Mencari transaksi aktif yang berstatus BELUM_LUNAS berdasarkan nomor plat
        TransaksiParkir transaksiAktif = transaksiParkirRepository
            .findFirstByKendaraan_PlatNomorAndStatusPembayaranOrderByWaktuMasukDesc(platNomor, StatusPembayaran.BELUM_LUNAS)
            .orElse(null);

        // Jika transaksi aktif tidak ditemukan di sistem, maka:
        if (transaksiAktif == null)
        {
            // Kembalikan DTO dengan status TRANSAKSI_TIDAK_DITEMUKAN
            return new HasilTagihanDto("TRANSAKSI_TIDAK_DITEMUKAN", null, platNomor, 
                                        null, null, null, null, null, 
                                        "Kendaraan tidak ditemukan di sistem atau sudah lunas.");
        }

        // Mencatat waktu sekarang sebagai waktu keluar kendaraan
        LocalDateTime waktuKeluar = LocalDateTime.now();
        // Mengubah atribut waktuKeluar pada transaksi aktif
        transaksiAktif.setWaktuKeluar(waktuKeluar);

        // Menghitung selisih interval durasi waktu antara waktu masuk dan waktu keluar
        Duration durasi = Duration.between(transaksiAktif.getWaktuMasuk(), waktuKeluar);
        // Mengonversi durasi waktu ke dalam satuan total menit
        int durasiTotalMenit = (int) durasi.toMinutes();
        // Mengubah atribut durasiTotalMenit pada transaksi aktif
        transaksiAktif.setDurasiTotalMenit(durasiTotalMenit);

        // Menghitung nominal tagihan menggunakan aturan tarif resmi sistem
        BigDecimal nominalTagihan = hitungTarif(durasiTotalMenit);
        // Mengubah atribut nominalTagihan pada transaksi aktif
        transaksiAktif.setNominalTagihan(nominalTagihan);

        // Jika biaya bernilai Rp 0 dan durasi parkir tidak lebih dari 10 menit (Grace Period), maka:
        if (nominalTagihan.compareTo(BigDecimal.ZERO) == 0 && durasiTotalMenit <= 10)
        {
            // Mengubah status pembayaran menjadi GRACE_PERIOD_FREE
            transaksiAktif.setStatusPembayaran(StatusPembayaran.GRACE_PERIOD_FREE);
            // Melepaskan dan mengosongkan kembali slot parkir yang ditempati
            bebaskanSlotParkir(transaksiAktif);
        }

        // Menyimpan pembaruan data transaksi parkir ke database
        transaksiParkirRepository.save(transaksiAktif);

        // Menyusun teks instruksi pesan status untuk antarmuka terminal Kiosk Keluar
        String pesan = (transaksiAktif.getStatusPembayaran() == StatusPembayaran.GRACE_PERIOD_FREE) 
                        ? "Gratis (Grace Period < 10 Menit). Palang terbuka otomatis." 
                        : "Silakan pilih metode pembayaran (QRIS / E-Toll).";

        // Mengembalikan objek DTO HasilTagihanDto ke Controller
        return new HasilTagihanDto(
            "SUKSES", // Status operasi
            transaksiAktif.getIdTransaksi(), // ID transaksi
            platNomor, // Nomor plat
            transaksiAktif.getWaktuMasuk(), // Waktu masuk
            transaksiAktif.getWaktuKeluar(), // Waktu keluar
            transaksiAktif.getDurasiTotalMenit(), // Durasi total menit
            transaksiAktif.getNominalTagihan(), // Nominal tagihan
            transaksiAktif.getStatusPembayaran(), // Status pembayaran
            pesan // Pesan instruksi
        );
    }

    // =====================================================================
    // Method Utama: Mengeksekusi pembayaran dan membebaskan slot
    // =====================================================================

    // Method prosesPembayaran untuk mengeksekusi pelunasan tagihan parkir
    @Transactional
    public HasilTagihanDto prosesPembayaran(Long idTransaksi, MetodePembayaran metodePembayaran)
    {
        // Mengambil entitas transaksi parkir berdasarkan idTransaksi dari database
        TransaksiParkir transaksi = transaksiParkirRepository.findById(idTransaksi).orElseThrow();

        // Mengubah status pembayaran transaksi menjadi LUNAS
        transaksi.setStatusPembayaran(StatusPembayaran.LUNAS);
        // Mengubah kanal metode pembayaran yang digunakan (QRIS/E-TOLL)
        transaksi.setMetodePembayaran(metodePembayaran);

        // Mengosongkan kembali slot parkir terkait di denah gedung
        bebaskanSlotParkir(transaksi);

        // Menyimpan pembaruan status transaksi lunas ke database
        transaksiParkirRepository.save(transaksi);

        // Mengembalikan DTO hasil tagihan dengan status LUNAS
        return new HasilTagihanDto(
            "LUNAS", // Status pelunasan lunas
            transaksi.getIdTransaksi(), // ID transaksi
            transaksi.getKendaraan().getPlatNomor(), // Nomor plat
            transaksi.getWaktuMasuk(), // Waktu masuk
            transaksi.getWaktuKeluar(), // Waktu keluar
            transaksi.getDurasiTotalMenit(), // Durasi menit
            transaksi.getNominalTagihan(), // Nominal tagihan
            transaksi.getStatusPembayaran(), // Status pembayaran
            "Terima Kasih, Hati-hati di Jalan." // Pesan penutup
        );
    }

    // =====================================================================
    // Method Pendukung: Logika Kalkulasi Tarif Parkir
    // =====================================================================

    // Method hitungTarif untuk menghitung biaya rupiah parkir bertingkat
    public BigDecimal hitungTarif(int durasiMenit)
    {
        // Aturan 1: Jika durasi parkir tidak lebih dari 10 menit (Grace Period), maka:
        if (durasiMenit <= 10)
        {
            // Kembalikan tarif 0 rupiah (gratis)
            return BigDecimal.ZERO;
        }

        // Menghitung durasi jam dengan pembulatan ke atas (ceiling)
        int durasiJam = (int) Math.ceil(durasiMenit / 60.0);

        // Aturan 2: Jika durasi jam lebih dari 12 jam (rawat inap), maka:
        if (durasiJam > 12)
        {
            // Kembalikan tarif flat sebesar 10.000 rupiah
            return new BigDecimal("10000");
        }

        // Aturan 3: Jika durasi jam tidak lebih dari 8 jam pertama, maka:
        if (durasiJam <= 8)
        {
            // Kembalikan tarif flat sebesar 5.000 rupiah
            return new BigDecimal("5000");
        }
        else // Jika durasi jam lebih dari 8 jam dan tidak lebih dari 12 jam, maka:
        {
            // Menghitung kelebihan jam di atas 8 jam pertama
            int sisaJam = durasiJam - 8;
            // Menghitung total tarif: 5.000 ditambah 2.000 untuk setiap jam berikutnya
            int totalTarif = 5000 + (sisaJam * 2000);
            // Mengembalikan total tarif rupiah
            return new BigDecimal(String.valueOf(totalTarif));
        }
    }

    // Method bebaskanSlotParkir untuk mengosongkan slot dan menghapus asosiasi kendaraan
    public void bebaskanSlotParkir(TransaksiParkir transaksi) 
    {
        // Mengambil objek entitas SlotParkir dari transaksi
        SlotParkir slotTerkait = transaksi.getSlotDipilih();
        // Jika slot terkait tidak bernilai null, maka:
        if (slotTerkait != null) 
        {
            slotTerkait.setStatusSlot(StatusSlot.KOSONG); // Mengubah status slot menjadi KOSONG
            slotTerkait.setKendaraanAktif(null); // Menghapus referensi kendaraan aktif
            slotTerkait.setWaktuDipesan(null); // Menghapus timestamp pemesanan
            slotParkirRepository.save(slotTerkait); // Menyimpan pembaruan slot ke database
        }
    }
}
