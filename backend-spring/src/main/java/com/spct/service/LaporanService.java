package com.spct.service;

import com.spct.dto.LaporanResponseDto;
import com.spct.dto.LaporanResponseDto.*;
import com.spct.model.*;
import com.spct.repository.LogOperasionalIoTRepository;
import com.spct.repository.TransaksiParkirRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Service: LaporanService
 * Mengorkestrasi logika bisnis penarikan data historis, validasi parameter, kalkulasi metrik,
 * dan penyusunan pratinjau laporan sesuai spesifikasi use case PK-UC010 (Mengelola Laporan Operasional).
 */
@Service
public class LaporanService
{
    private static final double EMISI_CO2_GRAM_PER_MENIT = 175.0; // Emisi idle standar kendaraan (gram CO2/menit)
    private static final long STANDAR_WAKTU_NORMAL_DETIK = 300L;  // Estimasi 5 menit pencarian tanpa A*

    private static final DateTimeFormatter FORMAT_TANGGAL_WAKTU = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final NumberFormat FORMAT_RUPIAH = NumberFormat.getCurrencyInstance(new Locale("id", "ID"));

    static {
        FORMAT_RUPIAH.setMaximumFractionDigits(0);
    }

    @Autowired
    private TransaksiParkirRepository transaksiParkirRepository;

    @Autowired
    private LogOperasionalIoTRepository logOperasionalIoTRepository;

    // =====================================================================
    // Method Utama: Mengambil Pratinjau Laporan Sesuai Parameter
    // =====================================================================
    public LaporanResponseDto ambilPratinjauLaporan(String jenis, LocalDate dari, LocalDate sampai)
    {
        // 1. Validasi Parameter Input (Sesuai Step 4 & Alternate Course UC010)
        validasiParameter(dari, sampai);

        String jenisKecil = (jenis != null) ? jenis.trim().toLowerCase() : "finansial";
        LocalDateTime awal = dari.atStartOfDay();
        LocalDateTime akhir = sampai.atTime(LocalTime.MAX);
        LocalDateTime waktuGenerate = LocalDateTime.now();

        switch (jenisKecil)
        {
            case "finansial":
                return susunLaporanFinansial(dari, sampai, awal, akhir, waktuGenerate);
            case "operasional":
                return susunLaporanOperasional(dari, sampai, awal, akhir, waktuGenerate);
            case "lingkungan":
                return susunLaporanLingkungan(dari, sampai, awal, akhir, waktuGenerate);
            case "komprehensif":
                return susunLaporanKomprehensif(dari, sampai, awal, akhir, waktuGenerate);
            default:
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Jenis laporan tidak dikenal: '" + jenis + "'. Pilihan: finansial, operasional, lingkungan, komprehensif.");
        }
    }

    // =====================================================================
    // Logika Validasi Parameter Input
    // =====================================================================
    private void validasiParameter(LocalDate dari, LocalDate sampai)
    {
        if (dari == null || sampai == null)
        {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Tanggal mulai dan tanggal akhir wajib diisi.");
        }

        if (dari.isAfter(sampai))
        {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Tanggal mulai tidak boleh lebih besar dari tanggal akhir.");
        }

        if (dari.isAfter(LocalDate.now()))
        {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Tanggal mulai tidak boleh berada di masa depan.");
        }

        long selisihHari = ChronoUnit.DAYS.between(dari, sampai);
        if (selisihHari > 366)
        {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Rentang tanggal maksimal 366 hari (1 tahun).");
        }
    }

