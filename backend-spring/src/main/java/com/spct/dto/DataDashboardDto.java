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

    private BigDecimal pendapatanTotal;      // Total pendapatan kotor dari transaksi LUNAS di periode ini
    private Long totalKendaraan;             // Jumlah total kendaraan yang masuk (volume lalu lintas)
    private Long totalAnomali;               // Jumlah kejadian anomali IoT yang terjadi di periode ini
    private Long slotKosongSaatIni;          // Jumlah slot parkir yang sedang kosong (real-time)
    private Long slotTerisiSaatIni;          // Jumlah slot parkir yang sedang terisi (real-time)
    private Double reduksiCo2Kg;             // Estimasi reduksi emisi CO2 berkat sistem navigasi (Eco-Metrics)
    private List<DataOkupansiJamDto> grafikOkupansiPerJam; // Array data untuk grafik Chart.js per jam


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
    // Konstruktor LENGKAP (gaya penulisan Anda)
    // =====================================================================
    public DataDashboardDto(BigDecimal pendapatanTotal, Long totalKendaraan, Long totalAnomali,
                             Long slotKosongSaatIni, Long slotTerisiSaatIni,
                             Double reduksiCo2Kg, List<DataOkupansiJamDto> grafikOkupansiPerJam)
    {
        this.pendapatanTotal = pendapatanTotal;         // Menginisialisasi atribut pendapatanTotal
        this.totalKendaraan = totalKendaraan;           // Menginisialisasi atribut totalKendaraan
        this.totalAnomali = totalAnomali;               // Menginisialisasi atribut totalAnomali
        this.slotKosongSaatIni = slotKosongSaatIni;   // Menginisialisasi atribut slotKosongSaatIni
        this.slotTerisiSaatIni = slotTerisiSaatIni;   // Menginisialisasi atribut slotTerisiSaatIni
        this.reduksiCo2Kg = reduksiCo2Kg;             // Menginisialisasi atribut reduksiCo2Kg
        this.grafikOkupansiPerJam = grafikOkupansiPerJam; // Menginisialisasi atribut grafikOkupansiPerJam
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
}
