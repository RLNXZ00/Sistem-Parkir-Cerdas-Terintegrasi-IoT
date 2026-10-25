package com.spct.dto; // Nama package dari modul data transfer object (DTO)

// Import tipe data BigDecimal untuk akurasi perhitungan nominal pendapatan
import java.math.BigDecimal;
// Import koleksi List dari java util
import java.util.List;

// Kelas publik java DataDashboardDto untuk membungkus data agregat analitik dan metrik ringkasan Dashboard Admin
public class DataDashboardDto
{
    // =====================================================================
    // Deklarasi Atribut Metrik Data Dashboard
    // =====================================================================

    // Deklarasi atribut pendapatanTotal bertipe BigDecimal untuk total akumulasi pendapatan kotor
    private BigDecimal pendapatanTotal;

    // Deklarasi atribut pendapatanHariIni bertipe BigDecimal untuk total pendapatan pada hari ini
    private BigDecimal pendapatanHariIni;

    // Deklarasi atribut pendapatanBulanan bertipe BigDecimal untuk pendapatan bulan berjalan
    private BigDecimal pendapatanBulanan;

    // Deklarasi atribut persentasePendapatan bertipe Double untuk rasio pertumbuhan pendapatan
    private Double persentasePendapatan;

    // Deklarasi atribut totalKendaraan bertipe Long untuk jumlah seluruh volume kendaraan masuk
    private Long totalKendaraan;

    // Deklarasi atribut totalAnomali bertipe Long untuk jumlah kejadian anomali penyerobotan/malfungsi
    private Long totalAnomali;

    // Deklarasi atribut slotKosongSaatIni bertipe Long untuk total slot bebas real-time
    private Long slotKosongSaatIni;

    // Deklarasi atribut slotTerisiSaatIni bertipe Long untuk total slot terisi real-time
    private Long slotTerisiSaatIni;

    // Deklarasi atribut totalSensor bertipe Long untuk jumlah seluruh unit sensor IoT
    private Long totalSensor;

    // Deklarasi atribut totalSensorAktif bertipe Long untuk jumlah sensor berstatus ON
    private Long totalSensorAktif;

    // Deklarasi atribut reduksiCo2Kg bertipe Double untuk estimasi reduksi gas emisi CO2 (kg)
    private Double reduksiCo2Kg;

    // Deklarasi atribut persentaseCo2 bertipe Double untuk capaian persentase ramah lingkungan
    private Double persentaseCo2;

    // Deklarasi atribut grafikOkupansiPerJam bertipe List<DataOkupansiJamDto> untuk titik data grafik per jam
    private List<DataOkupansiJamDto> grafikOkupansiPerJam;

    // Deklarasi atribut grafikPendapatanHarian bertipe List<DataPendapatanHarianDto> untuk data pendapatan harian
    private List<DataPendapatanHarianDto> grafikPendapatanHarian;

    // Deklarasi atribut totalTransaksiLunas bertipe Long untuk jumlah transaksi sukses lunas
    private Long totalTransaksiLunas;

    // Deklarasi atribut rataRataTarifTransaksi bertipe BigDecimal untuk tarif rata-rata per kendaraan
    private BigDecimal rataRataTarifTransaksi;

    // Deklarasi atribut revenuePerSlot bertipe BigDecimal untuk rata-rata pendapatan per slot (RevPAS)
    private BigDecimal revenuePerSlot;

    // Deklarasi atribut occupancyRateSaatIni bertipe Double untuk persentase tingkat keterisian slot
    private Double occupancyRateSaatIni;

    // Deklarasi atribut totalKendaraanHariIni bertipe Long untuk volume kendaraan masuk khusus hari ini
    private Long totalKendaraanHariIni;

    // =====================================================================
    // Inner Class: DataPendapatanHarianDto
    // =====================================================================
    public static class DataPendapatanHarianDto
    {
        // Deklarasi atribut hari bertipe Integer untuk tanggal kalender
        private Integer hari;

        // Deklarasi atribut labelTanggal bertipe String untuk label sumbu X grafik
        private String labelTanggal;

        // Deklarasi atribut nominal bertipe BigDecimal untuk nominal rupiah harian
        private BigDecimal nominal;

