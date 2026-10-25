package com.spct.dto; // Nama package dari modul data transfer object (DTO)

// Import tipe data BigDecimal untuk ketelitian perhitungan mata uang rupiah
import java.math.BigDecimal;
// Import tipe data tanggal lokal java
import java.time.LocalDate;
// Import tipe data tanggal dan waktu lokal java
import java.time.LocalDateTime;
// Import koleksi ArrayList dari java util
import java.util.ArrayList;
// Import koleksi List dari java util
import java.util.List;

// Kelas publik java LaporanResponseDto untuk menyajikan pratinjau data laporan resmi (finansial, operasional, lingkungan, komprehensif)
public class LaporanResponseDto
{
    // =====================================================================
    // Deklarasi Atribut Utama Laporan
    // =====================================================================

    // Deklarasi atribut metadata bertipe MetadataLaporanDto untuk informasi judul dan filter
    private MetadataLaporanDto metadata;

    // Deklarasi atribut ringkasan bertipe List<KartuKpiDto> untuk kartu-kartu ringkasan metrik utama
    private List<KartuKpiDto> ringkasan = new ArrayList<>();

    // Deklarasi atribut tabelFinansial bertipe List<BarisFinansialDto> untuk baris rekaman transaksi keuangan
    private List<BarisFinansialDto> tabelFinansial = new ArrayList<>();

    // Deklarasi atribut tabelOperasional bertipe List<BarisOperasionalDto> untuk rekaman anomali operasional
    private List<BarisOperasionalDto> tabelOperasional = new ArrayList<>();

    // Deklarasi atribut tabelLingkungan bertipe List<BarisLingkunganDto> untuk rekaman reduksi emisi CO2
    private List<BarisLingkunganDto> tabelLingkungan = new ArrayList<>();

    // Konstruktor default tanpa parameter
    public LaporanResponseDto() 
    {
        // Konstruktor kosong untuk instansiasi awal
    }

    // Konstruktor berparameter lengkap
    public LaporanResponseDto(MetadataLaporanDto metadata,
                              List<KartuKpiDto> ringkasan,
                              List<BarisFinansialDto> tabelFinansial,
                              List<BarisOperasionalDto> tabelOperasional,
                              List<BarisLingkunganDto> tabelLingkungan)
    {
        this.metadata = metadata; // Inisialisasi atribut metadata dengan parameter
        this.ringkasan = (ringkasan != null) ? ringkasan : new ArrayList<>(); // Inisialisasi atribut ringkasan
        this.tabelFinansial = (tabelFinansial != null) ? tabelFinansial : new ArrayList<>(); // Inisialisasi tabelFinansial
        this.tabelOperasional = (tabelOperasional != null) ? tabelOperasional : new ArrayList<>(); // Inisialisasi tabelOperasional
        this.tabelLingkungan = (tabelLingkungan != null) ? tabelLingkungan : new ArrayList<>(); // Inisialisasi tabelLingkungan
    }

    // =====================================================================
    // Inner Class 1: Metadata Laporan
    // =====================================================================
    public static class MetadataLaporanDto
    {
        private String jenisLaporan; // Deklarasi atribut jenisLaporan bertipe String (finansial/operasional/lingkungan/komprehensif)
        private String judulLaporan; // Deklarasi atribut judulLaporan bertipe String untuk judul dokumen resmi
        private LocalDate tanggalMulai; // Deklarasi atribut tanggalMulai bertipe LocalDate untuk filter awal tanggal
        private LocalDate tanggalAkhir; // Deklarasi atribut tanggalAkhir bertipe LocalDate untuk filter akhir tanggal
        private LocalDateTime waktuGenerate; // Deklarasi atribut waktuGenerate bertipe LocalDateTime untuk timestamp cetak
        private int totalBaris; // Deklarasi atribut totalBaris bertipe int untuk kuantitas baris data
        private boolean modeSimulasi; // Deklarasi atribut modeSimulasi bertipe boolean untuk penanda data simulasi
        private boolean kosong; // Deklarasi atribut kosong bertipe boolean jika tidak ada data yang ditemukan
        private String pesanStatus; // Deklarasi atribut pesanStatus bertipe String untuk keterangan status laporan

