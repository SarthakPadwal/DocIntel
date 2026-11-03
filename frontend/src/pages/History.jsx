import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  getSearchHistory, 
  clearSearchHistory, 
  getActivityHistory, 
  recordSearch 
} from '../services/api';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import { 
  HiOutlineClock, 
  HiOutlineSearch, 
  HiOutlineDocumentText,
  HiOutlineTrash,
  HiOutlineArrowRight,
  HiOutlinePencil,
  HiOutlineCheck,
  HiOutlineCloudUpload,
  HiOutlineEye,
  HiOutlineX,
  HiOutlineFilter,
  HiOutlineSparkles,
  HiOutlineExternalLink
} from 'react-icons/hi';
import './History.css';

const formatRelativeTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDays = Math.floor(diffHour / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
};

const getActionMeta = (action) => {
  const act = (action || '').toUpperCase();
  switch (act) {
    case 'EDIT_META':
      return { 
        label: 'Metadata Edited', 
        icon: HiOutlinePencil, 
        color: '#10b981', 
        bg: 'rgba(16, 185, 129, 0.12)', 
        border: 'rgba(16, 185, 129, 0.3)' 
      };
    case 'UPDATE_STATUS':
      return { 
        label: 'Status Updated', 
        icon: HiOutlineCheck, 
        color: '#3b82f6', 
        bg: 'rgba(59, 130, 246, 0.12)', 
        border: 'rgba(59, 130, 246, 0.3)' 
      };
    case 'UPLOAD':
      return { 
        label: 'Intake Uploaded', 
        icon: HiOutlineCloudUpload, 
        color: '#a855f7', 
        bg: 'rgba(168, 85, 247, 0.12)', 
        border: 'rgba(168, 85, 247, 0.3)' 
      };
    case 'DELETE':
      return { 
        label: 'Document Archived', 
        icon: HiOutlineTrash, 
        color: '#ef4444', 
        bg: 'rgba(239, 68, 68, 0.12)', 
        border: 'rgba(239, 68, 68, 0.3)' 
      };
    case 'SEARCH':
      return { 
        label: 'Search Performed', 
        icon: HiOutlineSearch, 
        color: '#f59e0b', 
        bg: 'rgba(245, 158, 11, 0.12)', 
        border: 'rgba(245, 158, 11, 0.3)' 
      };
    case 'VIEW':
    case 'OPEN':
    default:
      return { 
        label: 'Document Viewed', 
        icon: HiOutlineEye, 
        color: '#0ea5e9', 
        bg: 'rgba(14, 165, 233, 0.12)', 
        border: 'rgba(14, 165, 233, 0.3)' 
      };
  }
};

const condenseActivities = (rawActivities) => {
  if (!rawActivities || !rawActivities.length) return [];
  const condensed = [];
  
  for (const act of rawActivities) {
    const prev = condensed[condensed.length - 1];
    // If consecutive actions on the same document are VIEW or OPEN within close proximity, collapse them
    if (
      prev && 
      prev.document_id === act.document_id && 
      ['VIEW', 'OPEN'].includes(prev.action) && 
      ['VIEW', 'OPEN'].includes(act.action)
    ) {
      prev.repeatCount = (prev.repeatCount || 1) + 1;
      continue;
    }
    condensed.push({ ...act, repeatCount: 1 });
  }
  return condensed;
};

