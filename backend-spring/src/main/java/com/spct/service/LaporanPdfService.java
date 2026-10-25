package com.spct.service; // Nama package tempat file service laporan PDF ini berada

// Import kelas dasar dan elemen iText PDF (Document, Paragraph, Rectangle, Element, dll.)
import com.lowagie.text.*;
// Import kelas pembantu penyusunan iText PDF seperti PdfWriter, PdfPTable, PdfPCell, dll.
import com.lowagie.text.pdf.*;
// Import DTO LaporanResponseDto untuk struktur respon laporan
import com.spct.dto.LaporanResponseDto;
// Import seluruh inner class DTO laporan seperti MetadataLaporanDto, KartuKpiDto, dll.
import com.spct.dto.LaporanResponseDto.*;
// Import pustaka JFreeChart ChartFactory untuk pembuatan bagan grafik
import org.jfree.chart.ChartFactory;
// Import objek JFreeChart untuk bagan grafik visualisasi data
import org.jfree.chart.JFreeChart;
// Import ItemLabelAnchor untuk penempatan jangkar label nilai batang grafik
import org.jfree.chart.labels.ItemLabelAnchor;
// Import ItemLabelPosition untuk posisi orientasi teks label batang
import org.jfree.chart.labels.ItemLabelPosition;
// Import StandardCategoryItemLabelGenerator untuk generator format angka pada batang grafik
import org.jfree.chart.labels.StandardCategoryItemLabelGenerator;
// Import PlotOrientation untuk orientasi diagram batang horizontal atau vertikal
import org.jfree.chart.plot.PlotOrientation;
// Import CategoryPlot untuk konfigurasi kisi plot kategori diagram
import org.jfree.chart.plot.CategoryPlot;
// Import BarRenderer untuk rendering visual batang grafis
import org.jfree.chart.renderer.category.BarRenderer;
// Import StandardBarPainter untuk gaya pewarnaan batang flat tanpa gradien berlebih
import org.jfree.chart.renderer.category.StandardBarPainter;
// Import TextAnchor untuk titik penjangkaran perataan teks
import org.jfree.chart.ui.TextAnchor;
// Import DefaultCategoryDataset untuk struktur dataset data kategori bagan
import org.jfree.data.category.DefaultCategoryDataset;
// Import anotasi Service dari Spring Framework untuk registrasi service bean
import org.springframework.stereotype.Service;

// Import ImageIO untuk konversi dan kompresi gambar grafik ke stream format PNG
import javax.imageio.ImageIO;
// Import BufferedImage untuk manipulasi gambar di memori grafis Java
import java.awt.image.BufferedImage;
// Import ByteArrayOutputStream untuk menulis berkas biner PDF ke memori
import java.io.ByteArrayOutputStream;
// Import BigDecimal untuk kalkulasi nilai finansial presisi tinggi
import java.math.BigDecimal;
// Import DecimalFormat untuk pemformatan angka pecahan dan ribuan
import java.text.DecimalFormat;
// Import DateTimeFormatter untuk pemformatan tanggal dan waktu standar
import java.time.format.DateTimeFormatter;
// Import HashMap untuk struktur data pemetaan kunci-nilai
import java.util.HashMap;
// Import List interface dari java.util
import java.util.List;
// Import Locale untuk representasi lokal Indonesia
import java.util.Locale;
// Import Map interface dari java.util
import java.util.Map;
// Import TreeMap untuk pemetaan kunci-nilai yang terurut berdasarkan abjad/tanggal
import java.util.TreeMap;

/**
 * Service: LaporanPdfService
 * Mengonversi data LaporanResponseDto menjadi dokumen resmi PDF ber-kop surat,
 * bergaris rapi, dengan kartu ringkasan KPI, tabel data, serta lembar pengesahan tanda tangan
 * sesuai spesifikasi PK-UC010 (Mengelola Laporan Operasional).
 */
@Service // Menandai kelas ini sebagai Spring Service bean penyedia layanan ekspor dokumen PDF
// Kelas publik java LaporanPdfService untuk menghasilkan dokumen laporan resmi berformat PDF
public class LaporanPdfService
{
    // =====================================================================
    // Palet Warna & Tipografi Resmi (Clean Corporate & Eco-Friendly)
    // =====================================================================
    // Deklarasi konstanta warna utama COLOR_PRIMARY (Slate 900)
    private static final java.awt.Color COLOR_PRIMARY = new java.awt.Color(15, 23, 42);
    // Deklarasi konstanta warna latar header tabel COLOR_HEADER_BG (Slate 800)
    private static final java.awt.Color COLOR_HEADER_BG = new java.awt.Color(30, 41, 59);
    // Deklarasi konstanta warna teks header tabel COLOR_HEADER_TEXT (Putih)
    private static final java.awt.Color COLOR_HEADER_TEXT = java.awt.Color.WHITE;
    // Deklarasi konstanta warna baris zebra selang-seling COLOR_ZEBRA_BG (Slate 50)
    private static final java.awt.Color COLOR_ZEBRA_BG = new java.awt.Color(248, 250, 252);
    // Deklarasi konstanta warna garis pembatas tabel COLOR_BORDER (Slate 300)
    private static final java.awt.Color COLOR_BORDER = new java.awt.Color(203, 213, 225);
    // Deklarasi konstanta warna ramah lingkungan COLOR_ECO_GREEN (Green 600)
    private static final java.awt.Color COLOR_ECO_GREEN = new java.awt.Color(22, 163, 74);
    // Deklarasi konstanta warna latar banner peringatan COLOR_AMBER_BG (Amber 100)
    private static final java.awt.Color COLOR_AMBER_BG = new java.awt.Color(254, 243, 199);
    // Deklarasi konstanta warna teks banner peringatan COLOR_AMBER_TEXT (Amber 700)
    private static final java.awt.Color COLOR_AMBER_TEXT = new java.awt.Color(180, 83, 9);