        // Konstruktor dengan parameter
        public DataPendapatanHarianDto(Integer hari, String labelTanggal, BigDecimal nominal)
        {
            this.hari = hari; // Inisialisasi atribut hari dengan parameter
            this.labelTanggal = labelTanggal; // Inisialisasi atribut labelTanggal dengan parameter
            this.nominal = (nominal != null) ? nominal : BigDecimal.ZERO; // Inisialisasi atribut nominal
        }

        // Konstruktor default tanpa parameter
        public DataPendapatanHarianDto() 
        {
            // Konstruktor kosong untuk serialisasi Jackson
        }

        // Method getter getHari untuk mengambil tanggal hari
        public Integer getHari() 
        { 
            return hari; // Mengembalikan nilai hari
        }

        // Method setter setHari untuk mengubah tanggal hari
        public void setHari(Integer hari) 
        { 
            this.hari = hari; // Inisialisasi atribut hari dengan parameter
        }

        // Method getter getLabelTanggal untuk mengambil teks label tanggal
        public String getLabelTanggal() 
        { 
            return labelTanggal; // Mengembalikan nilai labelTanggal
        }

        // Method setter setLabelTanggal untuk mengubah teks label tanggal
        public void setLabelTanggal(String labelTanggal) 
        { 
            this.labelTanggal = labelTanggal; // Inisialisasi atribut labelTanggal dengan parameter
        }

        // Method getter getNominal untuk mengambil nominal pendapatan harian
        public BigDecimal getNominal() 
        { 
            return nominal; // Mengembalikan nominal pendapatan harian
        }

        // Method setter setNominal untuk mengubah nominal pendapatan harian
        public void setNominal(BigDecimal nominal) 
        { 
            this.nominal = nominal; // Inisialisasi atribut nominal dengan parameter
        }
    }

    // =====================================================================
    // Inner Class: DataOkupansiJamDto
    // =====================================================================
    public static class DataOkupansiJamDto
    {
        // Deklarasi atribut jam bertipe String untuk label waktu per jam
        private String jam;

        // Deklarasi atribut jumlahMasuk bertipe Long untuk frekuensi kendaraan masuk
        private Long jumlahMasuk;

        // Konstruktor dengan parameter jam dan jumlahMasuk
        public DataOkupansiJamDto(String jam, Long jumlahMasuk)
        {
            this.jam = jam; // Inisialisasi atribut jam dengan parameter
            this.jumlahMasuk = jumlahMasuk; // Inisialisasi atribut jumlahMasuk dengan parameter
        }

        // Konstruktor default tanpa parameter
        public DataOkupansiJamDto() 
        {
            // Konstruktor kosong untuk serialisasi Jackson
        }

        // Method setter setJam untuk mengubah label jam
        public void setJam(String jam)
        {
            this.jam = jam; // Inisialisasi atribut jam dengan parameter
        }

        // Method getter getJam untuk mengambil label jam
        public String getJam()
        {
            return jam; // Mengembalikan nilai label jam
        }

        // Method setter setJumlahMasuk untuk mengubah jumlah kendaraan
        public void setJumlahMasuk(Long jumlahMasuk)
        {
            this.jumlahMasuk = jumlahMasuk; // Inisialisasi atribut jumlahMasuk dengan parameter
        }

        // Method getter getJumlahMasuk untuk mengambil jumlah kendaraan
        public Long getJumlahMasuk()
        {
            return jumlahMasuk; // Mengembalikan nilai jumlahMasuk
        }
    }

    // =====================================================================
    // Konstruktor Kelas DataDashboardDto
    // =====================================================================

