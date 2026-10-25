package com.spct.service; // Nama package dari modul layanan logika bisnis sistem

// Import DTO DataDashboardDto dari package dto
import com.spct.dto.DataDashboardDto;
// Import kelas inner DataOkupansiJamDto dari DataDashboardDto
import com.spct.dto.DataDashboardDto.DataOkupansiJamDto;
// Import enum StatusResolusi dari package model
import com.spct.model.StatusResolusi;
// Import enum StatusSlot dari package model
import com.spct.model.StatusSlot;
// Import repositori DataKendaraanRepository dari package repository
import com.spct.repository.DataKendaraanRepository;
// Import repositori LogOperasionalIoTRepository dari package repository
import com.spct.repository.LogOperasionalIoTRepository;
// Import repositori SensorIoTRepository dari package repository
import com.spct.repository.SensorIoTRepository;
// Import repositori SlotParkirRepository dari package repository
import com.spct.repository.SlotParkirRepository;
// Import repositori TransaksiParkirRepository dari package repository
import com.spct.repository.TransaksiParkirRepository;
// Import anotasi Autowired dari Spring Framework
import org.springframework.beans.factory.annotation.Autowired;
// Import anotasi Service dari Spring Framework
import org.springframework.stereotype.Service;

// Import tipe data BigDecimal untuk akurasi perhitungan pendapatan
import java.math.BigDecimal;
// Import tipe data tanggal lokal java
import java.time.LocalDate;
// Import tipe data waktu LocalDateTime java
import java.time.LocalDateTime;
// Import tipe data waktu lokal LocalTime
import java.time.LocalTime;
// Import DateTimeFormatter untuk format label jam dan tanggal
import java.time.format.DateTimeFormatter;
// Import koleksi ArrayList dari java util
import java.util.ArrayList;
// Import koleksi List dari java util
import java.util.List;

// Kelas layanan publik java AnalitikLaporanService untuk mengagregasi data analitik finansial, okupansi denah, dan metrik reduksi CO2
@Service // Menandai kelas ini sebagai Spring Service Bean
public class AnalitikLaporanService
{
    // Konstanta emisi gas buang saat kendaraan idle sebesar 175.0 gram CO2 per menit
    private static final double EMISI_CO2_GRAM_PER_MENIT = 175.0;

    // Injeksi otomatis dependensi TransaksiParkirRepository
    @Autowired
    private TransaksiParkirRepository transaksiParkirRepository; // Deklarasi atribut transaksiParkirRepository

    // Injeksi otomatis dependensi LogOperasionalIoTRepository
    @Autowired
    private LogOperasionalIoTRepository logOperasionalIoTRepository; // Deklarasi atribut logOperasionalIoTRepository

    // Injeksi otomatis dependensi SlotParkirRepository
    @Autowired
    private SlotParkirRepository slotParkirRepository; // Deklarasi atribut slotParkirRepository

    // Injeksi otomatis dependensi DataKendaraanRepository
    @Autowired
    private DataKendaraanRepository dataKendaraanRepository; // Deklarasi atribut dataKendaraanRepository

    // Injeksi otomatis dependensi SensorIoTRepository
    @Autowired
    private SensorIoTRepository sensorIoTRepository; // Deklarasi atribut sensorIoTRepository

    // =====================================================================
    // Method Utama: Mengumpulkan semua data metrik untuk Dashboard Manajemen
    // =====================================================================

