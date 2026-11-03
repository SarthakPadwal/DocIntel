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
    uploaded_at: '2026-10-20T10:00:00Z',
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
    uploaded_at: '2026-09-05T14:20:00Z',
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
    uploaded_at: '2026-10-02T09:15:00Z',
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
    uploaded_at: '2026-10-12T11:45:00Z',
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
        let storedUser = null;
        try {
          const raw = localStorage.getItem('demo-user');
          if (raw) storedUser = JSON.parse(raw);
        } catch (e) {}

        const defaultUser = {
          id: 1,
          name: 'John Doe',
          email: 'admin@docintel.com',
          phone: '+1 (555) 019-8234',
          role: 'ADMIN',
          department: 'Executive Administration',
          designation: 'Root System Administrator'
        };

        const activeUser = { ...defaultUser, ...(storedUser || {}) };

        // Handle PUT /users/profile (Edit Personal Details)
        if (error.config?.method?.toLowerCase() === 'put') {
          let updates = {};
          try {
            updates = typeof error.config.data === 'string' ? JSON.parse(error.config.data) : (error.config.data || {});
          } catch (e) {}

          const updatedUser = {
            ...activeUser,
            name: updates.name ? updates.name.trim() : activeUser.name,
            phone: updates.phone !== undefined ? updates.phone.trim() : activeUser.phone,
            department: updates.department !== undefined ? updates.department.trim() : activeUser.department,
            designation: updates.designation !== undefined ? updates.designation.trim() : activeUser.designation
          };

          localStorage.setItem('demo-user', JSON.stringify(updatedUser));

          return Promise.resolve({
            data: {
              success: true,
              message: 'Profile updated successfully',
              data: { user: updatedUser }
            }
          });
        }

        // Handle GET /users/profile
        return Promise.resolve({
          data: {
            success: true,
            data: {
              user: activeUser,
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
                  'Intelligent Extraction Engine & Metadata Oversight',
                  'User Management & Role Permissions Administration',
                  'Enterprise Workflow & Chronometry Configuration',
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

      // Search History & Recent Activity Handling (Persists in localStorage across logouts)
      if (url.includes('/history/search')) {
        const method = error.config?.method?.toLowerCase();
        let currentSearches = [];
        try {
          const raw = localStorage.getItem('docintel_search_history');
          if (raw) currentSearches = JSON.parse(raw);
        } catch (e) {}

        if (!currentSearches || !currentSearches.length) {
          currentSearches = [
            { id: 1, search_query: 'Apex Global Logistics', searched_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(), result_count: 1 },
            { id: 2, search_query: 'Invoice', searched_at: new Date(Date.now() - 1000 * 60 * 65).toISOString(), result_count: 1 },
            { id: 3, search_query: 'Solar Tender', searched_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(), result_count: 1 },
            { id: 4, search_query: 'Quantum Systems', searched_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(), result_count: 1 }
          ];
          localStorage.setItem('docintel_search_history', JSON.stringify(currentSearches));
        }

        if (method === 'post') {
          let postData = {};
          try {
            postData = typeof error.config.data === 'string' ? JSON.parse(error.config.data) : (error.config.data || {});
          } catch (e) {}
          const newTerm = (postData.query || '').trim();
          if (newTerm) {
            const filtered = currentSearches.filter(s => (s.search_query || '').toLowerCase() !== newTerm.toLowerCase());
            const updated = [
              { id: Date.now(), search_query: newTerm, searched_at: new Date().toISOString(), result_count: 1 },
              ...filtered
            ].slice(0, 20);
            localStorage.setItem('docintel_search_history', JSON.stringify(updated));
            return Promise.resolve({ data: { success: true, data: { history: updated } } });
          }
          return Promise.resolve({ data: { success: true, data: { history: currentSearches } } });
        }

        if (method === 'delete') {
          localStorage.setItem('docintel_search_history', JSON.stringify([]));
          return Promise.resolve({ data: { success: true, message: 'Search history cleared', data: { history: [] } } });
        }

        return Promise.resolve({
          data: {
            success: true,
            data: { history: currentSearches }
          }
        });
      }

      if (url.includes('/history/activity') || url.includes('/history')) {
        let currentActivities = [];
        try {
          const raw = localStorage.getItem('docintel_recent_activity');
          if (raw) currentActivities = JSON.parse(raw);
        } catch (e) {}

        if (!currentActivities || !currentActivities.length) {
          currentActivities = [
            { id: 101, action: 'UPLOAD', document_name: 'Apex_Global_Logistics_Invoice_Nov2026.pdf', document_id: 1, company_name: 'Apex Global Logistics', created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(), user_role: 'ADMIN' },
            { id: 102, action: 'VIEW', document_name: 'Quantum_Cloud_Procurement_Agreement.pdf', document_id: 2, company_name: 'Quantum Systems Inc', created_at: new Date(Date.now() - 1000 * 60 * 55).toISOString(), user_role: 'ADMIN' },
            { id: 103, action: 'EDIT_META', document_name: 'Metropolitan_Tender_Solar_Project.pdf', document_id: 3, company_name: 'Metropolitan Energy Dept', created_at: new Date(Date.now() - 1000 * 60 * 140).toISOString(), user_role: 'ADMIN' },
            { id: 104, action: 'VIEW', document_name: 'Nexus_Supply_Chain_Quotation_Q4.pdf', document_id: 4, company_name: 'Nexus Tech Supplies', created_at: new Date(Date.now() - 1000 * 60 * 280).toISOString(), user_role: 'ADMIN' }
          ];
          localStorage.setItem('docintel_recent_activity', JSON.stringify(currentActivities));
        }

        return Promise.resolve({
          data: {
            success: true,
            data: { history: currentActivities }
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