    // Konstruktor lengkap dengan seluruh parameter metrik dashboard
    public DataDashboardDto(BigDecimal pendapatanHariIni, BigDecimal pendapatanBulanan, Double persentasePendapatan,
                            Long totalKendaraan, Long totalAnomali,
                            Long slotKosongSaatIni, Long slotTerisiSaatIni,
                            Long totalSensor, Long totalSensorAktif,
                            Double reduksiCo2Kg, Double persentaseCo2,
                            List<DataOkupansiJamDto> grafikOkupansiPerJam,
                            List<DataPendapatanHarianDto> grafikPendapatanHarian)
    {
        this.pendapatanTotal = pendapatanHariIni; // Inisialisasi atribut pendapatanTotal
        this.pendapatanHariIni = pendapatanHariIni; // Inisialisasi atribut pendapatanHariIni
        this.pendapatanBulanan = pendapatanBulanan; // Inisialisasi atribut pendapatanBulanan
        this.persentasePendapatan = persentasePendapatan; // Inisialisasi atribut persentasePendapatan
        this.totalKendaraan = totalKendaraan; // Inisialisasi atribut totalKendaraan
        this.totalAnomali = totalAnomali; // Inisialisasi atribut totalAnomali
        this.slotKosongSaatIni = slotKosongSaatIni; // Inisialisasi atribut slotKosongSaatIni
        this.slotTerisiSaatIni = slotTerisiSaatIni; // Inisialisasi atribut slotTerisiSaatIni
        this.totalSensor = totalSensor; // Inisialisasi atribut totalSensor
        this.totalSensorAktif = totalSensorAktif; // Inisialisasi atribut totalSensorAktif
        this.reduksiCo2Kg = reduksiCo2Kg; // Inisialisasi atribut reduksiCo2Kg
        this.persentaseCo2 = persentaseCo2; // Inisialisasi atribut persentaseCo2
        this.grafikOkupansiPerJam = grafikOkupansiPerJam; // Inisialisasi atribut grafikOkupansiPerJam
        this.grafikPendapatanHarian = grafikPendapatanHarian; // Inisialisasi atribut grafikPendapatanHarian
    }

    // Konstruktor fleksibel untuk kompatibilitas data ringkas
    public DataDashboardDto(BigDecimal pendapatanTotal, Double persentasePendapatan, Long totalKendaraan, Long totalAnomali,
                             Long slotKosongSaatIni, Long slotTerisiSaatIni,
                             Double reduksiCo2Kg, Double persentaseCo2, List<DataOkupansiJamDto> grafikOkupansiPerJam)
    {
        this.pendapatanTotal = pendapatanTotal; // Inisialisasi atribut pendapatanTotal
        this.pendapatanHariIni = pendapatanTotal; // Inisialisasi atribut pendapatanHariIni
        this.pendapatanBulanan = pendapatanTotal; // Inisialisasi atribut pendapatanBulanan
        this.persentasePendapatan = persentasePendapatan; // Inisialisasi atribut persentasePendapatan
        this.totalKendaraan = totalKendaraan; // Inisialisasi atribut totalKendaraan
        this.totalAnomali = totalAnomali; // Inisialisasi atribut totalAnomali
        this.slotKosongSaatIni = slotKosongSaatIni; // Inisialisasi atribut slotKosongSaatIni
        this.slotTerisiSaatIni = slotTerisiSaatIni; // Inisialisasi atribut slotTerisiSaatIni
        this.reduksiCo2Kg = reduksiCo2Kg; // Inisialisasi atribut reduksiCo2Kg
        this.persentaseCo2 = persentaseCo2; // Inisialisasi atribut persentaseCo2
        this.grafikOkupansiPerJam = grafikOkupansiPerJam; // Inisialisasi atribut grafikOkupansiPerJam
    }

    // Konstruktor default tanpa parameter
    public DataDashboardDto() 
    {
        // Konstruktor kosong untuk Jackson JSON serializer
    }

    // =====================================================================
    // Method Setter & Getter Atribut
    // =====================================================================

    // Method setter setPendapatanTotal untuk mengubah pendapatan total
    public void setPendapatanTotal(BigDecimal pendapatanTotal)
    {
        this.pendapatanTotal = pendapatanTotal; // Inisialisasi atribut pendapatanTotal dengan parameter
    }

    // Method getter getPendapatanTotal untuk mengambil pendapatan total
    public BigDecimal getPendapatanTotal()
    {
        return pendapatanTotal; // Mengembalikan nilai dari atribut pendapatanTotal
    }

    // Method setter setTotalKendaraan untuk mengubah total volume kendaraan
    public void setTotalKendaraan(Long totalKendaraan)
    {
        this.totalKendaraan = totalKendaraan; // Inisialisasi atribut totalKendaraan dengan parameter
    }

    // Method getter getTotalKendaraan untuk mengambil total volume kendaraan
    public Long getTotalKendaraan()
    {
        return totalKendaraan; // Mengembalikan nilai dari atribut totalKendaraan
    }

    // Method setter setTotalAnomali untuk mengubah jumlah anomali
    public void setTotalAnomali(Long totalAnomali)
    {
        this.totalAnomali = totalAnomali; // Inisialisasi atribut totalAnomali dengan parameter
    }

    // Method getter getTotalAnomali untuk mengambil jumlah anomali
    public Long getTotalAnomali()
    {
        return totalAnomali; // Mengembalikan nilai dari atribut totalAnomali
    }

