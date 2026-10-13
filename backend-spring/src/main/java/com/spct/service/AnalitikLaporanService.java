package com.spct.service;

import com.spct.dto.DataDashboardDto;
import com.spct.dto.DataDashboardDto.DataOkupansiJamDto;
import com.spct.model.StatusResolusi;
import com.spct.model.StatusSlot;
import com.spct.repository.DataKendaraanRepository;
import com.spct.repository.LogOperasionalIoTRepository;
import com.spct.repository.SlotParkirRepository;
import com.spct.repository.TransaksiParkirRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;   // Mengimpor BigDecimal untuk operasi presisi pada total pendapatan
import java.time.LocalDate;    // Mengimpor LocalDate untuk menentukan awal/akhir hari ini
import java.time.LocalDateTime; // Mengimpor LocalDateTime untuk filter kueri berdasarkan rentang waktu
import java.time.LocalTime;    // Mengimpor LocalTime untuk menentukan jam awal/akhir hari
import java.time.format.DateTimeFormatter; // Mengimpor formatter untuk label jam di grafik
import java.util.ArrayList;    // Mengimpor ArrayList untuk menyusun data grafik
import java.util.List;         // Mengimpor List sebagai tipe kembalian data grafik

// Deklarasi Service: kelas yang berisi logika agregasi data untuk kebutuhan Dashboard Manajemen
// Sesuai pseudocode: menjalankan berbagai kueri SQL analitik dan menghitung Eco-Metrics CO2
@Service
public class AnalitikLaporanService // Kelas service yang mengumpulkan dan mengolah data laporan dari semua tabel
{
    // =====================================================================
    // Deklarasi Konstanta Eco-Metrics CO2
    // Berdasarkan penelitian: kendaraan idle menghasilkan ±175 gram CO2 per menit
    // Dengan sistem navigasi A*, rata-rata waktu pencarian parkir dihemat ±5 menit per kendaraan
    // =====================================================================

    private static final double EMISI_CO2_GRAM_PER_MENIT = 175.0; // Konstanta emisi idle kendaraan (gram CO2/menit)
    // Catatan: WAKTU_HEMAT_RATA_RATA_MENIT sudah TIDAK DIGUNAKAN.
    // Sejak pembaruan ini, waktu hemat diambil dari data RIIL sensor IoT (kolom menit_dihemat di tabel transaksi_parkir)
    // Setiap tembakan curl webhook sensor = data empiris yang sesungguhnya, bukan estimasi.


    // =====================================================================
    // Deklarasi Atribut Repository (diinject otomatis oleh Spring)
    // =====================================================================

    @Autowired
    private TransaksiParkirRepository transaksiParkirRepository; // Akses ke tabel transaksi (pendapatan & volume)

    @Autowired
    private LogOperasionalIoTRepository logOperasionalIoTRepository; // Akses ke tabel log (jumlah anomali)

    @Autowired
    private SlotParkirRepository slotParkirRepository; // Akses ke tabel slot (kapasitas real-time)

    @Autowired
    private DataKendaraanRepository dataKendaraanRepository; // Akses ke tabel kendaraan (volume total)

    @Autowired
    private com.spct.repository.SensorIoTRepository sensorIoTRepository; // Akses ke tabel sensor_iot (status & jumlah hardware)


    // =====================================================================
    // Method Utama: Mengumpulkan semua data metrik untuk Dashboard Manajemen
    // =====================================================================

