package com.spct.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * DTO: LaporanResponseDto
 * Struktur data terpadu untuk menyajikan pratinjau (preview) dan dokumen unduhan
 * modul Laporan Operasional (PK-UC010) sesuai rancangan resmi.
 *
 * Mendukung 4 jenis laporan:
 * 1. Finansial
 * 2. Operasional & Okupansi
 * 3. Lingkungan (Eco-Metric)
 * 4. Komprehensif (Semua Modul)
 */
public class LaporanResponseDto
{
    private MetadataLaporanDto metadata;
    private List<KartuKpiDto> ringkasan = new ArrayList<>();
    private List<BarisFinansialDto> tabelFinansial = new ArrayList<>();
    private List<BarisOperasionalDto> tabelOperasional = new ArrayList<>();
    private List<BarisLingkunganDto> tabelLingkungan = new ArrayList<>();

    public LaporanResponseDto() {}

    public LaporanResponseDto(MetadataLaporanDto metadata,
                              List<KartuKpiDto> ringkasan,
                              List<BarisFinansialDto> tabelFinansial,
                              List<BarisOperasionalDto> tabelOperasional,
                              List<BarisLingkunganDto> tabelLingkungan)
    {
        this.metadata = metadata;
        this.ringkasan = (ringkasan != null) ? ringkasan : new ArrayList<>();
        this.tabelFinansial = (tabelFinansial != null) ? tabelFinansial : new ArrayList<>();
        this.tabelOperasional = (tabelOperasional != null) ? tabelOperasional : new ArrayList<>();
        this.tabelLingkungan = (tabelLingkungan != null) ? tabelLingkungan : new ArrayList<>();
    }

    // =====================================================================
    // Inner Class 1: Metadata Laporan
    // =====================================================================
    public static class MetadataLaporanDto
    {
        private String jenisLaporan;        // "finansial", "operasional", "lingkungan", "komprehensif"
        private String judulLaporan;        // "Laporan Finansial", dll
        private LocalDate tanggalMulai;     // Filter awal
        private LocalDate tanggalAkhir;     // Filter akhir
        private LocalDateTime waktuGenerate;// Timestamp laporan dibuat
        private int totalBaris;             // Jumlah rekaman data
        private boolean modeSimulasi;       // True jika belum terhubung payment gateway sungguhan
        private boolean kosong;             // True jika tidak ada data sama sekali
        private String pesanStatus;         // Pesan penjelasan (misal peringatan data kosong)

        public MetadataLaporanDto() {}

        public MetadataLaporanDto(String jenisLaporan, String judulLaporan,
                                  LocalDate tanggalMulai, LocalDate tanggalAkhir,
                                  LocalDateTime waktuGenerate, int totalBaris,
                                  boolean modeSimulasi, boolean kosong, String pesanStatus)
        {
            this.jenisLaporan = jenisLaporan;
            this.judulLaporan = judulLaporan;
            this.tanggalMulai = tanggalMulai;
            this.tanggalAkhir = tanggalAkhir;
            this.waktuGenerate = waktuGenerate;
            this.totalBaris = totalBaris;
            this.modeSimulasi = modeSimulasi;
            this.kosong = kosong;
            this.pesanStatus = pesanStatus;
        }

        public String getJenisLaporan() { return jenisLaporan; }
        public void setJenisLaporan(String jenisLaporan) { this.jenisLaporan = jenisLaporan; }
        public String getJudulLaporan() { return judulLaporan; }
        public void setJudulLaporan(String judulLaporan) { this.judulLaporan = judulLaporan; }
        public LocalDate getTanggalMulai() { return tanggalMulai; }
        public void setTanggalMulai(LocalDate tanggalMulai) { this.tanggalMulai = tanggalMulai; }
        public LocalDate getTanggalAkhir() { return tanggalAkhir; }
        public void setTanggalAkhir(LocalDate tanggalAkhir) { this.tanggalAkhir = tanggalAkhir; }
        public LocalDateTime getWaktuGenerate() { return waktuGenerate; }
        public void setWaktuGenerate(LocalDateTime waktuGenerate) { this.waktuGenerate = waktuGenerate; }
        public int getTotalBaris() { return totalBaris; }
        public void setTotalBaris(int totalBaris) { this.totalBaris = totalBaris; }
        public boolean isModeSimulasi() { return modeSimulasi; }
        public void setModeSimulasi(boolean modeSimulasi) { this.modeSimulasi = modeSimulasi; }
        public boolean isKosong() { return kosong; }
        public void setKosong(boolean kosong) { this.kosong = kosong; }
        public String getPesanStatus() { return pesanStatus; }
        public void setPesanStatus(String pesanStatus) { this.pesanStatus = pesanStatus; }
    }