    // Method setter setSlotKosongSaatIni untuk mengubah total slot kosong
    public void setSlotKosongSaatIni(Long slotKosongSaatIni)
    {
        this.slotKosongSaatIni = slotKosongSaatIni; // Inisialisasi atribut slotKosongSaatIni dengan parameter
    }

    // Method getter getSlotKosongSaatIni untuk mengambil total slot kosong
    public Long getSlotKosongSaatIni()
    {
        return slotKosongSaatIni; // Mengembalikan nilai dari atribut slotKosongSaatIni
    }

    // Method setter setSlotTerisiSaatIni untuk mengubah total slot terisi
    public void setSlotTerisiSaatIni(Long slotTerisiSaatIni)
    {
        this.slotTerisiSaatIni = slotTerisiSaatIni; // Inisialisasi atribut slotTerisiSaatIni dengan parameter
    }

    // Method getter getSlotTerisiSaatIni untuk mengambil total slot terisi
    public Long getSlotTerisiSaatIni()
    {
        return slotTerisiSaatIni; // Mengembalikan nilai dari atribut slotTerisiSaatIni
    }

    // Method setter setReduksiCo2Kg untuk mengubah capaian reduksi CO2
    public void setReduksiCo2Kg(Double reduksiCo2Kg)
    {
        this.reduksiCo2Kg = reduksiCo2Kg; // Inisialisasi atribut reduksiCo2Kg dengan parameter
    }

    // Method getter getReduksiCo2Kg untuk mengambil capaian reduksi CO2
    public Double getReduksiCo2Kg()
    {
        return reduksiCo2Kg; // Mengembalikan nilai dari atribut reduksiCo2Kg
    }

    // Method setter setGrafikOkupansiPerJam untuk mengubah data grafik per jam
    public void setGrafikOkupansiPerJam(List<DataOkupansiJamDto> grafikOkupansiPerJam)
    {
        this.grafikOkupansiPerJam = grafikOkupansiPerJam; // Inisialisasi atribut grafikOkupansiPerJam dengan parameter
    }

    // Method getter getGrafikOkupansiPerJam untuk mengambil data grafik per jam
    public List<DataOkupansiJamDto> getGrafikOkupansiPerJam()
    {
        return grafikOkupansiPerJam; // Mengembalikan daftar data grafik okupansi per jam
    }

    // Method setter setPersentasePendapatan untuk mengubah persentase pendapatan
    public void setPersentasePendapatan(Double persentasePendapatan) 
    {
        this.persentasePendapatan = persentasePendapatan; // Inisialisasi atribut persentasePendapatan dengan parameter
    }

    // Method getter getPersentasePendapatan untuk mengambil persentase pendapatan
    public Double getPersentasePendapatan() 
    {
        return persentasePendapatan; // Mengembalikan nilai persentasePendapatan
    }

    // Method setter setPersentaseCo2 untuk mengubah persentase reduksi emisi
    public void setPersentaseCo2(Double persentaseCo2) 
    {
        this.persentaseCo2 = persentaseCo2; // Inisialisasi atribut persentaseCo2 dengan parameter
    }

    // Method getter getPersentaseCo2 untuk mengambil persentase reduksi emisi
    public Double getPersentaseCo2() 
    {
        return persentaseCo2; // Mengembalikan nilai persentaseCo2
    }

    // Method getter getPendapatanHariIni untuk mengambil pendapatan hari ini
    public BigDecimal getPendapatanHariIni() 
    {
        return pendapatanHariIni; // Mengembalikan nilai pendapatanHariIni
    }

    // Method setter setPendapatanHariIni untuk mengubah pendapatan hari ini
    public void setPendapatanHariIni(BigDecimal pendapatanHariIni) 
    {
        this.pendapatanHariIni = pendapatanHariIni; // Inisialisasi atribut pendapatanHariIni dengan parameter
    }

    // Method getter getPendapatanBulanan untuk mengambil pendapatan bulanan
    public BigDecimal getPendapatanBulanan() 
    {
        return pendapatanBulanan; // Mengembalikan nilai pendapatanBulanan
    }

    // Method setter setPendapatanBulanan untuk mengubah pendapatan bulanan
    public void setPendapatanBulanan(BigDecimal pendapatanBulanan) 
    {
        this.pendapatanBulanan = pendapatanBulanan; // Inisialisasi atribut pendapatanBulanan dengan parameter
    }