    // Method ambilDataDashboard untuk merangkum seluruh metrik operasional dan performa finansial
    public DataDashboardDto ambilDataDashboard(LocalDate tanggalAwal, LocalDate tanggalAkhir)
    {
        // Menentukan tanggal hari ini dari parameter atau waktu kalender sistem
        LocalDate hariIni = (tanggalAkhir != null) ? tanggalAkhir : LocalDate.now();

        // 1. Pendapatan Hari Ini (00:00:00 s.d. 23:59:59)
        LocalDateTime awalHariIni = hariIni.atStartOfDay();
        LocalDateTime akhirHariIni = hariIni.atTime(LocalTime.MAX);
        BigDecimal pendapatanHariIni = transaksiParkirRepository
            .hitungTotalPendapatanDalamRentangWaktu(awalHariIni, akhirHariIni);
        // Jika pendapatan hari ini bernilai null, inisialisasi dengan nilai ZERO
        if (pendapatanHariIni == null) { pendapatanHariIni = BigDecimal.ZERO; }

        // 2. Pendapatan Kemarin (untuk perbandingan rasio persentase pertumbuhan)
        LocalDateTime awalKemarin = awalHariIni.minusDays(1);
        LocalDateTime akhirKemarin = akhirHariIni.minusDays(1);
        BigDecimal pendapatanKemarin = transaksiParkirRepository
            .hitungTotalPendapatanDalamRentangWaktu(awalKemarin, akhirKemarin);
        // Jika pendapatan kemarin null, inisialisasi dengan nilai ZERO
        if (pendapatanKemarin == null) { pendapatanKemarin = BigDecimal.ZERO; }

        // Inisialisasi persentase pendapatan dengan nilai 0.0
        Double persentasePendapatan = 0.0;
        // Jika pendapatan kemarin lebih dari 0, hitung persentase pertumbuhan
        if (pendapatanKemarin.compareTo(BigDecimal.ZERO) > 0) 
        {
            persentasePendapatan = (pendapatanHariIni.doubleValue() - pendapatanKemarin.doubleValue()) / pendapatanKemarin.doubleValue() * 100.0;
        } 
        else if (pendapatanHariIni.compareTo(BigDecimal.ZERO) > 0) 
        {
            persentasePendapatan = 100.0;
        }

        // 3. Pendapatan Bulanan (Tanggal 1 s.d. tanggal hari ini di bulan berjalan)
        LocalDate awalBulanDate = LocalDate.of(hariIni.getYear(), hariIni.getMonth(), 1);
        LocalDateTime awalBulan = awalBulanDate.atStartOfDay();
        LocalDateTime akhirBulan = akhirHariIni;
        BigDecimal pendapatanBulanan = transaksiParkirRepository
            .hitungTotalPendapatanDalamRentangWaktu(awalBulan, akhirBulan);
        // Jika pendapatan bulanan null, inisialisasi dengan ZERO
        if (pendapatanBulanan == null) { pendapatanBulanan = BigDecimal.ZERO; }

        // Agregasi volume total kendaraan yang pernah terdaftar di sistem
        Long totalKendaraan = dataKendaraanRepository.count();

        // Agregasi kuantitas anomali yang masih berstatus BELUM_DITANGANI
        Long totalAnomali = logOperasionalIoTRepository
            .countByStatusResolusi(StatusResolusi.BELUM_DITANGANI);

        // Mengambil total slot kosong real-time
        Long slotKosong = (long) slotParkirRepository.findByStatusSlot(StatusSlot.KOSONG).size();
        // Mengambil total slot terisi real-time
        Long slotTerisi = (long) slotParkirRepository.findByStatusSlot(StatusSlot.TERISI).size();

        // Mengambil total unit perangkat keras sensor IoT
        Long totalSensor = sensorIoTRepository.count();
        // Mengambil kuantitas unit sensor yang sedang berstatus aktif (ON)
        Long totalSensorAktif = (long) sensorIoTRepository.findByStatusSensor("ON").size();

        // Mengambil total akumulasi menit yang berhasil dihemat oleh navigasi cerdas
        Double totalMenitDihemat = transaksiParkirRepository.hitungTotalMenitDihematDariSensor();
        // Jika null, beri nilai 0.0
        if (totalMenitDihemat == null) { totalMenitDihemat = 0.0; }

        // Menghitung total reduksi emisi CO2 dalam kilogram
        double totalReduksiCo2Kg = Math.round((totalMenitDihemat * EMISI_CO2_GRAM_PER_MENIT / 1000.0) * 100.0) / 100.0;
        // Menghitung persentase capaian target reduksi emisi
        double persentaseCo2 = Math.min((totalReduksiCo2Kg / 2000.0) * 100.0, 100.0);

        // Menyusun titik data okupansi kendaraan per jam untuk grafik Chart.js
        List<DataOkupansiJamDto> grafikOkupansi = susunGrafikOkupansiPerJam(awalHariIni, akhirHariIni);

        // Menyusun titik data pertumbuhan pendapatan harian tanggal 1 s.d. hari ini
        List<DataDashboardDto.DataPendapatanHarianDto> grafikPendapatanHarian = susunGrafikPendapatanHarian(awalBulanDate, hariIni);

        // Menghitung total transaksi lunas bulan berjalan
        Long totalTransaksiLunasBulanIni = transaksiParkirRepository.countTransaksiLunasDalamRentangWaktu(awalBulan, akhirBulan);
        if (totalTransaksiLunasBulanIni == null) { totalTransaksiLunasBulanIni = 0L; }

        // Inisialisasi tarif rata-rata per transaksi
        BigDecimal rataRataTarifTransaksi = BigDecimal.ZERO;
        if (totalTransaksiLunasBulanIni > 0 && pendapatanBulanan.compareTo(BigDecimal.ZERO) > 0)
        {
            rataRataTarifTransaksi = pendapatanBulanan.divide(
                BigDecimal.valueOf(totalTransaksiLunasBulanIni), 0, java.math.RoundingMode.HALF_UP);
        }

        // Menghitung kapasitas total seluruh slot parkir gedung
        Long totalKapasitasSlot = slotParkirRepository.count();
        if (totalKapasitasSlot == null || totalKapasitasSlot == 0) { totalKapasitasSlot = 16L; }

        // Inisialisasi rasio pendapatan per kapasitas slot (RevPAS)
        BigDecimal revenuePerSlot = BigDecimal.ZERO;
        if (totalKapasitasSlot > 0 && pendapatanBulanan.compareTo(BigDecimal.ZERO) > 0)
        {
            revenuePerSlot = pendapatanBulanan.divide(
                BigDecimal.valueOf(totalKapasitasSlot), 0, java.math.RoundingMode.HALF_UP);
        }

        // Menghitung persentase occupancy rate slot terkini
        Double occupancyRateSaatIni = 0.0;
        if (totalKapasitasSlot > 0)
        {
            occupancyRateSaatIni = Math.round(((double) slotTerisi / totalKapasitasSlot * 100.0) * 10.0) / 10.0;
        }

        // Menghitung total volume kendaraan yang masuk khusus hari ini
        Long totalKendaraanHariIni = transaksiParkirRepository.countByWaktuMasukBetween(awalHariIni, akhirHariIni);
        if (totalKendaraanHariIni == null) { totalKendaraanHariIni = 0L; }

        // Instansiasi objek DTO DataDashboardDto dengan seluruh parameter hasil agregasi
        DataDashboardDto dto = new DataDashboardDto(
            pendapatanHariIni, // Pendapatan hari ini
            pendapatanBulanan, // Pendapatan bulanan
            Math.round(persentasePendapatan * 10.0) / 10.0, // Persentase kenaikan pendapatan
            totalKendaraan, // Total kendaraan history
            totalAnomali, // Total anomali aktif
            slotKosong, // Slot kosong
            slotTerisi, // Slot terisi
            totalSensor, // Total unit sensor
            totalSensorAktif, // Total sensor aktif
            totalReduksiCo2Kg, // Reduksi CO2 dalam kg
            Math.round(persentaseCo2 * 10.0) / 10.0, // Persentase ramah lingkungan
            grafikOkupansi, // Grafik okupansi
            grafikPendapatanHarian // Grafik pendapatan harian
        );
        // Mengisi metrik transaksi lunas bulan ini
        dto.setTotalTransaksiLunas(totalTransaksiLunasBulanIni);
        // Mengisi metrik rata-rata tarif per transaksi
        dto.setRataRataTarifTransaksi(rataRataTarifTransaksi);
        // Mengisi metrik pendapatan rata-rata per slot
        dto.setRevenuePerSlot(revenuePerSlot);
        // Mengisi metrik persentase keterisian saat ini
        dto.setOccupancyRateSaatIni(occupancyRateSaatIni);
        // Mengisi metrik total kendaraan masuk hari ini
        dto.setTotalKendaraanHariIni(totalKendaraanHariIni);

        // Mengembalikan objek DTO data dashboard lengkap
        return dto;
    }

