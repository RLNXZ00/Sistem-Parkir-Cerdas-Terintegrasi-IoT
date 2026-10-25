package com.spct.service; // Nama package tempat file service laporan Excel ini berada

// Import kelas DTO LaporanResponseDto untuk struktur data respon laporan
import com.spct.dto.LaporanResponseDto;
// Import seluruh inner class DTO laporan seperti MetadataLaporanDto, KartuKpiDto, dll
import com.spct.dto.LaporanResponseDto.*;
// Import pustaka Apache POI ss usermodel untuk komponen manipulasi spreadsheet Excel
import org.apache.poi.ss.usermodel.*;
// Import pustaka Apache POI untuk penggabungan koordinat sel (CellRangeAddress)
import org.apache.poi.ss.util.CellRangeAddress;
// Import pustaka Apache POI XSSF color map default
import org.apache.poi.xssf.usermodel.DefaultIndexedColorMap;
// Import pustaka Apache POI XSSFColor untuk pembuatan warna RGB kustom
import org.apache.poi.xssf.usermodel.XSSFColor;
// Import pustaka Apache POI XSSFWorkbook untuk buku kerja format Excel (.xlsx)
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
// Import anotasi Service dari Spring Framework untuk menandai kelas service
import org.springframework.stereotype.Service;

// Import ByteArrayOutputStream untuk menulis output binary dokumen Excel ke memori
import java.io.ByteArrayOutputStream;
// Import IOException untuk penanganan kesalahan input-output berkas
import java.io.IOException;
// Import BigDecimal untuk operasi kalkulasi mata uang presisi tinggi
import java.math.BigDecimal;
// Import NumberFormat untuk pemformatan nilai nominal angka dan mata uang
import java.text.NumberFormat;
// Import DateTimeFormatter untuk pemformatan tanggal dan waktu standar
import java.time.format.DateTimeFormatter;
// Import ArrayList untuk struktur data daftar dinamis
import java.util.ArrayList;
// Import List interface dari java.util
import java.util.List;
// Import Locale untuk representasi wilayah dan bahasa Indonesia
import java.util.Locale;

/**
 * Service: LaporanExcelService
 * Menghasilkan buku kerja spreadsheet resmi Excel (.xlsx) menggunakan Apache POI.
 * Menyediakan sheet laporan komprehensif berformat profesional,
 * dilengkapi kop surat RS, metadata audit, kartu KPI ringkasan, rincian data historis terstruktur,
 * total kalkulasi, serta lembar pengesahan tanda tangan (PK-UC010).
 */
@Service // Menandai kelas ini sebagai Spring Service bean penyedia layanan ekspor Excel
// Kelas publik java LaporanExcelService untuk menghasilkan laporan spreadsheet resmi Microsoft Excel (.xlsx)
public class LaporanExcelService
{
    // =====================================================================
    // Warna Resmi SPCT & Eco-Friendly (Custom XSSFColor)
    // =====================================================================
    // Deklarasi konstanta byte array RGB_NAVY_HEADER untuk warna latar header tabel (Slate 800)
    private static final byte[] RGB_NAVY_HEADER = new byte[]{(byte) 30, (byte) 41, (byte) 59};
    // Deklarasi konstanta byte array RGB_ZEBRA_ROW untuk warna latar baris selang-seling (Slate 50)
    private static final byte[] RGB_ZEBRA_ROW   = new byte[]{(byte) 248, (byte) 250, (byte) 252};
    // Deklarasi konstanta byte array RGB_TOTAL_ROW untuk warna latar baris total akumulasi (Slate 200)
    private static final byte[] RGB_TOTAL_ROW   = new byte[]{(byte) 226, (byte) 232, (byte) 240};
    // Deklarasi konstanta byte array RGB_CARD_BG untuk warna latar kartu ringkasan KPI (Slate 100)
    private static final byte[] RGB_CARD_BG     = new byte[]{(byte) 241, (byte) 245, (byte) 249};
    // Deklarasi konstanta byte array RGB_BORDER untuk warna garis pembatas sel (Slate 300)
    private static final byte[] RGB_BORDER      = new byte[]{(byte) 203, (byte) 213, (byte) 225};
    // Deklarasi konstanta byte array RGB_ECO_GREEN untuk warna aksen ramah lingkungan (Green 600)
    private static final byte[] RGB_ECO_GREEN   = new byte[]{(byte) 22, (byte) 163, (byte) 74};

    // Deklarasi konstanta FORMAT_RUPIAH bertipe NumberFormat dengan locale Indonesia
    private static final NumberFormat FORMAT_RUPIAH = NumberFormat.getCurrencyInstance(new Locale("id", "ID"));
    // Blok inisialisasi statis untuk mengatur konfigurasi formatter rupiah
    static {
        // Mengatur jumlah digit desimal pecahan maksimum sebesar 0
        FORMAT_RUPIAH.setMaximumFractionDigits(0);
    }

