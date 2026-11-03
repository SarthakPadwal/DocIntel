import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDocuments } from '../services/api';
import Loading from '../components/Loading';
import StatusBadge from '../components/StatusBadge';
import { 
  HiOutlineCalendar, 
  HiOutlineRefresh, 
  HiOutlineFilter,
  HiOutlineClock,
  HiOutlineExclamationCircle,
  HiOutlineArrowRight,
  HiOutlineBell,
  HiOutlineCheckCircle
} from 'react-icons/hi';
import './DocumentDates.css';

const DocumentDates = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await getDocuments({ limit: 50 });
      setDocuments(res.data?.data?.documents || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const [lifecycleFilter, setLifecycleFilter] = useState({
    type: 'ALL',
    horizon: 'ALL',
    company: ''
  });
  const [showFilterModal, setShowFilterModal] = useState(false);

  const getDocIdString = (id) => `DOC-${id.toString().padStart(4, '0')}`;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const upcomingDocs = [];
  const pendingDocs = [];
  const overdueDocs = [];

  // Filter documents by lifecycle filter if applied
  const filteredDocuments = documents.filter(doc => {
    if (lifecycleFilter.type !== 'ALL' && doc.document_type !== lifecycleFilter.type) return false;
    if (lifecycleFilter.company && !(doc.company_name || '').toLowerCase().includes(lifecycleFilter.company.toLowerCase())) return false;
    return true;
  });

  filteredDocuments.forEach(d => {
    const dueDateStr = d.info_due_date || d.due_date;
    const docDateStr = d.info_document_date || d.document_date;
    
    const targetDate = dueDateStr ? new Date(dueDateStr) : (docDateStr ? new Date(docDateStr) : null);
    
    if (!targetDate || isNaN(targetDate.getTime()) || targetDate.getFullYear() === 0) {
      if (d.status === 'failed') {
        overdueDocs.push({ ...d, diffDays: -1, isOverdue: true, targetDate: null });
      } else {
        pendingDocs.push({ ...d, diffDays: null, isPending: true, targetDate: null });
      }
      return;
    }

    targetDate.setHours(0, 0, 0, 0);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    // STRICT SPECIFICATION:
    // 1. OVERDUE: only documents that are strictly out of date (diffDays < 0), or failed status
    if (diffDays < 0 || d.status === 'failed') {
      overdueDocs.push({ ...d, diffDays, isOverdue: true, targetDate });
    }
    // 2. UPCOMING DEADLINE: submission date is upcoming in 1 to 2 weeks (0 <= diffDays <= 14)
    else if (diffDays >= 0 && diffDays <= 14) {
      upcomingDocs.push({ ...d, diffDays, isUpcoming: true, targetDate });
    }
    // 3. PENDING: upcoming dates as per document added (> 14 days) or pending review queue
    else {
      pendingDocs.push({ ...d, diffDays, isPending: true, targetDate });
    }
  });

  const upcomingOnly = lifecycleFilter.horizon === 'ALL' || lifecycleFilter.horizon === 'UPCOMING' ? upcomingDocs : [];
  const pendingOnly = lifecycleFilter.horizon === 'ALL' || lifecycleFilter.horizon === 'PENDING' ? pendingDocs : [];
  const overdueOnly = lifecycleFilter.horizon === 'ALL' || lifecycleFilter.horizon === 'OVERDUE' ? overdueDocs : [];

  if (loading) return <Loading />;

  return (
    <div className="page-container" style={{ maxWidth: '100%' }}>
      <div className="dates-header-row">
        <div>
          <div className="admin-breadcrumb mb-2">CHRONOMETRY & LIFECYCLE LEDGER</div>
          <h2>Document Dates</h2>
          <p className="dates-subtitle">Chronological milestone and status overview for critical deadlines, expiration dates, and pending verifications across active corporate repositories.</p>
        </div>
        <div className="dates-top-actions">
          <div className="dates-toolbar">
            <div className="dates-date-badge">
              <HiOutlineCalendar size={14} /> {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()} UTC+00:00
            </div>
            <button 
              className="btn btn-secondary" 
              style={{ 
                padding: '6px 12px', 
                fontSize: '12px',
                backgroundColor: (lifecycleFilter.type !== 'ALL' || lifecycleFilter.horizon !== 'ALL' || lifecycleFilter.company) ? 'rgba(56, 189, 248, 0.15)' : undefined,
                color: (lifecycleFilter.type !== 'ALL' || lifecycleFilter.horizon !== 'ALL' || lifecycleFilter.company) ? '#38bdf8' : undefined
              }}
              onClick={() => setShowFilterModal(!showFilterModal)}
            >
              <HiOutlineFilter size={14} /> {showFilterModal ? 'Hide Filters' : 'Filter Lifecycle'}
            </button>
          </div>
          <button className="btn" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)', padding: '6px 12px', fontSize: '12px' }} onClick={fetchDocs}>
            <HiOutlineRefresh size={14} /> Refresh Triggers
          </button>
        </div>
      </div>

      {/* Lifecycle Filter Bar */}
      {showFilterModal && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1', minWidth: '180px' }}>
            <label style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Filter by Horizon</label>
            <select 
              value={lifecycleFilter.horizon} 
              onChange={e => setLifecycleFilter({ ...lifecycleFilter, horizon: e.target.value })}
              style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)' }}
            >
              <option value="ALL">All Horizons (3 Columns)</option>
              <option value="UPCOMING">Upcoming Deadlines (1-2 Weeks)</option>
              <option value="PENDING">Pending Documents (&gt; 2 Weeks)</option>
              <option value="OVERDUE">Recently Due / Overdue (Past Dates)</option>
            </select>
          </div>

          <div style={{ flex: '1', minWidth: '180px' }}>
            <label style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Document Type</label>
            <select 
              value={lifecycleFilter.type} 
              onChange={e => setLifecycleFilter({ ...lifecycleFilter, type: e.target.value })}
              style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)' }}
            >
              <option value="ALL">All Types</option>
              <option value="Invoice">Invoice</option>
              <option value="Tender">Tender</option>
              <option value="Purchase Document">Purchase Document</option>
              <option value="Quotation">Quotation</option>
              <option value="Contract">Contract</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div style={{ flex: '1.5', minWidth: '220px' }}>
            <label style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Filter by Company</label>
            <input 
              type="text" 
              placeholder="Search company name..." 
              value={lifecycleFilter.company}
              onChange={e => setLifecycleFilter({ ...lifecycleFilter, company: e.target.value })}
              style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', boxSizing: 'border-box' }}
            />
          </div>

          <button 
            className="btn btn-secondary" 
            style={{ padding: '8px 16px', fontSize: '13px' }}
            onClick={() => setLifecycleFilter({ type: 'ALL', horizon: 'ALL', company: '' })}
          >
            Reset Filters
          </button>
        </div>
      )}

      <div className="dates-stats-grid">
        <div className="dates-stat-card">
          <div className="dates-stat-header">
            <div className="dates-stat-title">UPCOMING DEADLINES</div>
            <HiOutlineCalendar size={18} className="text-muted" />
          </div>
          <div className="dates-stat-value">{upcomingDocs.length}</div>
          <div className="dates-stat-sub">Due in Next 1-2 Weeks</div>
          <div className="dates-progress-row">
            <span>{upcomingDocs.length > 0 ? `Next: ${upcomingDocs[0].company_name || 'Document'}` : 'No immediate deadlines'}</span>
            <span style={{ color: '#3b82f6' }}>{upcomingDocs.length > 0 ? 'Action Needed' : 'Clear'}</span>
          </div>
          <div className="dates-progress-bar">
            <div className="dates-progress-fill" style={{ width: upcomingDocs.length > 0 ? '75%' : '0%', backgroundColor: '#3b82f6' }}></div>
          </div>
        </div>
        
        <div className="dates-stat-card">
          <div className="dates-stat-header">
            <div className="dates-stat-title">PENDING & SCHEDULED</div>
            <HiOutlineClock size={18} style={{ color: '#f59e0b' }} />
          </div>
          <div className="dates-stat-value">{pendingDocs.length}</div>
          <div className="dates-stat-sub" style={{ color: '#f59e0b' }}>Pending Review / Extended Dates</div>
          <div className="dates-progress-row">
            <span>Document Pipeline</span>
            <span style={{ color: '#f59e0b' }}>{pendingDocs.length} Active</span>
          </div>
          <div className="dates-progress-bar">
            <div className="dates-progress-fill" style={{ width: pendingDocs.length > 0 ? '60%' : '0%', backgroundColor: '#f59e0b' }}></div>
          </div>
        </div>

        <div className="dates-stat-card">
          <div className="dates-stat-header">
            <div className="dates-stat-title">OVERDUE DOCUMENTS</div>
            <HiOutlineExclamationCircle size={18} style={{ color: '#ef4444' }} />
          </div>
          <div className="dates-stat-value">{overdueDocs.length}</div>
          <div className="dates-stat-sub" style={{ color: '#ef4444' }}>Out of Date / Escalated</div>
          <div className="dates-progress-row">
            <span>Urgent Attention</span>
            <span style={{ color: '#ef4444' }}>{overdueDocs.length} Overdue</span>
          </div>
          <div className="dates-progress-bar">
            <div className="dates-progress-fill" style={{ width: overdueDocs.length > 0 ? '100%' : '0%', backgroundColor: '#ef4444' }}></div>
          </div>
        </div>
      </div>

      <div className="dates-columns-wrapper">
        {/* COLUMN 1 */}
        <div className="dates-column">
          <div className="dates-col-header">
            <div className="flex items-center gap-2">
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#3b82f6' }}></div>
              Upcoming Deadlines
            </div>
            <div className="dates-col-count">{upcomingOnly.length.toString().padStart(2, '0')} Visible</div>
          </div>
          
          {upcomingOnly.map(doc => (
            <div key={doc.id} className="dates-doc-card">
              <div className="dates-doc-header">
                <div className="dates-doc-id">{getDocIdString(doc.id)}</div>
                <StatusBadge status="upcoming" size="small" />
              </div>
              <div className="dates-doc-type">{doc.document_type || 'Unknown'}</div>
              <div className="dates-doc-company">{doc.company_name || 'No Company'}</div>
              
              <div className="dates-meta-box">
                <div className="dates-meta-row">
                  <span className="dates-meta-label">Milestone Date</span>
                  <span className="dates-meta-value">{(doc.info_due_date || doc.due_date || doc.info_document_date || doc.document_date) ? new Date(doc.info_due_date || doc.due_date || doc.info_document_date || doc.document_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not set'}</span>
                </div>
                <div className="dates-meta-row">
                  <span className="dates-meta-label">Horizon</span>
                  <span className="dates-meta-value">Validity expiring soon</span>
                </div>
              </div>
              
              <div className="dates-card-footer">
                <div className="dates-card-status">
                  <HiOutlineCheckCircle size={14} /> Conf: 98.4%
                </div>
                <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '11px', background: 'transparent', border: 'none', color: 'var(--text-muted)' }} onClick={() => navigate(`/documents/${doc.id}`)}>
                  View Document <HiOutlineArrowRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* COLUMN 2 */}
        <div className="dates-column">
          <div className="dates-col-header">
            <div className="flex items-center gap-2">
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></div>
              Pending Documents
            </div>
            <div className="dates-col-count">{pendingOnly.length.toString().padStart(2, '0')} Visible</div>
          </div>

          {pendingOnly.map(doc => {
            const isDone = (doc.status || '').toLowerCase() === 'done';
            return (
              <div key={doc.id} className="dates-doc-card">
                <div className="dates-doc-header">
                  <div className="dates-doc-id">{getDocIdString(doc.id)}</div>
                  <StatusBadge status={isDone ? 'done' : 'pending'} size="small" />
                </div>
                <div className="dates-doc-type">{doc.document_type || 'Unknown'}</div>
                <div className="dates-doc-company">{doc.company_name || 'No Company'}</div>
                
                <div className="dates-meta-box">
                  <div className="dates-meta-row">
                    <span className="dates-meta-label">Queue Status</span>
                    <span className={`dates-meta-value ${isDone ? 'success' : 'warning'}`}>
                      {isDone ? 'Verified & Completed' : 'Pending Review'}
                    </span>
                  </div>
                  <div className="dates-meta-row">
                    <span className="dates-meta-label">Blocker</span>
                    <span className="dates-meta-value text-xs text-muted">
                      {isDone ? 'None (Archive Active)' : 'Waiting for signoff'}
                    </span>
                  </div>
                </div>
                
                <div className="dates-card-footer">
                  <div className="dates-card-status">
                    <HiOutlineClock size={14} /> {isDone ? 'Indexed & Saved' : 'Elapsed: 1d 4h'}
                  </div>
                  <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '11px', background: 'transparent', border: 'none', color: 'var(--text-muted)' }} onClick={() => navigate(`/documents/${doc.id}`)}>
                    View Document <HiOutlineArrowRight size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* COLUMN 3 */}
        <div className="dates-column">
          <div className="dates-col-header">
            <div className="flex items-center gap-2">
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
              Recently Due / Overdue
            </div>
            <div className="dates-col-count">{overdueDocs.length.toString().padStart(2, '0')} Visible</div>
          </div>

          {overdueDocs.map(doc => (
            <div key={doc.id} className="dates-doc-card">
              <div className="dates-doc-header">
                <div className="dates-doc-id">{getDocIdString(doc.id)}</div>
                <StatusBadge status={doc.status === 'failed' ? 'failed' : 'overdue'} size="small" />
              </div>
              <div className="dates-doc-type">{doc.document_type || 'Unknown'}</div>
              <div className="dates-doc-company">{doc.company_name || 'No Company'}</div>
              
              <div className="dates-meta-box" style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>
                <div className="dates-meta-row">
                  <span className="dates-meta-label">Cutoff Date</span>
                  <span className="dates-meta-value">{(doc.info_due_date || doc.due_date || doc.info_document_date || doc.document_date) ? new Date(doc.info_due_date || doc.due_date || doc.info_document_date || doc.document_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not set'}</span>
                </div>
                <div className="dates-meta-row">
                  <span className="dates-meta-label">Delta</span>
                  <span className="dates-meta-value danger">Overdue</span>
                </div>
              </div>
              
              <div className="dates-card-footer">
                <div className="dates-card-status" style={{ color: '#ef4444' }}>
                  <HiOutlineExclamationCircle size={14} /> Notice Sent
                </div>
                <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '11px', background: 'transparent', border: 'none', color: 'var(--text-muted)' }} onClick={() => navigate(`/documents/${doc.id}`)}>
                  View Document <HiOutlineArrowRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="alert-bar">
        <div className="flex items-center gap-4">
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HiOutlineBell size={20} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '14px' }}>Automated SLA & Expiration Alerts</h4>
            <p className="text-muted text-xs" style={{ margin: '4px 0 0 0' }}>Real-time webhook and email dispatch triggers for critical enterprise obligations within 30-day thresholds.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" style={{ fontSize: '12px', padding: '8px 16px', backgroundColor: 'rgba(255,255,255,0.05)' }}>Configure Thresholds</button>
          <button className="btn btn-primary" style={{ fontSize: '12px', padding: '8px 16px', backgroundColor: '#bfdbfe', color: '#1e3a8a' }}>Audit Notification Logs</button>
        </div>
      </div>
    </div>
  );
};

export default DocumentDates;
