package com.spct.service; // Nama package dari modul layanan logika bisnis sistem

// Import DTO HasilAlokasiRuteDto dari package dto
import com.spct.dto.HasilAlokasiRuteDto;
// Import DTO HasilDeteksiKeluarDto dari package dto
import com.spct.dto.HasilDeteksiKeluarDto;
// Import DTO HasilDeteksiMasukDto dari package dto
import com.spct.dto.HasilDeteksiMasukDto;
// Import entitas dan enum model sistem
import com.spct.model.*;
// Import repositori DataKendaraanRepository dari package repository
import com.spct.repository.DataKendaraanRepository;
// Import repositori PembayaranRepository dari package repository
import com.spct.repository.PembayaranRepository;
// Import repositori SlotParkirRepository dari package repository
import com.spct.repository.SlotParkirRepository;
// Import repositori TransaksiParkirRepository dari package repository
import com.spct.repository.TransaksiParkirRepository;
// Import anotasi Autowired dari Spring Framework
import org.springframework.beans.factory.annotation.Autowired;
// Import anotasi Value dari Spring Framework untuk membaca properti aplikasi
import org.springframework.beans.factory.annotation.Value;
// Import anotasi Service dari Spring Framework
import org.springframework.stereotype.Service;
// Import anotasi Transactional dari Spring Framework
import org.springframework.transaction.annotation.Transactional;

// Import pustaka Jackson ObjectMapper untuk deserialisasi JSON respon ALPR
import com.fasterxml.jackson.databind.ObjectMapper;

// Import tipe data BigDecimal untuk nominal tarif rupiah
import java.math.BigDecimal;
// Import tipe data Duration untuk kalkulasi durasi waktu
import java.time.Duration;
// Import tipe data waktu LocalDateTime java
import java.time.LocalDateTime;
// Import koleksi List dari java util
import java.util.List;
// Import koleksi Map dari java util
import java.util.Map;

// Kelas layanan publik java DeteksiPlatService untuk mengorkestrasi pemrosesan kendaraan gerbang masuk dan gerbang keluar
@Service // Menandai kelas ini sebagai Spring Service Bean
public class DeteksiPlatService
{
    // =====================================================================
    // Nilai Konstanta Konfigurasi Sistem
    // =====================================================================

    // Batas minimum confidence score dari model OCR/YOLO agar plat dianggap valid secara otomatis (0.70 = 70%)
    private static final double CONFIDENCE_THRESHOLD = 0.70;

    // =====================================================================
    // Deklarasi Atribut Repository dan Service
    // =====================================================================

    // Injeksi otomatis dependensi DataKendaraanRepository
    @Autowired
    private DataKendaraanRepository dataKendaraanRepository; // Deklarasi atribut dataKendaraanRepository

    // Injeksi otomatis dependensi SlotParkirRepository
    @Autowired
    private SlotParkirRepository slotParkirRepository; // Deklarasi atribut slotParkirRepository

    // Injeksi otomatis dependensi TransaksiParkirRepository
    @Autowired
    private TransaksiParkirRepository transaksiParkirRepository; // Deklarasi atribut transaksiParkirRepository

    // Injeksi otomatis dependensi AlokasiRuteService
    @Autowired
    private AlokasiRuteService alokasiRuteService; // Deklarasi atribut alokasiRuteService

    // Injeksi otomatis dependensi PembayaranRepository
    @Autowired
    private PembayaranRepository pembayaranRepository; // Deklarasi atribut pembayaranRepository

    // Injeksi otomatis dependensi TransaksiPembayaranService
    @Autowired
    private TransaksiPembayaranService transaksiPembayaranService; // Deklarasi atribut transaksiPembayaranService

    // Injeksi alamat URL Edge ALPR Microservice dari application.properties
    @Value("${alpr.microservice.url:http://127.0.0.1:5001}")
    private String alprMicroserviceUrl;

    // Injeksi batas waktu timeout komunikasi HTTP ALPR dalam milidetik (default: 20 detik)
    @Value("${alpr.microservice.timeout-ms:20000}")
    private int alprTimeoutMs;

    // =====================================================================
    // Method Utama: Mengorkestrasi seluruh alur pemrosesan kendaraan masuk
    // =====================================================================

