import api from './api';

export const certificateService = {
  // Upload and verify certificate document with student metadata
  uploadCertificate: async (file, metadata = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata.name || metadata.certificateTitle) {
      formData.append('name', metadata.name || metadata.certificateTitle);
    }
    if (metadata.issuer) {
      formData.append('issuer', metadata.issuer);
    }
    if (metadata.issueDate || metadata.year) {
      formData.append('issueDate', metadata.issueDate || metadata.year);
    }
    if (metadata.credentialUrl) {
      formData.append('credentialUrl', metadata.credentialUrl);
    }
    const res = await api.post('/student/certifications/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data?.data;
  },

  // Get all verified student certifications
  getMyCertifications: async () => {
    const res = await api.get('/student/certifications');
    return res.data?.data || [];
  },

  // Delete certificate record
  deleteCertification: async (certId) => {
    const res = await api.delete(`/student/certifications/${certId}`);
    return res.data;
  },
};
