package com.placify.api;

import com.placify.api.dto.DriveExportType;
import com.placify.api.dto.DriveStudentDto;
import com.placify.api.model.ApplicationStatus;
import com.placify.api.model.CompanyDrive;
import com.placify.api.model.DriveStatus;
import com.placify.api.service.DriveExcelExportService;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class DriveManagementTest {

    @Test
    public void testExcelGenerationWithApachePoi() throws IOException {
        DriveExcelExportService service = new DriveExcelExportService();

        CompanyDrive drive = new CompanyDrive();
        drive.setId("drive_test_101");
        drive.setCompanyName("ABC Technologies");
        drive.setRole("Java Developer");
        drive.setPackageCtc("12.0 LPA");
        drive.setMinimumCgpa(7.5);
        drive.setMaximumBacklogs(0);
        drive.setStatus(DriveStatus.OPEN);
        drive.setDriveDate("15-Sep-2026");

        List<DriveStudentDto> students = new ArrayList<>();

        DriveStudentDto s1 = new DriveStudentDto();
        s1.setStudentId("s1");
        s1.setName("Madhu Devanaboyina");
        s1.setRollNumber("23BQ1A1228");
        s1.setEmail("23bq1a1228@vvit.net");
        s1.setPhone("+91 98765 43210");
        s1.setDepartment("Information Technology");
        s1.setCgpa(8.85);
        s1.setBacklogs(0);
        s1.setEligible(true);
        s1.setMatchPercentage(100.0);
        s1.setApplied(true);
        s1.setApplicationStatus(ApplicationStatus.SELECTED);
        s1.setAppliedAt(Instant.now());
        students.add(s1);

        DriveStudentDto s2 = new DriveStudentDto();
        s2.setStudentId("s2");
        s2.setName("Priya Sharma");
        s2.setRollNumber("23BQ1A0512");
        s2.setEmail("23bq1a0512@vvit.net");
        s2.setPhone("+91 98765 43211");
        s2.setDepartment("Computer Science and Engineering");
        s2.setCgpa(7.90);
        s2.setBacklogs(0);
        s2.setEligible(true);
        s2.setMatchPercentage(90.0);
        s2.setApplied(false);
        s2.setApplicationStatus(null);
        students.add(s2);

        byte[] excelBytes = service.generateDriveStudentsExcel(drive, students, DriveExportType.COMPLETE_REPORT);
        assertNotNull(excelBytes);
        assertTrue(excelBytes.length > 0);

        // Verify with POI parser
        try (Workbook wb = new XSSFWorkbook(new ByteArrayInputStream(excelBytes))) {
            Sheet sheet = wb.getSheet("Drive Candidates Report");
            assertNotNull(sheet);
            assertEquals("PLACIFY — CAMPUS RECRUITMENT PLACEMENT DRIVE REPORT", sheet.getRow(0).getCell(0).getStringCellValue());
            assertTrue(sheet.getLastRowNum() >= 7);
        }
    }
}
