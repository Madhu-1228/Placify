package com.placify.api.service;

import com.placify.api.dto.DriveAnalyticsDto;
import com.placify.api.dto.DriveExportType;
import com.placify.api.dto.DriveStudentDto;
import com.placify.api.dto.EligibilityResultDto;
import com.placify.api.exception.ResourceNotFoundException;
import com.placify.api.model.Application;
import com.placify.api.model.ApplicationStatus;
import com.placify.api.model.CompanyDrive;
import com.placify.api.model.StudentProfile;
import com.placify.api.repository.ApplicationRepository;
import com.placify.api.repository.CompanyDriveRepository;
import com.placify.api.repository.StudentProfileRepository;
import com.placify.api.util.EligibilityEngine;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DriveManagementService {

    @Autowired
    private CompanyDriveRepository companyDriveRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private EligibilityEngine eligibilityEngine;

    @Autowired
    private DriveExcelExportService driveExcelExportService;

    public List<DriveStudentDto> getDriveStudents(String driveId, Boolean eligible, Boolean applied, ApplicationStatus status, String branch, String search) {
        CompanyDrive drive = companyDriveRepository.findById(driveId)
                .orElseThrow(() -> new ResourceNotFoundException("Company drive not found with id: " + driveId));

        List<DriveStudentDto> allDriveStudents = buildAllDriveStudents(drive);

        return allDriveStudents.stream()
                .filter(s -> {
                    // Eligibility Filter
                    if (eligible != null && s.isEligible() != eligible) {
                        return false;
                    }
                    // Applied Filter
                    if (applied != null && s.isApplied() != applied) {
                        return false;
                    }
                    // Application Stage Filter
                    if (status != null) {
                        if (s.getApplicationStatus() == null || s.getApplicationStatus() != status) {
                            return false;
                        }
                    }
                    // Branch / Department Filter
                    if (StringUtils.hasText(branch) && !branch.equalsIgnoreCase("ALL")) {
                        if (s.getDepartment() == null || !s.getDepartment().equalsIgnoreCase(branch.trim())) {
                            return false;
                        }
                    }
                    // Search Term (Name, Roll Number, Email)
                    if (StringUtils.hasText(search)) {
                        String q = search.trim().toLowerCase();
                        boolean nameMatch = s.getName() != null && s.getName().toLowerCase().contains(q);
                        boolean rollMatch = s.getRollNumber() != null && s.getRollNumber().toLowerCase().contains(q);
                        boolean emailMatch = s.getEmail() != null && s.getEmail().toLowerCase().contains(q);
                        if (!nameMatch && !rollMatch && !emailMatch) {
                            return false;
                        }
                    }
                    return true;
                })
                .sorted(Comparator
                        .comparing(DriveStudentDto::isApplied).reversed()
                        .thenComparing(DriveStudentDto::isEligible).reversed()
                        .thenComparing(DriveStudentDto::getCgpa, Comparator.nullsLast(Comparator.reverseOrder()))
                )
                .collect(Collectors.toList());
    }

    public DriveAnalyticsDto getDriveAnalytics(String driveId) {
        CompanyDrive drive = companyDriveRepository.findById(driveId)
                .orElseThrow(() -> new ResourceNotFoundException("Company drive not found with id: " + driveId));

        List<DriveStudentDto> allDriveStudents = buildAllDriveStudents(drive);

        DriveAnalyticsDto dto = new DriveAnalyticsDto();
        dto.setDriveId(drive.getId());
        dto.setCompanyName(drive.getCompanyName());
        dto.setRole(drive.getRole());
        dto.setPackageCtc(drive.getPackageCtc());
        dto.setDriveStatus(drive.getStatus());
        dto.setDriveDate(drive.getDriveDate());
        dto.setApplicationDeadline(drive.getApplicationDeadline());

        long totalStudents = allDriveStudents.size();
        long totalEligible = allDriveStudents.stream().filter(DriveStudentDto::isEligible).count();
        long totalApplied = allDriveStudents.stream().filter(DriveStudentDto::isApplied).count();
        long eligibleAndApplied = allDriveStudents.stream().filter(s -> s.isEligible() && s.isApplied()).count();
        long eligibleNotApplied = allDriveStudents.stream().filter(s -> s.isEligible() && !s.isApplied()).count();
        long ineligibleCount = totalStudents - totalEligible;

        long underReviewCount = allDriveStudents.stream().filter(s -> s.getApplicationStatus() == ApplicationStatus.UNDER_REVIEW).count();
        long testCount = allDriveStudents.stream().filter(s -> s.getApplicationStatus() == ApplicationStatus.TEST).count();
        long interviewCount = allDriveStudents.stream().filter(s -> s.getApplicationStatus() == ApplicationStatus.INTERVIEW).count();
        long selectedCount = allDriveStudents.stream().filter(s -> s.getApplicationStatus() == ApplicationStatus.SELECTED).count();
        long rejectedCount = allDriveStudents.stream().filter(s -> s.getApplicationStatus() == ApplicationStatus.REJECTED).count();

        double applicationRate = totalEligible > 0 ? Math.round((eligibleAndApplied * 100.0 / totalEligible) * 10.0) / 10.0 : 0.0;
        double selectionRate = totalApplied > 0 ? Math.round((selectedCount * 100.0 / totalApplied) * 10.0) / 10.0 : 0.0;

        // CGPA Averages
        double avgCgpaTotal = allDriveStudents.stream().mapToDouble(s -> s.getCgpa() != null ? s.getCgpa() : 0.0).average().orElse(0.0);
        double avgCgpaEligible = allDriveStudents.stream().filter(DriveStudentDto::isEligible).mapToDouble(s -> s.getCgpa() != null ? s.getCgpa() : 0.0).average().orElse(0.0);
        double avgCgpaApplied = allDriveStudents.stream().filter(DriveStudentDto::isApplied).mapToDouble(s -> s.getCgpa() != null ? s.getCgpa() : 0.0).average().orElse(0.0);
        double avgCgpaSelected = allDriveStudents.stream().filter(s -> s.getApplicationStatus() == ApplicationStatus.SELECTED).mapToDouble(s -> s.getCgpa() != null ? s.getCgpa() : 0.0).average().orElse(0.0);

        dto.setTotalStudents(totalStudents);
        dto.setTotalEligible(totalEligible);
        dto.setTotalApplied(totalApplied);
        dto.setEligibleAndApplied(eligibleAndApplied);
        dto.setEligibleNotApplied(eligibleNotApplied);
        dto.setIneligibleCount(ineligibleCount);

        dto.setUnderReviewCount(underReviewCount);
        dto.setTestCount(testCount);
        dto.setInterviewCount(interviewCount);
        dto.setSelectedCount(selectedCount);
        dto.setRejectedCount(rejectedCount);

        dto.setApplicationRate(applicationRate);
        dto.setSelectionRate(selectionRate);

        dto.setAvgCgpaTotal(Math.round(avgCgpaTotal * 100.0) / 100.0);
        dto.setAvgCgpaEligible(Math.round(avgCgpaEligible * 100.0) / 100.0);
        dto.setAvgCgpaApplied(Math.round(avgCgpaApplied * 100.0) / 100.0);
        dto.setAvgCgpaSelected(Math.round(avgCgpaSelected * 100.0) / 100.0);

        // Branch Breakdown
        Map<String, List<DriveStudentDto>> branchMap = allDriveStudents.stream()
                .filter(s -> StringUtils.hasText(s.getDepartment()))
                .collect(Collectors.groupingBy(DriveStudentDto::getDepartment));

        List<DriveAnalyticsDto.BranchDriveStat> branchStats = new ArrayList<>();
        for (Map.Entry<String, List<DriveStudentDto>> entry : branchMap.entrySet()) {
            String branchName = entry.getKey();
            List<DriveStudentDto> list = entry.getValue();
            long bEligible = list.stream().filter(DriveStudentDto::isEligible).count();
            long bApplied = list.stream().filter(DriveStudentDto::isApplied).count();
            long bSelected = list.stream().filter(s -> s.getApplicationStatus() == ApplicationStatus.SELECTED).count();
            branchStats.add(new DriveAnalyticsDto.BranchDriveStat(branchName, bEligible, bApplied, bSelected));
        }

        branchStats.sort(Comparator.comparing(DriveAnalyticsDto.BranchDriveStat::getEligibleCount).reversed());
        dto.setBranchStats(branchStats);

        return dto;
    }

    public byte[] exportDriveStudentsExcel(String driveId, DriveExportType exportType) throws IOException {
        CompanyDrive drive = companyDriveRepository.findById(driveId)
                .orElseThrow(() -> new ResourceNotFoundException("Company drive not found with id: " + driveId));

        List<DriveStudentDto> allStudents = buildAllDriveStudents(drive);

        // Apply Export Filtering
        List<DriveStudentDto> filteredStudents = switch (exportType != null ? exportType : DriveExportType.COMPLETE_REPORT) {
            case ALL_ELIGIBLE -> allStudents.stream().filter(DriveStudentDto::isEligible).collect(Collectors.toList());
            case APPLIED -> allStudents.stream().filter(DriveStudentDto::isApplied).collect(Collectors.toList());
            case ELIGIBLE_NOT_APPLIED -> allStudents.stream().filter(s -> s.isEligible() && !s.isApplied()).collect(Collectors.toList());
            case SELECTED -> allStudents.stream().filter(s -> s.getApplicationStatus() == ApplicationStatus.SELECTED).collect(Collectors.toList());
            case REJECTED -> allStudents.stream().filter(s -> s.getApplicationStatus() == ApplicationStatus.REJECTED).collect(Collectors.toList());
            case COMPLETE_REPORT -> allStudents;
        };

        filteredStudents.sort(Comparator
                .comparing(DriveStudentDto::isApplied).reversed()
                .thenComparing(DriveStudentDto::isEligible).reversed()
                .thenComparing(DriveStudentDto::getCgpa, Comparator.nullsLast(Comparator.reverseOrder()))
        );

        return driveExcelExportService.generateDriveStudentsExcel(drive, filteredStudents, exportType);
    }

    private List<DriveStudentDto> buildAllDriveStudents(CompanyDrive drive) {
        List<StudentProfile> allProfiles = studentProfileRepository.findAll();
        List<Application> driveApplications = applicationRepository.findByDriveId(drive.getId());

        // Map applications by studentId (and fallback by userId)
        Map<String, Application> appByStudentId = new HashMap<>();
        Map<String, Application> appByUserId = new HashMap<>();
        for (Application app : driveApplications) {
            if (StringUtils.hasText(app.getStudentId())) {
                appByStudentId.put(app.getStudentId(), app);
            }
            if (StringUtils.hasText(app.getUserId())) {
                appByUserId.put(app.getUserId(), app);
            }
        }

        List<DriveStudentDto> results = new ArrayList<>();

        for (StudentProfile profile : allProfiles) {
            DriveStudentDto dto = new DriveStudentDto();
            dto.setStudentId(profile.getId());
            dto.setUserId(profile.getUserId());
            dto.setName(profile.getName());
            dto.setRollNumber(profile.getRollNumber());
            dto.setEmail(profile.getEmail());
            dto.setPhone(profile.getPhone());
            dto.setDepartment(profile.getDepartment());
            dto.setSection(profile.getSection());
            dto.setYear(profile.getYear());
            dto.setSemester(profile.getSemester());
            dto.setCgpa(profile.getCgpa());
            dto.setBacklogs(profile.getBacklogs());
            dto.setSkills(profile.getSkills());
            dto.setResumeUrl(profile.getResumeUrl());

            // Evaluate Eligibility against Drive Criteria
            EligibilityResultDto eligibility = eligibilityEngine.evaluate(profile, drive);
            dto.setEligible(eligibility.isEligible());
            dto.setMatchPercentage(eligibility.getMatchPercentage());
            dto.setPassedCriteria(eligibility.getPassedCriteria());
            dto.setEligibilityReasons(eligibility.getReasons());
            dto.setMissingSkills(eligibility.getMissingSkills());

            // Check Application Submission
            Application app = appByStudentId.get(profile.getId());
            if (app == null && StringUtils.hasText(profile.getUserId())) {
                app = appByUserId.get(profile.getUserId());
            }

            if (app != null) {
                dto.setApplied(true);
                dto.setApplicationId(app.getId());
                dto.setApplicationStatus(app.getStatus());
                dto.setAppliedAt(app.getAppliedAt());
                dto.setNotes(app.getNotes());
                if (StringUtils.hasText(app.getResumeUrl())) {
                    dto.setResumeUrl(app.getResumeUrl());
                }
                if (StringUtils.hasText(app.getStudentName())) {
                    dto.setName(app.getStudentName());
                }
                if (StringUtils.hasText(app.getStudentRollNumber())) {
                    dto.setRollNumber(app.getStudentRollNumber());
                }
                if (StringUtils.hasText(app.getStudentDepartment())) {
                    dto.setDepartment(app.getStudentDepartment());
                }
                if (StringUtils.hasText(app.getStudentEmail())) {
                    dto.setEmail(app.getStudentEmail());
                }
                if (StringUtils.hasText(app.getStudentPhone())) {
                    dto.setPhone(app.getStudentPhone());
                }
                if (app.getStudentCgpa() != null) {
                    dto.setCgpa(app.getStudentCgpa());
                }
                if (app.getStudentBacklogs() != null) {
                    dto.setBacklogs(app.getStudentBacklogs());
                }
            } else {
                dto.setApplied(false);
                dto.setApplicationId(null);
                dto.setApplicationStatus(null);
                dto.setAppliedAt(null);
                dto.setNotes(null);
            }

            results.add(dto);
        }

        return results;
    }
}
