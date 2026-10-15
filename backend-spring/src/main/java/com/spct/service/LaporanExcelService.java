package com.spct.service;

import com.spct.dto.LaporanResponseDto;
import com.spct.dto.LaporanResponseDto.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.DefaultIndexedColorMap;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

/**
 * Service: LaporanExcelService
 * Menghasilkan buku kerja spreadsheet resmi Excel (.xlsx) menggunakan Apache POI.
 * Menyediakan sheet ringkasan eksekutif dan sheet tabel data historis berformat profesional,
 * dilengkapi kop surat RS, format mata uang, freeze pane, serta lembar pengesahan (PK-UC010).
 */
@Service
public class LaporanExcelService
{
    // =====================================================================
    // Warna Resmi SPCT & Eco-Friendly (Custom XSSFColor)
    // =====================================================================
    private static final byte[] RGB_NAVY_HEADER = new byte[]{(byte) 30, (byte) 41, (byte) 59};      // Slate 800
    private static final byte[] RGB_ZEBRA_ROW   = new byte[]{(byte) 248, (byte) 250, (byte) 252};   // Slate 50
    private static final byte[] RGB_TOTAL_ROW   = new byte[]{(byte) 226, (byte) 232, (byte) 240};   // Slate 200
    private static final byte[] RGB_CARD_BG     = new byte[]{(byte) 241, (byte) 245, (byte) 249};   // Slate 100
    private static final byte[] RGB_BORDER      = new byte[]{(byte) 203, (byte) 213, (byte) 225};   // Slate 300
    private static final byte[] RGB_ECO_GREEN   = new byte[]{(byte) 22, (byte) 163, (byte) 74};     // Green 600

