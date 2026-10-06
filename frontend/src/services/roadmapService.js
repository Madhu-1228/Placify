import api from './api';

export const roadmapService = {
  getCurrentRoadmap: async () => {
    const res = await api.get('/roadmap/current');
    return res.data.data;
  },

  generateRoadmap: async ({ targetRole, targetDriveId, durationDays, regenerate = false }) => {
    const res = await api.post('/roadmap/generate', {
      targetRole,
      targetDriveId,
      durationDays: parseInt(durationDays, 10) || 30,
      regenerate
    }, {
      timeout: 90000 // 90s timeout for Gemini AI generation
    });
    return res.data.data;
  },

  updateTaskStatus: async (roadmapId, taskId, status) => {
    const res = await api.put(`/roadmap/${roadmapId}/tasks/${taskId}/status`, {
      status
    });
    return res.data.data;
  },

  getTargetRoles: async () => {
    const res = await api.get('/roadmap/target-roles');
    return res.data.data;
  }
};