        // Konstruktor default tanpa parameter
        public MetadataLaporanDto() {}

        // Konstruktor lengkap berparameter
        public MetadataLaporanDto(String jenisLaporan, String judulLaporan,
                                  LocalDate tanggalMulai, LocalDate tanggalAkhir,
                                  LocalDateTime waktuGenerate, int totalBaris,
                                  boolean modeSimulasi, boolean kosong, String pesanStatus)
        {
            this.jenisLaporan = jenisLaporan; // Inisialisasi atribut jenisLaporan dengan parameter
            this.judulLaporan = judulLaporan; // Inisialisasi atribut judulLaporan dengan parameter
            this.tanggalMulai = tanggalMulai; // Inisialisasi atribut tanggalMulai dengan parameter
            this.tanggalAkhir = tanggalAkhir; // Inisialisasi atribut tanggalAkhir dengan parameter
            this.waktuGenerate = waktuGenerate; // Inisialisasi atribut waktuGenerate dengan parameter
            this.totalBaris = totalBaris; // Inisialisasi atribut totalBaris dengan parameter
            this.modeSimulasi = modeSimulasi; // Inisialisasi atribut modeSimulasi dengan parameter
            this.kosong = kosong; // Inisialisasi atribut kosong dengan parameter
            this.pesanStatus = pesanStatus; // Inisialisasi atribut pesanStatus dengan parameter
        }

        // Method getter getJenisLaporan untuk mengambil jenis laporan
        public String getJenisLaporan() { return jenisLaporan; }
        // Method setter setJenisLaporan untuk mengubah jenis laporan
        public void setJenisLaporan(String jenisLaporan) { this.jenisLaporan = jenisLaporan; }
        // Method getter getJudulLaporan untuk mengambil judul laporan
        public String getJudulLaporan() { return judulLaporan; }
        // Method setter setJudulLaporan untuk mengubah judul laporan
        public void setJudulLaporan(String judulLaporan) { this.judulLaporan = judulLaporan; }
        // Method getter getTanggalMulai untuk mengambil batas awal tanggal
        public LocalDate getTanggalMulai() { return tanggalMulai; }
        // Method setter setTanggalMulai untuk mengubah batas awal tanggal
        public void setTanggalMulai(LocalDate tanggalMulai) { this.tanggalMulai = tanggalMulai; }
        // Method getter getTanggalAkhir untuk mengambil batas akhir tanggal
        public LocalDate getTanggalAkhir() { return tanggalAkhir; }
        // Method setter setTanggalAkhir untuk mengubah batas akhir tanggal
        public void setTanggalAkhir(LocalDate tanggalAkhir) { this.tanggalAkhir = tanggalAkhir; }
        // Method getter getWaktuGenerate untuk mengambil timestamp dokumen dibuat
        public LocalDateTime getWaktuGenerate() { return waktuGenerate; }
        // Method setter setWaktuGenerate untuk mengubah timestamp dokumen dibuat
        public void setWaktuGenerate(LocalDateTime waktuGenerate) { this.waktuGenerate = waktuGenerate; }
        // Method getter getTotalBaris untuk mengambil total jumlah baris
        public int getTotalBaris() { return totalBaris; }
        // Method setter setTotalBaris untuk mengubah total jumlah baris
        public void setTotalBaris(int totalBaris) { this.totalBaris = totalBaris; }
        // Method getter isModeSimulasi untuk memeriksa status mode simulasi
        public boolean isModeSimulasi() { return modeSimulasi; }
        // Method setter setModeSimulasi untuk mengubah status mode simulasi
        public void setModeSimulasi(boolean modeSimulasi) { this.modeSimulasi = modeSimulasi; }
        // Method getter isKosong untuk memeriksa ketersediaan data laporan
        public boolean isKosong() { return kosong; }
        // Method setter setKosong untuk mengubah ketersediaan data laporan
        public void setKosong(boolean kosong) { this.kosong = kosong; }
        // Method getter getPesanStatus untuk mengambil keterangan status
        public String getPesanStatus() { return pesanStatus; }
        // Method setter setPesanStatus untuk mengubah keterangan status
        public void setPesanStatus(String pesanStatus) { this.pesanStatus = pesanStatus; }
    }

