import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (data) => api.post('/auth/login', data);
export const signup = (data) => api.post('/auth/signup', data);
export const getMe = () => api.get('/auth/me');

export const getDocuments = (params) => api.get('/documents', { params });
export const getDocument = (id) => api.get(`/documents/${id}`);
export const uploadDocument = (data) => api.post('/documents', data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const updateDocument = (id, data) => api.put(`/documents/${id}`, data);
export const deleteDocument = (id) => api.delete(`/documents/${id}`);
export const getDocumentFile = (id) => api.get(`/documents/${id}/file`, { responseType: 'blob' });
export const getStats = () => api.get('/documents/stats');

export const getSearchHistory = () => api.get('/history/search');
export const recordSearch = (data) => api.post('/history/search', data);
export const clearSearchHistory = () => api.delete('/history/search');
export const getActivityHistory = (params) => api.get('/history/activity', { params });

export const getProfile = () => api.get('/users/profile');
export const updateProfile = (data) => api.put('/users/profile', data);

export default api;
