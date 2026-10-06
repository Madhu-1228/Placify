import api from './api';

export const resumeService = {
  analyzeResume: async (file, targetSkills = []) => {
    const formData = new FormData();
    formData.append('file', file);
    if (targetSkills && targetSkills.length > 0) {
      targetSkills.forEach((skill) => formData.append('targetSkills', skill));
    }

    const res = await api.post('/resume/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 90000, // 90s dedicated timeout for Gemini AI evaluation
    });
    return res.data.data;
  },

  getLatest: async () => {
    const res = await api.get('/resume/latest');
    return res.data.data;
  },

  getHistory: async () => {
    const res = await api.get('/resume/history');
    return res.data.data;
  }
};