    // =====================================================================
    // Inner Class 2: Kartu KPI Ringkasan
    // =====================================================================
    public static class KartuKpiDto
    {
        private String label;  // Deklarasi atribut label bertipe String untuk judul metrik kartu
        private String nilai;  // Deklarasi atribut nilai bertipe String untuk teks nilai angka terformat
        private String satuan; // Deklarasi atribut satuan bertipe String untuk satuan unit (Rp, kg, kasus)
        private String warna;  // Deklarasi atribut warna bertipe String untuk kode tema warna tampilan UI

        // Konstruktor default tanpa parameter
        public KartuKpiDto() {}

        // Konstruktor dengan parameter lengkap
        public KartuKpiDto(String label, String nilai, String satuan, String warna)
        {
            this.label = label; // Inisialisasi atribut label dengan parameter
            this.nilai = nilai; // Inisialisasi atribut nilai dengan parameter
            this.satuan = satuan; // Inisialisasi atribut satuan dengan parameter
            this.warna = warna; // Inisialisasi atribut warna dengan parameter
        }

        // Method getter getLabel untuk mengambil label metrik
        public String getLabel() { return label; }
        // Method setter setLabel untuk mengubah label metrik
        public void setLabel(String label) { this.label = label; }
        // Method getter getNilai untuk mengambil nilai metrik
        public String getNilai() { return nilai; }
        // Method setter setNilai untuk mengubah nilai metrik
        public void setNilai(String nilai) { this.nilai = nilai; }
        // Method getter getSatuan untuk mengambil satuan metrik
        public String getSatuan() { return satuan; }
        // Method setter setSatuan untuk mengubah satuan metrik
        public void setSatuan(String satuan) { this.satuan = satuan; }
        // Method getter getWarna untuk mengambil warna tema metrik
        public String getWarna() { return warna; }
        // Method setter setWarna untuk mengubah warna tema metrik
        public void setWarna(String warna) { this.warna = warna; }
    }

    // =====================================================================
    // Inner Class 3: Baris Data Tabel Finansial
    // =====================================================================
    public static class BarisFinansialDto
    {
        private int no; // Deklarasi atribut no bertipe int untuk nomor urut
        private Long idTransaksi; // Deklarasi atribut idTransaksi bertipe Long untuk ID tiket transaksi
        private String nomorTiket; // Deklarasi atribut nomorTiket bertipe String untuk kode tiket (TKT-0012)
        private String platNomor; // Deklarasi atribut platNomor bertipe String untuk nomor plat kendaraan
        private String jenisKendaraan; // Deklarasi atribut jenisKendaraan bertipe String untuk jenis kendaraan
        private String waktuMasuk; // Deklarasi atribut waktuMasuk bertipe String untuk waktu masuk
        private String waktuKeluar; // Deklarasi atribut waktuKeluar bertipe String untuk waktu keluar
        private Integer durasiMenit; // Deklarasi atribut durasiMenit bertipe Integer untuk lama parkir dalam menit
        private String durasiTeks; // Deklarasi atribut durasiTeks bertipe String untuk representasi teks lama waktu
        private BigDecimal totalTarif; // Deklarasi atribut totalTarif bertipe BigDecimal untuk jumlah rupiah bayar
        private String kanalPembayaran; // Deklarasi atribut kanalPembayaran bertipe String untuk metode pembayaran
        private String statusPembayaran; // Deklarasi atribut statusPembayaran bertipe String untuk status lunas
        private String referensiGateway; // Deklarasi atribut referensiGateway bertipe String untuk kode settlement

