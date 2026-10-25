package com.spct.service; // Nama package dari modul layanan logika bisnis sistem

// Import DTO LaporanResponseDto dari package dto
import com.spct.dto.LaporanResponseDto;
// Import kelas-kelas inner DTO laporan
import com.spct.dto.LaporanResponseDto.*;
// Import entitas dan enum dari package model
import com.spct.model.*;
// Import repositori LogOperasionalIoTRepository dari package repository
import com.spct.repository.LogOperasionalIoTRepository;
// Import repositori TransaksiParkirRepository dari package repository
import com.spct.repository.TransaksiParkirRepository;
// Import anotasi Autowired dari Spring Framework
import org.springframework.beans.factory.annotation.Autowired;
// Import enum HttpStatus dari Spring HTTP
import org.springframework.http.HttpStatus;
// Import anotasi Service dari Spring Framework
import org.springframework.stereotype.Service;
// Import kelas ResponseStatusException untuk exception HTTP REST
import org.springframework.web.server.ResponseStatusException;

// Import tipe data BigDecimal untuk nominal tarif rupiah
import java.math.BigDecimal;
// Import RoundingMode untuk pembulatan angka
import java.math.RoundingMode;
// Import NumberFormat untuk format mata uang lokal
import java.text.NumberFormat;
// Import tipe data Duration untuk kalkulasi waktu
import java.time.Duration;
// Import tipe data tanggal lokal java
import java.time.LocalDate;
// Import tipe data waktu LocalDateTime java
import java.time.LocalDateTime;
// Import tipe data waktu LocalTime java
import java.time.LocalTime;
// Import DateTimeFormatter untuk format string tanggal dan waktu
import java.time.format.DateTimeFormatter;
// Import ChronoUnit untuk selisih hari
import java.time.temporal.ChronoUnit;
// Import koleksi ArrayList dari java util
import java.util.ArrayList;
// Import koleksi List dari java util
import java.util.List;
// Import Locale untuk lokalisasi bahasa Indonesia
import java.util.Locale;

// Kelas layanan publik java LaporanService untuk menghasilkan pratinjau dokumen laporan finansial, operasional, lingkungan, dan komprehensif
@Service // Menandai kelas ini sebagai Spring Service Bean
public class LaporanService
{
    // Konstanta tingkat emisi gas buang idle kendaraan sebesar 175.0 gram CO2 per menit
    private static final double EMISI_CO2_GRAM_PER_MENIT = 175.0;
    // Konstanta standar waktu normal pencarian parkir tanpa navigasi sistem selama 300 detik (5 menit)
    private static final long STANDAR_WAKTU_NORMAL_DETIK = 300L;

    // Formatter format penulisan tanggal dan jam standar ISO
    private static final DateTimeFormatter FORMAT_TANGGAL_WAKTU = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    // Formatter mata uang Rupiah Indonesia (IDR)
    private static final NumberFormat FORMAT_RUPIAH = NumberFormat.getCurrencyInstance(new Locale("id", "ID"));

    // Blok static initializer untuk memformat tampilan desimal mata uang tanpa koma sen
    static 
    {
        FORMAT_RUPIAH.setMaximumFractionDigits(0);
    }

    // Injeksi otomatis dependensi TransaksiParkirRepository
    @Autowired
    private TransaksiParkirRepository transaksiParkirRepository; // Deklarasi atribut transaksiParkirRepository

    // Injeksi otomatis dependensi LogOperasionalIoTRepository
    @Autowired
    private LogOperasionalIoTRepository logOperasionalIoTRepository; // Deklarasi atribut logOperasionalIoTRepository

    // =====================================================================
    // Method Utama: Mengambil Pratinjau Laporan Sesuai Parameter
    // =====================================================================

