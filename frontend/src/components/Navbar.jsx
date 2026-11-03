import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  HiOutlineBell, 
  HiOutlineQuestionMarkCircle, 
  HiOutlineExclamationCircle, 
  HiOutlineClock, 
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineArrowRight
} from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { getDocuments } from '../services/api';
import './Navbar.css';

const Navbar = ({ breadcrumbs = 'Platform / Repository / Control Plane' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overdue'); // 'overdue' or 'upcoming'
  const [overdueDocs, setOverdueDocs] = useState([]);
  const [upcomingDocs, setUpcomingDocs] = useState([]);
  const [showToast, setShowToast] = useState(true);
  const dropdownRef = useRef(null);

  const fetchAlerts = async () => {
    try {
      const res = await getDocuments({ limit: 50 });
      const docs = res.data?.data?.documents || [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const overdue = [];
      const upcoming = [];

      docs.forEach(d => {
        const dueDateStr = d.info_due_date || d.due_date;
        const docDateStr = d.info_document_date || d.document_date;
        const targetDate = dueDateStr ? new Date(dueDateStr) : (docDateStr ? new Date(docDateStr) : null);

        if (!targetDate || isNaN(targetDate.getTime()) || targetDate.getFullYear() === 0) {
          if (d.status === 'failed') overdue.push({ ...d, diffDays: -1 });
          return;
        }

        targetDate.setHours(0, 0, 0, 0);
        const diffTime = targetDate.getTime() - today.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0 || d.status === 'failed') {
          overdue.push({ ...d, diffDays, cutoffDate: targetDate });
        } else if (diffDays >= 0 && diffDays <= 14) {
          upcoming.push({ ...d, diffDays, cutoffDate: targetDate });
        }
      });

      setOverdueDocs(overdue);
      setUpcomingDocs(upcoming);
    } catch (err) {
      console.error('Failed to fetch notification alerts', err);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // Poll alerts every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalAlerts = overdueDocs.length + upcomingDocs.length;

  return (
    <>
      <header className="navbar">
        <div className="breadcrumb">{breadcrumbs}</div>
        
        <div className="navbar-right">
          <div className="engine-status">
            <div className="status-dot green"></div>
            Engine: v4.8 Online
          </div>

          <div className="notification-wrapper" ref={dropdownRef}>
            <button 
              type="button"
              className="icon-btn" 
              onClick={() => { setIsOpen(!isOpen); setShowToast(false); }}
              title="System Notifications & Expiration Alerts"
              style={{ position: 'relative' }}
            >
              <HiOutlineBell size={20} color={overdueDocs.length > 0 ? '#ef4444' : undefined} />
              {overdueDocs.length > 0 && (
                <span className="notification-badge">{overdueDocs.length}</span>
              )}
            </button>

            {/* Notification Dropdown */}
            {isOpen && (
              <div className="notification-dropdown">
                <div className="notification-header">
                  <h4>
                    <HiOutlineBell size={18} color="#ef4444" />
                    System Alerts & Expirations
                  </h4>
                  <button 
                    type="button" 
                    className="btn" 
                    style={{ padding: '2px', background: 'transparent', color: 'var(--text-muted)' }} 
                    onClick={() => setIsOpen(false)}
                  >
                    <HiOutlineX size={16} />
                  </button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)' }}>
                  <button 
                    type="button"
                    style={{ 
                      flex: 1, 
                      padding: '8px 12px', 
                      background: 'transparent', 
                      border: 'none', 
                      borderBottom: activeTab === 'overdue' ? '2px solid #ef4444' : 'none',
                      color: activeTab === 'overdue' ? '#ef4444' : 'var(--text-muted)',
                      fontWeight: activeTab === 'overdue' ? '600' : 'normal',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                    onClick={() => setActiveTab('overdue')}
                  >
                    Overdue ({overdueDocs.length})
                  </button>
                  <button 
                    type="button"
                    style={{ 
                      flex: 1, 
                      padding: '8px 12px', 
                      background: 'transparent', 
                      border: 'none', 
                      borderBottom: activeTab === 'upcoming' ? '2px solid #38bdf8' : 'none',
                      color: activeTab === 'upcoming' ? '#38bdf8' : 'var(--text-muted)',
                      fontWeight: activeTab === 'upcoming' ? '600' : 'normal',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                    onClick={() => setActiveTab('upcoming')}
                  >
                    Upcoming Deadlines ({upcomingDocs.length})
                  </button>
                </div>

                {/* Alerts List */}
                <div className="notification-list">
                  {activeTab === 'overdue' ? (
                    overdueDocs.length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                        No overdue documents. Everything is up to date!
                      </div>
                    ) : (
                      overdueDocs.map(doc => (
                        <div 
                          key={doc.id} 
                          className="notification-item urgent"
                          onClick={() => { navigate(`/documents/${doc.id}`); setIsOpen(false); }}
                        >
                          <div className="notification-icon-wrapper" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                            <HiOutlineExclamationCircle size={18} />
                          </div>
                          <div className="notification-item-content">
                            <div className="notification-item-title flex justify-between items-center">
                              <span>{doc.company_name || 'Organization'}</span>
                              <span className="mono text-xs" style={{ color: 'var(--text-muted)' }}>DOC-{doc.id.toString().padStart(4, '0')}</span>
                            </div>
                            <div className="notification-item-desc">
                              {doc.original_filename} is past its cutoff deadline!
                            </div>
                            <div className="notification-item-time">
                              {doc.diffDays < 0 ? `${Math.abs(doc.diffDays)} day${Math.abs(doc.diffDays) === 1 ? '' : 's'} overdue` : 'Critical / Overdue'} • Due: {doc.cutoffDate ? new Date(doc.cutoffDate).toLocaleDateString() : 'Expired'}
                            </div>
                          </div>
                        </div>
                      ))
                    )
                  ) : (
                    upcomingDocs.length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                        No immediate deadlines within the next 14 days.
                      </div>
                    ) : (
                      upcomingDocs.map(doc => (
                        <div 
                          key={doc.id} 
                          className="notification-item"
                          onClick={() => { navigate(`/documents/${doc.id}`); setIsOpen(false); }}
                        >
                          <div className="notification-icon-wrapper" style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' }}>
                            <HiOutlineClock size={18} />
                          </div>
                          <div className="notification-item-content">
                            <div className="notification-item-title flex justify-between items-center">
                              <span>{doc.company_name || 'Organization'}</span>
                              <span className="mono text-xs" style={{ color: 'var(--text-muted)' }}>DOC-{doc.id.toString().padStart(4, '0')}</span>
                            </div>
                            <div className="notification-item-desc">
                              Submission / review milestone approaching.
                            </div>
                            <div className="notification-item-time" style={{ color: '#38bdf8' }}>
                              Due in {doc.diffDays} day{doc.diffDays === 1 ? '' : 's'} • {doc.cutoffDate ? new Date(doc.cutoffDate).toLocaleDateString() : 'Upcoming'}
                            </div>
                          </div>
                        </div>
                      ))
                    )
                  )}
                </div>

                <div className="notification-footer">
                  <button 
                    type="button"
                    className="btn" 
                    style={{ background: 'transparent', color: 'var(--accent)', fontSize: '12px', padding: 0 }}
                    onClick={() => { navigate('/dates'); setIsOpen(false); }}
                  >
                    View All in Chronometry Ledger <HiOutlineArrowRight size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>

          <button className="icon-btn" title="Help & Documentation">
            <HiOutlineQuestionMarkCircle size={20} />
          </button>
          
          <Link 
            to="/profile"
            className="nav-avatar" 
            title={`View & Edit Profile (${user?.name || 'User'})`}
            style={{ textDecoration: 'none', cursor: 'pointer' }}
          >
            {user?.name?.charAt(0) || 'U'}
          </Link>
        </div>
      </header>

      {/* Login Alert Banner Toast */}
      {showToast && overdueDocs.length > 0 && (
        <div className="login-alert-banner" onClick={() => { setIsOpen(true); setShowToast(false); }}>
          <HiOutlineExclamationCircle size={22} />
          <div>
            <strong>Action Required:</strong> You have {overdueDocs.length} overdue document{overdueDocs.length === 1 ? '' : 's'} (including {overdueDocs[0].company_name || 'records'}).
          </div>
          <button 
            type="button" 
            onClick={(e) => { e.stopPropagation(); setShowToast(false); }}
            style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '2px', marginLeft: '8px' }}
          >
            <HiOutlineX size={16} />
          </button>
        </div>
      )}
    </>
  );
};

export default Navbar;