        // Konstruktor default tanpa parameter
        public BarisFinansialDto() {}

        // Konstruktor lengkap berparameter
        public BarisFinansialDto(int no, Long idTransaksi, String nomorTiket, String platNomor,
                                 String jenisKendaraan, String waktuMasuk, String waktuKeluar,
                                 Integer durasiMenit, String durasiTeks, BigDecimal totalTarif,
                                 String kanalPembayaran, String statusPembayaran, String referensiGateway)
        {
            this.no = no; // Inisialisasi atribut no dengan parameter
            this.idTransaksi = idTransaksi; // Inisialisasi atribut idTransaksi dengan parameter
            this.nomorTiket = nomorTiket; // Inisialisasi atribut nomorTiket dengan parameter
            this.platNomor = platNomor; // Inisialisasi atribut platNomor dengan parameter
            this.jenisKendaraan = jenisKendaraan; // Inisialisasi atribut jenisKendaraan dengan parameter
            this.waktuMasuk = waktuMasuk; // Inisialisasi atribut waktuMasuk dengan parameter
            this.waktuKeluar = waktuKeluar; // Inisialisasi atribut waktuKeluar dengan parameter
            this.durasiMenit = durasiMenit; // Inisialisasi atribut durasiMenit dengan parameter
            this.durasiTeks = durasiTeks; // Inisialisasi atribut durasiTeks dengan parameter
            this.totalTarif = totalTarif; // Inisialisasi atribut totalTarif dengan parameter
            this.kanalPembayaran = kanalPembayaran; // Inisialisasi atribut kanalPembayaran dengan parameter
            this.statusPembayaran = statusPembayaran; // Inisialisasi atribut statusPembayaran dengan parameter
            this.referensiGateway = referensiGateway; // Inisialisasi atribut referensiGateway dengan parameter
        }

