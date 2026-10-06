import api from './api';

export const driveManagementService = {
  // Get all students for a specific drive with optional filters
  getDriveStudents: async (driveId, params = {}) => {
    const response = await api.get(`/admin/drives/${driveId}/students`, { params });
    return response.data.data;
  },

  // Get aggregated pipeline analytics for a specific drive
  getDriveAnalytics: async (driveId) => {
    const response = await api.get(`/admin/drives/${driveId}/analytics`);
    return response.data.data;
  },

  // Download Excel (.xlsx) report from backend
  downloadDriveExcel: async (driveId, exportType = 'COMPLETE_REPORT', fallbackFilename = 'Placement_Drive_Report.xlsx') => {
    const response = await api.get(`/admin/drives/${driveId}/export`, {
      params: { exportType },
      responseType: 'blob'
    });

    // Extract filename from Content-Disposition header if available
    let filename = fallbackFilename;
    const disposition = response.headers['content-disposition'];
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) {
        filename = match[1];
      }
    }

    // Create Blob and trigger browser download
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

    return filename;
  }
};
