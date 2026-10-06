import api from './api';

export const applicationService = {
  applyForDrive: async (driveId, formData = {}) => {
    const payload = typeof formData === 'string' ? { notes: formData } : formData;
    const res = await api.post(`/applications/apply/${driveId}`, payload);
    return res.data.data;
  },

  apply: async (driveId, formData = {}) => {
    const payload = typeof formData === 'string' ? { notes: formData } : formData;
    const res = await api.post(`/applications/apply/${driveId}`, payload);
    return res.data.data;
  },

  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/upload/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data.data;
  },

  getMyApplications: async () => {
    const res = await api.get('/applications/my-applications');
    return res.data.data;
  },

  getApplicationsForDrive: async (driveId) => {
    const res = await api.get(`/applications/drive/${driveId}`);
    return res.data.data;
  },

  getAllApplications: async (params) => {
    const res = await api.get('/applications', { params });
    return res.data.data;
  },

  updateStatus: async (id, status, notes = '') => {
    const res = await api.patch(`/applications/${id}/status`, { status, notes });
    return res.data.data;
  }
};