        // Method getter getNo untuk mengambil nomor urut
        public int getNo() { return no; }
        // Method setter setNo untuk mengubah nomor urut
        public void setNo(int no) { this.no = no; }
        // Method getter getIdTransaksi untuk mengambil ID transaksi
        public Long getIdTransaksi() { return idTransaksi; }
        // Method setter setIdTransaksi untuk mengubah ID transaksi
        public void setIdTransaksi(Long idTransaksi) { this.idTransaksi = idTransaksi; }
        // Method getter getNomorTiket untuk mengambil nomor tiket
        public String getNomorTiket() { return nomorTiket; }
        // Method setter setNomorTiket untuk mengubah nomor tiket
        public void setNomorTiket(String nomorTiket) { this.nomorTiket = nomorTiket; }
        // Method getter getPlatNomor untuk mengambil plat nomor
        public String getPlatNomor() { return platNomor; }
        // Method setter setPlatNomor untuk mengubah plat nomor
        public void setPlatNomor(String platNomor) { this.platNomor = platNomor; }
        // Method getter getJenisKendaraan untuk mengambil tipe jenis kendaraan
        public String getJenisKendaraan() { return jenisKendaraan; }
        // Method setter setJenisKendaraan untuk mengubah tipe jenis kendaraan
        public void setJenisKendaraan(String jenisKendaraan) { this.jenisKendaraan = jenisKendaraan; }
        // Method getter getWaktuMasuk untuk mengambil waktu masuk
        public String getWaktuMasuk() { return waktuMasuk; }
        // Method setter setWaktuMasuk untuk mengubah waktu masuk
        public void setWaktuMasuk(String waktuMasuk) { this.waktuMasuk = waktuMasuk; }
        // Method getter getWaktuKeluar untuk mengambil waktu keluar
        public String getWaktuKeluar() { return waktuKeluar; }
        // Method setter setWaktuKeluar untuk mengubah waktu keluar
        public void setWaktuKeluar(String waktuKeluar) { this.waktuKeluar = waktuKeluar; }
        // Method getter getDurasiMenit untuk mengambil lama durasi dalam menit
        public Integer getDurasiMenit() { return durasiMenit; }
        // Method setter setDurasiMenit untuk mengubah lama durasi dalam menit
        public void setDurasiMenit(Integer durasiMenit) { this.durasiMenit = durasiMenit; }
        // Method getter getDurasiTeks untuk mengambil teks keterangan durasi
        public String getDurasiTeks() { return durasiTeks; }
        // Method setter setDurasiTeks untuk mengubah teks keterangan durasi
        public void setDurasiTeks(String durasiTeks) { this.durasiTeks = durasiTeks; }
        // Method getter getTotalTarif untuk mengambil total tarif bayar
        public BigDecimal getTotalTarif() { return totalTarif; }
        // Method setter setTotalTarif untuk mengubah total tarif bayar
        public void setTotalTarif(BigDecimal totalTarif) { this.totalTarif = totalTarif; }
        // Method getter getKanalPembayaran untuk mengambil opsi kanal pembayaran
        public String getKanalPembayaran() { return kanalPembayaran; }
        // Method setter setKanalPembayaran untuk mengubah opsi kanal pembayaran
        public void setKanalPembayaran(String kanalPembayaran) { this.kanalPembayaran = kanalPembayaran; }
        // Method getter getStatusPembayaran untuk mengambil status pembayaran
        public String getStatusPembayaran() { return statusPembayaran; }
        // Method setter setStatusPembayaran untuk mengubah status pembayaran
        public void setStatusPembayaran(String statusPembayaran) { this.statusPembayaran = statusPembayaran; }
        // Method getter getReferensiGateway untuk mengambil kode referensi gateway
        public String getReferensiGateway() { return referensiGateway; }
        // Method setter setReferensiGateway untuk mengubah kode referensi gateway
        public void setReferensiGateway(String referensiGateway) { this.referensiGateway = referensiGateway; }
    }

    // =====================================================================
    // Inner Class 4: Baris Data Tabel Operasional & Anomali
    // =====================================================================
    public static class BarisOperasionalDto
    {
        private int no; // Deklarasi atribut no bertipe int untuk nomor urut
        private String idLog; // Deklarasi atribut idLog bertipe String untuk kode log kejadian
        private String waktu; // Deklarasi atribut waktu bertipe String untuk format waktu kejadian
        private String idSlot; // Deklarasi atribut idSlot bertipe String untuk identitas slot parkir terkait
        private String jenisKejadian; // Deklarasi atribut jenisKejadian bertipe String untuk jenis event
        private String jenisAnomali; // Deklarasi atribut jenisAnomali bertipe String untuk klasifikasi anomali petugas
        private String catatanDetail; // Deklarasi atribut catatanDetail bertipe String untuk deskripsi catatan
        private String tingkatKeparahan; // Deklarasi atribut tingkatKeparahan bertipe String untuk level severity
        private String statusResolusi; // Deklarasi atribut statusResolusi bertipe String untuk status penanganan

        // Konstruktor default tanpa parameter
        public BarisOperasionalDto() {}

        // Konstruktor dengan 8 parameter untuk kompatibilitas mundur
        public BarisOperasionalDto(int no, String idLog, String waktu, String idSlot,
                                   String jenisKejadian, String catatanDetail,
                                   String tingkatKeparahan, String statusResolusi)
        {
            this.no = no; // Inisialisasi atribut no dengan parameter
            this.idLog = idLog; // Inisialisasi atribut idLog dengan parameter
            this.waktu = waktu; // Inisialisasi atribut waktu dengan parameter
            this.idSlot = idSlot; // Inisialisasi atribut idSlot dengan parameter
            this.jenisKejadian = jenisKejadian; // Inisialisasi atribut jenisKejadian dengan parameter
            this.jenisAnomali = "-"; // Inisialisasi nilai awal jenis anomali dengan tanda strip
            this.catatanDetail = catatanDetail; // Inisialisasi atribut catatanDetail dengan parameter
            this.tingkatKeparahan = tingkatKeparahan; // Inisialisasi atribut tingkatKeparahan dengan parameter
            this.statusResolusi = statusResolusi; // Inisialisasi atribut statusResolusi dengan parameter
        }