const History = () => {
  const navigate = useNavigate();
  const [searches, setSearches] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickQuery, setQuickQuery] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditFilter, setAuditFilter] = useState('ALL');
  const [auditSearch, setAuditSearch] = useState('');

  const fetchHistory = async () => {
    try {
      const [searchRes, actRes] = await Promise.all([
        getSearchHistory(),
        getActivityHistory({ limit: 100 }).catch(() => ({ data: { data: { history: [] } } }))
      ]);
      setSearches(searchRes.data?.data?.history || []);
      setActivities(actRes.data?.data?.history || []);
    } catch (err) {
      console.error('Failed to load history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleClearSearches = async () => {
    if (window.confirm('Are you sure you want to clear your recent search history?')) {
      try {
        await clearSearchHistory();
        setSearches([]);
      } catch (err) {
        console.error('Failed to clear search history', err);
      }
    }
  };

  const handleRunSearch = async (queryTerm) => {
    if (!queryTerm || !queryTerm.trim()) return;
    const term = queryTerm.trim();
    try {
      await recordSearch({ query: term });
    } catch (e) {
      console.warn('Record search error', e);
    }
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  const handleQuickSubmit = (e) => {
    e.preventDefault();
    handleRunSearch(quickQuery);
  };

  if (loading) return <Loading />;

  const condensedList = condenseActivities(activities);
  // Top 6 distinct activities for clean 1-screen display
  const primaryActivities = condensedList.slice(0, 6);

  // Filtered activities for Audit Modal
  const filteredAuditActivities = activities.filter(act => {
    const matchesFilter = 
      auditFilter === 'ALL' ||
      (auditFilter === 'EDITS' && ['EDIT_META', 'UPDATE_STATUS'].includes(act.action)) ||
      (auditFilter === 'VIEWS' && ['VIEW', 'OPEN'].includes(act.action)) ||
      (auditFilter === 'UPLOADS' && act.action === 'UPLOAD') ||
      (auditFilter === 'SEARCHES' && act.action === 'SEARCH');

    const matchesSearch = !auditSearch || 
      (act.document_name && act.document_name.toLowerCase().includes(auditSearch.toLowerCase())) ||
      (act.company_name && act.company_name.toLowerCase().includes(auditSearch.toLowerCase())) ||
      (act.action && act.action.toLowerCase().includes(auditSearch.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const suggestions = ['Aurelio Foods', 'Invoice', 'Tender', 'Marvenix Retail'];

  return (
    <div className="page-container history-page-root">
      {/* Page Header */}
      <div className="history-header">
        <div>
          <div className="history-badge">
            <span className="dot-live"></span> AUDIT PLANE // SYSTEM JOURNAL & SEARCH MEMORY
          </div>
          <h2>Activity History</h2>
          <p className="text-muted">Executive overview of recent repository queries and document lifecycle interactions.</p>
        </div>
        <div className="history-header-actions">
          <button 
            type="button" 
            className="btn btn-secondary btn-sm"
            onClick={() => setIsAuditing(true)}
          >
            <HiOutlineFilter size={15} /> Audit Log Explorer
          </button>
        </div>
      </div>

      {/* 1-Screen Executive Dual-Column Container */}
      <div className="history-columns">
        {/* LEFT COLUMN: Recent Searches */}
        <div className="history-panel">
          <div className="history-panel-header">
            <div className="flex items-center gap-2">
              <HiOutlineSearch size={18} style={{ color: 'var(--accent)' }} />
              <h3>Recent Searches</h3>
              <span className="count-pill">{searches.length}</span>
            </div>
            {searches.length > 0 && (
              <button 
                type="button" 
                className="clear-link-btn" 
                onClick={handleClearSearches}
                title="Clear all recent searches"
              >
                <HiOutlineTrash size={14} /> Clear
              </button>
            )}
          </div>

          <div className="history-panel-body">
            {/* Quick Search Bar */}
            <form onSubmit={handleQuickSubmit} className="quick-search-form">
              <div className="quick-search-input-wrap">
                <HiOutlineSearch className="search-input-icon" size={16} />
                <input 
                  type="text" 
                  value={quickQuery} 
                  onChange={e => setQuickQuery(e.target.value)}
                  placeholder="Quick search documents or ID..."
                  className="quick-search-input"
                />
              </div>
              <button type="submit" className="btn btn-primary btn-sm" disabled={!quickQuery.trim()}>
                Search
              </button>
            </form>

            {/* Quick Keyword Suggestions */}
            <div className="quick-suggestions-row">
              <span className="suggestions-label">Try:</span>
              {suggestions.map((s, idx) => (
                <button 
                  key={idx} 
                  type="button" 
                  className="suggestion-chip"
                  onClick={() => handleRunSearch(s)}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Searches List */}
            {searches.length === 0 ? (
              <EmptyState 
                title="No recent searches" 
                description="Your search queries across the repository will appear here automatically." 
                icon={HiOutlineSearch} 
              />
            ) : (
              <div className="searches-scroll-list">
                {searches.slice(0, 7).map(item => (
                  <div 
                    key={item.id} 
                    className="search-row-card"
                    onClick={() => handleRunSearch(item.search_query)}
                    title={`Run search for "${item.search_query}"`}
                  >
                    <div className="search-row-left">
                      <div className="search-icon-bubble">
                        <HiOutlineSearch size={14} />
                      </div>
                      <div className="search-text-group">
                        <div className="search-term-title">
                          "{item.search_query}"
                        </div>
                        <div className="search-meta-text">
                          {item.result_count !== null && item.result_count !== undefined ? (
                            <span>{item.result_count} result{item.result_count === 1 ? '' : 's'} • </span>
                          ) : null}
                          <span>{formatRelativeTime(item.searched_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="search-action-arrow">
                      <HiOutlineArrowRight size={14} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Recent Activity (Compact, Executive) */}
        <div className="history-panel">
          <div className="history-panel-header">
            <div className="flex items-center gap-2">
              <HiOutlineClock size={18} style={{ color: '#3b82f6' }} />
              <h3>Recent Activity</h3>
              <span className="count-pill">{activities.length}</span>
            </div>
            <button 
              type="button" 
              className="view-more-btn" 
              onClick={() => setIsAuditing(true)}
            >
              View More ({activities.length}) →
            </button>
          </div>

          <div className="history-panel-body">
            {primaryActivities.length === 0 ? (
              <div className="p-8 text-center text-muted">
                <HiOutlineDocumentText size={40} className="mb-2 opacity-50 mx-auto" />
                <p>No recent document interactions recorded yet.</p>
              </div>
            ) : (
              <div className="activity-executive-feed">
                {primaryActivities.map((act, index) => {
                  const meta = getActionMeta(act.action);
                  const Icon = meta.icon;
                  return (
                    <div key={act.id || index} className="activity-card-row">
                      <div 
                        className="activity-badge-pill"
                        style={{ color: meta.color, backgroundColor: meta.bg, borderColor: meta.border }}
                      >
                        <Icon size={13} />
                        <span>{meta.label}</span>
                      </div>

                      <div className="activity-row-details">
                        <div className="activity-doc-title">
                          {act.document_id ? (
                            <Link 
                              to={`/documents/${act.document_id}`}
                              className="doc-link-hover"
                              title="Open document details"
                            >
                              {act.document_name || `Document #${act.document_id}`}
                            </Link>
                          ) : (
                            <span>{act.document_name || 'System Repository Action'}</span>
                          )}
                          {act.repeatCount > 1 && (
                            <span className="repeat-badge" title={`Repeated ${act.repeatCount} times`}>
                              ×{act.repeatCount}
                            </span>
                          )}
                        </div>

                        <div className="activity-subline">
                          {act.company_name && (
                            <span className="company-tag">{act.company_name}</span>
                          )}
                          <span className="time-tag" title={new Date(act.created_at).toLocaleString()}>
                            {formatRelativeTime(act.created_at)}
                          </span>
                        </div>
                      </div>

                      {act.document_id && (
                        <Link 
                          to={`/documents/${act.document_id}`}
                          className="doc-open-link"
                          title="View document"
                        >
                          <HiOutlineExternalLink size={15} />
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pinned Card Footer */}
            <div className="activity-panel-footer">
              <span className="text-xs text-muted">
                Consolidated audit timeline • {activities.length} total events
              </span>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={() => setIsAuditing(true)}
              >
                View Full Audit Trail →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FULL AUDIT TRAIL MODAL (On Demand View More) */}
      {isAuditing && (
        <div className="audit-modal-backdrop" onClick={() => setIsAuditing(false)}>
          <div className="audit-modal-container" onClick={e => e.stopPropagation()}>
            <div className="audit-modal-header">
              <div>
                <div className="mono text-xs text-muted mb-1">
                  SECURITY & COMPLIANCE // AUDIT LOG EXPLORER
                </div>
                <h3>Enterprise Activity & Audit Trail</h3>
              </div>
              <button 
                type="button" 
                className="btn" 
                style={{ padding: '6px', background: 'transparent', color: 'var(--text-muted)' }}
                onClick={() => setIsAuditing(false)}
              >
                <HiOutlineX size={22} />
              </button>
            </div>

            <div className="audit-modal-toolbar">
              <div className="audit-search-wrap">
                <HiOutlineSearch size={16} className="search-icon" />
                <input 
                  type="text" 
                  value={auditSearch} 
                  onChange={e => setAuditSearch(e.target.value)}
                  placeholder="Filter by document, company, or action..."
                  className="audit-filter-input"
                />
              </div>

              <div className="audit-chips-wrap">
                {['ALL', 'EDITS', 'VIEWS', 'UPLOADS', 'SEARCHES'].map(f => (
                  <button 
                    key={f}
                    type="button"
                    className={`audit-chip ${auditFilter === f ? 'active' : ''}`}
                    onClick={() => setAuditFilter(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="audit-modal-body">
              {filteredAuditActivities.length === 0 ? (
                <div className="p-8 text-center text-muted">
                  No activity events match your filter criteria.
                </div>
              ) : (
                <table className="audit-table">
                  <thead>
                    <tr>
                      <th>EVENT ID</th>
                      <th>ACTION</th>
                      <th>TARGET DOCUMENT</th>
                      <th>COMPANY</th>
                      <th>USER / ROLE</th>
                      <th>TIMESTAMP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAuditActivities.map(act => {
                      const meta = getActionMeta(act.action);
                      const Icon = meta.icon;
                      return (
                        <tr key={act.id}>
                          <td className="mono text-xs text-muted">#{act.id}</td>
                          <td>
                            <span 
                              className="audit-table-action"
                              style={{ color: meta.color, backgroundColor: meta.bg, borderColor: meta.border }}
                            >
                              <Icon size={13} />
                              {meta.label}
                            </span>
                          </td>
                          <td>
                            {act.document_id ? (
                              <Link 
                                to={`/documents/${act.document_id}`}
                                className="doc-link-table"
                                onClick={() => setIsAuditing(false)}
                              >
                                {act.document_name || `Doc #${act.document_id}`}
                              </Link>
                            ) : (
                              <span className="text-muted">{act.document_name || 'System Repository'}</span>
                            )}
                          </td>
                          <td>{act.company_name || '—'}</td>
                          <td>
                            <span className="user-role-badge">
                              {act.user_role || 'ADMIN'}
                            </span>
                          </td>
                          <td className="mono text-xs text-muted">
                            {new Date(act.created_at).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <div className="audit-modal-footer">
              <span className="text-xs text-muted">
                Showing {filteredAuditActivities.length} of {activities.length} total recorded audit actions
              </span>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={() => setIsAuditing(false)}
              >
                Close Explorer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