    // =====================================================================
    // Inner Class 2: Kartu KPI Ringkasan
    // =====================================================================
    public static class KartuKpiDto
    {
        private String label;  // Misal: "Total Pendapatan"
        private String nilai;  // Misal: "Rp 24.892.500"
        private String satuan; // Misal: "Rp", "kg", "Kendaraan", "Kasus"
        private String warna;  // "eco-success", "primary", "secondary", "alert-anomaly"

        public KartuKpiDto() {}

        public KartuKpiDto(String label, String nilai, String satuan, String warna)
        {
            this.label = label;
            this.nilai = nilai;
            this.satuan = satuan;
            this.warna = warna;
        }

        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }
        public String getNilai() { return nilai; }
        public void setNilai(String nilai) { this.nilai = nilai; }
        public String getSatuan() { return satuan; }
        public void setSatuan(String satuan) { this.satuan = satuan; }
        public String getWarna() { return warna; }
        public void setWarna(String warna) { this.warna = warna; }
    }

    // =====================================================================
    // Inner Class 3: Baris Data Tabel Finansial
    // =====================================================================
    public static class BarisFinansialDto
    {
        private int no;
        private Long idTransaksi;
        private String nomorTiket;       // Misal: "TKT-0012"
        private String platNomor;
        private String jenisKendaraan;
        private String waktuMasuk;
        private String waktuKeluar;
        private Integer durasiMenit;
        private String durasiTeks;       // Misal: "2 Jam 15 Menit"
        private BigDecimal totalTarif;
        private String kanalPembayaran;  // "Simulasi Kiosk" (jujur dan transparan)
        private String statusPembayaran; // "LUNAS"
        private String referensiGateway; // "-"

        public BarisFinansialDto() {}

        public BarisFinansialDto(int no, Long idTransaksi, String nomorTiket, String platNomor,
                                 String jenisKendaraan, String waktuMasuk, String waktuKeluar,
                                 Integer durasiMenit, String durasiTeks, BigDecimal totalTarif,
                                 String kanalPembayaran, String statusPembayaran, String referensiGateway)
        {
            this.no = no;
            this.idTransaksi = idTransaksi;
            this.nomorTiket = nomorTiket;
            this.platNomor = platNomor;
            this.jenisKendaraan = jenisKendaraan;
            this.waktuMasuk = waktuMasuk;
            this.waktuKeluar = waktuKeluar;
            this.durasiMenit = durasiMenit;
            this.durasiTeks = durasiTeks;
            this.totalTarif = totalTarif;
            this.kanalPembayaran = kanalPembayaran;
            this.statusPembayaran = statusPembayaran;
            this.referensiGateway = referensiGateway;
        }

        public int getNo() { return no; }
        public void setNo(int no) { this.no = no; }
        public Long getIdTransaksi() { return idTransaksi; }
        public void setIdTransaksi(Long idTransaksi) { this.idTransaksi = idTransaksi; }
        public String getNomorTiket() { return nomorTiket; }
        public void setNomorTiket(String nomorTiket) { this.nomorTiket = nomorTiket; }
        public String getPlatNomor() { return platNomor; }
        public void setPlatNomor(String platNomor) { this.platNomor = platNomor; }
        public String getJenisKendaraan() { return jenisKendaraan; }
        public void setJenisKendaraan(String jenisKendaraan) { this.jenisKendaraan = jenisKendaraan; }
        public String getWaktuMasuk() { return waktuMasuk; }
        public void setWaktuMasuk(String waktuMasuk) { this.waktuMasuk = waktuMasuk; }
        public String getWaktuKeluar() { return waktuKeluar; }
        public void setWaktuKeluar(String waktuKeluar) { this.waktuKeluar = waktuKeluar; }
        public Integer getDurasiMenit() { return durasiMenit; }
        public void setDurasiMenit(Integer durasiMenit) { this.durasiMenit = durasiMenit; }
        public String getDurasiTeks() { return durasiTeks; }
        public void setDurasiTeks(String durasiTeks) { this.durasiTeks = durasiTeks; }
        public BigDecimal getTotalTarif() { return totalTarif; }
        public void setTotalTarif(BigDecimal totalTarif) { this.totalTarif = totalTarif; }
        public String getKanalPembayaran() { return kanalPembayaran; }
        public void setKanalPembayaran(String kanalPembayaran) { this.kanalPembayaran = kanalPembayaran; }
        public String getStatusPembayaran() { return statusPembayaran; }
        public void setStatusPembayaran(String statusPembayaran) { this.statusPembayaran = statusPembayaran; }
        public String getReferensiGateway() { return referensiGateway; }
        public void setReferensiGateway(String referensiGateway) { this.referensiGateway = referensiGateway; }
    }

    // =====================================================================
    // Inner Class 4: Baris Data Tabel Operasional & Anomali
    // =====================================================================
    public static class BarisOperasionalDto
    {
        // Deklarasi atribut no bertipe int untuk nomor urut baris tabel
        private int no;
        // Deklarasi atribut idLog bertipe String untuk menyimpan kode format log kejadian
        private String idLog;
        // Deklarasi atribut waktu bertipe String untuk format waktu kejadian
        private String waktu;
        // Deklarasi atribut idSlot bertipe String untuk identitas slot parkir terkait
        private String idSlot;
        // Deklarasi atribut jenisKejadian bertipe String untuk jenis event sistem IoT
        private String jenisKejadian;
        // Deklarasi atribut jenisAnomali bertipe String untuk menyimpan kategori anomali hasil input petugas
        private String jenisAnomali;
        // Deklarasi atribut catatanDetail bertipe String untuk deskripsi catatan log
        private String catatanDetail;
        // Deklarasi atribut tingkatKeparahan bertipe String untuk level severity log
        private String tingkatKeparahan;
        // Deklarasi atribut statusResolusi bertipe String untuk status validasi penanganan
        private String statusResolusi;

        // Constructor default tanpa parameter
        public BarisOperasionalDto() {}

        // Constructor dengan 8 parameter (kompatibilitas mundur)
        public BarisOperasionalDto(int no, String idLog, String waktu, String idSlot,
                                   String jenisKejadian, String catatanDetail,
                                   String tingkatKeparahan, String statusResolusi)
        {
            // Inisialisasi atribut no dengan parameter no
            this.no = no;
            // Inisialisasi atribut idLog dengan parameter idLog
            this.idLog = idLog;
            // Inisialisasi atribut waktu dengan parameter waktu
            this.waktu = waktu;
            // Inisialisasi atribut idSlot dengan parameter idSlot
            this.idSlot = idSlot;
            // Inisialisasi atribut jenisKejadian dengan parameter jenisKejadian
            this.jenisKejadian = jenisKejadian;
            // Inisialisasi atribut jenisAnomali dengan nilai default strip
            this.jenisAnomali = "-";
            // Inisialisasi atribut catatanDetail dengan parameter catatanDetail
            this.catatanDetail = catatanDetail;
            // Inisialisasi atribut tingkatKeparahan dengan parameter tingkatKeparahan
            this.tingkatKeparahan = tingkatKeparahan;
            // Inisialisasi atribut statusResolusi dengan parameter statusResolusi
            this.statusResolusi = statusResolusi;
        }

        // Constructor lengkap dengan 9 parameter menyertakan jenisAnomali
        public BarisOperasionalDto(int no, String idLog, String waktu, String idSlot,
                                   String jenisKejadian, String jenisAnomali, String catatanDetail,
                                   String tingkatKeparahan, String statusResolusi)
        {
            // Inisialisasi atribut no dengan parameter no
            this.no = no;
            // Inisialisasi atribut idLog dengan parameter idLog
            this.idLog = idLog;
            // Inisialisasi atribut waktu dengan parameter waktu
            this.waktu = waktu;
            // Inisialisasi atribut idSlot dengan parameter idSlot
            this.idSlot = idSlot;
            // Inisialisasi atribut jenisKejadian dengan parameter jenisKejadian
            this.jenisKejadian = jenisKejadian;
            // Inisialisasi atribut jenisAnomali dengan parameter jenisAnomali
            this.jenisAnomali = (jenisAnomali != null && !jenisAnomali.trim().isEmpty()) ? jenisAnomali : "-";
            // Inisialisasi atribut catatanDetail dengan parameter catatanDetail
            this.catatanDetail = catatanDetail;
            // Inisialisasi atribut tingkatKeparahan dengan parameter tingkatKeparahan
            this.tingkatKeparahan = tingkatKeparahan;
            // Inisialisasi atribut statusResolusi dengan parameter statusResolusi
            this.statusResolusi = statusResolusi;
        }

        public int getNo() { return no; }
        public void setNo(int no) { this.no = no; }
        public String getIdLog() { return idLog; }
        public void setIdLog(String idLog) { this.idLog = idLog; }
        public String getWaktu() { return waktu; }
        public void setWaktu(String waktu) { this.waktu = waktu; }
        public String getIdSlot() { return idSlot; }
        public void setIdSlot(String idSlot) { this.idSlot = idSlot; }
        public String getJenisKejadian() { return jenisKejadian; }
        public void setJenisKejadian(String jenisKejadian) { this.jenisKejadian = jenisKejadian; }
        // Method getter getJenisAnomali() untuk mengambil nilai jenis anomali
        public String getJenisAnomali() { return jenisAnomali; }
        // Method setter setJenisAnomali(String) untuk mengubah nilai jenis anomali
        public void setJenisAnomali(String jenisAnomali) { this.jenisAnomali = jenisAnomali; }
        public String getCatatanDetail() { return catatanDetail; }
        public void setCatatanDetail(String catatanDetail) { this.catatanDetail = catatanDetail; }
        public String getTingkatKeparahan() { return tingkatKeparahan; }
        public void setTingkatKeparahan(String tingkatKeparahan) { this.tingkatKeparahan = tingkatKeparahan; }
        public String getStatusResolusi() { return statusResolusi; }
        public void setStatusResolusi(String statusResolusi) { this.statusResolusi = statusResolusi; }
    }

    // =====================================================================
    // Inner Class 5: Baris Data Tabel Lingkungan (Eco-Metric)
    // =====================================================================
    public static class BarisLingkunganDto
    {
        private int no;
        private String platNomor;
        private String idSlot;
        private String waktuMasuk;
        private String waktuTiba;
        private Long durasiTempuhDetik;
        private Long waktuNormalDetik;  // Baseline tanpa navigasi cerdas
        private Double menitDihemat;
        private Double reduksiCo2Gram;

        public BarisLingkunganDto() {}

        public BarisLingkunganDto(int no, String platNomor, String idSlot, String waktuMasuk,
                                  String waktuTiba, Long durasiTempuhDetik, Long waktuNormalDetik,
                                  Double menitDihemat, Double reduksiCo2Gram)
        {
            this.no = no;
            this.platNomor = platNomor;
            this.idSlot = idSlot;
            this.waktuMasuk = waktuMasuk;
            this.waktuTiba = waktuTiba;
            this.durasiTempuhDetik = durasiTempuhDetik;
            this.waktuNormalDetik = waktuNormalDetik;
            this.menitDihemat = menitDihemat;
            this.reduksiCo2Gram = reduksiCo2Gram;
        }

        public int getNo() { return no; }
        public void setNo(int no) { this.no = no; }
        public String getPlatNomor() { return platNomor; }
        public void setPlatNomor(String platNomor) { this.platNomor = platNomor; }
        public String getIdSlot() { return idSlot; }
        public void setIdSlot(String idSlot) { this.idSlot = idSlot; }
        public String getWaktuMasuk() { return waktuMasuk; }
        public void setWaktuMasuk(String waktuMasuk) { this.waktuMasuk = waktuMasuk; }
        public String getWaktuTiba() { return waktuTiba; }
        public void setWaktuTiba(String waktuTiba) { this.waktuTiba = waktuTiba; }
        public Long getDurasiTempuhDetik() { return durasiTempuhDetik; }
        public void setDurasiTempuhDetik(Long durasiTempuhDetik) { this.durasiTempuhDetik = durasiTempuhDetik; }
        public Long getWaktuNormalDetik() { return waktuNormalDetik; }
        public void setWaktuNormalDetik(Long waktuNormalDetik) { this.waktuNormalDetik = waktuNormalDetik; }
        public Double getMenitDihemat() { return menitDihemat; }
        public void setMenitDihemat(Double menitDihemat) { this.menitDihemat = menitDihemat; }
        public Double getReduksiCo2Gram() { return reduksiCo2Gram; }
        public void setReduksiCo2Gram(Double reduksiCo2Gram) { this.reduksiCo2Gram = reduksiCo2Gram; }
    }

    // =====================================================================
    // Getter & Setter Kelas Utama
    // =====================================================================
    public MetadataLaporanDto getMetadata() { return metadata; }
    public void setMetadata(MetadataLaporanDto metadata) { this.metadata = metadata; }
    public List<KartuKpiDto> getRingkasan() { return ringkasan; }
    public void setRingkasan(List<KartuKpiDto> ringkasan) { this.ringkasan = ringkasan; }
    public List<BarisFinansialDto> getTabelFinansial() { return tabelFinansial; }
    public void setTabelFinansial(List<BarisFinansialDto> tabelFinansial) { this.tabelFinansial = tabelFinansial; }
    public List<BarisOperasionalDto> getTabelOperasional() { return tabelOperasional; }
    public void setTabelOperasional(List<BarisOperasionalDto> tabelOperasional) { this.tabelOperasional = tabelOperasional; }
    public List<BarisLingkunganDto> getTabelLingkungan() { return tabelLingkungan; }
    public void setTabelLingkungan(List<BarisLingkunganDto> tabelLingkungan) { this.tabelLingkungan = tabelLingkungan; }
}
