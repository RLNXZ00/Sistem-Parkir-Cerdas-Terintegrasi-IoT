package com.spct.dto;

import java.math.BigDecimal; // Mengimpor BigDecimal untuk total pendapatan yang presisi
import java.util.List;       // Mengimpor List untuk data grafik okupansi per jam

// DTO (Data Transfer Object): Objek respons JSON yang dikirim ke Frontend Dashboard Manajemen
// Merupakan "snapshot" lengkap kondisi sistem pada periode tertentu, siap digambar oleh Chart.js
// Setara dengan model yang kita isi datanya dari berbagai kueri sebelum dikirim ke tampilan
public class DataDashboardDto // Kelas DTO untuk membungkus semua data analitik dan laporan Dashboard Admin
{
    // =====================================================================
    // Deklarasi Atribut: Semua metrik yang ditampilkan di Dashboard
    // =====================================================================

    private BigDecimal pendapatanTotal;      // Total pendapatan kotor dari transaksi LUNAS di periode ini (backward-compatible)
    private BigDecimal pendapatanHariIni;    // Total pendapatan hari ini (00:00 - 23:59)
    private BigDecimal pendapatanBulanan;    // Total pendapatan bulan berjalan (tanggal 1 s.d. hari ini)
    private Double persentasePendapatan;     // Persentase perbandingan pendapatan hari ini dengan kemarin
    private Long totalKendaraan;             // Jumlah total kendaraan yang masuk (volume lalu lintas) dari seluruh history
    private Long totalAnomali;               // Jumlah kejadian anomali IoT yang terjadi di periode ini
    private Long slotKosongSaatIni;          // Jumlah slot parkir yang sedang kosong (real-time)
    private Long slotTerisiSaatIni;          // Jumlah slot parkir yang sedang terisi (real-time)
    private Long totalSensor;                // Total unit sensor IoT yang terpasang di database
    private Long totalSensorAktif;           // Total unit sensor IoT berstatus ON
    private Double reduksiCo2Kg;             // Estimasi reduksi emisi CO2 berkat sistem navigasi (Eco-Metrics)
    private Double persentaseCo2;            // Persentase reduksi CO2 berbanding angka terburuk (misal 2000kg)
    private List<DataOkupansiJamDto> grafikOkupansiPerJam; // Array data untuk grafik Chart.js per jam
    private List<DataPendapatanHarianDto> grafikPendapatanHarian; // Array data pertumbuhan pendapatan harian (tgl 1 s.d. hari ini)

    // =====================================================================
    // Inner Class: DataPendapatanHarianDto (Data titik harian dari tgl 1 s.d. hari ini)
    // =====================================================================
    public static class DataPendapatanHarianDto
    {
        private Integer hari;          // Angka tanggal (1, 2, 3, ..., 13)
        private String labelTanggal;  // Label tanggal ("01 Okt", "02 Okt", ...)
        private BigDecimal nominal;    // Nominal pendapatan pada hari tersebut

        public DataPendapatanHarianDto(Integer hari, String labelTanggal, BigDecimal nominal)
        {
            this.hari = hari;
            this.labelTanggal = labelTanggal;
            this.nominal = (nominal != null) ? nominal : BigDecimal.ZERO;
        }

        public DataPendapatanHarianDto() {}

        public Integer getHari() { return hari; }
        public void setHari(Integer hari) { this.hari = hari; }

        public String getLabelTanggal() { return labelTanggal; }
        public void setLabelTanggal(String labelTanggal) { this.labelTanggal = labelTanggal; }

        public BigDecimal getNominal() { return nominal; }
        public void setNominal(BigDecimal nominal) { this.nominal = nominal; }
    }

    // =====================================================================
    // Inner Class: DataOkupansiJamDto (Menyimpan data satu titik dalam grafik garis okupansi)
    // Setara dengan satu baris data di TableModel.java Anda, namun untuk grafik
    // =====================================================================
    public static class DataOkupansiJamDto // Kelas inner untuk merepresentasikan satu titik data dalam grafik okupansi
    {
        private String jam;         // Label sumbu X grafik (misal: "08:00", "09:00", ..., "22:00")
        private Long jumlahMasuk;   // Jumlah kendaraan yang masuk pada jam tersebut

        // Konstruktor DataOkupansiJamDto
        public DataOkupansiJamDto(String jam, Long jumlahMasuk)
        {
            this.jam = jam;                 // Menginisialisasi atribut jam
            this.jumlahMasuk = jumlahMasuk; // Menginisialisasi atribut jumlahMasuk
        }

        public void setJam(String jam) // Setter jam
        {
            this.jam = jam;
        }

        public String getJam() // Getter jam
        {
            return jam;
        }

        public void setJumlahMasuk(Long jumlahMasuk) // Setter jumlahMasuk
        {
            this.jumlahMasuk = jumlahMasuk;
        }

        public Long getJumlahMasuk() // Getter jumlahMasuk
        {
            return jumlahMasuk;
        }
    }


    // =====================================================================
    // Konstruktor LENGKAP
    // =====================================================================
    public DataDashboardDto(BigDecimal pendapatanHariIni, BigDecimal pendapatanBulanan, Double persentasePendapatan,
                            Long totalKendaraan, Long totalAnomali,
                            Long slotKosongSaatIni, Long slotTerisiSaatIni,
                            Long totalSensor, Long totalSensorAktif,
                            Double reduksiCo2Kg, Double persentaseCo2,
                            List<DataOkupansiJamDto> grafikOkupansiPerJam,
                            List<DataPendapatanHarianDto> grafikPendapatanHarian)
    {
        this.pendapatanTotal = pendapatanHariIni;
        this.pendapatanHariIni = pendapatanHariIni;
        this.pendapatanBulanan = pendapatanBulanan;
        this.persentasePendapatan = persentasePendapatan;
        this.totalKendaraan = totalKendaraan;
        this.totalAnomali = totalAnomali;
        this.slotKosongSaatIni = slotKosongSaatIni;
        this.slotTerisiSaatIni = slotTerisiSaatIni;
        this.totalSensor = totalSensor;
        this.totalSensorAktif = totalSensorAktif;
        this.reduksiCo2Kg = reduksiCo2Kg;
        this.persentaseCo2 = persentaseCo2;
        this.grafikOkupansiPerJam = grafikOkupansiPerJam;
        this.grafikPendapatanHarian = grafikPendapatanHarian;
    }