    // =====================================================================
    // 1. Penyusunan Laporan Finansial
    // =====================================================================
    private LaporanResponseDto susunLaporanFinansial(LocalDate dari, LocalDate sampai,
                                                    LocalDateTime awal, LocalDateTime akhir,
                                                    LocalDateTime waktuGenerate)
    {
        List<TransaksiParkir> list = transaksiParkirRepository.findTransaksiLunasDalamRentangWaktu(awal, akhir);

        BigDecimal totalPendapatan = transaksiParkirRepository.hitungTotalPendapatanDalamRentangWaktu(awal, akhir);
        if (totalPendapatan == null) { totalPendapatan = BigDecimal.ZERO; }

        Double rataDurasi = transaksiParkirRepository.hitungRataRataDurasiMenit(awal, akhir);
        if (rataDurasi == null) { rataDurasi = 0.0; }

        int totalTransaksi = list.size();
        BigDecimal rataTarif = (totalTransaksi > 0)
            ? totalPendapatan.divide(new BigDecimal(totalTransaksi), 0, RoundingMode.HALF_UP)
            : BigDecimal.ZERO;

        // Kartu Ringkasan
        List<KartuKpiDto> ringkasan = new ArrayList<>();
        ringkasan.add(new KartuKpiDto("Total Pendapatan", formatRupiah(totalPendapatan), "Rp", "eco-success"));
        ringkasan.add(new KartuKpiDto("Transaksi Lunas", String.format(Locale.US, "%,d", totalTransaksi), "Transaksi", "primary"));
        ringkasan.add(new KartuKpiDto("Rata-rata Durasi", formatMenitKeTeks(rataDurasi.intValue()), "", "secondary"));
        ringkasan.add(new KartuKpiDto("Rata-rata Tarif", formatRupiah(rataTarif), "Rp", "primary"));

        // Baris Tabel
        List<BarisFinansialDto> tabel = new ArrayList<>();
        int no = 1;
        for (TransaksiParkir t : list)
        {
            String nomorTiket = String.format("TKT-%05d", t.getIdTransaksi());
            String plat = (t.getKendaraan() != null) ? t.getKendaraan().getPlatNomor() : "-";
            String jenisKend = (t.getKendaraan() != null && t.getKendaraan().getJenisKendaraan() != null)
                ? t.getKendaraan().getJenisKendaraan().name() : "-";
            String masukStr = (t.getWaktuMasuk() != null) ? t.getWaktuMasuk().format(FORMAT_TANGGAL_WAKTU) : "-";
            String keluarStr = (t.getWaktuKeluar() != null) ? t.getWaktuKeluar().format(FORMAT_TANGGAL_WAKTU) : "-";
            int durasi = (t.getDurasiTotalMenit() != null) ? t.getDurasiTotalMenit() : 0;

            tabel.add(new BarisFinansialDto(
                no++,
                t.getIdTransaksi(),
                nomorTiket,
                plat,
                jenisKend,
                masukStr,
                keluarStr,
                durasi,
                formatMenitKeTeks(durasi),
                t.getNominalTagihan(),
                "Simulasi Kiosk", // Penanda transparan mode simulasi
                (t.getStatusPembayaran() != null) ? t.getStatusPembayaran().name() : "LUNAS",
                "-"
            ));
        }

        boolean kosong = list.isEmpty();
        String pesanStatus = kosong
            ? "Tidak ada data transaksi pembayaran lunas pada periode waktu yang dipilih."
            : "Laporan Finansial berhasil digenerate (" + totalTransaksi + " transaksi).";

        MetadataLaporanDto meta = new MetadataLaporanDto(
            "finansial",
            "Laporan Finansial",
            dari,
            sampai,
            waktuGenerate,
            totalTransaksi,
            true, // Mode simulasi aktif
            kosong,
            pesanStatus
        );

        return new LaporanResponseDto(meta, ringkasan, tabel, null, null);
    }

    // =====================================================================
    // 2. Penyusunan Laporan Operasional & Okupansi
    // =====================================================================
    private LaporanResponseDto susunLaporanOperasional(LocalDate dari, LocalDate sampai,
                                                      LocalDateTime awal, LocalDateTime akhir,
                                                      LocalDateTime waktuGenerate)
    {
        List<LogOperasionalIoT> logList = logOperasionalIoTRepository
            .findByWaktuKejadianBetweenOrderByWaktuKejadianDesc(awal, akhir);

        Long totalKendaraanMasuk = transaksiParkirRepository.countByWaktuMasukBetween(awal, akhir);
        if (totalKendaraanMasuk == null) { totalKendaraanMasuk = 0L; }

        Double rataDurasi = transaksiParkirRepository.hitungRataRataDurasiMenit(awal, akhir);
        if (rataDurasi == null) { rataDurasi = 0.0; }

        long anomaliKritis = logList.stream()
            .filter(l -> l.getTingkatKeparahan() == TingkatKeparahan.CRITICAL)
            .count();

        // Kartu Ringkasan
        List<KartuKpiDto> ringkasan = new ArrayList<>();
        ringkasan.add(new KartuKpiDto("Kendaraan Masuk", String.format(Locale.US, "%,d", totalKendaraanMasuk), "Kendaraan", "primary"));
        ringkasan.add(new KartuKpiDto("Rata-rata Durasi", formatMenitKeTeks(rataDurasi.intValue()), "", "secondary"));
        ringkasan.add(new KartuKpiDto("Total Log Tercatat", String.format(Locale.US, "%,d", logList.size()), "Log", "primary"));
        ringkasan.add(new KartuKpiDto("Anomali Kritis", String.valueOf(anomaliKritis), "Kasus", "alert-anomaly"));

        // Baris Tabel
        List<BarisOperasionalDto> tabel = new ArrayList<>();
        int no = 1;
        for (LogOperasionalIoT l : logList)
        {
            String idLogStr = String.format("LOG-%04d", l.getIdLog());
            String waktuStr = (l.getWaktuKejadian() != null) ? l.getWaktuKejadian().format(FORMAT_TANGGAL_WAKTU) : "-";
            String idSlot = (l.getSlotTerkait() != null) ? l.getSlotTerkait().getIdSlot() : "-";
            String jenisKej = (l.getJenisKejadian() != null) ? l.getJenisKejadian().name() : "-";
            String keparahan = (l.getTingkatKeparahan() != null) ? l.getTingkatKeparahan().name() : "-";
            String status = (l.getStatusResolusi() != null) ? l.getStatusResolusi().name() : "-";

            // Inisialisasi atribut jenisAnomaliStr dengan nilai dari entity log jika tersedia, atau tanda hubung jika null/kosong
            String jenisAnomaliStr = (l.getJenisAnomali() != null && !l.getJenisAnomali().trim().isEmpty())
                ? l.getJenisAnomali().trim()
                : "-";

            // Menambahkan baris baru ke list tabel operasional dengan memanggil konstruktor 9 parameter
            tabel.add(new BarisOperasionalDto(
                no++,              // Parameter nomor urut dengan increment 1
                idLogStr,          // Parameter format ID log
                waktuStr,          // Parameter teks waktu kejadian
                idSlot,            // Parameter ID slot parkir
                jenisKej,          // Parameter tipe event sistem
                jenisAnomaliStr,   // Parameter kategori jenis anomali dari validasi petugas
                l.getCatatanDetail(), // Parameter detail catatan kejadian
                keparahan,         // Parameter tingkat keparahan severity
                status             // Parameter status resolusi penanganan
            ));
        }

        boolean kosong = logList.isEmpty() && totalKendaraanMasuk == 0;
        String pesanStatus = kosong
            ? "Tidak ada rekaman operasional atau log anomali pada periode waktu yang dipilih."
            : "Laporan Operasional berhasil digenerate (" + logList.size() + " log kejadian).";

        MetadataLaporanDto meta = new MetadataLaporanDto(
            "operasional",
            "Laporan Operasional & Okupansi",
            dari,
            sampai,
            waktuGenerate,
            logList.size(),
            false,
            kosong,
            pesanStatus
        );

        return new LaporanResponseDto(meta, ringkasan, null, tabel, null);
    }

