import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineDocumentReport, HiOutlineClock, HiOutlineCalendar, HiOutlineExclamationCircle, HiOutlineDocument } from 'react-icons/hi';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import { getStats, getDocuments } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({ total_volume: 0, pending: 0, upcoming: 0, urgent: 0 });
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, docsRes] = await Promise.all([
          getStats().catch(() => ({ data: { data: { stats: { total: 0, pending: 0, done: 0, upcoming: 0 } } } })),
          getDocuments({ limit: 5 })
        ]);
        
        const statsData = statsRes.data?.data?.stats || {};
        setStats({
          total_volume: statsData.total || 0,
          pending: statsData.pending || 0,
          upcoming: statsData.upcoming || 0,
          urgent: statsData.overdue || 0
        });
        setDocuments(docsRes.data?.data?.documents || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <div>
          <h2>Dashboard</h2>
          <p className="text-muted">Overview of your company documents</p>
        </div>
        <Link to="/upload" className="btn btn-primary">+ Upload Document</Link>
      </div>

      <div className="stats-grid">
        <StatCard title="TOTAL VOLUME" value={stats.total_volume} subtitle="Documents Indexed" icon={HiOutlineDocumentReport} color="#3b82f6" />
        <StatCard title="ACTION QUEUE" value={stats.pending} subtitle="Pending Processing" icon={HiOutlineClock} color="#f59e0b" />
        <StatCard title="UPCOMING PIPELINE" value={stats.upcoming} subtitle="Due Next 14 Days" icon={HiOutlineCalendar} color="#10b981" />
        <StatCard title="URGENT ATTENTION" value={stats.urgent} subtitle="Overdue Documents" icon={HiOutlineExclamationCircle} color="#ef4444" />
      </div>

      <div className="recent-section">
        <div className="recent-header">
          <h3>Recent Documents</h3>
          <div className="recent-tabs">
            {['All', 'Pending', 'Upcoming', 'Done'].map(t => (
              <button 
                key={t} 
                className={`tab-btn ${filter === t ? 'active' : ''}`}
                onClick={() => setFilter(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {documents.length === 0 ? (
          <EmptyState title="No recent documents" description="Upload a document to get started." />
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Document Name / ID</th>
                  <th>Type</th>
                  <th>Company</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {documents.filter(doc => filter === 'All' ? true : doc.status.toLowerCase() === filter.toLowerCase()).map(doc => (
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
    </div>
  );
};

export default Dashboard;
