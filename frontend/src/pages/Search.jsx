import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import StatusBadge from '../components/StatusBadge';
import Loading from '../components/Loading';
import { getDocuments, getSearchHistory, clearSearchHistory, recordSearch } from '../services/api';
import { 
  HiOutlineDocumentText, 
  HiOutlineClock, 
  HiOutlineTrash, 
  HiOutlineSearch, 
  HiOutlineArrowRight,
  HiOutlineFilter,
  HiOutlineRefresh
} from 'react-icons/hi';
import './Search.css';

const formatDocDate = (doc) => {
  const raw = doc.uploaded_at || doc.created_at || doc.document_date || doc.info_document_date;
  if (!raw) return 'Recently';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return 'Recently';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatRelativeTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDays = Math.floor(diffHour / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState({});
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    try {
      const res = await getSearchHistory();
      const rawList = res.data?.data?.history || [];
      // Normalize items so they always have search_query
      const normalized = rawList.map((item, idx) => ({
        id: item.id || idx + 1,
        search_query: item.search_query || item.query || item.details || 'Document Search',
        searched_at: item.searched_at || item.timestamp || item.created_at || new Date().toISOString()
      }));
      setHistory(normalized);
    } catch (err) {
      console.warn('Failed to load search history:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleClearHistory = async () => {
    try {
      await clearSearchHistory();
      setHistory([]);
    } catch (err) {
      console.warn('Failed to clear search history:', err);
    }
  };

  useEffect(() => {
    const searchDocs = async () => {
      setLoading(true);
      try {
        const cleanQ = query.trim();
        const res = await getDocuments({ 
          search: cleanQ || undefined, 
          ...filters 
        });
        setResults(res.data?.data?.documents || []);
        
        // When user types a search of at least 2 chars, record it
        if (cleanQ.length >= 2) {
          try {
            await recordSearch({ query: cleanQ });
            fetchHistory();
          } catch (e) {}
        }
      } catch (err) {
        console.warn('Search request error:', err);
      } finally {
        setLoading(false);
      }
    };
    const delay = setTimeout(searchDocs, 250);
    return () => clearTimeout(delay);
  }, [query, filters]);

  const handleSelectHistoryItem = (term) => {
    if (!term) return;
    setQuery(term);
    setSearchParams({ q: term });
  };

  return (
    <div className="page-container search-layout">
      {/* LEFT COLUMN: Main Search & Results */}
      <div className="search-main">
        <div className="search-page-header">
          <div>
            <div className="search-breadcrumb-tag">
              <HiOutlineSearch size={14} /> REPOSITORY DISCOVERY & ATTRIBUTE QUERY
            </div>
            <h2>Search Documents</h2>
            <p className="text-muted">Find indexed documents by keyword, company name, ID, or filter by lifecycle attributes</p>
          </div>
        </div>

        {/* Search Input & Filter Ribbon Box */}
        <div className="search-box-container">
          <SearchBar 
            value={query} 
            onChange={(val) => { setQuery(val); setSearchParams(val ? { q: val } : {}); }} 
            placeholder="Filter ID, Company, or Document keyword..." 
          />
          <div className="search-filters-wrapper">
            <FilterPanel filters={filters} onFilterChange={setFilters} />
          </div>
        </div>

        {/* Results Section */}
        {loading ? (
          <Loading />
        ) : (
          <div className="search-results-section">
            <div className="results-status-bar">
              <span className="results-count-text">
                <strong>{results.length}</strong> document{results.length === 1 ? '' : 's'} found
              </span>
              {(query || Object.values(filters).some(Boolean)) && (
                <button 
                  type="button"
                  className="btn-clear-all-filters" 
                  onClick={() => { setQuery(''); setFilters({}); setSearchParams({}); }}
                >
                  <HiOutlineRefresh size={14} /> Clear Search & Filters
                </button>
              )}
            </div>

            <div className="results-grid">
              {results.map(doc => (
                <div key={doc.id} className="result-card">
                  <div className="result-card-top">
                    <div className="flex justify-between items-start mb-2">
                      <span className="type-badge">{doc.document_type || 'General'}</span>
                      <StatusBadge status={doc.status} size="small" />
                    </div>

                    <div className="doc-identity-group mb-3">
                      <div className="doc-icon-wrapper">
                        <HiOutlineDocumentText size={22} className="text-cyan" />
                      </div>
                      <div className="doc-info-text">
                        <div className="font-semibold doc-filename" title={doc.original_filename}>
                          {doc.original_filename}
                        </div>
                        <div className="text-xs text-muted mono">
                          ID: {String(doc.id || 1).padStart(4, '0')}
                        </div>
                      </div>
                    </div>

                    <div className="result-meta text-sm text-secondary">
                      <div className="meta-company">{doc.company_name || 'Enterprise Document'}</div>
                      <div className="meta-upload-date">Uploaded: {formatDocDate(doc)}</div>
                      {doc.amount && (
                        <div className="meta-amount">
                          {doc.currency === 'USD' ? '$' : '₹'}{Number(doc.amount).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="result-card-bottom">
                    <Link to={`/documents/${doc.id}`} className="btn btn-secondary w-full btn-view-doc">
                      View Details
                    </Link>
                  </div>
                </div>
              ))}

              {results.length === 0 && (
                <div className="empty-search-box">
                  <HiOutlineSearch size={36} className="text-muted mb-2" />
                  <h4>No documents match your query</h4>
                  <p className="text-muted text-sm">Try broadening your search terms or clearing status and type filters.</p>
                  {(query || Object.values(filters).some(Boolean)) && (
                    <button 
                      type="button" 
                      className="btn btn-secondary btn-sm mt-3"
                      onClick={() => { setQuery(''); setFilters({}); setSearchParams({}); }}
                    >
                      Reset All Filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Persistent Search History */}
      <div className="search-sidebar">
        <div className="sidebar-header-bar">
          <div className="flex items-center gap-2">
            <HiOutlineClock size={16} style={{ color: 'var(--accent)' }} />
            <h3 className="sidebar-title">MY HISTORY</h3>
            {history.length > 0 && <span className="history-count-tag">{history.length}</span>}
          </div>
          {history.length > 0 && (
            <button 
              type="button" 
              className="icon-btn-clear" 
              onClick={handleClearHistory} 
              title="Clear Search History"
            >
              <HiOutlineTrash size={15} />
            </button>
          )}
        </div>
        
        {history.length === 0 ? (
          <div className="history-empty-state">
            <HiOutlineSearch size={22} className="text-muted mb-1 opacity-50" />
            <span>No recent searches</span>
            <p className="text-xs text-muted">Searches you perform will be saved here automatically.</p>
          </div>
        ) : (
          <ul className="history-list">
            {history.slice(0, 10).map((item) => (
              <li 
                key={item.id} 
                className="history-item" 
                onClick={() => handleSelectHistoryItem(item.search_query)}
                title={`Click to search "${item.search_query}"`}
              >
                <div className="history-item-left">
                  <HiOutlineClock size={14} className="history-icon" />
                  <span className="history-term">{item.search_query}</span>
                </div>
                <div className="history-item-right">
                  {item.searched_at && (
                    <span className="history-time">{formatRelativeTime(item.searched_at)}</span>
                  )}
                  <HiOutlineArrowRight size={12} className="history-arrow" />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Search;