    // Deklarasi font FONT_KOP_UTAMA untuk judul institusi pada kop surat
    private static final Font FONT_KOP_UTAMA = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, COLOR_PRIMARY);
    // Deklarasi font FONT_KOP_SUB untuk subjudul fasilitas ramah lingkungan pada kop surat
    private static final Font FONT_KOP_SUB = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, COLOR_ECO_GREEN);
    // Deklarasi font FONT_KOP_ALAMAT untuk alamat dan kontak instansi pada kop surat
    private static final Font FONT_KOP_ALAMAT = FontFactory.getFont(FontFactory.HELVETICA, 8, java.awt.Color.DARK_GRAY);

    // Deklarasi font FONT_JUDUL_LAPORAN untuk judul dokumen laporan
    private static final Font FONT_JUDUL_LAPORAN = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, COLOR_PRIMARY);
    // Deklarasi font FONT_META_LABEL untuk label atribut metadata
    private static final Font FONT_META_LABEL = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, java.awt.Color.GRAY);
    // Deklarasi font FONT_META_VAL untuk isi nilai atribut metadata
    private static final Font FONT_META_VAL = FontFactory.getFont(FontFactory.HELVETICA, 8, java.awt.Color.BLACK);

    // Deklarasi font FONT_KPI_VAL untuk angka metrik kartu ringkasan KPI
    private static final Font FONT_KPI_VAL = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, COLOR_PRIMARY);
    // Deklarasi font FONT_KPI_LABEL untuk teks keterangan kartu KPI
    private static final Font FONT_KPI_LABEL = FontFactory.getFont(FontFactory.HELVETICA, 7.5f, java.awt.Color.GRAY);

    // Deklarasi font FONT_TH untuk judul kolom header tabel
    private static final Font FONT_TH = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, COLOR_HEADER_TEXT);
    // Deklarasi font FONT_TD untuk isi sel data biasa pada tabel
    private static final Font FONT_TD = FontFactory.getFont(FontFactory.HELVETICA, 7.5f, java.awt.Color.BLACK);
    // Deklarasi font FONT_TD_BOLD untuk isi sel data berbobot tebal
    private static final Font FONT_TD_BOLD = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 7.5f, java.awt.Color.BLACK);
    // Deklarasi font FONT_TD_GREEN untuk isi sel data bertema ramah lingkungan
    private static final Font FONT_TD_GREEN = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 7.5f, COLOR_ECO_GREEN);

    // Deklarasi font FONT_FOOTER untuk nomor halaman dan catatan integritas data
    private static final Font FONT_FOOTER = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 7.5f, java.awt.Color.GRAY);
    // Deklarasi font FONT_TTD untuk label pengesahan tanda tangan
    private static final Font FONT_TTD = FontFactory.getFont(FontFactory.HELVETICA, 8, java.awt.Color.BLACK);
    // Deklarasi font FONT_TTD_BOLD untuk nama jabatan penandatangan
    private static final Font FONT_TTD_BOLD = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, java.awt.Color.BLACK);

    /**
     * Method Utama: Mengonversi LaporanResponseDto menjadi byte array PDF
     */
    // Method publik generatePdf untuk mengonversi data respon laporan menjadi byte array PDF resmi
    public byte[] generatePdf(LaporanResponseDto dto)
    {
        // Inisialisasi objek ByteArrayOutputStream untuk menampung stream data PDF
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        // Menggunakan ukuran kertas A4 Landscape agar tabel data historis padat termuat rapi dan jelas
        Document document = new Document(PageSize.A4.rotate(), 36, 36, 36, 36);

        // Membuka blok try-catch untuk proses penyusunan dokumen PDF:
        try
        {
            // Mengaitkan PdfWriter dengan document dan output stream
            PdfWriter writer = PdfWriter.getInstance(document, out);
            // Menambahkan event helper untuk mencetak footer nomor halaman dokumen secara otomatis di setiap halaman
            writer.setPageEvent(new PdfPageEventHelper() {
                @Override // Menimpa method onEndPage untuk merender nomor halaman di sudut kanan bawah
                public void onEndPage(PdfWriter writer, Document doc) {
                    // Mengambil direct content byte dari writer
                    PdfContentByte cb = writer.getDirectContent();
                    // Menampilkan teks halaman resmi SPCT sejajar rata kanan di bagian footer
                    ColumnText.showTextAligned(cb, Element.ALIGN_RIGHT,
                        new Phrase(String.format("SPCT // Dokumen Resmi Halaman %d", writer.getPageNumber()), FONT_FOOTER),
                        doc.right(), doc.bottom() - 15, 0);
                }
            });

            // Membuka dokumen PDF untuk mulai menulis konten
            document.open();

            // 1. Tambahkan Kop Surat Resmi SPCT dan Rumah Sakit
            tambahkanKopSurat(document);

            // 2. Tambahkan Judul & Metadata Laporan
            tambahkanMetadataLaporan(document, dto.getMetadata());

            // 3. Tambahkan Kotak KPI Ringkasan Eksekutif
            tambahkanKartuRingkasan(document, dto.getRingkasan());

            // 4. Tambahkan Visualisasi Grafik Resmi (JFreeChart - PK-UC010 Step 7)
            tambahkanGrafikVisualisasi(document, dto);

            // 5. Tambahkan Tabel Data Historis Sesuai Jenis Laporan
            String jenis = dto.getMetadata().getJenisLaporan();
            // Jika jenis laporan adalah finansial, maka buat tabel transaksi finansial:
            if ("finansial".equalsIgnoreCase(jenis))
            {
                // Menambahkan tabel rincian transaksi finansial
                tambahkanTabelFinansial(document, dto.getTabelFinansial());
            }
            // Jika jenis laporan adalah operasional, maka buat tabel log operasional:
            else if ("operasional".equalsIgnoreCase(jenis))
            {
                // Menambahkan tabel rincian log operasional dan anomali IoT
                tambahkanTabelOperasional(document, dto.getTabelOperasional());
            }
            // Jika jenis laporan adalah lingkungan, maka buat tabel dampak lingkungan:
            else if ("lingkungan".equalsIgnoreCase(jenis))
            {
                // Menambahkan tabel rincian data dampak lingkungan
                tambahkanTabelLingkungan(document, dto.getTabelLingkungan());
            }
            else // Komprehensif (Menampilkan ketiga modul secara terpadu)
            {
                // Menambahkan seluruh bagian modul komprehensif
                tambahkanSectionKomprehensif(document, dto);
            }

            // 6. Tambahkan Catatan Hukum & Lembar Pengesahan Tanda Tangan
            tambahkanLembarPengesahan(document, dto.getMetadata());

            // Menutup dokumen PDF setelah seluruh konten selesai ditulis
            document.close();
        }
        // Menangkap DocumentException jika terjadi kegagalan pemrosesan dokumen PDF:
        catch (DocumentException e)
        {
            // Melemparkan RuntimeException dengan pesan penjelasan kegagalan
            throw new RuntimeException("Gagal menghasilkan dokumen PDF laporan: " + e.getMessage(), e);
        }

        // Mengembalikan representasi byte array biner dari berkas PDF
        return out.toByteArray();
    }

    // =====================================================================
    // 1. Kop Surat Resmi SPCT & RS
    // =====================================================================
    // Method privat tambahkanKopSurat untuk merender kop surat resmi rumah sakit
    private void tambahkanKopSurat(Document document) throws DocumentException
    {
        // Inisialisasi tabel 1 kolom untuk kop surat
        PdfPTable kop = new PdfPTable(1);
        // Mengatur lebar tabel kop sebesar 100 persen
        kop.setWidthPercentage(100);

        // Membuat sel wadah kop surat tanpa garis batas
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);

        // Menambahkan baris judul instansi utama SPCT
        Paragraph p1 = new Paragraph("SISTEM PARKIR CERDAS TERINTEGRASI IoT (SPCT)", FONT_KOP_UTAMA);
        p1.setAlignment(Element.ALIGN_CENTER);
        cell.addElement(p1);

        // Menambahkan baris subjudul manajemen fasilitas ramah lingkungan
        Paragraph p2 = new Paragraph("MANAJEMEN RUMAH SAKIT — FASILITAS BASEMENT RAMAH LINGKUNGAN", FONT_KOP_SUB);
        p2.setAlignment(Element.ALIGN_CENTER);
        p2.setSpacingBefore(2);
        cell.addElement(p2);

        // Menambahkan baris alamat dan kontak resmi
        Paragraph p3 = new Paragraph("Alamat: Gedung Medik Terpadu Lantai Basement 1 • Telp: (0274) 555-SPCT • Email: smartparking@hospital.id", FONT_KOP_ALAMAT);
        p3.setAlignment(Element.ALIGN_CENTER);
        p3.setSpacingBefore(2);
        p3.setSpacingAfter(6);
        cell.addElement(p3);

        // Menambahkan sel ke dalam tabel kop
        kop.addCell(cell);
        // Menambahkan tabel kop ke dokumen PDF
        document.add(kop);

        // Garis Pembatas Kop Surat Ganda (Garis tebal biru gelap + garis tipis abu-abu)
        PdfPTable divider = new PdfPTable(1);
        divider.setWidthPercentage(100);
        // Sel garis tebal biru gelap
        PdfPCell c1 = new PdfPCell();
        c1.setBackgroundColor(COLOR_PRIMARY);
        c1.setFixedHeight(2.0f);
        c1.setBorder(Rectangle.NO_BORDER);
        divider.addCell(c1);

        // Sel garis tipis pemisah
        PdfPCell c2 = new PdfPCell();
        c2.setFixedHeight(1.0f);
        c2.setBorder(Rectangle.NO_BORDER);
        divider.addCell(c2);

        // Menambahkan garis pembatas ke dokumen
        document.add(divider);
    }

    // =====================================================================
    // 2. Metadata Laporan & Banner Simulasi
    // =====================================================================
    // Method privat tambahkanMetadataLaporan untuk mencantumkan rincian metadata dokumen
    private void tambahkanMetadataLaporan(Document document, MetadataLaporanDto meta) throws DocumentException
    {
        // Menambahkan judul laporan berhuruf kapital
        Paragraph judul = new Paragraph(meta.getJudulLaporan().toUpperCase(), FONT_JUDUL_LAPORAN);
        judul.setAlignment(Element.ALIGN_LEFT);
        judul.setSpacingBefore(8);
        judul.setSpacingAfter(4);
        document.add(judul);

        // Membuat tabel metadata dengan 4 kolom sejajar
        PdfPTable metaTable = new PdfPTable(4);
        metaTable.setWidthPercentage(100);
        metaTable.setWidths(new float[]{25, 25, 25, 25});
        metaTable.setSpacingAfter(8);

        // Membuat objek DateTimeFormatter dengan pola standar
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        // Mengisi sel-sel informasi metadata laporan
        addMetaCell(metaTable, "Periode Laporan", meta.getTanggalMulai() + " s.d. " + meta.getTanggalAkhir());
        addMetaCell(metaTable, "Tanggal Cetak", meta.getWaktuGenerate().format(dtf) + " WIB");
        addMetaCell(metaTable, "Total Rekaman", meta.getTotalBaris() + " Baris Data");
        addMetaCell(metaTable, "Otoritas Penerbit", "Akun Manajemen RS (Admin)");

        // Menambahkan tabel metadata ke dokumen
        document.add(metaTable);

        // Jika mode simulasi aktif, tambahkan banner informasi mode simulasi:
        if (meta.isModeSimulasi())
        {
            // Membuat tabel banner peringatan simulasi
            PdfPTable banner = new PdfPTable(1);
            banner.setWidthPercentage(100);
            banner.setSpacingAfter(8);

            // Membuat sel peringatan berlatar kuning amber
            PdfPCell cell = new PdfPCell(new Phrase(
                "[MODE SIMULASI PEMBAYARAN]: Gateway e-Toll/QRIS saat ini berjalan secara simulasi dari kiosk keluar. Nilai biaya telah diselaraskan dengan SK Tarif Parkir RS.",
                FontFactory.getFont(FontFactory.HELVETICA_BOLD, 7.5f, COLOR_AMBER_TEXT)));
            cell.setBackgroundColor(COLOR_AMBER_BG);
            cell.setBorderColor(new java.awt.Color(245, 158, 11));
            cell.setPadding(5);
            banner.addCell(cell);
            // Menambahkan banner simulasi ke dokumen
            document.add(banner);
        }
    }

    // Method privat addMetaCell untuk menambahkan satu blok informasi label dan nilai metadata
    private void addMetaCell(PdfPTable table, String label, String value)
    {
        // Membuat sel baru tanpa border
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.NO_BORDER);
        // Menambahkan paragraf label metadata dengan font abu-abu
        cell.addElement(new Paragraph(label, FONT_META_LABEL));
        // Menambahkan paragraf nilai metadata dengan font reguler hitam
        cell.addElement(new Paragraph(value, FONT_META_VAL));
        // Menambahkan sel ke dalam tabel
        table.addCell(cell);
    }

    // =====================================================================
    // 3. Kotak Ringkasan KPI Eksekutif
    // =====================================================================
    // Method privat tambahkanKartuRingkasan untuk merender kartu ringkasan KPI eksekutif
    private void tambahkanKartuRingkasan(Document document, List<KartuKpiDto> ringkasan) throws DocumentException
    {
        // Jika list ringkasan null atau kosong, hentikan eksekusi method
        if (ringkasan == null || ringkasan.isEmpty()) return;

        // Menghitung jumlah kartu KPI yang akan ditampilkan
        int numCards = ringkasan.size();
        // Membuat tabel dengan jumlah kolom sesuai banyaknya kartu KPI
        PdfPTable kpiTable = new PdfPTable(numCards);
        kpiTable.setWidthPercentage(100);
        kpiTable.setSpacingAfter(10);

        // Looping untuk merender masing-masing kartu KPI:
        for (KartuKpiDto kpi : ringkasan)
        {
            // Membuat sel kartu dengan border dan latar warna Slate 50
            PdfPCell cell = new PdfPCell();
            cell.setBackgroundColor(COLOR_ZEBRA_BG);
            cell.setBorderColor(COLOR_BORDER);
            cell.setPadding(6);

            // Menambahkan teks label metrik KPI
            cell.addElement(new Paragraph(kpi.getLabel().toUpperCase(), FONT_KPI_LABEL));
            // Menambahkan nilai metrik KPI dengan font berukuran besar dan tebal
            cell.addElement(new Paragraph(kpi.getNilai(), FONT_KPI_VAL));

            // Menambahkan sel kartu ke dalam tabel
            kpiTable.addCell(cell);
        }

        // Menambahkan tabel ringkasan KPI ke dokumen
        document.add(kpiTable);
    }

    // =====================================================================
    // 4A. Tabel Laporan Finansial
    // =====================================================================
    // Method privat tambahkanTabelFinansial untuk menyusun tabel rekaman data finansial dan pendapatan
    private void tambahkanTabelFinansial(Document document, List<BarisFinansialDto> rows) throws DocumentException
    {
        // Inisialisasi tabel 9 kolom untuk data finansial
        PdfPTable table = new PdfPTable(9);
        table.setWidthPercentage(100);
        // Mengatur proporsi lebar kolom tabel
        table.setWidths(new float[]{4, 12, 13, 8, 16, 16, 10, 11, 10});

        // Inisialisasi array judul kolom tabel finansial
        String[] headers = {"No", "No. Tiket", "Plat Nomor", "Jenis", "Waktu Masuk", "Waktu Keluar", "Durasi", "Total Biaya", "Kanal Bayar"};
        // Looping untuk merender setiap header kolom
        for (String h : headers) { addHeaderCell(table, h); }

        // Jika rows bernilai null atau kosong, tampilkan baris kosong pemberitahuan:
        if (rows == null || rows.isEmpty())
        {
            // Menambahkan baris pesan kosong
            addEmptyRow(table, 9, "Tidak ada transaksi pembayaran lunas pada periode ini.");
        }
        else // Jika terdapat data baris finansial:
        {
            // Inisialisasi grand total akumulasi dengan nilai 0
            BigDecimal grandTotal = BigDecimal.ZERO;
            // Inisialisasi boolean alternate untuk efek zebra striping baris
            boolean alternate = false;
            // Looping setiap transaksi finansial:
            for (BarisFinansialDto r : rows)
            {
                // Menentukan warna latar baris selang-seling
                java.awt.Color bg = alternate ? COLOR_ZEBRA_BG : java.awt.Color.WHITE;
                // Membalikkan nilai boolean alternate
                alternate = !alternate;

                // Menambahkan sel No urut
                addCell(table, String.valueOf(r.getNo()), Element.ALIGN_CENTER, bg, FONT_TD);
                // Menambahkan sel No Tiket
                addCell(table, r.getNomorTiket(), Element.ALIGN_LEFT, bg, FONT_TD_BOLD);
                // Menambahkan sel Plat Nomor
                addCell(table, r.getPlatNomor(), Element.ALIGN_LEFT, bg, FONT_TD_BOLD);
                // Menambahkan sel Jenis Kendaraan
                addCell(table, r.getJenisKendaraan(), Element.ALIGN_CENTER, bg, FONT_TD);
                // Menambahkan sel Waktu Masuk
                addCell(table, r.getWaktuMasuk(), Element.ALIGN_CENTER, bg, FONT_TD);
                // Menambahkan sel Waktu Keluar
                addCell(table, r.getWaktuKeluar(), Element.ALIGN_CENTER, bg, FONT_TD);
                // Menambahkan sel Durasi Parkir
                addCell(table, r.getDurasiTeks(), Element.ALIGN_CENTER, bg, FONT_TD);
                // Menambahkan sel Total Biaya dengan format rupiah warna hijau
                addCell(table, "Rp " + Number(r.getTotalTarif()), Element.ALIGN_RIGHT, bg, FONT_TD_GREEN);
                // Menambahkan sel Kanal Pembayaran
                addCell(table, r.getKanalPembayaran(), Element.ALIGN_CENTER, bg, FONT_TD);

                // Jika tarif tidak null, akumulasikan ke grand total
                if (r.getTotalTarif() != null) grandTotal = grandTotal.add(r.getTotalTarif());
            }

            // Baris Total Akumulatif: Sel label total rekapitulasi merentang 7 kolom
            PdfPCell totalLabel = new PdfPCell(new Phrase("TOTAL PENDAPATAN REKAPITULASI", FONT_TD_BOLD));
            totalLabel.setColspan(7);
            totalLabel.setHorizontalAlignment(Element.ALIGN_RIGHT);
            totalLabel.setBackgroundColor(COLOR_ZEBRA_BG);
            totalLabel.setBorderColor(COLOR_BORDER);
            totalLabel.setPadding(5);
            table.addCell(totalLabel);

            // Sel nilai grand total merentang 2 kolom
            PdfPCell totalVal = new PdfPCell(new Phrase("Rp " + Number(grandTotal), FONT_TD_GREEN));
            totalVal.setColspan(2);
            totalVal.setHorizontalAlignment(Element.ALIGN_RIGHT);
            totalVal.setBackgroundColor(COLOR_ZEBRA_BG);
            totalVal.setBorderColor(COLOR_BORDER);
            totalVal.setPadding(5);
            table.addCell(totalVal);
        }

        // Menambahkan tabel finansial ke dokumen PDF
        document.add(table);
    }

    // =====================================================================
    // 4B. Tabel Laporan Operasional & Okupansi
    // =====================================================================
    // Method privat tambahkanTabelOperasional untuk menyusun tabel log anomali dan operasional IoT
    private void tambahkanTabelOperasional(Document document, List<BarisOperasionalDto> rows) throws DocumentException
    {
        // Inisialisasi tabel PDF dengan 9 kolom (menampung kolom tambahan Jenis Anomali)
        PdfPTable table = new PdfPTable(9);
        // Mengatur lebar tabel sebesar 100 persen dari lebar halaman PDF
        table.setWidthPercentage(100);
        // Mengatur proporsi lebar relatif untuk kesembilan kolom
        table.setWidths(new float[]{4, 10, 14, 9, 15, 12, 22, 7, 7});

        // Array headers judul kolom untuk tabel laporan operasional dan anomali
        String[] headers = {"No", "ID Log", "Waktu Kejadian", "Slot / Node", "Tipe Kejadian", "Jenis Anomali", "Catatan Detail", "Severity", "Status"};
        // Looping untuk menambahkan setiap sel header ke dalam objek tabel
        for (String h : headers) { addHeaderCell(table, h); }

        // Jika rows bernilai null atau kosong, maka:
        if (rows == null || rows.isEmpty())
        {
            // Menampilkan satu baris kosong dengan pesan pemberitahuan yang di-span 9 kolom
            addEmptyRow(table, 9, "Tidak ada log kejadian atau anomali pada periode ini.");
        }
        else // Jika terdapat rekaman data, maka:
        {
            // Deklarasi atribut alternate bertipe boolean untuk pewarnaan baris selang-seling (zebra pattern)
            boolean alternate = false;
            // Looping setiap objek BarisOperasionalDto dari list rows:
            for (BarisOperasionalDto r : rows)
            {
                // Inisialisasi warna latar baris: abu-abu muda jika alternate true, putih jika false
                java.awt.Color bg = alternate ? COLOR_ZEBRA_BG : java.awt.Color.WHITE;
                // Membalikkan nilai boolean alternate untuk baris berikutnya
                alternate = !alternate;

                // Menambahkan sel kolom 0: Nomor urut baris (rata tengah)
                addCell(table, String.valueOf(r.getNo()), Element.ALIGN_CENTER, bg, FONT_TD);
                // Menambahkan sel kolom 1: ID Log (rata kiri, font tebal)
                addCell(table, r.getIdLog(), Element.ALIGN_LEFT, bg, FONT_TD_BOLD);
                // Menambahkan sel kolom 2: Waktu kejadian (rata tengah)
                addCell(table, r.getWaktu(), Element.ALIGN_CENTER, bg, FONT_TD);
                // Menambahkan sel kolom 3: Identitas slot parkir (rata tengah, font tebal)
                addCell(table, r.getIdSlot(), Element.ALIGN_CENTER, bg, FONT_TD_BOLD);
                // Menambahkan sel kolom 4: Tipe kejadian sistem (rata kiri)
                addCell(table, r.getJenisKejadian(), Element.ALIGN_LEFT, bg, FONT_TD);
                // Menambahkan sel kolom 5: Kategori jenis anomali dari penanganan petugas (rata tengah)
                addCell(table, r.getJenisAnomali() != null ? r.getJenisAnomali() : "-", Element.ALIGN_CENTER, bg, FONT_TD);
                // Menambahkan sel kolom 6: Catatan detail kejadian (rata kiri)
                addCell(table, r.getCatatanDetail(), Element.ALIGN_LEFT, bg, FONT_TD);
                // Menambahkan sel kolom 7: Tingkat keparahan severity (warna merah jika CRITICAL)
                addCell(table, r.getTingkatKeparahan(), Element.ALIGN_CENTER, bg,
                    "CRITICAL".equals(r.getTingkatKeparahan()) ? FontFactory.getFont(FontFactory.HELVETICA_BOLD, 7.5f, java.awt.Color.RED) : FONT_TD);
                // Menambahkan sel kolom 8: Status resolusi validasi petugas (rata tengah)
                addCell(table, r.getStatusResolusi(), Element.ALIGN_CENTER, bg, FONT_TD);
            }
        }

        // Menambahkan elemen tabel operasional ke dalam dokumen PDF
        document.add(table);
    }

    // =====================================================================
    // 4C. Tabel Laporan Lingkungan (Eco-Metric)
    // =====================================================================
    // Method privat tambahkanTabelLingkungan untuk menyusun tabel evaluasi efisiensi waktu dan reduksi emisi
    private void tambahkanTabelLingkungan(Document document, List<BarisLingkunganDto> rows) throws DocumentException
    {
        // Inisialisasi tabel 8 kolom untuk data dampak lingkungan
        PdfPTable table = new PdfPTable(8);
        table.setWidthPercentage(100);
        // Mengatur proporsi lebar kolom tabel
        table.setWidths(new float[]{4, 14, 11, 16, 16, 13, 13, 13});

        // Inisialisasi array judul kolom tabel lingkungan
        String[] headers = {"No", "Plat Nomor", "Slot Tujuan", "Waktu Masuk", "Tiba di Slot", "Durasi Nyata", "Waktu Dihemat", "Reduksi CO2"};
        // Looping untuk merender header kolom tabel
        for (String h : headers) { addHeaderCell(table, h); }

        // Jika rows bernilai null atau kosong, tampilkan baris kosong pemberitahuan:
        if (rows == null || rows.isEmpty())
        {
            // Menambahkan baris pesan kosong
            addEmptyRow(table, 8, "Tidak ada data riwayat navigasi sensor pada periode ini.");
        }
        else // Jika terdapat data riwayat navigasi sensor:
        {
            // Inisialisasi boolean alternate untuk efek zebra
            boolean alternate = false;
            // Inisialisasi variabel akumulator total reduksi CO2 dalam gram
            double totalCo2Gram = 0.0;
            // Inisialisasi variabel akumulator total waktu dihemat dalam menit
            double totalMenitHemat = 0.0;

            // Looping setiap baris data navigasi lingkungan:
            for (BarisLingkunganDto r : rows)
            {
                // Menentukan warna baris zebra
                java.awt.Color bg = alternate ? COLOR_ZEBRA_BG : java.awt.Color.WHITE;
                // Membalikkan nilai boolean alternate
                alternate = !alternate;

                // Menambahkan sel No urut
                addCell(table, String.valueOf(r.getNo()), Element.ALIGN_CENTER, bg, FONT_TD);
                // Menambahkan sel Plat Nomor kendaraan
                addCell(table, r.getPlatNomor(), Element.ALIGN_LEFT, bg, FONT_TD_BOLD);
                // Menambahkan sel Identitas Slot Parkir
                addCell(table, r.getIdSlot(), Element.ALIGN_CENTER, bg, FONT_TD_BOLD);
                // Menambahkan sel Waktu Masuk Gerbang
                addCell(table, r.getWaktuMasuk(), Element.ALIGN_CENTER, bg, FONT_TD);
                // Menambahkan sel Waktu Tiba di Slot
                addCell(table, r.getWaktuTiba(), Element.ALIGN_CENTER, bg, FONT_TD);
                // Menambahkan sel Durasi Nyata dalam detik
                addCell(table, r.getDurasiTempuhDetik() + " Detik", Element.ALIGN_RIGHT, bg, FONT_TD);
                // Menambahkan sel Estimasi Waktu Dihemat dalam menit
                addCell(table, r.getMenitDihemat() + " Menit", Element.ALIGN_RIGHT, bg, FONT_TD_BOLD);
                // Menambahkan sel Estimasi Reduksi Emisi CO2 dalam gram
                addCell(table, r.getReduksiCo2Gram() + " g", Element.ALIGN_RIGHT, bg, FONT_TD_GREEN);

                // Jika nilai reduksi CO2 tidak null, akumulasikan
                if (r.getReduksiCo2Gram() != null) totalCo2Gram += r.getReduksiCo2Gram();
                // Jika nilai menit dihemat tidak null, akumulasikan
                if (r.getMenitDihemat() != null) totalMenitHemat += r.getMenitDihemat();
            }

            // Baris Total Akumulatif: Label total akumulasi penghematan
            PdfPCell totalLabel = new PdfPCell(new Phrase("TOTAL AKUMULASI PENGHEMATAN EMISI", FONT_TD_BOLD));
            totalLabel.setColspan(6);
            totalLabel.setHorizontalAlignment(Element.ALIGN_RIGHT);
            totalLabel.setBackgroundColor(COLOR_ZEBRA_BG);
            totalLabel.setBorderColor(COLOR_BORDER);
            totalLabel.setPadding(5);
            table.addCell(totalLabel);

            // Sel akumulasi total waktu dihemat
            PdfPCell totalMenit = new PdfPCell(new Phrase(String.format("%.1f Menit", totalMenitHemat), FONT_TD_BOLD));
            totalMenit.setHorizontalAlignment(Element.ALIGN_RIGHT);
            totalMenit.setBackgroundColor(COLOR_ZEBRA_BG);
            totalMenit.setBorderColor(COLOR_BORDER);
            totalMenit.setPadding(5);
            table.addCell(totalMenit);

            // Sel akumulasi total reduksi emisi CO2 dalam kilogram
            PdfPCell totalVal = new PdfPCell(new Phrase(String.format("%.2f kg CO2", totalCo2Gram / 1000.0), FONT_TD_GREEN));
            totalVal.setHorizontalAlignment(Element.ALIGN_RIGHT);
            totalVal.setBackgroundColor(COLOR_ZEBRA_BG);
            totalVal.setBorderColor(COLOR_BORDER);
            totalVal.setPadding(5);
            table.addCell(totalVal);
        }

        // Menambahkan tabel lingkungan ke dokumen PDF
        document.add(table);
    }

    // =====================================================================
    // 4D. Section Laporan Komprehensif (3 Modul Sekaligus)
    // =====================================================================
    // Method privat tambahkanSectionKomprehensif untuk menyatukan ketiga modul laporan dalam satu dokumen utuh
    private void tambahkanSectionKomprehensif(Document document, LaporanResponseDto dto) throws DocumentException
    {
        // 1. Modul Finansial: Menambahkan judul bagian dan tabel finansial
        Paragraph sec1 = new Paragraph("1. MODUL REKAPITULASI FINANSIAL & TRANSAKSI", FONT_JUDUL_LAPORAN);
        sec1.setSpacingBefore(10);
        sec1.setSpacingAfter(4);
        document.add(sec1);
        tambahkanTabelFinansial(document, dto.getTabelFinansial());

        // 2. Modul Operasional: Menambahkan judul bagian dan tabel operasional
        Paragraph sec2 = new Paragraph("2. MODUL AUDIT OPERASIONAL & ANOMALI SENSOR IoT", FONT_JUDUL_LAPORAN);
        sec2.setSpacingBefore(12);
        sec2.setSpacingAfter(4);
        document.add(sec2);
        tambahkanTabelOperasional(document, dto.getTabelOperasional());

        // 3. Modul Lingkungan: Menambahkan judul bagian dan tabel dampak lingkungan
        Paragraph sec3 = new Paragraph("3. MODUL DAMPAK LINGKUNGAN & ECO-METRIC", FONT_JUDUL_LAPORAN);
        sec3.setSpacingBefore(12);
        sec3.setSpacingAfter(4);
        document.add(sec3);
        tambahkanTabelLingkungan(document, dto.getTabelLingkungan());
    }

    // =====================================================================
    // 5. Lembar Pengesahan Tanda Tangan & Immutability Notice
    // =====================================================================
    // Method privat tambahkanLembarPengesahan untuk merender lembar pengesahan tanda tangan dan catatan integritas
    private void tambahkanLembarPengesahan(Document document, MetadataLaporanDto meta) throws DocumentException
    {
        // Catatan Integritas Data (Immutability Notice Sesuai Use-Case Business Rule 1)
        Paragraph notice = new Paragraph(
            "* CATATAN INTEGRITAS: Dokumen ini diterbitkan secara otomatis dari database transaksi historis SPCT (PK-UC010). " +
            "Data bersifat mutlak (Read-Only) dan menjadi dokumen resmi pertanggungjawaban audit operasional fasilitas.",
            FONT_FOOTER);
        notice.setSpacingBefore(14);
        notice.setSpacingAfter(12);
        document.add(notice);

        // Tabel 2 Kolom untuk tata letak tanda tangan pengawas lapangan dan manajer operasional
        PdfPTable ttd = new PdfPTable(2);
        ttd.setWidthPercentage(100);
        ttd.setKeepTogether(true);

        // Memformat tanggal akhir laporan menjadi format teks tanggal panjang
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd MMMM yyyy");
        String tglHariIni = meta.getTanggalAkhir().format(dtf);

        // Sel tanda tangan sisi kiri (Pengawas Lapangan)
        PdfPCell cKiri = new PdfPCell();
        cKiri.setBorder(Rectangle.NO_BORDER);
        cKiri.addElement(new Paragraph("Mengetahui,", FONT_TTD));
        cKiri.addElement(new Paragraph("Petugas Pengawas Lapangan,", FONT_TTD_BOLD));
        cKiri.addElement(new Paragraph("\n\n\n")); // Ruang kosong untuk pembubuhan tanda tangan fisik
        cKiri.addElement(new Paragraph("( ___________________________ )", FONT_TTD));
        cKiri.addElement(new Paragraph("NIP / ID Petugas Lapangan", FONT_TTD));
        ttd.addCell(cKiri);

        // Sel tanda tangan sisi kanan (Manajer Operasional & Keuangan RS)
        PdfPCell cKanan = new PdfPCell();
        cKanan.setBorder(Rectangle.NO_BORDER);
        cKanan.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cKanan.addElement(new Paragraph("Yogyakarta, " + tglHariIni, FONT_TTD));
        cKanan.addElement(new Paragraph("Manajer Operasional & Keuangan RS,", FONT_TTD_BOLD));
        cKanan.addElement(new Paragraph("\n\n\n")); // Ruang kosong untuk pembubuhan tanda tangan fisik
        cKanan.addElement(new Paragraph("( ___________________________ )", FONT_TTD));
        cKanan.addElement(new Paragraph("NIP: 19850412.201001.1.002", FONT_TTD));
        ttd.addCell(cKanan);

        // Menambahkan tabel tanda tangan ke dokumen PDF
        document.add(ttd);
    }

    // =====================================================================
    // Helper Tabel Cell Formatters
    // =====================================================================
    // Method privat addHeaderCell untuk membuat sel header dengan format warna standar
    private void addHeaderCell(PdfPTable table, String text)
    {
        // Membuat sel dengan frasa teks dan font header putih
        PdfPCell cell = new PdfPCell(new Phrase(text, FONT_TH));
        cell.setBackgroundColor(COLOR_HEADER_BG);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(4);
        cell.setBorderColor(COLOR_BORDER);
        table.addCell(cell);
    }

    // Method privat addCell untuk menambahkan sel data dengan kustomisasi perataan, warna latar, dan font
    private void addCell(PdfPTable table, String text, int align, java.awt.Color bg, Font font)
    {
        // Membuat sel data dengan frasa teks
        PdfPCell cell = new PdfPCell(new Phrase(text != null ? text : "-", font));
        cell.setHorizontalAlignment(align);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setBackgroundColor(bg);
        cell.setPadding(4);
        cell.setBorderColor(COLOR_BORDER);
        table.addCell(cell);
    }

    // Method privat addEmptyRow untuk menampilkan satu baris kosong dengan pesan penjelasan ketika data tidak ditemukan
    private void addEmptyRow(PdfPTable table, int colspan, String message)
    {
        // Membuat sel pemberitahuan yang merentang seluruh kolom tabel
        PdfPCell cell = new PdfPCell(new Phrase(message, FONT_FOOTER));
        cell.setColspan(colspan);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(10);
        cell.setBorderColor(COLOR_BORDER);
        table.addCell(cell);
    }

    // Method privat Number untuk memformat angka BigDecimal dengan pemisah ribuan titik
    private String Number(BigDecimal val)
    {
        // Jika nilai null, kembalikan string "0"
        if (val == null) return "0";
        // Mengembalikan representasi string angka berformat ribuan
        return String.format(java.util.Locale.US, "%,d", val.longValue()).replace(",", ".");
    }

    // =====================================================================
    // 6. Visualisasi Grafik Resmi JFreeChart (PK-UC010 Step 7)
    // =====================================================================
    // Method privat tambahkanGrafikVisualisasi untuk memilih jenis bagan yang sesuai dengan jenis laporan
    private void tambahkanGrafikVisualisasi(Document document, LaporanResponseDto dto)
    {
        // Mengambil jenis laporan dari metadata
        String jenis = dto.getMetadata().getJenisLaporan();
        // Jika jenis laporan finansial, tampilkan grafik finansial:
        if ("finansial".equalsIgnoreCase(jenis))
        {
            // Memanggil method pembuat grafik finansial
            tambahkanGrafikFinansial(document, dto.getTabelFinansial());
        }
        // Jika jenis laporan operasional, tampilkan grafik operasional:
        else if ("operasional".equalsIgnoreCase(jenis))
        {
            // Memanggil method pembuat grafik operasional
            tambahkanGrafikOperasional(document, dto.getTabelOperasional());
        }
        // Jika jenis laporan lingkungan, tampilkan grafik lingkungan:
        else if ("lingkungan".equalsIgnoreCase(jenis))
        {
            // Memanggil method pembuat grafik dampak lingkungan
            tambahkanGrafikLingkungan(document, dto.getTabelLingkungan());
        }
        // Jika jenis laporan komprehensif, tampilkan perbandingan grafik ganda:
        else if ("komprehensif".equalsIgnoreCase(jenis))
        {
            // Memanggil method pembuat grafik ganda komprehensif
            tambahkanGrafikKomprehensif(document, dto);
        }
    }

    // Method privat tambahkanGrafikFinansial untuk menyusun bagan batang visualisasi tren pendapatan
    private void tambahkanGrafikFinansial(Document document, List<BarisFinansialDto> rows)
    {
        // Jika data baris finansial kosong atau null, hentikan eksekusi
        if (rows == null || rows.isEmpty()) return;

        // Membuka blok penanganan exception saat pembuatan bagan:
        try
        {
            // Inisialisasi dataset kategori JFreeChart
            DefaultCategoryDataset dataset = new DefaultCategoryDataset();
            // Pemetaan pendapatan terurut berdasarkan tanggal
            Map<String, BigDecimal> harian = new TreeMap<>();
            // Looping baris transaksi finansial untuk mengumpulkan total harian:
            for (BarisFinansialDto r : rows)
            {
                // Ekstraksi 10 karakter pertama untuk string tanggal (YYYY-MM-DD)
                String tgl = (r.getWaktuMasuk() != null && r.getWaktuMasuk().length() >= 10)
                    ? r.getWaktuMasuk().substring(0, 10) : "Lainnya";
                // Mengambil nilai tarif transaksi
                BigDecimal tarif = r.getTotalTarif() != null ? r.getTotalTarif() : BigDecimal.ZERO;
                // Menjumlahkan ke dalam map harian
                harian.put(tgl, harian.getOrDefault(tgl, BigDecimal.ZERO).add(tarif));
            }

            // Deklarasi variabel judul grafik dan label sumbu domain
            String chartTitle;
            String domainAxisLabel;

            // Jika seluruh transaksi berada pada 1 tanggal yang sama, buat grafik distribusi per jam:
            if (harian.size() == 1)
            {
                // Mengambil string tanggal tunggal
                String tglSatu = harian.keySet().iterator().next();
                chartTitle = "DISTRIBUSI PENDAPATAN PARKIR PER JAM TRANSAKSI (" + formatTanggalPanjang(tglSatu) + ")";
                domainAxisLabel = "Waktu / Jam Masuk Kendaraan (WIB)";

                // Pemetaan pendapatan terurut per jam
                Map<String, BigDecimal> perJam = new TreeMap<>();
                // Mengelompokkan transaksi ke interval jam:
                for (BarisFinansialDto r : rows)
                {
                    String jam = "00:00 WIB";
                    if (r.getWaktuMasuk() != null && r.getWaktuMasuk().length() >= 13)
                    {
                        jam = r.getWaktuMasuk().substring(11, 13) + ":00 WIB";
                    }
                    BigDecimal tarif = r.getTotalTarif() != null ? r.getTotalTarif() : BigDecimal.ZERO;
                    perJam.put(jam, perJam.getOrDefault(jam, BigDecimal.ZERO).add(tarif));
                }

                // Memasukkan data per jam ke dataset bagan:
                for (Map.Entry<String, BigDecimal> entry : perJam.entrySet())
                {
                    dataset.addValue(entry.getValue().doubleValue(), "Pendapatan", entry.getKey());
                }
            }
            else // Jika transaksi tersebar di banyak tanggal, buat tren harian:
            {
                chartTitle = "TREN PENDAPATAN HARIAN TRANSAKSI PARKIR (RP)";
                domainAxisLabel = "Tanggal Transaksi";

                // Memasukkan data harian ke dataset bagan:
                for (Map.Entry<String, BigDecimal> entry : harian.entrySet())
                {
                    dataset.addValue(entry.getValue().doubleValue(), "Pendapatan", formatTanggalLabel(entry.getKey()));
                }
            }

            // Membuat diagram batang menggunakan ChartFactory
            JFreeChart chart = ChartFactory.createBarChart(
                chartTitle,
                domainAxisLabel,
                "Total Pendapatan (Rp)",
                dataset,
                PlotOrientation.VERTICAL,
                false, true, false
            );

            // Menerapkan styling warna emerald green pada batang bagan
            formatChart(chart, new java.awt.Color(16, 185, 129), "Rp ", null);
            // Menyematkan gambar grafik ke dalam dokumen PDF
            sematkanChartKeDokumen(document, chart, 720, 155);
        }
        // Menangkap exception jika proses render bagan mengalami kendala:
        catch (Exception e)
        {
            // Mencatat pesan peringatan kegagalan render grafik
            System.err.println("[CHART WARNING] Gagal merender grafik finansial: " + e.getMessage());
        }
    }

    // Method privat tambahkanGrafikOperasional untuk menyusun diagram batang distribusi tingkat keparahan anomali
    private void tambahkanGrafikOperasional(Document document, List<BarisOperasionalDto> rows)
    {
        // Jika data baris operasional kosong atau null, hentikan eksekusi
        if (rows == null || rows.isEmpty()) return;

        // Membuka blok penanganan exception:
        try
        {
            // Inisialisasi dataset kategori JFreeChart
            DefaultCategoryDataset dataset = new DefaultCategoryDataset();
            // Pemetaan penghitung jumlah kemunculan tingkat keparahan
            Map<String, Integer> counts = new HashMap<>();
            counts.put("INFO", 0);
            counts.put("WARNING", 0);
            counts.put("CRITICAL", 0);

            // Menghitung kemunculan tiap tingkat severity:
            for (BarisOperasionalDto r : rows)
            {
                String sev = r.getTingkatKeparahan() != null ? r.getTingkatKeparahan().toUpperCase() : "INFO";
                counts.put(sev, counts.getOrDefault(sev, 0) + 1);
            }

            // Memasukkan hasil hitungan ke dataset bagan
            dataset.addValue(counts.get("INFO"), "Jumlah", "INFO (Normal)");
            dataset.addValue(counts.get("WARNING"), "Jumlah", "WARNING (Waspada)");
            dataset.addValue(counts.get("CRITICAL"), "Jumlah", "CRITICAL (Anomali)");

            // Membuat diagram batang distribusi severity log IoT
            JFreeChart chart = ChartFactory.createBarChart(
                "DISTRIBUSI TINGKAT KEPARAHAN LOG & ANOMALI SENSOR IoT",
                "Tingkat Keparahan Kejadian",
                "Jumlah Log",
                dataset,
                PlotOrientation.VERTICAL,
                false, true, false
            );

            // Memformat styling diagram operasional
            formatChartOperasional(chart);
            // Menyematkan bagan operasional ke dokumen PDF
            sematkanChartKeDokumen(document, chart, 720, 150);
        }
        // Menangkap exception kegagalan render grafik:
        catch (Exception e)
        {
            // Mencatat pesan peringatan
            System.err.println("[CHART WARNING] Gagal merender grafik operasional: " + e.getMessage());
        }
    }

    // Method privat tambahkanGrafikLingkungan untuk menyusun bagan batang komparasi waktu tempuh riil vs normal
    private void tambahkanGrafikLingkungan(Document document, List<BarisLingkunganDto> rows)
    {
        // Jika data baris lingkungan kosong atau null, hentikan eksekusi
        if (rows == null || rows.isEmpty()) return;

        // Membuka blok penanganan exception:
        try
        {
            // Inisialisasi dataset kategori JFreeChart
            DefaultCategoryDataset dataset = new DefaultCategoryDataset();
            // Membatasi sampel kendaraan maksimal 8 kendaraan agar grafik tetap proporsional
            int limit = Math.min(rows.size(), 8);
            // Looping sampel data kendaraan ramah lingkungan:
            for (int i = 0; i < limit; i++)
            {
                BarisLingkunganDto r = rows.get(i);
                String label = r.getPlatNomor() != null ? r.getPlatNomor() : ("Slot " + r.getIdSlot());
                dataset.addValue(r.getDurasiTempuhDetik(), "Durasi Riil (SPCT IoT)", label);
                dataset.addValue(r.getWaktuNormalDetik(), "Standar Normal (Tanpa Navigasi)", label);
            }

            // Membuat diagram batang komparasi efisiensi waktu tempuh
            JFreeChart chart = ChartFactory.createBarChart(
                "KOMPARASI EFISIENSI WAKTU TEMPUH MENUJU SLOT (DETIK)",
                "Kendaraan & Slot Parkir",
                "Waktu Tempuh (Detik)",
                dataset,
                PlotOrientation.VERTICAL,
                true, true, false
            );

            // Memformat styling diagram dampak lingkungan
            formatChartLingkungan(chart);
            // Menyematkan gambar bagan ke dokumen PDF
            sematkanChartKeDokumen(document, chart, 720, 155);
        }
        // Menangkap exception kegagalan render grafik:
        catch (Exception e)
        {
            // Mencatat pesan peringatan
            System.err.println("[CHART WARNING] Gagal merender grafik lingkungan: " + e.getMessage());
        }
    }

    // Method privat tambahkanGrafikKomprehensif untuk merender dua bagan mini sejajar pada mode komprehensif
    private void tambahkanGrafikKomprehensif(Document document, LaporanResponseDto dto)
    {
        // Membuka blok penanganan exception:
        try
        {
            // Membuat bagan mini tren finansial
            JFreeChart chart1 = buatGrafikFinansialMini(dto.getTabelFinansial());
            // Membuat bagan mini distribusi operasional
            JFreeChart chart2 = buatGrafikOperasionalMini(dto.getTabelOperasional());

            // Jika kedua grafik tidak berhasil dibuat, hentikan eksekusi
            if (chart1 == null && chart2 == null) return;

            // Membuat tabel grid 2 kolom untuk menampung kedua grafik bersisian
            PdfPTable grid = new PdfPTable(2);
            grid.setWidthPercentage(100);
            grid.setSpacingBefore(6);
            grid.setSpacingAfter(8);

            // Jika grafik finansial tersedia, sematkan ke kolom kiri:
            if (chart1 != null)
            {
                com.lowagie.text.Image img1 = konversiChartKeImage(chart1, 360, 140);
                PdfPCell c1 = new PdfPCell(img1, true);
                c1.setBorder(Rectangle.NO_BORDER);
                c1.setPadding(3);
                grid.addCell(c1);
            }
            else // Jika tidak ada grafik finansial:
            {
                PdfPCell c1 = new PdfPCell();
                c1.setBorder(Rectangle.NO_BORDER);
                grid.addCell(c1);
            }

            // Jika grafik operasional tersedia, sematkan ke kolom kanan:
            if (chart2 != null)
            {
                com.lowagie.text.Image img2 = konversiChartKeImage(chart2, 360, 140);
                PdfPCell c2 = new PdfPCell(img2, true);
                c2.setBorder(Rectangle.NO_BORDER);
                c2.setPadding(3);
                grid.addCell(c2);
            }
            else // Jika tidak ada grafik operasional:
            {
                PdfPCell c2 = new PdfPCell();
                c2.setBorder(Rectangle.NO_BORDER);
                grid.addCell(c2);
            }

            // Menambahkan grid dua grafik ke dokumen PDF
            document.add(grid);
        }
        // Menangkap exception kegagalan render grafik komprehensif:
        catch (Exception e)
        {
            // Mencatat pesan peringatan
            System.err.println("[CHART WARNING] Gagal merender grafik komprehensif: " + e.getMessage());
        }
    }

    // Method privat buatGrafikFinansialMini untuk menghasilkan objek JFreeChart finansial ringkas
    private JFreeChart buatGrafikFinansialMini(List<BarisFinansialDto> rows)
    {
        // Jika data baris finansial kosong atau null, kembalikan null
        if (rows == null || rows.isEmpty()) return null;

        // Pemetaan total pendapatan harian
        Map<String, BigDecimal> harian = new TreeMap<>();
        for (BarisFinansialDto r : rows)
        {
            String tgl = (r.getWaktuMasuk() != null && r.getWaktuMasuk().length() >= 10)
                ? r.getWaktuMasuk().substring(0, 10) : "Lainnya";
            BigDecimal tarif = r.getTotalTarif() != null ? r.getTotalTarif() : BigDecimal.ZERO;
            harian.put(tgl, harian.getOrDefault(tgl, BigDecimal.ZERO).add(tarif));
        }

        // Inisialisasi dataset kategori
        DefaultCategoryDataset dataset = new DefaultCategoryDataset();
        String title;
        String xLabel;

        // Jika transaksi hanya pada 1 tanggal, kelompokkan per jam:
        if (harian.size() == 1)
        {
            String tglSatu = harian.keySet().iterator().next();
            title = "DISTRIBUSI PENDAPATAN PER JAM (" + formatTanggalLabel(tglSatu) + ")";
            xLabel = "Jam (WIB)";

            Map<String, BigDecimal> perJam = new TreeMap<>();
            for (BarisFinansialDto r : rows)
            {
                String jam = "00:00";
                if (r.getWaktuMasuk() != null && r.getWaktuMasuk().length() >= 13)
                {
                    jam = r.getWaktuMasuk().substring(11, 13) + ":00";
                }
                BigDecimal tarif = r.getTotalTarif() != null ? r.getTotalTarif() : BigDecimal.ZERO;
                perJam.put(jam, perJam.getOrDefault(jam, BigDecimal.ZERO).add(tarif));
            }

            for (Map.Entry<String, BigDecimal> entry : perJam.entrySet())
            {
                dataset.addValue(entry.getValue().doubleValue(), "Rp", entry.getKey());
            }
        }
        else // Jika tersebar di beberapa tanggal:
        {
            title = "TREN PENDAPATAN HARIAN";
            xLabel = "Tanggal";
            for (Map.Entry<String, BigDecimal> entry : harian.entrySet())
            {
                dataset.addValue(entry.getValue().doubleValue(), "Rp", formatTanggalLabel(entry.getKey()));
            }
        }

        // Membuat objek bagan mini
        JFreeChart chart = ChartFactory.createBarChart(
            title, xLabel, "Total (Rp)", dataset, PlotOrientation.VERTICAL, false, true, false);
        // Memformat bagan mini
        formatChart(chart, new java.awt.Color(16, 185, 129), "Rp ", null);
        // Mengembalikan objek bagan finansial mini
        return chart;
    }

    // Method privat buatGrafikOperasionalMini untuk menghasilkan objek JFreeChart log keparahan mini
    private JFreeChart buatGrafikOperasionalMini(List<BarisOperasionalDto> rows)
    {
        // Jika data baris operasional kosong atau null, kembalikan null
        if (rows == null || rows.isEmpty()) return null;
        // Inisialisasi dataset
        DefaultCategoryDataset dataset = new DefaultCategoryDataset();
        Map<String, Integer> counts = new HashMap<>();
        counts.put("INFO", 0);
        counts.put("WARNING", 0);
        counts.put("CRITICAL", 0);
        for (BarisOperasionalDto r : rows)
        {
            String sev = r.getTingkatKeparahan() != null ? r.getTingkatKeparahan().toUpperCase() : "INFO";
            counts.put(sev, counts.getOrDefault(sev, 0) + 1);
        }
        dataset.addValue(counts.get("INFO"), "Jumlah", "INFO");
        dataset.addValue(counts.get("WARNING"), "Jumlah", "WARN");
        dataset.addValue(counts.get("CRITICAL"), "Jumlah", "CRIT");

        // Membuat objek bagan mini operasional
        JFreeChart chart = ChartFactory.createBarChart(
            "SEVERITY LOG ANOMALI IoT", "Tingkat", "Jumlah", dataset, PlotOrientation.VERTICAL, false, true, false);
        // Memformat bagan operasional
        formatChartOperasional(chart);
        // Mengembalikan objek bagan operasional mini
        return chart;
    }

    // Method privat formatChart untuk menerapkan styling umum visual diagram batang JFreeChart
    private void formatChart(JFreeChart chart, java.awt.Color barColor, String valuePrefix, String valueSuffix)
    {
        // Mengatur latar belakang bagan berwarna putih bersih
        chart.setBackgroundPaint(java.awt.Color.WHITE);
        chart.setPadding(new org.jfree.chart.ui.RectangleInsets(6, 6, 6, 6));

        // Jika judul bagan ada, atur font dan warna judul:
        if (chart.getTitle() != null)
        {
            chart.getTitle().setFont(new java.awt.Font("SansSerif", java.awt.Font.BOLD, 9));
            chart.getTitle().setPaint(COLOR_PRIMARY);
            chart.getTitle().setPadding(new org.jfree.chart.ui.RectangleInsets(0, 0, 6, 0));
        }

        // Jika plot adalah instansi CategoryPlot, terapkan konfigurasi kisi dan batang:
        if (chart.getPlot() instanceof CategoryPlot)
        {
            CategoryPlot plot = chart.getCategoryPlot();
            plot.setBackgroundPaint(COLOR_ZEBRA_BG);
            plot.setDomainGridlinePaint(COLOR_BORDER);
            plot.setRangeGridlinePaint(COLOR_BORDER);
            plot.setDomainGridlinesVisible(true);
            plot.setRangeGridlinesVisible(true);
            plot.setOutlineVisible(false);

            // Jika perender adalah instansi BarRenderer, atur proporsi dan label batang:
            if (plot.getRenderer() instanceof BarRenderer)
            {
                BarRenderer renderer = (BarRenderer) plot.getRenderer();
                renderer.setBarPainter(new StandardBarPainter());
                renderer.setMaximumBarWidth(0.08);
                renderer.setItemMargin(0.06);
                renderer.setSeriesPaint(0, barColor);
                renderer.setShadowVisible(false);
                renderer.setDrawBarOutline(false);

                renderer.setDefaultItemLabelsVisible(true);
                renderer.setDefaultItemLabelFont(new java.awt.Font("SansSerif", java.awt.Font.BOLD, 8));
                renderer.setDefaultItemLabelPaint(new java.awt.Color(30, 41, 59));

                java.text.DecimalFormat df = new java.text.DecimalFormat("#,##0");
                String labelFormat = (valuePrefix != null ? valuePrefix : "") + "{2}" + (valueSuffix != null ? valueSuffix : "");
                renderer.setDefaultItemLabelGenerator(new StandardCategoryItemLabelGenerator(labelFormat, df));
                renderer.setDefaultPositiveItemLabelPosition(new ItemLabelPosition(
                    ItemLabelAnchor.OUTSIDE12,
                    TextAnchor.BOTTOM_CENTER
                ));
            }

            // Jika sumbu domain (horizontal) tersedia, atur font dan warna:
            if (plot.getDomainAxis() != null)
            {
                plot.getDomainAxis().setTickLabelFont(new java.awt.Font("SansSerif", java.awt.Font.BOLD, 8));
                plot.getDomainAxis().setTickLabelPaint(new java.awt.Color(71, 85, 105));
                plot.getDomainAxis().setLabelFont(new java.awt.Font("SansSerif", java.awt.Font.BOLD, 8));
                plot.getDomainAxis().setLabelPaint(COLOR_PRIMARY);
                plot.getDomainAxis().setCategoryMargin(0.12);
            }

            // Jika sumbu range (vertikal) tersedia, atur font dan margin atas:
            if (plot.getRangeAxis() != null)
            {
                plot.getRangeAxis().setTickLabelFont(new java.awt.Font("SansSerif", java.awt.Font.PLAIN, 7));
                plot.getRangeAxis().setTickLabelPaint(new java.awt.Color(100, 116, 139));
                plot.getRangeAxis().setLabelFont(new java.awt.Font("SansSerif", java.awt.Font.BOLD, 8));
                plot.getRangeAxis().setLabelPaint(COLOR_PRIMARY);
                plot.getRangeAxis().setUpperMargin(0.20);
            }
        }
    }

    // Method privat formatChartOperasional untuk mengatur pewarnaan batang dinamis berdasarkan level severity
    private void formatChartOperasional(JFreeChart chart)
    {
        // Mengatur latar belakang bagan berwarna putih bersih
        chart.setBackgroundPaint(java.awt.Color.WHITE);
        chart.setPadding(new org.jfree.chart.ui.RectangleInsets(6, 6, 6, 6));

        // Jika judul bagan ada, atur font dan warna judul:
        if (chart.getTitle() != null)
        {
            chart.getTitle().setFont(new java.awt.Font("SansSerif", java.awt.Font.BOLD, 9));
            chart.getTitle().setPaint(COLOR_PRIMARY);
            chart.getTitle().setPadding(new org.jfree.chart.ui.RectangleInsets(0, 0, 6, 0));
        }

        // Jika plot adalah instansi CategoryPlot, atur pewarna batang khusus:
        if (chart.getPlot() instanceof CategoryPlot)
        {
            CategoryPlot plot = chart.getCategoryPlot();
            plot.setBackgroundPaint(COLOR_ZEBRA_BG);
            plot.setDomainGridlinePaint(COLOR_BORDER);
            plot.setRangeGridlinePaint(COLOR_BORDER);
            plot.setDomainGridlinesVisible(true);
            plot.setRangeGridlinesVisible(true);
            plot.setOutlineVisible(false);

            // Membuat perender batang kustom dengan warna dinamis sesuai kategori keparahan
            BarRenderer renderer = new BarRenderer() {
                @Override // Menimpa method getItemPaint untuk menetapkan warna spesifik tiap batang
                public java.awt.Paint getItemPaint(int row, int column) {
                    if (column == 0) return new java.awt.Color(16, 185, 129); // INFO: Emerald Green
                    if (column == 1) return new java.awt.Color(245, 158, 11); // WARNING: Amber
                    if (column == 2) return new java.awt.Color(239, 68, 68);  // CRITICAL: Crimson Red
                    return super.getItemPaint(row, column);
                }
            };

            renderer.setBarPainter(new StandardBarPainter());
            renderer.setMaximumBarWidth(0.08);
            renderer.setItemMargin(0.08);
            renderer.setShadowVisible(false);
            renderer.setDrawBarOutline(false);

            renderer.setDefaultItemLabelsVisible(true);
            renderer.setDefaultItemLabelFont(new java.awt.Font("SansSerif", java.awt.Font.BOLD, 8));
            renderer.setDefaultItemLabelPaint(new java.awt.Color(30, 41, 59));
            renderer.setDefaultItemLabelGenerator(new StandardCategoryItemLabelGenerator("{2} Log", new java.text.DecimalFormat("#,##0")));
            renderer.setDefaultPositiveItemLabelPosition(new ItemLabelPosition(ItemLabelAnchor.OUTSIDE12, TextAnchor.BOTTOM_CENTER));

            plot.setRenderer(renderer);

            if (plot.getDomainAxis() != null)
            {
                plot.getDomainAxis().setTickLabelFont(new java.awt.Font("SansSerif", java.awt.Font.BOLD, 8));
                plot.getDomainAxis().setTickLabelPaint(new java.awt.Color(71, 85, 105));
                plot.getDomainAxis().setLabelFont(new java.awt.Font("SansSerif", java.awt.Font.BOLD, 8));
                plot.getDomainAxis().setLabelPaint(COLOR_PRIMARY);
            }

            if (plot.getRangeAxis() != null)
            {
                plot.getRangeAxis().setTickLabelFont(new java.awt.Font("SansSerif", java.awt.Font.PLAIN, 7));
                plot.getRangeAxis().setTickLabelPaint(new java.awt.Color(100, 116, 139));
                plot.getRangeAxis().setLabelFont(new java.awt.Font("SansSerif", java.awt.Font.BOLD, 8));
                plot.getRangeAxis().setLabelPaint(COLOR_PRIMARY);
                plot.getRangeAxis().setUpperMargin(0.20);
                plot.getRangeAxis().setStandardTickUnits(org.jfree.chart.axis.NumberAxis.createIntegerTickUnits());
            }
        }
    }

    // Method privat formatChartLingkungan untuk mengatur gaya visual bagan komparasi dampak lingkungan
    private void formatChartLingkungan(JFreeChart chart)
    {
        // Mengatur latar belakang bagan berwarna putih bersih
        chart.setBackgroundPaint(java.awt.Color.WHITE);
        chart.setPadding(new org.jfree.chart.ui.RectangleInsets(6, 6, 6, 6));

        // Jika judul bagan ada, atur font dan warna:
        if (chart.getTitle() != null)
        {
            chart.getTitle().setFont(new java.awt.Font("SansSerif", java.awt.Font.BOLD, 9));
            chart.getTitle().setPaint(COLOR_PRIMARY);
            chart.getTitle().setPadding(new org.jfree.chart.ui.RectangleInsets(0, 0, 6, 0));
        }

        // Jika legenda bagan tersedia, atur font dan hilangkan border legenda:
        if (chart.getLegend() != null)
        {
            chart.getLegend().setItemFont(new java.awt.Font("SansSerif", java.awt.Font.PLAIN, 8));
            chart.getLegend().setItemPaint(new java.awt.Color(51, 65, 85));
            chart.getLegend().setFrame(org.jfree.chart.block.BlockBorder.NONE);
        }

        // Jika plot adalah instansi CategoryPlot, atur konfigurasi renderer batang komparasi ganda:
        if (chart.getPlot() instanceof CategoryPlot)
        {
            CategoryPlot plot = chart.getCategoryPlot();
            plot.setBackgroundPaint(COLOR_ZEBRA_BG);
            plot.setDomainGridlinePaint(COLOR_BORDER);
            plot.setRangeGridlinePaint(COLOR_BORDER);
            plot.setDomainGridlinesVisible(true);
            plot.setRangeGridlinesVisible(true);
            plot.setOutlineVisible(false);

            if (plot.getRenderer() instanceof BarRenderer)
            {
                BarRenderer renderer = (BarRenderer) plot.getRenderer();
                renderer.setBarPainter(new StandardBarPainter());
                renderer.setMaximumBarWidth(0.04);
                renderer.setItemMargin(0.02);

                renderer.setSeriesPaint(0, new java.awt.Color(16, 185, 129)); // Durasi Riil: Emerald Green
                renderer.setSeriesPaint(1, new java.awt.Color(148, 163, 184)); // Standar Normal: Slate 400
                renderer.setShadowVisible(false);
                renderer.setDrawBarOutline(false);

                renderer.setDefaultItemLabelsVisible(true);
                renderer.setDefaultItemLabelFont(new java.awt.Font("SansSerif", java.awt.Font.BOLD, 7));
                renderer.setDefaultItemLabelPaint(new java.awt.Color(30, 41, 59));
                renderer.setDefaultItemLabelGenerator(new StandardCategoryItemLabelGenerator("{2} dtk", new java.text.DecimalFormat("#,##0")));
                renderer.setDefaultPositiveItemLabelPosition(new ItemLabelPosition(ItemLabelAnchor.OUTSIDE12, TextAnchor.BOTTOM_CENTER));
            }

            if (plot.getDomainAxis() != null)
            {
                plot.getDomainAxis().setTickLabelFont(new java.awt.Font("SansSerif", java.awt.Font.BOLD, 7));
                plot.getDomainAxis().setTickLabelPaint(new java.awt.Color(71, 85, 105));
                plot.getDomainAxis().setLabelFont(new java.awt.Font("SansSerif", java.awt.Font.BOLD, 8));
                plot.getDomainAxis().setLabelPaint(COLOR_PRIMARY);
            }

            if (plot.getRangeAxis() != null)
            {
                plot.getRangeAxis().setTickLabelFont(new java.awt.Font("SansSerif", java.awt.Font.PLAIN, 7));
                plot.getRangeAxis().setTickLabelPaint(new java.awt.Color(100, 116, 139));
                plot.getRangeAxis().setLabelFont(new java.awt.Font("SansSerif", java.awt.Font.BOLD, 8));
                plot.getRangeAxis().setLabelPaint(COLOR_PRIMARY);
                plot.getRangeAxis().setUpperMargin(0.20);
            }
        }
    }

    // Method privat formatTanggalLabel untuk memformat tanggal ringkas (misal: "15 Jan")
    private String formatTanggalLabel(String yyyyMmDd)
    {
        // Membuka blok penanganan exception parsing tanggal:
        try
        {
            java.time.LocalDate ld = java.time.LocalDate.parse(yyyyMmDd);
            // Mengembalikan format "dd MMM"
            return ld.format(DateTimeFormatter.ofPattern("dd MMM", new Locale("id", "ID")));
        }
        catch (Exception e)
        {
            // Jika parsing gagal, kembalikan nilai asal
            return yyyyMmDd;
        }
    }

    // Method privat formatTanggalPanjang untuk memformat tanggal lengkap (misal: "15 Januari 2026")
    private String formatTanggalPanjang(String yyyyMmDd)
    {
        // Membuka blok penanganan exception parsing tanggal:
        try
        {
            java.time.LocalDate ld = java.time.LocalDate.parse(yyyyMmDd);
            // Mengembalikan format "dd MMMM yyyy"
            return ld.format(DateTimeFormatter.ofPattern("dd MMMM yyyy", new Locale("id", "ID")));
        }
        catch (Exception e)
        {
            // Jika parsing gagal, kembalikan nilai asal
            return yyyyMmDd;
        }
    }

    // Method privat sematkanChartKeDokumen untuk menyisipkan elemen gambar grafik ke dalam dokumen PDF
    private void sematkanChartKeDokumen(Document document, JFreeChart chart, int width, int height) throws Exception
    {
        // Mengonversi objek chart ke image iText
        com.lowagie.text.Image img = konversiChartKeImage(chart, width, height);
        img.setAlignment(Element.ALIGN_CENTER);
        img.setSpacingBefore(6);
        img.setSpacingAfter(8);
        // Menambahkan gambar ke dokumen
        document.add(img);
    }

    // Method privat konversiChartKeImage untuk merender bagan JFreeChart menjadi objek Image iText dengan resolusi ganda
    private com.lowagie.text.Image konversiChartKeImage(JFreeChart chart, int width, int height) throws Exception
    {
        // Render grafik beresolusi ganda (2x super-sampling) agar tajam dan jernih saat dicetak ke PDF
        BufferedImage bi = chart.createBufferedImage(width * 2, height * 2, (double) width, (double) height, null);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(bi, "png", baos);
        com.lowagie.text.Image img = com.lowagie.text.Image.getInstance(baos.toByteArray());
        img.scaleToFit(width * 0.95f, height * 0.95f);
        // Mengembalikan objek gambar iText
        return img;
    }
}
