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

// Demo fallback data for GitHub Pages static showcase
const sampleDocuments = [
  {
    id: 1,
    original_filename: 'Apex_Global_Logistics_Invoice_Nov2026.pdf',
    document_type: 'Invoice',
    status: 'PENDING',
    processing_status: 'PROCESSED',
    company_name: 'Apex Global Logistics',
    info_document_date: '2026-10-15',
    info_due_date: '2026-11-08',
    document_date: '2026-10-15',
    due_date: '2026-11-08',
    created_at: '2026-10-20T10:00:00Z',
    file_size: 142500
  },
  {
    id: 2,
    original_filename: 'Quantum_Cloud_Procurement_Agreement.pdf',
    document_type: 'Agreement',
    status: 'DONE',
    processing_status: 'PROCESSED',
    company_name: 'Quantum Systems Inc',
    info_document_date: '2026-09-01',
    info_due_date: '2026-11-14',
    document_date: '2026-09-01',
    due_date: '2026-11-14',
    created_at: '2026-09-05T14:20:00Z',
    file_size: 285400
  },
  {
    id: 3,
    original_filename: 'Metropolitan_Tender_Solar_Project.pdf',
    document_type: 'Tender',
    status: 'PENDING',
    processing_status: 'PROCESSED',
    company_name: 'Metropolitan Energy Dept',
    info_document_date: '2026-10-01',
    info_due_date: '2026-10-25',
    document_date: '2026-10-01',
    due_date: '2026-10-25',
    created_at: '2026-10-02T09:15:00Z',
    file_size: 512000
  },
  {
    id: 4,
    original_filename: 'Nexus_Supply_Chain_Quotation_Q4.pdf',
    document_type: 'Quotation',
    status: 'DONE',
    processing_status: 'PROCESSED',
    company_name: 'Nexus Tech Supplies',
    info_document_date: '2026-10-10',
    info_due_date: '2026-11-10',
    document_date: '2026-10-10',
    due_date: '2026-11-10',
    created_at: '2026-10-12T11:45:00Z',
    file_size: 98400
  }
];

const isGitHubPages = typeof window !== 'undefined' && window.location.hostname.includes('github.io');

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isOffline = !error.response || error.code === 'ERR_NETWORK' || isGitHubPages;
    if (isOffline) {
      const url = error.config?.url || '';

      if (url.includes('/documents/stats')) {
        return Promise.resolve({
          data: {
            success: true,
            data: {
              total: 28,
              pending: 6,
              done: 22,
              overdue: 3,
              upcoming: 5
            }
          }
        });
      }

      if (url.includes('/users/profile')) {
        const storedUser = localStorage.getItem('demo-user');
        const user = storedUser ? JSON.parse(storedUser) : {
          id: 1,
          name: 'Sarthak Padwal',
          email: 'sarthakpadwal111@gmail.com',
          phone: '+1 (555) 019-8234',
          role: 'ADMIN',
          department: 'Executive Technology',
          designation: 'Root System Administrator'
        };
        return Promise.resolve({
          data: {
            success: true,
            data: {
              user,
              stats: {
                totalDocuments: 28,
                pendingReview: 6,
                totalUsers: 8,
                auditEvents: 142
              },
              clearance: {
                tier: 'SEC-LVL-4 ROOT CLEARANCE',
                badge: 'Verified Root Administrator',
                scope: 'Global System & Repository Control',
                privileges: [
                  'Full Document Lifecycle Control (Read/Write/Delete/Restore)',
                  'AI OCR & Extraction Microservice Engine Oversight',
                  'User Management & Role Permissions Administration',
                  'Database Schema & System Chronometry Configuration',
                  'Immutable Enterprise Audit Trail Inspection'
                ]
              }
            }
          }
        });
      }

      if (url.includes('/documents')) {
        return Promise.resolve({
          data: {
            success: true,
            data: {
              documents: sampleDocuments,
              pagination: { total: sampleDocuments.length, page: 1, totalPages: 1 }
            }
          }
        });
      }

      if (url.includes('/history')) {
        return Promise.resolve({
          data: {
            success: true,
            data: {
              history: [
                { id: 1, action: 'UPLOAD', timestamp: new Date().toISOString(), details: 'Uploaded Apex_Global_Invoice.pdf' },
                { id: 2, action: 'OCR_EXTRACT', timestamp: new Date().toISOString(), details: 'OCR Extraction completed successfully' }
              ]
            }
          }
        });
      }
    }
    return Promise.reject(error);
  }
);

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