        // Konstruktor lengkap dengan 9 parameter termasuk jenisAnomali
        public BarisOperasionalDto(int no, String idLog, String waktu, String idSlot,
                                   String jenisKejadian, String jenisAnomali, String catatanDetail,
                                   String tingkatKeparahan, String statusResolusi)
        {
            this.no = no; // Inisialisasi atribut no dengan parameter
            this.idLog = idLog; // Inisialisasi atribut idLog dengan parameter
            this.waktu = waktu; // Inisialisasi atribut waktu dengan parameter
            this.idSlot = idSlot; // Inisialisasi atribut idSlot dengan parameter
            this.jenisKejadian = jenisKejadian; // Inisialisasi atribut jenisKejadian dengan parameter
            this.jenisAnomali = (jenisAnomali != null && !jenisAnomali.trim().isEmpty()) ? jenisAnomali : "-"; // Validasi nilai jenis anomali
            this.catatanDetail = catatanDetail; // Inisialisasi atribut catatanDetail dengan parameter
            this.tingkatKeparahan = tingkatKeparahan; // Inisialisasi atribut tingkatKeparahan dengan parameter
            this.statusResolusi = statusResolusi; // Inisialisasi atribut statusResolusi dengan parameter
        }

        // Method getter getNo untuk mengambil nomor urut baris
        public int getNo() { return no; }
        // Method setter setNo untuk mengubah nomor urut baris
        public void setNo(int no) { this.no = no; }
        // Method getter getIdLog untuk mengambil kode ID log
        public String getIdLog() { return idLog; }
        // Method setter setIdLog untuk mengubah kode ID log
        public void setIdLog(String idLog) { this.idLog = idLog; }
        // Method getter getWaktu untuk mengambil teks waktu kejadian
        public String getWaktu() { return waktu; }
        // Method setter setWaktu untuk mengubah teks waktu kejadian
        public void setWaktu(String waktu) { this.waktu = waktu; }
        // Method getter getIdSlot untuk mengambil nomor slot parkir
        public String getIdSlot() { return idSlot; }
        // Method setter setIdSlot untuk mengubah nomor slot parkir
        public void setIdSlot(String idSlot) { this.idSlot = idSlot; }
        // Method getter getJenisKejadian untuk mengambil jenis kejadian
        public String getJenisKejadian() { return jenisKejadian; }
        // Method setter setJenisKejadian untuk mengubah jenis kejadian
        public void setJenisKejadian(String jenisKejadian) { this.jenisKejadian = jenisKejadian; }
        // Method getter getJenisAnomali untuk mengambil kategori anomali petugas
        public String getJenisAnomali() { return jenisAnomali; }
        // Method setter setJenisAnomali untuk mengubah kategori anomali petugas
        public void setJenisAnomali(String jenisAnomali) { this.jenisAnomali = jenisAnomali; }
        // Method getter getCatatanDetail untuk mengambil teks detail catatan
        public String getCatatanDetail() { return catatanDetail; }
        // Method setter setCatatanDetail untuk mengubah teks detail catatan
        public void setCatatanDetail(String catatanDetail) { this.catatanDetail = catatanDetail; }
        // Method getter getTingkatKeparahan untuk mengambil derajat keparahan insiden
        public String getTingkatKeparahan() { return tingkatKeparahan; }
        // Method setter setTingkatKeparahan untuk mengubah derajat keparahan insiden
        public void setTingkatKeparahan(String tingkatKeparahan) { this.tingkatKeparahan = tingkatKeparahan; }
        // Method getter getStatusResolusi untuk mengambil status resolusi validasi
        public String getStatusResolusi() { return statusResolusi; }
        // Method setter setStatusResolusi untuk mengubah status resolusi validasi
        public void setStatusResolusi(String statusResolusi) { this.statusResolusi = statusResolusi; }
    }