    // Method prosesKendaraanMasuk untuk memvalidasi plat, alokasi slot, pencatatan transaksi masuk, dan jalur rute
    @Transactional
    public HasilDeteksiMasukDto prosesKendaraanMasuk(String platNomor, JenisKendaraan jenisKendaraan, double confidenceScore)
    {
        // Jika nilai confidence score di bawah batas ambang 70%, maka:
        if (confidenceScore < CONFIDENCE_THRESHOLD)
        {
            // Kembalikan DTO dengan status peringatan CONFIDENCE_RENDAH untuk validasi manual petugas
            return new HasilDeteksiMasukDto(
                "CONFIDENCE_RENDAH", // Status peringatan
                platNomor, // Nomor plat yang terbaca
                null, // Waktu masuk belum dibuat
                null, // ID transaksi belum dibuat
                null, // Slot belum dialokasikan
                null, // Lantai belum diketahui
                null, // Rute belum dihitung
                "Confidence OCR terlalu rendah (" + String.format("%.0f", confidenceScore * 100) + "%). Mohon validasi manual oleh petugas."
            );
        }

        // Mencari data master kendaraan atau meregistrasikan baru jika belum terdaftar
        DataKendaraan kendaraan = cariAtauDaftarkanKendaraan(platNomor, jenisKendaraan);

        // Memanggil service AlokasiRuteService untuk mencari slot kosong terdekat dan menghitung rute A*
        HasilAlokasiRuteDto hasilAlokasi = alokasiRuteService.prosesAlokasiDanRute(platNomor, jenisKendaraan);

        // Jika seluruh slot parkir penuh, maka:
        if ("BASEMENT_PENUH".equals(hasilAlokasi.getPesanStatus()))
        {
            // Kembalikan DTO dengan status BASEMENT_PENUH
            return new HasilDeteksiMasukDto(
                "BASEMENT_PENUH", // Status basement penuh
                platNomor, // Nomor plat kendaraan
                null, null, null, null, null,
                "Maaf, semua slot parkir penuh. Silakan coba lagi nanti."
            );
        }

        // Mengambil entitas SlotParkir yang dialokasikan dari database
        SlotParkir slotYangDipilih = slotParkirRepository
            .findById(hasilAlokasi.getIdSlotDialokasikan())
            .orElseThrow();

        // Instansiasi entitas TransaksiParkir baru dengan kendaraan dan slot yang dipilih
        TransaksiParkir transaksiParkir = new TransaksiParkir(kendaraan, slotYangDipilih);
        // Menyimpan data tiket transaksi parkir baru ke database
        TransaksiParkir transaksiTersimpan = transaksiParkirRepository.save(transaksiParkir);

        // Mengembalikan objek DTO HasilDeteksiMasukDto lengkap ke terminal Kiosk
        return new HasilDeteksiMasukDto(
            "SUKSES", // Status operasi berhasil
            platNomor, // Nomor plat kendaraan
            transaksiTersimpan.getWaktuMasuk(), // Waktu kedatangan masuk
            transaksiTersimpan.getIdTransaksi(), // Nomor tiket transaksi
            hasilAlokasi.getIdSlotDialokasikan(), // Slot parkir tujuan
            hasilAlokasi.getLantaiSlot(), // Lantai parkir tujuan
            hasilAlokasi.getUrutan(), // Rute navigasi visual
            "Selamat datang! Silakan menuju slot parkir Anda."
        );
    }

    // =====================================================================
    // Method Pendukung: Cari atau daftarkan kendaraan baru
    // =====================================================================

    // Method cariAtauDaftarkanKendaraan untuk mencari atau mendaftarkan kendaraan baru
    private DataKendaraan cariAtauDaftarkanKendaraan(String platNomor, JenisKendaraan jenisKendaraan)
    {
        // Mencari kendaraan di database berdasarkan plat nomor
        DataKendaraan terdaftar = dataKendaraanRepository.findByPlatNomor(platNomor).orElse(null);
        // Jika kendaraan sudah ada, maka:
        if (terdaftar != null)
        {
            // Jika jenis kendaraan berbeda dengan yang tersimpan, perbarui jenisnya
            if (terdaftar.getJenisKendaraan() != jenisKendaraan)
            {
                terdaftar.setJenisKendaraan(jenisKendaraan);
                terdaftar = dataKendaraanRepository.save(terdaftar);
            }
            return terdaftar;
        }

        // Jika kendaraan baru, instansiasi entitas DataKendaraan baru dan simpan ke database
        return dataKendaraanRepository.save(new DataKendaraan(platNomor, jenisKendaraan));
    }