    // Method ambilPratinjauLaporan untuk menyusun data pratinjau laporan sesuai tipe modul yang diminta
    public LaporanResponseDto ambilPratinjauLaporan(String jenis, LocalDate dari, LocalDate sampai)
    {
        // Melakukan validasi parameter rentang tanggal input
        validasiParameter(dari, sampai);

        // Menstandarisasi string jenis laporan menjadi huruf kecil
        String jenisKecil = (jenis != null) ? jenis.trim().toLowerCase() : "finansial";
        // Menentukan awal rentang waktu (00:00:00)
        LocalDateTime awal = dari.atStartOfDay();
        // Menentukan akhir rentang waktu (23:59:59)
        LocalDateTime akhir = sampai.atTime(LocalTime.MAX);
        // Mencatat timestamp presisi pembuatan berkas laporan
        LocalDateTime waktuGenerate = LocalDateTime.now();

        // Branching pemilihan penyusunan laporan berdasarkan tipe modul
        switch (jenisKecil)
        {
            // Jika jenis finansial, susun laporan keuangan parkir
            case "finansial":
                return susunLaporanFinansial(dari, sampai, awal, akhir, waktuGenerate);
            // Jika jenis operasional, susun laporan okupansi dan anomali
            case "operasional":
                return susunLaporanOperasional(dari, sampai, awal, akhir, waktuGenerate);
            // Jika jenis lingkungan, susun laporan reduksi gas karbon CO2
            case "lingkungan":
                return susunLaporanLingkungan(dari, sampai, awal, akhir, waktuGenerate);
            // Jika jenis komprehensif, susun master laporan gabungan
            case "komprehensif":
                return susunLaporanKomprehensif(dari, sampai, awal, akhir, waktuGenerate);
            // Jika jenis tidak dikenal, lemparkan exception HTTP 400 Bad Request
            default:
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Jenis laporan tidak dikenal: '" + jenis + "'. Pilihan: finansial, operasional, lingkungan, komprehensif.");
        }
    }

    // =====================================================================
    // Logika Validasi Parameter Input
    // =====================================================================

    // Method validasiParameter untuk memastikan rentang tanggal logis dan valid
    private void validasiParameter(LocalDate dari, LocalDate sampai)
    {
        // Jika salah satu tanggal kosong, lemparkan pesan error
        if (dari == null || sampai == null)
        {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Tanggal mulai dan tanggal akhir wajib diisi.");
        }

        // Jika tanggal mulai lebih besar dari tanggal akhir, lemparkan error
        if (dari.isAfter(sampai))
        {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Tanggal mulai tidak boleh lebih besar dari tanggal akhir.");
        }

        // Jika tanggal mulai di masa depan, lemparkan error
        if (dari.isAfter(LocalDate.now()))
        {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Tanggal mulai tidak boleh berada di masa depan.");
        }

        // Menghitung selisih hari rentang tanggal
        long selisihHari = ChronoUnit.DAYS.between(dari, sampai);
        // Jika rentang melebihi 366 hari (1 tahun), lemparkan error
        if (selisihHari > 366)
        {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Rentang tanggal maksimal 366 hari (1 tahun).");
        }
    }

    // =====================================================================
    // 1. Penyusunan Laporan Finansial
    // =====================================================================

