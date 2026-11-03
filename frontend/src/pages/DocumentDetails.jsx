import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDocument, getDocumentFile, updateDocument, deleteDocument } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import StatusBadge from '../components/StatusBadge';
import { 
  HiOutlineArrowLeft, 
  HiOutlineDownload, 
  HiOutlineEye,
  HiOutlineClipboardCopy,
  HiOutlineTable,
  HiOutlineDocumentText,
  HiOutlineCheck,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineX
} from 'react-icons/hi';
import './DocumentDetails.css';

const DocumentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ocrView, setOcrView] = useState('structured');
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [editFormData, setEditFormData] = useState({});

  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await getDocument(id);
        setDoc(res.data?.data?.document);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [id]);

  const handleDownload = async () => {
    try {
        const res = await getDocumentFile(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.original_filename);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error('Download failed', err);
    }
  };

  const handleView = async () => {
    try {
      const res = await getDocumentFile(id);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: doc.file_type }));
      window.open(url, '_blank');
    } catch (err) {
      console.error('View failed', err);
    }
  };

  const parseStructuredOcr = (text) => {
    if (!text) return { keyValues: [], otherLines: [] };
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const keyValues = [];
    const otherLines = [];

    const multiPatterns = [
      { regex: /PO Number\s+([^\s]+)\s+PO Date\s*([^\s]*)/i, keys: ['PO Number', 'PO Date'] },
      { regex: /Quotation Ref\. No\.\s+([^\s]+)\s+Quotation Date\s*([^\s]*)/i, keys: ['Quotation Ref No', 'Quotation Date'] },
      { regex: /Delivery Date\s+([^\s]+)\s+PO Status\s*([^\s]*)/i, keys: ['Delivery Date', 'PO Status'] },
      { regex: /Indent \/ Requisition No\.\s+([^\s]+)\s+Currency\s*([^\s]*)/i, keys: ['Requisition No', 'Currency'] },
      { regex: /Total Taxable Value\s+([\d,.]+)/i, keys: ['Total Taxable Value'] },
      { regex: /Total IGST\s+([\d,.]+)/i, keys: ['Total IGST'] },
      { regex: /Total GST\s+([\d,.]+)/i, keys: ['Total GST'] },
      { regex: /Round Off\s+([\d,.]+)/i, keys: ['Round Off'] },
      { regex: /PO TOTAL[^\d]*([\d,.]+)/i, keys: ['PO Total'] },
      { regex: /Grand Total[^\d]*([\d,.]+)/i, keys: ['Grand Total'] },
      { regex: /Payment Terms\s+(.+?)(?:Delivery Terms|$)/i, keys: ['Payment Terms'] },
      { regex: /Delivery Terms\s+(.+)$/i, keys: ['Delivery Terms'] },
    ];

    lines.forEach(line => {
      // 1. Pipe-separated keys e.g. Tel: ... | Email: ...
      if (line.includes('|')) {
        const parts = line.split('|').map(p => p.trim());
        parts.forEach(part => {
          const colonIdx = part.indexOf(':');
          if (colonIdx > 0 && colonIdx < 35) {
            keyValues.push({
              key: part.substring(0, colonIdx).trim(),
              value: part.substring(colonIdx + 1).trim()
            });
          } else {
            otherLines.push(part);
          }
        });
        return;
      }

      // 2. Colon-separated Key: Value
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0 && colonIdx < 35 && !line.startsWith('http')) {
        const k = line.substring(0, colonIdx).trim();
        const v = line.substring(colonIdx + 1).trim();
        if (v) {
          keyValues.push({ key: k, value: v });
        } else {
          keyValues.push({ key: 'Header', value: k });
        }
        return;
      }

      // 3. Known multi-patterns
      let matched = false;
      for (const p of multiPatterns) {
        const m = line.match(p.regex);
        if (m) {
          p.keys.forEach((k, idx) => {
            if (m[idx + 1]) {
              keyValues.push({ key: k, value: m[idx + 1].trim() });
            }
          });
          matched = true;
        }
      }
      if (matched) return;

      // 4. Document Type / Title in ALL CAPS
      if (line === line.toUpperCase() && line.length >= 4 && line.length <= 40 && !/\d{4,}/.test(line)) {
        keyValues.push({ key: 'Document Title', value: line });
        return;
      }

      // 5. Generic line
      otherLines.push(line);
    });

    return { keyValues, otherLines };
  };

  const handleCopyOcr = () => {
    if (doc?.extracted_text) {
      navigator.clipboard.writeText(doc.extracted_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenEdit = () => {
    if (!doc) return;
    setEditFormData({
      company_name: doc.company_name || '',
      document_number: doc.document_number || '',
      document_type: doc.document_type || 'Invoice',
      amount: doc.amount !== null && doc.amount !== undefined ? doc.amount : '',
      currency: doc.currency || 'INR',
      gst_number: doc.gst_number || '',
      pan: doc.pan || '',
      document_date: doc.document_date ? doc.document_date.split('T')[0] : (doc.info_document_date ? doc.info_document_date.split('T')[0] : ''),
      due_date: doc.due_date ? doc.due_date.split('T')[0] : (doc.info_due_date ? doc.info_due_date.split('T')[0] : ''),
      status: doc.status || 'pending',
      address: doc.address || '',
      email: doc.email || '',
      phone: doc.phone || '',
      city: doc.city || '',
      state: doc.state || '',
      pincode: doc.pincode || '',
      summary: doc.summary || '',
      key_points: doc.key_points || ''
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...editFormData,
        amount: editFormData.amount === '' ? null : Number(editFormData.amount)
      };
      await updateDocument(doc.id, payload);
      const refreshed = await getDocument(doc.id);
      if (refreshed.data?.data?.document) {
        setDoc(refreshed.data.data.document);
      }
      setIsEditing(false);
      setSaveSuccessMsg('Document metadata successfully saved and synced to database!');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to update document metadata', err);
      alert(err.response?.data?.message || 'Failed to update document metadata');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDoc = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete document "${doc.original_filename}" (ID: ${doc.id})? This action will remove it from the active repository.`)) {
      return;
    }
    try {
      await deleteDocument(doc.id);
      navigate('/documents');
    } catch (err) {
      console.error('Failed to delete document', err);
      alert(err.response?.data?.message || 'Failed to delete document');
    }
  };

  if (loading) return <Loading />;
  if (!doc) return <div className="page-container">Document not found</div>;

  const structuredOcr = doc.extracted_text ? parseStructuredOcr(doc.extracted_text) : { keyValues: [], otherLines: [] };

  return (
    <div className="page-container">
      <button className="btn back-btn" onClick={() => navigate(-1)}>
        <HiOutlineArrowLeft /> Back
      </button>

      {saveSuccessMsg && (
        <div className="doc-toast-success">
          <HiOutlineCheck size={18} /> {saveSuccessMsg}
        </div>
      )}

      <div className="doc-header-card">
        <div className="doc-header-info">
          <h2>{doc.original_filename}</h2>
          <div className="doc-meta-row">
            <span className="text-muted">{doc.company_name || 'Unknown Company'}</span>
            <span className="dot-separator">•</span>
            <span className="mono text-muted text-xs">ID: {doc.id}</span>
            <span className="dot-separator">•</span>
            <StatusBadge status={doc.status} />
          </div>
        </div>
        <div className="doc-header-actions flex gap-2">
          {isAdmin && (
            <button className="btn btn-secondary" onClick={handleOpenEdit} title="Edit document metadata">
              <HiOutlinePencil size={18} /> Edit Metadata
            </button>
          )}
          <button className="btn btn-secondary" onClick={handleView}>
            <HiOutlineEye size={18} /> View Document
          </button>
          <button className="btn btn-primary" onClick={handleDownload}>
            <HiOutlineDownload size={18} /> Download Original
          </button>
        </div>
      </div>

      <div className="doc-grid">
        <div className="doc-main-col">
          <div className="info-card">
            <h3>Document Information</h3>
            <div className="info-grid">
              {doc.document_type && (
                <div className="info-item">
                  <label>Type</label>
                  <div>{doc.document_type}</div>
                </div>
              )}
              {doc.company_name && (
                <div className="info-item">
                  <label>Company</label>
                  <div>{doc.company_name}</div>
                </div>
              )}
              {doc.document_number && (
                <div className="info-item">
                  <label>Document Number</label>
                  <div>{doc.document_number}</div>
                </div>
              )}
              {doc.document_date && (
                <div className="info-item">
                  <label>Date</label>
                  <div>{new Date(doc.document_date).toLocaleDateString()}</div>
                </div>
              )}
              {doc.amount && (
                <div className="info-item">
                  <label>Amount</label>
                  <div>{`${doc.currency === 'USD' ? '$' : '₹'}${doc.amount}`}</div>
                </div>
              )}
              {doc.due_date && (
                <div className="info-item">
                  <label>Due Date</label>
                  <div>{new Date(doc.due_date).toLocaleDateString()}</div>
                </div>
              )}
              {doc.gst_number && (
                <div className="info-item">
                  <label>GST Number</label>
                  <div>{doc.gst_number}</div>
                </div>
              )}
              {doc.pan && (
                <div className="info-item">
                  <label>PAN</label>
                  <div>{doc.pan}</div>
                </div>
              )}
              {doc.email && (
                <div className="info-item">
                  <label>Email</label>
                  <div style={{ wordBreak: 'break-all' }}>{doc.email}</div>
                </div>
              )}
              {doc.phone && (
                <div className="info-item">
                  <label>Phone</label>
                  <div>{doc.phone}</div>
                </div>
              )}
              {doc.address && (
                <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                  <label>Address</label>
                  <div>
                    {doc.address}
                    {(doc.city || doc.state || doc.pincode) && <br />}
                    {[doc.city, doc.state, doc.pincode].filter(Boolean).join(', ')}
                  </div>
                </div>
              )}
              {doc.landmark && doc.landmark.toLowerCase() !== 'null' && (
                <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                  <label>Landmark</label>
                  <div>{doc.landmark}</div>
                </div>
              )}
            </div>
          </div>

          {(doc.summary || doc.key_points) && (
            <div className="info-card mt-4">
              <h3>AI Summary & Key Points</h3>
              <div className="placeholder-box" style={{ background: 'rgba(26, 172, 195, 0.05)', borderColor: 'rgba(26, 172, 195, 0.2)', textAlign: 'left', padding: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <tbody>
                    {doc.summary && (
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '12px 0', width: '150px', verticalAlign: 'top', color: 'var(--accent)', fontWeight: '600' }}>Summary</td>
                        <td style={{ padding: '12px 0', lineHeight: '1.5' }}>{doc.summary}</td>
                      </tr>
                    )}
                    {doc.key_points && (
                      <tr>
                        <td style={{ padding: '12px 0', width: '150px', verticalAlign: 'top', color: 'var(--accent)', fontWeight: '600' }}>Key Insights</td>
                        <td style={{ padding: '12px 0', lineHeight: '1.6' }}>
                          <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
                            {doc.key_points.split('\n').map((point, idx) => {
                              const cleanPoint = point.replace(/^•\s*/, '').trim();
                              return cleanPoint ? <li key={idx} style={{ marginBottom: '6px' }}>{cleanPoint}</li> : null;
                            })}
                          </ul>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {doc.extracted_text && (
            <div className="info-card mt-4">
              <div className="ocr-header-toolbar">
                <h3 style={{ margin: 0, border: 'none', padding: 0 }}>Extracted Text (OCR / PDF)</h3>
                <div className="flex items-center gap-2">
                  <div className="ocr-tabs">
                    <button 
                      type="button"
                      className={`ocr-tab-btn ${ocrView === 'structured' ? 'active' : ''}`}
                      onClick={() => setOcrView('structured')}
                    >
                      <HiOutlineTable size={15} /> Structured Key-Value Table
                    </button>
                    <button 
                      type="button"
                      className={`ocr-tab-btn ${ocrView === 'raw' ? 'active' : ''}`}
                      onClick={() => setOcrView('raw')}
                    >
                      <HiOutlineDocumentText size={15} /> Raw OCR Text
                    </button>
                  </div>
                  <button 
                    type="button"
                    className="btn btn-secondary" 
                    style={{ padding: '6px 12px', fontSize: '12px' }} 
                    onClick={handleCopyOcr}
                    title="Copy raw text to clipboard"
                  >
                    {copied ? (
                      <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <HiOutlineCheck size={14} /> Copied!
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <HiOutlineClipboardCopy size={14} /> Copy Text
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {ocrView === 'structured' ? (
                <div>
                  {structuredOcr.keyValues.length > 0 && (
                    <div className="ocr-table-wrapper mb-4">
                      <table className="ocr-kv-table">
                        <thead>
                          <tr>
                            <th style={{ width: '240px' }}>Attribute / Key Field</th>
                            <th>Extracted Structured Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {structuredOcr.keyValues.map((item, idx) => (
                            <tr key={idx}>
                              <td>
                                <span className="ocr-key-badge">{item.key}</span>
                              </td>
                              <td className="ocr-value-text">
                                {item.key === 'Document Title' ? (
                                  <span className="ocr-section-badge">{item.value}</span>
                                ) : (
                                  item.value
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {structuredOcr.otherLines.length > 0 && (
                    <div className="ocr-table-wrapper" style={{ marginTop: '12px' }}>
                      <table className="ocr-kv-table">
                        <thead>
                          <tr>
                            <th style={{ width: '240px' }}>Content Segment</th>
                            <th>Extracted Line Content</th>
                          </tr>
                        </thead>
                        <tbody>
                          {structuredOcr.otherLines.slice(0, 20).map((line, idx) => (
                            <tr key={idx}>
                              <td>
                                <span className="text-muted text-xs mono">SEGMENT #{String(idx + 1).padStart(2, '0')}</span>
                              </td>
                              <td className="ocr-value-text" style={{ fontSize: '13px' }}>
                                {line}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                <div className="ocr-raw-box">
                  {doc.extracted_text}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="doc-side-col">
          <div className="info-card">
            <h3>System Details</h3>
            <div className="info-item mb-3">
              <label>Uploaded On</label>
              <div>{new Date(doc.uploaded_at).toLocaleString()}</div>
            </div>
            <div className="info-item mb-3">
              <label>Uploaded By</label>
              <div>{doc.uploader_name} (ID: {doc.uploaded_by})</div>
            </div>
            <div className="info-item mb-3">
              <label>Storage Path</label>
              <div className="mono text-xs text-muted" style={{ wordBreak: 'break-all' }}>{doc.file_path}</div>
            </div>
          </div>

          {user?.role === 'ADMIN' && (
            <div className="info-card mt-4" style={{ borderColor: 'var(--status-failed)' }}>
              <h3>Admin Actions</h3>
              <p className="text-xs text-muted mb-3">Only visible to administrators.</p>
              <div className="flex gap-2">
                <button className="btn btn-secondary w-full" onClick={handleOpenEdit} type="button">
                  <HiOutlinePencil size={15} /> Edit Meta
                </button>
                <button className="btn btn-danger w-full" onClick={handleDeleteDoc} type="button">
                  <HiOutlineTrash size={15} /> Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Admin Edit Metadata Modal */}
      {isEditing && (
        <div className="modal-backdrop" onClick={() => !saving && setIsEditing(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <HiOutlinePencil size={18} color="var(--accent)" />
                <div>
                  <h3 style={{ margin: 0 }}>Edit Document Metadata</h3>
                  <span className="mono text-xs text-muted">ID: {doc.id} • {doc.original_filename}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  type="button" 
                  className="btn-save-header"
                  onClick={handleSaveEdit}
                  disabled={saving}
                  title="Save changes and sync directly to database"
                >
                  <HiOutlineCheck size={16} /> {saving ? 'Saving...' : 'Save & Sync DB'}
                </button>
                <button 
                  type="button" 
                  className="btn" 
                  style={{ padding: '6px', background: 'transparent', color: 'var(--text-muted)' }}
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                  title="Close"
                >
                  <HiOutlineX size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Company / Organization Name</label>
                  <input 
                    type="text" 
                    value={editFormData.company_name} 
                    onChange={e => setEditFormData({ ...editFormData, company_name: e.target.value })} 
                    placeholder="e.g. Acme Corp"
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Document / PO Number</label>
                    <input 
                      type="text" 
                      value={editFormData.document_number} 
                      onChange={e => setEditFormData({ ...editFormData, document_number: e.target.value })} 
                      placeholder="e.g. INV-2026-001"
                    />
                  </div>
                  <div className="form-group">
                    <label>Document Classification</label>
                    <select 
                      value={editFormData.document_type} 
                      onChange={e => setEditFormData({ ...editFormData, document_type: e.target.value })}
                    >
                      <option value="Invoice">Invoice</option>
                      <option value="Tender">Tender</option>
                      <option value="Purchase Document">Purchase Document</option>
                      <option value="Quotation">Quotation</option>
                      <option value="Contract">Contract</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Total Amount</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={editFormData.amount} 
                      onChange={e => setEditFormData({ ...editFormData, amount: e.target.value })} 
                      placeholder="e.g. 15000.00"
                    />
                  </div>
                  <div className="form-group">
                    <label>Currency</label>
                    <select 
                      value={editFormData.currency} 
                      onChange={e => setEditFormData({ ...editFormData, currency: e.target.value })}
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                    </select>
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Document Date</label>
                    <input 
                      type="date" 
                      value={editFormData.document_date} 
                      onChange={e => setEditFormData({ ...editFormData, document_date: e.target.value })} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Due / Delivery Date</label>
                    <input 
                      type="date" 
                      value={editFormData.due_date} 
                      onChange={e => setEditFormData({ ...editFormData, due_date: e.target.value })} 
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>GSTIN</label>
                    <input 
                      type="text" 
                      value={editFormData.gst_number} 
                      onChange={e => setEditFormData({ ...editFormData, gst_number: e.target.value })} 
                      placeholder="e.g. 27AAAAA0000A1Z5"
                    />
                  </div>
                  <div className="form-group">
                    <label>PAN</label>
                    <input 
                      type="text" 
                      value={editFormData.pan} 
                      onChange={e => setEditFormData({ ...editFormData, pan: e.target.value })} 
                      placeholder="e.g. ABCDE1234F"
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Email</label>
                    <input 
                      type="email" 
                      value={editFormData.email} 
                      onChange={e => setEditFormData({ ...editFormData, email: e.target.value })} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input 
                      type="text" 
                      value={editFormData.phone} 
                      onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })} 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Full Address</label>
                  <textarea 
                    rows="2"
                    value={editFormData.address} 
                    onChange={e => setEditFormData({ ...editFormData, address: e.target.value })} 
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Workflow Status</label>
                    <select 
                      value={editFormData.status} 
                      onChange={e => setEditFormData({ ...editFormData, status: e.target.value })}
                    >
                      <option value="pending">Pending</option>
                      <option value="done">Done / Approved</option>
                      <option value="failed">Failed / Escalated</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>State / Region</label>
                    <input 
                      type="text" 
                      value={editFormData.state} 
                      onChange={e => setEditFormData({ ...editFormData, state: e.target.value })} 
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <span className="text-xs text-muted flex items-center gap-1">
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
                  Direct MySQL synchronization
                </span>
                <div className="flex items-center gap-2">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setIsEditing(false)}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={saving}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <HiOutlineCheck size={16} /> {saving ? 'Saving Changes...' : 'Save & Sync DB'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentDetails;