    /**
     * Method Utama: Mengonversi LaporanResponseDto menjadi byte array XLSX
     */
    // Method publik generateExcel untuk mengonversi DTO laporan menjadi array byte dokumen Excel .xlsx
    public byte[] generateExcel(LaporanResponseDto dto)
    {
        // Membuka blok try-with-resources untuk workbook XSSFWorkbook dan ByteArrayOutputStream:
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream())
        {
            // Inisialisasi objek CellStyleRegistry untuk mengelola seluruh style dan format sel Excel
            CellStyleRegistry styles = new CellStyleRegistry(workbook);
            // Inisialisasi variabel jenis laporan dari metadata DTO dengan fallback "finansial"
            String jenis = (dto.getMetadata() != null && dto.getMetadata().getJenisLaporan() != null)
                ? dto.getMetadata().getJenisLaporan().trim().toLowerCase() : "finansial";

            // Jika jenis laporan adalah "komprehensif", maka buat 3 tab spreadsheet terpisah:
            if ("komprehensif".equalsIgnoreCase(jenis))
            {
                // Tab 1: Membuat sheet laporan finansial lengkap
                buatSheetFinansialLengkap(
                    workbook, styles, dto.getMetadata(),
                    buatKpiFinansial(dto.getTabelFinansial()),
                    dto.getTabelFinansial(),
                    "Finansial"
                );

                // Tab 2: Membuat sheet laporan operasional lengkap
                buatSheetOperasionalLengkap(
                    workbook, styles, dto.getMetadata(),
                    buatKpiOperasional(dto.getTabelOperasional(), dto.getRingkasan()),
                    dto.getTabelOperasional(),
                    "Operasional"
                );

                // Tab 3: Membuat sheet laporan dampak lingkungan lengkap
                buatSheetLingkunganLengkap(
                    workbook, styles, dto.getMetadata(),
                    buatKpiLingkungan(dto.getTabelLingkungan()),
                    dto.getTabelLingkungan(),
                    "Lingkungan"
                );
            }
            // Jika jenis laporan adalah "finansial", maka buat sheet finansial tunggal:
            else if ("finansial".equalsIgnoreCase(jenis))
            {
                // Memanggil method pembuat sheet finansial lengkap
                buatSheetFinansialLengkap(
                    workbook, styles, dto.getMetadata(),
                    dto.getRingkasan(),
                    dto.getTabelFinansial(),
                    "Laporan Finansial"
                );
            }
            // Jika jenis laporan adalah "operasional", maka buat sheet operasional tunggal:
            else if ("operasional".equalsIgnoreCase(jenis))
            {
                // Memanggil method pembuat sheet operasional lengkap
                buatSheetOperasionalLengkap(
                    workbook, styles, dto.getMetadata(),
                    dto.getRingkasan(),
                    dto.getTabelOperasional(),
                    "Laporan Operasional"
                );
            }
            else // Jika jenis laporan adalah lingkungan, maka:
            {
                // Memanggil method pembuat sheet lingkungan lengkap
                buatSheetLingkunganLengkap(
                    workbook, styles, dto.getMetadata(),
                    dto.getRingkasan(),
                    dto.getTabelLingkungan(),
                    "Laporan Lingkungan"
                );
            }

            // Menuliskan seluruh isi workbook ke dalam stream ByteArrayOutputStream
            workbook.write(out);
            // Mengembalikan nilai byte array dokumen spreadsheet Excel
            return out.toByteArray();
        }
        // Menangkap exception IOException jika terjadi kesalahan penulisan stream dokumen Excel:
        catch (IOException e)
        {
            // Melemparkan RuntimeException dengan pesan penjelasan kegagalan generasi Excel
            throw new RuntimeException("Gagal menghasilkan dokumen Excel laporan: " + e.getMessage(), e);
        }
    }

    // =====================================================================
    // 1. Pembuatan Sheet Finansial Lengkap (Kop + KPI + Tabel + Signatures)
    // =====================================================================
    // Method privat buatSheetFinansialLengkap untuk menyusun sheet finansial lengkap beserta elemen audit
    private void buatSheetFinansialLengkap(Workbook workbook, CellStyleRegistry styles,
                                           MetadataLaporanDto meta, List<KartuKpiDto> kpis,
                                           List<BarisFinansialDto> rows, String namaSheet)
    {
        // Membuat sheet baru pada workbook dengan nama yang ditentukan
        Sheet sheet = workbook.createSheet(namaSheet);
        // Mengaktifkan tampilan garis bantu gridlines pada lembar kerja Excel
        sheet.setDisplayGridlines(true);
        // Deklarasi konstanta maxCol bertipe int dengan inisialisasi nilai 9 (total 10 kolom: 0 s.d. 9)
        final int maxCol = 9;

        // Menuliskan kop surat resmi rumah sakit dan mendapatkan indeks baris berikutnya
        int r = tulisKopSurat(sheet, styles, maxCol);
        // Menuliskan metadata laporan audit finansial dan mendapatkan baris kelanjutan
        r = tulisMetadata(sheet, styles, r, maxCol, "LAPORAN FINANSIAL & TRANSAKSI PARKIR", meta);
        // Menuliskan kartu ringkasan KPI eksekutif finansial
        r = tulisKpi(sheet, styles, r, maxCol, kpis);

        // Header Bagian Tabel: Membuat cell judul bagian yang digabungkan (merge)
        buatMergedCell(sheet, r++, 0, maxCol, "RINCIAN DATA HISTORIS", styles.sectionTitleFont);

        // Inisialisasi array string headers untuk judul-judul kolom tabel finansial
        String[] headers = {
            "No", "No. Tiket", "Plat Nomor", "Jenis Kendaraan",
            "Waktu Masuk", "Waktu Keluar", "Durasi Parkir",
            "Total Biaya (Rp)", "Kanal Pembayaran", "Status Bayar"
        };

        // Membuat baris header tabel pada sheet Excel
        Row headerRow = sheet.createRow(r++);
        // Mengatur tinggi baris header tabel sebesar 24 point
        headerRow.setHeightInPoints(24);
        // Looping untuk mengisi setiap sel pada baris header:
        for (int i = 0; i < headers.length; i++)
        {
            // Membuat sel kolom ke-i pada baris header
            Cell cell = headerRow.createCell(i);
            // Mengisi nilai teks judul kolom
            cell.setCellValue(headers[i]);
            // Mengatur style sel dengan thStyle (header tabel biru gelap)
            cell.setCellStyle(styles.thStyle);
        }

        // Inisialisasi variabel akumulasi total pendapatan bertipe BigDecimal dengan nilai awal 0
        BigDecimal grandTotal = BigDecimal.ZERO;

        // Jika rows data finansial tidak null dan tidak kosong, maka:
        if (rows != null && !rows.isEmpty())
        {
            // Looping setiap objek BarisFinansialDto dari list rows:
            for (BarisFinansialDto f : rows)
            {
                // Membuat baris data transaksi pada sheet Excel
                Row row = sheet.createRow(r);
                // Memeriksa pola baris genap untuk efek zebra striping
                boolean isZebra = (r % 2 == 0);
                // Memilih style dasar teks berdasarkan pola zebra
                CellStyle baseStyle = isZebra ? styles.tdZebra : styles.tdNormal;
                // Memilih style format mata uang berdasarkan pola zebra
                CellStyle curStyle = isZebra ? styles.tdZebraCurrency : styles.tdNormalCurrency;
                // Memilih style perataan tengah berdasarkan pola zebra
                CellStyle centerStyle = isZebra ? styles.tdZebraCenter : styles.tdNormalCenter;

                // Mengisi Kolom 0: Nomor urut baris data
                row.createCell(0).setCellValue(f.getNo());
                row.getCell(0).setCellStyle(centerStyle);

                // Mengisi Kolom 1: Nomor tiket parkir
                row.createCell(1).setCellValue(f.getNomorTiket() != null ? f.getNomorTiket() : "-");
                row.getCell(1).setCellStyle(centerStyle);

                // Mengisi Kolom 2: Nomor plat kendaraan
                row.createCell(2).setCellValue(f.getPlatNomor() != null ? f.getPlatNomor() : "-");
                row.getCell(2).setCellStyle(baseStyle);

                // Mengisi Kolom 3: Jenis kendaraan (Mobil, Motor, dll.)
                row.createCell(3).setCellValue(f.getJenisKendaraan() != null ? f.getJenisKendaraan() : "-");
                row.getCell(3).setCellStyle(centerStyle);

                // Mengisi Kolom 4: Waktu masuk kendaraan
                row.createCell(4).setCellValue(f.getWaktuMasuk() != null ? f.getWaktuMasuk() : "-");
                row.getCell(4).setCellStyle(centerStyle);

                // Mengisi Kolom 5: Waktu keluar kendaraan
                row.createCell(5).setCellValue(f.getWaktuKeluar() != null ? f.getWaktuKeluar() : "-");
                row.getCell(5).setCellStyle(centerStyle);

                // Mengisi Kolom 6: Teks durasi parkir
                row.createCell(6).setCellValue(f.getDurasiTeks() != null ? f.getDurasiTeks() : "-");
                row.getCell(6).setCellStyle(centerStyle);

                // Mengisi Kolom 7: Nilai total tarif pembayaran parkir
                Cell cTarif = row.createCell(7);
                cTarif.setCellValue(f.getTotalTarif() != null ? f.getTotalTarif().doubleValue() : 0);
                cTarif.setCellStyle(curStyle);

                // Mengisi Kolom 8: Kanal metode pembayaran (QRIS, E-Toll, dll.)
                row.createCell(8).setCellValue(f.getKanalPembayaran() != null ? f.getKanalPembayaran() : "-");
                row.getCell(8).setCellStyle(centerStyle);

                // Mengisi Kolom 9: Status kelunasan pembayaran
                row.createCell(9).setCellValue(f.getStatusPembayaran() != null ? f.getStatusPembayaran() : "-");
                row.getCell(9).setCellStyle(centerStyle);

                // Jika total tarif baris ini tidak null, maka tambahkan ke grand total:
                if (f.getTotalTarif() != null)
                {
                    // Menjumlahkan nilai tarif ke grand total
                    grandTotal = grandTotal.add(f.getTotalTarif());
                }

                // Menaikkan indeks baris sheet
                r++;
            }

            // Baris Total Grand Total di Bawah Tabel
            Row totalRow = sheet.createRow(r++);
            // Mengatur tinggi baris total sebesar 22 point
            totalRow.setHeightInPoints(22);

            // Membuat sel gabungan dari kolom 0 s.d. 6 untuk label total pendapatan
            buatMergedCell(sheet, r - 1, 0, 6, "TOTAL PENDAPATAN PARKIR:", styles.totalLabelStyle);

            // Membuat sel kolom 7 untuk nilai akumulatif grand total pendapatan
            Cell cTotalVal = totalRow.createCell(7);
            cTotalVal.setCellValue(grandTotal.doubleValue());
            cTotalVal.setCellStyle(styles.totalCurrencyStyle);

            // Mengisi style sel kosong pengikut di kolom 8 dan 9 agar garis border konsisten
            Cell cTail1 = totalRow.createCell(8);
            cTail1.setCellStyle(styles.totalLabelStyle);
            Cell cTail2 = totalRow.createCell(9);
            cTail2.setCellStyle(styles.totalLabelStyle);
        }
        else // Jika tidak ada data baris finansial, maka:
        {
            // Menampilkan pesan bahwa tidak ada transaksi parkir pada periode yang dipilih
            buatMergedCell(sheet, r++, 0, maxCol,
                "Tidak ada transaksi parkir pada rentang waktu yang dipilih.", styles.italicMutedFont);
        }

        // Menuliskan lembar catatan audit kepatuhan dan tanda tangan pengesahan pejabat RS
        tulisCatatanAuditDanTandaTangan(sheet, styles, r, maxCol);

        // Looping untuk penyesuaian lebar kolom otomatis secara proporsional:
        for (int i = 0; i <= maxCol; i++)
        {
            // Melakukan auto-size pada kolom ke-i
            sheet.autoSizeColumn(i);
            // Menambahkan padding ekstra agar teks sel tidak terpotong
            sheet.setColumnWidth(i, Math.max(sheet.getColumnWidth(i) + 1400, 3600));
        }
        // Mengatur lebar khusus yang pas untuk kolom nomor urut (kolom 0)
        sheet.setColumnWidth(0, 2400);
    }

    // =====================================================================
    // 2. Pembuatan Sheet Operasional Lengkap (Kop + KPI + Tabel + Signatures)
    // =====================================================================
    // Method privat buatSheetOperasionalLengkap untuk menyusun sheet log operasional dan anomali IoT
    private void buatSheetOperasionalLengkap(Workbook workbook, CellStyleRegistry styles,
                                             MetadataLaporanDto meta, List<KartuKpiDto> kpis,
                                             List<BarisOperasionalDto> rows, String namaSheet)
    {
        // Membuat sheet baru pada workbook dengan nama yang ditentukan
        Sheet sheet = workbook.createSheet(namaSheet);
        // Mengaktifkan tampilan garis bantu gridlines pada lembar kerja
        sheet.setDisplayGridlines(true);
        // Deklarasi atribut maxCol bertipe int dengan inisialisasi nilai 8 (total 9 kolom: indeks 0 sampai 8)
        final int maxCol = 8;

        // Menuliskan kop surat resmi rumah sakit
        int r = tulisKopSurat(sheet, styles, maxCol);
        // Menuliskan metadata dokumen laporan operasional
        r = tulisMetadata(sheet, styles, r, maxCol, "LAPORAN OPERASIONAL & LOG ANOMALI IOT", meta);
        // Menuliskan kartu ringkasan eksekutif KPI operasional
        r = tulisKpi(sheet, styles, r, maxCol, kpis);

        // Header Bagian Tabel: Membuat cell pemisah bagian rincian data historis
        buatMergedCell(sheet, r++, 0, maxCol, "RINCIAN DATA HISTORIS", styles.sectionTitleFont);

        // Array judul kolom tabel operasional yang kini mencakup Jenis Anomali
        String[] headers = {
            "No", "ID Log", "Waktu Kejadian", "Slot / Node",
            "Tipe Kejadian", "Jenis Anomali", "Catatan Detail", "Tingkat Keparahan", "Status Resolusi"
        };

        // Membuat baris header tabel operasional
        Row headerRow = sheet.createRow(r++);
        // Mengatur tinggi baris header tabel
        headerRow.setHeightInPoints(24);
        // Looping untuk mengisi teks dan style sel header:
        for (int i = 0; i < headers.length; i++)
        {
            // Membuat sel kolom ke-i pada baris header
            Cell cell = headerRow.createCell(i);
            // Mengisi nilai judul kolom
            cell.setCellValue(headers[i]);
            // Menerapkan style header tabel
            cell.setCellStyle(styles.thStyle);
        }

        // Jika rows data operasional tidak null dan tidak kosong, maka:
        if (rows != null && !rows.isEmpty())
        {
            // Looping setiap objek BarisOperasionalDto dari list rows:
            for (BarisOperasionalDto op : rows)
            {
                // Membuat baris data baru pada sheet
                Row row = sheet.createRow(r);
                // Menentukan pola zebra selang-seling
                boolean isZebra = (r % 2 == 0);
                // Memilih style dasar teks
                CellStyle baseStyle = isZebra ? styles.tdZebra : styles.tdNormal;
                // Memilih style teks rata tengah
                CellStyle centerStyle = isZebra ? styles.tdZebraCenter : styles.tdNormalCenter;

                // Kolom 0: Nomor urut baris
                row.createCell(0).setCellValue(op.getNo());
                row.getCell(0).setCellStyle(centerStyle);

                // Kolom 1: Kode ID Log
                row.createCell(1).setCellValue(op.getIdLog() != null ? op.getIdLog() : "-");
                row.getCell(1).setCellStyle(centerStyle);

                // Kolom 2: Waktu kejadian sensor IoT
                row.createCell(2).setCellValue(op.getWaktu() != null ? op.getWaktu() : "-");
                row.getCell(2).setCellStyle(centerStyle);

                // Kolom 3: Identitas slot parkir
                row.createCell(3).setCellValue(op.getIdSlot() != null ? op.getIdSlot() : "-");
                row.getCell(3).setCellStyle(centerStyle);

                // Kolom 4: Jenis kejadian dari sistem
                row.createCell(4).setCellValue(op.getJenisKejadian() != null ? op.getJenisKejadian() : "-");
                row.getCell(4).setCellStyle(baseStyle);

                // Kolom 5: Kategori jenis anomali yang divalidasi petugas lapangan
                row.createCell(5).setCellValue(op.getJenisAnomali() != null ? op.getJenisAnomali() : "-");
                row.getCell(5).setCellStyle(centerStyle);

                // Kolom 6: Catatan detail kejadian atau kronologi
                row.createCell(6).setCellValue(op.getCatatanDetail() != null ? op.getCatatanDetail() : "-");
                row.getCell(6).setCellStyle(baseStyle);

                // Kolom 7: Tingkat keparahan severity (CRITICAL, WARNING, INFO)
                row.createCell(7).setCellValue(op.getTingkatKeparahan() != null ? op.getTingkatKeparahan() : "-");
                row.getCell(7).setCellStyle(centerStyle);

                // Kolom 8: Status resolusi tindak lanjut
                row.createCell(8).setCellValue(op.getStatusResolusi() != null ? op.getStatusResolusi() : "-");
                row.getCell(8).setCellStyle(centerStyle);

                // Menaikkan indeks baris
                r++;
            }
        }
        else // Jika tidak ada data baris operasional, maka:
        {
            // Menampilkan pesan bahwa tidak ada anomali atau kejadian tercatat
            buatMergedCell(sheet, r++, 0, maxCol,
                "Tidak ada anomali atau kejadian IoT tercatat pada rentang waktu yang dipilih.", styles.italicMutedFont);
        }

        // Menuliskan lembar catatan audit kepatuhan dan tanda tangan pengesahan pejabat
        tulisCatatanAuditDanTandaTangan(sheet, styles, r, maxCol);

        // Pengaturan Lebar Kolom secara proporsional
        for (int i = 0; i <= maxCol; i++)
        {
            // Melakukan auto-size kolom ke-i
            sheet.autoSizeColumn(i);
            // Menambahkan ruang padding aman
            sheet.setColumnWidth(i, Math.max(sheet.getColumnWidth(i) + 1400, 3600));
        }
        // Mengatur lebar kolom nomor urut
        sheet.setColumnWidth(0, 2400);
        // Mengatur lebar kolom catatan detail agar deskripsi panjang terbaca leluasa
        sheet.setColumnWidth(6, Math.max(sheet.getColumnWidth(6), 11000));
    }

    // =====================================================================
    // 3. Pembuatan Sheet Lingkungan Lengkap (Kop + KPI + Tabel + Signatures)
    // =====================================================================
    // Method privat buatSheetLingkunganLengkap untuk menyusun sheet dampak lingkungan dan reduksi emisi
    private void buatSheetLingkunganLengkap(Workbook workbook, CellStyleRegistry styles,
                                            MetadataLaporanDto meta, List<KartuKpiDto> kpis,
                                            List<BarisLingkunganDto> rows, String namaSheet)
    {
        // Membuat sheet baru pada workbook dengan nama yang ditentukan
        Sheet sheet = workbook.createSheet(namaSheet);
        // Mengaktifkan tampilan garis bantu gridlines
        sheet.setDisplayGridlines(true);
        // Deklarasi konstanta maxCol bertipe int dengan inisialisasi nilai 8 (total 9 kolom: 0 s.d. 8)
        final int maxCol = 8;

        // Menuliskan kop surat resmi rumah sakit
        int r = tulisKopSurat(sheet, styles, maxCol);
        // Menuliskan metadata dokumen laporan lingkungan
        r = tulisMetadata(sheet, styles, r, maxCol, "LAPORAN DAMPAK LINGKUNGAN (ECO-METRIC)", meta);
        // Menuliskan kartu ringkasan KPI eksekutif lingkungan
        r = tulisKpi(sheet, styles, r, maxCol, kpis);

        // Header Bagian Tabel: Membuat cell pemisah bagian rincian data historis
        buatMergedCell(sheet, r++, 0, maxCol, "RINCIAN DATA HISTORIS", styles.sectionTitleFont);

        // Array judul kolom tabel laporan dampak lingkungan
        String[] headers = {
            "No", "Plat Nomor", "Slot Tujuan", "Waktu Masuk",
            "Tiba di Slot", "Durasi Tempuh (Detik)", "Waktu Normal (Detik)",
            "Waktu Dihemat (Menit)", "Reduksi CO2 (Gram)"
        };

        // Membuat baris header tabel lingkungan
        Row headerRow = sheet.createRow(r++);
        // Mengatur tinggi baris header tabel
        headerRow.setHeightInPoints(24);
        // Looping untuk mengisi teks dan style sel header:
        for (int i = 0; i < headers.length; i++)
        {
            // Membuat sel kolom ke-i pada baris header
            Cell cell = headerRow.createCell(i);
            // Mengisi nilai judul kolom
            cell.setCellValue(headers[i]);
            // Menerapkan style header tabel
            cell.setCellStyle(styles.thStyle);
        }

        // Inisialisasi variabel akumulasi total waktu dihemat dalam menit
        double totalWaktuDihematMenit = 0.0;
        // Inisialisasi variabel akumulasi total reduksi emisi CO2 dalam gram
        double totalReduksiCo2Gram = 0.0;

        // Jika rows data lingkungan tidak null dan tidak kosong, maka:
        if (rows != null && !rows.isEmpty())
        {
            // Looping setiap objek BarisLingkunganDto dari list rows:
            for (BarisLingkunganDto eco : rows)
            {
                // Membuat baris data baru pada sheet
                Row row = sheet.createRow(r);
                // Menentukan pola zebra selang-seling
                boolean isZebra = (r % 2 == 0);
                // Memilih style dasar teks
                CellStyle baseStyle = isZebra ? styles.tdZebra : styles.tdNormal;
                // Memilih style teks rata tengah
                CellStyle centerStyle = isZebra ? styles.tdZebraCenter : styles.tdNormalCenter;
                // Memilih style angka bulat
                CellStyle numStyle = isZebra ? styles.tdZebraNumber : styles.tdNormalNumber;
                // Memilih style angka desimal
                CellStyle decStyle = isZebra ? styles.tdZebraDecimal : styles.tdNormalDecimal;

                // Kolom 0: Nomor urut baris
                row.createCell(0).setCellValue(eco.getNo());
                row.getCell(0).setCellStyle(centerStyle);

                // Kolom 1: Nomor plat kendaraan
                row.createCell(1).setCellValue(eco.getPlatNomor() != null ? eco.getPlatNomor() : "-");
                row.getCell(1).setCellStyle(baseStyle);

                // Kolom 2: Identitas slot tujuan
                row.createCell(2).setCellValue(eco.getIdSlot() != null ? eco.getIdSlot() : "-");
                row.getCell(2).setCellStyle(centerStyle);

                // Kolom 3: Waktu kendaraan masuk gerbang
                row.createCell(3).setCellValue(eco.getWaktuMasuk() != null ? eco.getWaktuMasuk() : "-");
                row.getCell(3).setCellStyle(centerStyle);

                // Kolom 4: Waktu kendaraan tiba di slot
                row.createCell(4).setCellValue(eco.getWaktuTiba() != null ? eco.getWaktuTiba() : "-");
                row.getCell(4).setCellStyle(centerStyle);

                // Kolom 5: Durasi tempuh riil dalam detik
                row.createCell(5).setCellValue(eco.getDurasiTempuhDetik() != null ? eco.getDurasiTempuhDetik() : 0);
                row.getCell(5).setCellStyle(numStyle);

                // Kolom 6: Standar waktu tempuh normal tanpa sistem dalam detik
                row.createCell(6).setCellValue(eco.getWaktuNormalDetik() != null ? eco.getWaktuNormalDetik() : 0);
                row.getCell(6).setCellStyle(numStyle);

                // Kolom 7: Estimasi waktu yang berhasil dihemat dalam menit
                row.createCell(7).setCellValue(eco.getMenitDihemat() != null ? eco.getMenitDihemat() : 0.0);
                row.getCell(7).setCellStyle(decStyle);

                // Kolom 8: Estimasi reduksi emisi gas buang CO2 dalam gram
                row.createCell(8).setCellValue(eco.getReduksiCo2Gram() != null ? eco.getReduksiCo2Gram() : 0.0);
                row.getCell(8).setCellStyle(decStyle);

                // Jika nilai menit dihemat tidak null, akumulasikan:
                if (eco.getMenitDihemat() != null)
                {
                    // Menambahkan ke total menit dihemat
                    totalWaktuDihematMenit += eco.getMenitDihemat();
                }
                // Jika nilai reduksi CO2 tidak null, akumulasikan:
                if (eco.getReduksiCo2Gram() != null)
                {
                    // Menambahkan ke total reduksi CO2
                    totalReduksiCo2Gram += eco.getReduksiCo2Gram();
                }

                // Menaikkan indeks baris
                r++;
            }

            // Baris Total Dampak Lingkungan
            Row totalRow = sheet.createRow(r++);
            // Mengatur tinggi baris total
            totalRow.setHeightInPoints(22);

            // Membuat sel gabungan dari kolom 0 s.d. 6 untuk label total dampak lingkungan
            buatMergedCell(sheet, r - 1, 0, 6, "TOTAL DAMPAK LINGKUNGAN DIHEMAT:", styles.totalLabelStyle);

            // Membuat sel kolom 7 untuk nilai total menit waktu dihemat
            Cell cTotMenit = totalRow.createCell(7);
            cTotMenit.setCellValue(Math.round(totalWaktuDihematMenit * 10.0) / 10.0);
            cTotMenit.setCellStyle(styles.totalDecimalStyle);

            // Membuat sel kolom 8 untuk nilai total reduksi emisi CO2 dalam gram
            Cell cTotCo2 = totalRow.createCell(8);
            cTotCo2.setCellValue(Math.round(totalReduksiCo2Gram * 100.0) / 100.0);
            cTotCo2.setCellStyle(styles.totalDecimalStyle);
        }
        else // Jika tidak ada data baris lingkungan, maka:
        {
            // Menampilkan pesan bahwa belum ada data navigasi kendaraan tiba di slot
            buatMergedCell(sheet, r++, 0, maxCol,
                "Belum ada data kendaraan tiba di slot pada rentang waktu yang dipilih.", styles.italicMutedFont);
        }

        // Menuliskan lembar catatan audit kepatuhan dan tanda tangan pengesahan pejabat
        tulisCatatanAuditDanTandaTangan(sheet, styles, r, maxCol);

        // Looping untuk penyesuaian lebar kolom otomatis:
        for (int i = 0; i <= maxCol; i++)
        {
            // Melakukan auto-size kolom ke-i
            sheet.autoSizeColumn(i);
            // Menambahkan ruang padding aman
            sheet.setColumnWidth(i, Math.max(sheet.getColumnWidth(i) + 1400, 3600));
        }
        // Mengatur lebar kolom nomor urut
        sheet.setColumnWidth(0, 2400);
    }

    // =====================================================================
    // Helper: Pembangunan Komponen Header, Kop Surat & Metadata
    // =====================================================================
    // Method privat tulisKopSurat untuk membuat kop surat resmi SPCT dan Manajemen Rumah Sakit
    private int tulisKopSurat(Sheet sheet, CellStyleRegistry styles, int maxCol)
    {
        // Inisialisasi indeks baris awal r dengan nilai 0
        int r = 0;
        // Menuliskan judul utama kop instansi SPCT
        buatMergedCell(sheet, r++, 0, maxCol, "SISTEM PARKIR CERDAS TERINTEGRASI IoT (SPCT)", styles.titleFont);
        // Menuliskan sub-judul manajemen fasilitas ramah lingkungan rumah sakit
        buatMergedCell(sheet, r++, 0, maxCol, "MANAJEMEN RUMAH SAKIT — FASILITAS BASEMENT RAMAH LINGKUNGAN", styles.subtitleGreenFont);
        // Menuliskan informasi alamat kontak dan nomor telepon instansi
        buatMergedCell(sheet, r++, 0, maxCol, "Alamat: Gedung Medik Terpadu Lantai Basement 1 • Telp: (0274) 555-SPCT • Email: smartparking@hospital.id", styles.italicMutedFont);
        // Menambahkan satu baris kosong sebagai spasi pemisah
        r++;
        // Mengembalikan nilai indeks baris terkini
        return r;
    }

    // Method privat tulisMetadata untuk mencantumkan rincian parameter dokumen laporan audit
    private int tulisMetadata(Sheet sheet, CellStyleRegistry styles, int startRow, int maxCol,
                              String judul, MetadataLaporanDto meta)
    {
        // Inisialisasi indeks baris kerja r dari parameter startRow
        int r = startRow;
        // Menuliskan judul dokumen laporan dengan font judul bagian
        buatMergedCell(sheet, r++, 0, maxCol, judul.toUpperCase(), styles.sectionTitleFont);

        // Jika metadata bernilai null, lewati penulisan detail dan kembalikan baris berikutnya:
        if (meta == null)
        {
            // Menambah baris kosong
            r++;
            // Mengembalikan indeks baris
            return r;
        }

        // Menyusun string kode dokumen resmi laporan
        String kodeDok = "SPCT-DOC/" + (meta.getJenisLaporan() != null ? meta.getJenisLaporan().toUpperCase() : "DOC")
            + "/" + (meta.getTanggalAkhir() != null ? meta.getTanggalAkhir() : "-");
        // Menyusun string rentang periode waktu laporan
        String periode = (meta.getTanggalMulai() != null ? meta.getTanggalMulai() : "-")
            + " s.d. " + (meta.getTanggalAkhir() != null ? meta.getTanggalAkhir() : "-");

        // Menentukan pembagian koordinat kolom kiri dan kanan secara adaptif
        int midRight = (maxCol >= 9) ? 4 : 3;
        int labelRightStart = midRight + 1;
        int labelRightEnd = Math.min(labelRightStart + 1, maxCol - 1);

        // Baris Metadata 1: Kode Dokumen dan Periode Laporan
        buatMergedCell(sheet, r, 0, 0, "Kode Dokumen:", styles.boldLabel);
        buatMergedCell(sheet, r, 1, midRight, kodeDok, styles.normalText);
        buatMergedCell(sheet, r, labelRightStart, labelRightEnd, "Periode Laporan:", styles.boldLabel);
        buatMergedCell(sheet, r, labelRightEnd + 1, maxCol, periode, styles.normalText);
        // Menaikkan indeks baris
        r++;

        // Baris Metadata 2: Waktu Generate dan Status Audit Kepatuhan
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        String waktuGen = (meta.getWaktuGenerate() != null) ? meta.getWaktuGenerate().format(dtf) + " WIB" : "-";
        String statusAudit = meta.isModeSimulasi() ? "MODE SIMULASI (Kiosk Exit)" : "LIVE GATEWAY AUDITED";

        buatMergedCell(sheet, r, 0, 0, "Waktu Generate:", styles.boldLabel);
        buatMergedCell(sheet, r, 1, midRight, waktuGen, styles.normalText);
        buatMergedCell(sheet, r, labelRightStart, labelRightEnd, "Status Audit:", styles.boldLabel);
        buatMergedCell(sheet, r, labelRightEnd + 1, maxCol, statusAudit, meta.isModeSimulasi() ? styles.amberBadge : styles.greenBadge);
        // Menaikkan indeks baris
        r++;

        // Menambahkan satu baris spasi pemisah
        r++;
        // Mengembalikan nilai indeks baris terkini
        return r;
    }

    // Method privat tulisKpi untuk merender kartu-kartu ringkasan Key Performance Indicators (KPI)
    private int tulisKpi(Sheet sheet, CellStyleRegistry styles, int startRow, int maxCol, List<KartuKpiDto> kpiList)
    {
        // Inisialisasi indeks baris kerja r dari startRow
        int r = startRow;
        // Menuliskan judul bagian ringkasan eksekutif KPI
        buatMergedCell(sheet, r++, 0, maxCol, "RINGKASAN EKSEKUTIF (KEY PERFORMANCE INDICATORS)", styles.sectionTitleFont);

        // Jika daftar KPI tidak null dan tidak kosong, maka:
        if (kpiList != null && !kpiList.isEmpty())
        {
            // Membatasi jumlah kartu maksimal 4 buah kartu KPI sejajar
            int numCards = Math.min(kpiList.size(), 4);
            // Matriks rentang kolom untuk setiap kartu KPI
            int[][] colRanges;
            // Jika kolom tabel berjumlah 10 (indeks 0 s.d. 9), gunakan rentang berikut:
            if (maxCol >= 9)
            {
                colRanges = new int[][]{{0, 1}, {2, 4}, {5, 6}, {7, 9}};
            }
            // Jika kolom tabel berjumlah 9 (indeks 0 s.d. 8), gunakan rentang berikut:
            else if (maxCol == 8)
            {
                colRanges = new int[][]{{0, 1}, {2, 3}, {4, 5}, {6, 8}};
            }
            else // Default untuk kolom tabel lainnya:
            {
                colRanges = new int[][]{{0, 1}, {2, 3}, {4, 5}, {6, 7}};
            }

            // Inisialisasi baris untuk nilai angka KPI
            int valRow = r;
            // Inisialisasi baris untuk label teks deskripsi KPI
            int lblRow = r + 1;
            // Membuat baris nilai KPI
            Row rVal = sheet.createRow(valRow);
            // Mengatur tinggi baris nilai sebesar 24 point
            rVal.setHeightInPoints(24);
            // Membuat baris label KPI
            Row rLbl = sheet.createRow(lblRow);
            // Mengatur tinggi baris label sebesar 18 point
            rLbl.setHeightInPoints(18);

            // Looping untuk merender masing-masing kartu KPI:
            for (int i = 0; i < numCards; i++)
            {
                // Mengambil objek KartuKpiDto ke-i
                KartuKpiDto k = kpiList.get(i);
                // Mengambil indeks awal kolom kartu
                int startC = colRanges[i][0];
                // Mengambil indeks akhir kolom kartu
                int endC = colRanges[i][1];

                // Merender sel nilai metrik KPI (font besar dan tebal)
                buatMergedCell(sheet, valRow, startC, endC, k.getNilai(), styles.kpiValueCell);
                // Merender sel deskripsi label KPI
                buatMergedCell(sheet, lblRow, startC, endC, k.getLabel(), styles.kpiLabelCell);
            }
            // Menaikkan indeks baris sebanyak 2 baris (nilai + label)
            r += 2;
        }
        // Menambahkan satu baris spasi pemisah
        r++;
        // Mengembalikan nilai indeks baris terkini
        return r;
    }

    // Method privat tulisCatatanAuditDanTandaTangan untuk merender disclaimer audit dan kolom pengesahan
    private int tulisCatatanAuditDanTandaTangan(Sheet sheet, CellStyleRegistry styles, int startRow, int maxCol)
    {
        // Inisialisasi indeks baris kerja r dari startRow
        int r = startRow;
        // Spasi pemisah dari tabel sebelumnya
        r++;

        // Catatan Audit Resmi: Menuliskan disclaimer integritas bahwa data bersifat Read-Only
        buatMergedCell(sheet, r++, 0, maxCol,
            "CATATAN AUDIT: Dokumen ini diterbitkan secara otomatis oleh modul PK-UC010 SPCT. Seluruh catatan bersifat Read-Only untuk integritas tata kelola.",
            styles.italicMutedFont);

        // Menambahkan satu baris kosong sebagai spasi
        r++;

        // Header Kolom Tanda Tangan: Menghitung pembagian kolom tengah
        int mid = (maxCol >= 9) ? 3 : 2;
        int kananStart = mid + 2;

        // Merender label pejabat pemverifikasi dan pengesah
        buatMergedCell(sheet, r, 0, mid, "Disiapkan & Diverifikasi Oleh:", styles.boldLabel);
        buatMergedCell(sheet, r, kananStart, maxCol, "Disetujui & Disahkan Oleh:", styles.boldLabel);
        // Menaikkan indeks baris
        r++;

        // Memberikan ruang kosong untuk pembubuhan tanda tangan fisik (3 baris kosong)
        r += 3;

        // Merender nama jabatan pejabat pengesah
        buatMergedCell(sheet, r, 0, mid, "( Supervisor Operasional & IoT )", styles.boldLabel);
        buatMergedCell(sheet, r, kananStart, maxCol, "( Manajer Fasilitas & Operasional RS )", styles.boldLabel);
        // Menaikkan indeks baris
        r++;

        // Merender Nomor Induk Pegawai (NIP) resmi pejabat
        buatMergedCell(sheet, r, 0, mid, "NIP. 19850412 201012 1 003", styles.italicMutedFont);
        buatMergedCell(sheet, r, kananStart, maxCol, "NIP. 19780920 200501 2 001", styles.italicMutedFont);
        // Menaikkan indeks baris
        r++;

        // Mengembalikan nilai indeks baris terkini
        return r;
    }

    /**
     * Helper: Membuat cell sekaligus menangani cell merging beserta border dan stylenya
     */
    // Method privat buatMergedCell untuk mempermudah pembuatan sel gabungan lengkap dengan border dan formatnya
    private void buatMergedCell(Sheet sheet, int rowIdx, int startCol, int endCol, String value, CellStyle style)
    {
        // Mengambil baris pada indeks rowIdx jika sudah ada
        Row row = sheet.getRow(rowIdx);
        // Jika baris belum ada pada sheet, maka buat baris baru:
        if (row == null) {
            // Membuat baris baru pada indeks rowIdx
            row = sheet.createRow(rowIdx);
        }
        // Looping untuk membuat setiap sel dalam rentang startCol sampai endCol:
        for (int col = startCol; col <= endCol; col++)
        {
            // Membuat sel pada kolom ke-col
            Cell cell = row.createCell(col);
            // Menerapkan style sel yang diinginkan
            cell.setCellStyle(style);
            // Jika kolom saat ini adalah kolom pertama (startCol), maka isi nilai teksnya:
            if (col == startCol)
            {
                // Mengisi nilai sel dengan string value atau string kosong jika null
                cell.setCellValue(value != null ? value : "");
            }
        }
        // Jika rentang kolom lebih dari 1 sel, lakukan penggabungan (merge):
        if (endCol > startCol)
        {
            // Menambahkan wilayah penggabungan sel baru pada sheet
            sheet.addMergedRegion(new CellRangeAddress(rowIdx, rowIdx, startCol, endCol));
        }
    }

    // =====================================================================
    // Helper: Penghitungan KPI untuk masing-masing Tab pada Mode Komprehensif
    // =====================================================================
    // Method privat buatKpiFinansial untuk menghitung metrik KPI finansial dari baris data
    private List<KartuKpiDto> buatKpiFinansial(List<BarisFinansialDto> rows)
    {
        // Inisialisasi total pendapatan awal dengan BigDecimal.ZERO
        BigDecimal totalPendapatan = BigDecimal.ZERO;
        // Inisialisasi akumulator total durasi dalam menit
        long totalDurasiMenit = 0;
        // Inisialisasi penghitung jumlah transaksi yang memiliki data durasi
        int hitungDurasi = 0;

        // Jika daftar baris finansial tidak bernilai null, lakukan kalkulasi:
        if (rows != null)
        {
            // Looping setiap transaksi finansial:
            for (BarisFinansialDto f : rows)
            {
                // Jika total tarif baris ini tidak null, akumulasikan:
                if (f.getTotalTarif() != null)
                {
                    // Menjumlahkan tarif ke total pendapatan
                    totalPendapatan = totalPendapatan.add(f.getTotalTarif());
                }
                // Jika durasi parkir tidak null, akumulasikan:
                if (f.getDurasiMenit() != null)
                {
                    // Menambahkan durasi menit ke akumulator
                    totalDurasiMenit += f.getDurasiMenit();
                    // Menambahkan jumlah hitungan durasi
                    hitungDurasi++;
                }
            }
        }

        // Menghitung total transaksi dari ukuran daftar baris
        int totalTransaksi = (rows != null) ? rows.size() : 0;
        // Menghitung rata-rata durasi parkir dalam menit
        int avgDurasi = (hitungDurasi > 0) ? (int)(totalDurasiMenit / hitungDurasi) : 39;
        // Menghitung rata-rata tarif pendapatan per kendaraan yang bertransaksi
        BigDecimal rataTarif = (totalTransaksi > 0)
            ? totalPendapatan.divide(BigDecimal.valueOf(totalTransaksi), 0, java.math.RoundingMode.HALF_UP)
            : BigDecimal.ZERO;

        // Inisialisasi list kartu KPI finansial
        List<KartuKpiDto> list = new ArrayList<>();
        // Menambahkan kartu KPI Total Pendapatan
        list.add(new KartuKpiDto("Total Pendapatan", formatRupiah(totalPendapatan), "Rp", "eco-success"));
        // Menambahkan kartu KPI Transaksi Lunas
        list.add(new KartuKpiDto("Transaksi Lunas", String.format(Locale.US, "%,d", totalTransaksi), "Transaksi", "primary"));
        // Menambahkan kartu KPI Rata-rata Durasi Parkir
        list.add(new KartuKpiDto("Rata-rata Durasi", formatMenitKeTeks(avgDurasi), "", "secondary"));
        // Menambahkan kartu KPI Rata-rata Tarif Transaksi
        list.add(new KartuKpiDto("Rata-rata Tarif", formatRupiah(rataTarif), "Rp", "primary"));
        // Mengembalikan daftar kartu KPI finansial
        return list;
    }

    // Method privat buatKpiOperasional untuk menghitung metrik KPI operasional dan log anomali IoT
    private List<KartuKpiDto> buatKpiOperasional(List<BarisOperasionalDto> rows, List<KartuKpiDto> masterKpis)
    {
        // Inisialisasi string nilai kendaraan masuk default "11"
        String kendaraanMasuk = "11";
        // Jika masterKpis tersedia dan memiliki nilai indeks ke-1, gunakan nilainya:
        if (masterKpis != null && masterKpis.size() > 1 && masterKpis.get(1) != null)
        {
            // Mengambil nilai metrik kendaraan masuk dari master KPI
            kendaraanMasuk = masterKpis.get(1).getNilai();
        }

        // Menghitung total rekaman log kejadian
        int totalLog = (rows != null) ? rows.size() : 0;
        // Inisialisasi penghitung anomali berstatus kritis (CRITICAL)
        int anomaliKritis = 0;
        // Jika daftar baris operasional tidak null, periksa tingkat keparahan:
        if (rows != null)
        {
            // Looping setiap baris log operasional:
            for (BarisOperasionalDto op : rows)
            {
                // Jika tingkat keparahan mengandung kata "CRITICAL", hitung sebagai anomali kritis:
                if (op.getTingkatKeparahan() != null && op.getTingkatKeparahan().toUpperCase().contains("CRITICAL"))
                {
                    // Menambahkan jumlah anomali kritis
                    anomaliKritis++;
                }
            }
        }

        // Inisialisasi list kartu KPI operasional
        List<KartuKpiDto> list = new ArrayList<>();
        // Menambahkan kartu KPI Kendaraan Masuk
        list.add(new KartuKpiDto("Kendaraan Masuk", kendaraanMasuk, "Unit", "primary"));
        // Menambahkan kartu KPI Rata-rata Durasi Parkir
        list.add(new KartuKpiDto("Rata-rata Durasi", "39 Menit", "", "secondary"));
        // Menambahkan kartu KPI Total Log Tercatat
        list.add(new KartuKpiDto("Total Log Tercatat", String.valueOf(totalLog), "Log", "secondary"));
        // Menambahkan kartu KPI Anomali Kritis yang membutuhkan perhatian petugas
        list.add(new KartuKpiDto("Anomali Kritis", String.valueOf(anomaliKritis), "Kasus", "alert-anomaly"));
        // Mengembalikan daftar kartu KPI operasional
        return list;
    }

    // Method privat buatKpiLingkungan untuk menghitung metrik dampak lingkungan dan reduksi emisi CO2
    private List<KartuKpiDto> buatKpiLingkungan(List<BarisLingkunganDto> rows)
    {
        // Inisialisasi variabel akumulasi total waktu dihemat dalam menit
        double totalMenitDihemat = 0.0;
        // Inisialisasi variabel akumulasi total reduksi emisi CO2 dalam gram
        double totalReduksiCo2 = 0.0;
        // Menghitung jumlah total kendaraan yang tercatat dalam log navigasi
        int totalKendaraan = (rows != null) ? rows.size() : 0;

        // Jika rows tidak null, lakukan akumulasi metrik lingkungan:
        if (rows != null)
        {
            // Looping setiap data navigasi ramah lingkungan:
            for (BarisLingkunganDto eco : rows)
            {
                // Jika menit dihemat tidak null, tambahkan ke total:
                if (eco.getMenitDihemat() != null)
                {
                    // Menjumlahkan menit waktu dihemat
                    totalMenitDihemat += eco.getMenitDihemat();
                }
                // Jika reduksi CO2 tidak null, tambahkan ke total:
                if (eco.getReduksiCo2Gram() != null)
                {
                    // Menjumlahkan reduksi CO2 dalam gram
                    totalReduksiCo2 += eco.getReduksiCo2Gram();
                }
            }
        }

        // Mengonversi total reduksi CO2 dari gram ke kilogram dengan pembulatan 2 desimal
        double totalCo2Kg = Math.round((totalReduksiCo2 / 1000.0) * 100.0) / 100.0;
        // Menghitung rata-rata waktu yang dihemat per mobil yang dipandu sistem IoT
        double rataHemat = (totalKendaraan > 0)
            ? Math.round((totalMenitDihemat / totalKendaraan) * 10.0) / 10.0
            : 0.0;

        // Inisialisasi list kartu KPI lingkungan
        List<KartuKpiDto> list = new ArrayList<>();
        // Menambahkan kartu KPI Reduksi Emisi CO2
        list.add(new KartuKpiDto("Reduksi Emisi CO2", String.format(Locale.US, "%.2f kg", totalCo2Kg), "kg", "eco-success"));
        // Menambahkan kartu KPI Total Waktu Dihemat
        list.add(new KartuKpiDto("Total Waktu Dihemat", String.format(Locale.US, "%.1f Menit", totalMenitDihemat), "Menit", "secondary"));
        // Menambahkan kartu KPI Kendaraan Terpandu Navigasi
        list.add(new KartuKpiDto("Kendaraan Terpandu", String.valueOf(totalKendaraan), "Unit", "primary"));
        // Menambahkan kartu KPI Rata-rata Waktu Dihemat per Mobil
        list.add(new KartuKpiDto("Rata-rata Hemat/Mobil", String.format(Locale.US, "%.1f Menit", rataHemat), "Menit", "eco-success"));
        // Mengembalikan daftar kartu KPI lingkungan
        return list;
    }

    // Method privat formatRupiah untuk mengubah nilai BigDecimal menjadi teks mata uang rupiah rapi
    private String formatRupiah(BigDecimal nilai)
    {
        // Jika nilai bernilai null, kembalikan teks default "Rp 0"
        if (nilai == null) { return "Rp 0"; }
        // Mengembalikan representasi string mata uang rupiah tanpa pecahan ",00"
        return FORMAT_RUPIAH.format(nilai).replace(",00", "");
    }

    // Method privat formatMenitKeTeks untuk mengonversi jumlah menit menjadi representasi teks jam dan menit
    private String formatMenitKeTeks(int totalMenit)
    {
        // Jika total menit bernilai kurang dari atau sama dengan 0, kembalikan "0 Menit"
        if (totalMenit <= 0) { return "0 Menit"; }
        // Menghitung pembagian jam
        int jam = totalMenit / 60;
        // Menghitung sisa menit menggunakan operasi modulo
        int sisaMenit = totalMenit % 60;
        // Jika terdapat komponen jam dan menit, format gabungan jam dan menit:
        if (jam > 0 && sisaMenit > 0)
        {
            // Mengembalikan format "Xj Ym"
            return jam + "j " + sisaMenit + "m";
        }
        // Jika hanya terdapat jam tanpa sisa menit, kembalikan format jam:
        else if (jam > 0)
        {
            // Mengembalikan format "X Jam"
            return jam + " Jam";
        }
        // Jika kurang dari 1 jam, kembalikan format menit saja:
        else
        {
            // Mengembalikan format "Y Menit"
            return sisaMenit + " Menit";
        }
    }

    // =====================================================================
    // Helper: Style Registry untuk Pengelolaan Font, Warna & Format Cell
    // =====================================================================
    // Kelas statis privat CellStyleRegistry untuk merestrukturisasi dan mengonsolidasi seluruh style sel Excel
    private static class CellStyleRegistry
    {
        // Deklarasi atribut CellStyle untuk berbagai varian tipografi judul dan teks
        final CellStyle titleFont;
        final CellStyle subtitleGreenFont;
        final CellStyle italicMutedFont;
        final CellStyle sectionTitleFont;
        final CellStyle boldLabel;
        final CellStyle normalText;
        final CellStyle amberBadge;
        final CellStyle greenBadge;

        // Deklarasi atribut CellStyle untuk kartu metrik KPI
        final CellStyle kpiValueCell;
        final CellStyle kpiLabelCell;

        // Deklarasi atribut CellStyle untuk header dan sel data normal tabel
        final CellStyle thStyle;
        final CellStyle tdNormal;
        final CellStyle tdNormalCenter;
        final CellStyle tdNormalCurrency;
        final CellStyle tdNormalNumber;
        final CellStyle tdNormalDecimal;

        // Deklarasi atribut CellStyle untuk sel data pola zebra striping
        final CellStyle tdZebra;
        final CellStyle tdZebraCenter;
        final CellStyle tdZebraCurrency;
        final CellStyle tdZebraNumber;
        final CellStyle tdZebraDecimal;

        // Deklarasi atribut CellStyle untuk baris total akumulasi
        final CellStyle totalLabelStyle;
        final CellStyle totalCurrencyStyle;
        final CellStyle totalNumberStyle;
        final CellStyle totalDecimalStyle;

        // Konstruktor CellStyleRegistry untuk menginisialisasi font dan cell styles dari workbook POI
        CellStyleRegistry(Workbook wb)
        {
            // Membuat objek DataFormat untuk formatting angka dan desimal
            DataFormat df = wb.createDataFormat();
            // Inisialisasi peta warna default DefaultIndexedColorMap
            DefaultIndexedColorMap colorMap = new DefaultIndexedColorMap();

            // Font Header Tabel: Font tebal putih Calibri ukuran 10
            Font fontHeader = wb.createFont();
            fontHeader.setFontName("Calibri");
            fontHeader.setBold(true);
            fontHeader.setColor(IndexedColors.WHITE.getIndex());
            fontHeader.setFontHeightInPoints((short) 10);

            // Font Judul Utama Dokumen: Font tebal Calibri ukuran 14
            Font fontTitle = wb.createFont();
            fontTitle.setFontName("Calibri");
            fontTitle.setBold(true);
            fontTitle.setFontHeightInPoints((short) 14);

            // Font Subjudul Hijau Ramah Lingkungan: Font tebal hijau Calibri ukuran 10
            Font fontSubtitleGreen = wb.createFont();
            fontSubtitleGreen.setFontName("Calibri");
            fontSubtitleGreen.setBold(true);
            fontSubtitleGreen.setColor(IndexedColors.GREEN.getIndex());
            fontSubtitleGreen.setFontHeightInPoints((short) 10);

            // Font Judul Bagian / Section: Font tebal Calibri ukuran 11
            Font fontSectionTitle = wb.createFont();
            fontSectionTitle.setFontName("Calibri");
            fontSectionTitle.setBold(true);
            fontSectionTitle.setFontHeightInPoints((short) 11);

            // Font Teks Muted Abu-Abu Miring: Font italic abu-abu ukuran 9
            Font fontMuted = wb.createFont();
            fontMuted.setFontName("Calibri");
            fontMuted.setItalic(true);
            fontMuted.setColor(IndexedColors.GREY_50_PERCENT.getIndex());
            fontMuted.setFontHeightInPoints((short) 9);

            // Font Label Tebal: Font tebal Calibri ukuran 9.5
            Font fontBold = wb.createFont();
            fontBold.setFontName("Calibri");
            fontBold.setBold(true);
            fontBold.setFontHeightInPoints((short) 9.5);

            // Font Nilai Angka KPI: Font tebal Calibri ukuran 13
            Font fontKpiVal = wb.createFont();
            fontKpiVal.setFontName("Calibri");
            fontKpiVal.setBold(true);
            fontKpiVal.setFontHeightInPoints((short) 13);

            // Font Reguler Isi Tabel: Font biasa Calibri ukuran 9.5
            Font fontRegular = wb.createFont();
            fontRegular.setFontName("Calibri");
            fontRegular.setFontHeightInPoints((short) 9.5);

            // 1. Inisialisasi Styles Teks dan Metadata
            titleFont = wb.createCellStyle();
            titleFont.setFont(fontTitle);

            subtitleGreenFont = wb.createCellStyle();
            subtitleGreenFont.setFont(fontSubtitleGreen);

            italicMutedFont = wb.createCellStyle();
            italicMutedFont.setFont(fontMuted);

            sectionTitleFont = wb.createCellStyle();
            sectionTitleFont.setFont(fontSectionTitle);

            boldLabel = wb.createCellStyle();
            boldLabel.setFont(fontBold);

            normalText = wb.createCellStyle();
            normalText.setFont(fontRegular);

            // Style Badge Amber untuk penanda mode simulasi
            amberBadge = wb.createCellStyle();
            amberBadge.setFont(fontBold);
            amberBadge.setAlignment(HorizontalAlignment.CENTER);
            amberBadge.setFillForegroundColor(IndexedColors.LIGHT_ORANGE.getIndex());
            amberBadge.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setBorders(amberBadge, BorderStyle.THIN);

            // Style Badge Hijau untuk penanda status live audit
            greenBadge = wb.createCellStyle();
            greenBadge.setFont(fontBold);
            greenBadge.setAlignment(HorizontalAlignment.CENTER);
            greenBadge.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
            greenBadge.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setBorders(greenBadge, BorderStyle.THIN);

            // 2. Inisialisasi Styles Kartu KPI
            kpiValueCell = wb.createCellStyle();
            kpiValueCell.setFont(fontKpiVal);
            kpiValueCell.setAlignment(HorizontalAlignment.CENTER);
            kpiValueCell.setVerticalAlignment(VerticalAlignment.CENTER);
            kpiValueCell.setFillForegroundColor(new XSSFColor(RGB_CARD_BG, colorMap));
            kpiValueCell.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setBorders(kpiValueCell, BorderStyle.THIN);

            kpiLabelCell = wb.createCellStyle();
            kpiLabelCell.setFont(fontRegular);
            kpiLabelCell.setAlignment(HorizontalAlignment.CENTER);
            kpiLabelCell.setVerticalAlignment(VerticalAlignment.CENTER);
            kpiLabelCell.setFillForegroundColor(new XSSFColor(RGB_CARD_BG, colorMap));
            kpiLabelCell.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setBorders(kpiLabelCell, BorderStyle.THIN);

            // 3. Inisialisasi Style Header Tabel (Navy Dark Background)
            thStyle = wb.createCellStyle();
            thStyle.setFont(fontHeader);
            thStyle.setAlignment(HorizontalAlignment.CENTER);
            thStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            thStyle.setFillForegroundColor(new XSSFColor(RGB_NAVY_HEADER, colorMap));
            thStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setBorders(thStyle, BorderStyle.THIN);

            // 4. Inisialisasi Style Baris Data Normal
            tdNormal = wb.createCellStyle();
            tdNormal.setFont(fontRegular);
            setBorders(tdNormal, BorderStyle.THIN);

            tdNormalCenter = wb.createCellStyle();
            tdNormalCenter.setFont(fontRegular);
            tdNormalCenter.setAlignment(HorizontalAlignment.CENTER);
            setBorders(tdNormalCenter, BorderStyle.THIN);

            tdNormalCurrency = wb.createCellStyle();
            tdNormalCurrency.setFont(fontRegular);
            tdNormalCurrency.setAlignment(HorizontalAlignment.RIGHT);
            tdNormalCurrency.setDataFormat(df.getFormat("#,##0"));
            setBorders(tdNormalCurrency, BorderStyle.THIN);

            tdNormalNumber = wb.createCellStyle();
            tdNormalNumber.setFont(fontRegular);
            tdNormalNumber.setAlignment(HorizontalAlignment.RIGHT);
            tdNormalNumber.setDataFormat(df.getFormat("#,##0"));
            setBorders(tdNormalNumber, BorderStyle.THIN);

            tdNormalDecimal = wb.createCellStyle();
            tdNormalDecimal.setFont(fontRegular);
            tdNormalDecimal.setAlignment(HorizontalAlignment.RIGHT);
            tdNormalDecimal.setDataFormat(df.getFormat("#,##0.0"));
            setBorders(tdNormalDecimal, BorderStyle.THIN);

            // 5. Inisialisasi Style Baris Data Zebra (Latar Slate 50)
            tdZebra = wb.createCellStyle();
            tdZebra.setFont(fontRegular);
            tdZebra.setFillForegroundColor(new XSSFColor(RGB_ZEBRA_ROW, colorMap));
            tdZebra.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setBorders(tdZebra, BorderStyle.THIN);

            tdZebraCenter = wb.createCellStyle();
            tdZebraCenter.setFont(fontRegular);
            tdZebraCenter.setAlignment(HorizontalAlignment.CENTER);
            tdZebraCenter.setFillForegroundColor(new XSSFColor(RGB_ZEBRA_ROW, colorMap));
            tdZebraCenter.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setBorders(tdZebraCenter, BorderStyle.THIN);

            tdZebraCurrency = wb.createCellStyle();
            tdZebraCurrency.setFont(fontRegular);
            tdZebraCurrency.setAlignment(HorizontalAlignment.RIGHT);
            tdZebraCurrency.setDataFormat(df.getFormat("#,##0"));
            tdZebraCurrency.setFillForegroundColor(new XSSFColor(RGB_ZEBRA_ROW, colorMap));
            tdZebraCurrency.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setBorders(tdZebraCurrency, BorderStyle.THIN);

            tdZebraNumber = wb.createCellStyle();
            tdZebraNumber.setFont(fontRegular);
            tdZebraNumber.setAlignment(HorizontalAlignment.RIGHT);
            tdZebraNumber.setDataFormat(df.getFormat("#,##0"));
            tdZebraNumber.setFillForegroundColor(new XSSFColor(RGB_ZEBRA_ROW, colorMap));
            tdZebraNumber.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setBorders(tdZebraNumber, BorderStyle.THIN);

            tdZebraDecimal = wb.createCellStyle();
            tdZebraDecimal.setFont(fontRegular);
            tdZebraDecimal.setAlignment(HorizontalAlignment.RIGHT);
            tdZebraDecimal.setDataFormat(df.getFormat("#,##0.0"));
            tdZebraDecimal.setFillForegroundColor(new XSSFColor(RGB_ZEBRA_ROW, colorMap));
            tdZebraDecimal.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setBorders(tdZebraDecimal, BorderStyle.THIN);

            // 6. Inisialisasi Style Baris Total Akumulatif (Double Bottom Border)
            totalLabelStyle = wb.createCellStyle();
            totalLabelStyle.setFont(fontBold);
            totalLabelStyle.setAlignment(HorizontalAlignment.RIGHT);
            totalLabelStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            totalLabelStyle.setFillForegroundColor(new XSSFColor(RGB_TOTAL_ROW, colorMap));
            totalLabelStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            totalLabelStyle.setBorderTop(BorderStyle.THIN);
            totalLabelStyle.setBorderBottom(BorderStyle.DOUBLE);

            totalCurrencyStyle = wb.createCellStyle();
            totalCurrencyStyle.setFont(fontBold);
            totalCurrencyStyle.setAlignment(HorizontalAlignment.RIGHT);
            totalCurrencyStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            totalCurrencyStyle.setDataFormat(df.getFormat("#,##0"));
            totalCurrencyStyle.setFillForegroundColor(new XSSFColor(RGB_TOTAL_ROW, colorMap));
            totalCurrencyStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            totalCurrencyStyle.setBorderTop(BorderStyle.THIN);
            totalCurrencyStyle.setBorderBottom(BorderStyle.DOUBLE);

            totalNumberStyle = wb.createCellStyle();
            totalNumberStyle.setFont(fontBold);
            totalNumberStyle.setAlignment(HorizontalAlignment.RIGHT);
            totalNumberStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            totalNumberStyle.setDataFormat(df.getFormat("#,##0"));
            totalNumberStyle.setFillForegroundColor(new XSSFColor(RGB_TOTAL_ROW, colorMap));
            totalNumberStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            totalNumberStyle.setBorderTop(BorderStyle.THIN);
            totalNumberStyle.setBorderBottom(BorderStyle.DOUBLE);

            totalDecimalStyle = wb.createCellStyle();
            totalDecimalStyle.setFont(fontBold);
            totalDecimalStyle.setAlignment(HorizontalAlignment.RIGHT);
            totalDecimalStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            totalDecimalStyle.setDataFormat(df.getFormat("#,##0.0"));
            totalDecimalStyle.setFillForegroundColor(new XSSFColor(RGB_TOTAL_ROW, colorMap));
            totalDecimalStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            totalDecimalStyle.setBorderTop(BorderStyle.THIN);
            totalDecimalStyle.setBorderBottom(BorderStyle.DOUBLE);
        }

        // Method statis privat setBorders untuk mengatur border seragam di keempat sisi sel
        private static void setBorders(CellStyle style, BorderStyle bs)
        {
            // Mengatur garis batas atas sel
            style.setBorderTop(bs);
            // Mengatur garis batas bawah sel
            style.setBorderBottom(bs);
            // Mengatur garis batas kiri sel
            style.setBorderLeft(bs);
            // Mengatur garis batas kanan sel
            style.setBorderRight(bs);
        }
    }
}
