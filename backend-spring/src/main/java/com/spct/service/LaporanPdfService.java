package com.spct.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.spct.dto.LaporanResponseDto;
import com.spct.dto.LaporanResponseDto.*;
import org.jfree.chart.ChartFactory;
import org.jfree.chart.JFreeChart;
import org.jfree.chart.labels.ItemLabelAnchor;
import org.jfree.chart.labels.ItemLabelPosition;
import org.jfree.chart.labels.StandardCategoryItemLabelGenerator;
import org.jfree.chart.plot.PlotOrientation;
import org.jfree.chart.plot.CategoryPlot;
import org.jfree.chart.renderer.category.BarRenderer;
import org.jfree.chart.renderer.category.StandardBarPainter;
import org.jfree.chart.ui.TextAnchor;
import org.jfree.data.category.DefaultCategoryDataset;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TreeMap;

/**
 * Service: LaporanPdfService
 * Mengonversi data LaporanResponseDto menjadi dokumen resmi PDF ber-kop surat,
 * bergaris rapi, dengan kartu ringkasan KPI, tabel data, serta lembar pengesahan tanda tangan
 * sesuai spesifikasi PK-UC010 (Mengelola Laporan Operasional).
 */
@Service
public class LaporanPdfService
{
    // =====================================================================
    // Palet Warna & Tipografi Resmi (Clean Corporate & Eco-Friendly)
    // =====================================================================
    private static final java.awt.Color COLOR_PRIMARY = new java.awt.Color(15, 23, 42);      // Slate 900
    private static final java.awt.Color COLOR_HEADER_BG = new java.awt.Color(30, 41, 59);    // Slate 800
    private static final java.awt.Color COLOR_HEADER_TEXT = java.awt.Color.WHITE;
    private static final java.awt.Color COLOR_ZEBRA_BG = new java.awt.Color(248, 250, 252);  // Slate 50
    private static final java.awt.Color COLOR_BORDER = new java.awt.Color(203, 213, 225);    // Slate 300
    private static final java.awt.Color COLOR_ECO_GREEN = new java.awt.Color(22, 163, 74);   // Green 600
    private static final java.awt.Color COLOR_AMBER_BG = new java.awt.Color(254, 243, 199);  // Amber 100
    private static final java.awt.Color COLOR_AMBER_TEXT = new java.awt.Color(180, 83, 9);   // Amber 700

