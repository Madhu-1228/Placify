import api from './api';

export const aiService = {
  // Send message with conversation history
  sendMessage: async (message, history = []) => {
    const res = await api.post('/ai/chat', { message, history });
    return res.data?.data;
  },

  // Get contextual starter suggestions
  getSuggestions: async () => {
    const res = await api.get('/ai/suggestions');
    return res.data?.data || [];
  },
};
