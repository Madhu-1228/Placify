import api from './api';

export const driveService = {
  getAllDrives: async (params) => {
    const res = await api.get('/drives', { params });
    return res.data.data;
  },

  getDriveById: async (id) => {
    const res = await api.get(`/drives/${id}`);
    return res.data.data;
  },

  getEligibleDrives: async () => {
    const res = await api.get('/drives/eligible');
    return res.data.data;
  },

  checkEligibility: async (driveId) => {
    const res = await api.get(`/drives/${driveId}/eligibility`);
    return res.data.data;
  },

  createDrive: async (driveData) => {
    const res = await api.post('/drives', driveData);
    return res.data.data;
  },

  updateDrive: async (id, driveData) => {
    const res = await api.put(`/drives/${id}`, driveData);
    return res.data.data;
  },

  deleteDrive: async (id) => {
    const res = await api.delete(`/drives/${id}`);
    return res.data;
  },

  updateDriveStatus: async (id, status) => {
    const res = await api.patch(`/drives/${id}/status`, null, { params: { status } });
    return res.data.data;
  }
};
