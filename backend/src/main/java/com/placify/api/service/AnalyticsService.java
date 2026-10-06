package com.placify.api.service;

import com.placify.api.dto.DashboardStatsDto;
import com.placify.api.model.Application;
import com.placify.api.model.ApplicationStatus;
import com.placify.api.model.DriveStatus;
import com.placify.api.model.Role;
import com.placify.api.repository.ApplicationRepository;
import com.placify.api.repository.CompanyDriveRepository;
import com.placify.api.repository.StudentProfileRepository;
import com.placify.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private CompanyDriveRepository companyDriveRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    public DashboardStatsDto getDashboardStatistics() {
        DashboardStatsDto stats = new DashboardStatsDto();

        long totalStudents = userRepository.countByRole(Role.STUDENT);
        long activeStudents = userRepository.countByRoleAndActive(Role.STUDENT, true);
        long totalDrives = companyDriveRepository.count();
        long activeDrives = companyDriveRepository.countByStatus(DriveStatus.OPEN);
        long totalApplications = applicationRepository.count();
        long selectedCount = applicationRepository.countByStatus(ApplicationStatus.SELECTED);

        stats.setTotalStudents(totalStudents);
        stats.setActiveStudents(activeStudents);
        stats.setTotalDrives(totalDrives);
        stats.setActiveDrives(activeDrives);
        stats.setTotalApplications(totalApplications);
        stats.setSelectedStudents(selectedCount);

        double placementPct = totalStudents > 0 ? ((double) selectedCount / totalStudents) * 100.0 : 0.0;
        stats.setPlacementPercentage(Math.round(placementPct * 10.0) / 10.0);

        // Status distribution
        Map<String, Long> statusMap = new HashMap<>();
        for (ApplicationStatus s : ApplicationStatus.values()) {
            statusMap.put(s.name(), applicationRepository.countByStatus(s));
        }
        stats.setStatusDistribution(statusMap);

        // Drives by status
        Map<String, Long> driveStatusMap = new HashMap<>();
        for (DriveStatus ds : DriveStatus.values()) {
            driveStatusMap.put(ds.name(), companyDriveRepository.countByStatus(ds));
        }
        stats.setDrivesByStatus(driveStatusMap);

        // Department-wise selection stats
        List<Application> selectedApps = applicationRepository.findAll().stream()
                .filter(a -> a.getStatus() == ApplicationStatus.SELECTED)
                .toList();

        Map<String, Long> deptMap = new HashMap<>();
        for (Application a : selectedApps) {
            String dept = a.getStudentDepartment() != null ? a.getStudentDepartment() : "General";
            deptMap.put(dept, deptMap.getOrDefault(dept, 0L) + 1);
        }
        stats.setDepartmentWisePlacements(deptMap);

        return stats;
    }
}