    // Method susunLaporanFinansial untuk menyusun data pendapatan dan transaksi pembayaran
    private LaporanResponseDto susunLaporanFinansial(LocalDate dari, LocalDate sampai,
                                                    LocalDateTime awal, LocalDateTime akhir,
                                                    LocalDateTime waktuGenerate)
    {
        // Mengambil daftar transaksi parkir berstatus LUNAS dalam rentang waktu
        List<TransaksiParkir> list = transaksiParkirRepository.findTransaksiLunasDalamRentangWaktu(awal, akhir);

        // Menghitung total perolehan rupiah pendapatan parkir
        BigDecimal totalPendapatan = transaksiParkirRepository.hitungTotalPendapatanDalamRentangWaktu(awal, akhir);
        if (totalPendapatan == null) { totalPendapatan = BigDecimal.ZERO; }

        // Menghitung rata-rata lama parkir dalam menit
        Double rataDurasi = transaksiParkirRepository.hitungRataRataDurasiMenit(awal, akhir);
        if (rataDurasi == null) { rataDurasi = 0.0; }

        // Mengambil total kuantitas transaksi lunas
        int totalTransaksi = list.size();
        // Menghitung rata-rata tarif rupiah per transaksi
        BigDecimal rataTarif = (totalTransaksi > 0)
            ? totalPendapatan.divide(new BigDecimal(totalTransaksi), 0, RoundingMode.HALF_UP)
            : BigDecimal.ZERO;

        // Instansiasi list kartu ringkasan KPI finansial
        List<KartuKpiDto> ringkasan = new ArrayList<>();
        ringkasan.add(new KartuKpiDto("Total Pendapatan", formatRupiah(totalPendapatan), "Rp", "eco-success"));
        ringkasan.add(new KartuKpiDto("Transaksi Lunas", String.format(Locale.US, "%,d", totalTransaksi), "Transaksi", "primary"));
        ringkasan.add(new KartuKpiDto("Rata-rata Durasi", formatMenitKeTeks(rataDurasi.intValue()), "", "secondary"));
        ringkasan.add(new KartuKpiDto("Rata-rata Tarif", formatRupiah(rataTarif), "Rp", "primary"));

        // Instansiasi list baris data tabel finansial
        List<BarisFinansialDto> tabel = new ArrayList<>();
        // Inisialisasi nomor urut baris tabel dimulai dari 1
        int no = 1;
        // Perulangan untuk setiap transaksi parkir dalam daftar list:
        for (TransaksiParkir t : list)
        {
            String nomorTiket = String.format("TKT-%05d", t.getIdTransaksi()); // Nomor tiket
            String plat = (t.getKendaraan() != null) ? t.getKendaraan().getPlatNomor() : "-"; // Nomor plat
            String jenisKend = (t.getKendaraan() != null && t.getKendaraan().getJenisKendaraan() != null)
                ? t.getKendaraan().getJenisKendaraan().name() : "-"; // Jenis kendaraan
            String masukStr = (t.getWaktuMasuk() != null) ? t.getWaktuMasuk().format(FORMAT_TANGGAL_WAKTU) : "-"; // Waktu masuk
            String keluarStr = (t.getWaktuKeluar() != null) ? t.getWaktuKeluar().format(FORMAT_TANGGAL_WAKTU) : "-"; // Waktu keluar
            int durasi = (t.getDurasiTotalMenit() != null) ? t.getDurasiTotalMenit() : 0; // Durasi menit

            // Menambahkan baris DTO finansial baru ke dalam tabel
            tabel.add(new BarisFinansialDto(
                no++, // Nomor urut
                t.getIdTransaksi(), // ID transaksi
                nomorTiket, // Nomor tiket
                plat, // Plat nomor
                jenisKend, // Kategori jenis kendaraan
                masukStr, // Teks waktu masuk
                keluarStr, // Teks waktu keluar
                durasi, // Durasi menit
                formatMenitKeTeks(durasi), // Teks durasi
                t.getNominalTagihan(), // Nominal tagihan
                "Simulasi Kiosk", // Kanal pembayaran
                (t.getStatusPembayaran() != null) ? t.getStatusPembayaran().name() : "LUNAS", // Status pembayaran
                "-" // Referensi gateway
            ));
        }

        // Memeriksa apakah data transaksi kosong
        boolean kosong = list.isEmpty();
        // Menentukan pesan deskripsi status laporan
        String pesanStatus = kosong
            ? "Tidak ada data transaksi pembayaran lunas pada periode waktu yang dipilih."
            : "Laporan Finansial berhasil digenerate (" + totalTransaksi + " transaksi).";

        // Instansiasi metadata laporan finansial
        MetadataLaporanDto meta = new MetadataLaporanDto(
            "finansial", // Jenis modul
            "Laporan Finansial", // Judul dokumen
            dari, // Periode awal
            sampai, // Periode akhir
            waktuGenerate, // Timestamp cetak
            totalTransaksi, // Kuantitas baris data
            true, // Status mode simulasi
            kosong, // Status kekosongan data
            pesanStatus // Pesan keterangan
        );

        // Mengembalikan objek DTO laporan finansial lengkap
        return new LaporanResponseDto(meta, ringkasan, tabel, null, null);
    }

