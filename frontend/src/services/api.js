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
          phone: '9876543210',
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

      // Helper function to get combined documents list (custom uploaded + samples)
      const getAllDocumentsList = () => {
        let customDocs = [];
        try {
          const raw = localStorage.getItem('docintel_custom_documents');
          if (raw) customDocs = JSON.parse(raw);
        } catch (e) {}
        return [...customDocs, ...sampleDocuments];
      };

      // 1. Download/View original file blob
      if (url.match(/\/documents\/\d+\/file/)) {
        const dummyPdf = new Blob(
          ['%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>\nendobj\n4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n5 0 obj\n<< /Length 68 >>\nstream\nBT\n/F1 18 Tf\n100 700 Td\n(DocIntel Verified Enterprise Document Record) Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000117 00000 n \n0000000224 00000 n \n0000000305 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n424\n%%EOF'],
          { type: 'application/pdf' }
        );
        return Promise.resolve({ data: dummyPdf });
      }

      // 2. Single Document Details (GET /documents/:id, e.g. /documents/3)
      const singleDocMatch = url.match(/\/documents\/(\d+)$/);
      if (singleDocMatch && (!error.config?.method || error.config.method.toLowerCase() === 'get')) {
        const docId = parseInt(singleDocMatch[1], 10);
        const allDocs = getAllDocumentsList();
        const found = allDocs.find(d => Number(d.id) === docId) || allDocs.find(d => String(d.id) === String(docId)) || allDocs[0];
        
        return Promise.resolve({
          data: {
            success: true,
            data: {
              document: {
                ...found,
                extracted_text: found.extracted_text || `DOCUMENT AUDIT & ATTRIBUTE SUMMARY\n\nDocument ID: DOC-${String(found.id).padStart(4, '0')}\nOriginal Filename: ${found.original_filename}\nCompany Entity: ${found.company_name || 'Enterprise Associate'}\nClassification: ${found.document_type || 'General'}\nDocument Date: ${found.document_date || found.uploaded_at || '2026-10-15'}\nDue Date: ${found.due_date || '2026-11-14'}\nLifecycle Status: ${found.status}\nInvoice Amount: ${found.currency === 'USD' ? '$' : '₹'}${found.amount ? Number(found.amount).toLocaleString() : '48,500.00'}\nTax Identifier / GSTIN: 27AABCT3518Q1ZV\nPayment Milestone Terms: Net 30 Days\nAudit Clearance: SEC-LVL-4 Verified\nDigital Seal: Validated Integrity Checksum SHA-256`,
                raw_text: found.raw_text || `Document Index: ${found.original_filename}\nOrganization: ${found.company_name}\nType: ${found.document_type}\nStatus: ${found.status}`,
                file_path: found.file_path || `uploads/documents/${found.original_filename}`
              }
            }
          }
        });
      }

      // 3. Upload Document (POST /documents)
      if (url.includes('/documents') && error.config?.method?.toLowerCase() === 'post') {
        let uploadedFilename = 'Uploaded_Document_' + new Date().toISOString().slice(0, 10) + '.pdf';
        let docType = 'Invoice';
        let dueDate = new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().slice(0, 10);
        let company = 'Enterprise Intake';

        if (error.config?.data instanceof FormData) {
          const fileObj = error.config.data.get('document');
          if (fileObj && fileObj.name) uploadedFilename = fileObj.name;
          if (error.config.data.get('document_type')) docType = error.config.data.get('document_type');
          if (error.config.data.get('due_date')) dueDate = error.config.data.get('due_date');
        }

        const newDocId = Date.now();
        const newDoc = {
          id: newDocId,
          original_filename: uploadedFilename,
          document_type: docType,
          status: 'PENDING',
          processing_status: 'PROCESSED',
          company_name: company,
          info_document_date: new Date().toISOString().slice(0, 10),
          info_due_date: dueDate,
          document_date: new Date().toISOString().slice(0, 10),
          due_date: dueDate,
          created_at: new Date().toISOString(),
          uploaded_at: new Date().toISOString(),
          file_size: 245000,
          extracted_text: `DOCUMENT AUDIT & ATTRIBUTE SUMMARY\n\nDocument ID: DOC-${String(newDocId).slice(-4)}\nOriginal Filename: ${uploadedFilename}\nCompany Entity: ${company}\nClassification: ${docType}\nDocument Date: ${new Date().toISOString().slice(0, 10)}\nDue Date: ${dueDate}\nLifecycle Status: PENDING\nAudit Clearance: Verified Intake Registration`,
          raw_text: `Document Intake: ${uploadedFilename}\nType: ${docType}\nStatus: PENDING`
        };

        // Persist to custom documents in localStorage
        let customDocs = [];
        try {
          const raw = localStorage.getItem('docintel_custom_documents');
          if (raw) customDocs = JSON.parse(raw);
        } catch (e) {}
        customDocs.unshift(newDoc);
        localStorage.setItem('docintel_custom_documents', JSON.stringify(customDocs));

        // Also add to recent activity
        let activities = [];
        try {
          const rawAct = localStorage.getItem('docintel_recent_activity');
          if (rawAct) activities = JSON.parse(rawAct);
        } catch (e) {}
        activities.unshift({
          id: Date.now(),
          action: 'UPLOAD',
          document_name: newDoc.original_filename,
          document_id: newDoc.id,
          company_name: newDoc.company_name,
          created_at: new Date().toISOString(),
          user_role: 'ADMIN'
        });
        localStorage.setItem('docintel_recent_activity', JSON.stringify(activities));

        return Promise.resolve({
          data: {
            success: true,
            message: 'Document uploaded successfully',
            data: { document: newDoc }
          }
        });
      }

      // 4. Update Document (PUT /documents/:id)
      if (url.match(/\/documents\/\d+/) && error.config?.method?.toLowerCase() === 'put') {
        let updates = {};
        try {
          updates = typeof error.config.data === 'string' ? JSON.parse(error.config.data) : (error.config.data || {});
        } catch (e) {}

        const docId = parseInt(url.match(/\/documents\/(\d+)/)[1], 10);
        let customDocs = [];
        try {
          const raw = localStorage.getItem('docintel_custom_documents');
          if (raw) customDocs = JSON.parse(raw);
        } catch (e) {}

        const index = customDocs.findIndex(d => Number(d.id) === docId);
        let updatedDoc = null;
        if (index !== -1) {
          customDocs[index] = { ...customDocs[index], ...updates };
          updatedDoc = customDocs[index];
          localStorage.setItem('docintel_custom_documents', JSON.stringify(customDocs));
        } else {
          const sampleFound = sampleDocuments.find(d => Number(d.id) === docId) || sampleDocuments[0];
          updatedDoc = { ...sampleFound, ...updates };
        }

        return Promise.resolve({
          data: {
            success: true,
            message: 'Document updated successfully',
            data: { document: updatedDoc }
          }
        });
      }

      // 5. Delete Document (DELETE /documents/:id)
      if (url.match(/\/documents\/\d+/) && error.config?.method?.toLowerCase() === 'delete') {
        const docId = parseInt(url.match(/\/documents\/(\d+)/)[1], 10);
        let customDocs = [];
        try {
          const raw = localStorage.getItem('docintel_custom_documents');
          if (raw) customDocs = JSON.parse(raw);
        } catch (e) {}
        customDocs = customDocs.filter(d => Number(d.id) !== docId);
        localStorage.setItem('docintel_custom_documents', JSON.stringify(customDocs));

        return Promise.resolve({
          data: {
            success: true,
            message: 'Document deleted successfully'
          }
        });
      }

      // 6. Get Documents List with Real Search, Priority Matching, Filter, and Sort (GET /documents)
      if (url.includes('/documents')) {
        const params = error.config?.params || {};
        const searchTerm = (params.search || '').trim().toLowerCase();
        const typeFilter = (params.document_type || '').trim().toLowerCase();
        const statusFilter = (params.status || '').trim().toLowerCase();
        const sortOption = (params.sort || 'newest').trim().toLowerCase();

        let docs = getAllDocumentsList();

        // Filter by Document Type
        if (typeFilter) {
          docs = docs.filter(d => (d.document_type || '').toLowerCase() === typeFilter);
        }

        // Filter by Status
        if (statusFilter) {
          docs = docs.filter(d => (d.status || '').toLowerCase() === statusFilter);
        }

        // Search & Priority Ranking
        if (searchTerm) {
          docs = docs.filter(d => {
            const fname = (d.original_filename || '').toLowerCase();
            const comp = (d.company_name || '').toLowerCase();
            const dtype = (d.document_type || '').toLowerCase();
            const dstatus = (d.status || '').toLowerCase();
            const did = String(d.id || '');
            return fname.includes(searchTerm) || comp.includes(searchTerm) || dtype.includes(searchTerm) || dstatus.includes(searchTerm) || did.includes(searchTerm);
          });

          // Prioritize exact/prefix matches to appear at position 0!
          // (e.g. searching 'nexus' places 'Nexus Supply Chain' / 'Nexus Tech Supplies' first)
          docs.sort((a, b) => {
            const aComp = (a.company_name || '').toLowerCase();
            const bComp = (b.company_name || '').toLowerCase();
            const aName = (a.original_filename || '').toLowerCase();
            const bName = (b.original_filename || '').toLowerCase();

            const aStarts = aComp.startsWith(searchTerm) || aName.startsWith(searchTerm);
            const bStarts = bComp.startsWith(searchTerm) || bName.startsWith(searchTerm);
            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;

            const aIndex = Math.min(
              aComp.indexOf(searchTerm) !== -1 ? aComp.indexOf(searchTerm) : 999,
              aName.indexOf(searchTerm) !== -1 ? aName.indexOf(searchTerm) : 999
            );
            const bIndex = Math.min(
              bComp.indexOf(searchTerm) !== -1 ? bComp.indexOf(searchTerm) : 999,
              bName.indexOf(searchTerm) !== -1 ? bName.indexOf(searchTerm) : 999
            );
            return aIndex - bIndex;
          });
        } else {
          // If no search term, apply the chosen sort option
          if (sortOption === 'newest') {
            docs.sort((a, b) => new Date(b.uploaded_at || b.created_at || b.document_date || 0) - new Date(a.uploaded_at || a.created_at || a.document_date || 0));
          } else if (sortOption === 'oldest') {
            docs.sort((a, b) => new Date(a.uploaded_at || a.created_at || a.document_date || 0) - new Date(b.uploaded_at || b.created_at || b.document_date || 0));
          } else if (sortOption === 'document_date') {
            docs.sort((a, b) => new Date(b.document_date || b.info_document_date || b.uploaded_at || 0) - new Date(a.document_date || a.info_document_date || a.uploaded_at || 0));
          } else if (sortOption === 'due_date') {
            docs.sort((a, b) => new Date(a.due_date || a.info_due_date || '9999-12-31') - new Date(b.due_date || b.info_due_date || '9999-12-31'));
          }
        }

        return Promise.resolve({
          data: {
            success: true,
            data: {
              documents: docs,
              pagination: { total: docs.length, page: 1, totalPages: 1 }
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