    // Method yang dipanggil controller untuk mendapatkan snapshot lengkap data dashboard
    // Parameter: tanggalAwal dan tanggalAkhir menentukan rentang laporan (default = hari ini)
    public DataDashboardDto ambilDataDashboard(LocalDate tanggalAwal, LocalDate tanggalAkhir)
    {
        LocalDate hariIni = (tanggalAkhir != null) ? tanggalAkhir : LocalDate.now();

        // 1. Pendapatan Hari Ini (00:00:00 - 23:59:59)
        LocalDateTime awalHariIni = hariIni.atStartOfDay();
        LocalDateTime akhirHariIni = hariIni.atTime(LocalTime.MAX);
        BigDecimal pendapatanHariIni = transaksiParkirRepository
            .hitungTotalPendapatanDalamRentangWaktu(awalHariIni, akhirHariIni);
        if (pendapatanHariIni == null) { pendapatanHariIni = BigDecimal.ZERO; }

        // 2. Pendapatan Kemarin (untuk perbandingan persentase)
        LocalDateTime awalKemarin = awalHariIni.minusDays(1);
        LocalDateTime akhirKemarin = akhirHariIni.minusDays(1);
        BigDecimal pendapatanKemarin = transaksiParkirRepository
            .hitungTotalPendapatanDalamRentangWaktu(awalKemarin, akhirKemarin);
        if (pendapatanKemarin == null) { pendapatanKemarin = BigDecimal.ZERO; }

        Double persentasePendapatan = 0.0;
        if (pendapatanKemarin.compareTo(BigDecimal.ZERO) > 0) {
            persentasePendapatan = (pendapatanHariIni.doubleValue() - pendapatanKemarin.doubleValue()) / pendapatanKemarin.doubleValue() * 100.0;
        } else if (pendapatanHariIni.compareTo(BigDecimal.ZERO) > 0) {
            persentasePendapatan = 100.0;
        }

        // 3. Pendapatan Bulanan (Tanggal 1 s.d. tanggal hari ini di bulan berjalan)
        LocalDate awalBulanDate = LocalDate.of(hariIni.getYear(), hariIni.getMonth(), 1);
        LocalDateTime awalBulan = awalBulanDate.atStartOfDay();
        LocalDateTime akhirBulan = akhirHariIni; // Sampai jam akhir hari ini
        BigDecimal pendapatanBulanan = transaksiParkirRepository
            .hitungTotalPendapatanDalamRentangWaktu(awalBulan, akhirBulan);
        if (pendapatanBulanan == null) { pendapatanBulanan = BigDecimal.ZERO; }

        // --- Langkah 2: Agregasi Volume Kendaraan Keseluruhan (History) ---
        Long totalKendaraan = dataKendaraanRepository.count();

        // --- Langkah 3: Agregasi Jumlah Anomali ---
        Long totalAnomali = logOperasionalIoTRepository
            .countByStatusResolusi(StatusResolusi.BELUM_DITANGANI);

        // --- Langkah 4: Status Kapasitas Slot Real-Time ---
        Long slotKosong = (long) slotParkirRepository.findByStatusSlot(StatusSlot.KOSONG).size();
        Long slotTerisi = (long) slotParkirRepository.findByStatusSlot(StatusSlot.TERISI).size();

        // --- Langkah 5: Status Hardware Sensor IoT Riil ---
        Long totalSensor = sensorIoTRepository.count();
        Long totalSensorAktif = (long) sensorIoTRepository.findByStatusSensor("ON").size();

        // --- Langkah 6: Kalkulasi Eco-Metrics CO2 Real-Time ---
        Double totalMenitDihemat = transaksiParkirRepository.hitungTotalMenitDihematDariSensor();
        if (totalMenitDihemat == null) { totalMenitDihemat = 0.0; }

        double totalReduksiCo2Kg = Math.round((totalMenitDihemat * EMISI_CO2_GRAM_PER_MENIT / 1000.0) * 100.0) / 100.0;
        double persentaseCo2 = Math.min((totalReduksiCo2Kg / 2000.0) * 100.0, 100.0);

        // --- Langkah 7: Menyusun Data Grafik Okupansi Per Jam Hari Ini ---
        List<DataOkupansiJamDto> grafikOkupansi = susunGrafikOkupansiPerJam(awalHariIni, akhirHariIni);

        // --- Langkah 8: Menyusun Data Grafik Pertumbuhan Pendapatan Harian (Tgl 1 s.d. Hari Ini) ---
        List<DataDashboardDto.DataPendapatanHarianDto> grafikPendapatanHarian = susunGrafikPendapatanHarian(awalBulanDate, hariIni);

        // --- Langkah 9: Susun dan kembalikan DTO lengkap ke Controller ---
        return new DataDashboardDto(
            pendapatanHariIni,
            pendapatanBulanan,
            Math.round(persentasePendapatan * 10.0) / 10.0,
            totalKendaraan,
            totalAnomali,
            slotKosong,
            slotTerisi,
            totalSensor,
            totalSensorAktif,
            totalReduksiCo2Kg,
            Math.round(persentaseCo2 * 10.0) / 10.0,
            grafikOkupansi,
            grafikPendapatanHarian
        );
    }