    // =====================================================================
    // 2. Penyusunan Laporan Operasional & Okupansi
    // =====================================================================

    // Method susunLaporanOperasional untuk menyusun rekaman kejadian sensor dan penanganan anomali
    private LaporanResponseDto susunLaporanOperasional(LocalDate dari, LocalDate sampai,
                                                      LocalDateTime awal, LocalDateTime akhir,
                                                      LocalDateTime waktuGenerate)
    {
        // Mengambil daftar log operasional IoT dalam rentang tanggal terurut waktu menurun
        List<LogOperasionalIoT> logList = logOperasionalIoTRepository
            .findByWaktuKejadianBetweenOrderByWaktuKejadianDesc(awal, akhir);

        // Menghitung volume kendaraan masuk dalam rentang waktu
        Long totalKendaraanMasuk = transaksiParkirRepository.countByWaktuMasukBetween(awal, akhir);
        if (totalKendaraanMasuk == null) { totalKendaraanMasuk = 0L; }

        // Menghitung rata-rata durasi parkir
        Double rataDurasi = transaksiParkirRepository.hitungRataRataDurasiMenit(awal, akhir);
        if (rataDurasi == null) { rataDurasi = 0.0; }

        // Menghitung jumlah anomali kritis berderajat CRITICAL
        long anomaliKritis = logList.stream()
            .filter(l -> l.getTingkatKeparahan() == TingkatKeparahan.CRITICAL)
            .count();

        // Instansiasi list kartu KPI ringkasan operasional
        List<KartuKpiDto> ringkasan = new ArrayList<>();
        ringkasan.add(new KartuKpiDto("Kendaraan Masuk", String.format(Locale.US, "%,d", totalKendaraanMasuk), "Kendaraan", "primary"));
        ringkasan.add(new KartuKpiDto("Rata-rata Durasi", formatMenitKeTeks(rataDurasi.intValue()), "", "secondary"));
        ringkasan.add(new KartuKpiDto("Total Log Tercatat", String.format(Locale.US, "%,d", logList.size()), "Log", "primary"));
        ringkasan.add(new KartuKpiDto("Anomali Kritis", String.valueOf(anomaliKritis), "Kasus", "alert-anomaly"));

        // Instansiasi list baris tabel operasional
        List<BarisOperasionalDto> tabel = new ArrayList<>();
        // Inisialisasi nomor urut dimulai dari 1
        int no = 1;
        // Perulangan untuk setiap rekaman log operasional:
        for (LogOperasionalIoT l : logList)
        {
            String idLogStr = String.format("LOG-%04d", l.getIdLog()); // Format ID log
            String waktuStr = (l.getWaktuKejadian() != null) ? l.getWaktuKejadian().format(FORMAT_TANGGAL_WAKTU) : "-"; // Waktu kejadian
            String idSlot = (l.getSlotTerkait() != null) ? l.getSlotTerkait().getIdSlot() : "-"; // Slot parkir
            String jenisKej = (l.getJenisKejadian() != null) ? l.getJenisKejadian().name() : "-"; // Kategori event
            String keparahan = (l.getTingkatKeparahan() != null) ? l.getTingkatKeparahan().name() : "-"; // Level keparahan
            String status = (l.getStatusResolusi() != null) ? l.getStatusResolusi().name() : "-"; // Status validasi

            // Menentukan klasifikasi anomali dari petugas
            String jenisAnomaliStr = (l.getJenisAnomali() != null && !l.getJenisAnomali().trim().isEmpty())
                ? l.getJenisAnomali().trim()
                : "-";

            // Menambahkan baris data operasional ke dalam list tabel
            tabel.add(new BarisOperasionalDto(
                no++, // Nomor urut
                idLogStr, // ID log
                waktuStr, // Waktu kejadian
                idSlot, // Nomor slot
                jenisKej, // Jenis kejadian
                jenisAnomaliStr, // Kategori anomali petugas
                l.getCatatanDetail(), // Catatan detail
                keparahan, // Tingkat keparahan
                status // Status resolusi
            ));
        }

        // Memeriksa kekosongan data operasional
        boolean kosong = logList.isEmpty() && totalKendaraanMasuk == 0;
        // Menentukan pesan deskripsi status laporan operasional
        String pesanStatus = kosong
            ? "Tidak ada rekaman operasional atau log anomali pada periode waktu yang dipilih."
            : "Laporan Operasional berhasil digenerate (" + logList.size() + " log kejadian).";

        // Instansiasi metadata laporan operasional
        MetadataLaporanDto meta = new MetadataLaporanDto(
            "operasional", // Jenis modul
            "Laporan Operasional & Okupansi", // Judul dokumen
            dari, // Tanggal awal
            sampai, // Tanggal akhir
            waktuGenerate, // Timestamp cetak
            logList.size(), // Jumlah rekaman
            false, // Status simulasi
            kosong, // Status kekosongan data
            pesanStatus // Pesan status
        );

        // Mengembalikan objek DTO laporan operasional lengkap
        return new LaporanResponseDto(meta, ringkasan, null, tabel, null);
    }