    // Method getter getTotalSensor untuk mengambil total sensor
    public Long getTotalSensor() 
    {
        return totalSensor; // Mengembalikan nilai totalSensor
    }

    // Method setter setTotalSensor untuk mengubah total sensor
    public void setTotalSensor(Long totalSensor) 
    {
        this.totalSensor = totalSensor; // Inisialisasi atribut totalSensor dengan parameter
    }

    // Method getter getTotalSensorAktif untuk mengambil total sensor aktif
    public Long getTotalSensorAktif() 
    {
        return totalSensorAktif; // Mengembalikan nilai totalSensorAktif
    }

    // Method setter setTotalSensorAktif untuk mengubah total sensor aktif
    public void setTotalSensorAktif(Long totalSensorAktif) 
    {
        this.totalSensorAktif = totalSensorAktif; // Inisialisasi atribut totalSensorAktif dengan parameter
    }

    // Method getter getGrafikPendapatanHarian untuk mengambil grafik pendapatan harian
    public List<DataPendapatanHarianDto> getGrafikPendapatanHarian() 
    {
        return grafikPendapatanHarian; // Mengembalikan daftar grafikPendapatanHarian
    }

    // Method setter setGrafikPendapatanHarian untuk mengubah grafik pendapatan harian
    public void setGrafikPendapatanHarian(List<DataPendapatanHarianDto> grafikPendapatanHarian) 
    {
        this.grafikPendapatanHarian = grafikPendapatanHarian; // Inisialisasi atribut grafikPendapatanHarian dengan parameter
    }

    // Method getter getTotalTransaksiLunas untuk mengambil total transaksi lunas
    public Long getTotalTransaksiLunas() 
    {
        return totalTransaksiLunas; // Mengembalikan totalTransaksiLunas
    }

    // Method setter setTotalTransaksiLunas untuk mengubah total transaksi lunas
    public void setTotalTransaksiLunas(Long totalTransaksiLunas) 
    {
        this.totalTransaksiLunas = totalTransaksiLunas; // Inisialisasi atribut totalTransaksiLunas dengan parameter
    }

    // Method getter getRataRataTarifTransaksi untuk mengambil rata-rata tarif transaksi
    public BigDecimal getRataRataTarifTransaksi() 
    {
        return rataRataTarifTransaksi; // Mengembalikan rataRataTarifTransaksi
    }

    // Method setter setRataRataTarifTransaksi untuk mengubah rata-rata tarif transaksi
    public void setRataRataTarifTransaksi(BigDecimal rataRataTarifTransaksi) 
    {
        this.rataRataTarifTransaksi = rataRataTarifTransaksi; // Inisialisasi atribut rataRataTarifTransaksi dengan parameter
    }

    // Method getter getRevenuePerSlot untuk mengambil pendapatan per slot
    public BigDecimal getRevenuePerSlot() 
    {
        return revenuePerSlot; // Mengembalikan revenuePerSlot
    }

    // Method setter setRevenuePerSlot untuk mengubah pendapatan per slot
    public void setRevenuePerSlot(BigDecimal revenuePerSlot) 
    {
        this.revenuePerSlot = revenuePerSlot; // Inisialisasi atribut revenuePerSlot dengan parameter
    }

    // Method getter getOccupancyRateSaatIni untuk mengambil tingkat keterisian slot
    public Double getOccupancyRateSaatIni() 
    {
        return occupancyRateSaatIni; // Mengembalikan occupancyRateSaatIni
    }

    // Method setter setOccupancyRateSaatIni untuk mengubah tingkat keterisian slot
    public void setOccupancyRateSaatIni(Double occupancyRateSaatIni) 
    {
        this.occupancyRateSaatIni = occupancyRateSaatIni; // Inisialisasi atribut occupancyRateSaatIni dengan parameter
    }

    // Method getter getTotalKendaraanHariIni untuk mengambil volume kendaraan hari ini
    public Long getTotalKendaraanHariIni() 
    {
        return totalKendaraanHariIni; // Mengembalikan totalKendaraanHariIni
    }

    // Method setter setTotalKendaraanHariIni untuk mengubah volume kendaraan hari ini
    public void setTotalKendaraanHariIni(Long totalKendaraanHariIni) 
    {
        this.totalKendaraanHariIni = totalKendaraanHariIni; // Inisialisasi atribut totalKendaraanHariIni dengan parameter
    }
}
