import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import StatusBadge from '../components/StatusBadge';
import Loading from '../components/Loading';
import { getDocuments, getSearchHistory, clearSearchHistory, recordSearch } from '../services/api';
import { HiOutlineDocument, HiOutlineClock, HiOutlineTrash, HiOutlineSearch } from 'react-icons/hi';
import './Search.css';

const Search = () => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState({});
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await getSearchHistory();
      setHistory(res.data?.data?.history || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearSearchHistory();
      setHistory([]);
    } catch (err) {
      console.error(err);
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
        if (cleanQ.length >= 2) {
          fetchHistory();
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    const delay = setTimeout(searchDocs, 300);
    return () => clearTimeout(delay);
  }, [query, filters]);

  return (
    <div className="page-container search-layout">
      <div className="search-main">
        <div className="page-header mb-6">
          <h2>Search Documents</h2>
          <p className="text-muted">Find indexed documents by keyword, ID, company, or filter by lifecycle attributes</p>
        </div>

        <div className="search-box-container mb-6">
          <SearchBar value={query} onChange={setQuery} placeholder="Filter ID, Company, or Document keyword..." />
          <div className="mt-4">
            <FilterPanel filters={filters} onFilterChange={setFilters} />
          </div>
        </div>

        {loading ? <Loading /> : (
          <div>
            <div className="mb-4 text-muted text-sm flex justify-between items-center">
              <span>{results.length} document{results.length === 1 ? '' : 's'} found</span>
              {(query || Object.values(filters).some(Boolean)) && (
                <button 
                  className="btn" 
                  style={{ background: 'transparent', color: 'var(--accent)', fontSize: '12px', padding: 0 }}
                  onClick={() => { setQuery(''); setFilters({}); }}
                >
                  Clear Filters
                </button>
              )}
            </div>
            <div className="results-grid">
              {results.map(doc => (
                <div key={doc.id} className="result-card">
                  <div className="flex justify-between items-start mb-3">
                    <span className="type-badge">{doc.document_type || 'Unknown'}</span>
                    <StatusBadge status={doc.status} size="small" />
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <HiOutlineDocument size={24} className="text-muted" />
                    <div>
                      <div className="font-semibold">{doc.original_filename}</div>
                      <div className="text-xs text-muted mono">ID: {doc.id.toString().padStart(4, '0')}</div>
                    </div>
                  </div>
                  <div className="result-meta text-sm text-secondary mb-4">
                    <div>{doc.company_name || '-'}</div>
                    <div>Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}</div>
                    {doc.amount && (
                      <div style={{ color: 'var(--accent)', fontWeight: '600' }}>
                        {doc.currency === 'USD' ? '$' : '₹'}{Number(doc.amount).toLocaleString()}
                      </div>
                    )}
                  </div>
                  <Link to={`/documents/${doc.id}`} className="btn btn-secondary w-full" style={{ fontSize: '13px', padding: '6px' }}>View Details</Link>
                </div>
              ))}
              {results.length === 0 && (
                <div className="text-center p-8 text-muted w-full" style={{ gridColumn: '1 / -1' }}>No results match your search or filters.</div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="search-sidebar">
        <div className="flex justify-between items-center mb-4 pb-2 border-b">
          <h3 className="text-sm font-semibold text-muted uppercase">My History</h3>
          <button className="icon-btn text-muted" onClick={handleClearHistory} title="Clear History">
            <HiOutlineTrash size={16} />
          </button>
        </div>
        
        {history.length === 0 ? (
          <div className="text-xs text-muted text-center py-4">No recent searches</div>
        ) : (
          <ul className="history-list">
            {history.map(item => (
              <li key={item.id} className="history-item" onClick={() => setQuery(item.search_query)}>
                <HiOutlineClock size={14} className="text-muted" />
                <span className="truncate">{item.search_query}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Search;