    // =====================================================================
    // Method Pendukung: Menyusun Data Grafik Okupansi Per Jam
    // =====================================================================

    // Method susunGrafikOkupansiPerJam untuk menyusun data tren kendaraan masuk per jam
    private List<DataOkupansiJamDto> susunGrafikOkupansiPerJam(LocalDateTime awal, LocalDateTime akhir)
    {
        // Instansiasi daftar list penampung titik data grafik
        List<DataOkupansiJamDto> hasilGrafik = new ArrayList<>();
        // Formatter untuk label waktu jam (misal: "08:00")
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:00");

        // Inisialisasi variabel jamSaatIni dengan waktu awal
        LocalDateTime jamSaatIni = awal;
        // Selama jamSaatIni belum melewati waktu akhir, lakukan iterasi per jam:
        while (!jamSaatIni.isAfter(akhir))
        {
            // Menentukan batas akhir dari rentang satu jam (59 detik)
            LocalDateTime akhirJamIni = jamSaatIni.plusHours(1).minusSeconds(1);

            // Menghitung volume kendaraan masuk dalam rentang jam terkait
            Long jumlahMasukJamIni = transaksiParkirRepository.countByWaktuMasukBetween(jamSaatIni, akhirJamIni);

            // Menambahkan titik data baru ke daftar grafik
            hasilGrafik.add(new DataOkupansiJamDto(
                jamSaatIni.format(formatter), // Label jam sumbu X
                jumlahMasukJamIni // Volume kendaraan sumbu Y
            ));

            // Menambahkan 1 jam untuk iterasi berikutnya
            jamSaatIni = jamSaatIni.plusHours(1);
        }

        // Mengembalikan daftar lengkap titik data grafik okupansi
        return hasilGrafik;
    }