    // =====================================================================
    // Inner Class 5: Baris Data Tabel Lingkungan (Eco-Metric)
    // =====================================================================
    public static class BarisLingkunganDto
    {
        private int no; // Deklarasi atribut no bertipe int untuk nomor urut
        private String platNomor; // Deklarasi atribut platNomor bertipe String untuk plat nomor kendaraan
        private String idSlot; // Deklarasi atribut idSlot bertipe String untuk nomor slot parkir tujuan
        private String waktuMasuk; // Deklarasi atribut waktuMasuk bertipe String untuk jam masuk
        private String waktuTiba; // Deklarasi atribut waktuTiba bertipe String untuk jam tiba di slot
        private Long durasiTempuhDetik; // Deklarasi atribut durasiTempuhDetik bertipe Long untuk lama waktu tempuh nyata
        private Long waktuNormalDetik; // Deklarasi atribut waktuNormalDetik bertipe Long untuk estimasi waktu tanpa sistem
        private Double menitDihemat; // Deklarasi atribut menitDihemat bertipe Double untuk selisih waktu efisiensi navigasi
        private Double reduksiCo2Gram; // Deklarasi atribut reduksiCo2Gram bertipe Double untuk pengurangan emisi karbon (gram)

        // Konstruktor default tanpa parameter
        public BarisLingkunganDto() {}

        // Konstruktor lengkap berparameter
        public BarisLingkunganDto(int no, String platNomor, String idSlot, String waktuMasuk,
                                  String waktuTiba, Long durasiTempuhDetik, Long waktuNormalDetik,
                                  Double menitDihemat, Double reduksiCo2Gram)
        {
            this.no = no; // Inisialisasi atribut no dengan parameter
            this.platNomor = platNomor; // Inisialisasi atribut platNomor dengan parameter
            this.idSlot = idSlot; // Inisialisasi atribut idSlot dengan parameter
            this.waktuMasuk = waktuMasuk; // Inisialisasi atribut waktuMasuk dengan parameter
            this.waktuTiba = waktuTiba; // Inisialisasi atribut waktuTiba dengan parameter
            this.durasiTempuhDetik = durasiTempuhDetik; // Inisialisasi atribut durasiTempuhDetik dengan parameter
            this.waktuNormalDetik = waktuNormalDetik; // Inisialisasi atribut waktuNormalDetik dengan parameter
            this.menitDihemat = menitDihemat; // Inisialisasi atribut menitDihemat dengan parameter
            this.reduksiCo2Gram = reduksiCo2Gram; // Inisialisasi atribut reduksiCo2Gram dengan parameter
        }

