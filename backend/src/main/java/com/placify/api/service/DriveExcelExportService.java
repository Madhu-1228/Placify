package com.placify.api.service;

import com.placify.api.dto.DriveExportType;
import com.placify.api.dto.DriveStudentDto;
import com.placify.api.model.CompanyDrive;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class DriveExcelExportService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd-MMM-yyyy hh:mm a");

    public byte[] generateDriveStudentsExcel(CompanyDrive drive, List<DriveStudentDto> students, DriveExportType exportType) throws IOException {
        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Drive Candidates Report");
            sheet.setDisplayGridlines(true);

            // Create styles
            CellStyle bannerStyle = createBannerStyle(workbook);
            CellStyle metaLabelStyle = createMetaLabelStyle(workbook);
            CellStyle metaValueStyle = createMetaValueStyle(workbook);
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dataStyleEven = createDataStyle(workbook, false);
            CellStyle dataStyleOdd = createDataStyle(workbook, true);
            CellStyle centerStyle = createCenterStyle(workbook);

            // Status Styles
            CellStyle eligibleStyle = createStatusBadgeStyle(workbook, new byte[]{(byte) 16, (byte) 185, (byte) 129}, new byte[]{(byte) 209, (byte) 250, (byte) 229}); // Green
            CellStyle notEligibleStyle = createStatusBadgeStyle(workbook, new byte[]{(byte) 239, (byte) 68, (byte) 68}, new byte[]{(byte) 254, (byte) 226, (byte) 226}); // Red
            CellStyle selectedStyle = createStatusBadgeStyle(workbook, new byte[]{(byte) 5, (byte) 150, (byte) 105}, new byte[]{(byte) 209, (byte) 250, (byte) 229}); // Dark green
            CellStyle appliedStyle = createStatusBadgeStyle(workbook, new byte[]{(byte) 37, (byte) 99, (byte) 235}, new byte[]{(byte) 219, (byte) 234, (byte) 254}); // Blue

            int rowIdx = 0;

            // 1. Title Banner
            Row bannerRow = sheet.createRow(rowIdx++);
            bannerRow.setHeightInPoints(36);
            Cell bannerCell = bannerRow.createCell(0);
            bannerCell.setCellValue("PLACIFY — CAMPUS RECRUITMENT PLACEMENT DRIVE REPORT");
            bannerCell.setCellStyle(bannerStyle);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 11));

            // 2. Subtitle / University Note
            Row subRow = sheet.createRow(rowIdx++);
            subRow.setHeightInPoints(20);
            Cell subCell = subRow.createCell(0);
            subCell.setCellValue("Vasireddy Venkatadri International Technological University • Career Development Services");
            CellStyle subStyle = workbook.createCellStyle();
            Font subFont = workbook.createFont();
            subFont.setFontName("Segoe UI");
            subFont.setFontHeightInPoints((short) 10);
            subFont.setItalic(true);
            subFont.setColor(IndexedColors.GREY_50_PERCENT.getIndex());
            subStyle.setFont(subFont);
            subStyle.setAlignment(HorizontalAlignment.CENTER);
            subStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            subCell.setCellStyle(subStyle);
            sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, 11));

            rowIdx++; // Blank spacer

            // 3. Drive Information Metadata Grid
            long eligibleCount = students.stream().filter(DriveStudentDto::isEligible).count();
            long appliedCount = students.stream().filter(DriveStudentDto::isApplied).count();
            long selectedCount = students.stream().filter(s -> s.getApplicationStatus() != null && s.getApplicationStatus().name().equals("SELECTED")).count();

            rowIdx = writeMetadataRow(sheet, rowIdx, "Company Name:", drive.getCompanyName(), "Drive Status:", drive.getStatus() != null ? drive.getStatus().name() : "OPEN", metaLabelStyle, metaValueStyle);
            rowIdx = writeMetadataRow(sheet, rowIdx, "Job Role:", drive.getRole(), "Drive Date:", drive.getDriveDate() != null ? drive.getDriveDate() : "TBD", metaLabelStyle, metaValueStyle);
            rowIdx = writeMetadataRow(sheet, rowIdx, "Package (CTC):", drive.getPackageCtc() != null ? drive.getPackageCtc() : "N/A", "Application Deadline:", drive.getApplicationDeadline() != null ? drive.getApplicationDeadline() : "N/A", metaLabelStyle, metaValueStyle);
            rowIdx = writeMetadataRow(sheet, rowIdx, "Min CGPA / Backlogs:", String.format("%.2f CGPA / Max %d Backlogs", drive.getMinimumCgpa() != null ? drive.getMinimumCgpa() : 0.0, drive.getMaximumBacklogs() != null ? drive.getMaximumBacklogs() : 0), "Export Mode:", getExportTypeLabel(exportType), metaLabelStyle, metaValueStyle);
            rowIdx = writeMetadataRow(sheet, rowIdx, "Total Candidates in Report:", String.valueOf(students.size()), "Generated On:", LocalDateTime.now(ZoneId.systemDefault()).format(DATE_FORMATTER), metaLabelStyle, metaValueStyle);
            rowIdx = writeMetadataRow(sheet, rowIdx, "Drive Stats (Eligible / Applied / Selected):", String.format("%d Eligible • %d Applied • %d Selected", eligibleCount, appliedCount, selectedCount), "Report System:", "Placify Drive Analytics Engine", metaLabelStyle, metaValueStyle);

            rowIdx++; // Blank spacer

            // 4. Student Table Header Row
            Row headerRow = sheet.createRow(rowIdx++);
            headerRow.setHeightInPoints(28);

            String[] headers = {
                    "S.No",
                    "Roll Number",
                    "Student Name",
                    "College Email",
                    "Contact Phone",
                    "Branch / Department",
                    "CGPA",
                    "Active Backlogs",
                    "Eligibility Status",
                    "Match Score",
                    "Application Status",
                    "Recruitment Stage",
                    "Applied Date & Time"
            };

            for (int col = 0; col < headers.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(headers[col]);
                cell.setCellStyle(headerStyle);
            }

            // Freeze pane below headers (all metadata & headers stay visible while scrolling)
            sheet.createFreezePane(0, rowIdx);

            // 5. Populate Data Rows
            int serialNo = 1;
            for (DriveStudentDto s : students) {
                Row row = sheet.createRow(rowIdx++);
                row.setHeightInPoints(22);
                boolean isOdd = (serialNo % 2 != 0);
                CellStyle baseStyle = isOdd ? dataStyleOdd : dataStyleEven;

                // S.No
                Cell c0 = row.createCell(0);
                c0.setCellValue(serialNo++);
                c0.setCellStyle(centerStyle);

                // Roll Number
                Cell c1 = row.createCell(1);
                c1.setCellValue(s.getRollNumber() != null ? s.getRollNumber() : "N/A");
                c1.setCellStyle(centerStyle);

                // Student Name
                Cell c2 = row.createCell(2);
                c2.setCellValue(s.getName() != null ? s.getName() : "N/A");
                c2.setCellStyle(baseStyle);

                // Email
                Cell c3 = row.createCell(3);
                c3.setCellValue(s.getEmail() != null ? s.getEmail() : "N/A");
                c3.setCellStyle(baseStyle);

                // Phone
                Cell c4 = row.createCell(4);
                c4.setCellValue(s.getPhone() != null ? s.getPhone() : "N/A");
                c4.setCellStyle(centerStyle);

                // Department
                Cell c5 = row.createCell(5);
                c5.setCellValue(s.getDepartment() != null ? s.getDepartment() : "N/A");
                c5.setCellStyle(baseStyle);

                // CGPA
                Cell c6 = row.createCell(6);
                c6.setCellValue(s.getCgpa() != null ? String.format("%.2f", s.getCgpa()) : "0.00");
                c6.setCellStyle(centerStyle);

                // Backlogs
                Cell c7 = row.createCell(7);
                c7.setCellValue(s.getBacklogs() != null ? s.getBacklogs() : 0);
                c7.setCellStyle(centerStyle);

                // Eligibility Status
                Cell c8 = row.createCell(8);
                c8.setCellValue(s.isEligible() ? "ELIGIBLE" : "NOT ELIGIBLE");
                c8.setCellStyle(s.isEligible() ? eligibleStyle : notEligibleStyle);

                // Match Score
                Cell c9 = row.createCell(9);
                c9.setCellValue(String.format("%.0f%%", s.getMatchPercentage()));
                c9.setCellStyle(centerStyle);

                // Applied Status
                Cell c10 = row.createCell(10);
                c10.setCellValue(s.isApplied() ? "APPLIED" : "NOT APPLIED");
                c10.setCellStyle(s.isApplied() ? appliedStyle : baseStyle);

                // Recruitment Stage
                Cell c11 = row.createCell(11);
                String stageText = s.getApplicationStatus() != null ? s.getApplicationStatus().name().replace("_", " ") : (s.isApplied() ? "APPLIED" : "NOT APPLIED");
                c11.setCellValue(stageText);
                if (s.getApplicationStatus() != null && s.getApplicationStatus().name().equals("SELECTED")) {
                    c11.setCellStyle(selectedStyle);
                } else if (s.getApplicationStatus() != null && s.getApplicationStatus().name().equals("REJECTED")) {
                    c11.setCellStyle(notEligibleStyle);
                } else {
                    c11.setCellStyle(centerStyle);
                }

                // Applied Date & Time
                Cell c12 = row.createCell(12);
                if (s.getAppliedAt() != null) {
                    c12.setCellValue(LocalDateTime.ofInstant(s.getAppliedAt(), ZoneId.systemDefault()).format(DATE_FORMATTER));
                } else {
                    c12.setCellValue("—");
                }
                c12.setCellStyle(centerStyle);
            }

            // Auto-size columns with safety padding
            for (int col = 0; col < headers.length; col++) {
                sheet.autoSizeColumn(col);
                int currentWidth = sheet.getColumnWidth(col);
                sheet.setColumnWidth(col, Math.max(currentWidth + 1200, 3200));
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    private int writeMetadataRow(Sheet sheet, int rowIdx, String label1, String val1, String label2, String val2, CellStyle labelStyle, CellStyle valStyle) {
        Row row = sheet.createRow(rowIdx++);
        row.setHeightInPoints(20);

        Cell c0 = row.createCell(1);
        c0.setCellValue(label1);
        c0.setCellStyle(labelStyle);

        Cell c1 = row.createCell(2);
        c1.setCellValue(val1);
        c1.setCellStyle(valStyle);
        sheet.addMergedRegion(new CellRangeAddress(rowIdx - 1, rowIdx - 1, 2, 4));

        Cell c2 = row.createCell(6);
        c2.setCellValue(label2);
        c2.setCellStyle(labelStyle);

        Cell c3 = row.createCell(7);
        c3.setCellValue(val2);
        c3.setCellStyle(valStyle);
        sheet.addMergedRegion(new CellRangeAddress(rowIdx - 1, rowIdx - 1, 7, 10));

        return rowIdx;
    }

    private String getExportTypeLabel(DriveExportType type) {
        if (type == null) return "Complete Drive Report";
        return switch (type) {
            case ALL_ELIGIBLE -> "All Eligible Students";
            case APPLIED -> "Applied Candidates Only";
            case ELIGIBLE_NOT_APPLIED -> "Eligible But Not Applied Candidates";
            case SELECTED -> "Selected Candidates (Offers Extended)";
            case REJECTED -> "Rejected Candidates";
            case COMPLETE_REPORT -> "Complete Drive Candidate Dataset";
        };
    }

    private CellStyle createBannerStyle(XSSFWorkbook workbook) {
        XSSFCellStyle style = workbook.createCellStyle();
        XSSFFont font = workbook.createFont();
        font.setFontName("Segoe UI");
        font.setBold(true);
        font.setFontHeightInPoints((short) 16);
        font.setColor(new XSSFColor(new byte[]{(byte) 255, (byte) 255, (byte) 255}, null));
        style.setFont(font);
        style.setFillForegroundColor(new XSSFColor(new byte[]{(byte) 15, (byte) 23, (byte) 42}, null)); // Deep Navy #0f172a
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    private CellStyle createHeaderStyle(XSSFWorkbook workbook) {
        XSSFCellStyle style = workbook.createCellStyle();
        XSSFFont font = workbook.createFont();
        font.setFontName("Segoe UI");
        font.setBold(true);
        font.setFontHeightInPoints((short) 10);
        font.setColor(new XSSFColor(new byte[]{(byte) 255, (byte) 255, (byte) 255}, null));
        style.setFont(font);
        style.setFillForegroundColor(new XSSFColor(new byte[]{(byte) 30, (byte) 58, (byte) 138}, null)); // Navy Blue #1e3a8a
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        setBorders(style, IndexedColors.GREY_40_PERCENT.getIndex());
        return style;
    }

    private CellStyle createMetaLabelStyle(XSSFWorkbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setFontName("Segoe UI");
        font.setBold(true);
        font.setFontHeightInPoints((short) 9);
        font.setColor(IndexedColors.GREY_80_PERCENT.getIndex());
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.RIGHT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    private CellStyle createMetaValueStyle(XSSFWorkbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setFontName("Segoe UI");
        font.setBold(true);
        font.setFontHeightInPoints((short) 9);
        font.setColor(IndexedColors.BLACK.getIndex());
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    private CellStyle createDataStyle(XSSFWorkbook workbook, boolean isOdd) {
        XSSFCellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setFontName("Segoe UI");
        font.setFontHeightInPoints((short) 9);
        style.setFont(font);
        if (isOdd) {
            style.setFillForegroundColor(new XSSFColor(new byte[]{(byte) 248, (byte) 250, (byte) 252}, null)); // #f8fafc
            style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        }
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        setBorders(style, IndexedColors.GREY_25_PERCENT.getIndex());
        return style;
    }

    private CellStyle createCenterStyle(XSSFWorkbook workbook) {
        CellStyle style = createDataStyle(workbook, false);
        style.setAlignment(HorizontalAlignment.CENTER);
        return style;
    }

    private CellStyle createStatusBadgeStyle(XSSFWorkbook workbook, byte[] textColor, byte[] bgColor) {
        XSSFCellStyle style = workbook.createCellStyle();
        XSSFFont font = workbook.createFont();
        font.setFontName("Segoe UI");
        font.setBold(true);
        font.setFontHeightInPoints((short) 9);
        font.setColor(new XSSFColor(textColor, null));
        style.setFont(font);
        style.setFillForegroundColor(new XSSFColor(bgColor, null));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        setBorders(style, IndexedColors.GREY_25_PERCENT.getIndex());
        return style;
    }

    private void setBorders(CellStyle style, short color) {
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setTopBorderColor(color);
        style.setBottomBorderColor(color);
        style.setLeftBorderColor(color);
        style.setRightBorderColor(color);
    }
}
