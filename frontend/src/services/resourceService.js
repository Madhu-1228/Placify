import api from './api';

export const resourceService = {
  getAllResources: async (params) => {
    const res = await api.get('/resources', { params });
    return res.data.data;
  },

  createResource: async (resourceData) => {
    const res = await api.post('/resources', resourceData);
    return res.data.data;
  },

  deleteResource: async (id) => {
    const res = await api.delete(`/resources/${id}`);
    return res.data;
  },

  toggleComplete: async (id) => {
    const res = await api.post(`/resources/${id}/toggle-complete`);
    return res.data.data;
  }
};