    // =====================================================================
    // 3. Penyusunan Laporan Lingkungan (Eco-Metric)
    // =====================================================================
    private LaporanResponseDto susunLaporanLingkungan(LocalDate dari, LocalDate sampai,
                                                     LocalDateTime awal, LocalDateTime akhir,
                                                     LocalDateTime waktuGenerate)
    {
        List<TransaksiParkir> ecoList = transaksiParkirRepository.findTransaksiLingkunganDalamRentangWaktu(awal, akhir);

        Double totalMenitDihemat = transaksiParkirRepository.hitungTotalMenitDihematDalamRentangWaktu(awal, akhir);
        if (totalMenitDihemat == null) { totalMenitDihemat = 0.0; }

        double totalReduksiCo2Kg = Math.round((totalMenitDihemat * EMISI_CO2_GRAM_PER_MENIT / 1000.0) * 100.0) / 100.0;
        int totalKendaraanNavigasi = ecoList.size();
        double rataHematMenit = (totalKendaraanNavigasi > 0)
            ? Math.round((totalMenitDihemat / totalKendaraanNavigasi) * 10.0) / 10.0
            : 0.0;

        // Kartu Ringkasan
        List<KartuKpiDto> ringkasan = new ArrayList<>();
        ringkasan.add(new KartuKpiDto("Reduksi Emisi CO2", String.format(Locale.US, "%.2f", totalReduksiCo2Kg) + " kg", "kg", "eco-success"));
        ringkasan.add(new KartuKpiDto("Total Waktu Dihemat", String.format(Locale.US, "%.1f", totalMenitDihemat) + " Menit", "Menit", "secondary"));
        ringkasan.add(new KartuKpiDto("Kendaraan Terpandu", String.valueOf(totalKendaraanNavigasi), "Unit", "primary"));
        ringkasan.add(new KartuKpiDto("Rata-rata Hemat/Mobil", String.format(Locale.US, "%.1f", rataHematMenit) + " Menit", "Menit", "eco-success"));

        // Baris Tabel
        List<BarisLingkunganDto> tabel = new ArrayList<>();
        int no = 1;
        for (TransaksiParkir t : ecoList)
        {
            String plat = (t.getKendaraan() != null) ? t.getKendaraan().getPlatNomor() : "-";
            String idSlot = (t.getSlotDipilih() != null) ? t.getSlotDipilih().getIdSlot() : "-";
            String masukStr = (t.getWaktuMasuk() != null) ? t.getWaktuMasuk().format(FORMAT_TANGGAL_WAKTU) : "-";
            String tibaStr = (t.getWaktuTibaSlot() != null) ? t.getWaktuTibaSlot().format(FORMAT_TANGGAL_WAKTU) : "-";

            long durasiTempuhDetik = 0;
            if (t.getWaktuMasuk() != null && t.getWaktuTibaSlot() != null)
            {
                durasiTempuhDetik = Math.max(0, Duration.between(t.getWaktuMasuk(), t.getWaktuTibaSlot()).toSeconds());
            }

            double menitHemat = (t.getMenitDihemat() != null) ? t.getMenitDihemat() : 0.0;
            double co2Gram = Math.round(menitHemat * EMISI_CO2_GRAM_PER_MENIT * 100.0) / 100.0;

            tabel.add(new BarisLingkunganDto(
                no++,
                plat,
                idSlot,
                masukStr,
                tibaStr,
                durasiTempuhDetik,
                STANDAR_WAKTU_NORMAL_DETIK,
                Math.round(menitHemat * 100.0) / 100.0,
                co2Gram
            ));
        }

        boolean kosong = ecoList.isEmpty();
        String pesanStatus = kosong
            ? "Tidak ada data riwayat navigasi sensor untuk kalkulasi eco-metric pada periode waktu yang dipilih."
            : "Laporan Lingkungan berhasil digenerate (" + totalKendaraanNavigasi + " sesi navigasi).";

        MetadataLaporanDto meta = new MetadataLaporanDto(
            "lingkungan",
            "Laporan Lingkungan (Eco-Metric)",
            dari,
            sampai,
            waktuGenerate,
            totalKendaraanNavigasi,
            false,
            kosong,
            pesanStatus
        );

        return new LaporanResponseDto(meta, ringkasan, null, null, tabel);
    }