    // =====================================================================
    // 3. Penyusunan Laporan Lingkungan (Eco-Metric)
    // =====================================================================

    // Method susunLaporanLingkungan untuk menyusun rekaman efisiensi rute dan reduksi emisi karbon
    private LaporanResponseDto susunLaporanLingkungan(LocalDate dari, LocalDate sampai,
                                                     LocalDateTime awal, LocalDateTime akhir,
                                                     LocalDateTime waktuGenerate)
    {
        // Mengambil daftar transaksi yang memiliki data kedatangan navigasi sensor
        List<TransaksiParkir> ecoList = transaksiParkirRepository.findTransaksiLingkunganDalamRentangWaktu(awal, akhir);

        // Menghitung akumulasi menit yang dihemat dalam rentang waktu
        Double totalMenitDihemat = transaksiParkirRepository.hitungTotalMenitDihematDalamRentangWaktu(awal, akhir);
        if (totalMenitDihemat == null) { totalMenitDihemat = 0.0; }

        // Menghitung total pengurangan emisi gas buang CO2 dalam kilogram
        double totalReduksiCo2Kg = Math.round((totalMenitDihemat * EMISI_CO2_GRAM_PER_MENIT / 1000.0) * 100.0) / 100.0;
        // Mengambil jumlah kendaraan yang terpandu navigasi
        int totalKendaraanNavigasi = ecoList.size();
        // Menghitung rata-rata waktu yang dihemat per kendaraan dalam menit
        double rataHematMenit = (totalKendaraanNavigasi > 0)
            ? Math.round((totalMenitDihemat / totalKendaraanNavigasi) * 10.0) / 10.0
            : 0.0;

        // Instansiasi list kartu KPI metrik lingkungan
        List<KartuKpiDto> ringkasan = new ArrayList<>();
        ringkasan.add(new KartuKpiDto("Reduksi Emisi CO2", String.format(Locale.US, "%.2f", totalReduksiCo2Kg) + " kg", "kg", "eco-success"));
        ringkasan.add(new KartuKpiDto("Total Waktu Dihemat", String.format(Locale.US, "%.1f", totalMenitDihemat) + " Menit", "Menit", "secondary"));
        ringkasan.add(new KartuKpiDto("Kendaraan Terpandu", String.valueOf(totalKendaraanNavigasi), "Unit", "primary"));
        ringkasan.add(new KartuKpiDto("Rata-rata Hemat/Mobil", String.format(Locale.US, "%.1f", rataHematMenit) + " Menit", "Menit", "eco-success"));

        // Instansiasi list baris tabel laporan lingkungan
        List<BarisLingkunganDto> tabel = new ArrayList<>();
        // Inisialisasi nomor urut dimulai dari 1
        int no = 1;
        // Perulangan untuk setiap transaksi navigasi lingkungan:
        for (TransaksiParkir t : ecoList)
        {
            String plat = (t.getKendaraan() != null) ? t.getKendaraan().getPlatNomor() : "-"; // Nomor plat
            String idSlot = (t.getSlotDipilih() != null) ? t.getSlotDipilih().getIdSlot() : "-"; // Nomor slot
            String masukStr = (t.getWaktuMasuk() != null) ? t.getWaktuMasuk().format(FORMAT_TANGGAL_WAKTU) : "-"; // Waktu masuk
            String tibaStr = (t.getWaktuTibaSlot() != null) ? t.getWaktuTibaSlot().format(FORMAT_TANGGAL_WAKTU) : "-"; // Waktu tiba di slot

            // Menghitung lama durasi tempuh fisik kendaraan dalam detik
            long durasiTempuhDetik = 0;
            if (t.getWaktuMasuk() != null && t.getWaktuTibaSlot() != null)
            {
                durasiTempuhDetik = Math.max(0, Duration.between(t.getWaktuMasuk(), t.getWaktuTibaSlot()).toSeconds());
            }

            // Mengambil data menit dihemat dari transaksi
            double menitHemat = (t.getMenitDihemat() != null) ? t.getMenitDihemat() : 0.0;
            // Menghitung reduksi gas emisi CO2 dalam satuan gram
            double co2Gram = Math.round(menitHemat * EMISI_CO2_GRAM_PER_MENIT * 100.0) / 100.0;

            // Menambahkan baris rekaman metrik lingkungan ke list tabel
            tabel.add(new BarisLingkunganDto(
                no++, // Nomor urut
                plat, // Plat nomor
                idSlot, // Kode slot
                masukStr, // Teks jam masuk
                tibaStr, // Teks jam tiba di slot
                durasiTempuhDetik, // Durasi nyata tempuh dalam detik
                STANDAR_WAKTU_NORMAL_DETIK, // Baseline normal 300 detik
                Math.round(menitHemat * 100.0) / 100.0, // Menit dihemat
                co2Gram // Reduksi karbon dalam gram
            ));
        }

        // Memeriksa kekosongan data navigasi lingkungan
        boolean kosong = ecoList.isEmpty();
        // Menentukan teks pesan status
        String pesanStatus = kosong
            ? "Tidak ada data riwayat navigasi sensor untuk kalkulasi eco-metric pada periode waktu yang dipilih."
            : "Laporan Lingkungan berhasil digenerate (" + totalKendaraanNavigasi + " sesi navigasi).";

        // Instansiasi metadata laporan lingkungan
        MetadataLaporanDto meta = new MetadataLaporanDto(
            "lingkungan", // Jenis modul
            "Laporan Lingkungan (Eco-Metric)", // Judul dokumen
            dari, // Periode awal
            sampai, // Periode akhir
            waktuGenerate, // Timestamp cetak
            totalKendaraanNavigasi, // Jumlah sesi navigasi
            false, // Status mode simulasi
            kosong, // Status kekosongan data
            pesanStatus // Pesan status
        );

        // Mengembalikan objek DTO laporan lingkungan lengkap
        return new LaporanResponseDto(meta, ringkasan, null, null, tabel);
    }

