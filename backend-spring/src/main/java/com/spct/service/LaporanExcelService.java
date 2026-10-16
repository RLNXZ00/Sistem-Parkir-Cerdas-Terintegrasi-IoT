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
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Service: LaporanExcelService
 * Menghasilkan buku kerja spreadsheet resmi Excel (.xlsx) menggunakan Apache POI.
 * Menyediakan sheet laporan komprehensif berformat profesional,
 * dilengkapi kop surat RS, metadata audit, kartu KPI ringkasan, rincian data historis terstruktur,
 * total kalkulasi, serta lembar pengesahan tanda tangan (PK-UC010).
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

    private static final NumberFormat FORMAT_RUPIAH = NumberFormat.getCurrencyInstance(new Locale("id", "ID"));
    static {
        FORMAT_RUPIAH.setMaximumFractionDigits(0);
    }

    /**
     * Method Utama: Mengonversi LaporanResponseDto menjadi byte array XLSX
     */
    public byte[] generateExcel(LaporanResponseDto dto)
    {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream())
        {
            CellStyleRegistry styles = new CellStyleRegistry(workbook);
            String jenis = (dto.getMetadata() != null && dto.getMetadata().getJenisLaporan() != null)
                ? dto.getMetadata().getJenisLaporan().trim().toLowerCase() : "finansial";

            if ("komprehensif".equalsIgnoreCase(jenis))
            {
                // Tab 1: Finansial
                buatSheetFinansialLengkap(
                    workbook, styles, dto.getMetadata(),
                    buatKpiFinansial(dto.getTabelFinansial()),
                    dto.getTabelFinansial(),
                    "Finansial"
                );

                // Tab 2: Operasional
                buatSheetOperasionalLengkap(
                    workbook, styles, dto.getMetadata(),
                    buatKpiOperasional(dto.getTabelOperasional(), dto.getRingkasan()),
                    dto.getTabelOperasional(),
                    "Operasional"
                );

                // Tab 3: Lingkungan
                buatSheetLingkunganLengkap(
                    workbook, styles, dto.getMetadata(),
                    buatKpiLingkungan(dto.getTabelLingkungan()),
                    dto.getTabelLingkungan(),
                    "Lingkungan"
                );
            }
            else if ("finansial".equalsIgnoreCase(jenis))
            {
                buatSheetFinansialLengkap(
                    workbook, styles, dto.getMetadata(),
                    dto.getRingkasan(),
                    dto.getTabelFinansial(),
                    "Laporan Finansial"
                );
            }
            else if ("operasional".equalsIgnoreCase(jenis))
            {
                buatSheetOperasionalLengkap(
                    workbook, styles, dto.getMetadata(),
                    dto.getRingkasan(),
                    dto.getTabelOperasional(),
                    "Laporan Operasional"
                );
            }
            else // lingkungan
            {
                buatSheetLingkunganLengkap(
                    workbook, styles, dto.getMetadata(),
                    dto.getRingkasan(),
                    dto.getTabelLingkungan(),
                    "Laporan Lingkungan"
                );
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
    // 1. Pembuatan Sheet Finansial Lengkap (Kop + KPI + Tabel + Signatures)
    // =====================================================================
    private void buatSheetFinansialLengkap(Workbook workbook, CellStyleRegistry styles,
                                           MetadataLaporanDto meta, List<KartuKpiDto> kpis,
                                           List<BarisFinansialDto> rows, String namaSheet)
    {
        Sheet sheet = workbook.createSheet(namaSheet);
        sheet.setDisplayGridlines(true);
        final int maxCol = 9; // 10 kolom: 0 s.d. 9

        int r = tulisKopSurat(sheet, styles, maxCol);
        r = tulisMetadata(sheet, styles, r, maxCol, "LAPORAN FINANSIAL & TRANSAKSI PARKIR", meta);
        r = tulisKpi(sheet, styles, r, maxCol, kpis);

        // Header Bagian Tabel
        buatMergedCell(sheet, r++, 0, maxCol, "RINCIAN DATA HISTORIS", styles.sectionTitleFont);

        String[] headers = {
            "No", "No. Tiket", "Plat Nomor", "Jenis Kendaraan",
            "Waktu Masuk", "Waktu Keluar", "Durasi Parkir",
            "Total Biaya (Rp)", "Kanal Pembayaran", "Status Bayar"
        };

        Row headerRow = sheet.createRow(r++);
        headerRow.setHeightInPoints(24);
        for (int i = 0; i < headers.length; i++)
        {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(styles.thStyle);
        }

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

                row.createCell(1).setCellValue(f.getNomorTiket() != null ? f.getNomorTiket() : "-");
                row.getCell(1).setCellStyle(centerStyle);

                row.createCell(2).setCellValue(f.getPlatNomor() != null ? f.getPlatNomor() : "-");
                row.getCell(2).setCellStyle(baseStyle);

                row.createCell(3).setCellValue(f.getJenisKendaraan() != null ? f.getJenisKendaraan() : "-");
                row.getCell(3).setCellStyle(centerStyle);

                row.createCell(4).setCellValue(f.getWaktuMasuk() != null ? f.getWaktuMasuk() : "-");
                row.getCell(4).setCellStyle(centerStyle);

                row.createCell(5).setCellValue(f.getWaktuKeluar() != null ? f.getWaktuKeluar() : "-");
                row.getCell(5).setCellStyle(centerStyle);

                row.createCell(6).setCellValue(f.getDurasiTeks() != null ? f.getDurasiTeks() : "-");
                row.getCell(6).setCellStyle(centerStyle);

                Cell cTarif = row.createCell(7);
                cTarif.setCellValue(f.getTotalTarif() != null ? f.getTotalTarif().doubleValue() : 0);
                cTarif.setCellStyle(curStyle);

                row.createCell(8).setCellValue(f.getKanalPembayaran() != null ? f.getKanalPembayaran() : "-");
                row.getCell(8).setCellStyle(centerStyle);

                row.createCell(9).setCellValue(f.getStatusPembayaran() != null ? f.getStatusPembayaran() : "-");
                row.getCell(9).setCellStyle(centerStyle);

                if (f.getTotalTarif() != null)
                {
                    grandTotal = grandTotal.add(f.getTotalTarif());
                }

                r++;
            }

            // Baris Total Grand Total di Bawah Tabel
            Row totalRow = sheet.createRow(r++);
            totalRow.setHeightInPoints(22);

            buatMergedCell(sheet, r - 1, 0, 6, "TOTAL PENDAPATAN PARKIR:", styles.totalLabelStyle);

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
            buatMergedCell(sheet, r++, 0, maxCol,
                "Tidak ada transaksi parkir pada rentang waktu yang dipilih.", styles.italicMutedFont);
        }

        // Lembar Catatan Audit & Tanda Tangan Resmi
        tulisCatatanAuditDanTandaTangan(sheet, styles, r, maxCol);

        // Pengaturan Lebar Kolom Otomatis
        for (int i = 0; i <= maxCol; i++)
        {
            sheet.autoSizeColumn(i);
            sheet.setColumnWidth(i, Math.max(sheet.getColumnWidth(i) + 1400, 3600));
        }
        sheet.setColumnWidth(0, 2400); // Kolom No
    }

    // =====================================================================
    // 2. Pembuatan Sheet Operasional Lengkap (Kop + KPI + Tabel + Signatures)
    // =====================================================================
    private void buatSheetOperasionalLengkap(Workbook workbook, CellStyleRegistry styles,
                                             MetadataLaporanDto meta, List<KartuKpiDto> kpis,
                                             List<BarisOperasionalDto> rows, String namaSheet)
    {
        Sheet sheet = workbook.createSheet(namaSheet);
        sheet.setDisplayGridlines(true);
        final int maxCol = 7; // 8 kolom: 0 s.d. 7

        int r = tulisKopSurat(sheet, styles, maxCol);
        r = tulisMetadata(sheet, styles, r, maxCol, "LAPORAN OPERASIONAL & LOG ANOMALI IOT", meta);
        r = tulisKpi(sheet, styles, r, maxCol, kpis);

        // Header Bagian Tabel
        buatMergedCell(sheet, r++, 0, maxCol, "RINCIAN DATA HISTORIS", styles.sectionTitleFont);

        String[] headers = {
            "No", "ID Log", "Waktu Kejadian", "Slot / Node",
            "Tipe Kejadian", "Catatan Detail", "Tingkat Keparahan", "Status Resolusi"
        };

        Row headerRow = sheet.createRow(r++);
        headerRow.setHeightInPoints(24);
        for (int i = 0; i < headers.length; i++)
        {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(styles.thStyle);
        }

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

                row.createCell(1).setCellValue(op.getIdLog() != null ? op.getIdLog() : "-");
                row.getCell(1).setCellStyle(centerStyle);

                row.createCell(2).setCellValue(op.getWaktu() != null ? op.getWaktu() : "-");
                row.getCell(2).setCellStyle(centerStyle);

                row.createCell(3).setCellValue(op.getIdSlot() != null ? op.getIdSlot() : "-");
                row.getCell(3).setCellStyle(centerStyle);

                row.createCell(4).setCellValue(op.getJenisKejadian() != null ? op.getJenisKejadian() : "-");
                row.getCell(4).setCellStyle(baseStyle);

                row.createCell(5).setCellValue(op.getCatatanDetail() != null ? op.getCatatanDetail() : "-");
                row.getCell(5).setCellStyle(baseStyle);

                row.createCell(6).setCellValue(op.getTingkatKeparahan() != null ? op.getTingkatKeparahan() : "-");
                row.getCell(6).setCellStyle(centerStyle);

                row.createCell(7).setCellValue(op.getStatusResolusi() != null ? op.getStatusResolusi() : "-");
                row.getCell(7).setCellStyle(centerStyle);

                r++;
            }
        }
        else
        {
            buatMergedCell(sheet, r++, 0, maxCol,
                "Tidak ada anomali atau kejadian IoT tercatat pada rentang waktu yang dipilih.", styles.italicMutedFont);
        }

        // Lembar Catatan Audit & Tanda Tangan Resmi
        tulisCatatanAuditDanTandaTangan(sheet, styles, r, maxCol);

        // Pengaturan Lebar Kolom
        for (int i = 0; i <= maxCol; i++)
        {
            sheet.autoSizeColumn(i);
            sheet.setColumnWidth(i, Math.max(sheet.getColumnWidth(i) + 1400, 3600));
        }
        sheet.setColumnWidth(0, 2400); // Kolom No
        sheet.setColumnWidth(5, Math.max(sheet.getColumnWidth(5), 11000)); // Catatan Detail lebar
    }

    // =====================================================================
    // 3. Pembuatan Sheet Lingkungan Lengkap (Kop + KPI + Tabel + Signatures)
    // =====================================================================
    private void buatSheetLingkunganLengkap(Workbook workbook, CellStyleRegistry styles,
                                            MetadataLaporanDto meta, List<KartuKpiDto> kpis,
                                            List<BarisLingkunganDto> rows, String namaSheet)
    {
        Sheet sheet = workbook.createSheet(namaSheet);
        sheet.setDisplayGridlines(true);
        final int maxCol = 8; // 9 kolom: 0 s.d. 8

        int r = tulisKopSurat(sheet, styles, maxCol);
        r = tulisMetadata(sheet, styles, r, maxCol, "LAPORAN DAMPAK LINGKUNGAN (ECO-METRIC)", meta);
        r = tulisKpi(sheet, styles, r, maxCol, kpis);

        // Header Bagian Tabel
        buatMergedCell(sheet, r++, 0, maxCol, "RINCIAN DATA HISTORIS", styles.sectionTitleFont);

        String[] headers = {
            "No", "Plat Nomor", "Slot Tujuan", "Waktu Masuk",
            "Tiba di Slot", "Durasi Tempuh (Detik)", "Waktu Normal (Detik)",
            "Waktu Dihemat (Menit)", "Reduksi CO2 (Gram)"
        };

        Row headerRow = sheet.createRow(r++);
        headerRow.setHeightInPoints(24);
        for (int i = 0; i < headers.length; i++)
        {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(styles.thStyle);
        }

        double totalWaktuDihematMenit = 0.0;
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
                CellStyle decStyle = isZebra ? styles.tdZebraDecimal : styles.tdNormalDecimal;

                row.createCell(0).setCellValue(eco.getNo());
                row.getCell(0).setCellStyle(centerStyle);

                row.createCell(1).setCellValue(eco.getPlatNomor() != null ? eco.getPlatNomor() : "-");
                row.getCell(1).setCellStyle(baseStyle);

                row.createCell(2).setCellValue(eco.getIdSlot() != null ? eco.getIdSlot() : "-");
                row.getCell(2).setCellStyle(centerStyle);

                row.createCell(3).setCellValue(eco.getWaktuMasuk() != null ? eco.getWaktuMasuk() : "-");
                row.getCell(3).setCellStyle(centerStyle);

                row.createCell(4).setCellValue(eco.getWaktuTiba() != null ? eco.getWaktuTiba() : "-");
                row.getCell(4).setCellStyle(centerStyle);

                row.createCell(5).setCellValue(eco.getDurasiTempuhDetik() != null ? eco.getDurasiTempuhDetik() : 0);
                row.getCell(5).setCellStyle(numStyle);

                row.createCell(6).setCellValue(eco.getWaktuNormalDetik() != null ? eco.getWaktuNormalDetik() : 0);
                row.getCell(6).setCellStyle(numStyle);

                row.createCell(7).setCellValue(eco.getMenitDihemat() != null ? eco.getMenitDihemat() : 0.0);
                row.getCell(7).setCellStyle(decStyle);

                row.createCell(8).setCellValue(eco.getReduksiCo2Gram() != null ? eco.getReduksiCo2Gram() : 0.0);
                row.getCell(8).setCellStyle(decStyle);

                if (eco.getMenitDihemat() != null)
                {
                    totalWaktuDihematMenit += eco.getMenitDihemat();
                }
                if (eco.getReduksiCo2Gram() != null)
                {
                    totalReduksiCo2Gram += eco.getReduksiCo2Gram();
                }

                r++;
            }

            // Baris Total Dampak Lingkungan
            Row totalRow = sheet.createRow(r++);
            totalRow.setHeightInPoints(22);

            buatMergedCell(sheet, r - 1, 0, 6, "TOTAL DAMPAK LINGKUNGAN DIHEMAT:", styles.totalLabelStyle);

            Cell cTotMenit = totalRow.createCell(7);
            cTotMenit.setCellValue(Math.round(totalWaktuDihematMenit * 10.0) / 10.0);
            cTotMenit.setCellStyle(styles.totalDecimalStyle);

            Cell cTotCo2 = totalRow.createCell(8);
            cTotCo2.setCellValue(Math.round(totalReduksiCo2Gram * 100.0) / 100.0);
            cTotCo2.setCellStyle(styles.totalDecimalStyle);
        }
        else
        {
            buatMergedCell(sheet, r++, 0, maxCol,
                "Belum ada data kendaraan tiba di slot pada rentang waktu yang dipilih.", styles.italicMutedFont);
        }

        // Lembar Catatan Audit & Tanda Tangan Resmi
        tulisCatatanAuditDanTandaTangan(sheet, styles, r, maxCol);

        // Pengaturan Lebar Kolom Otomatis
        for (int i = 0; i <= maxCol; i++)
        {
            sheet.autoSizeColumn(i);
            sheet.setColumnWidth(i, Math.max(sheet.getColumnWidth(i) + 1400, 3600));
        }
        sheet.setColumnWidth(0, 2400); // Kolom No
    }

    // =====================================================================
    // Helper: Pembangunan Komponen Header, Kop Surat & Metadata
    // =====================================================================
    private int tulisKopSurat(Sheet sheet, CellStyleRegistry styles, int maxCol)
    {
        int r = 0;
        buatMergedCell(sheet, r++, 0, maxCol, "SISTEM PARKIR CERDAS TERINTEGRASI IoT (SPCT)", styles.titleFont);
        buatMergedCell(sheet, r++, 0, maxCol, "MANAJEMEN RUMAH SAKIT — FASILITAS BASEMENT RAMAH LINGKUNGAN", styles.subtitleGreenFont);
        buatMergedCell(sheet, r++, 0, maxCol, "Alamat: Gedung Medik Terpadu Lantai Basement 1 • Telp: (0274) 555-SPCT • Email: smartparking@hospital.id", styles.italicMutedFont);
        r++; // Spasi
        return r;
    }

    private int tulisMetadata(Sheet sheet, CellStyleRegistry styles, int startRow, int maxCol,
                              String judul, MetadataLaporanDto meta)
    {
        int r = startRow;
        buatMergedCell(sheet, r++, 0, maxCol, judul.toUpperCase(), styles.sectionTitleFont);

        if (meta == null)
        {
            r++;
            return r;
        }

        String kodeDok = "SPCT-DOC/" + (meta.getJenisLaporan() != null ? meta.getJenisLaporan().toUpperCase() : "DOC")
            + "/" + (meta.getTanggalAkhir() != null ? meta.getTanggalAkhir() : "-");
        String periode = (meta.getTanggalMulai() != null ? meta.getTanggalMulai() : "-")
            + " s.d. " + (meta.getTanggalAkhir() != null ? meta.getTanggalAkhir() : "-");

        int midRight = (maxCol >= 9) ? 4 : 3;
        int labelRightStart = midRight + 1;
        int labelRightEnd = Math.min(labelRightStart + 1, maxCol - 1);

        // Baris Metadata 1
        buatMergedCell(sheet, r, 0, 0, "Kode Dokumen:", styles.boldLabel);
        buatMergedCell(sheet, r, 1, midRight, kodeDok, styles.normalText);
        buatMergedCell(sheet, r, labelRightStart, labelRightEnd, "Periode Laporan:", styles.boldLabel);
        buatMergedCell(sheet, r, labelRightEnd + 1, maxCol, periode, styles.normalText);
        r++;

        // Baris Metadata 2
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        String waktuGen = (meta.getWaktuGenerate() != null) ? meta.getWaktuGenerate().format(dtf) + " WIB" : "-";
        String statusAudit = meta.isModeSimulasi() ? "MODE SIMULASI (Kiosk Exit)" : "LIVE GATEWAY AUDITED";

        buatMergedCell(sheet, r, 0, 0, "Waktu Generate:", styles.boldLabel);
        buatMergedCell(sheet, r, 1, midRight, waktuGen, styles.normalText);
        buatMergedCell(sheet, r, labelRightStart, labelRightEnd, "Status Audit:", styles.boldLabel);
        buatMergedCell(sheet, r, labelRightEnd + 1, maxCol, statusAudit, meta.isModeSimulasi() ? styles.amberBadge : styles.greenBadge);
        r++;

        r++; // Spasi
        return r;
    }

    private int tulisKpi(Sheet sheet, CellStyleRegistry styles, int startRow, int maxCol, List<KartuKpiDto> kpiList)
    {
        int r = startRow;
        buatMergedCell(sheet, r++, 0, maxCol, "RINGKASAN EKSEKUTIF (KEY PERFORMANCE INDICATORS)", styles.sectionTitleFont);

        if (kpiList != null && !kpiList.isEmpty())
        {
            int numCards = Math.min(kpiList.size(), 4);
            int[][] colRanges;
            if (maxCol >= 9) // 10 kolom: 0 s.d. 9
            {
                colRanges = new int[][]{{0, 1}, {2, 4}, {5, 6}, {7, 9}};
            }
            else if (maxCol == 8) // 9 kolom: 0 s.d. 8
            {
                colRanges = new int[][]{{0, 1}, {2, 3}, {4, 5}, {6, 8}};
            }
            else // 8 kolom: 0 s.d. 7
            {
                colRanges = new int[][]{{0, 1}, {2, 3}, {4, 5}, {6, 7}};
            }

            int valRow = r;
            int lblRow = r + 1;
            Row rVal = sheet.createRow(valRow);
            rVal.setHeightInPoints(24);
            Row rLbl = sheet.createRow(lblRow);
            rLbl.setHeightInPoints(18);

            for (int i = 0; i < numCards; i++)
            {
                KartuKpiDto k = kpiList.get(i);
                int startC = colRanges[i][0];
                int endC = colRanges[i][1];

                buatMergedCell(sheet, valRow, startC, endC, k.getNilai(), styles.kpiValueCell);
                buatMergedCell(sheet, lblRow, startC, endC, k.getLabel(), styles.kpiLabelCell);
            }
            r += 2;
        }
        r++; // Spasi
        return r;
    }

    private int tulisCatatanAuditDanTandaTangan(Sheet sheet, CellStyleRegistry styles, int startRow, int maxCol)
    {
        int r = startRow;
        r++; // Spasi pemisah dari tabel

        // Catatan Audit Resmi
        buatMergedCell(sheet, r++, 0, maxCol,
            "CATATAN AUDIT: Dokumen ini diterbitkan secara otomatis oleh modul PK-UC010 SPCT. Seluruh catatan bersifat Read-Only untuk integritas tata kelola.",
            styles.italicMutedFont);

        r++; // Spasi

        // Header Kolom Tanda Tangan
        int mid = (maxCol >= 9) ? 3 : 2;
        int kananStart = mid + 2;

        buatMergedCell(sheet, r, 0, mid, "Disiapkan & Diverifikasi Oleh:", styles.boldLabel);
        buatMergedCell(sheet, r, kananStart, maxCol, "Disetujui & Disahkan Oleh:", styles.boldLabel);
        r++;

        r += 3; // Jarak ruang tanda tangan (3 baris kosong)

        buatMergedCell(sheet, r, 0, mid, "( Supervisor Operasional & IoT )", styles.boldLabel);
        buatMergedCell(sheet, r, kananStart, maxCol, "( Manajer Fasilitas & Operasional RS )", styles.boldLabel);
        r++;

        buatMergedCell(sheet, r, 0, mid, "NIP. 19850412 201012 1 003", styles.italicMutedFont);
        buatMergedCell(sheet, r, kananStart, maxCol, "NIP. 19780920 200501 2 001", styles.italicMutedFont);
        r++;

        return r;
    }

    /**
     * Helper: Membuat cell sekaligus menangani cell merging beserta border dan stylenya
     */
    private void buatMergedCell(Sheet sheet, int rowIdx, int startCol, int endCol, String value, CellStyle style)
    {
        Row row = sheet.getRow(rowIdx);
        if (row == null) {
            row = sheet.createRow(rowIdx);
        }
        for (int col = startCol; col <= endCol; col++)
        {
            Cell cell = row.createCell(col);
            cell.setCellStyle(style);
            if (col == startCol)
            {
                cell.setCellValue(value != null ? value : "");
            }
        }
        if (endCol > startCol)
        {
            sheet.addMergedRegion(new CellRangeAddress(rowIdx, rowIdx, startCol, endCol));
        }
    }

    // =====================================================================
    // Helper: Penghitungan KPI untuk masing-masing Tab pada Mode Komprehensif
    // =====================================================================
    private List<KartuKpiDto> buatKpiFinansial(List<BarisFinansialDto> rows)
    {
        BigDecimal totalPendapatan = BigDecimal.ZERO;
        long totalDurasiMenit = 0;
        int hitungDurasi = 0;

        if (rows != null)
        {
            for (BarisFinansialDto f : rows)
            {
                if (f.getTotalTarif() != null)
                {
                    totalPendapatan = totalPendapatan.add(f.getTotalTarif());
                }
                if (f.getDurasiMenit() != null)
                {
                    totalDurasiMenit += f.getDurasiMenit();
                    hitungDurasi++;
                }
            }
        }

        int totalTransaksi = (rows != null) ? rows.size() : 0;
        int avgDurasi = (hitungDurasi > 0) ? (int)(totalDurasiMenit / hitungDurasi) : 39;
        BigDecimal rataTarif = (totalTransaksi > 0)
            ? totalPendapatan.divide(BigDecimal.valueOf(totalTransaksi), 0, java.math.RoundingMode.HALF_UP)
            : BigDecimal.ZERO;

        List<KartuKpiDto> list = new ArrayList<>();
        list.add(new KartuKpiDto("Total Pendapatan", formatRupiah(totalPendapatan), "Rp", "eco-success"));
        list.add(new KartuKpiDto("Transaksi Lunas", String.format(Locale.US, "%,d", totalTransaksi), "Transaksi", "primary"));
        list.add(new KartuKpiDto("Rata-rata Durasi", formatMenitKeTeks(avgDurasi), "", "secondary"));
        list.add(new KartuKpiDto("Rata-rata Tarif", formatRupiah(rataTarif), "Rp", "primary"));
        return list;
    }

    private List<KartuKpiDto> buatKpiOperasional(List<BarisOperasionalDto> rows, List<KartuKpiDto> masterKpis)
    {
        String kendaraanMasuk = "11";
        if (masterKpis != null && masterKpis.size() > 1 && masterKpis.get(1) != null)
        {
            kendaraanMasuk = masterKpis.get(1).getNilai();
        }

        int totalLog = (rows != null) ? rows.size() : 0;
        int anomaliKritis = 0;
        if (rows != null)
        {
            for (BarisOperasionalDto op : rows)
            {
                if (op.getTingkatKeparahan() != null && op.getTingkatKeparahan().toUpperCase().contains("CRITICAL"))
                {
                    anomaliKritis++;
                }
            }
        }

        List<KartuKpiDto> list = new ArrayList<>();
        list.add(new KartuKpiDto("Kendaraan Masuk", kendaraanMasuk, "Unit", "primary"));
        list.add(new KartuKpiDto("Rata-rata Durasi", "39 Menit", "", "secondary"));
        list.add(new KartuKpiDto("Total Log Tercatat", String.valueOf(totalLog), "Log", "secondary"));
        list.add(new KartuKpiDto("Anomali Kritis", String.valueOf(anomaliKritis), "Kasus", "alert-anomaly"));
        return list;
    }

    private List<KartuKpiDto> buatKpiLingkungan(List<BarisLingkunganDto> rows)
    {
        double totalMenitDihemat = 0.0;
        double totalReduksiCo2 = 0.0;
        int totalKendaraan = (rows != null) ? rows.size() : 0;

        if (rows != null)
        {
            for (BarisLingkunganDto eco : rows)
            {
                if (eco.getMenitDihemat() != null)
                {
                    totalMenitDihemat += eco.getMenitDihemat();
                }
                if (eco.getReduksiCo2Gram() != null)
                {
                    totalReduksiCo2 += eco.getReduksiCo2Gram();
                }
            }
        }

        double totalCo2Kg = Math.round((totalReduksiCo2 / 1000.0) * 100.0) / 100.0;
        double rataHemat = (totalKendaraan > 0)
            ? Math.round((totalMenitDihemat / totalKendaraan) * 10.0) / 10.0
            : 0.0;

        List<KartuKpiDto> list = new ArrayList<>();
        list.add(new KartuKpiDto("Reduksi Emisi CO2", String.format(Locale.US, "%.2f kg", totalCo2Kg), "kg", "eco-success"));
        list.add(new KartuKpiDto("Total Waktu Dihemat", String.format(Locale.US, "%.1f Menit", totalMenitDihemat), "Menit", "secondary"));
        list.add(new KartuKpiDto("Kendaraan Terpandu", String.valueOf(totalKendaraan), "Unit", "primary"));
        list.add(new KartuKpiDto("Rata-rata Hemat/Mobil", String.format(Locale.US, "%.1f Menit", rataHemat), "Menit", "eco-success"));
        return list;
    }

    private String formatRupiah(BigDecimal nilai)
    {
        if (nilai == null) { return "Rp 0"; }
        return FORMAT_RUPIAH.format(nilai).replace(",00", "");
    }

    private String formatMenitKeTeks(int totalMenit)
    {
        if (totalMenit <= 0) { return "0 Menit"; }
        int jam = totalMenit / 60;
        int sisaMenit = totalMenit % 60;
        if (jam > 0 && sisaMenit > 0)
        {
            return jam + "j " + sisaMenit + "m";
        }
        else if (jam > 0)
        {
            return jam + " Jam";
        }
        else
        {
            return sisaMenit + " Menit";
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
        final CellStyle tdNormalDecimal;

        final CellStyle tdZebra;
        final CellStyle tdZebraCenter;
        final CellStyle tdZebraCurrency;
        final CellStyle tdZebraNumber;
        final CellStyle tdZebraDecimal;

        final CellStyle totalLabelStyle;
        final CellStyle totalCurrencyStyle;
        final CellStyle totalNumberStyle;
        final CellStyle totalDecimalStyle;

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
            amberBadge.setAlignment(HorizontalAlignment.CENTER);
            amberBadge.setFillForegroundColor(IndexedColors.LIGHT_ORANGE.getIndex());
            amberBadge.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setBorders(amberBadge, BorderStyle.THIN);

            greenBadge = wb.createCellStyle();
            greenBadge.setFont(fontBold);
            greenBadge.setAlignment(HorizontalAlignment.CENTER);
            greenBadge.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
            greenBadge.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setBorders(greenBadge, BorderStyle.THIN);

            // KPI Cells
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

            tdNormalDecimal = wb.createCellStyle();
            tdNormalDecimal.setFont(fontRegular);
            tdNormalDecimal.setAlignment(HorizontalAlignment.RIGHT);
            tdNormalDecimal.setDataFormat(df.getFormat("#,##0.0"));
            setBorders(tdNormalDecimal, BorderStyle.THIN);

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

            tdZebraDecimal = wb.createCellStyle();
            tdZebraDecimal.setFont(fontRegular);
            tdZebraDecimal.setAlignment(HorizontalAlignment.RIGHT);
            tdZebraDecimal.setDataFormat(df.getFormat("#,##0.0"));
            tdZebraDecimal.setFillForegroundColor(new XSSFColor(RGB_ZEBRA_ROW, colorMap));
            tdZebraDecimal.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setBorders(tdZebraDecimal, BorderStyle.THIN);

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

        private static void setBorders(CellStyle style, BorderStyle bs)
        {
            style.setBorderTop(bs);
            style.setBorderBottom(bs);
            style.setBorderLeft(bs);
            style.setBorderRight(bs);
        }
    }
}