    // =====================================================================
    // 4. Penyusunan Laporan Komprehensif (Semua Modul)
    // =====================================================================
    private LaporanResponseDto susunLaporanKomprehensif(LocalDate dari, LocalDate sampai,
                                                       LocalDateTime awal, LocalDateTime akhir,
                                                       LocalDateTime waktuGenerate)
    {
        LaporanResponseDto fin = susunLaporanFinansial(dari, sampai, awal, akhir, waktuGenerate);
        LaporanResponseDto ops = susunLaporanOperasional(dari, sampai, awal, akhir, waktuGenerate);
        LaporanResponseDto eco = susunLaporanLingkungan(dari, sampai, awal, akhir, waktuGenerate);

        // Gabungan Kartu Ringkasan (Pilihan metrik kunci dari masing-masing jenis)
        List<KartuKpiDto> ringkasanGabungan = new ArrayList<>();
        if (!fin.getRingkasan().isEmpty()) { ringkasanGabungan.add(fin.getRingkasan().get(0)); } // Total Pendapatan
        if (!ops.getRingkasan().isEmpty()) { ringkasanGabungan.add(ops.getRingkasan().get(0)); } // Kendaraan Masuk
        if (!eco.getRingkasan().isEmpty()) { ringkasanGabungan.add(eco.getRingkasan().get(0)); } // Reduksi CO2
        if (!ops.getRingkasan().isEmpty()) { ringkasanGabungan.add(ops.getRingkasan().get(3)); } // Anomali Kritis

        int totalBaris = fin.getTabelFinansial().size() + ops.getTabelOperasional().size() + eco.getTabelLingkungan().size();
        boolean kosong = fin.getMetadata().isKosong() && ops.getMetadata().isKosong() && eco.getMetadata().isKosong();
        String pesanStatus = kosong
            ? "Tidak ada riwayat aktivitas parkir pada periode waktu yang dipilih."
            : "Laporan Komprehensif berhasil digenerate (Finansial, Operasional, Lingkungan).";

        MetadataLaporanDto meta = new MetadataLaporanDto(
            "komprehensif",
            "Laporan Komprehensif (Master)",
            dari,
            sampai,
            waktuGenerate,
            totalBaris,
            true, // Termasuk data finansial simulasi
            kosong,
            pesanStatus
        );

        return new LaporanResponseDto(
            meta,
            ringkasanGabungan,
            fin.getTabelFinansial(),
            ops.getTabelOperasional(),
            eco.getTabelLingkungan()
        );
    }

    // =====================================================================
    // Helper Formatters
    // =====================================================================
    private String formatRupiah(BigDecimal nilai)
    {
        if (nilai == null) { return "Rp 0"; }
        return FORMAT_RUPIAH.format(nilai).replace(",00", "");
    }

    private String formatMenitKeTeks(int totalMenit)
    {
        if (totalMenit <= 0) { return "0 Menit"; }
        int jam = totalMenit / 60;
        int sisaMenit = totalMenit % 60;
        if (jam > 0 && sisaMenit > 0)
        {
            return jam + "j " + sisaMenit + "m";
        }
        else if (jam > 0)
        {
            return jam + " Jam";
        }
        else
        {
            return sisaMenit + " Menit";
        }
    }
}