    // =====================================================================
    // 4. Penyusunan Laporan Komprehensif (Semua Modul)
    // =====================================================================

    // Method susunLaporanKomprehensif untuk menggabungkan seluruh modul laporan ke dalam satu dokumen master terpadu
    private LaporanResponseDto susunLaporanKomprehensif(LocalDate dari, LocalDate sampai,
                                                       LocalDateTime awal, LocalDateTime akhir,
                                                       LocalDateTime waktuGenerate)
    {
        // Menyusun modul laporan finansial
        LaporanResponseDto fin = susunLaporanFinansial(dari, sampai, awal, akhir, waktuGenerate);
        // Menyusun modul laporan operasional
        LaporanResponseDto ops = susunLaporanOperasional(dari, sampai, awal, akhir, waktuGenerate);
        // Menyusun modul laporan lingkungan
        LaporanResponseDto eco = susunLaporanLingkungan(dari, sampai, awal, akhir, waktuGenerate);

        // Menggabungkan kartu ringkasan KPI unggulan dari setiap modul
        List<KartuKpiDto> ringkasanGabungan = new ArrayList<>();
        if (!fin.getRingkasan().isEmpty()) { ringkasanGabungan.add(fin.getRingkasan().get(0)); } // Total Pendapatan
        if (!ops.getRingkasan().isEmpty()) { ringkasanGabungan.add(ops.getRingkasan().get(0)); } // Kendaraan Masuk
        if (!eco.getRingkasan().isEmpty()) { ringkasanGabungan.add(eco.getRingkasan().get(0)); } // Reduksi CO2
        if (!ops.getRingkasan().isEmpty()) { ringkasanGabungan.add(ops.getRingkasan().get(3)); } // Anomali Kritis

        // Menghitung akumulasi seluruh baris rekaman data dari ketiga tabel
        int totalBaris = fin.getTabelFinansial().size() + ops.getTabelOperasional().size() + eco.getTabelLingkungan().size();
        // Memeriksa status kekosongan dari ketiga modul
        boolean kosong = fin.getMetadata().isKosong() && ops.getMetadata().isKosong() && eco.getMetadata().isKosong();
        // Menentukan pesan status laporan komprehensif
        String pesanStatus = kosong
            ? "Tidak ada riwayat aktivitas parkir pada periode waktu yang dipilih."
            : "Laporan Komprehensif berhasil digenerate (Finansial, Operasional, Lingkungan).";

        // Instansiasi metadata master laporan komprehensif
        MetadataLaporanDto meta = new MetadataLaporanDto(
            "komprehensif", // Jenis modul
            "Laporan Komprehensif (Master)", // Judul dokumen resmi
            dari, // Tanggal awal
            sampai, // Tanggal akhir
            waktuGenerate, // Timestamp cetak
            totalBaris, // Akumulasi total baris
            true, // Termasuk transaksi finansial
            kosong, // Status kekosongan
            pesanStatus // Pesan status
        );

        // Mengembalikan objek DTO laporan komprehensif terpadu
        return new LaporanResponseDto(
            meta, // Metadata master
            ringkasanGabungan, // Kartu ringkasan gabungan
            fin.getTabelFinansial(), // Rekaman tabel finansial
            ops.getTabelOperasional(), // Rekaman tabel operasional
            eco.getTabelLingkungan() // Rekaman tabel lingkungan
        );
    }

