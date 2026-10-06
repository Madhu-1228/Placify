import api from './api';

export const studentService = {
  getProfile: async () => {
    const res = await api.get('/students/profile');
    return res.data.data;
  },

  updateProfile: async (profileData) => {
    const res = await api.put('/students/profile', profileData);
    return res.data.data;
  },

  // Admin APIs
  getAllStudents: async (params) => {
    const res = await api.get('/admin/students', { params });
    return res.data.data;
  },

  createStudent: async (studentData) => {
    const res = await api.post('/admin/students', studentData);
    return res.data.data;
  },

  getStudentDetail: async (id) => {
    const res = await api.get(`/admin/students/${id}`);
    return res.data.data;
  },

  toggleStatus: async (id, active) => {
    const res = await api.patch(`/admin/students/${id}/status`, null, { params: { active } });
    return res.data;
  }
};
