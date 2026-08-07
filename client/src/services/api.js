import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds
});

// Helper for calling endpoints
export const uploadRawImage = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('image', file);
  return api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress
  });
};

export const generateFrame = async (fileOrUrl, enhance, onUploadProgress) => {
  const formData = new FormData();
  if (typeof fileOrUrl === 'string') {
    formData.append('photoUrl', fileOrUrl);
  } else {
    formData.append('image', fileOrUrl);
  }
  formData.append('enhance', enhance);

  return api.post('/generate/frame', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress
  });
};

export const generateCard = async (fileOrUrl, details, enhance, onUploadProgress) => {
  const formData = new FormData();
  if (typeof fileOrUrl === 'string') {
    formData.append('photoUrl', fileOrUrl);
  } else {
    formData.append('image', fileOrUrl);
  }
  formData.append('name', details.name);
  formData.append('role', details.role);
  formData.append('stack', details.stack);
  formData.append('enhance', enhance);

  return api.post('/generate/card', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress
  });
};

export const getBadgeMetadata = async (shareId) => {
  return api.get(`/image/${shareId}`);
};

export const deleteBadge = async (shareId) => {
  return api.delete(`/image/${shareId}`);
};

export const getRecentBadges = async () => {
  return api.get('/gallery');
};

export default api;