    private static final Font FONT_KOP_UTAMA = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, COLOR_PRIMARY);
    private static final Font FONT_KOP_SUB = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, COLOR_ECO_GREEN);
    private static final Font FONT_KOP_ALAMAT = FontFactory.getFont(FontFactory.HELVETICA, 8, java.awt.Color.DARK_GRAY);

    private static final Font FONT_JUDUL_LAPORAN = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, COLOR_PRIMARY);
    private static final Font FONT_META_LABEL = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, java.awt.Color.GRAY);
    private static final Font FONT_META_VAL = FontFactory.getFont(FontFactory.HELVETICA, 8, java.awt.Color.BLACK);

    private static final Font FONT_KPI_VAL = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, COLOR_PRIMARY);
    private static final Font FONT_KPI_LABEL = FontFactory.getFont(FontFactory.HELVETICA, 7.5f, java.awt.Color.GRAY);

    private static final Font FONT_TH = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, COLOR_HEADER_TEXT);
    private static final Font FONT_TD = FontFactory.getFont(FontFactory.HELVETICA, 7.5f, java.awt.Color.BLACK);
    private static final Font FONT_TD_BOLD = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 7.5f, java.awt.Color.BLACK);
    private static final Font FONT_TD_GREEN = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 7.5f, COLOR_ECO_GREEN);

    private static final Font FONT_FOOTER = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 7.5f, java.awt.Color.GRAY);
    private static final Font FONT_TTD = FontFactory.getFont(FontFactory.HELVETICA, 8, java.awt.Color.BLACK);
    private static final Font FONT_TTD_BOLD = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, java.awt.Color.BLACK);

    /**
     * Method Utama: Mengonversi LaporanResponseDto menjadi byte array PDF
     */
    public byte[] generatePdf(LaporanResponseDto dto)
    {
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        // Menggunakan A4 Landscape agar tabel data padat termuat rapi dan jelas
        Document document = new Document(PageSize.A4.rotate(), 36, 36, 36, 36);

        try
        {
            PdfWriter writer = PdfWriter.getInstance(document, out);
            writer.setPageEvent(new PdfPageEventHelper() {
                @Override
                public void onEndPage(PdfWriter writer, Document doc) {
                    PdfContentByte cb = writer.getDirectContent();
                    ColumnText.showTextAligned(cb, Element.ALIGN_RIGHT,
                        new Phrase(String.format("SPCT // Dokumen Resmi Halaman %d", writer.getPageNumber()), FONT_FOOTER),
                        doc.right(), doc.bottom() - 15, 0);
                }
            });

            document.open();

            // 1. Tambahkan Kop Surat Resmi
            tambahkanKopSurat(document);

            // 2. Tambahkan Judul & Metadata Laporan
            tambahkanMetadataLaporan(document, dto.getMetadata());

            // 3. Tambahkan Kotak KPI Ringkasan
            tambahkanKartuRingkasan(document, dto.getRingkasan());

            // 4. Tambahkan Visualisasi Grafik Resmi (JFreeChart - PK-UC010 Step 7)
            tambahkanGrafikVisualisasi(document, dto);

            // 5. Tambahkan Tabel Data Historis Sesuai Jenis Laporan
            String jenis = dto.getMetadata().getJenisLaporan();
            if ("finansial".equalsIgnoreCase(jenis))
            {
                tambahkanTabelFinansial(document, dto.getTabelFinansial());
            }
            else if ("operasional".equalsIgnoreCase(jenis))
            {
                tambahkanTabelOperasional(document, dto.getTabelOperasional());
            }
            else if ("lingkungan".equalsIgnoreCase(jenis))
            {
                tambahkanTabelLingkungan(document, dto.getTabelLingkungan());
            }
            else // Komprehensif (Master)
            {
                tambahkanSectionKomprehensif(document, dto);
            }

            // 5. Tambahkan Catatan Hukum & Lembar Pengesahan
            tambahkanLembarPengesahan(document, dto.getMetadata());

            document.close();
        }
        catch (DocumentException e)
        {
            throw new RuntimeException("Gagal menghasilkan dokumen PDF laporan: " + e.getMessage(), e);
        }

        return out.toByteArray();
    }

    // =====================================================================
    // 1. Kop Surat Resmi SPCT & RS
    // =====================================================================
    private void tambahkanKopSurat(Document document) throws DocumentException
    {
        PdfPTable kop = new PdfPTable(1);
        kop.setWidthPercentage(100);

        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);

        Paragraph p1 = new Paragraph("SISTEM PARKIR CERDAS TERINTEGRASI IoT (SPCT)", FONT_KOP_UTAMA);
        p1.setAlignment(Element.ALIGN_CENTER);
        cell.addElement(p1);

        Paragraph p2 = new Paragraph("MANAJEMEN RUMAH SAKIT — FASILITAS BASEMENT RAMAH LINGKUNGAN", FONT_KOP_SUB);
        p2.setAlignment(Element.ALIGN_CENTER);
        p2.setSpacingBefore(2);
        cell.addElement(p2);

        Paragraph p3 = new Paragraph("Alamat: Gedung Medik Terpadu Lantai Basement 1 • Telp: (0274) 555-SPCT • Email: smartparking@hospital.id", FONT_KOP_ALAMAT);
        p3.setAlignment(Element.ALIGN_CENTER);
        p3.setSpacingBefore(2);
        p3.setSpacingAfter(6);
        cell.addElement(p3);

        kop.addCell(cell);
        document.add(kop);

        // Garis Pembatas Kop Surat Ganda (Garis tebal biru + garis tipis abu)
        PdfPTable divider = new PdfPTable(1);
        divider.setWidthPercentage(100);
        PdfPCell c1 = new PdfPCell();
        c1.setBackgroundColor(COLOR_PRIMARY);
        c1.setFixedHeight(2.0f);
        c1.setBorder(Rectangle.NO_BORDER);
        divider.addCell(c1);

        PdfPCell c2 = new PdfPCell();
        c2.setFixedHeight(1.0f);
        c2.setBorder(Rectangle.NO_BORDER);
        divider.addCell(c2);

        document.add(divider);
    }

    // =====================================================================
    // 2. Metadata Laporan & Banner Simulasi
    // =====================================================================
    private void tambahkanMetadataLaporan(Document document, MetadataLaporanDto meta) throws DocumentException
    {
        Paragraph judul = new Paragraph(meta.getJudulLaporan().toUpperCase(), FONT_JUDUL_LAPORAN);
        judul.setAlignment(Element.ALIGN_LEFT);
        judul.setSpacingBefore(8);
        judul.setSpacingAfter(4);
        document.add(judul);

        // Tabel Metadata 4 Kolom
        PdfPTable metaTable = new PdfPTable(4);
        metaTable.setWidthPercentage(100);
        metaTable.setWidths(new float[]{25, 25, 25, 25});
        metaTable.setSpacingAfter(8);

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        addMetaCell(metaTable, "Periode Laporan", meta.getTanggalMulai() + " s.d. " + meta.getTanggalAkhir());
        addMetaCell(metaTable, "Tanggal Cetak", meta.getWaktuGenerate().format(dtf) + " WIB");
        addMetaCell(metaTable, "Total Rekaman", meta.getTotalBaris() + " Baris Data");
        addMetaCell(metaTable, "Otoritas Penerbit", "Akun Manajemen RS (Admin)");

        document.add(metaTable);

        // Banner Mode Simulasi Jika Data Finansial
        if (meta.isModeSimulasi())
        {
            PdfPTable banner = new PdfPTable(1);
            banner.setWidthPercentage(100);
            banner.setSpacingAfter(8);

            PdfPCell cell = new PdfPCell(new Phrase(
                "[MODE SIMULASI PEMBAYARAN]: Gateway e-Toll/QRIS saat ini berjalan secara simulasi dari kiosk keluar. Nilai biaya telah diselaraskan dengan SK Tarif Parkir RS.",
                FontFactory.getFont(FontFactory.HELVETICA_BOLD, 7.5f, COLOR_AMBER_TEXT)));
            cell.setBackgroundColor(COLOR_AMBER_BG);
            cell.setBorderColor(new java.awt.Color(245, 158, 11));
            cell.setPadding(5);
            banner.addCell(cell);
            document.add(banner);
        }
    }

    private void addMetaCell(PdfPTable table, String label, String value)
    {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.NO_BORDER);
        cell.addElement(new Paragraph(label, FONT_META_LABEL));
        cell.addElement(new Paragraph(value, FONT_META_VAL));
        table.addCell(cell);
    }

    // =====================================================================
    // 3. Kotak Ringkasan KPI Eksekutif
    // =====================================================================
    private void tambahkanKartuRingkasan(Document document, List<KartuKpiDto> ringkasan) throws DocumentException
    {
        if (ringkasan == null || ringkasan.isEmpty()) return;

        int numCards = ringkasan.size();
        PdfPTable kpiTable = new PdfPTable(numCards);
        kpiTable.setWidthPercentage(100);
        kpiTable.setSpacingAfter(10);

        for (KartuKpiDto kpi : ringkasan)
        {
            PdfPCell cell = new PdfPCell();
            cell.setBackgroundColor(COLOR_ZEBRA_BG);
            cell.setBorderColor(COLOR_BORDER);
            cell.setPadding(6);

            cell.addElement(new Paragraph(kpi.getLabel().toUpperCase(), FONT_KPI_LABEL));
            cell.addElement(new Paragraph(kpi.getNilai(), FONT_KPI_VAL));

            kpiTable.addCell(cell);
        }

        document.add(kpiTable);
    }

    // =====================================================================
    // 4A. Tabel Laporan Finansial
    // =====================================================================
    private void tambahkanTabelFinansial(Document document, List<BarisFinansialDto> rows) throws DocumentException
    {
        PdfPTable table = new PdfPTable(9);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{4, 12, 13, 8, 16, 16, 10, 11, 10});

        String[] headers = {"No", "No. Tiket", "Plat Nomor", "Jenis", "Waktu Masuk", "Waktu Keluar", "Durasi", "Total Biaya", "Kanal Bayar"};
        for (String h : headers) { addHeaderCell(table, h); }

        if (rows == null || rows.isEmpty())
        {
            addEmptyRow(table, 9, "Tidak ada transaksi pembayaran lunas pada periode ini.");
        }
        else
        {
            BigDecimal grandTotal = BigDecimal.ZERO;
            boolean alternate = false;
            for (BarisFinansialDto r : rows)
            {
                java.awt.Color bg = alternate ? COLOR_ZEBRA_BG : java.awt.Color.WHITE;
                alternate = !alternate;

                addCell(table, String.valueOf(r.getNo()), Element.ALIGN_CENTER, bg, FONT_TD);
                addCell(table, r.getNomorTiket(), Element.ALIGN_LEFT, bg, FONT_TD_BOLD);
                addCell(table, r.getPlatNomor(), Element.ALIGN_LEFT, bg, FONT_TD_BOLD);
                addCell(table, r.getJenisKendaraan(), Element.ALIGN_CENTER, bg, FONT_TD);
                addCell(table, r.getWaktuMasuk(), Element.ALIGN_CENTER, bg, FONT_TD);
                addCell(table, r.getWaktuKeluar(), Element.ALIGN_CENTER, bg, FONT_TD);
                addCell(table, r.getDurasiTeks(), Element.ALIGN_CENTER, bg, FONT_TD);
                addCell(table, "Rp " + Number(r.getTotalTarif()), Element.ALIGN_RIGHT, bg, FONT_TD_GREEN);
                addCell(table, r.getKanalPembayaran(), Element.ALIGN_CENTER, bg, FONT_TD);

                if (r.getTotalTarif() != null) grandTotal = grandTotal.add(r.getTotalTarif());
            }

            // Baris Total Akumulatif
            PdfPCell totalLabel = new PdfPCell(new Phrase("TOTAL PENDAPATAN REKAPITULASI", FONT_TD_BOLD));
            totalLabel.setColspan(7);
            totalLabel.setHorizontalAlignment(Element.ALIGN_RIGHT);
            totalLabel.setBackgroundColor(COLOR_ZEBRA_BG);
            totalLabel.setBorderColor(COLOR_BORDER);
            totalLabel.setPadding(5);
            table.addCell(totalLabel);

            PdfPCell totalVal = new PdfPCell(new Phrase("Rp " + Number(grandTotal), FONT_TD_GREEN));
            totalVal.setColspan(2);
            totalVal.setHorizontalAlignment(Element.ALIGN_RIGHT);
            totalVal.setBackgroundColor(COLOR_ZEBRA_BG);
            totalVal.setBorderColor(COLOR_BORDER);
            totalVal.setPadding(5);
            table.addCell(totalVal);
        }

        document.add(table);
    }

    // =====================================================================
    // 4B. Tabel Laporan Operasional & Okupansi
    // =====================================================================
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
    private void tambahkanTabelLingkungan(Document document, List<BarisLingkunganDto> rows) throws DocumentException
    {
        PdfPTable table = new PdfPTable(8);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{4, 14, 11, 16, 16, 13, 13, 13});

        String[] headers = {"No", "Plat Nomor", "Slot Tujuan", "Waktu Masuk", "Tiba di Slot", "Durasi Nyata", "Waktu Dihemat", "Reduksi CO2"};
        for (String h : headers) { addHeaderCell(table, h); }

        if (rows == null || rows.isEmpty())
        {
            addEmptyRow(table, 8, "Tidak ada data riwayat navigasi sensor pada periode ini.");
        }
        else
        {
            boolean alternate = false;
            double totalCo2Gram = 0.0;
            double totalMenitHemat = 0.0;

            for (BarisLingkunganDto r : rows)
            {
                java.awt.Color bg = alternate ? COLOR_ZEBRA_BG : java.awt.Color.WHITE;
                alternate = !alternate;

                addCell(table, String.valueOf(r.getNo()), Element.ALIGN_CENTER, bg, FONT_TD);
                addCell(table, r.getPlatNomor(), Element.ALIGN_LEFT, bg, FONT_TD_BOLD);
                addCell(table, r.getIdSlot(), Element.ALIGN_CENTER, bg, FONT_TD_BOLD);
                addCell(table, r.getWaktuMasuk(), Element.ALIGN_CENTER, bg, FONT_TD);
                addCell(table, r.getWaktuTiba(), Element.ALIGN_CENTER, bg, FONT_TD);
                addCell(table, r.getDurasiTempuhDetik() + " Detik", Element.ALIGN_RIGHT, bg, FONT_TD);
                addCell(table, r.getMenitDihemat() + " Menit", Element.ALIGN_RIGHT, bg, FONT_TD_BOLD);
                addCell(table, r.getReduksiCo2Gram() + " g", Element.ALIGN_RIGHT, bg, FONT_TD_GREEN);

                if (r.getReduksiCo2Gram() != null) totalCo2Gram += r.getReduksiCo2Gram();
                if (r.getMenitDihemat() != null) totalMenitHemat += r.getMenitDihemat();
            }

            // Baris Total Akumulatif
            PdfPCell totalLabel = new PdfPCell(new Phrase("TOTAL AKUMULASI PENGHEMATAN EMISI", FONT_TD_BOLD));
            totalLabel.setColspan(6);
            totalLabel.setHorizontalAlignment(Element.ALIGN_RIGHT);
            totalLabel.setBackgroundColor(COLOR_ZEBRA_BG);
            totalLabel.setBorderColor(COLOR_BORDER);
            totalLabel.setPadding(5);
            table.addCell(totalLabel);

            PdfPCell totalMenit = new PdfPCell(new Phrase(String.format("%.1f Menit", totalMenitHemat), FONT_TD_BOLD));
            totalMenit.setHorizontalAlignment(Element.ALIGN_RIGHT);
            totalMenit.setBackgroundColor(COLOR_ZEBRA_BG);
            totalMenit.setBorderColor(COLOR_BORDER);
            totalMenit.setPadding(5);
            table.addCell(totalMenit);

            PdfPCell totalVal = new PdfPCell(new Phrase(String.format("%.2f kg CO2", totalCo2Gram / 1000.0), FONT_TD_GREEN));
            totalVal.setHorizontalAlignment(Element.ALIGN_RIGHT);
            totalVal.setBackgroundColor(COLOR_ZEBRA_BG);
            totalVal.setBorderColor(COLOR_BORDER);
            totalVal.setPadding(5);
            table.addCell(totalVal);
        }

        document.add(table);
    }

    // =====================================================================
    // 4D. Section Laporan Komprehensif (3 Modul Sekaligus)
    // =====================================================================
    private void tambahkanSectionKomprehensif(Document document, LaporanResponseDto dto) throws DocumentException
    {
        // 1. Modul Finansial
        Paragraph sec1 = new Paragraph("1. MODUL REKAPITULASI FINANSIAL & TRANSAKSI", FONT_JUDUL_LAPORAN);
        sec1.setSpacingBefore(10);
        sec1.setSpacingAfter(4);
        document.add(sec1);
        tambahkanTabelFinansial(document, dto.getTabelFinansial());

        // 2. Modul Operasional
        Paragraph sec2 = new Paragraph("2. MODUL AUDIT OPERASIONAL & ANOMALI SENSOR IoT", FONT_JUDUL_LAPORAN);
        sec2.setSpacingBefore(12);
        sec2.setSpacingAfter(4);
        document.add(sec2);
        tambahkanTabelOperasional(document, dto.getTabelOperasional());

        // 3. Modul Lingkungan
        Paragraph sec3 = new Paragraph("3. MODUL DAMPAK LINGKUNGAN & ECO-METRIC", FONT_JUDUL_LAPORAN);
        sec3.setSpacingBefore(12);
        sec3.setSpacingAfter(4);
        document.add(sec3);
        tambahkanTabelLingkungan(document, dto.getTabelLingkungan());
    }

    // =====================================================================
    // 5. Lembar Pengesahan Tanda Tangan & Immutability Notice
    // =====================================================================
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

        // Tabel 2 Kolom Tanda Tangan
        PdfPTable ttd = new PdfPTable(2);
        ttd.setWidthPercentage(100);
        ttd.setKeepTogether(true);

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd MMMM yyyy");
        String tglHariIni = meta.getTanggalAkhir().format(dtf);

        PdfPCell cKiri = new PdfPCell();
        cKiri.setBorder(Rectangle.NO_BORDER);
        cKiri.addElement(new Paragraph("Mengetahui,", FONT_TTD));
        cKiri.addElement(new Paragraph("Petugas Pengawas Lapangan,", FONT_TTD_BOLD));
        cKiri.addElement(new Paragraph("\n\n\n")); // Ruang tanda tangan
        cKiri.addElement(new Paragraph("( ___________________________ )", FONT_TTD));
        cKiri.addElement(new Paragraph("NIP / ID Petugas Lapangan", FONT_TTD));
        ttd.addCell(cKiri);

        PdfPCell cKanan = new PdfPCell();
        cKanan.setBorder(Rectangle.NO_BORDER);
        cKanan.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cKanan.addElement(new Paragraph("Yogyakarta, " + tglHariIni, FONT_TTD));
        cKanan.addElement(new Paragraph("Manajer Operasional & Keuangan RS,", FONT_TTD_BOLD));
        cKanan.addElement(new Paragraph("\n\n\n")); // Ruang tanda tangan
        cKanan.addElement(new Paragraph("( ___________________________ )", FONT_TTD));
        cKanan.addElement(new Paragraph("NIP: 19850412.201001.1.002", FONT_TTD));
        ttd.addCell(cKanan);

        document.add(ttd);
    }

    // =====================================================================
    // Helper Tabel Cell Formatters
    // =====================================================================
    private void addHeaderCell(PdfPTable table, String text)
    {
        PdfPCell cell = new PdfPCell(new Phrase(text, FONT_TH));
        cell.setBackgroundColor(COLOR_HEADER_BG);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(4);
        cell.setBorderColor(COLOR_BORDER);
        table.addCell(cell);
    }

    private void addCell(PdfPTable table, String text, int align, java.awt.Color bg, Font font)
    {
        PdfPCell cell = new PdfPCell(new Phrase(text != null ? text : "-", font));
        cell.setHorizontalAlignment(align);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setBackgroundColor(bg);
        cell.setPadding(4);
        cell.setBorderColor(COLOR_BORDER);
        table.addCell(cell);
    }

    private void addEmptyRow(PdfPTable table, int colspan, String message)
    {
        PdfPCell cell = new PdfPCell(new Phrase(message, FONT_FOOTER));
        cell.setColspan(colspan);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(10);
        cell.setBorderColor(COLOR_BORDER);
        table.addCell(cell);
    }

    private String Number(BigDecimal val)
    {
        if (val == null) return "0";
        return String.format(java.util.Locale.US, "%,d", val.longValue()).replace(",", ".");
    }

    // =====================================================================
    // 6. Visualisasi Grafik Resmi JFreeChart (PK-UC010 Step 7)
    // =====================================================================
    private void tambahkanGrafikVisualisasi(Document document, LaporanResponseDto dto)
    {
        String jenis = dto.getMetadata().getJenisLaporan();
        if ("finansial".equalsIgnoreCase(jenis))
        {
            tambahkanGrafikFinansial(document, dto.getTabelFinansial());
        }
        else if ("operasional".equalsIgnoreCase(jenis))
        {
            tambahkanGrafikOperasional(document, dto.getTabelOperasional());
        }
        else if ("lingkungan".equalsIgnoreCase(jenis))
        {
            tambahkanGrafikLingkungan(document, dto.getTabelLingkungan());
        }
        else if ("komprehensif".equalsIgnoreCase(jenis))
        {
            tambahkanGrafikKomprehensif(document, dto);
        }
    }

    private void tambahkanGrafikFinansial(Document document, List<BarisFinansialDto> rows)
    {
        if (rows == null || rows.isEmpty()) return;

        try
        {
            DefaultCategoryDataset dataset = new DefaultCategoryDataset();
            Map<String, BigDecimal> harian = new TreeMap<>();
            for (BarisFinansialDto r : rows)
            {
                String tgl = (r.getWaktuMasuk() != null && r.getWaktuMasuk().length() >= 10)
                    ? r.getWaktuMasuk().substring(0, 10) : "Lainnya";
                BigDecimal tarif = r.getTotalTarif() != null ? r.getTotalTarif() : BigDecimal.ZERO;
                harian.put(tgl, harian.getOrDefault(tgl, BigDecimal.ZERO).add(tarif));
            }

            String chartTitle;
            String domainAxisLabel;

            if (harian.size() == 1)
            {
                // Jika semua transaksi berada pada 1 tanggal yang sama, tampilkan distribusi per jam transaksi
                String tglSatu = harian.keySet().iterator().next();
                chartTitle = "DISTRIBUSI PENDAPATAN PARKIR PER JAM TRANSAKSI (" + formatTanggalPanjang(tglSatu) + ")";
                domainAxisLabel = "Waktu / Jam Masuk Kendaraan (WIB)";

                Map<String, BigDecimal> perJam = new TreeMap<>();
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

                for (Map.Entry<String, BigDecimal> entry : perJam.entrySet())
                {
                    dataset.addValue(entry.getValue().doubleValue(), "Pendapatan", entry.getKey());
                }
            }
            else
            {
                // Transaksi tersebar pada beberapa tanggal, tampilkan tren harian
                chartTitle = "TREN PENDAPATAN HARIAN TRANSAKSI PARKIR (RP)";
                domainAxisLabel = "Tanggal Transaksi";

                for (Map.Entry<String, BigDecimal> entry : harian.entrySet())
                {
                    dataset.addValue(entry.getValue().doubleValue(), "Pendapatan", formatTanggalLabel(entry.getKey()));
                }
            }

            JFreeChart chart = ChartFactory.createBarChart(
                chartTitle,
                domainAxisLabel,
                "Total Pendapatan (Rp)",
                dataset,
                PlotOrientation.VERTICAL,
                false, true, false
            );

            formatChart(chart, new java.awt.Color(16, 185, 129), "Rp ", null);
            sematkanChartKeDokumen(document, chart, 720, 155);
        }
        catch (Exception e)
        {
            System.err.println("[CHART WARNING] Gagal merender grafik finansial: " + e.getMessage());
        }
    }

    private void tambahkanGrafikOperasional(Document document, List<BarisOperasionalDto> rows)
    {
        if (rows == null || rows.isEmpty()) return;

        try
        {
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

            dataset.addValue(counts.get("INFO"), "Jumlah", "INFO (Normal)");
            dataset.addValue(counts.get("WARNING"), "Jumlah", "WARNING (Waspada)");
            dataset.addValue(counts.get("CRITICAL"), "Jumlah", "CRITICAL (Anomali)");

            JFreeChart chart = ChartFactory.createBarChart(
                "DISTRIBUSI TINGKAT KEPARAHAN LOG & ANOMALI SENSOR IoT",
                "Tingkat Keparahan Kejadian",
                "Jumlah Log",
                dataset,
                PlotOrientation.VERTICAL,
                false, true, false
            );

            formatChartOperasional(chart);
            sematkanChartKeDokumen(document, chart, 720, 150);
        }
        catch (Exception e)
        {
            System.err.println("[CHART WARNING] Gagal merender grafik operasional: " + e.getMessage());
        }
    }

    private void tambahkanGrafikLingkungan(Document document, List<BarisLingkunganDto> rows)
    {
        if (rows == null || rows.isEmpty()) return;

        try
        {
            DefaultCategoryDataset dataset = new DefaultCategoryDataset();
            int limit = Math.min(rows.size(), 8);
            for (int i = 0; i < limit; i++)
            {
                BarisLingkunganDto r = rows.get(i);
                String label = r.getPlatNomor() != null ? r.getPlatNomor() : ("Slot " + r.getIdSlot());
                dataset.addValue(r.getDurasiTempuhDetik(), "Durasi Riil (SPCT IoT)", label);
                dataset.addValue(r.getWaktuNormalDetik(), "Standar Normal (Tanpa Navigasi)", label);
            }

            JFreeChart chart = ChartFactory.createBarChart(
                "KOMPARASI EFISIENSI WAKTU TEMPUH MENUJU SLOT (DETIK)",
                "Kendaraan & Slot Parkir",
                "Waktu Tempuh (Detik)",
                dataset,
                PlotOrientation.VERTICAL,
                true, true, false
            );

            formatChartLingkungan(chart);
            sematkanChartKeDokumen(document, chart, 720, 155);
        }
        catch (Exception e)
        {
            System.err.println("[CHART WARNING] Gagal merender grafik lingkungan: " + e.getMessage());
        }
    }

    private void tambahkanGrafikKomprehensif(Document document, LaporanResponseDto dto)
    {
        try
        {
            JFreeChart chart1 = buatGrafikFinansialMini(dto.getTabelFinansial());
            JFreeChart chart2 = buatGrafikOperasionalMini(dto.getTabelOperasional());

            if (chart1 == null && chart2 == null) return;

            PdfPTable grid = new PdfPTable(2);
            grid.setWidthPercentage(100);
            grid.setSpacingBefore(6);
            grid.setSpacingAfter(8);

            if (chart1 != null)
            {
                com.lowagie.text.Image img1 = konversiChartKeImage(chart1, 360, 140);
                PdfPCell c1 = new PdfPCell(img1, true);
                c1.setBorder(Rectangle.NO_BORDER);
                c1.setPadding(3);
                grid.addCell(c1);
            }
            else
            {
                PdfPCell c1 = new PdfPCell();
                c1.setBorder(Rectangle.NO_BORDER);
                grid.addCell(c1);
            }

            if (chart2 != null)
            {
                com.lowagie.text.Image img2 = konversiChartKeImage(chart2, 360, 140);
                PdfPCell c2 = new PdfPCell(img2, true);
                c2.setBorder(Rectangle.NO_BORDER);
                c2.setPadding(3);
                grid.addCell(c2);
            }
            else
            {
                PdfPCell c2 = new PdfPCell();
                c2.setBorder(Rectangle.NO_BORDER);
                grid.addCell(c2);
            }

            document.add(grid);
        }
        catch (Exception e)
        {
            System.err.println("[CHART WARNING] Gagal merender grafik komprehensif: " + e.getMessage());
        }
    }

    private JFreeChart buatGrafikFinansialMini(List<BarisFinansialDto> rows)
    {
        if (rows == null || rows.isEmpty()) return null;

        Map<String, BigDecimal> harian = new TreeMap<>();
        for (BarisFinansialDto r : rows)
        {
            String tgl = (r.getWaktuMasuk() != null && r.getWaktuMasuk().length() >= 10)
                ? r.getWaktuMasuk().substring(0, 10) : "Lainnya";
            BigDecimal tarif = r.getTotalTarif() != null ? r.getTotalTarif() : BigDecimal.ZERO;
            harian.put(tgl, harian.getOrDefault(tgl, BigDecimal.ZERO).add(tarif));
        }

        DefaultCategoryDataset dataset = new DefaultCategoryDataset();
        String title;
        String xLabel;

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
        else
        {
            title = "TREN PENDAPATAN HARIAN";
            xLabel = "Tanggal";
            for (Map.Entry<String, BigDecimal> entry : harian.entrySet())
            {
                dataset.addValue(entry.getValue().doubleValue(), "Rp", formatTanggalLabel(entry.getKey()));
            }
        }

        JFreeChart chart = ChartFactory.createBarChart(
            title, xLabel, "Total (Rp)", dataset, PlotOrientation.VERTICAL, false, true, false);
        formatChart(chart, new java.awt.Color(16, 185, 129), "Rp ", null);
        return chart;
    }

    private JFreeChart buatGrafikOperasionalMini(List<BarisOperasionalDto> rows)
    {
        if (rows == null || rows.isEmpty()) return null;
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

        JFreeChart chart = ChartFactory.createBarChart(
            "SEVERITY LOG ANOMALI IoT", "Tingkat", "Jumlah", dataset, PlotOrientation.VERTICAL, false, true, false);
        formatChartOperasional(chart);
        return chart;
    }

    private void formatChart(JFreeChart chart, java.awt.Color barColor, String valuePrefix, String valueSuffix)
    {
        chart.setBackgroundPaint(java.awt.Color.WHITE);
        chart.setPadding(new org.jfree.chart.ui.RectangleInsets(6, 6, 6, 6));

        if (chart.getTitle() != null)
        {
            chart.getTitle().setFont(new java.awt.Font("SansSerif", java.awt.Font.BOLD, 9));
            chart.getTitle().setPaint(COLOR_PRIMARY);
            chart.getTitle().setPadding(new org.jfree.chart.ui.RectangleInsets(0, 0, 6, 0));
        }

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

            if (plot.getDomainAxis() != null)
            {
                plot.getDomainAxis().setTickLabelFont(new java.awt.Font("SansSerif", java.awt.Font.BOLD, 8));
                plot.getDomainAxis().setTickLabelPaint(new java.awt.Color(71, 85, 105));
                plot.getDomainAxis().setLabelFont(new java.awt.Font("SansSerif", java.awt.Font.BOLD, 8));
                plot.getDomainAxis().setLabelPaint(COLOR_PRIMARY);
                plot.getDomainAxis().setCategoryMargin(0.12);
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

    private void formatChartOperasional(JFreeChart chart)
    {
        chart.setBackgroundPaint(java.awt.Color.WHITE);
        chart.setPadding(new org.jfree.chart.ui.RectangleInsets(6, 6, 6, 6));

        if (chart.getTitle() != null)
        {
            chart.getTitle().setFont(new java.awt.Font("SansSerif", java.awt.Font.BOLD, 9));
            chart.getTitle().setPaint(COLOR_PRIMARY);
            chart.getTitle().setPadding(new org.jfree.chart.ui.RectangleInsets(0, 0, 6, 0));
        }

        if (chart.getPlot() instanceof CategoryPlot)
        {
            CategoryPlot plot = chart.getCategoryPlot();
            plot.setBackgroundPaint(COLOR_ZEBRA_BG);
            plot.setDomainGridlinePaint(COLOR_BORDER);
            plot.setRangeGridlinePaint(COLOR_BORDER);
            plot.setDomainGridlinesVisible(true);
            plot.setRangeGridlinesVisible(true);
            plot.setOutlineVisible(false);

            BarRenderer renderer = new BarRenderer() {
                @Override
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

    private void formatChartLingkungan(JFreeChart chart)
    {
        chart.setBackgroundPaint(java.awt.Color.WHITE);
        chart.setPadding(new org.jfree.chart.ui.RectangleInsets(6, 6, 6, 6));

        if (chart.getTitle() != null)
        {
            chart.getTitle().setFont(new java.awt.Font("SansSerif", java.awt.Font.BOLD, 9));
            chart.getTitle().setPaint(COLOR_PRIMARY);
            chart.getTitle().setPadding(new org.jfree.chart.ui.RectangleInsets(0, 0, 6, 0));
        }

        if (chart.getLegend() != null)
        {
            chart.getLegend().setItemFont(new java.awt.Font("SansSerif", java.awt.Font.PLAIN, 8));
            chart.getLegend().setItemPaint(new java.awt.Color(51, 65, 85));
            chart.getLegend().setFrame(org.jfree.chart.block.BlockBorder.NONE);
        }

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

                renderer.setSeriesPaint(0, new java.awt.Color(16, 185, 129)); // Durasi Riil: Emerald
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

    private String formatTanggalLabel(String yyyyMmDd)
    {
        try
        {
            java.time.LocalDate ld = java.time.LocalDate.parse(yyyyMmDd);
            return ld.format(DateTimeFormatter.ofPattern("dd MMM", new Locale("id", "ID")));
        }
        catch (Exception e)
        {
            return yyyyMmDd;
        }
    }

    private String formatTanggalPanjang(String yyyyMmDd)
    {
        try
        {
            java.time.LocalDate ld = java.time.LocalDate.parse(yyyyMmDd);
            return ld.format(DateTimeFormatter.ofPattern("dd MMMM yyyy", new Locale("id", "ID")));
        }
        catch (Exception e)
        {
            return yyyyMmDd;
        }
    }

    private void sematkanChartKeDokumen(Document document, JFreeChart chart, int width, int height) throws Exception
    {
        com.lowagie.text.Image img = konversiChartKeImage(chart, width, height);
        img.setAlignment(Element.ALIGN_CENTER);
        img.setSpacingBefore(6);
        img.setSpacingAfter(8);
        document.add(img);
    }

    private com.lowagie.text.Image konversiChartKeImage(JFreeChart chart, int width, int height) throws Exception
    {
        // Render grafik beresolusi ganda (2x super-sampling) agar tajam dan jernih saat dicetak ke PDF
        BufferedImage bi = chart.createBufferedImage(width * 2, height * 2, (double) width, (double) height, null);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(bi, "png", baos);
        com.lowagie.text.Image img = com.lowagie.text.Image.getInstance(baos.toByteArray());
        img.scaleToFit(width * 0.95f, height * 0.95f);
        return img;
    }
}