    public DataDashboardDto(BigDecimal pendapatanTotal, Double persentasePendapatan, Long totalKendaraan, Long totalAnomali,
                             Long slotKosongSaatIni, Long slotTerisiSaatIni,
                             Double reduksiCo2Kg, Double persentaseCo2, List<DataOkupansiJamDto> grafikOkupansiPerJam)
    {
        this.pendapatanTotal = pendapatanTotal;
        this.pendapatanHariIni = pendapatanTotal;
        this.pendapatanBulanan = pendapatanTotal;
        this.persentasePendapatan = persentasePendapatan;
        this.totalKendaraan = totalKendaraan;
        this.totalAnomali = totalAnomali;
        this.slotKosongSaatIni = slotKosongSaatIni;
        this.slotTerisiSaatIni = slotTerisiSaatIni;
        this.reduksiCo2Kg = reduksiCo2Kg;
        this.persentaseCo2 = persentaseCo2;
        this.grafikOkupansiPerJam = grafikOkupansiPerJam;
    }

    public DataDashboardDto() {} // Konstruktor kosong untuk Jackson


    // =====================================================================
    // Getter & Setter (gaya penulisan Anda)
    // =====================================================================

    public void setPendapatanTotal(BigDecimal pendapatanTotal) // Setter pendapatanTotal
    {
        this.pendapatanTotal = pendapatanTotal;
    }

    public BigDecimal getPendapatanTotal() // Getter pendapatanTotal
    {
        return pendapatanTotal;
    }

    public void setTotalKendaraan(Long totalKendaraan) // Setter totalKendaraan
    {
        this.totalKendaraan = totalKendaraan;
    }

    public Long getTotalKendaraan() // Getter totalKendaraan
    {
        return totalKendaraan;
    }

    public void setTotalAnomali(Long totalAnomali) // Setter totalAnomali
    {
        this.totalAnomali = totalAnomali;
    }

    public Long getTotalAnomali() // Getter totalAnomali
    {
        return totalAnomali;
    }

    public void setSlotKosongSaatIni(Long slotKosongSaatIni) // Setter slotKosongSaatIni
    {
        this.slotKosongSaatIni = slotKosongSaatIni;
    }

    public Long getSlotKosongSaatIni() // Getter slotKosongSaatIni
    {
        return slotKosongSaatIni;
    }

    public void setSlotTerisiSaatIni(Long slotTerisiSaatIni) // Setter slotTerisiSaatIni
    {
        this.slotTerisiSaatIni = slotTerisiSaatIni;
    }

    public Long getSlotTerisiSaatIni() // Getter slotTerisiSaatIni
    {
        return slotTerisiSaatIni;
    }

    public void setReduksiCo2Kg(Double reduksiCo2Kg) // Setter reduksiCo2Kg
    {
        this.reduksiCo2Kg = reduksiCo2Kg;
    }

    public Double getReduksiCo2Kg() // Getter reduksiCo2Kg
    {
        return reduksiCo2Kg;
    }

    public void setGrafikOkupansiPerJam(List<DataOkupansiJamDto> grafikOkupansiPerJam) // Setter grafikOkupansiPerJam
    {
        this.grafikOkupansiPerJam = grafikOkupansiPerJam;
    }

    public List<DataOkupansiJamDto> getGrafikOkupansiPerJam() // Getter grafikOkupansiPerJam
    {
        return grafikOkupansiPerJam;
    }

    public void setPersentasePendapatan(Double persentasePendapatan) {
        this.persentasePendapatan = persentasePendapatan;
    }

    public Double getPersentasePendapatan() {
        return persentasePendapatan;
    }

    public void setPersentaseCo2(Double persentaseCo2) {
        this.persentaseCo2 = persentaseCo2;
    }

    public Double getPersentaseCo2() {
        return persentaseCo2;
    }

    public BigDecimal getPendapatanHariIni() {
        return pendapatanHariIni;
    }

    public void setPendapatanHariIni(BigDecimal pendapatanHariIni) {
        this.pendapatanHariIni = pendapatanHariIni;
    }

    public BigDecimal getPendapatanBulanan() {
        return pendapatanBulanan;
    }

    public void setPendapatanBulanan(BigDecimal pendapatanBulanan) {
        this.pendapatanBulanan = pendapatanBulanan;
    }

    public Long getTotalSensor() {
        return totalSensor;
    }

    public void setTotalSensor(Long totalSensor) {
        this.totalSensor = totalSensor;
    }

    public Long getTotalSensorAktif() {
        return totalSensorAktif;
    }

    public void setTotalSensorAktif(Long totalSensorAktif) {
        this.totalSensorAktif = totalSensorAktif;
    }

    public List<DataPendapatanHarianDto> getGrafikPendapatanHarian() {
        return grafikPendapatanHarian;
    }

    public void setGrafikPendapatanHarian(List<DataPendapatanHarianDto> grafikPendapatanHarian) {
        this.grafikPendapatanHarian = grafikPendapatanHarian;
    }
}