    /**
     * Method Utama: Mengonversi LaporanResponseDto menjadi byte array XLSX
     */
    public byte[] generateExcel(LaporanResponseDto dto)
    {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream())
        {
            CellStyleRegistry styles = new CellStyleRegistry(workbook);

            String jenis = dto.getMetadata().getJenisLaporan();

            if ("komprehensif".equalsIgnoreCase(jenis))
            {
                // Sheet 1: Ringkasan Eksekutif Master
                buatSheetRingkasan(workbook, styles, dto, "Ringkasan Eksekutif");

                // Sheet 2: Finansial
                buatSheetFinansial(workbook, styles, dto.getTabelFinansial(), "1. Finansial");

                // Sheet 3: Operasional IoT
                buatSheetOperasional(workbook, styles, dto.getTabelOperasional(), "2. Operasional IoT");

                // Sheet 4: Lingkungan
                buatSheetLingkungan(workbook, styles, dto.getTabelLingkungan(), "3. Dampak Lingkungan");
            }
            else if ("finansial".equalsIgnoreCase(jenis))
            {
                buatSheetRingkasan(workbook, styles, dto, "Ringkasan Finansial");
                buatSheetFinansial(workbook, styles, dto.getTabelFinansial(), "Data Transaksi Finansial");
            }
            else if ("operasional".equalsIgnoreCase(jenis))
            {
                buatSheetRingkasan(workbook, styles, dto, "Ringkasan Operasional");
                buatSheetOperasional(workbook, styles, dto.getTabelOperasional(), "Data Log IoT & Kejadian");
            }
            else // Lingkungan
            {
                buatSheetRingkasan(workbook, styles, dto, "Ringkasan Lingkungan");
                buatSheetLingkungan(workbook, styles, dto.getTabelLingkungan(), "Data Metrik Emisi CO2");
            }

            workbook.write(out);
            return out.toByteArray();
        }
        catch (IOException e)
        {
            throw new RuntimeException("Gagal menghasilkan dokumen Excel laporan: " + e.getMessage(), e);
        }
    }

    // =====================================================================
    // 1. Pembuatan Sheet Ringkasan (Executive Summary Sheet)
    // =====================================================================
    private void buatSheetRingkasan(Workbook workbook, CellStyleRegistry styles, LaporanResponseDto dto, String namaSheet)
    {
        Sheet sheet = workbook.createSheet(namaSheet);
        sheet.setDisplayGridlines(true);

        int r = 0;

        // Baris 0-2: Kop Surat Resmi
        Row rowKop1 = sheet.createRow(r++);
        Cell cKop1 = rowKop1.createCell(0);
        cKop1.setCellValue("SISTEM PARKIR CERDAS TERINTEGRASI IoT (SPCT)");
        cKop1.setCellStyle(styles.titleFont);

        Row rowKop2 = sheet.createRow(r++);
        Cell cKop2 = rowKop2.createCell(0);
        cKop2.setCellValue("MANAJEMEN RUMAH SAKIT — FASILITAS BASEMENT RAMAH LINGKUNGAN");
        cKop2.setCellStyle(styles.subtitleGreenFont);

        Row rowKop3 = sheet.createRow(r++);
        Cell cKop3 = rowKop3.createCell(0);
        cKop3.setCellValue("Alamat: Gedung Medik Terpadu Lantai Basement 1 • Telp: (0274) 555-SPCT • Email: smartparking@hospital.id");
        cKop3.setCellStyle(styles.italicMutedFont);

        r++; // Spasi kosong

        // Baris Judul Laporan & Metadata
        Row rowJudul = sheet.createRow(r++);
        Cell cJudul = rowJudul.createCell(0);
        cJudul.setCellValue(dto.getMetadata().getJudulLaporan().toUpperCase());
        cJudul.setCellStyle(styles.sectionTitleFont);

        Row rMeta1 = sheet.createRow(r++);
        rMeta1.createCell(0).setCellValue("Kode Dokumen:");
        rMeta1.getCell(0).setCellStyle(styles.boldLabel);
        rMeta1.createCell(1).setCellValue("SPCT-DOC/" + dto.getMetadata().getJenisLaporan().toUpperCase() + "/" + dto.getMetadata().getTanggalAkhir());
        rMeta1.getCell(1).setCellStyle(styles.normalText);

        rMeta1.createCell(3).setCellValue("Periode Laporan:");
        rMeta1.getCell(3).setCellStyle(styles.boldLabel);
        rMeta1.createCell(4).setCellValue(dto.getMetadata().getTanggalMulai() + " s.d. " + dto.getMetadata().getTanggalAkhir());
        rMeta1.getCell(4).setCellStyle(styles.normalText);

        Row rMeta2 = sheet.createRow(r++);
        rMeta2.createCell(0).setCellValue("Waktu Generate:");
        rMeta2.getCell(0).setCellStyle(styles.boldLabel);
        java.time.format.DateTimeFormatter dtf = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        rMeta2.createCell(1).setCellValue(dto.getMetadata().getWaktuGenerate().format(dtf) + " WIB");
        rMeta2.getCell(1).setCellStyle(styles.normalText);

        rMeta2.createCell(3).setCellValue("Status Audit:");
        rMeta2.getCell(3).setCellStyle(styles.boldLabel);
        rMeta2.createCell(4).setCellValue(dto.getMetadata().isModeSimulasi()
            ? "MODE SIMULASI (Kiosk Exit)" : "LIVE GATEWAY AUDITED");
        rMeta2.getCell(4).setCellStyle(dto.getMetadata().isModeSimulasi() ? styles.amberBadge : styles.greenBadge);

        r++; // Spasi

        // Baris Ringkasan KPI
        Row rHeaderKpi = sheet.createRow(r++);
        Cell cHeaderKpi = rHeaderKpi.createCell(0);
        cHeaderKpi.setCellValue("RINGKASAN EKSEKUTIF (KEY PERFORMANCE INDICATORS)");
        cHeaderKpi.setCellStyle(styles.sectionTitleFont);

        List<KartuKpiDto> kpiList = dto.getRingkasan();
        if (kpiList != null && !kpiList.isEmpty())
        {
            Row rKpiVal = sheet.createRow(r++);
            Row rKpiLbl = sheet.createRow(r++);

            for (int i = 0; i < kpiList.size(); i++)
            {
                KartuKpiDto k = kpiList.get(i);
                Cell cVal = rKpiVal.createCell(i);
                cVal.setCellValue(k.getNilai());
                cVal.setCellStyle(styles.kpiValueCell);

                Cell cLbl = rKpiLbl.createCell(i);
                cLbl.setCellValue(k.getLabel());
                cLbl.setCellStyle(styles.kpiLabelCell);
            }
        }

        r += 2; // Spasi

        // Pernyataan Klausul Hukum & Audit
        Row rAudit = sheet.createRow(r++);
        Cell cAudit = rAudit.createCell(0);
        cAudit.setCellValue("CATATAN AUDIT: Dokumen ini diterbitkan secara otomatis oleh modul PK-UC010 SPCT. Seluruh catatan bersifat Read-Only untuk integritas tata kelola.");
        cAudit.setCellStyle(styles.italicMutedFont);

        r += 2;

        // Lembar Pengesahan Tanda Tangan
        Row rTtdHeader = sheet.createRow(r++);
        rTtdHeader.createCell(0).setCellValue("Disiapkan & Diverifikasi Oleh:");
        rTtdHeader.getCell(0).setCellStyle(styles.boldLabel);
        rTtdHeader.createCell(3).setCellValue("Disetujui & Disahkan Oleh:");
        rTtdHeader.getCell(3).setCellStyle(styles.boldLabel);

        r += 3; // Jarak tanda tangan

        Row rTtdNama = sheet.createRow(r++);
        rTtdNama.createCell(0).setCellValue("( Supervisor Operasional & IoT )");
        rTtdNama.getCell(0).setCellStyle(styles.boldLabel);
        rTtdNama.createCell(3).setCellValue("( Manajer Fasilitas & Operasional RS )");
        rTtdNama.getCell(3).setCellStyle(styles.boldLabel);

        Row rTtdNip = sheet.createRow(r++);
        rTtdNip.createCell(0).setCellValue("NIP. 19850412 201012 1 003");
        rTtdNip.getCell(0).setCellStyle(styles.italicMutedFont);
        rTtdNip.createCell(3).setCellValue("NIP. 19780920 200501 2 001");
        rTtdNip.getCell(3).setCellStyle(styles.italicMutedFont);

        // Atur lebar kolom ringkasan
        sheet.setColumnWidth(0, 7500);
        sheet.setColumnWidth(1, 7500);
        sheet.setColumnWidth(2, 4000);
        sheet.setColumnWidth(3, 7500);
        sheet.setColumnWidth(4, 7500);
    }

    // =====================================================================
    // 2. Pembuatan Sheet Laporan Finansial
    // =====================================================================
    private void buatSheetFinansial(Workbook workbook, CellStyleRegistry styles, List<BarisFinansialDto> rows, String namaSheet)
    {
        Sheet sheet = workbook.createSheet(namaSheet);
        sheet.setDisplayGridlines(true);

        String[] headers = {
            "No", "No. Tiket", "Plat Nomor", "Jenis Kendaraan",
            "Waktu Masuk", "Waktu Keluar", "Durasi Parkir",
            "Total Biaya (Rp)", "Kanal Pembayaran", "Status Bayar"
        };

        // Header Table
        Row headerRow = sheet.createRow(0);
        headerRow.setHeightInPoints(24);
        for (int i = 0; i < headers.length; i++)
        {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(styles.thStyle);
        }

        int r = 1;
        BigDecimal grandTotal = BigDecimal.ZERO;

        if (rows != null && !rows.isEmpty())
        {
            for (BarisFinansialDto f : rows)
            {
                Row row = sheet.createRow(r);
                boolean isZebra = (r % 2 == 0);
                CellStyle baseStyle = isZebra ? styles.tdZebra : styles.tdNormal;
                CellStyle curStyle = isZebra ? styles.tdZebraCurrency : styles.tdNormalCurrency;
                CellStyle centerStyle = isZebra ? styles.tdZebraCenter : styles.tdNormalCenter;

                row.createCell(0).setCellValue(f.getNo());
                row.getCell(0).setCellStyle(centerStyle);

                row.createCell(1).setCellValue(f.getNomorTiket());
                row.getCell(1).setCellStyle(centerStyle);

                row.createCell(2).setCellValue(f.getPlatNomor());
                row.getCell(2).setCellStyle(baseStyle);

                row.createCell(3).setCellValue(f.getJenisKendaraan());
                row.getCell(3).setCellStyle(centerStyle);

                row.createCell(4).setCellValue(f.getWaktuMasuk());
                row.getCell(4).setCellStyle(centerStyle);

                row.createCell(5).setCellValue(f.getWaktuKeluar());
                row.getCell(5).setCellStyle(centerStyle);

                row.createCell(6).setCellValue(f.getDurasiTeks());
                row.getCell(6).setCellStyle(centerStyle);

                Cell cTarif = row.createCell(7);
                cTarif.setCellValue(f.getTotalTarif() != null ? f.getTotalTarif().doubleValue() : 0);
                cTarif.setCellStyle(curStyle);

                row.createCell(8).setCellValue(f.getKanalPembayaran());
                row.getCell(8).setCellStyle(centerStyle);

                row.createCell(9).setCellValue(f.getStatusPembayaran());
                row.getCell(9).setCellStyle(centerStyle);

                if (f.getTotalTarif() != null)
                {
                    grandTotal = grandTotal.add(f.getTotalTarif());
                }

                r++;
            }

            // Baris Total di paling bawah
            Row totalRow = sheet.createRow(r++);
            totalRow.setHeightInPoints(20);
            Cell cTotalLabel = totalRow.createCell(0);
            cTotalLabel.setCellValue("TOTAL PENDAPATAN PARKIR:");
            cTotalLabel.setCellStyle(styles.totalLabelStyle);

            for (int col = 1; col <= 6; col++)
            {
                Cell emptyCell = totalRow.createCell(col);
                emptyCell.setCellStyle(styles.totalLabelStyle);
            }
            sheet.addMergedRegion(new CellRangeAddress(r - 1, r - 1, 0, 6));

            Cell cTotalVal = totalRow.createCell(7);
            cTotalVal.setCellValue(grandTotal.doubleValue());
            cTotalVal.setCellStyle(styles.totalCurrencyStyle);

            Cell cTail1 = totalRow.createCell(8);
            cTail1.setCellStyle(styles.totalLabelStyle);
            Cell cTail2 = totalRow.createCell(9);
            cTail2.setCellStyle(styles.totalLabelStyle);
        }
        else
        {
            Row emptyRow = sheet.createRow(r++);
            Cell cEmpty = emptyRow.createCell(0);
            cEmpty.setCellValue("Tidak ada transaksi parkir pada rentang waktu yang dipilih.");
            cEmpty.setCellStyle(styles.italicMutedFont);
            sheet.addMergedRegion(new CellRangeAddress(r - 1, r - 1, 0, headers.length - 1));
        }

        // Freeze baris header atas
        sheet.createFreezePane(0, 1);

        // Auto size kolom
        for (int i = 0; i < headers.length; i++)
        {
            sheet.autoSizeColumn(i);
            sheet.setColumnWidth(i, Math.max(sheet.getColumnWidth(i) + 1200, 3600));
        }
    }

    // =====================================================================
    // 3. Pembuatan Sheet Laporan Operasional & IoT
    // =====================================================================
    private void buatSheetOperasional(Workbook workbook, CellStyleRegistry styles, List<BarisOperasionalDto> rows, String namaSheet)
    {
        Sheet sheet = workbook.createSheet(namaSheet);
        sheet.setDisplayGridlines(true);

        String[] headers = {
            "No", "ID Log", "Waktu Kejadian", "Slot / Node",
            "Tipe Kejadian", "Catatan Detail", "Tingkat Keparahan", "Status Resolusi"
        };

        Row headerRow = sheet.createRow(0);
        headerRow.setHeightInPoints(24);
        for (int i = 0; i < headers.length; i++)
        {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(styles.thStyle);
        }

        int r = 1;

        if (rows != null && !rows.isEmpty())
        {
            for (BarisOperasionalDto op : rows)
            {
                Row row = sheet.createRow(r);
                boolean isZebra = (r % 2 == 0);
                CellStyle baseStyle = isZebra ? styles.tdZebra : styles.tdNormal;
                CellStyle centerStyle = isZebra ? styles.tdZebraCenter : styles.tdNormalCenter;

                row.createCell(0).setCellValue(op.getNo());
                row.getCell(0).setCellStyle(centerStyle);

                row.createCell(1).setCellValue(op.getIdLog());
                row.getCell(1).setCellStyle(centerStyle);

                row.createCell(2).setCellValue(op.getWaktu());
                row.getCell(2).setCellStyle(centerStyle);

                row.createCell(3).setCellValue(op.getIdSlot());
                row.getCell(3).setCellStyle(centerStyle);

                row.createCell(4).setCellValue(op.getJenisKejadian());
                row.getCell(4).setCellStyle(baseStyle);

                row.createCell(5).setCellValue(op.getCatatanDetail());
                row.getCell(5).setCellStyle(baseStyle);

                row.createCell(6).setCellValue(op.getTingkatKeparahan());
                row.getCell(6).setCellStyle(centerStyle);

                row.createCell(7).setCellValue(op.getStatusResolusi());
                row.getCell(7).setCellStyle(centerStyle);

                r++;
            }
        }
        else
        {
            Row emptyRow = sheet.createRow(r++);
            Cell cEmpty = emptyRow.createCell(0);
            cEmpty.setCellValue("Tidak ada anomali atau kejadian IoT tercatat pada rentang waktu yang dipilih.");
            cEmpty.setCellStyle(styles.italicMutedFont);
            sheet.addMergedRegion(new CellRangeAddress(r - 1, r - 1, 0, headers.length - 1));
        }

        sheet.createFreezePane(0, 1);

        for (int i = 0; i < headers.length; i++)
        {
            sheet.autoSizeColumn(i);
            sheet.setColumnWidth(i, Math.max(sheet.getColumnWidth(i) + 1200, 3600));
        }
    }

    // =====================================================================
    // 4. Pembuatan Sheet Laporan Lingkungan (Eco-Metric)
    // =====================================================================
    private void buatSheetLingkungan(Workbook workbook, CellStyleRegistry styles, List<BarisLingkunganDto> rows, String namaSheet)
    {
        Sheet sheet = workbook.createSheet(namaSheet);
        sheet.setDisplayGridlines(true);

        String[] headers = {
            "No", "Plat Nomor", "Slot Tujuan", "Waktu Masuk",
            "Tiba di Slot", "Durasi Tempuh (Detik)", "Waktu Normal (Detik)",
            "Waktu Dihemat (Menit)", "Reduksi CO2 (Gram)"
        };

        Row headerRow = sheet.createRow(0);
        headerRow.setHeightInPoints(24);
        for (int i = 0; i < headers.length; i++)
        {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(styles.thStyle);
        }

        int r = 1;
        long totalWaktuDihematMenit = 0;
        double totalReduksiCo2Gram = 0.0;

        if (rows != null && !rows.isEmpty())
        {
            for (BarisLingkunganDto eco : rows)
            {
                Row row = sheet.createRow(r);
                boolean isZebra = (r % 2 == 0);
                CellStyle baseStyle = isZebra ? styles.tdZebra : styles.tdNormal;
                CellStyle centerStyle = isZebra ? styles.tdZebraCenter : styles.tdNormalCenter;
                CellStyle numStyle = isZebra ? styles.tdZebraNumber : styles.tdNormalNumber;

                row.createCell(0).setCellValue(eco.getNo());
                row.getCell(0).setCellStyle(centerStyle);

                row.createCell(1).setCellValue(eco.getPlatNomor());
                row.getCell(1).setCellStyle(baseStyle);

                row.createCell(2).setCellValue(eco.getIdSlot());
                row.getCell(2).setCellStyle(centerStyle);

                row.createCell(3).setCellValue(eco.getWaktuMasuk());
                row.getCell(3).setCellStyle(centerStyle);

                row.createCell(4).setCellValue(eco.getWaktuTiba());
                row.getCell(4).setCellStyle(centerStyle);

                row.createCell(5).setCellValue(eco.getDurasiTempuhDetik());
                row.getCell(5).setCellStyle(numStyle);

                row.createCell(6).setCellValue(eco.getWaktuNormalDetik());
                row.getCell(6).setCellStyle(numStyle);

                row.createCell(7).setCellValue(eco.getMenitDihemat());
                row.getCell(7).setCellStyle(numStyle);

                row.createCell(8).setCellValue(eco.getReduksiCo2Gram());
                row.getCell(8).setCellStyle(numStyle);

                totalWaktuDihematMenit += eco.getMenitDihemat();
                totalReduksiCo2Gram += eco.getReduksiCo2Gram();

                r++;
            }

            // Baris Total
            Row totalRow = sheet.createRow(r++);
            totalRow.setHeightInPoints(20);
            Cell cTotalLabel = totalRow.createCell(0);
            cTotalLabel.setCellValue("TOTAL DAMPAK LINGKUNGAN DIHEMAT:");
            cTotalLabel.setCellStyle(styles.totalLabelStyle);

            for (int col = 1; col <= 6; col++)
            {
                Cell emptyCell = totalRow.createCell(col);
                emptyCell.setCellStyle(styles.totalLabelStyle);
            }
            sheet.addMergedRegion(new CellRangeAddress(r - 1, r - 1, 0, 6));

            Cell cTotMenit = totalRow.createCell(7);
            cTotMenit.setCellValue(totalWaktuDihematMenit);
            cTotMenit.setCellStyle(styles.totalNumberStyle);

            Cell cTotCo2 = totalRow.createCell(8);
            cTotCo2.setCellValue(totalReduksiCo2Gram);
            cTotCo2.setCellStyle(styles.totalNumberStyle);
        }
        else
        {
            Row emptyRow = sheet.createRow(r++);
            Cell cEmpty = emptyRow.createCell(0);
            cEmpty.setCellValue("Belum ada data kendaraan tiba di slot pada rentang waktu yang dipilih.");
            cEmpty.setCellStyle(styles.italicMutedFont);
            sheet.addMergedRegion(new CellRangeAddress(r - 1, r - 1, 0, headers.length - 1));
        }

        sheet.createFreezePane(0, 1);

        for (int i = 0; i < headers.length; i++)
        {
            sheet.autoSizeColumn(i);
            sheet.setColumnWidth(i, Math.max(sheet.getColumnWidth(i) + 1200, 3600));
        }
    }

    // =====================================================================
    // Helper: Style Registry untuk Pengelolaan Font, Warna & Format Cell
    // =====================================================================
    private static class CellStyleRegistry
    {
        final CellStyle titleFont;
        final CellStyle subtitleGreenFont;
        final CellStyle italicMutedFont;
        final CellStyle sectionTitleFont;
        final CellStyle boldLabel;
        final CellStyle normalText;
        final CellStyle amberBadge;
        final CellStyle greenBadge;

        final CellStyle kpiValueCell;
        final CellStyle kpiLabelCell;

        final CellStyle thStyle;
        final CellStyle tdNormal;
        final CellStyle tdNormalCenter;
        final CellStyle tdNormalCurrency;
        final CellStyle tdNormalNumber;

        final CellStyle tdZebra;
        final CellStyle tdZebraCenter;
        final CellStyle tdZebraCurrency;
        final CellStyle tdZebraNumber;

        final CellStyle totalLabelStyle;
        final CellStyle totalCurrencyStyle;
        final CellStyle totalNumberStyle;

        CellStyleRegistry(Workbook wb)
        {
            DataFormat df = wb.createDataFormat();
            DefaultIndexedColorMap colorMap = new DefaultIndexedColorMap();

            // Font Dasar
            Font fontHeader = wb.createFont();
            fontHeader.setFontName("Calibri");
            fontHeader.setBold(true);
            fontHeader.setColor(IndexedColors.WHITE.getIndex());
            fontHeader.setFontHeightInPoints((short) 10);

            Font fontTitle = wb.createFont();
            fontTitle.setFontName("Calibri");
            fontTitle.setBold(true);
            fontTitle.setFontHeightInPoints((short) 14);

            Font fontSubtitleGreen = wb.createFont();
            fontSubtitleGreen.setFontName("Calibri");
            fontSubtitleGreen.setBold(true);
            fontSubtitleGreen.setColor(IndexedColors.GREEN.getIndex());
            fontSubtitleGreen.setFontHeightInPoints((short) 10);

            Font fontSectionTitle = wb.createFont();
            fontSectionTitle.setFontName("Calibri");
            fontSectionTitle.setBold(true);
            fontSectionTitle.setFontHeightInPoints((short) 11);

            Font fontMuted = wb.createFont();
            fontMuted.setFontName("Calibri");
            fontMuted.setItalic(true);
            fontMuted.setColor(IndexedColors.GREY_50_PERCENT.getIndex());
            fontMuted.setFontHeightInPoints((short) 9);

            Font fontBold = wb.createFont();
            fontBold.setFontName("Calibri");
            fontBold.setBold(true);
            fontBold.setFontHeightInPoints((short) 9.5);

            Font fontKpiVal = wb.createFont();
            fontKpiVal.setFontName("Calibri");
            fontKpiVal.setBold(true);
            fontKpiVal.setFontHeightInPoints((short) 13);

            Font fontRegular = wb.createFont();
            fontRegular.setFontName("Calibri");
            fontRegular.setFontHeightInPoints((short) 9.5);

            // 1. Text styles
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

            amberBadge = wb.createCellStyle();
            amberBadge.setFont(fontBold);
            amberBadge.setFillForegroundColor(IndexedColors.LIGHT_ORANGE.getIndex());
            amberBadge.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            greenBadge = wb.createCellStyle();
            greenBadge.setFont(fontBold);
            greenBadge.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
            greenBadge.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // KPI Cells
            kpiValueCell = wb.createCellStyle();
            kpiValueCell.setFont(fontKpiVal);
            kpiValueCell.setAlignment(HorizontalAlignment.CENTER);
            kpiValueCell.setFillForegroundColor(new XSSFColor(RGB_CARD_BG, colorMap));
            kpiValueCell.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setBorders(kpiValueCell, BorderStyle.THIN);

            kpiLabelCell = wb.createCellStyle();
            kpiLabelCell.setFont(fontRegular);
            kpiLabelCell.setAlignment(HorizontalAlignment.CENTER);
            kpiLabelCell.setFillForegroundColor(new XSSFColor(RGB_CARD_BG, colorMap));
            kpiLabelCell.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setBorders(kpiLabelCell, BorderStyle.THIN);

            // 2. Table Header
            thStyle = wb.createCellStyle();
            thStyle.setFont(fontHeader);
            thStyle.setAlignment(HorizontalAlignment.CENTER);
            thStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            thStyle.setFillForegroundColor(new XSSFColor(RGB_NAVY_HEADER, colorMap));
            thStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setBorders(thStyle, BorderStyle.THIN);

            // 3. Normal Row
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

            // 4. Zebra Row
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

            // 5. Total Row
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
        }

        private static void setBorders(CellStyle style, BorderStyle bs)
        {
            style.setBorderTop(bs);
            style.setBorderBottom(bs);
            style.setBorderLeft(bs);
            style.setBorderRight(bs);
        }
    }
}
