import api from './api';

export const quizService = {
  getAllQuizzes: async (params) => {
    const res = await api.get('/quizzes', { params });
    return res.data.data;
  },

  getQuizById: async (id) => {
    const res = await api.get(`/quizzes/${id}`);
    return res.data.data;
  },

  createQuiz: async (quizData) => {
    const res = await api.post('/quizzes', quizData);
    return res.data.data;
  },

  deleteQuiz: async (id) => {
    const res = await api.delete(`/quizzes/${id}`);
    return res.data;
  },

  submitQuiz: async (id, answers) => {
    const res = await api.post(`/quizzes/${id}/submit`, { answers });
    return res.data.data;
  },

  getMyAttempts: async () => {
    const res = await api.get('/quizzes/attempts/my-attempts');
    return res.data.data;
  }
};