    // =====================================================================
    // Method: Mengorkestrasi pemrosesan kendaraan keluar
    // =====================================================================

    // Overload method prosesKendaraanKeluar dengan 2 parameter
    @Transactional
    public HasilDeteksiKeluarDto prosesKendaraanKeluar(String platNomor, BigDecimal saldoEwallet)
    {
        return prosesKendaraanKeluar(platNomor, saldoEwallet, null);
    }

    // Overload method prosesKendaraanKeluar dengan 3 parameter
    @Transactional
    public HasilDeteksiKeluarDto prosesKendaraanKeluar(String platNomor, BigDecimal saldoEwallet, Integer durasiMenitSimulasi)
    {
        return prosesKendaraanKeluar(platNomor, saldoEwallet, durasiMenitSimulasi, null);
    }

    // Method lengkap prosesKendaraanKeluar dengan filter jenis kendaraan gerbang dan validasi berlipat (double validation)
    @Transactional
    public HasilDeteksiKeluarDto prosesKendaraanKeluar(String platNomor, BigDecimal saldoEwallet, Integer durasiMenitSimulasi, JenisKendaraan jenisKendaraan)
    {
        // Inisialisasi variabel transaksi dengan nilai awal null
        TransaksiParkir transaksi = null;

        // Evaluasi apakah plat nomor dikirim secara spesifik (bukan antrean otomatis)
        boolean isPlatSpesifik = (platNomor != null && !platNomor.trim().isEmpty() 
                                  && !"QUEUE".equalsIgnoreCase(platNomor.trim()) 
                                  && !"AUTO".equalsIgnoreCase(platNomor.trim()));

        // Jika plat nomor valid dan spesifik, cari transaksi aktifnya di database
        if (isPlatSpesifik) 
        {
            transaksi = transaksiParkirRepository.findFirstByKendaraan_PlatNomorAndStatusPembayaranOrderByWaktuMasukDesc(
                    platNomor.trim(), StatusPembayaran.BELUM_LUNAS).orElse(null);

            // Jika plat spesifik dicari namun tidak ditemukan di database kendaraan aktif, tolak transaksi
            if (transaksi == null)
            {
                return new HasilDeteksiKeluarDto(
                    "KENDARAAN_TIDAK_DITEMUKAN", 
                    platNomor, 
                    null, 
                    null, 
                    0, 
                    BigDecimal.ZERO, 
                    "Plat nomor " + platNomor + " tidak ditemukan dalam daftar parkir aktif (mungkin belum masuk atau sudah lunas)."
                );
            }
        }

        // Jika bukan plat spesifik (mode simulasi antrean FIFO), ambil kendaraan terdepan
        if (transaksi == null) 
        {
            transaksi = (jenisKendaraan == null)
                ? transaksiParkirRepository.findFirstByStatusPembayaranOrderByWaktuMasukAsc(StatusPembayaran.BELUM_LUNAS).orElse(null)
                : transaksiParkirRepository.findFirstByStatusPembayaranAndKendaraan_JenisKendaraanOrderByWaktuMasukAsc(
                        StatusPembayaran.BELUM_LUNAS, jenisKendaraan).orElse(null);
        }

        // Jika tidak ada transaksi kendaraan yang aktif sama sekali di database, maka:
        if (transaksi == null) 
        {
            // Kembalikan DTO KENDARAAN_TIDAK_DITEMUKAN
            return new HasilDeteksiKeluarDto("KENDARAAN_TIDAK_DITEMUKAN", platNomor, null, null, 0, BigDecimal.ZERO, "Tidak ada kendaraan di dalam area parkir (semua sudah lunas / basement kosong).");
        }

        // Mengambil plat nomor definitif dari data transaksi kendaraan aktif
        platNomor = transaksi.getKendaraan().getPlatNomor();

        // =====================================================================
        // VALIDASI BERLIPAT (DOUBLE VALIDATION)
        // =====================================================================

        // 1. Validasi Kesesuaian Kategori Kendaraan dengan Gerbang Keluar
        if (jenisKendaraan != null && transaksi.getKendaraan().getJenisKendaraan() != jenisKendaraan)
        {
            return new HasilDeteksiKeluarDto(
                "JENIS_KENDARAAN_MISMATCH",
                platNomor,
                transaksi.getWaktuMasuk(),
                null,
                0,
                BigDecimal.ZERO,
                "Ketidaksesuaian gerbang: Kendaraan " + platNomor + " bertipe " + transaksi.getKendaraan().getJenisKendaraan() + " namun melalui gerbang keluar " + jenisKendaraan + "."
            );
        }

        // 2. Validasi Integritas Slot Parkir: Memastikan slot parkir tercatat valid pada tiket masuk
        SlotParkir slotTersimpan = transaksi.getSlotDipilih();
        if (slotTersimpan == null)
        {
            return new HasilDeteksiKeluarDto(
                "ANOMALI_SLOT_TIDAK_VALID",
                platNomor,
                transaksi.getWaktuMasuk(),
                null,
                0,
                BigDecimal.ZERO,
                "Anomali integritas data: Kendaraan " + platNomor + " tidak memiliki keterikatan slot parkir yang valid."
            );
        }

        // Mengambil identifier kode slot yang akan dilepaskan (misal: B01-M01)
        String idSlotDibebaskan = slotTersimpan.getIdSlot();

        // Mencatat waktu saat ini sebagai waktu keluar kendaraan
        LocalDateTime waktuKeluar = LocalDateTime.now();
        // Mengambil timestamp waktu masuk awal kendaraan
        LocalDateTime waktuMasuk = transaksi.getWaktuMasuk();
        
        // Deklarasi variabel minutes untuk durasi parkir dalam menit
        long minutes;

        // Jika terdapat parameter simulasi durasi menit, maka:
        if (durasiMenitSimulasi != null && durasiMenitSimulasi > 0) 
        {
            minutes = durasiMenitSimulasi; // Gunakan durasi simulasi
            waktuMasuk = waktuKeluar.minusMinutes(minutes); // Mundurkan waktu masuk secara proporsional
            transaksi.setWaktuMasuk(waktuMasuk); // Perbarui waktu masuk pada entitas transaksi
        } 
        else // Jika tidak ada simulasi, hitung selisih durasi nyata:
        {
            Duration duration = Duration.between(waktuMasuk, waktuKeluar); // Hitung interval waktu nyata
            minutes = duration.toMinutes(); // Konversi ke satuan menit
        }

        // Menghitung jumlah jam pembulatan ke atas untuk tampilan kiosk
        long hours = (long) Math.ceil(minutes / 60.0);
        // Memastikan durasi jam minimal 1 jam
        if (hours < 1) hours = 1;
        
        // Menghitung tarif resmi menggunakan rumus TransaksiPembayaranService
        BigDecimal totalBiaya = transaksiPembayaranService.hitungTarif((int) minutes);

        // Jika biaya bernilai 0 (Grace Period <= 10 menit), maka:
        if (totalBiaya.compareTo(BigDecimal.ZERO) == 0)
        {
            transaksi.setWaktuKeluar(waktuKeluar); // Catat timestamp waktu keluar
            transaksi.setDurasiTotalMenit((int) minutes); // Catat total durasi menit
            transaksi.setNominalTagihan(BigDecimal.ZERO); // Tagihan bernilai 0 rupiah
            transaksi.setStatusPembayaran(StatusPembayaran.GRACE_PERIOD_FREE); // Status GRACE_PERIOD_FREE
            transaksiPembayaranService.bebaskanSlotParkir(transaksi); // Lepaskan slot parkir menjadi KOSONG
            transaksiParkirRepository.save(transaksi); // Simpan pembaruan transaksi ke database

            // Kembalikan respons sukses bebas tarif grace period beserta ID slot yang dibebaskan
            return new HasilDeteksiKeluarDto("SUKSES", platNomor, waktuMasuk, waktuKeluar, hours, BigDecimal.ZERO, "Gratis (Grace Period ≤ 10 menit). Silakan keluar.", idSlotDibebaskan);
        }

        // Jika saldo dompet digital mencukupi untuk membayar tagihan, maka:
        if (saldoEwallet != null && saldoEwallet.compareTo(totalBiaya) >= 0) 
        {
            transaksi.setWaktuKeluar(waktuKeluar); // Catat timestamp waktu keluar
            transaksi.setDurasiTotalMenit((int) minutes); // Catat durasi menit
            transaksi.setNominalTagihan(totalBiaya); // Catat nominal tagihan
            transaksi.setStatusPembayaran(StatusPembayaran.LUNAS); // Status LUNAS
            transaksi.setMetodePembayaran(MetodePembayaran.ETOLL_MANDIRI); // Kanal pembayaran e-Toll
            
            // Mengosongkan slot parkir terkait
            transaksiPembayaranService.bebaskanSlotParkir(transaksi);
            // Menyimpan entitas transaksi ke database
            transaksiParkirRepository.save(transaksi);

            // Membuat rekaman entitas pembayaran finansial baru
            Pembayaran pembayaran = new Pembayaran(transaksi, totalBiaya, MetodePembayaran.ETOLL_MANDIRI);
            pembayaran.setStatusPembayaran(StatusPembayaran.LUNAS); // Status pembayaran lunas
            pembayaran.setWaktuPembayaran(waktuKeluar); // Waktu pembayaran sukses
            pembayaranRepository.save(pembayaran); // Simpan record pembayaran ke database

            // Kembalikan DTO SUKSES keluar gerbang beserta slot yang dibebaskan
            return new HasilDeteksiKeluarDto("SUKSES", platNomor, waktuMasuk, waktuKeluar, hours, totalBiaya, "Pembayaran berhasil. Silakan keluar.", idSlotDibebaskan);
        } 
        else // Jika saldo e-wallet kurang dari total biaya tagihan, maka:
        {
            // Kembalikan DTO peringatan status SALDO_KURANG
            return new HasilDeteksiKeluarDto("SALDO_KURANG", platNomor, waktuMasuk, waktuKeluar, hours, totalBiaya, "Saldo E-Wallet tidak mencukupi.", idSlotDibebaskan);
        }
    }

