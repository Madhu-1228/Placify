import api from './api';

export const analyticsService = {
  getDashboardStats: async () => {
    const res = await api.get('/admin/dashboard/stats');
    return res.data.data;
  }
};