    // =====================================================================
    // Method Pendukung: Menyusun Data Pertumbuhan Pendapatan Harian
    // =====================================================================

    // Method susunGrafikPendapatanHarian untuk menyusun grafik tren pendapatan tanggal 1 s.d. hari ini
    private List<DataDashboardDto.DataPendapatanHarianDto> susunGrafikPendapatanHarian(LocalDate awalBulan, LocalDate hariIni)
    {
        // Instansiasi list data pendapatan harian
        List<DataDashboardDto.DataPendapatanHarianDto> hasil = new ArrayList<>();
        // Formatter format tanggal (misal: "01 Okt")
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM");

        // Inisialisasi tanggal berjalan dengan awal bulan
        LocalDate tgl = awalBulan;
        // Selama tgl belum melewati hariIni, lakukan perulangan harian:
        while (!tgl.isAfter(hariIni))
        {
            // Menentukan jam 00:00:00 hari tersebut
            LocalDateTime awalHari = tgl.atStartOfDay();
            // Menentukan jam 23:59:59 hari tersebut
            LocalDateTime akhirHari = tgl.atTime(LocalTime.MAX);

            // Menghitung total pendapatan pada hari tersebut
            BigDecimal pendapatanHari = transaksiParkirRepository
                .hitungTotalPendapatanDalamRentangWaktu(awalHari, akhirHari);
            // Jika null, beri nilai ZERO
            if (pendapatanHari == null) { pendapatanHari = BigDecimal.ZERO; }

            // Menambahkan titik data pendapatan harian ke dalam list
            hasil.add(new DataDashboardDto.DataPendapatanHarianDto(
                tgl.getDayOfMonth(), // Nomor hari (tanggal)
                tgl.format(formatter), // Label tanggal
                pendapatanHari // Nominal pendapatan
            ));

            // Melangkah 1 hari ke depan
            tgl = tgl.plusDays(1);
        }

        // Mengembalikan daftar titik data grafik pendapatan harian
        return hasil;
    }
}
