import api from './api';

export const notificationService = {
  getNotifications: async () => {
    const res = await api.get('/notifications');
    return res.data.data;
  },

  markAsRead: async (id) => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async () => {
    const res = await api.patch('/notifications/mark-all-read');
    return res.data;
  },

  broadcastDriveCircular: async (payload) => {
    const res = await api.post('/notifications/broadcast-drive-circular', payload);
    return res.data.data;
  }
};