    // =====================================================================
    // Helper Formatters
    // =====================================================================

    // Method formatRupiah untuk mengubah nilai angka BigDecimal menjadi representasi string mata uang Rupiah
    private String formatRupiah(BigDecimal nilai)
    {
        // Jika nilai null, kembalikan teks Rp 0
        if (nilai == null) { return "Rp 0"; }
        // Format angka dan bersihkan desimal koma nol nol di belakang
        return FORMAT_RUPIAH.format(nilai).replace(",00", "");
    }

    // Method formatMenitKeTeks untuk mengubah total menit menjadi teks ramah pengguna (jam dan menit)
    private String formatMenitKeTeks(int totalMenit)
    {
        // Jika menit tidak lebih dari 0, kembalikan 0 Menit
        if (totalMenit <= 0) { return "0 Menit"; }
        // Menghitung jumlah jam
        int jam = totalMenit / 60;
        // Menghitung sisa menit
        int sisaMenit = totalMenit % 60;
        // Jika terdapat jam dan sisa menit, gabungkan keduanya
        if (jam > 0 && sisaMenit > 0)
        {
            return jam + "j " + sisaMenit + "m";
        }
        // Jika hanya jam genap
        else if (jam > 0)
        {
            return jam + " Jam";
        }
        // Jika hanya menit
        else
        {
            return sisaMenit + " Menit";
        }
    }
}