    // =====================================================================
    // Method Orkestrasi Microservice ALPR: Pemicu On-Demand Kamera Laptop
    // =====================================================================

    // Method triggerAlprScan untuk mengorkestrasi pemindaian kamera Edge ALPR di laptop
    public Map<String, Object> triggerAlprScan(String gerbang, JenisKendaraan jenisKendaraan, BigDecimal saldoEwallet, Integer durasiMenit, String laptopUrlOverride)
    {
        // Menentukan base URL target: gunakan parameter override jika diisi, atau konfigurasi aplikasi
        String baseUrl = (laptopUrlOverride != null && !laptopUrlOverride.isBlank()) ? laptopUrlOverride.trim() : alprMicroserviceUrl;
        if (baseUrl.endsWith("/")) 
        {
            baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        }
        String endpoint = baseUrl + "/api/alpr/scan";

        // Membentuk payload JSON untuk dikirim ke Edge ALPR Microservice di laptop
        String jsonPayload = String.format("{\"gerbang\":\"%s\",\"jenis\":\"%s\",\"timeout\":15}",
                gerbang != null ? gerbang.toUpperCase() : "MASUK",
                jenisKendaraan != null ? jenisKendaraan.name() : "MOBIL");

        try
        {
            // Instansiasi HttpClient Java standar dengan batas waktu koneksi
            java.net.http.HttpClient client = java.net.http.HttpClient.newBuilder()
                    .connectTimeout(Duration.ofMillis(alprTimeoutMs))
                    .build();

            // Membangun request HTTP POST ke endpoint kamera laptop
            java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create(endpoint))
                    .timeout(Duration.ofMillis(alprTimeoutMs))
                    .header("Content-Type", "application/json")
                    .POST(java.net.http.HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            // Mengirimkan permintaan secara sinkron dan menerima balasan teks JSON
            java.net.http.HttpResponse<String> response = client.send(request, java.net.http.HttpResponse.BodyHandlers.ofString());

            // Jika microservice mengembalikan HTTP 200 OK:
            if (response.statusCode() == 200)
            {
                // Parsing body respon JSON menggunakan Jackson ObjectMapper
                ObjectMapper mapper = new ObjectMapper();
                @SuppressWarnings("unchecked")
                Map<String, Object> alprRes = mapper.readValue(response.body(), Map.class);
                String statusAlpr = (String) alprRes.get("status");

                // Jika plat nomor sukses terdeteksi:
                if ("SUKSES".equalsIgnoreCase(statusAlpr))
                {
                    String platNomor = (String) alprRes.get("platNomor");
                    double conf = (alprRes.get("confidence") != null) ? ((Number) alprRes.get("confidence")).doubleValue() : 1.0;

                    // Jika pemindaian dilakukan di gerbang KELUAR:
                    if ("KELUAR".equalsIgnoreCase(gerbang))
                    {
                        HasilDeteksiKeluarDto hasilKeluar = prosesKendaraanKeluar(platNomor, saldoEwallet != null ? saldoEwallet : BigDecimal.valueOf(50000), durasiMenit, jenisKendaraan);
                        return Map.of("status", hasilKeluar.getStatus(), "gerbang", "KELUAR", "data", hasilKeluar, "alpr", alprRes);
                    }
                    else // Jika pemindaian di gerbang MASUK:
                    {
                        HasilDeteksiMasukDto hasilMasuk = prosesKendaraanMasuk(platNomor, jenisKendaraan, conf);
                        return Map.of("status", hasilMasuk.getStatus(), "gerbang", "MASUK", "data", hasilMasuk, "alpr", alprRes);
                    }
                }
                else
                {
                    return Map.of("status", statusAlpr, "gerbang", gerbang, "pesan", alprRes.getOrDefault("pesan", "Kamera ALPR tidak berhasil mendeteksi plat."), "alpr", alprRes);
                }
            }
            else if (response.statusCode() == 408)
            {
                // Timeout pemindaian 15 detik
                return Map.of("status", "TIMEOUT", "gerbang", gerbang, "pesan", "Waktu pemindaian kamera habis (15 detik). Plat nomor tidak terdeteksi oleh webcam laptop.");
            }
            else
            {
                return Map.of("status", "ERROR", "gerbang", gerbang, "pesan", "Microservice ALPR mengembalikan kode respon HTTP " + response.statusCode());
            }
        }
        catch (java.net.ConnectException ce)
        {
            // Penanganan kegagalan koneksi jaringan (firewall / laptop belum menyala)
            return Map.of(
                "status", "MICROSERVICE_UNREACHABLE",
                "gerbang", gerbang,
                "pesan", "Tidak dapat terhubung ke Edge ALPR Microservice di " + baseUrl + ". Pastikan laptop dan PC berada di Wi-Fi yang sama dan skrip 'alpr_microservice.py' di laptop telah menyala."
            );
        }
        catch (Exception ex)
        {
            // Penanganan kesalahan umum lainnya
            return Map.of(
                "status", "ERROR",
                "gerbang", gerbang,
                "pesan", "Terjadi kesalahan saat memicu kamera ALPR: " + ex.getMessage()
            );
        }
    }

    // =====================================================================
    // Method Mengambil Antrean Keluar Kendaraan (FIFO)
    // =====================================================================

    // Method ambilAntreanKendaraanKeluar tanpa filter
    public List<TransaksiParkir> ambilAntreanKendaraanKeluar() 
    {
        return ambilAntreanKendaraanKeluar(null);
    }

    // Method ambilAntreanKendaraanKeluar dengan filter tipe kendaraan
    public List<TransaksiParkir> ambilAntreanKendaraanKeluar(JenisKendaraan jenisKendaraan) 
    {
        // Jika tidak ada filter jenis kendaraan, ambil seluruh antrean aktif
        if (jenisKendaraan == null) 
        {
            return transaksiParkirRepository.findByStatusPembayaranOrderByWaktuMasukAsc(StatusPembayaran.BELUM_LUNAS);
        }
        // Ambil antrean aktif berdasarkan kategori kendaraan tertentu
        return transaksiParkirRepository.findByStatusPembayaranAndKendaraan_JenisKendaraanOrderByWaktuMasukAsc(
            StatusPembayaran.BELUM_LUNAS, jenisKendaraan);
    }
}
