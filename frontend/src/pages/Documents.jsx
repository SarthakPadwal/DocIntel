import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDocuments } from '../services/api';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import StatusBadge from '../components/StatusBadge';
import { HiOutlineDocument } from 'react-icons/hi';
import './Documents.css';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});

  useEffect(() => {
    const fetchDocs = async () => {
      setLoading(true);
      try {
        const res = await getDocuments({ search, ...filters });
        setDocuments(res.data?.data?.documents || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    const delay = setTimeout(fetchDocs, 300);
    return () => clearTimeout(delay);
  }, [search, filters]);

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h2>Documents <span className="text-muted" style={{ fontSize: '16px', fontWeight: 'normal' }}>({documents.length})</span></h2>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <SearchBar value={search} onChange={setSearch} />
        <FilterPanel filters={filters} onFilterChange={setFilters} />
      </div>

      {loading ? <Loading /> : documents.length === 0 ? (
        <EmptyState title="No documents found" description="Try adjusting your search or filters." />
      ) : (
        <div className="table-responsive" style={{ backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Document Name</th>
                <th>Type</th>
                <th>Company</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {documents.map(doc => (
                <tr key={doc.id}>
                  <td>
                    <div className="doc-name-cell">
                      <HiOutlineDocument size={20} className="text-muted" />
                      <div>
                        <strong>{doc.original_filename}</strong>
                        <div className="mono text-xs text-muted">ID: {doc.id.toString().padStart(4, '0')}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="type-badge">{doc.document_type || 'Unknown'}</span></td>
                  <td>{doc.company_name || '-'}</td>
                  <td>{new Date(doc.uploaded_at).toLocaleDateString()}</td>
                  <td>{doc.amount ? `$${doc.amount}` : '-'}</td>
                  <td><StatusBadge status={doc.status} /></td>
                  <td>
                    <Link to={`/documents/${doc.id}`} className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '12px' }}>View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Documents;
