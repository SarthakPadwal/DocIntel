import React, { useEffect, useState } from 'react';
import { getDocuments, deleteDocument, updateDocument } from '../services/api';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import { 
  HiOutlineShieldCheck, 
  HiOutlineFolderOpen, 
  HiOutlineExclamationCircle, 
  HiOutlineChartBar, 
  HiOutlineTrash,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineDownload,
  HiOutlinePencil,
  HiOutlineClock,
  HiOutlineCheckCircle
} from 'react-icons/hi';
import './AdminManagement.css';

const AdminManagement = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [search, setSearch] = useState('');

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await getDocuments({ search });
      setDocuments(res.data?.data?.documents || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(fetchDocs, 300);
    return () => clearTimeout(delay);
  }, [search]);

  const selectDoc = (doc) => {
    setSelectedDoc(doc);
    setEditForm({
      company_name: doc.company_name || '',
      gst_number: doc.gst_number || '',
      document_type: doc.document_type || '',
      document_number: doc.document_number || '',
      amount: doc.amount !== null && doc.amount !== undefined ? doc.amount : '',
      due_date: doc.due_date ? doc.due_date.split('T')[0] : (doc.info_due_date ? doc.info_due_date.split('T')[0] : ''),
      status: doc.status || 'pending',
      notes: '' // internal admin notes placeholder
    });
  };

  const handleEditSubmit = async () => {
    if (!selectedDoc) return;
    try {
      const payload = {
        ...editForm,
        amount: editForm.amount === '' ? null : Number(editForm.amount)
      };
      await updateDocument(selectedDoc.id, payload);
      setSelectedDoc(null);
      fetchDocs();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update document metadata');
    }
  };

  const handleDelete = async () => {
    if (!selectedDoc) return;
    try {
      await deleteDocument(selectedDoc.id);
      setSelectedDoc(null);
      fetchDocs();
    } catch (err) {
      console.error(err);
    }
  };

  const getDocIdString = (id) => {
    return `DOC-2026-${id.toString().padStart(3, '0')}`;
  };

  const handleExportCSV = () => {
    if (documents.length === 0) return;
    const headers = ['DOCUMENT_ID', 'COMPANY', 'TYPE', 'UPLOAD_DATE', 'STATUS', 'DUE_DATE'];
    const rows = documents.map(doc => [
      `DOC-2026-${doc.id.toString().padStart(3, '0')}`,
      `"${(doc.company_name || '').replace(/"/g, '""')}"`,
      doc.document_type || '',
      new Date(doc.uploaded_at).toLocaleDateString(),
      doc.status || '',
      (doc.info_due_date || doc.due_date || doc.info_document_date || doc.document_date) ? new Date(doc.info_due_date || doc.due_date || doc.info_document_date || doc.document_date).toLocaleDateString() : ''
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `docintel_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page-container" style={{ maxWidth: '100%' }}>
      <div className="admin-page-header">
        <div>
          <div className="admin-breadcrumb">
            CONSOLE // SEC-LVL-4 // LIFECYCLE AUDIT PIPELINE
          </div>
          <h2>Document Management</h2>
          <p className="text-muted">Administrator console for controlling company document metadata, work statuses, and records lifecycle.</p>
        </div>
        <div>
          <div className="btn" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', marginBottom: '12px' }}>
            <HiOutlineShieldCheck size={18} /> Role: Administrator (Full Access)
          </div>
          <br/>
          <button className="btn btn-secondary" onClick={() => window.location.href = '/upload'}>+ Register Intake</button>
        </div>
      </div>

      <div className="admin-stats-row">
        <div className="admin-stat-box">
          <div>
            <div className="title">INDEXED FILES</div>
            <div className="value">{documents.length > 0 ? documents.length : '0'}</div>
          </div>
          <div className="icon"><HiOutlineFolderOpen size={24} /></div>
        </div>
        <div className="admin-stat-box">
          <div>
            <div className="title">PENDING AUDIT</div>
            <div className="value" style={{ color: '#f59e0b' }}>
              {documents.filter(d => (d.status || '').toLowerCase() === 'pending').length}
            </div>
          </div>
          <div className="icon" style={{ color: '#f59e0b' }}><HiOutlineClock size={24} /></div>
        </div>
        <div className="admin-stat-box">
          <div>
            <div className="title">OVERDUE ESCALATIONS</div>
            <div className="value" style={{ color: '#ef4444' }}>
              {documents.filter(d => (d.status || '').toLowerCase() !== 'done' && ((d.info_due_date || d.due_date) ? new Date(d.info_due_date || d.due_date) < new Date() : d.status === 'failed')).length}
            </div>
          </div>
          <div className="icon" style={{ color: '#ef4444' }}><HiOutlineExclamationCircle size={24} /></div>
        </div>
        <div className="admin-stat-box">
          <div>
            <div className="title">VERIFIED / DONE</div>
            <div className="value" style={{ color: '#10b981' }}>
              {documents.filter(d => (d.status || '').toLowerCase() === 'done').length}
            </div>
          </div>
          <div className="icon" style={{ color: '#10b981' }}><HiOutlineCheckCircle size={24} /></div>
        </div>
      </div>

      <div className="admin-layout">
        <div className="admin-main">
          <div className="admin-toolbar">
            <div style={{ position: 'relative', flex: 1 }}>
              <HiOutlineSearch style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} size={18} />
              <input 
                type="text" 
                className="admin-search-input w-full" 
                placeholder="Filter ID, Company, or Document type..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button className="btn btn-secondary"><HiOutlineFilter /> Filters</button>
            <button className="btn btn-secondary" onClick={handleExportCSV}><HiOutlineDownload /> Export CSV</button>
          </div>

          <div className="admin-table-container">
            {loading ? <Loading /> : documents.length === 0 ? (
              <EmptyState title="No documents" />
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>DOCUMENT ID</th>
                    <th>COMPANY</th>
                    <th>DOCUMENT TYPE</th>
                    <th>DATE</th>
                    <th>STATUS</th>
                    <th style={{ textAlign: 'right' }}>ADMIN ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map(doc => (
                    <tr 
                      key={doc.id} 
                      className={`admin-table-row ${selectedDoc?.id === doc.id ? 'selected' : ''}`}
                      onClick={() => selectDoc(doc)}
                    >
                      <td className="mono text-xs font-semibold">{getDocIdString(doc.id)}</td>
                      <td>{doc.company_name || '-'}</td>
                      <td><span className="type-badge">{doc.document_type || 'Unknown'}</span></td>
                      <td>{new Date(doc.uploaded_at).toLocaleDateString()}</td>
                      <td><StatusBadge status={doc.status} /></td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          className="icon-btn-edit mr-2" 
                          title="Edit Document"
                          onClick={(e) => { e.stopPropagation(); selectDoc(doc); }}
                        >
                          <HiOutlinePencil size={16} />
                        </button>
                        <button 
                          className="icon-btn-edit text-danger" 
                          title="Delete Document"
                          onClick={(e) => { e.stopPropagation(); setSelectedDoc(doc); }}
                        >
                          <HiOutlineTrash size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {!loading && documents.length > 0 && (
              <div className="flex justify-between items-center p-4 border-t text-sm text-muted" style={{ borderColor: 'var(--border)' }}>
                <div>Showing {documents.length} records / <span style={{ color: '#10b981' }}>Encrypted at Rest [AES-256]</span></div>
                <div>01 / {Math.ceil(documents.length / 10)}</div>
              </div>
            )}
          </div>
        </div>

        {selectedDoc && (
          <div className="admin-side-panel">
            <div className="admin-panel-header">
              <div>
                <div className="mono text-xs text-muted mb-1 flex items-center gap-2">
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent)' }}></span>
                  RECORD: {getDocIdString(selectedDoc.id)}
                </div>
                <h3 className="admin-panel-title">Edit Document & Work Status</h3>
              </div>
              <div className="admin-badge-root">MODE: ROOT</div>
            </div>

            <div>
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input type="text" className="form-input" value={editForm.company_name} onChange={e => setEditForm({...editForm, company_name: e.target.value})} />
              </div>
              
              <div className="admin-grid-2">
                <div className="form-group">
                  <label className="form-label">GST Number</label>
                  <input type="text" className="form-input" value={editForm.gst_number} onChange={e => setEditForm({...editForm, gst_number: e.target.value})} placeholder="27XXXXXXX1Z5" />
                </div>
                <div className="form-group">
                  <label className="form-label">Document Number</label>
                  <input type="text" className="form-input" value={editForm.document_number} onChange={e => setEditForm({...editForm, document_number: e.target.value})} />
                </div>
              </div>

              <div className="admin-grid-2">
                <div className="form-group">
                  <label className="form-label">Document Type</label>
                  <select className="form-select" value={editForm.document_type} onChange={e => setEditForm({...editForm, document_type: e.target.value})}>
                    <option value="Invoice">Invoice</option>
                    <option value="Quotation">Quotation</option>
                    <option value="Tender">Tender</option>
                    <option value="Contract">Contract</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Total Amount (₹)</label>
                  <input type="number" step="0.01" className="form-input" value={editForm.amount} onChange={e => setEditForm({...editForm, amount: e.target.value})} placeholder="e.g. 15000.00" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Important / Due Date</label>
                <input type="date" className="form-input" value={editForm.due_date} onChange={e => setEditForm({...editForm, due_date: e.target.value})} />
              </div>

              <div className="form-group">
                <div className="flex justify-between items-center mb-1">
                  <label className="form-label mb-0">Work / Status</label>
                  <span className="text-xs" style={{ color: '#f59e0b' }}>Priority Queue #14</span>
                </div>
                <select className="form-select" value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}>
                  <option value="pending">Pending</option>
                  <option value="done">Done</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Internal Admin Notes</label>
                <textarea className="form-textarea" rows="3" value={editForm.notes} onChange={e => setEditForm({...editForm, notes: e.target.value})} placeholder="Pending CFO clearance..."></textarea>
              </div>

              <div className="flex justify-end gap-3 mt-2">
                <button type="button" className="btn" style={{ background: 'transparent', color: 'var(--text-primary)' }} onClick={() => setSelectedDoc(null)}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={handleEditSubmit}>Save Changes</button>
              </div>
            </div>

            <div className="admin-danger-zone">
              <div className="flex items-center gap-2 mb-2" style={{ color: '#ef4444', fontWeight: 'bold' }}>
                <HiOutlineExclamationCircle size={20} /> This functionality is strictly restricted to Administrators.
              </div>
              <hr style={{ borderColor: 'rgba(239, 68, 68, 0.2)', margin: '12px 0' }} />
              <h4>Delete Document?</h4>
              <p>Are you sure you want to permanently delete document <strong>{getDocIdString(selectedDoc.id)}</strong> from the repository? This action cannot be undone.</p>
              
              <div className="admin-hash">
                <span>TARGET HASH:</span>
                <span>SHA256:7f8a9e...c03b</span>
              </div>
              
              <div className="flex justify-between mt-4">
                <button className="btn btn-secondary" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} onClick={() => setSelectedDoc(null)}>Cancel</button>
                <button className="btn" style={{ backgroundColor: '#ef4444', color: 'white' }} onClick={handleDelete}><HiOutlineTrash size={16} /> Delete Document</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminManagement;