        // Method getter getNo untuk mengambil nomor urut
        public int getNo() { return no; }
        // Method setter setNo untuk mengubah nomor urut
        public void setNo(int no) { this.no = no; }
        // Method getter getPlatNomor untuk mengambil nomor plat
        public String getPlatNomor() { return platNomor; }
        // Method setter setPlatNomor untuk mengubah nomor plat
        public void setPlatNomor(String platNomor) { this.platNomor = platNomor; }
        // Method getter getIdSlot untuk mengambil nomor slot
        public String getIdSlot() { return idSlot; }
        // Method setter setIdSlot untuk mengubah nomor slot
        public void setIdSlot(String idSlot) { this.idSlot = idSlot; }
        // Method getter getWaktuMasuk untuk mengambil waktu masuk
        public String getWaktuMasuk() { return waktuMasuk; }
        // Method setter setWaktuMasuk untuk mengubah waktu masuk
        public void setWaktuMasuk(String waktuMasuk) { this.waktuMasuk = waktuMasuk; }
        // Method getter getWaktuTiba untuk mengambil waktu tiba
        public String getWaktuTiba() { return waktuTiba; }
        // Method setter setWaktuTiba untuk mengubah waktu tiba
        public void setWaktuTiba(String waktuTiba) { this.waktuTiba = waktuTiba; }
        // Method getter getDurasiTempuhDetik untuk mengambil durasi tempuh dalam detik
        public Long getDurasiTempuhDetik() { return durasiTempuhDetik; }
        // Method setter setDurasiTempuhDetik untuk mengubah durasi tempuh dalam detik
        public void setDurasiTempuhDetik(Long durasiTempuhDetik) { this.durasiTempuhDetik = durasiTempuhDetik; }
        // Method getter getWaktuNormalDetik untuk mengambil waktu tempuh normal baseline
        public Long getWaktuNormalDetik() { return waktuNormalDetik; }
        // Method setter setWaktuNormalDetik untuk mengubah waktu tempuh normal baseline
        public void setWaktuNormalDetik(Long waktuNormalDetik) { this.waktuNormalDetik = waktuNormalDetik; }
        // Method getter getMenitDihemat untuk mengambil menit yang dihemat
        public Double getMenitDihemat() { return menitDihemat; }
        // Method setter setMenitDihemat untuk mengubah menit yang dihemat
        public void setMenitDihemat(Double menitDihemat) { this.menitDihemat = menitDihemat; }
        // Method getter getReduksiCo2Gram untuk mengambil reduksi gas CO2 dalam gram
        public Double getReduksiCo2Gram() { return reduksiCo2Gram; }
        // Method setter setReduksiCo2Gram untuk mengubah reduksi gas CO2 dalam gram
        public void setReduksiCo2Gram(Double reduksiCo2Gram) { this.reduksiCo2Gram = reduksiCo2Gram; }
    }

    // =====================================================================
    // Getter & Setter Kelas Utama
    // =====================================================================

    // Method getter getMetadata untuk mengambil objek metadata laporan
    public MetadataLaporanDto getMetadata() { return metadata; }
    // Method setter setMetadata untuk mengubah objek metadata laporan
    public void setMetadata(MetadataLaporanDto metadata) { this.metadata = metadata; }
    // Method getter getRingkasan untuk mengambil daftar kartu KPI ringkasan
    public List<KartuKpiDto> getRingkasan() { return ringkasan; }
    // Method setter setRingkasan untuk mengubah daftar kartu KPI ringkasan
    public void setRingkasan(List<KartuKpiDto> ringkasan) { this.ringkasan = ringkasan; }
    // Method getter getTabelFinansial untuk mengambil baris rekaman tabel finansial
    public List<BarisFinansialDto> getTabelFinansial() { return tabelFinansial; }
    // Method setter setTabelFinansial untuk mengubah baris rekaman tabel finansial
    public void setTabelFinansial(List<BarisFinansialDto> tabelFinansial) { this.tabelFinansial = tabelFinansial; }
    // Method getter getTabelOperasional untuk mengambil baris rekaman tabel operasional
    public List<BarisOperasionalDto> getTabelOperasional() { return tabelOperasional; }
    // Method setter setTabelOperasional untuk mengubah baris rekaman tabel operasional
    public void setTabelOperasional(List<BarisOperasionalDto> tabelOperasional) { this.tabelOperasional = tabelOperasional; }
    // Method getter getTabelLingkungan untuk mengambil baris rekaman tabel lingkungan
    public List<BarisLingkunganDto> getTabelLingkungan() { return tabelLingkungan; }
    // Method setter setTabelLingkungan untuk mengubah baris rekaman tabel lingkungan
    public void setTabelLingkungan(List<BarisLingkunganDto> tabelLingkungan) { this.tabelLingkungan = tabelLingkungan; }
}