    // =====================================================================
    // Method Pendukung: Menyusun Data Grafik Okupansi Per Jam
    // =====================================================================

    // Menghasilkan array titik data untuk grafik garis Chart.js
    // Setiap titik = jumlah kendaraan yang masuk pada jam tertentu
    private List<DataOkupansiJamDto> susunGrafikOkupansiPerJam(LocalDateTime awal, LocalDateTime akhir)
    {
        // Deklarasi List untuk menampung semua titik data grafik
        List<DataOkupansiJamDto> hasilGrafik = new ArrayList<>();

        // Formatter untuk label jam yang tampil di sumbu X grafik (misal: "08:00")
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:00");

        // LOOP: iterasi setiap jam dari jam awal hingga akhir periode
        LocalDateTime jamSaatIni = awal;
        while (!jamSaatIni.isAfter(akhir))
        {
            // Menentukan rentang satu jam saat ini (misal: 08:00 s.d. 08:59:59)
            LocalDateTime akhirJamIni = jamSaatIni.plusHours(1).minusSeconds(1);

            // Menghitung jumlah kendaraan yang masuk pada jam ini
            Long jumlahMasukJamIni = transaksiParkirRepository
                .countByWaktuMasukBetween(jamSaatIni, akhirJamIni);

            // Menambahkan titik data ke dalam list grafik
            hasilGrafik.add(new DataOkupansiJamDto(
                jamSaatIni.format(formatter), // Label jam untuk sumbu X (misal: "08:00")
                jumlahMasukJamIni             // Jumlah kendaraan sebagai nilai sumbu Y
            ));

            jamSaatIni = jamSaatIni.plusHours(1); // Maju satu jam ke iterasi berikutnya
        }

        return hasilGrafik; // Mengembalikan daftar lengkap titik data grafik
    }

    // =====================================================================
    // Method Pendukung: Menyusun Data Pertumbuhan Pendapatan Harian (Tgl 1 s.d. Hari Ini)
    // =====================================================================
    private List<DataDashboardDto.DataPendapatanHarianDto> susunGrafikPendapatanHarian(LocalDate awalBulan, LocalDate hariIni)
    {
        List<DataDashboardDto.DataPendapatanHarianDto> hasil = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM");

        LocalDate tgl = awalBulan;
        while (!tgl.isAfter(hariIni))
        {
            LocalDateTime awalHari = tgl.atStartOfDay();
            LocalDateTime akhirHari = tgl.atTime(LocalTime.MAX);

            BigDecimal pendapatanHari = transaksiParkirRepository
                .hitungTotalPendapatanDalamRentangWaktu(awalHari, akhirHari);
            if (pendapatanHari == null) { pendapatanHari = BigDecimal.ZERO; }

            hasil.add(new DataDashboardDto.DataPendapatanHarianDto(
                tgl.getDayOfMonth(),
                tgl.format(formatter),
                pendapatanHari
            ));

            tgl = tgl.plusDays(1);
        }

        return hasil;
    }
}
