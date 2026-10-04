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
    private static final double WAKTU_HEMAT_RATA_RATA_MENIT = 5.0; // Estimasi rata-rata menit yang dihemat per kendaraan


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


    // =====================================================================
    // Method Utama: Mengumpulkan semua data metrik untuk Dashboard Manajemen
    // =====================================================================

    // Method yang dipanggil controller untuk mendapatkan snapshot lengkap data dashboard
    // Parameter: tanggalAwal dan tanggalAkhir menentukan rentang laporan (default = hari ini)
    public DataDashboardDto ambilDataDashboard(LocalDate tanggalAwal, LocalDate tanggalAkhir)
    {
        // Konversi tanggal ke LocalDateTime dengan jam awal dan akhir hari
        LocalDateTime awalPeriode = tanggalAwal.atStartOfDay();                     // Misal: 2026-10-01 00:00:00
        LocalDateTime akhirPeriode = tanggalAkhir.atTime(LocalTime.MAX);            // Misal: 2026-10-01 23:59:59

        // --- Langkah 1: Agregasi Total Pendapatan ---
        // Memanggil kueri SUM dari TransaksiParkirRepository
        BigDecimal pendapatanTotal = transaksiParkirRepository
            .hitungTotalPendapatanDalamRentangWaktu(awalPeriode, akhirPeriode);
        if (pendapatanTotal == null) { pendapatanTotal = BigDecimal.ZERO; }

        // Hitung pendapatan kemarin untuk persentase (Bulan ini vs Bulan lalu / Kemarin vs Hari ini)
        LocalDateTime awalKemarin = awalPeriode.minusDays(1);
        LocalDateTime akhirKemarin = akhirPeriode.minusDays(1);
        BigDecimal pendapatanKemarin = transaksiParkirRepository
            .hitungTotalPendapatanDalamRentangWaktu(awalKemarin, akhirKemarin);
        if (pendapatanKemarin == null) { pendapatanKemarin = BigDecimal.ZERO; }
        
        Double persentasePendapatan = 0.0;
        if (pendapatanKemarin.compareTo(BigDecimal.ZERO) > 0) {
            persentasePendapatan = (pendapatanTotal.doubleValue() - pendapatanKemarin.doubleValue()) / pendapatanKemarin.doubleValue() * 100.0;
        } else if (pendapatanTotal.compareTo(BigDecimal.ZERO) > 0) {
            persentasePendapatan = 100.0;
        }

        // --- Langkah 2: Agregasi Volume Kendaraan Keseluruhan (History) ---
        // Memanggil kueri COUNT dari DataKendaraanRepository (bukan hanya hari ini)
        Long totalKendaraan = dataKendaraanRepository.count();


        // --- Langkah 3: Agregasi Jumlah Anomali ---
        // Memanggil kueri COUNT anomali BELUM_DITANGANI dari LogOperasionalIoTRepository
        Long totalAnomali = logOperasionalIoTRepository
            .countByStatusResolusi(StatusResolusi.BELUM_DITANGANI);


        // --- Langkah 4: Status Kapasitas Slot Real-Time ---
        // Menghitung slot kosong dan terisi saat ini dari tabel slot_parkir
        Long slotKosong = (long) slotParkirRepository.findByStatusSlot(StatusSlot.KOSONG).size();
        Long slotTerisi = (long) slotParkirRepository.findByStatusSlot(StatusSlot.TERISI).size();


        // --- Langkah 5: Kalkulasi Eco-Metrics CO2 (Fitur Green-IoT Khas SPCT) ---
        // Rumus: Waktu Hemat (menit) * Emisi Idle (gram/menit) * Volume Kendaraan → konversi gram ke kg
        double totalReduksiCo2Kg = hitungReduksiCo2(totalKendaraan);
        
        // Persentase reduksi terhadap angka benchmark pencemaran CO2 terburuk (misal: 2000kg)
        double persentaseCo2 = Math.min((totalReduksiCo2Kg / 2000.0) * 100.0, 100.0);


        // --- Langkah 6: Menyusun Data Grafik Okupansi Per Jam ---
        // Menghitung berapa kendaraan yang masuk pada setiap jam dalam rentang waktu laporan
        List<DataOkupansiJamDto> grafikOkupansi = susunGrafikOkupansiPerJam(awalPeriode, akhirPeriode);


        // --- Langkah 7: Susun dan kembalikan DTO lengkap ke Controller ---
        return new DataDashboardDto(
            pendapatanTotal,    // Total pendapatan di periode ini
            Math.round(persentasePendapatan * 10.0) / 10.0, // Persentase kenaikan/penurunan (1 desimal)
            totalKendaraan,     // Total kendaraan seluruh history
            totalAnomali,       // Jumlah anomali aktif
            slotKosong,         // Slot kosong saat ini (real-time)
            slotTerisi,         // Slot terisi saat ini (real-time)
            totalReduksiCo2Kg,  // Reduksi emisi CO2 yang berhasil dicegah
            Math.round(persentaseCo2 * 10.0) / 10.0, // Persentase goal tercapai (1 desimal)
            grafikOkupansi      // Data series grafik per jam untuk Chart.js
        );
    }


    // =====================================================================
    // Method Pendukung: Kalkulasi Eco-Metrics Reduksi Emisi CO2
    // =====================================================================

    // Menghitung estimasi total emisi CO2 yang berhasil dicegah berkat sistem navigasi A*
    // Logika: tanpa sistem navigasi, pengemudi menghabiskan waktu berkeliling mencari slot
    // Dengan A*, waktu pencarian berkurang → emisi idle berkurang → CO2 turun
    private double hitungReduksiCo2(Long jumlahKendaraan)
    {
        // Rumus: (WaktuHemat × EmisiIdle × JumlahKendaraan) / 1000 (konversi gram → kilogram)
        double totalGramCo2 = WAKTU_HEMAT_RATA_RATA_MENIT * EMISI_CO2_GRAM_PER_MENIT * jumlahKendaraan;
        return Math.round(totalGramCo2 / 1000 * 100.0) / 100.0; // Pembulatan 2 desimal (dalam kilogram)
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
}
